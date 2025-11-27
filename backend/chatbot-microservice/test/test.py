import os
import sys
import importlib
import unittest
from types import SimpleNamespace
from unittest.mock import patch


# Ensure module import does not fail due to missing env
os.environ.setdefault('OPENROUTER_KEY', 'test-key')

# Make sure the project root (one level up) is on sys.path so `import app` works
ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)


def _load_main():
    """Import the chatbot service module fresh."""
    # importlib ensures we get the current module state
    # Only inject shims for optional runtime dependencies if they are NOT importable
    try:
        import openai  # noqa: F401
    except Exception:
        class _FakeOpenAI:
            def __init__(self, *a, **kw):
                pass

        sys.modules['openai'] = SimpleNamespace(OpenAI=_FakeOpenAI)

    try:
        import fastapi  # noqa: F401
    except Exception:
        # Minimal fastapi shim including middleware/cors used at import time
        sys.modules['fastapi'] = SimpleNamespace(FastAPI=lambda *a, **k: SimpleNamespace(), HTTPException=Exception, Request=object)
        sys.modules['fastapi.middleware'] = SimpleNamespace()
        sys.modules['fastapi.middleware.cors'] = SimpleNamespace(CORSMiddleware=lambda *a, **k: None)

    try:
        import fuzzywuzzy  # noqa: F401
    except Exception:
        # Provide minimal fuzzywuzzy extract/ratio behavior to prevent import errors
        sys.modules['fuzzywuzzy'] = SimpleNamespace(process=SimpleNamespace(extract=lambda *a, **k: []), fuzz=SimpleNamespace(ratio=lambda a, b: 0))

    return importlib.import_module('app.main')


class FakeRequest:
    def __init__(self, query_params=None, headers=None):
        self.query_params = query_params or {}
        self.headers = headers or {}


class ChatbotServiceTests(unittest.TestCase):
    def test_classify_intent_uses_llm(self):
        main = _load_main()

        with patch.object(main, 'get_json_response', return_value={'intent': 'CATALOG_SEARCH', 'confidence': 0.9}):
            res = main.classify_intent('Do you sell mugs?')
            self.assertEqual(res.get('intent'), 'CATALOG_SEARCH')
            self.assertGreaterEqual(res.get('confidence', 0), 0.0)

    def test_extract_action_get_product(self):
        main = _load_main()

        with patch.object(main, 'get_json_response', return_value={'action_type': 'GET_PRODUCT_INFO', 'product_name': 'Mug'}):
            act = main.extract_action('CATALOG_SEARCH', 'Tell me about the Mug')
            self.assertEqual(act.get('action_type'), 'GET_PRODUCT_INFO')
            self.assertEqual(act.get('product_name'), 'Mug')

    def test_do_get_product_info_local_fallback(self):
        main = _load_main()
        main.PRODUCT_CATALOG.clear()
        main.PRODUCT_CATALOG['Mug'] = {'description': 'A comfy mug', 'price': 9.99, 'stock': 5}
        main.PRODUCT_NAMES = list(main.PRODUCT_CATALOG.keys())

        out = main.do_get_product_info('mug')
        self.assertIn('Mug', out)
        self.assertTrue('9.99' in out or '$9.99' in out)

    def test_do_get_product_info_site_catalog(self):
        main = _load_main()

        fake_index = {
            'products': [
                {'name': 'AstroWatch', 'description': 'A watch', 'price': 199.0, 'variants': [{'stock': 3}], 'category': 'Watches'},
            ],
            'names': ['AstroWatch']
        }

        with patch.object(main, 'ensure_site_index', return_value=fake_index):
            out = main.do_get_product_info('AstroWatch', site_id='site-x')
            self.assertIn('AstroWatch', out)
            self.assertIn('Price', out) or self.assertIn('199', out)

    def test_ensure_site_index_caches(self):
        main = _load_main()

        sample_cat = {'categories': [{'name': 'C', 'products': [{'name': 'P', 'description': 'd', 'price': 1.0, 'variants': []}]}]}

        call_count = {'n': 0}

        def fake_fetch(site):
            call_count['n'] += 1
            return sample_cat

        with patch.object(main, 'fetch_catalogue', side_effect=fake_fetch):
            idx1 = main.ensure_site_index('mysite')
            idx2 = main.ensure_site_index('mysite')
            self.assertIsNotNone(idx1)
            self.assertIs(idx1, idx2)
            # fetch_catalogue should be called only once because of caching
            self.assertEqual(call_count['n'], 1)

    def test_derive_site_id_variants(self):
        main = _load_main()

        # Query param
        req = FakeRequest(query_params={'site_id': 'qsite'}, headers={})
        self.assertEqual(main._derive_site_id(req, None), 'qsite')

        # Header
        req = FakeRequest(query_params={}, headers={'x-site-id': 'hsite'})
        self.assertEqual(main._derive_site_id(req, None), 'hsite')

        # Referer path
        req = FakeRequest(query_params={}, headers={'referer': 'https://example.com/shanify/my-site/page'})
        self.assertEqual(main._derive_site_id(req, None), 'my-site')

    def test_chatbot_main_state_and_flow(self):
        main = _load_main()

        # Greeting
        with patch.object(main, 'classify_intent', return_value={'intent': 'GREETING', 'confidence': 1.0}):
            r, s = main.chatbot_main('hello', None, None)
            self.assertIn('hello', r.lower())
            self.assertIsNone(s)

        # Catalog search without product -> asks for product name
        with patch.object(main, 'classify_intent', return_value={'intent': 'CATALOG_SEARCH', 'confidence': 1.0}), \
             patch.object(main, 'extract_action', return_value={'action_type': 'GET_PRODUCT_INFO', 'product_name': None}):
            r2, s2 = main.chatbot_main('do you have mugs', None, None)
            self.assertEqual(s2, 'AWAITING_PRODUCT_NAME')

        # Provide product name while in awaiting state
        main.PRODUCT_CATALOG.clear()
        main.PRODUCT_CATALOG['Mug'] = {'description': 'Nice mug', 'price': 5.5, 'stock': 2}
        main.PRODUCT_NAMES = list(main.PRODUCT_CATALOG.keys())
        r3, s3 = main.chatbot_main('Mug', 'AWAITING_PRODUCT_NAME', None)
        self.assertIn('mug', r3.lower())
        self.assertIsNone(s3)

    def test_multiple_matches_keep_state(self):
        main = _load_main()

        fake_index = {
            'products': [
                {'name': 'Mug A', 'description': 'A', 'price': 1.0, 'variants': [], 'category': 'C'},
                {'name': 'Mug B', 'description': 'B', 'price': 2.0, 'variants': [], 'category': 'C'},
            ],
            'names': ['Mug A', 'Mug B']
        }

        with patch.object(main, 'ensure_site_index', return_value=fake_index):
            out = main.do_get_product_info('mug', site_id='site-x')
            self.assertIn('items matching', out)

            # Simulate chatbot_main handling action where product lookup returned multiple
            with patch.object(main, 'extract_action', return_value={'action_type': 'GET_PRODUCT_INFO', 'product_name': 'mug'}), \
                 patch.object(main, 'classify_intent', return_value={'intent': 'CATALOG_SEARCH', 'confidence': 1.0}):
                r, state = main.chatbot_main('mug', None, 'site-x')
                # Because multiple items were found, the bot should ask again for product and remain in the same state
                self.assertEqual(state, 'AWAITING_PRODUCT_NAME')


if __name__ == '__main__':
    unittest.main(verbosity=2)