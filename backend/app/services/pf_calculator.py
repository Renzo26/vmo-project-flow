"""Motor de cálculo de Pontos de Função — SFP 2.2 e IFPUG/APF.

Tabelas de referência: SISP 2.3 (regras_planilhas.md).
"""
from __future__ import annotations

from dataclasses import dataclass


# ─── Tabelas de referência ───────────────────────────────────────────────────

TABELA_IFPUG: dict[str, dict[str, float]] = {
    "EE":  {"L": 3.0, "A": 4.0, "H": 6.0},
    "SE":  {"L": 4.0, "A": 5.0, "H": 7.0},
    "CE":  {"L": 3.0, "A": 4.0, "H": 6.0},
    "ALI": {"L": 7.0, "A": 10.0, "H": 15.0},
    "AIE": {"L": 5.0, "A": 7.0,  "H": 10.0},
}

TABELA_SFP: dict[str, float] = {
    "AL": 7.0,
    "PE": 4.6,
}

# Deflatores SISP 2.3 — Tipo Func
DEFLATORES_FUNC: dict[str, float] = {
    # 4.1 — Novo
    "Inc-4.1":    1.00,
    # 4.2 — Melhoria alterada
    "A50-4.2":    0.50,
    "A65-4.2":    0.65,
    "A75-4.2":    0.75,
    "A80-4.2":    0.80,
    "A90-4.2":    0.90,
    "Exc-4.2":    0.30,
    "Exc25-4.2":  0.25,
    # 4.3 — Migração de dados
    "MD-4.3":     1.00,
    # 4.4 — Manutenção corretiva
    "MC-4.4":     0.00,
    "MC50-4.4":   0.50,
    "MC65-4.4":   0.65,
    "MC75-4.4":   0.75,
    "MC90-4.4":   0.90,
    # 4.5 — Mudança de plataforma
    "MD1-4.5.1":  1.00,
    "MD2-4.5.2":  1.00,
    "MD3-4.5.2":  0.30,
    # 4.6 — Atualização de versão
    "AV1-4.6.1":  0.30,
    "AV2-4.6.2":  0.30,
    # 4.8 — Adaptação
    "Ad40-4.8":   0.40,
    "Ad50-4.8":   0.50,
    "Ad65-4.8":   0.65,
    "Ad75-4.8":   0.75,
    "Ad90-4.8":   0.90,
    # 4.9 — Apuração especial
    "AE1-4.9.1":  1.00,
    "AE2-4.9.1":  1.00,
    "AE3-4.9.1":  0.60,
    "AE4-4.9.2":  1.00,
    "AE5-4.9.3":  0.10,
    # 4.10 a 4.16
    "AD-4.10":    0.10,
    "MDSL-4.12":  0.25,
    "VE-4.13":    0.15,
    "VET-4.13":   0.20,
    "PFT-4.14":   0.15,
    "CIR-4.15":   1.00,
    "CMM-4.16":   1.00,
    # Sem alteração
    "SA":         0.00,
}

# Deflatores de fase SISP 2.3
DEFLATORES_FASE: dict[str, float] = {
    "FREQ":  0.25,
    "FDES":  0.35,
    "FIMP":  0.75,
    "FTEST": 0.90,
    "FHOM":  0.95,
    "FIMPL": 1.00,
}

# INMs — fórmula = 0.6 × quantidade
DEFLATORES_INM: dict[str, str] = {
    "MI-4.7":       "0,6 × Qtd. Funções Transacionais Impactadas",
    "DMP-4.11":     "0,6 × Qtd. Páginas Alteradas/Incluídas",
    "Comp.Arq-4.15": "0,6 × Qtd. Arquivos Alterados",
}

HORAS_POR_PF: float = 6.0


# ─── Structs de entrada ──────────────────────────────────────────────────────

@dataclass
class FuncaoIFPUG:
    descricao: str
    tipo: str          # EE | SE | CE | ALI | AIE
    complexidade: str  # L | A | H
    deflator_mnemonico: str = "Inc-4.1"


@dataclass
class FuncaoSFP:
    descricao: str
    tipo: str      # AL | PE
    operacao: str  # ADD | CHG | DEL | CFP


# ─── Structs de resultado ────────────────────────────────────────────────────

@dataclass
class DetalheIFPUG:
    descricao: str
    tipo: str
    complexidade: str
    pf_bruto: float
    deflator_mnemonico: str
    deflator_valor: float
    pf_local: float


@dataclass
class ResultadoIFPUG:
    total_pf_bruto: float
    total_pf_local: float
    esforco_horas: float
    distribuicao: dict[str, float]
    detalhes: list[DetalheIFPUG]


@dataclass
class DetalheSFP:
    descricao: str
    tipo: str
    operacao: str
    pf_unitario: float
    impacto: float


@dataclass
class ResultadoSFP:
    """Desenvolvimento: DSFP e ASFP."""
    dsfp: float
    asfp: float
    total_pf: float
    esforco_horas: float
    distribuicao: dict[str, float]
    detalhes: list[DetalheSFP]


@dataclass
class ResultadoSFPMelhoria:
    """Melhoria: ESFP e ASFPA."""
    esfp: float
    asfpa: float
    total_pf: float
    esforco_horas: float
    distribuicao: dict[str, float]
    detalhes: list[DetalheSFP]


