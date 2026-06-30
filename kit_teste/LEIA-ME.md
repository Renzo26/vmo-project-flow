# Kit de Teste — Fluxo Completo VMO

Este kit contém os documentos para testar o fluxo de ponta a ponta:
solicitante → controle econômico → fornecedor → motor De-Para APF.

## Arquivos

| Arquivo | Quem usa | Para quê |
|---|---|---|
| `01_ENTRADA_PF_(SFP).xlsx` | **Solicitante** | Anexar ao criar a solicitação. O motor de IA lê e gera a contagem inicial (estimativa ≈ **58 PF** com o modelo `gpt-4o`). |
| `02_PROPOSTA_OK.xlsx` | **Fornecedor** | Proposta com 58 PF → variação **~0%** → **verde (dentro do esperado)**, sem popup. |
| `03_PROPOSTA_ATENCAO.xlsx` | **Fornecedor** | Proposta com 71 PF → variação **~+23%** → **amarelo (atenção)** + popup. |
| `04_PROPOSTA_DIVERGENTE.xlsx` | **Fornecedor** | Proposta com 110 PF → variação **~+90%** → **vermelho (divergente)** + popup. |

### Caminho APF IFPUG (detalhada) — estimativa ≈ **51 PF**

| Arquivo | Quem usa | Para quê |
|---|---|---|
| `05_ENTRADA_PF_(APF).xlsx` | **Solicitante** | Criar solicitação com metodologia **APF**. A IA classifica cada linha (1=EE…5=AIE) e calcula a complexidade por **DER/ALR** (padrão 20/1). Estimativa ≈ **51 PF**. |
| `06_PROPOSTA_APF_OK.xlsx` | **Fornecedor** | 51 PF → **~0%** → verde, sem popup. |
| `07_PROPOSTA_APF_ATENCAO.xlsx` | **Fornecedor** | 63 PF → **~+23%** → amarelo + popup. |
| `08_PROPOSTA_APF_DIVERGENTE.xlsx` | **Fornecedor** | 97 PF → **~+90%** → vermelho + popup. |

### Caminho NESMA Estimada — estimativa ≈ **48 PF**

| Arquivo | Quem usa | Para quê |
|---|---|---|
| `09_ENTRADA_PF_(NESMA).xlsx` | **Solicitante** | Criar solicitação com metodologia **NESMA**. A IA classifica cada linha (1=EE…5=AIE) com **complexidade fixa** (transação=Média, dados=Baixa). Estimativa ≈ **48 PF**. |
| `10_PROPOSTA_NESMA_OK.xlsx` | **Fornecedor** | 48 PF → **~0%** → verde, sem popup. |
| `11_PROPOSTA_NESMA_ATENCAO.xlsx` | **Fornecedor** | 59 PF → **~+23%** → amarelo + popup. |
| `12_PROPOSTA_NESMA_DIVERGENTE.xlsx` | **Fornecedor** | 91 PF → **~+90%** → vermelho + popup. |

> Para baixar o **modelo em branco** de cada metodologia, use o botão **Baixar modelo** na etapa
> "Padrão de Entrada PF" (SFP baixa o modelo original; APF/NESMA baixam a planilha 01_ENTRADA_PF_(APF)).
> APF (51 PF) e NESMA (48 PF) × R$820/PF ficam **abaixo** do teto padrão de R$50.000, então o cenário
> OK fica totalmente verde nesses dois caminhos.

> A estimativa (58 PF) × R$/PF (820) = **R$ 47.560**, que fica **abaixo** do teto padrão de
> **R$ 50.000** — então o cenário OK fica **totalmente verde**, sem alerta de teto.
>
> ⚠️ **A estimativa é gerada por IA e depende do modelo configurado.** O valor 58 PF é estável
> com `gpt-4o` (`temperature=0`). Se a variável de ambiente `OPENAI_MODEL` for trocada, o número
> muda e as propostas saem do alvo — nesse caso, recalibre as propostas ou fixe a contagem
> manualmente (ver final deste arquivo).

## Logins

