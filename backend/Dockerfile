FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Dependências Python
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Código do backend
COPY backend/ .

# Templates de análise PF (necessários para o módulo de IA)
COPY Documentos_regras/ ./Documentos_regras/

EXPOSE 8080

# Aplica migrações alembic + cria tabela APF config (idempotente) + inicia servidor
CMD ["sh", "-c", "alembic upgrade head && python -m scripts.create_apf_config_table && uvicorn app.main:app --host 0.0.0.0 --port 8080"]
