# Regras das Planilhas de APF — Referência para Implementação

## Contexto

Este documento descreve as regras de negócio extraídas de dois arquivos na pasta `Documentos_regras`:

- **`Planilha PFS - 2.2 - 2026.xlsx`** — Template oficial de contagem pelo método **PFS (Ponto Funcional Simplificado) versão 2.2**, usado nas contagens internas do VMO.
- **`PlanilhaContagemPontoFuncaoExemplo.xls`** — Exemplo real de contagem detalhada pelo método **IFPUG/APF (Análise de Ponto de Função)**, com complexidade funcional completa.

No sistema VMO, o módulo **Controle > APF** implementa estas planilhas digitalmente. As páginas relevantes são: `ControleAPF`, `APFHistorico` e `APFNovaContagem`.

---

## Fluxo de Aplicação das Regras

### Onde acontece

As regras das planilhas são aplicadas **dentro do fluxo de solicitação** do sistema VMO (módulo `NovaAnalise` / fluxo de pedido de análise de fornecedor/projeto).

### Ponto de decisão: Fonte de Requisitos

Durante o preenchimento de uma solicitação, o usuário seleciona a **Fonte de Requisitos**. Essa seleção é o gatilho que determina qual método de cálculo de APF será aplicado:

```
Selecionar Fonte de Requisitos
        │
        ├── [Opção A] → Aplica regras da Planilha 1: PFS 2.2
        │               (Método simplificado — AL=7 PF fixo, PE=4,6 PF fixo)
        │
        └── [Opção B] → Aplica regras da Planilha 2: IFPUG Detalhado
                        (Método completo — EE/SE/CE/ALI/AIE × complexidade Baixa/Média/Alta)
```

> **Nota para implementação:** As opções exatas de "Fonte de Requisitos" disponíveis no sistema (nomes dos itens do dropdown) devem ser definidas pelo produto. O mapeamento `opção → planilha` precisa ser configurado conforme essas opções forem definidas.

### Comportamento por método selecionado

| Fonte de Requisitos | Método | Entrada do usuário | Cálculo automático |
|---|---|---|---|
| → Planilha 1 (PFS 2.2) | Simplificado | Lista de ALs e PEs com tipo de operação (ADD/CHG/DEL/CFP) | PF fixo por tipo + impacto na aplicação |
| → Planilha 2 (IFPUG) | Detalhado | Lista de funções com tipo (EE/SE/CE/ALI/AIE), operação (I/A/E), DER e ALR | PF por complexidade × deflator por operação |

### Saídas geradas em ambos os métodos

Independente do método aplicado, o sistema deve calcular e persistir:

- **Total de PF** (pontos de função brutos)
- **Total de PF Local** (com deflator aplicado — apenas no IFPUG; no PFS o deflator é embutido no impacto)
- **Tamanho da aplicação resultante** (ASFP para desenvolvimento / ASFPA para melhoria)
- **Esforço estimado** = Total PF Local × Horas/PF configuradas
- **Distribuição do esforço** por atividade (Requisitos 20%, Projeto 30%, Implementação+Testes 40%, Entrega 10%)

---

## Conceitos Fundamentais

### O que é APF (Análise de Ponto de Função)?

APF é uma técnica de medição de tamanho funcional de software. O resultado (em **PF — Pontos de Função**) serve para:
- Estimar o esforço de desenvolvimento (horas, custo)
- Contratar fornecedores de software com base em tamanho funcional
- Acompanhar a produtividade ao longo de projetos

### Tipos de Projeto

| Tipo | Descrição | Planilha |
|---|---|---|
| **Desenvolvimento** | Criação de sistema/módulo novo do zero | Aba "Desenvolvimento" |
| **Melhoria** | Evolução de um sistema já existente | Aba "Melhoria" |
| **Indicativa** | Estimativa rápida por analogia | — |
| **Estimativa** | Estimativa com base em funcionalidades conhecidas | — |
| **Aplicação (Baseline)** | Medição do tamanho atual de um sistema | — |

---

## Método PFS 2.2 — Regras da Planilha Simplificada

### Componentes Funcionais Básicos (CFBs)

A planilha PFS 2.2 trabalha com dois tipos de componentes:

| Tipo | Sigla | Tamanho fixo (PF) |
|---|---|---|
| Arquivos Lógicos | **AL** | **7 PF** cada |
| Processos Elementares | **PE** | **4,6 PF** cada |

