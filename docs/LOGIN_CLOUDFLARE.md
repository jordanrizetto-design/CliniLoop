# Login do app (Cloudflare Pages)

O arquivo `functions/_middleware.js` protege todo o site, incluindo o PDF do guia. Só entra quem comprou o produto principal (sistema Loop) na Hotmart: a pessoa digita o e-mail da compra, recebe um código de 6 dígitos e fica conectada por 60 dias. A situação da compra é reconferida uma vez por dia, então reembolso e chargeback tiram o acesso sozinhos. Não há limite de usuários.

## Configuração (Pages > projeto > Settings)

| Tipo | Nome | Valor |
|---|---|---|
| KV binding | `ACESSOS` | um namespace KV criado em Workers & Pages > KV |
| Secret | `SESSION_SECRET` | texto aleatório longo (ex.: 48 caracteres) |
| Secret | `RESEND_API_KEY` | chave da conta Resend |
| Secret | `HOTMART_HOTTOK` | hottok mostrado na Hotmart em Ferramentas > Webhook |
| Variável | `EMAIL_FROM` | `CliniLoop <acesso@SEU-DOMINIO>` (domínio verificado no Resend) |
| Variável | `APP_PRODUCT_IDS` | id do produto principal na Hotmart; vários separados por vírgula. Os order bumps não entram aqui |
| Variável | `ACCESS_DAYS` | `0` = sem prazo; `365` = 12 meses |
| Variável | `ADMIN_EMAILS` | seus e-mails de teste, separados por vírgula |

Nunca defina `DEV_ECHO_CODE` em produção: ele só serve para teste local e mostra o código na tela.

## Webhook na Hotmart

URL: `https://SEU-DOMINIO/hotmart/webhook`, versão 2.0, eventos: Compra aprovada, Compra completa, Reembolso, Chargeback, Cancelada, Protesto.

## Rotas

- `/auth/login`: tela de entrada. Qualquer página protegida sem sessão também mostra a tela, com status 401 (assim o service worker não guarda a tela no lugar do app).
- `POST /auth/codigo` e `POST /auth/entrar`: pedido e conferência do código (5 pedidos por hora e 5 tentativas por código).
- `/auth/sair`: encerra a sessão.
- `POST /hotmart/webhook`: libera ou retira o acesso.

## Teste local

Crie `.dev.vars` (não vai para o Git) com as variáveis acima e `DEV_ECHO_CODE=1`, e rode `npx wrangler pages dev . --kv ACESSOS`.
