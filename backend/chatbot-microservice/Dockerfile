FROM python:3.10-slim

WORKDIR /code

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy source and tests
COPY ./app /code/app
COPY ./front /code/app/front
COPY ./test /code/test

# Run tests during build; fail build if tests fail.
# Uses dummy OPENROUTER_KEY set inside tests before importing app.main.
RUN pytest -q --disable-warnings || (echo 'Unit tests failed. Aborting image build.' && exit 1)

# Remove test artifacts from final image (optional)
RUN rm -rf /code/test

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]