> **Atenção:** No PFS 2.2, o tamanho é fixo — não há cálculo de complexidade por DER/ALR. Cada AL vale sempre 7 PF e cada PE vale sempre 4,6 PF.

### Tipos de Operação

Cada CFB (AL ou PE) recebe um "Tipo de Operação" que define seu impacto na aplicação:

| Operação | Significado | Disponível em |
|---|---|---|
| **ADD** | Adição — componente novo sendo criado | Desenvolvimento, Melhoria |
| **CHG** | Alteração — componente existente sendo modificado | Melhoria |
| **DEL** | Exclusão — componente sendo removido | Melhoria |
| **CFP** | COSMIC Function Point — componente existente reutilizado sem alteração | Desenvolvimento, Melhoria |

### Cálculo de Impacto no Tamanho da Aplicação

#### Aba Desenvolvimento

```
Impacto (ADD)  = tamanho do CFB (7 ou 4,6)   ← aumenta a aplicação
Impacto (CFP)  = 0                             ← não altera a aplicação
```

**Fórmulas de totais:**
```
Total ALs (Tamanho de Desenvolvimento)  = SOMA(tamanho de cada AL preenchido)
Total PEs (Tamanho de Desenvolvimento)  = SOMA(tamanho de cada PE preenchido)

DSFP (Development Software Functional Points) = Total ALs + Total PEs
ASFP (Application Software Functional Points) = SOMA(apenas impactos ADD)
```

- **DSFP** = Tamanho total do desenvolvimento (ADD + CFP)
- **ASFP** = Tamanho que a aplicação terá após o desenvolvimento (somente ADD)

#### Aba Melhoria

```
Impacto (ADD)  = +tamanho do CFB    ← aumenta a aplicação
Impacto (DEL)  = -tamanho do CFB    ← diminui a aplicação
Impacto (CHG)  = 0                  ← não altera o tamanho (só modifica)
Impacto (CFP)  = 0                  ← não altera a aplicação
```

**Fórmulas de totais:**
```
ESFP (Enhancement Software Functional Points) = ADD + CHG + DEL + CFP

ASFPA (Application Size After) = ASFPB + SOMA(impactos ADD) + SOMA(impactos DEL)
                                = ASFPB + ADD_total - DEL_total
```

- **ASFPB** = Tamanho da aplicação *antes* da melhoria (campo de entrada obrigatório)
- **ASFPA** = Tamanho da aplicação *após* a melhoria

### Limites de CFBs na Planilha PFS 2.2

| Tipo | Quantidade máxima de linhas |
|---|---|
| Arquivos Lógicos (ALs) | 16 por projeto |
| Processos Elementares (PEs) | 30 por projeto |

---

## Método IFPUG Detalhado — Regras do Arquivo de Exemplo

O arquivo de exemplo usa o método completo do **IFPUG** (International Function Point Users Group), que é a base da norma ISO/IEC 20926. Este é o método de referência para auditorias e contratos formais.

### Tipos de Funções (5 categorias)

#### Funções de Dados

| Tipo | Sigla | Descrição |
|---|---|---|
| Arquivo Lógico Interno | **ALI** | Arquivo mantido pela própria aplicação |
| Arquivo de Interface Externa | **AIE** | Arquivo lido de outra aplicação |

#### Funções de Transação

| Tipo | Sigla | Descrição |
|---|---|---|
| Entrada Externa | **EE** | Processa dados que entram no sistema |
| Saída Externa | **SE** | Produz saída com lógica de processamento |
| Consulta Externa | **CE** | Recupera dados sem processamento adicional |

### Tabela de Complexidade × Pontos de Função (IFPUG)

| Tipo | Baixa | Média | Alta |
|---|---|---|---|
| EE | 3 PF | 4 PF | 6 PF |
| SE | 4 PF | 5 PF | 7 PF |
| CE | 3 PF | 4 PF | 6 PF |
| ALI | 7 PF | 10 PF | 15 PF |
| AIE | 5 PF | 7 PF | 10 PF |

### Determinação da Complexidade

A complexidade é determinada pelo cruzamento de dois parâmetros:

- **DER** (Dados Elementares Referenciados) — número de campos distintos processados
- **ALR/RLR** (Arquivos Lógicos Referenciados) — número de arquivos lógicos acessados

Códigos de complexidade usados na planilha:
- `L` = Baixa (Low)
- `A` = Média (Average)
- `H` = Alta (High)

