"""Motor de comparação APF: proposta do fornecedor vs. estimativa inicial."""

import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analise_proposta import AnaliseProposta
from app.models.contagem_pf import ContagemPF
from app.models.configuracao_apf import ConfiguracaoAPF


def _extrair_pf(nome: str, data: bytes) -> float | None:
    """Extrai Total PF do arquivo de proposta."""
    try:
        from app.services.document_parser import extract_text
        texto = extract_text(nome, data)
    except Exception:
        return None

    # Linha de rodapé gerada pelo template: "Resumo para Motor APF | Total PF: 75 | ..."
    m = re.search(r"Total\s+PF[:\s]+(\d+(?:[.,]\d+)?)", texto, re.IGNORECASE)
    if m:
        return float(m.group(1).replace(",", "."))

    # Fallback: "TOTAL DE PONTOS DE FUNÇÃO ... 75"
    m = re.search(
        r"TOTAL\s+DE\s+PONTOS\s+DE\s+FUN[ÇC][ÃA]O[^0-9]*(\d+(?:[.,]\d+)?)",
        texto, re.IGNORECASE,
    )
    if m:
        return float(m.group(1).replace(",", "."))

    return None


async def _tolerancia(db: AsyncSession) -> float:
    cfg = await db.scalar(
        select(ConfiguracaoAPF).where(ConfiguracaoAPF.ativa == True).order_by(ConfiguracaoAPF.created_at.desc())
    )
    return cfg.tolerancia if cfg else 10.0


async def analisar(
    db: AsyncSession,
    solicitacao_id: uuid.UUID,
    proposta_id: uuid.UUID,
    arquivo_nome: str,
    arquivo_data: bytes,
) -> AnaliseProposta:
    # Remove análise anterior para a mesma solicitação
    old = await db.scalar(
        select(AnaliseProposta).where(AnaliseProposta.solicitacao_id == solicitacao_id)
    )
    if old:
        await db.delete(old)

    # Contagem APF inicial (a mais antiga vinculada à solicitação)
    contagem = await db.scalar(
        select(ContagemPF)
        .where(ContagemPF.solicitacao_id == solicitacao_id)
        .order_by(ContagemPF.created_at)
    )
    pf_contagem = contagem.total_pf_local if contagem else None

    pf_proposta = _extrair_pf(arquivo_nome, arquivo_data)

    if pf_contagem is None:
        status = "sem_contagem"
        variacao_pct = None
        resumo = "Não há contagem APF inicial vinculada a esta solicitação."
    elif pf_proposta is None:
        status = "sem_pf_proposta"
        variacao_pct = None
        resumo = "Não foi possível extrair o total de PF do arquivo de proposta."
    else:
        variacao_pct = (pf_proposta - pf_contagem) / pf_contagem * 100 if pf_contagem else 0.0
        tol = await _tolerancia(db)
        abs_var = abs(variacao_pct)
        if abs_var <= tol:
            status = "ok"
        elif abs_var <= 25.0:
            status = "atencao"
        else:
            status = "divergente"
        sinal = "+" if variacao_pct >= 0 else ""
        resumo = (
            f"Proposta: {pf_proposta:.2f} PF · "
            f"Estimativa inicial: {pf_contagem:.2f} PF · "
            f"Variação: {sinal}{variacao_pct:.1f}%"
        )

    analise = AnaliseProposta(
        solicitacao_id=solicitacao_id,
        proposta_id=proposta_id,
        pf_contagem=pf_contagem,
        pf_proposta=pf_proposta,
        variacao_pct=variacao_pct,
        status=status,
        resumo=resumo,
    )
    db.add(analise)
    return analise
