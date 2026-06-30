from enum import Enum
from typing import Optional

from pydantic import BaseModel


class Methodology(str, Enum):
    apf = "apf"
    nesma = "nesma"
    sfp = "sfp"


SHEET_BY_METHODOLOGY: dict[Methodology, str] = {
    Methodology.apf: "APF",
    Methodology.nesma: "NESMA Estimada",
    Methodology.sfp: "SFP",
}


class FieldResult(BaseModel):
    campo: str
    preenchido: bool
    valor: Optional[str] = None
    observacao: Optional[str] = None


class AnaliseResponse(BaseModel):
    metodologia: Methodology
    aba: str
    arquivo: str
    total_campos: int
    total_preenchidos: int
    total_pendentes: int
    completo: bool
    campos: list[FieldResult]
    pendentes: list[str]
    resumo: Optional[str] = None
