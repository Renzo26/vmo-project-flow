"""Schemas de leitura das faturas (Pydantic v2).

Uma "fatura" na tela é o dossiê do lançamento: o que o robô leu, mediu, conferiu
e decidiu. O nome difere do modelo (`Dossie`) porque a tela fala a língua de quem
paga a conta, não a do agente que a coletou.

Duas regras aqui não são estéticas:

* `medicao` e `conferencia` são `None` quando a etapa NÃO rodou. Zero preenchido
  faria a tela ler "medido, sem divergência" onde na verdade não houve medição —
  e é justamente essa diferença que decide se alguém precisa olhar a nota.

* `conferencia.situacao` tem três valores, não dois. `Divergente` e
  `PedidoNaoLocalizado` travam a nota igual, mas geram e-mails opostos: um pede
  que CORRIJAM o pedido, o outro que CRIEM o pedido.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.governanca.schemas.comuns import DataHora, Dinheiro, Percentual

StatusFatura = Literal["conciliada", "divergente", "pendente", "recebida"]
SituacaoConferencia = Literal["Conforme", "Divergente", "PedidoNaoLocalizado"]


class FaturaResumo(BaseModel):
    """Linha da listagem — o suficiente para a tabela, sem os laudos."""

    id: int
    referencia: str
    fornecedor: str
    fornecedor_cnpj: str
    unidade: str | None = None
    servico: str | None = None
    pedido: str | None = None
    valor: Dinheiro | None = None
    valor_pedido: Dinheiro | None = None
    competencia: str | None = None
    emissao: str | None = None
    vencimento: str | None = None
    status: StatusFatura
    canal: str | None = None
    processado_em: DataHora


class ArquivoSaida(BaseModel):
    """Etapa 8 — o antes e o depois da renomeação, com o hash que liga ao original."""

    model_config = ConfigDict(from_attributes=True)

    nome_origem: str
    nome_final: str
    tipo: str
    hash_sha256: str


class MedicaoSaida(BaseModel):
    """Etapa 4 — o laudo contra o contrato. Só existe se a medição rodou."""

    situacao: str
    motivo: str | None = None
    contrato_numero: str | None = None
    item_contratado: str | None = None
    valor_contratado: Dinheiro | None = None
    valor_cobrado: Dinheiro | None = None

    # Calculados, não guardados: derivar aqui garante que nunca discordem dos
    # dois valores acima, que é o risco de persistir um total redundante.
    divergencia: Dinheiro | None = None
    divergencia_percentual: Percentual | None = None

    explicacao: str | None = None


class ConferenciaSaida(BaseModel):
    """Etapas 5 e 6 — o laudo contra o pedido do Linx. Só existe se a conferência rodou."""

    situacao: SituacaoConferencia
    pedido_numero: str | None = None
    valor_pedido: Dinheiro | None = None
    valor_documento: Dinheiro | None = None

    # Conveniência da tela, espelho da coluna GERADA no banco: nunca diverge de
    # `situacao` porque não é escrito, é derivado.
    conforme: bool

    divergencias: list[str] = []
    explicacao: str | None = None


class FaturaDetalhe(FaturaResumo):
    """Tudo da listagem, mais os laudos, os arquivos e a trilha de auditoria."""

    arquivos: list[ArquivoSaida] = []
    medicao: MedicaoSaida | None = None
    conferencia: ConferenciaSaida | None = None
    protocolo_linx: str | None = None
    destinatario_rascunho: str | None = None
    trilha: list[str] = []