# ─── Funções de cálculo ──────────────────────────────────────────────────────

def calcular_ifpug(
    funcoes: list[FuncaoIFPUG],
    deflatores: dict[str, float] | None = None,
) -> ResultadoIFPUG:
    """PF bruto, PF local (deflacionado) e esforço — método IFPUG/APF.

    `deflatores` permite sobrepor a tabela padrão SISP pelos fatores configurados
    no módulo Configurar APF. Quando None, usa DEFLATORES_FUNC.
    """
    tabela_deflatores = deflatores if deflatores is not None else DEFLATORES_FUNC
    detalhes: list[DetalheIFPUG] = []
    for f in funcoes:
        pf_bruto = TABELA_IFPUG[f.tipo][f.complexidade]
        deflator_val = tabela_deflatores.get(f.deflator_mnemonico, 1.0)
        pf_local = round(pf_bruto * deflator_val, 2)
        detalhes.append(DetalheIFPUG(
            descricao=f.descricao,
            tipo=f.tipo,
            complexidade=f.complexidade,
            pf_bruto=pf_bruto,
            deflator_mnemonico=f.deflator_mnemonico,
            deflator_valor=deflator_val,
            pf_local=pf_local,
        ))

    total_bruto = round(sum(d.pf_bruto for d in detalhes), 2)
    total_local = round(sum(d.pf_local for d in detalhes), 2)
    esforco = round(total_local * HORAS_POR_PF, 2)

    return ResultadoIFPUG(
        total_pf_bruto=total_bruto,
        total_pf_local=total_local,
        esforco_horas=esforco,
        distribuicao=_distribuicao(esforco),
        detalhes=detalhes,
    )


def calcular_sfp_desenvolvimento(funcoes: list[FuncaoSFP]) -> ResultadoSFP:
    """SFP 2.2 — projeto de Desenvolvimento. Retorna DSFP e ASFP."""
    detalhes: list[DetalheSFP] = []
    dsfp = asfp = 0.0

    for f in funcoes:
        pf_unit = TABELA_SFP[f.tipo]
        if f.operacao == "ADD":
            impacto = pf_unit
            dsfp += pf_unit
            asfp += pf_unit
        elif f.operacao == "CFP":
            impacto = 0.0
        else:
            impacto = 0.0
        detalhes.append(DetalheSFP(
            descricao=f.descricao, tipo=f.tipo,
            operacao=f.operacao, pf_unitario=pf_unit, impacto=impacto,
        ))

    dsfp = round(dsfp, 2)
    asfp = round(asfp, 2)
    esforco = round(dsfp * HORAS_POR_PF, 2)
    return ResultadoSFP(
        dsfp=dsfp, asfp=asfp, total_pf=dsfp,
        esforco_horas=esforco, distribuicao=_distribuicao(esforco), detalhes=detalhes,
    )


def calcular_sfp_melhoria(funcoes: list[FuncaoSFP], asfpb: float = 0.0) -> ResultadoSFPMelhoria:
    """SFP 2.2 — projeto de Melhoria. Retorna ESFP e ASFPA."""
    detalhes: list[DetalheSFP] = []
    add_total = del_total = esfp = 0.0

    for f in funcoes:
        pf_unit = TABELA_SFP[f.tipo]
        if f.operacao == "ADD":
            impacto = pf_unit
            add_total += pf_unit
            esfp += pf_unit
        elif f.operacao == "CHG":
            impacto = 0.0
            esfp += pf_unit
        elif f.operacao == "DEL":
            impacto = -pf_unit
            del_total += pf_unit
            esfp += pf_unit
        else:
            impacto = 0.0
        detalhes.append(DetalheSFP(
            descricao=f.descricao, tipo=f.tipo,
            operacao=f.operacao, pf_unitario=pf_unit, impacto=impacto,
        ))

    esfp = round(esfp, 2)
    asfpa = round(asfpb + add_total - del_total, 2)
    esforco = round(esfp * HORAS_POR_PF, 2)
    return ResultadoSFPMelhoria(
        esfp=esfp, asfpa=asfpa, total_pf=esfp,
        esforco_horas=esforco, distribuicao=_distribuicao(esforco), detalhes=detalhes,
    )


def calcular_inm(quantidade: int) -> float:
    """PF para Itens Não Mensuráveis: 0,6 × quantidade."""
    return round(0.6 * quantidade, 2)


def lookup_deflator(mnemonico: str) -> float | None:
    return DEFLATORES_FUNC.get(mnemonico)


def listar_deflatores() -> dict:
    return {
        "func": DEFLATORES_FUNC,
        "inm": DEFLATORES_INM,
        "fase": DEFLATORES_FASE,
        "tabela_ifpug": TABELA_IFPUG,
        "tabela_sfp": TABELA_SFP,
        "horas_por_pf": HORAS_POR_PF,
    }


def _distribuicao(esforco: float) -> dict[str, float]:
    return {
        "requisitos":       round(esforco * 0.20, 2),
        "projeto":          round(esforco * 0.30, 2),
        "implementacao":    round(esforco * 0.40, 2),
        "disponibilizacao": round(esforco * 0.10, 2),
    }
