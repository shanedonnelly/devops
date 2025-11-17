# Chatbot Microservice Tests

## What is covered
- Health endpoint responds 200 with status ok.
- Validation: empty `query` yields 400.
- Site ID derivation priority: body > query param > headers > referer.
- Referer path parsing for `/devops/shanify/<siteId>` and `/shanify/<siteId>` patterns.

## Running locally
```bash
pytest -q
```

## Running in a container
Build and run the test image; container exits non-zero if tests fail.
```bash
# PowerShell
docker build -f Dockerfile.test -t chatbot-microservice-test .
docker run --rm chatbot-microservice-test
```

Exit code 0 means success; any failure stops the container (imperial crash requirement).

## Adding tests
Place new files under `test/`. You can monkeypatch `app.main.chatbot_main` or other functions to avoid external API calls.
