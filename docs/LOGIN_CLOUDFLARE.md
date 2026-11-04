# Login do app (Cloudflare Workers)

O app é publicado como Worker com arquivos estáticos: `wrangler.jsonc` aponta para `worker.js`, que passa cada requisição pelo login de `functions/_middleware.js` antes de servir o arquivo. `.assetsignore` deixa de fora o código-fonte, os scripts e a documentação. Cada envio ao GitHub publica de novo pelo Workers Builds.

O arquivo `functions/_middleware.js` protege todo o site, incluindo o PDF do guia. Só entra quem comprou o produto principal (sistema Loop) na Hotmart: a pessoa digita o e-mail da compra, recebe um código de 6 dígitos e fica conectada por 60 dias. A situação da compra é reconferida uma vez por dia, então reembolso e chargeback tiram o acesso sozinhos. Não há limite de usuários.

## Configuração (Workers & Pages > cliniloop > Settings)

O banco de acessos (KV) entra em `wrangler.jsonc`, com o ID do namespace, porque cada publicação refaz as ligações a partir desse arquivo. Segredos e variáveis de texto ficam no painel (`keep_vars` mantém as variáveis).

| Tipo | Nome | Valor |
|---|---|---|
| KV binding | `ACESSOS` | um namespace KV criado em Workers & Pages > KV |
| Secret | `SESSION_SECRET` | texto aleatório longo (ex.: 48 caracteres) |
| Secret | `RESEND_API_KEY` | chave da conta Resend |
| Secret | `HOTMART_HOTTOK` | hottok mostrado na Hotmart em Ferramentas > Webhook |
| Variável | `EMAIL_FROM` | `CliniLoop <acesso@SEU-DOMINIO>` (domínio verificado no Resend) |
| Variável | `APP_PRODUCT_IDS` | id do produto principal na Hotmart; vários separados por vírgula. Os order bumps não entram aqui |
| Variável | `ACCESS_DAYS` | `0` = sem prazo; `365` = 12 meses |
| Variável | `ADMIN_EMAILS` | e-mails de administrador (vírgula, ponto e vírgula ou quebra de linha). Administradores entram sempre e abrem o painel `/auth/admin` |

Nunca defina `DEV_ECHO_CODE` em produção: ele só serve para teste local e mostra o código na tela.

## Webhook na Hotmart

URL: `https://SEU-DOMINIO/hotmart/webhook`, versão 2.0, eventos: Compra aprovada, Compra completa, Reembolso, Chargeback, Cancelada, Protesto.

## Por que um e-mail não recebe o código

Só recebe código quem está em `ADMIN_EMAILS` ou tem acesso ativo no banco (compra aprovada pela Hotmart ou liberação manual). Para qualquer outro e-mail, a tela diz "Se este e-mail tiver uma compra aprovada..." e nenhum e-mail sai. É de propósito: a tela não revela quem comprou.

Se o e-mail tem acesso e mesmo assim aparece "Não consegui enviar o e-mail agora", o problema é o Resend: o remetente `onboarding@resend.dev`, ou um domínio ainda não verificado, só entrega para o e-mail dono da conta Resend. O motivo exato fica em Workers & Pages > cliniloop > Logs ("Resend recusou o envio").

## Painel de acessos

`https://clini.loopuniversity.com.br/auth/admin`, só para quem está em `ADMIN_EMAILS` e já entrou no app. Consulta por que um e-mail entra ou não, libera acesso manual (com ou sem prazo), retira acesso e lista todos os acessos. Mostra também quais variáveis e segredos estão configurados, sem exibir os valores.

## Rotas

- `/auth/login`: tela de entrada. Qualquer página protegida sem sessão também mostra a tela, com status 401 (assim o service worker não guarda a tela no lugar do app).
- `POST /auth/codigo` e `POST /auth/entrar`: pedido e conferência do código (5 pedidos por hora e 5 tentativas por código).
- `/auth/sair`: encerra a sessão.
- `/auth/admin` e `POST /auth/admin/{consulta,liberar,retirar,lista}`: painel de acessos.
- `POST /hotmart/webhook`: libera ou retira o acesso.

## Teste local

Crie `.dev.vars` (não vai para o Git) com as variáveis acima e `DEV_ECHO_CODE=1`, e rode `npx wrangler pages dev . --kv ACESSOS`.
