import json

from openai import OpenAI

from app.config import settings
from app.schemas import (
    AnaliseResponse,
    FieldResult,
    Methodology,
    SHEET_BY_METHODOLOGY,
)

_client = OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = (
    "Você é um analista especialista em medição de software por Pontos de Função "
    "(IFPUG/APF, NESMA e SFP). Sua tarefa é ler o conteúdo de um documento enviado "
    "por um usuário e organizar as informações para preencher os campos exigidos pela "
    "planilha 'Padrão de Entrada PF', de acordo com a metodologia de contagem escolhida.\n\n"
    "Regras:\n"
    "- Para cada campo esperado, identifique se o documento contém a informação correspondente.\n"
    "- Se encontrar, extraia o valor de forma concisa e fiel ao documento (não invente dados).\n"
    "- Se a informação não estiver presente ou estiver incompleta, marque o campo como não "
    "preenchido e explique brevemente o que está faltando.\n"
    "- Não preencha campos por suposição. Na dúvida, considere como pendente.\n"
    "- Responda SEMPRE em português do Brasil."
)


def _build_schema(expected_fields: list[str]) -> dict:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["campos", "resumo"],
        "properties": {
            "resumo": {
                "type": "string",
                "description": "Resumo de 1 a 2 frases sobre o que foi encontrado e o que falta.",
            },
            "campos": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["campo", "preenchido", "valor", "observacao"],
                    "properties": {
                        "campo": {"type": "string", "enum": expected_fields},
                        "preenchido": {"type": "boolean"},
                        "valor": {
                            "type": ["string", "null"],
                            "description": "Valor extraído do documento, ou null se ausente.",
                        },
                        "observacao": {
                            "type": ["string", "null"],
                            "description": "Motivo da pendência ou nota relevante.",
                        },
                    },
                },
            },
        },
    }


def analyze_document(
    methodology: Methodology,
    filename: str,
    document_text: str,
    expected_fields: list[str],
) -> AnaliseResponse:
    sheet = SHEET_BY_METHODOLOGY[methodology]
    schema = _build_schema(expected_fields)

    user_prompt = (
        f"Metodologia de contagem escolhida: {sheet}.\n\n"
        f"Campos esperados (aba '{sheet}' da planilha modelo):\n"
        + "\n".join(f"- {f}" for f in expected_fields)
        + "\n\n--- CONTEÚDO DO DOCUMENTO ENVIADO ---\n"
        + document_text
        + "\n--- FIM DO DOCUMENTO ---\n\n"
        "Avalie cada campo esperado e retorne o resultado no formato estruturado solicitado. "
        "Inclua TODOS os campos esperados na resposta, marcando preenchido=false para os ausentes."
    )

    completion = _client.chat.completions.create(
        model=settings.openai_model,
        temperature=0,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "analise_entrada_pf",
                "strict": True,
                "schema": schema,
            },
        },
    )

    payload = json.loads(completion.choices[0].message.content)
    return _build_response(methodology, sheet, filename, expected_fields, payload)


def _build_response(
    methodology: Methodology,
    sheet: str,
    filename: str,
    expected_fields: list[str],
    payload: dict,
) -> AnaliseResponse:
    by_name: dict[str, dict] = {item["campo"]: item for item in payload.get("campos", [])}

    campos: list[FieldResult] = []
    pendentes: list[str] = []
    for field in expected_fields:
        item = by_name.get(field)
        if item is None:
            campos.append(
                FieldResult(
                    campo=field,
                    preenchido=False,
                    valor=None,
                    observacao="Campo não avaliado pela IA.",
                )
            )
            pendentes.append(field)
            continue

        valor = (item.get("valor") or "").strip() or None
        preenchido = bool(item.get("preenchido")) and valor is not None
        campos.append(
            FieldResult(
                campo=field,
                preenchido=preenchido,
                valor=valor if preenchido else None,
                observacao=item.get("observacao") or None,
            )
        )
        if not preenchido:
            pendentes.append(field)

    total = len(expected_fields)
    preenchidos = total - len(pendentes)
    return AnaliseResponse(
        metodologia=methodology,
        aba=sheet,
        arquivo=filename,
        total_campos=total,
        total_preenchidos=preenchidos,
        total_pendentes=len(pendentes),
        completo=len(pendentes) == 0,
        campos=campos,
        pendentes=pendentes,
        resumo=payload.get("resumo"),
    )
