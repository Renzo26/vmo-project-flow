"""Entrada de escrita: o dossiê que o agente .NET acabou de produzir.

Este é o único ponto do sistema em que a API RECEBE resultado de processamento — todo o
resto lê. Por isso ele espelha, campo a campo, o JSON que `Inbrands.Coleta.Domain` já
grava em `estado/dossies.json`: os nomes vêm em PascalCase com `alias`, e não numa forma
"mais bonita" em snake_case. Renomear aqui criaria uma terceira grafia dos mesmos campos
(a do .NET, a do banco e a do trânsito), e cada tradução a mais é um lugar a mais para um
campo se perder em silêncio.

Os enums são validados AQUI, contra as mesmas tuplas que geram os CHECK do banco. Sem
isso um desfecho escrito errado viraria `IntegrityError` — HTTP 500, sem dizer qual campo
está errado. Com isso vira 422 apontando o campo, que é o que permite corrigir.
"""

from __future__ import annotations

from datetime import datetime
import re
from decimal import Decimal

from typing import Annotated

from pydantic import AfterValidator, BaseModel, BeforeValidator, ConfigDict, Field

from app.governanca.models.base import (
    CANAIS,
    DESFECHOS,
    MOTIVOS_NAO_ADERENCIA,
    SITUACOES_CONFERENCIA,
    SITUACOES_MEDICAO,
    TIPOS_DOCUMENTO,
)


class _DoAgente(BaseModel):
    """Base comum: aceita o PascalCase do .NET e também o nome em snake_case.

    `populate_by_name` existe para que um teste (ou um `curl` escrito à mão) possa usar o
    nome do campo Python sem precisar acertar a grafia do outro lado.
    """

    model_config = ConfigDict(populate_by_name=True, extra="ignore")


def _um_de(valores: tuple[str, ...], campo: str):
    """Recusa um valor fora da lista com a lista inteira na mensagem.

    `Annotated[..., AfterValidator]` em vez de `@field_validator`: o tipo carrega a
    regra, então reusar o mesmo enum em outro schema não exige copiar o validador.
    """

    def checar(v: str | None) -> str | None:
        if v is None or v in valores:
            return v
        raise ValueError(f"{campo} inválido: {v!r}. Esperado um de: {', '.join(valores)}.")

    return AfterValidator(checar)


SituacaoMedicao = Annotated[str | None, _um_de(SITUACOES_MEDICAO, "Medicao.Situacao")]
MotivoMedicao = Annotated[str | None, _um_de(MOTIVOS_NAO_ADERENCIA, "Medicao.Motivo")]
SituacaoConferencia = Annotated[
    str | None, _um_de(SITUACOES_CONFERENCIA, "Conferencia.Situacao")
]
TipoDocumento = Annotated[str, _um_de(TIPOS_DOCUMENTO, "Tipo")]
CanalEntrada = Annotated[str, _um_de(CANAIS, "Canal")]
CanalOpcional = Annotated[str | None, _um_de(CANAIS, "Canal")]
DesfechoEntrada = Annotated[str, _um_de(DESFECHOS, "Desfecho")]


def _decimal_do_portal(v: object) -> object:
    """Converte o valor COMO O PORTAL O ESCREVEU: `"R$ 18.450,00"` vira `18450.00`.

    Os metadados do documento são texto raspado da tela do fornecedor, não campo
    estruturado — cada portal formata do seu jeito, e o canal de e-mail já entrega
    `"8115.75"`. Rejeitar a grafia brasileira faria a ingestão falhar exatamente nas
    notas vindas do portal.

    O que não dá para ler vira `None`, e não erro: este campo é uma CÓPIA do valor.
    Quem manda no dinheiro é o `Valor` do dossiê, que o agente calculou. Derrubar o
    registro inteiro por causa de um texto ilegível na cópia seria perder o dossiê
    para preservar a redundância.
    """
    if not isinstance(v, str):
        return v

    texto = v.replace("R$", "").replace("\xa0", " ").strip()
    if not texto:
        return None
    # Vírgula presente => separador decimal brasileiro, e o ponto é milhar.
    if "," in texto:
        texto = texto.replace(".", "").replace(",", ".")
    try:
        return Decimal(texto)
    except Exception:
        return None


ValorDoPortal = Annotated[Decimal | None, BeforeValidator(_decimal_do_portal)]


MESES_PT = {
    "janeiro": "01", "fevereiro": "02", "marco": "03", "março": "03",
    "abril": "04", "maio": "05", "junho": "06", "julho": "07",
    "agosto": "08", "setembro": "09", "outubro": "10",
    "novembro": "11", "dezembro": "12",
}

