# Checklist para revisão jurídica e ética do CliniLoop

Para entregar a um advogado com experiência em publicidade em saúde e LGPD. Nada neste produto foi revisado por profissional jurídico até aqui.

## 1. Regras de publicidade resumidas no app
Arquivos: `src/app1.js` (`COUNCILS`, `REGRAS_GERAIS`), `src/app3.js` (verificador ético).
- [ ] CFM: Resolução 2.336/2023 e normas atuais (publicidade, antes e depois, selos, sorteios, telemedicina).
- [ ] CFO: Resolução 196/2019 e alterações (honorários, promoções, imagens, pacotes).
- [ ] CFP, COFFITO (532/2021), CFN (599/2018): conferir o texto e o link de cada fonte.
- [ ] Redação dos "Pode" e "Não pode": há algo permissivo ou restritivo demais?
- [ ] Identificação obrigatória (nome, registro, especialidade, RT): está correta por profissão?

## 2. Rastreador de pacientes e LGPD
- [ ] Nome e telefone são dados pessoais. O app orienta consentimento por finalidade (atendimento, lembretes, conteúdos). Basta?
- [ ] Armazenamento só no navegador do profissional: quais deveres o profissional continua tendo (backup, descarte, computador compartilhado)?
- [ ] O backup (.json) contém dados de contato. O aviso é suficiente?
- [ ] Mensagens de WhatsApp e e-mail de marketing para pacientes e colegas: base legal.
- [ ] Texto do aviso de privacidade e da página de dados (`src/body2.html`).

## 3. Prompts e IA
- [ ] Os prompts evitam nomes e dados clínicos? (o Assistente usa "Contato 1, 2…"; a transcrição troca telefone e e-mail por marcadores)
- [ ] Uso da chave de API do próprio usuário: o aviso de envio de dados à Anthropic é claro?

## 4. Marca e texto
- [ ] Promessas de resultado em `README.md`, na página e no e-book.
- [ ] Uso de "Prompt do Sim" e "JR Tosoni": autorização do autor, direitos autorais.
- [ ] Licença MIT do código e licença do conteúdo do e-book: estão separadas?

## Entrega esperada
Parecer curto com: itens aprovados, itens a corrigir (com o texto sugerido) e a data da revisão. Só depois dele o app pode exibir "revisado em [data] por [nome/OAB]".
