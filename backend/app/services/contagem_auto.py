"""Geração automática de ContagemPF a partir da planilha enviada pelo solicitante.

Usa OpenAI (mesma API key do ai_agent) para extrair a lista de funções de contagem
diretamente do texto da planilha e persiste uma ContagemPF vinculada à solicitação.
"""
import json
import uuid
from typing import Optional

from openai import OpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.contagem_pf import ContagemPF, FuncaoPF
from app.schemas import Methodology
from app.services import pf_calculator as calc

_client = OpenAI(api_key=settings.openai_api_key)

# sfp e apf/nesma mapeiam para as metodologias suportadas pela ContagemPF
_MET_MAP = {
    Methodology.sfp: "sfp",
    Methodology.apf: "ifpug",
    Methodology.nesma: "ifpug",
}

_SYSTEM_PROMPT = (
    "Você é especialista em medição de software por Pontos de Função (APF/IFPUG e SFP). "
    "Sua tarefa é extrair a lista de funções de contagem de uma planilha 'Padrão de Entrada PF'.\n\n"
    "Para SFP identifique: descrição da função, tipo CFB (AL = Arquivo Lógico / PE = Processamento Elementar) "
    "e operação (ADD = inclusão, CHG = alteração, DEL = exclusão, CFP = contagem por ponto de função).\n"
    "Para IFPUG identifique: descrição da função, tipo (EE/SE/CE/ALI/AIE), "
    "complexidade (L = baixa, A = média, H = alta) e deflator SISP (ex: Inc-4.1).\n\n"
    "Determine o tipo de projeto: 'desenvolvimento' (novo sistema) ou 'melhoria' (alterações em sistema existente).\n"
    "Se não encontrar funções claramente identificadas, retorne lista vazia.\n"
    "Responda SEMPRE em português do Brasil."
)


def _schema_sfp() -> dict:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["tipo_projeto", "asfpb", "funcoes"],
        "properties": {
            "tipo_projeto": {"type": "string", "enum": ["desenvolvimento", "melhoria"]},
            "asfpb": {
                "type": "number",
                "description": "Tamanho ASFP anterior em PF (0 se não for melhoria).",
            },
            "funcoes": {
                "type": "array",
                "description": "Funções SFP extraídas do documento.",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["descricao", "tipo", "operacao"],
                    "properties": {
                        "descricao": {"type": "string"},
                        "tipo": {"type": "string", "enum": ["AL", "PE"]},
                        "operacao": {"type": "string", "enum": ["ADD", "CHG", "DEL", "CFP"]},
                    },
                },
            },
        },
    }


def _schema_ifpug() -> dict:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["tipo_projeto", "funcoes"],
        "properties": {
            "tipo_projeto": {"type": "string", "enum": ["desenvolvimento", "melhoria"]},
            "funcoes": {
                "type": "array",
                "description": "Funções IFPUG extraídas do documento.",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["descricao", "tipo", "complexidade", "deflator_mnemonico"],
                    "properties": {
                        "descricao": {"type": "string"},
                        "tipo": {"type": "string", "enum": ["EE", "SE", "CE", "ALI", "AIE"]},
                        "complexidade": {"type": "string", "enum": ["L", "A", "H"]},
                        "deflator_mnemonico": {
                            "type": "string",
                            "description": "Código SISP, ex: Inc-4.1. Use Inc-4.1 se não houver indicação.",
                        },
                    },
                },
            },
        },
    }


async def gerar_contagem_auto(
    db: AsyncSession,
    solicitacao_id: uuid.UUID,
    metodologia: Methodology,
    titulo_base: str,
    document_text: str,
    usuario_id: uuid.UUID,
) -> Optional[ContagemPF]:
    """Extrai funções via IA e cria ContagemPF vinculada à solicitação.

    Retorna None silenciosamente se a extração não encontrar funções ou falhar.
    """
    contagem_met = _MET_MAP.get(metodologia, "sfp")
    schema = _schema_sfp() if contagem_met == "sfp" else _schema_ifpug()

    user_prompt = (
        f"Metodologia: {'SFP' if contagem_met == 'sfp' else 'IFPUG/APF'}.\n\n"
        "Extraia as funções de contagem de pontos de função do documento abaixo:\n\n"
        "--- CONTEÚDO DA PLANILHA ---\n"
        + document_text[:40_000]
        + "\n--- FIM ---\n\n"
        "Retorne apenas as funções claramente identificadas no documento. "
        "Se não houver funções identificáveis, retorne uma lista vazia."
    )

    completion = _client.chat.completions.create(
        model=settings.openai_model,
        temperature=0,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "extracao_funcoes_pf",
                "strict": True,
                "schema": schema,
            },
        },
    )

    payload = json.loads(completion.choices[0].message.content)
    funcoes_raw: list[dict] = payload.get("funcoes", [])

    if not funcoes_raw:
        return None

    tipo_projeto: str = payload.get("tipo_projeto", "desenvolvimento")
    asfpb: float = float(payload.get("asfpb", 0.0))

    # ── Cálculo ──────────────────────────────────────────────────────────────
    if contagem_met == "sfp":
        funcoes_sfp = [
            calc.FuncaoSFP(descricao=f["descricao"], tipo=f["tipo"], operacao=f["operacao"])
            for f in funcoes_raw
        ]
        if tipo_projeto == "melhoria":
            r = calc.calcular_sfp_melhoria(funcoes_sfp, asfpb)
        else:
            r = calc.calcular_sfp_desenvolvimento(funcoes_sfp)
        total_bruto = r.total_pf
        total_local = r.total_pf
        detalhes = [
            {
                "descricao": d.descricao,
                "tipo": d.tipo,
                "operacao": d.operacao,
                "pf_bruto": d.pf_unitario,
                "pf_local": d.pf_unitario,
            }
            for d in r.detalhes
        ]
    else:
        funcoes_ifpug = [
            calc.FuncaoIFPUG(
                descricao=f["descricao"],
                tipo=f["tipo"],
                complexidade=f["complexidade"],
                deflator_mnemonico=f.get("deflator_mnemonico", "Inc-4.1"),
            )
            for f in funcoes_raw
        ]
        r = calc.calcular_ifpug(funcoes_ifpug)
        total_bruto = r.total_pf_bruto
        total_local = r.total_pf_local
        detalhes = [
            {
                "descricao": d.descricao,
                "tipo": d.tipo,
                "complexidade": d.complexidade,
                "deflator_mnemonico": d.deflator_mnemonico,
                "pf_bruto": d.pf_bruto,
                "pf_local": d.pf_local,
            }
            for d in r.detalhes
        ]

    # ── Persistência ─────────────────────────────────────────────────────────
    contagem = ContagemPF(
        titulo=f"[Auto] {titulo_base}",
        metodologia=contagem_met,
        tipo_projeto=tipo_projeto,
        total_pf_bruto=total_bruto,
        total_pf_local=total_local,
        esforco_horas=r.esforco_horas,
        distribuicao_json=r.distribuicao,
        asfpb=asfpb if contagem_met == "sfp" else None,
        usuario_id=usuario_id,
        solicitacao_id=solicitacao_id,
    )
    db.add(contagem)
    await db.flush()

    for i, d in enumerate(detalhes):
        db.add(FuncaoPF(
            contagem_id=contagem.id,
            ordem=i,
            descricao=d["descricao"],
            tipo=d["tipo"],
            complexidade=d.get("complexidade"),
            deflator_mnemonico=d.get("deflator_mnemonico"),
            operacao=d.get("operacao"),
            pf_bruto=d["pf_bruto"],
            pf_local=d["pf_local"],
        ))

    await db.flush()
    return contagem