_ISO_COMPETENCIA = re.compile(r"^\d{4}-\d{2}$")


def _competencia_normalizada(v: object) -> object:
    """`"Setembro/2026"` vira `"2026-09"`.

    Os dois canais discordam: o portal raspa o rótulo que o humano lê na tela, o e-mail
    entrega a competência já normalizada. Uma coluna com as duas grafias faria o
    dashboard contar setembro duas vezes — e o recorte por competência é o eixo de
    TODOS os cartões. Normalizar na porta de entrada é o que mantém uma competência,
    uma grafia.
    """
    if not isinstance(v, str):
        return v

    texto = v.strip()
    if not texto or _ISO_COMPETENCIA.match(texto):
        return texto or None

    # "Setembro/2026", "setembro de 2026", "09/2026"
    partes = re.split(r"[/\s]+de[/\s]+|[/\s]+", texto)
    partes = [p for p in partes if p]
    if len(partes) == 2:
        mes_bruto, ano = partes
        mes = MESES_PT.get(mes_bruto.lower())
        if mes is None and mes_bruto.isdigit():
            mes = mes_bruto.zfill(2)
        if mes and ano.isdigit() and len(ano) == 4:
            return f"{ano}-{mes}"

    return None


CompetenciaDoPortal = Annotated[str | None, BeforeValidator(_competencia_normalizada)]


_ISO_DATA = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_DATA_BR = re.compile(r"^(\d{2})/(\d{2})/(\d{4})$")


def _data_normalizada(v: object) -> object:
    """`"15/10/2026"` vira `"2026-10-15"`.

    Mesmo desencontro entre os canais, com uma consequência pior: `dd/MM/yyyy` e
    `yyyy-MM-dd` ordenam de formas diferentes como texto, então uma lista de
    vencimentos misturando as duas grafias sai fora de ordem sem erro nenhum.
    O contrato da API já fixa ISO; é aqui que ele passa a valer.

    O que não casa com nenhum dos dois formatos é preservado como veio — inventar
    uma data a partir de texto ambíguo seria pior do que exibi-lo como está.
    """
    if not isinstance(v, str):
        return v

    texto = v.strip()
    if not texto or _ISO_DATA.match(texto):
        return texto or None

    br = _DATA_BR.match(texto)
    if br:
        dia, mes, ano = br.groups()
        return f"{ano}-{mes}-{dia}"

    return texto


DataDoPortal = Annotated[str | None, BeforeValidator(_data_normalizada)]


def _competencia_exigida(v: str | None) -> str | None:
    """No dossiê a competência é exigida em ISO — não normalizada em silêncio.

    Aqui ela não é metadado raspado: é o campo pelo qual o dashboard recorta o mês. Uma
    grafia inesperada precisa aparecer como 422 apontando o campo, não virar `None` e
    sumir do recorte sem que ninguém perceba.
    """
    if v is None or _ISO_COMPETENCIA.match(v):
        return v
    raise ValueError(f"Competencia deve estar em AAAA-MM; veio {v!r}.")


CompetenciaDoDossie = Annotated[str | None, AfterValidator(_competencia_exigida)]


class MedicaoEntrada(_DoAgente):
    situacao: SituacaoMedicao = Field(None, alias="Situacao")
    motivo: MotivoMedicao = Field(None, alias="Motivo")
    explicacao: str | None = Field(None, alias="Explicacao")
    contrato_numero: str | None = Field(None, alias="ContratoNumero")
    item_contratado: str | None = Field(None, alias="ItemContratado")
    valor_contratado: Decimal | None = Field(None, alias="ValorContratado")
    valor_cobrado: Decimal | None = Field(None, alias="ValorCobrado")
    observacao: str | None = Field(None, alias="Observacao")


class ConferenciaEntrada(_DoAgente):
    situacao: SituacaoConferencia = Field(None, alias="Situacao")
    explicacao: str | None = Field(None, alias="Explicacao")
    pedido_numero: str | None = Field(None, alias="PedidoNumero")
    valor_pedido: Decimal | None = Field(None, alias="ValorPedido")
    valor_documento: Decimal | None = Field(None, alias="ValorDocumento")
    divergencias: list[str] = Field(default_factory=list, alias="Divergencias")

    # `Conforme` chega no JSON do agente e é DELIBERADAMENTE ignorado: no banco ele é
    # coluna gerada a partir da situação. Aceitá-lo abriria a possibilidade de o agente
    # mandar `Situacao="Divergente"` com `Conforme=true` e alguém ter de decidir em quem
    # acreditar.

