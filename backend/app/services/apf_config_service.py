"""Serviço central da Configuração APF.

Ponto único que lê a ConfiguracaoAPF ativa e a traduz para os demais motores:
- deflatores configuráveis (motor auto + Nova Contagem)
- classificação por faixas de desvio (motor De-Para)
- parâmetros econômicos (valor_pf, valor_max_ce, tolerancia)
"""
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.configuracao_apf import ConfiguracaoAPF
from app.services import pf_calculator as calc

# contagem.metodologia ("sfp"/"ifpug") -> chave usada em faixas_json
_MET_FAIXA_KEY = {
    "sfp": "SFP",
    "ifpug": "IFPUG",
    "nesma": "NESMA",
}


@dataclass
class FaixaResultado:
    status: str               # ok | atencao | divergente
    acao: str | None          # Aprovado | Negociar | Revisar | Recusado
    alcada: str | None        # cargo da alçada requerida


async def get_config_ativa(db: AsyncSession) -> ConfiguracaoAPF | None:
    return await db.scalar(
        select(ConfiguracaoAPF)
        .where(ConfiguracaoAPF.ativa == True)  # noqa: E712
        .order_by(ConfiguracaoAPF.created_at.desc())
    )


def get_deflatores_map(config: ConfiguracaoAPF | None) -> dict[str, float]:
    """Mapa {mnemonico: fator} a partir da config, sobreposto às tabelas padrão.

    Se a config não usa deflatores ou não existe, devolve as tabelas SISP padrão.
    """
    base = dict(calc.DEFLATORES_FUNC)
    if config is None or not config.usar_deflatores:
        return base
    for d in (config.deflatores_json or []):
        mne = d.get("mne")
        if not mne or not d.get("ativo", True):
            continue
        try:
            base[mne] = float(d.get("valor"))
        except (TypeError, ValueError):
            continue
    return base


def valor_pf(config: ConfiguracaoAPF | None) -> float:
    return float(config.valor_pf) if config else 820.0


def tolerancia(config: ConfiguracaoAPF | None) -> float:
    return float(config.tolerancia) if config else 10.0


def valor_max_ce(config: ConfiguracaoAPF | None) -> float:
    return float(config.valor_max_ce) if config else 50_000.0


def _cargo_por_alcada(config: ConfiguracaoAPF, alcada_id: str | None) -> str | None:
    if not alcada_id:
        return None
    for a in (config.alcadas_json or []):
        if a.get("id") == alcada_id:
            return a.get("cargo")
    return None


def classificar_por_faixa(
    config: ConfiguracaoAPF | None,
    metodologia: str,
    variacao_pct: float | None,
) -> FaixaResultado | None:
    """Classifica a variação usando faixas_json. Retorna None se não houver faixas
    configuradas — nesse caso o chamador usa o fallback por tolerância."""
    if config is None or variacao_pct is None:
        return None

    faixas_all = config.faixas_json or {}
    key = _MET_FAIXA_KEY.get((metodologia or "").lower(), "IFPUG")
    faixas = [f for f in faixas_all.get(key, []) if f.get("ativa", True)]
    if not faixas:
        return None

    abs_var = abs(variacao_pct)
    faixa = None
    for f in faixas:
        dmin = float(f.get("desvioMin", 0))
        dmax = f.get("desvioMax")
        if dmax is None:
            if abs_var >= dmin:
                faixa = f
                break
        elif dmin <= abs_var < float(dmax):
            faixa = f
            break
    if faixa is None:
        # acima de todas as faixas explícitas — usa a última (mais restritiva)
        faixa = faixas[-1]

    acao = faixa.get("acao")
    alcada = _cargo_por_alcada(config, faixa.get("alcadaId"))

    # Mapeia ação de parecer -> status visual do De-Para
    if acao == "Recusado":
        status = "divergente"
    elif acao in ("Negociar", "Revisar"):
        status = "atencao"
    else:  # Aprovado
        # Aprovado pela alçada base (primeira) = ok; alçadas superiores = atenção
        primeira = faixas[0]
        status = "ok" if faixa.get("alcadaId") == primeira.get("alcadaId") else "atencao"

    return FaixaResultado(status=status, acao=acao, alcada=alcada)
