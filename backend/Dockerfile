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

# Sinaliza ambiente Docker — config.py usa isso para não ler .env do disco
ENV RUNNING_IN_DOCKER=1

EXPOSE 8080

CMD ["sh", "-c", "echo 'DB host:' $(python -c \"import os; u=os.environ.get('DATABASE_URL','NAO_DEFINIDA'); print(u[:40] if len(u)>40 else u)\") && alembic upgrade head && python -m scripts.create_apf_config_table && uvicorn app.main:app --host 0.0.0.0 --port 8080"]
