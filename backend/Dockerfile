FROM python:3-alpine

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

WORKDIR /backend

COPY . .

# Install dependencies
RUN apk update && apk add --no-cache gcc libc-dev make git libffi-dev openssl-dev python3-dev libxml2-dev libxslt-dev
RUN apk add --no-cache gettext && \
  pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

ENTRYPOINT ["/backend/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]