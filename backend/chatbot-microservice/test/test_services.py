import importlib
import os


def load_main():
    # Ensure the OpenRouter env var is set so importing app.main doesn't raise
    os.environ.setdefault('OPENROUTER_KEY', 'test-key')
    # import the service module
    return importlib.import_module('app.main')


def test_do_check_order_status_existing():
    # Order feature removed; this test was deleted.


def test_do_check_order_status_missing():
    # Order feature removed; this test was deleted.


def test_do_refund_various_states():
    # Order/refund feature removed; this test was deleted.


def test_do_get_product_info_fallback_catalog():
    main = load_main()
    # Use local product catalog fallback
    main.PRODUCT_CATALOG.clear()
    main.PRODUCT_CATALOG['Mug'] = {'description': 'A nice mug', 'price': 9.99, 'stock': 5}
    main.PRODUCT_NAMES = list(main.PRODUCT_CATALOG.keys())

    resp = main.do_get_product_info('mug')
    assert 'Product' in resp and 'Mug' in resp
    assert '$9.99' in resp or '9.99' in resp


def test_chatbot_main_state_transitions(monkeypatch):
    main = load_main()

    # Greeting intent
    monkeypatch.setattr(main, 'classify_intent', lambda q: {'intent': 'GREETING', 'confidence': 1.0})
    resp, state = main.chatbot_main('hello', None, None)
    assert 'hello' in resp.lower() or 'hello' in resp
    assert state is None

    # CATALOG_SEARCH without product name -> should ask for product name and set awaiting state
    monkeypatch.setattr(main, 'classify_intent', lambda q: {'intent': 'CATALOG_SEARCH', 'confidence': 1.0})
    monkeypatch.setattr(main, 'extract_action', lambda intent, q: {'action_type': 'GET_PRODUCT_INFO', 'product_name': None})
    resp2, state2 = main.chatbot_main('do you have mugs', None, None)
    assert 'what' in resp2.lower() or 'what' in resp2 or state2 == 'AWAITING_PRODUCT_NAME'
    assert state2 == 'AWAITING_PRODUCT_NAME'

    # Now provide the product name in the awaiting state
    main.PRODUCT_CATALOG.clear()
    main.PRODUCT_CATALOG['Mug'] = {'description': 'A nice mug', 'price': 9.99, 'stock': 5}
    main.PRODUCT_NAMES = list(main.PRODUCT_CATALOG.keys())
    r3, s3 = main.chatbot_main('Mug', 'AWAITING_PRODUCT_NAME', None)
    assert 'product' in r3.lower() or 'mug' in r3.lower()
    assert s3 is None

