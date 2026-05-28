# Agente de Entrada PF (backend)

Serviço FastAPI que recebe o documento anexado na etapa **Padrão de Entrada PF**,
extrai o conteúdo (xlsx, csv, pdf, docx), e usa um agente de IA (OpenAI) para mapear
as informações contra os campos exigidos pela aba correspondente da planilha
`Padrão de Entrada PF.xlsx` (APF IFPUG / NESMA Estimada / SFP). Retorna os campos
preenchidos e os que ficaram pendentes por falta de informação.

## Setup

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # e preencha OPENAI_API_KEY
```

> O arquivo `.env` está no `.gitignore` e **nunca** deve ser commitado.

## Executar

```bash
uvicorn app.main:app --reload --port 8000
```

O Vite (`vite.config.ts`) faz proxy de `/api` para `http://localhost:8000`.

## Endpoint

`POST /api/entrada-pf/analisar` (multipart/form-data)

- `metodologia`: `apf` | `nesma` | `sfp`
- `arquivo`: documento (.xlsx, .csv, .pdf, .docx)

Resposta: lista de campos com `preenchido`/`valor`/`observacao` e lista de `pendentes`.
