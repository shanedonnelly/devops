FROM python:3.12-slim AS build

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run unit tests (fast, DB mocked). Fail build if tests fail.
RUN pytest -q --disable-warnings || (echo 'Unit tests failed. Aborting image build.' && exit 1)

# Generate Prisma client after tests (if needed for runtime DB access)
RUN prisma generate || echo 'Prisma generate failed (ensure node/prisma installed in runtime if required).'

FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
COPY --from=build /usr/local/lib/python*/site-packages /usr/local/lib/python*/site-packages
COPY --from=build /app /app
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]