| Perfil | E-mail | Senha |
|---|---|---|
| Solicitante | `solicitante@vmo.com` | `123456` |
| Controle Econômico | `controle@vmo.com` | `123456` |
| Fornecedor | `fornecedor@vmo.com` | `123456` |

---

## Passo a passo

### 1. Controle Econômico — configurar as regras (uma vez)
1. Login como **controle@vmo.com**.
2. Abra **Configurar APF** e percorra os 4 passos:
   - **R$/PF** (ex.: `820`) → usado para calcular o valor estimado.
   - **Tolerância** (ex.: `10%`) → margem em que a proposta é considerada "ok".
   - **Teto da alçada CE** (ex.: `50000`) → acima disso, exige aprovação superior.
   - **Faixas de desvio** → definem o parecer (Aprovado/Recusado) e a alçada.
3. Clique em **Salvar**. *(Se não salvar nenhuma config, o sistema usa os padrões: R$820/PF, tolerância 10%, teto R$50.000.)*

### 2. Solicitante — criar a solicitação
1. Login como **solicitante@vmo.com**.
2. Crie uma nova solicitação. Em **metodologia PF** escolha **SFP**.
3. Anexe o arquivo **`01_ENTRADA_PF_(SFP).xlsx`**.
4. Envie. O motor de IA vai gerar a **contagem inicial** automaticamente
   (estimativa ≈ **58 PF** com `gpt-4o` — a IA conta um PE por funcionalidade e um AL por entidade interna).

### 3. Controle Econômico — dar o aval / atribuir fornecedor
1. Login como **controle@vmo.com**.
2. Abra a solicitação criada. Você verá:
   - O bloco **Contagens APF** (estimativa gerada pela IA).
   - O bloco **Valor estimado** (PF × R$/PF) e o **teto da alçada**.
3. Dê o aval e direcione para a **TechSoft Soluções** (fornecedor@vmo.com).
   *(Se ficar sem fornecedor, use o bloco amarelo "Atribuir e enviar".)*

### 4. Fornecedor — enviar proposta e ver o De-Para
1. Login como **fornecedor@vmo.com**.
2. Abra a solicitação em **Meus Projetos** → **Ver**.
3. Clique em **Aceitar** e anexe **uma** das propostas:
   - **`02_PROPOSTA_OK.xlsx`** → segue normal, card verde "Proposta enviada".
   - **`03_PROPOSTA_ATENCAO.xlsx`** → abre **popup amarelo** pedindo revisão.
   - **`04_PROPOSTA_DIVERGENTE.xlsx`** → abre **popup vermelho** de divergência.
4. No popup, você pode **substituir** o arquivo por outro e reenviar.

### 5. Solicitante e Controle — conferir o resultado
1. Login como **solicitante@vmo.com** (ou controle@vmo.com).
2. Abra a solicitação. Você verá o bloco **De-Para APF — Proposta vs. Estimativa**:
   - Estimativa inicial × Proposta do fornecedor × Variação.
   - Valores em R$ de cada lado.
   - **Parecer** e **alçada requerida** (vindos das faixas configuradas).
3. O **solicitante** decide: **Aceitar** ou **Recusar** a proposta.

---

## Observação importante sobre os números

A **estimativa inicial é gerada por inteligência artificial** a partir da entrada,
então o valor exato pode variar conforme o **modelo** (`OPENAI_MODEL`). Para esta entrada, a IA
gera **≈ 58 PF** de forma estável com `gpt-4o` (`temperature=0`). As propostas SFP foram
calibradas para 58 PF. *(As entradas/propostas de APF e NESMA também foram geradas com o mesmo
modelo — ver seções acima.)*

**Se a sua estimativa sair diferente de 58** (ex.: trocou o modelo ou editou a entrada) e quiser
que os rótulos OK / ATENÇÃO / DIVERGENTE batam com exatidão, fixe a estimativa manualmente:
1. Como **controle@vmo.com**, abra a solicitação.
2. No bloco **Contagens APF**, exclua a contagem `[Auto]` gerada pela IA (ícone de lixeira).
3. Clique em **Nova contagem** e crie uma contagem de exatamente **58 PF** vinculada à solicitação.

A partir daí, as três propostas produzem variações de **0% / +23% / +90%** garantidas.
