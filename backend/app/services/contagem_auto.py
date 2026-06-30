"""Geração automática de ContagemPF a partir da planilha enviada pelo solicitante.

Usa OpenAI (mesma API key do ai_agent) para extrair a lista de funções de contagem
diretamente do texto da planilha e persiste uma ContagemPF vinculada à solicitação.

Regras por metodologia (planilha "Padrão de Entrada PF"):
- SFP:   1 PE por funcionalidade + 1 AL por entidade de dados interna. Tamanho fixo.
- NESMA: classificação 1-5 → tipo IFPUG; complexidade FIXA (transação=Média, dados=Baixa).
- APF:   classificação 1-5 → tipo IFPUG; complexidade derivada de DER e ALR/RET (padrão 20/1).
"""
import json
import uuid
from typing import Optional

from openai import OpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.contagem_pf import ContagemPF, FuncaoPF
from app.schemas import Methodology
from app.services import apf_config_service
from app.services import pf_calculator as calc

_client = OpenAI(api_key=settings.openai_api_key)

# Metodologia de entrada → metodologia persistida na ContagemPF (sfp | ifpug).
# APF e NESMA usam o mesmo motor IFPUG; a diferença está na complexidade.
_MET_MAP = {
    Methodology.sfp: "sfp",
    Methodology.apf: "ifpug",
    Methodology.nesma: "ifpug",
}

# Operação (coluna "é novo ou alterado") → mnemônico de deflator SISP.
_DEFLATOR_POR_OPERACAO = {
    "ADD": "Inc-4.1",   # 1,00 — inclusão/novo
    "CHG": "A80-4.2",   # 0,80 — alteração
    "DEL": "Exc-4.2",   # 0,30 — exclusão
}

_CLASSIFICACAO = (
    "Mapeamento do 'objetivo principal' (1 a 5) para o tipo de função IFPUG:\n"
    "1 = EE (Entrada Externa): processa dados que ENTRAM no sistema (inserção via usuário "
    "ou interface). Verbos típicos: incluir, agendar, provisionar, guardar, pagar, liberar, "
    "contratar, importar.\n"
    "2 = CE (Consulta Externa): apenas APRESENTA dados recuperados da base, sem cálculo ou "
    "derivação. Verbos: consultar, listar, exibir, visualizar.\n"
    "3 = SE (Saída Externa): apresenta dados e AINDA calcula, deriva um dado novo ou registra "
    "informação de controle. Verbos: gerar, calcular, disponibilizar, enviar, relatório.\n"
    "4 = ALI (Arquivo Lógico Interno): entidade de dados criada/alterada MANTIDA dentro do "
    "sistema avaliado.\n"
    "5 = AIE (Arquivo de Interface Externa): entidade de dados no domínio de OUTRA aplicação, "
    "apenas referenciada/lida pelas funcionalidades desta aplicação.\n"
)

_REGRA_GERACAO = (
    "Cada linha da planilha é uma 'Funcionalidade' OU uma 'Entidade de Dados' (ver a coluna "
    "'Funcionalidade ou Entidade de Dados?').\n"
    "- Se for Funcionalidade: gere uma função transacional (EE/CE/SE) conforme o objetivo "
    "principal (1/2/3).\n"
    "- Se for Entidade de Dados: gere uma função de dados — ALI quando interna (objetivo 4), "
    "AIE quando externa (objetivo 5).\n"
    "Operação (coluna 'é novo ou alterado'): 'Novo' → ADD; 'Alterado' → CHG; 'Excluído' → DEL.\n"
)

