# Catalogue Service Tests

## Covered Cases
- Health root `/` returns service name and status.
- GET `/sites/{site}/catalogue` 404 when site not found (mocked Prisma).
- GET `/sites/{site}/catalogue` success with nested categories/products/variants.
- PUT `/sites/{site}/catalogue` unauthenticated returns 403.
- PUT `/sites/{site}/catalogue` forbidden (wrong user) returns 403.
- PUT `/sites/{site}/catalogue` success path returns message.

Prisma DB calls are mocked so tests run without a database.

## Running Locally
```bash
pytest -q
```

## Test Image
```bash
# Build
docker build -f Dockerfile.test -t catalogue-service-test .
# Run (exits non-zero on failure)
docker run --rm catalogue-service-test
```

## Integrated Build Tests
The main `Dockerfile` runs pytest during the build stage; failed tests abort the image build.

## Adding Tests
Add new files under `test/`. If endpoint uses Prisma, monkeypatch `app.Prisma` with a fake context similar to existing tests.