class ArquivoEntrada(_DoAgente):
    nome_origem: str = Field(alias="NomeOrigem")
    nome_final: str = Field(alias="NomeFinal")
    tipo: TipoDocumento = Field(alias="Tipo")
    hash_sha256: str = Field(alias="HashSha256")


class MetadadosDocumento(_DoAgente):
    id_origem: str | None = Field(None, alias="IdOrigem")
    numero_fatura: str | None = Field(None, alias="NumeroFatura")
    numero_nota_fiscal: str | None = Field(None, alias="NumeroNotaFiscal")
    serie_nota_fiscal: str | None = Field(None, alias="SerieNotaFiscal")
    numero_pedido: str | None = Field(None, alias="NumeroPedido")
    competencia: CompetenciaDoPortal = Field(None, alias="Competencia")
    unidade: str | None = Field(None, alias="Unidade")
    emissao: DataDoPortal = Field(None, alias="Emissao")
    vencimento: DataDoPortal = Field(None, alias="Vencimento")
    valor: ValorDoPortal = Field(None, alias="Valor")


class DocumentoEntrada(_DoAgente):
    """O arquivo que entrou na etapa 1.

    Vem junto do dossiê por um motivo concreto: a data de EMISSÃO da nota só existe
    aqui. O dossiê guarda vencimento. Sem o documento, a listagem de faturas mostra
    emissão vazia — e emissão é o que define a competência numa discussão com o
    fornecedor.
    """

    id: str = Field(alias="Id")
    fornecedor_id: str = Field(alias="FornecedorId")
    fornecedor_nome: str = Field(alias="FornecedorNome")
    fornecedor_cnpj: str = Field(alias="FornecedorCnpj")
    canal: CanalEntrada = Field(alias="Canal")
    tipo: TipoDocumento = Field(alias="Tipo")
    nome_arquivo_origem: str = Field(alias="NomeArquivoOrigem")
    caminho_relativo: str = Field(alias="CaminhoRelativo")
    hash_sha256: str = Field(alias="HashSha256")
    tamanho_bytes: int = Field(alias="TamanhoBytes")
    chave_natural: str = Field(alias="ChaveNatural")
    metadados: MetadadosDocumento = Field(
        default_factory=MetadadosDocumento, alias="Metadados"
    )
    coletado_em: datetime = Field(alias="ColetadoEm")


class DossieEntrada(_DoAgente):
    lancamento_referencia: str = Field(alias="LancamentoReferencia")
    processado_em: datetime = Field(alias="ProcessadoEm")
    desfecho: DesfechoEntrada = Field(alias="Desfecho")
    fornecedor_id: str = Field(alias="FornecedorId")
    fornecedor_nome: str = Field(alias="FornecedorNome")
    fornecedor_cnpj: str = Field(alias="FornecedorCnpj")

    # O canal não está no dossiê do agente — ele mora no documento que o originou.
    # Quem publica preenche a partir de lá; `None` é resposta honesta quando não dá
    # para saber, e melhor do que chutar "Portal".
    canal: CanalOpcional = Field(None, alias="Canal")

    competencia: CompetenciaDoDossie = Field(None, alias="Competencia")
    unidade: str | None = Field(None, alias="Unidade")
    numero_nota_fiscal: str | None = Field(None, alias="NumeroNotaFiscal")
    numero_fatura: str | None = Field(None, alias="NumeroFatura")
    vencimento: DataDoPortal = Field(None, alias="Vencimento")
    valor: Decimal | None = Field(None, alias="Valor")

    medicao: MedicaoEntrada | None = Field(None, alias="Medicao")
    conferencia: ConferenciaEntrada | None = Field(None, alias="Conferencia")
    arquivos: list[ArquivoEntrada] = Field(default_factory=list, alias="Arquivos")
    trilha: list[str] = Field(default_factory=list, alias="Trilha")

    protocolo_linx: str | None = Field(None, alias="ProtocoloLinx")
    rascunho_devolucao: str | None = Field(None, alias="RascunhoDevolucao")
    destinatario_rascunho: str | None = Field(None, alias="DestinatarioRascunho")


class IngestaoEntrada(_DoAgente):
    dossie: DossieEntrada
    documentos: list[DocumentoEntrada] = Field(default_factory=list)


class IngestaoSaida(BaseModel):
    """O bastante para a tela linkar direto no dossiê recém-gravado."""

    id: int
    referencia: str
    desfecho: str
    status: str
    criado: bool
    """`False` quando o lançamento já existia e foi substituído — reprocessar é normal."""

    documentos_novos: int