# SFP — prompt original (mantido verbatim para não descalibrar a contagem).
_SFP_SYSTEM_PROMPT = (
    "Você é especialista em medição de software por Pontos de Função (APF/IFPUG e SFP). "
    "Sua tarefa é extrair TODAS as funções de contagem de uma planilha 'Padrão de Entrada PF'.\n\n"
    "=== REGRAS PARA SFP ===\n"
    "Cada linha da planilha representa uma funcionalidade (use case). Para cada linha você deve gerar:\n"
    "1. Um PE (Processamento Elementar) com o nome da funcionalidade/serviço.\n"
    "2. Para cada entidade de dados MANTIDA NESTA APLICAÇÃO (interna), um AL (Arquivo Lógico) separado.\n"
    "   - Se a entidade é '(nova)' ou '(incluída)': operação = ADD\n"
    "   - Se a entidade é '(alterada)' ou '(modificada)': operação = ADD (nova contagem) ou CHG (melhoria)\n"
    "   - Se a entidade é EXTERNA ou serviço externo: NÃO contar como AL\n"
    "Operações: ADD = inclusão nova, CHG = alteração, DEL = exclusão, CFP = contagem por ponto.\n\n"
    "=== REGRAS PARA IFPUG ===\n"
    "Identifique: descrição, tipo (EE/SE/CE/ALI/AIE), complexidade (L/A/H), deflator SISP (ex: Inc-4.1).\n"
    "ALI = Arquivo Lógico Interno (mantido pela aplicação), AIE = Arquivo Interface Externa.\n\n"
    "Determine o tipo de projeto: 'desenvolvimento' (novo sistema) ou 'melhoria' (alterações em sistema existente).\n"
    "Se não encontrar funções, retorne lista vazia.\n"
    "Responda SEMPRE em português do Brasil."
)

# APF / NESMA — prompt com a classificação 1-5 das planilhas 01_ENTRADA_PF_(APF).
_APF_NESMA_SYSTEM_PROMPT = (
    "Você é especialista em medição de software por Pontos de Função (APF/IFPUG e NESMA). "
    "Sua tarefa é extrair TODAS as funções de contagem de uma planilha 'Padrão de Entrada PF'. "
    "Não invente funções; baseie-se apenas no conteúdo da planilha. "
    "Determine o tipo de projeto: 'desenvolvimento' (sistema novo) ou 'melhoria' (alterações em "
    "sistema existente). Se não houver funções, retorne lista vazia. "
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


def _schema_nesma() -> dict:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["tipo_projeto", "funcoes"],
        "properties": {
            "tipo_projeto": {"type": "string", "enum": ["desenvolvimento", "melhoria"]},
            "funcoes": {
                "type": "array",
                "description": "Funções NESMA extraídas (tipo via objetivo principal 1-5).",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["descricao", "tipo", "operacao"],
                    "properties": {
                        "descricao": {"type": "string"},
                        "tipo": {"type": "string", "enum": ["EE", "SE", "CE", "ALI", "AIE"]},
                        "operacao": {"type": "string", "enum": ["ADD", "CHG", "DEL"]},
                    },
                },
            },
        },
    }


def _schema_apf() -> dict:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["tipo_projeto", "funcoes"],
        "properties": {
            "tipo_projeto": {"type": "string", "enum": ["desenvolvimento", "melhoria"]},
            "funcoes": {
                "type": "array",
                "description": "Funções APF detalhadas (tipo via objetivo principal 1-5 + DER/ALR).",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["descricao", "tipo", "operacao", "der", "alr"],
                    "properties": {
                        "descricao": {"type": "string"},
                        "tipo": {"type": "string", "enum": ["EE", "SE", "CE", "ALI", "AIE"]},
                        "operacao": {"type": "string", "enum": ["ADD", "CHG", "DEL"]},
                        "der": {
                            "type": "integer",
                            "description": (
                                "Dados Elementares Referenciados (Quantidade de Campos). "
                                f"Use {calc.APF_DER_PADRAO} se a planilha não informar."
                            ),
                        },
                        "alr": {
                            "type": "integer",
                            "description": (
                                "Arquivos Lógicos Referenciados / Entidades acionadas (ALR/RET). "
                                f"Use {calc.APF_ALR_PADRAO} se a planilha não informar."
                            ),
                        },
                    },
                },
            },
        },
    }


