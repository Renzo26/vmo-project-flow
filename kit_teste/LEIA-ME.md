# Kit de Teste — Fluxo Completo VMO

Este kit contém os documentos para testar o fluxo de ponta a ponta:
solicitante → controle econômico → fornecedor → motor De-Para APF.

## Arquivos

| Arquivo | Quem usa | Para quê |
|---|---|---|
| `01_ENTRADA_PF_(SFP).xlsx` | **Solicitante** | Anexar ao criar a solicitação. O motor de IA lê e gera a contagem inicial (estimativa ≈ **77 PF**). |
| `02_PROPOSTA_OK.xlsx` | **Fornecedor** | Proposta com 77 PF → variação **~0%** → **verde (dentro do esperado)**, sem popup. |
| `03_PROPOSTA_ATENCAO.xlsx` | **Fornecedor** | Proposta com 95 PF → variação **~+23%** → **amarelo (atenção)** + popup. |
| `04_PROPOSTA_DIVERGENTE.xlsx` | **Fornecedor** | Proposta com 146 PF → variação **~+90%** → **vermelho (divergente)** + popup. |

> ⚠️ A estimativa (77 PF) × R$/PF (820) = **R$ 63.140**, que ultrapassa o teto padrão de
> **R$ 50.000** — por isso o alerta vermelho de teto aparece. Isso é **esperado e correto**
> (demonstra o recurso de teto da alçada). Se quiser o cenário OK **totalmente verde**,
> aumente o **Teto da alçada CE** para `100000` em Configurar APF.

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
   (estimativa ≈ **77 PF** — a IA conta como AL todas as entidades internas da planilha).

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
então o valor exato pode variar. Para esta entrada, a IA gera **≈ 77 PF** de forma
estável (roda com `temperature=0`). As três propostas foram calibradas para 77 PF.

**Se a sua estimativa sair diferente de 77** (ex.: você editou a entrada) e quiser que os
rótulos OK / ATENÇÃO / DIVERGENTE batam com exatidão, fixe a estimativa manualmente:
1. Como **controle@vmo.com**, abra a solicitação.
2. No bloco **Contagens APF**, exclua a contagem `[Auto]` gerada pela IA (ícone de lixeira).
3. Clique em **Nova contagem** e crie uma contagem de exatamente **77 PF** vinculada à solicitação.

A partir daí, as três propostas produzem variações de **0% / +23% / +90%** garantidas.