Exemplos de código de controle de complexidade: `SEA` (Saída Externa Média), `ALIH` (ALI Alta), `AIEL` (AIE Baixa), `EEA` (Entrada Externa Média), `CEA` (Consulta Externa Média).

### Tipos de Operação na Contagem Detalhada

Cada função recebe uma classificação de operação:

| Código | Significado |
|---|---|
| **I** | Inclusão (ADD) |
| **A** | Alteração (CHG) |
| **E** | Exclusão (DEL) |

### Deflator (PF Local)

O PF Local ajusta os pontos de função conforme o tipo de operação, refletindo o esforço real de cada tipo:

| Operação | Deflator | Exemplo: 10 PF |
|---|---|---|
| ADD (Inclusão) | **1,00** (100%) | → 10,00 PF Local |
| CHG (Alteração) | **0,80** (80%) | → 8,00 PF Local |
| DEL (Exclusão) | **0,60** (60%) | → 6,00 PF Local |

```
PF Local = PF_bruto × deflator_da_operação
Total PF Local = SOMA(PF Local de todas as funções)
```

### Estimativa de Esforço

Com o total de PF Local calculado, estima-se o esforço:

```
Horas/PF             = produtividade do setor (padrão setor público: 6 h/PF)
Esforço Total (h)    = Total PF Local × Horas/PF
Horas/Homem-mês      = 168 h (referência padrão)
Capacidade do time   = Esforço Total / (Horas/Homem-mês × Prazo em meses)
```

#### Distribuição do Esforço por Atividade

| Atividade | Percentual | Horas (exemplo: 951,6 h total) |
|---|---|---|
| Análise de Requisitos | 20% | 190,32 h |
| Análise e Projeto | 30% | 285,48 h |
| Implementação e Testes | 40% | 380,64 h |
| Disponibilização | 10% | 95,16 h |

---

## Exemplo Real de Contagem (do arquivo de exemplo)

**Projeto:** Acompanhamento de Sessão do PJe — TRT 9ª Região
**Tipo:** Projeto de Desenvolvimento

| Tipo de Função | Qtd | PF Bruto | PF Local |
|---|---|---|---|
| EE (Entrada Externa) | 11 funções | 44 PF | variável |
| SE (Saída Externa) | 6 funções | 30 PF | variável |
| CE (Consulta Externa) | 9 funções | 36 PF | variável |
| ALI (Arq. Lógico Interno) | 2 funções | 22 PF | variável |
| AIE (Arq. Interface Externa) | 7 funções | 37 PF | variável |
| **Total** | **35 funções** | **169 PF** | **158,60 PF** |

Esforço estimado: **158,60 PF × 6 h/PF = 951,6 horas**

---

## Relação com o Sistema VMO

O módulo **Controle > APF** do VMO implementa estas regras. O fluxo é:

1. **APFNovaContagem**: usuário Controle cria uma nova contagem informando:
   - Aplicação, Projeto, Responsável
   - Tipo de projeto (Desenvolvimento ou Melhoria)
   - Para Melhoria: ASFPB (tamanho antes da melhoria)
   - Lista de ALs com tipo de operação
   - Lista de PEs com tipo de operação

2. **Cálculo automático**: sistema aplica as fórmulas PFS 2.2 para calcular:
   - Tamanho de Desenvolvimento/Melhoria (DSFP ou ESFP)
   - Impacto no tamanho da aplicação (ASFP ou ASFPA)

3. **APFHistorico**: registra e exibe o histórico de todas as contagens realizadas

### Campos obrigatórios por tipo

| Campo | Desenvolvimento | Melhoria |
|---|---|---|
| Aplicação | Sim | Sim |
| Projeto | Sim | Sim |
| ASFPB (tamanho antes) | Não | **Sim** |
| ALs com operação ADD ou CFP | Sim | — |
| ALs com operação ADD/CHG/DEL/CFP | — | Sim |
| PEs com operação ADD ou CFP | Sim | — |
| PEs com operação ADD/CHG/DEL/CFP | — | Sim |

### Validações de negócio

- Ao menos um CFB (AL ou PE) deve ser informado para salvar uma contagem
- ALs aceitam no máximo 16 itens por contagem
- PEs aceitam no máximo 30 itens por contagem
- Campos de CFB sem tipo de operação selecionado não contribuem para o total
- Para Melhoria: ASFPA nunca pode ser negativo (DEL não pode superar ASFPB + ADD)