def _build_user_prompt(metodologia: Methodology, document_text: str) -> str:
    doc = document_text[:40_000]
    if metodologia == Methodology.sfp:
        # Prompt original do SFP (verbatim) — não alterar para preservar a calibração.
        sfp_extra = (
            "\nLembre-se: para SFP gere um PE por funcionalidade E um AL por cada entidade de dados "
            "INTERNA (mantida nesta aplicação) mencionada nas colunas de entidades. "
            "Entidades externas (serviços externos, APIs de terceiros) NÃO geram AL."
        )
        return (
            "Metodologia: SFP.\n\n"
            "Extraia TODAS as funções de contagem de pontos de função do documento abaixo:\n\n"
            "--- CONTEÚDO DA PLANILHA ---\n"
            + doc
            + "\n--- FIM ---\n\n"
            + sfp_extra
        )

    base = (
        _CLASSIFICACAO + "\n" + _REGRA_GERACAO + "\n"
        "--- CONTEÚDO DA PLANILHA ---\n" + doc + "\n--- FIM ---\n"
    )
    if metodologia == Methodology.nesma:
        return "Metodologia: NESMA Estimada.\n\n" + base
    # APF detalhada
    return (
        "Metodologia: APF IFPUG (detalhada).\n\n" + base + "\n"
        "Para cada função informe também DER (Quantidade de Campos) e ALR (Quantidade de "
        f"Entidades acionadas/mantidas). Quando a planilha não trouxer o valor, use os padrões "
        f"DER={calc.APF_DER_PADRAO} e ALR={calc.APF_ALR_PADRAO}.\n"
    )


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
    if metodologia == Methodology.sfp:
        schema = _schema_sfp()
        system_prompt = _SFP_SYSTEM_PROMPT
    elif metodologia == Methodology.nesma:
        schema = _schema_nesma()
        system_prompt = _APF_NESMA_SYSTEM_PROMPT
    else:
        schema = _schema_apf()
        system_prompt = _APF_NESMA_SYSTEM_PROMPT

    completion = _client.chat.completions.create(
        model=settings.openai_model,
        temperature=0,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": _build_user_prompt(metodologia, document_text)},
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
    if metodologia == Methodology.sfp:
        funcoes_sfp = [
            calc.FuncaoSFP(descricao=f["descricao"], tipo=f["tipo"], operacao=f["operacao"])
            for f in funcoes_raw
        ]
        if tipo_projeto == "melhoria":
            r = calc.calcular_sfp_melhoria(funcoes_sfp, asfpb)
        else:
            r = calc.calcular_sfp_desenvolvimento(funcoes_sfp)
        total_bruto = total_local = r.total_pf
        detalhes = [
            {
                "descricao": d.descricao, "tipo": d.tipo, "operacao": d.operacao,
                "pf_bruto": d.pf_unitario, "pf_local": d.pf_unitario,
            }
            for d in r.detalhes
        ]
    else:
        # APF / NESMA — motor IFPUG, complexidade conforme a metodologia
        funcoes_ifpug: list[calc.FuncaoIFPUG] = []
        meta: list[dict] = []  # der/alr por função, na mesma ordem
        for f in funcoes_raw:
            tipo = f["tipo"]
            operacao = f.get("operacao", "ADD")
            if metodologia == Methodology.nesma:
                complexidade = calc.complexidade_nesma(tipo)
                der = alr = None
                deflator = "Inc-4.1"  # NESMA estimada: sem deflação
            else:
                der = int(f.get("der") or calc.APF_DER_PADRAO)
                alr = int(f.get("alr") or calc.APF_ALR_PADRAO)
                complexidade = calc.complexidade_ifpug(tipo, der, alr)
                deflator = _DEFLATOR_POR_OPERACAO.get(operacao, "Inc-4.1")
            funcoes_ifpug.append(calc.FuncaoIFPUG(
                descricao=f["descricao"], tipo=tipo,
                complexidade=complexidade, deflator_mnemonico=deflator,
            ))
            meta.append({"der": der, "alr": alr, "operacao": operacao})

        config = await apf_config_service.get_config_ativa(db)
        deflatores_map = apf_config_service.get_deflatores_map(config)
        r = calc.calcular_ifpug(funcoes_ifpug, deflatores=deflatores_map)
        total_bruto = r.total_pf_bruto
        total_local = r.total_pf_local
        detalhes = [
            {
                "descricao": d.descricao, "tipo": d.tipo, "complexidade": d.complexidade,
                "deflator_mnemonico": d.deflator_mnemonico, "operacao": meta[i]["operacao"],
                "der": meta[i]["der"], "alr": meta[i]["alr"],
                "pf_bruto": d.pf_bruto, "pf_local": d.pf_local,
            }
            for i, d in enumerate(r.detalhes)
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
        asfpb=asfpb if metodologia == Methodology.sfp else None,
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
            der=d.get("der"),
            alr=d.get("alr"),
            pf_bruto=d["pf_bruto"],
            pf_local=d["pf_local"],
        ))

    await db.flush()
    return contagem
