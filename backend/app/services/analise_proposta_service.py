"""Motor de comparação APF: proposta do fornecedor vs. estimativa inicial."""

import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analise_proposta import AnaliseProposta
from app.models.contagem_pf import ContagemPF
from app.services import apf_config_service


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

    config = await apf_config_service.get_config_ativa(db)
    vpf = apf_config_service.valor_pf(config)

    # Contagem APF inicial (a mais antiga vinculada à solicitação)
    contagem = await db.scalar(
        select(ContagemPF)
        .where(ContagemPF.solicitacao_id == solicitacao_id)
        .order_by(ContagemPF.created_at)
    )
    pf_contagem = contagem.total_pf_local if contagem else None
    metodologia = contagem.metodologia if contagem else "ifpug"

    pf_proposta = _extrair_pf(arquivo_nome, arquivo_data)

    variacao_pct: float | None = None
    acao_recomendada: str | None = None
    alcada_requerida: str | None = None
    valor_estimado = round(pf_contagem * vpf, 2) if pf_contagem is not None else None
    valor_proposta = round(pf_proposta * vpf, 2) if pf_proposta is not None else None

    if pf_contagem is None:
        status = "sem_contagem"
        resumo = "Não há contagem APF inicial vinculada a esta solicitação."
    elif pf_proposta is None:
        status = "sem_pf_proposta"
        resumo = "Não foi possível extrair o total de PF do arquivo de proposta."
    else:
        variacao_pct = (pf_proposta - pf_contagem) / pf_contagem * 100 if pf_contagem else 0.0
        abs_var = abs(variacao_pct)

        # 1ª opção: classificação pelas faixas de desvio configuradas
        faixa = apf_config_service.classificar_por_faixa(config, metodologia, variacao_pct)
        if faixa is not None:
            status = faixa.status
            acao_recomendada = faixa.acao
            alcada_requerida = faixa.alcada
        else:
            # Fallback: tolerância simples quando não há faixas configuradas
            tol = apf_config_service.tolerancia(config)
            if abs_var <= tol:
                status = "ok"
            elif abs_var <= 25.0:
                status = "atencao"
            else:
                status = "divergente"

        sinal = "+" if variacao_pct >= 0 else ""
        partes = [
            f"Proposta: {pf_proposta:.2f} PF",
            f"Estimativa inicial: {pf_contagem:.2f} PF",
            f"Variação: {sinal}{variacao_pct:.1f}%",
        ]
        if acao_recomendada:
            partes.append(f"Parecer: {acao_recomendada}")
        if alcada_requerida:
            partes.append(f"Alçada: {alcada_requerida}")
        resumo = " · ".join(partes)

    analise = AnaliseProposta(
        solicitacao_id=solicitacao_id,
        proposta_id=proposta_id,
        pf_contagem=pf_contagem,
        pf_proposta=pf_proposta,
        variacao_pct=variacao_pct,
        valor_estimado=valor_estimado,
        valor_proposta=valor_proposta,
        acao_recomendada=acao_recomendada,
        alcada_requerida=alcada_requerida,
        status=status,
        resumo=resumo,
    )
    db.add(analise)
    return analise
