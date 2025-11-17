import os
import sys
from typing import Optional
from fastapi.testclient import TestClient

os.environ.setdefault("OPENROUTER_KEY", "dummy-test-key")

from app.main import app, _derive_site_id  

client = TestClient(app)


def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_empty_query_400():
    r = client.post("/chat", json={"query": "", "state": None, "site_id": None})
    assert r.status_code == 400


resolved_site_ids = []


def fake_chatbot_main(user_query: str, state: Optional[str], site_id: Optional[str]):
    resolved_site_ids.append(site_id)
    return f"Echo: {user_query} (site={site_id})", None


def test_site_id_from_body(monkeypatch):
    monkeypatch.setattr("app.main.chatbot_main", fake_chatbot_main)
    resolved_site_ids.clear()
    r = client.post("/chat", json={"query": "hello", "state": None, "site_id": "body123"})
    assert r.status_code == 200
    assert resolved_site_ids[-1] == "body123"


def test_site_id_from_query_param(monkeypatch):
    monkeypatch.setattr("app.main.chatbot_main", fake_chatbot_main)
    resolved_site_ids.clear()
    r = client.post("/chat?site_id=qparam456", json={"query": "hello", "state": None, "site_id": None})
    assert r.status_code == 200
    assert resolved_site_ids[-1] == "qparam456"


def test_site_id_from_header(monkeypatch):
    monkeypatch.setattr("app.main.chatbot_main", fake_chatbot_main)
    resolved_site_ids.clear()
    r = client.post(
        "/chat",
        headers={"x-site-id": "hdr789"},
        json={"query": "hello", "state": None, "site_id": None},
    )
    assert r.status_code == 200
    assert resolved_site_ids[-1] == "hdr789"


def test_site_id_from_referer(monkeypatch):
    monkeypatch.setattr("app.main.chatbot_main", fake_chatbot_main)
    resolved_site_ids.clear()
    # Simulate referer path: /devops/shanify/omar
    r = client.post(
        "/chat",
        headers={"Referer": "http://localhost/devops/shanify/omar"},
        json={"query": "hello", "state": None, "site_id": None},
    )
    assert r.status_code == 200
    assert resolved_site_ids[-1] == "omar"


def test_site_id_from_referer_alt(monkeypatch):
    monkeypatch.setattr("app.main.chatbot_main", fake_chatbot_main)
    resolved_site_ids.clear()
    # Alternate path variant just /shanify/<id>
    r = client.post(
        "/chat",
        headers={"Referer": "http://localhost/shanify/alpha"},
        json={"query": "hello", "state": None, "site_id": None},
    )
    assert r.status_code == 200
    assert resolved_site_ids[-1] == "alpha"


def test_site_id_precedence_body_over_others(monkeypatch):
    monkeypatch.setattr("app.main.chatbot_main", fake_chatbot_main)
    resolved_site_ids.clear()
    r = client.post(
        "/chat?site_id=ignored",
        headers={"x-site-id": "ignored2", "Referer": "http://localhost/shanify/ignored3"},
        json={"query": "hello", "state": None, "site_id": "final"},
    )
    assert r.status_code == 200
    assert resolved_site_ids[-1] == "final"


def test_derive_site_id_direct_calls():
    from fastapi import Request
    from starlette.datastructures import Headers, QueryParams

    class DummyRequest:
        def __init__(self, headers=None, query=None):
            self.headers = Headers(headers or {})
            self.query_params = QueryParams(query or {})

    assert _derive_site_id(DummyRequest(), "x") == "x"
   
    assert _derive_site_id(DummyRequest(query={"site": "qp"}), None) == "qp"
  
    assert _derive_site_id(DummyRequest(headers={"x-site-id": "hdr"}), None) == "hdr"
    
    assert _derive_site_id(DummyRequest(headers={"Referer": "http://x/devops/shanify/z"}), None) == "z"


if __name__ == "__main__":
    #exit with non-zero if tests fail
    import pytest
    code = pytest.main([__file__])
    sys.exit(code)
