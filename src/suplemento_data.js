
  // ===================== Suplemento do guia digital: plano de 30 dias, marcos e exemplos =====================
  // Persona fictícia usada nos exemplos: Dra. Bia Nunes, nutricionista esportiva, Pinheiros (São Paulo). Nada aqui é caso real.

  const PLANO30 = [
    { sem: 1, tema: 'Base e regras', parte: '1 a 3', dias: [
      { d: 1, tool: 'config', min: 25, titulo: 'Defina o objetivo e o perfil', acao: 'Preencha "Comece aqui": uma frase com o resultado que você quer (serviço, número, prazo), tipo de profissional, cidade, serviços e sua história profissional.', entrega: 'Perfil do consultório salvo no app.' },
      { d: 2, tool: 'etica', min: 25, titulo: 'Conheça os limites do seu conselho', acao: 'Leia o quadro do seu conselho e cole a bio e os três últimos posts no Verificador ético.', entrega: 'Lista do que corrigir antes de qualquer divulgação.' },
      { d: 3, tool: 'publico', min: 30, titulo: 'Escreva as dúvidas reais dos pacientes', acao: 'Liste 10 perguntas que você ouviu no consultório nesta semana, nas palavras dos pacientes, sem nomes. Gere o ICP e a persona.', entrega: '10 dúvidas e um paciente ideal descrito.' },
      { d: 4, tool: 'nicho', min: 30, titulo: 'Escolha uma proposta de valor', acao: 'Liste formações e métodos, gere a análise de nicho e escolha uma frase de diferencial que você consiga provar com o que já fez.', entrega: 'Uma frase de proposta de valor guardada.' },
      { d: 5, tool: 'perfil', min: 30, titulo: 'Atualize bio, Google e LinkedIn', acao: 'Cole os perfis atuais, gere a auditoria, aplique a nova bio do Instagram, o Perfil da Empresa no Google e o título do LinkedIn.', entrega: 'Três perfis atualizados e com link para agendar.' }
    ] },
    { sem: 2, tema: 'Conteúdo que atrai', parte: '4 e 5', dias: [
      { d: 6, tool: 'pautas', min: 30, titulo: 'Monte as pautas', acao: 'Gere palavras-chave e 30 pautas a partir das dúvidas do dia 3. Marque quatro para este mês.', entrega: 'Calendário com 4 pautas e a frequência que você aguenta manter.' },
      { d: 7, tool: 'roteiro', min: 30, titulo: 'Roteirize o primeiro Reel', acao: 'Gere o roteiro da pauta 1 com cinco ganchos. Escolha um e ajuste a fala para o seu jeito.', entrega: 'Roteiro pronto para gravar.' },
      { d: 8, tool: 'roteiro', min: 30, titulo: 'Grave', acao: 'Grave a pauta 1 com o celular, luz natural, áudio limpo. Se tiver energia, grave a pauta 2 na sequência.', entrega: 'Um ou dois vídeos gravados.' },
      { d: 9, tool: 'etica', min: 20, titulo: 'Verifique e publique', acao: 'Passe legenda e vídeo pelo Verificador ético, inclua nome, registro e especialidade, publique e registre no Diário de conteúdo.', entrega: 'Primeiro conteúdo no ar e registrado.' },
      { d: 10, tool: 'reaproveitamento', min: 30, titulo: 'Reaproveite', acao: 'Escolha uma aula, podcast ou entrevista em que você falou bem, cole a transcrição e gere carrossel, guia e Reel.', entrega: 'Um conjunto de peças para as próximas semanas.' }
    ] },
    { sem: 3, tema: 'Atendimento e colegas', parte: '6, 8, 9 e 11', dias: [
      { d: 11, tool: 'atendimento', min: 30, titulo: 'Prepare as respostas rápidas', acao: 'Gere as 12 respostas rápidas, ajuste ao seu tom e salve no WhatsApp Business.', entrega: '12 mensagens salvas.' },
      { d: 12, tool: 'atendimento', min: 25, titulo: 'Defina como e quando responde', acao: 'Escreva a saudação e a mensagem de ausência, e decida o horário em que você responde novos contatos.', entrega: 'Regra de resposta escrita e configurada.' },
      { d: 13, tool: 'rastreador', min: 30, titulo: 'Registre quem já entrou em contato', acao: 'Cadastre no Rastreador todos os contatos abertos dos últimos 30 dias, com origem, etapa e consentimento. Defina o próximo passo de cada um.', entrega: 'Todos os contatos abertos com próximo passo e data.' },
      { d: 14, tool: 'colegas', min: 30, titulo: 'Comece a rede de colegas', acao: 'Cadastre 10 colegas que atendem o mesmo paciente antes ou depois de você. Gere a carta e envie para os 3 mais próximos.', entrega: '10 colegas mapeados e 3 cartas enviadas.' },
      { d: 15, tool: 'atendimento', min: 30, titulo: 'Confirmação e retomadas', acao: 'Gere o texto de confirmação com data e local, e as retomadas de 1, 3 e 7 dias. Use em todos os agendamentos a partir de hoje.', entrega: 'Sequência de confirmação em uso.' }
    ] },
    { sem: 4, tema: 'Medir e ajustar', parte: '11, 13 e 14', dias: [
      { d: 16, tool: 'painel', min: 20, titulo: 'Segunda rodada de conteúdo', acao: 'Publique o 2º e o 3º conteúdos e registre no Diário. Responda cada comentário e mensagem no mesmo dia.', entrega: '3 conteúdos registrados.' },
      { d: 17, tool: 'assistente', min: 25, titulo: 'Faça o ritual da semana', acao: 'Importe as pendências no Assistente e gere a agenda em blocos para a semana.', entrega: 'Agenda da semana pronta.' },
      { d: 18, tool: 'painel', min: 30, titulo: 'Lance os números e ache o gargalo', acao: 'Preencha os números da semana e leia "As sete decisões": em qual delas o paciente está se perdendo?', entrega: 'Um gargalo identificado.' },
      { d: 19, tool: 'painel', min: 30, titulo: 'Corrija uma coisa só', acao: 'Escolha um ajuste: o gancho, a bio, a resposta rápida ou o lembrete. Mude e anote a data para comparar.', entrega: 'Um ajuste feito, com data.' },
      { d: 20, tool: 'ebook', min: 30, titulo: 'Revise o mês e planeje o próximo', acao: 'Gere o playbook. Compare com os marcos desta página e decida o foco dos próximos 30 dias. Só pense em anúncios se a base estiver pronta.', entrega: 'Playbook e plano dos próximos 30 dias.' }
    ] }
  ];

  // Marcos de processo para o fim dos dias 30, 60 e 90. São metas de partida para planejar, não médias de mercado.
  const MARCOS = [
    { fase: 'Dia 30', itens: [
      'Bio, Google e LinkedIn revisados e aprovados no Verificador ético.',
      '8 a 12 conteúdos publicados e registrados no Diário (2 a 3 por semana).',
      '100% dos contatos novos registrados no Rastreador, com origem e consentimento.',
      'Tempo de resposta a novos contatos que você consegue manter (meça a mediana).',
      'Confirmação enviada em 100% dos agendamentos.',
      '10 colegas mapeados e 3 cartas enviadas.'
    ] },
    { fase: 'Dia 60', itens: [
      'Taxa de agendamento (agendados ÷ contatos novos) medida há pelo menos 4 semanas: esse é o seu ponto de partida.',
      'Taxa de comparecimento (atendidos ÷ agendados) medida, com as faltas anotadas.',
      'Uma indicação recebida de colega, ou 3 colegas com conversa marcada.',
      'Um ajuste testado por vez, com data de início e de leitura.'
    ] },
    { fase: 'Dia 90', itens: [
      'Pelo menos um colega ativo (indicou nos últimos 90 dias).',
      'Resultado do objetivo que você escreveu no dia 1, comparado com a sua própria linha de base.',
      'Melhora na etapa que mais perdia pacientes (agendamento, comparecimento ou plano), em relação ao dia 30.',
      'Decisão sobre anúncios, só com a base de atendimento e registro funcionando.'
    ] }
  ];

  const EXEMPLOS_LIVRO = {
    auditoria: {
      entrada: 'Instagram atual: "Nutri 💪 Emagreça com saúde | Resultados reais | Agende já ⬇️". Sem cidade, sem registro, link para um grupo de WhatsApp.',
      saida: `INSTAGRAM
1. O que impede de confiar: "Resultados reais" promete resultado sem mostrar nada, e o CFN restringe esse tipo de promessa. Faltam nome do conselho, número de registro e especialidade.
2. O que impede de agendar: não diz onde você atende nem para quem. O link leva a um grupo, não a uma conversa direta.
3. Correção: tirar a promessa, trocar "Nutri" por "Nutricionista esportiva", incluir CRN, bairro e um link direto para o WhatsApp.

Bio sugerida (108 caracteres):
Nutricionista esportiva (CRN-3 00000) | Corredores de 30 a 50 anos | Pinheiros, SP | Agende pelo WhatsApp ⬇️

LINKEDIN (título, 99 caracteres)
Nutricionista esportiva | Alimentação para corredores amadores | Pinheiros, São Paulo | CRN-3 00000

GOOGLE (Perfil da Empresa)
Consultório de nutrição esportiva em Pinheiros, São Paulo. Consultas presenciais e online para corredores amadores, com plano alimentar por escrito e reavaliações. Nutricionista responsável: Bia Nunes, CRN-3 00000.

PENDÊNCIAS: confirmar o número do CRN; conferir se o horário e o endereço do Google estão atualizados.`,
      revisar: ['Troque o CRN fictício pelo seu.', 'Confira cada frase com a norma vigente do seu conselho.', 'Não use "referência", "melhor" ou "especialista" sem título que comprove.']
    },
    reel: {
      entrada: 'Dúvida: "Preciso tomar gel durante uma corrida de 10 km?" Tema: energia em provas curtas. Momento: pesquisa. Palavra-chave: nutrição para corrida de rua. Cidade: São Paulo.',
      saida: `ROTEIRO 1 (45 s)
Abertura, texto na tela: "Gel numa corrida de 10 km: precisa mesmo?"
Resposta curta (fala): "Para a maioria das pessoas que corre 10 km em menos de uma hora, a refeição de antes e a hidratação costumam bastar. Depende do seu ritmo, do jejum e de como você se sente."
Demonstração: mostrar um café da manhã de 2 a 3 horas antes da prova, em prato real, sem marcas.
Limite da orientação: "Isso é informação geral. Se você tem uma condição de saúde ou usa medicamento, combine o plano com seu nutricionista."
CTA único: "Quer montar a sua estratégia de prova? Chame no WhatsApp pelo link da bio."
Final que retoma a abertura: "Então, gel em 10 km? Depende, e dá para decidir com tranquilidade."
Legenda: "Gel em corrida de 10 km: quando faz sentido. Nutrição para corrida de rua em São Paulo. Bia Nunes, nutricionista, CRN-3 00000."

ROTEIROS 2 E 3 (títulos): "Café da manhã antes de correr: o que muda com a distância"; "Cãibra na corrida: o que é mito e o que vale conversar com o profissional".

PENDÊNCIAS: [PENDENTE DE VALIDAÇÃO] "menos de uma hora" e "2 a 3 horas antes" precisam de fonte (posicionamento de sociedade de medicina esportiva ou de nutrição); autorização para qualquer pessoa que apareça no vídeo; sem marca de produto no prato.`,
      revisar: ['Valide cada afirmação clínica com uma fonte antes de gravar.', 'Não use preço, promoção nem "antes e depois".']
    },
    episodio: {
      entrada: 'Transcrição de uma aula de 40 minutos para um clube de corrida (trechos). Papel: palestrante. Público: corredores amadores. Objetivo: levar à primeira conversa.',
      saida: `1. IDEIAS APROVEITÁVEIS (trecho)
- "Eu vejo gente treinando bem e comendo mal antes da prova longa." Quem disse: a palestrante, minuto 06. Síntese fiel: o preparo alimentar da véspera costuma ser menos planejado que o treino. Exemplo da fonte: o jantar de véspera em um clube. Ressalva: depende do histórico de cada pessoa.
- "O gel não é obrigatório." Minuto 18. Síntese: o uso depende do tempo de prova e do ritmo. Ressalva: não vale para quem tem restrição clínica.

2. TEMA CENTRAL ESCOLHIDO: o que comer na véspera e na manhã da prova.
Carrossel (6 cards): 1 "Véspera de prova: o erro mais comum" | 2 "Por que o jantar importa" | 3 "O que a maioria faz" | 4 "O que costuma ajudar" | 5 "Quando ajustar com o profissional" | 6 "Salve para a véspera". Legenda com identificação profissional.
Guia (resumo): para quem (corredores de 5 a 21 km), problema (ansiedade sobre a véspera), 4 passos, um exemplo da aula, checklist de 6 itens.
Reel 30 a 45 s, duas versões: roteiro falado e tópicos de gravação.

3. PENDÊNCIAS: fonte das orientações sobre a véspera; confirmar autoria das frases; link do guia; conferir norma do CFN sobre imagens de alimentos de marcas.`,
      revisar: ['Confirme que cada citação está fiel ao trecho original.', 'Remova telefones e e-mails da transcrição antes de colar (o app já troca por marcadores).']
    },
    carta: {
      entrada: 'Profissão: nutricionista. Área: nutrição esportiva. Colega: ortopedista da região de Pinheiros. Canal: WhatsApp profissional.',
      saida: `Olá, Dr. Rafael, tudo bem? Sou Bia Nunes, nutricionista esportiva (CRN-3 00000), com consultório em Pinheiros. Atendo corredores amadores e pessoas que voltam a treinar depois de lesão. Escrevo porque, nos casos em que a alimentação interfere na recuperação ou no desempenho, o encaminhamento pode ajudar o seu paciente a seguir o tratamento com mais segurança. Para encaminhar, basta me enviar o nome e o contato do paciente pelo WhatsApp, com autorização dele. Depois da avaliação e da alta, você recebe um relatório com os achados e a conduta. Posso lhe apresentar o consultório num café de 15 minutos? Agradeço a atenção.`,
      revisar: ['Ajuste ao seu estilo e à sua relação com o colega.', 'Nada de vantagem, desconto ou comissão pela indicação.']
    },
    contrarref: {
      entrada: 'Anotações (sem identificação): paciente M.S., 38 anos, encaminhada pelo Dr. Rafael por tendinopatia; avaliação: ingestão proteica abaixo da orientação, jejum prolongado antes dos treinos; conduta: plano alimentar com ajuste de refeições; reavaliação em 6 semanas.',
      saida: `Prezado Dr. Rafael,

Agradeço o encaminhamento da paciente M.S., que atendi em consulta de avaliação.
Motivo do encaminhamento: apoio nutricional durante o tratamento de tendinopatia.
Achados da avaliação: ingestão de proteínas abaixo do que se recomenda para o seu nível de atividade e jejum prolongado antes dos treinos.
Conduta proposta: plano alimentar com redistribuição das refeições ao longo do dia e ajuste do horário da refeição pré-treino, em acordo com as suas orientações de carga.
Reavaliação: em seis semanas. Enviarei novo retorno ao final.

Fico à disposição para discutir o caso.
Atenciosamente,
Bia Nunes, nutricionista, CRN-3 00000`,
      revisar: ['Use só iniciais e confirme a autorização do paciente.', 'Revise os achados: o texto deve refletir o que você realmente avaliou.']
    },
    anuncio: {
      entrada: 'Serviço: consulta de nutrição esportiva. Bairro: Pinheiros, São Paulo. Conselho: CFN.',
      saida: `META ADS (trecho)
Textos (até 125 caracteres):
1. "Corre e quer organizar a alimentação? Conheça a consulta de nutrição esportiva em Pinheiros." (92)
2. "Plano alimentar por escrito para quem corre. Atendimento presencial ou online." (78)
3. "Dúvidas sobre o que comer antes de correr? Converse com uma nutricionista." (74)
Títulos (até 40): "Nutrição para corredores" | "Consulta em Pinheiros" | "Fale pelo WhatsApp"
CTA: Enviar mensagem.

GOOGLE (trecho)
Títulos (até 30): "Nutrição esportiva Pinheiros" | "Nutricionista para corredores" | "Consulta online ou presencial" | "Agende pelo WhatsApp"
Descrições (até 90): "Consulta com nutricionista esportiva em Pinheiros. Plano alimentar por escrito." | "Atendimento presencial e online para quem corre. CRN-3 00000."
Palavras-chave (amostra): nutricionista esportiva pinheiros; nutricionista para corredor sp; consulta nutrição esportiva online
Negativas (amostra): emagrecer rápido; dieta milagrosa; receita grátis; vaga de emprego; curso

CHECAGEM: nenhum superlativo, nenhuma promessa, nenhuma afirmação sobre a condição de saúde do usuário.`,
      revisar: ['Confira os limites de caracteres no gerenciador de anúncios.', 'Leia as políticas de saúde da Meta e do Google vigentes antes de enviar.']
    },
    impulso: {
      entrada: 'Post: Reel "3 erros na hidratação de quem corre". Objetivo: mensagens no WhatsApp. Orçamento: R$ 140.',
      saida: `1. Adequação: o post serve, com dois ajustes: tirar "erros graves" do título (sensacionalismo) e colocar nome, CRN e especialidade na legenda.
2. Público: moradores e frequentadores de Pinheiros, Vila Madalena e Alto de Pinheiros (raio de 5 km), 28 a 55 anos. Sem segmentar por condição de saúde, peso ou doença.
3. Orçamento: R$ 20 por dia durante 7 dias, mantido igual para não reiniciar o aprendizado.
4. Mensagem de boas-vindas: "Olá! Aqui é a equipe da Dra. Bia Nunes. Como podemos ajudar? Se for sobre consulta, conte brevemente o motivo (sem dados de saúde)."
5. O que medir: no dia 3 e no dia 7, anote no Rastreador quantas mensagens vieram do anúncio (origem "Impulsionamento"), quantas viraram conversa, quantas agendaram. Compare com um período sem anúncio.`,
      revisar: ['O número de dias e o valor são ponto de partida, não garantia.', 'Se o orçamento não permite um período de teste, prefira 3 posts orgânicos antes de impulsionar.']
    },
    respostas: {
      entrada: 'Clínica: Consultório Bia Nunes. Profissão: nutricionista.',
      saida: `1. Boas-vindas: "Olá! Aqui é do consultório da nutricionista Bia Nunes. Como posso ajudar?"
2. Motivo: "Para eu indicar o melhor caminho, pode contar em uma frase o que você procura? Não precisa dar detalhes de saúde por aqui."
3. Primeira consulta: "A primeira consulta dura cerca de 60 minutos e termina com um plano alimentar por escrito."
4. Convênios: "Atendemos como particular. Posso emitir recibo para pedido de reembolso."
5. Valores: "O valor da consulta é R$ [VALOR]." [CONFIRMAR se o CFN permite informar o valor no seu caso]
6. Endereço: "Atendemos na Rua [RUA], Pinheiros, a 5 minutos do metrô. Posso enviar a localização."
7. Online: "Sim, atendemos também por videochamada, com o mesmo plano por escrito."
8. Dois horários: "Tenho terça às 18h ou quinta às 8h30. Qual fica melhor?"
9. Confirmação: "Agendado: [DIA], [HORA], [LOCAL]. Se precisar remarcar, é só responder aqui."
10. Fora do horário: "Recebi sua mensagem. Respondo amanhã a partir das 9h."
11. Retomada em 1 dia: "Oi, [NOME]! Ficou alguma dúvida sobre a consulta? Posso ajudar."
12. Retomada em 7 dias: "Oi, [NOME]! Passando para saber se ainda faz sentido conversarmos. Se preferir, fico à disposição quando quiser."`,
      revisar: ['Cada mensagem deve soar como você.', 'Evite pressão e urgência artificial.']
    },
    plano: {
      entrada: 'Anotações técnicas: M.S., meta de completar os 10 km em prova; hoje corre 5 km; 3 treinos por semana; refeições irregulares; 8 semanas de plano; reavaliação com 4 e 8 semanas.',
      saida: `SEU PLANO (iniciais: M.S.)
Seu objetivo: chegar à sua primeira prova de 10 km com energia e confiança na alimentação.

Fase 1, semanas 1 a 4: regularizar as refeições
- Meta: fazer 4 refeições ao dia em horários combinados.
- Meta: incluir uma fonte de proteína no café da manhã.
Fase 2, semanas 5 a 8: preparar a prova
- Meta: testar a refeição pré-treino nos treinos longos.
- Meta: definir o plano da véspera e da manhã da prova.

Sessões: 3 consultas no total (início, semana 4 e semana 8), de cerca de 45 a 60 minutos. Os ajustes entre consultas serão feitos por mensagem, em horário combinado.
O que depende de você: registrar as refeições em um caderno ou aplicativo e avisar mudanças no treino.
Reavaliação: nas semanas 4 e 8.
Alta: quando as metas das duas fases estiverem estáveis por duas semanas.
O resultado de cada pessoa é diferente; este plano organiza o caminho, sem garantir um resultado.

[CONFIRMAR] valor das consultas e forma de pagamento.`,
      revisar: ['Revise as metas com o seu critério clínico.', 'Entregue ao paciente por escrito e guarde a versão assinada, se for o seu procedimento.']
    },
    registro: {
      entrada: 'Conversa de WhatsApp (fictícia): "Oi, vi seu vídeo sobre hidratação, vocês atendem corredor? Moro na Vila Madalena." / "Atendemos sim! Qual seu objetivo?" / "Quero me preparar para uma meia maratona em dezembro." / "Perfeito. Tenho terça 18h ou quinta 8h30." / "Vou ver minha agenda e te aviso."',
      saida: `REGISTRO
Nome: [perguntar]
Origem: Instagram orgânico (Reel de hidratação)
Serviço de interesse: consulta de nutrição esportiva
Profissional indicado: Dra. Bia Nunes
Etapa do funil: Em conversa
Próximo passo: retomar com um lembrete útil, em 2 dias
Aprendizado: o contato chegou por vídeo educativo e já disse o objetivo; dar dois horários ajudou a conversa avançar.

PRÓXIMA MENSAGEM (até 400 caracteres):
"Oi! Passando para lembrar que tenho terça às 18h ou quinta às 8h30, se quiser conversar sobre a preparação para a meia maratona. Se ainda não souber a agenda, sem problema: me avise quando puder, e eu reservo o horário por 24 horas."`,
      revisar: ['Não registre dados clínicos.', 'Cadastre o consentimento por finalidade no Rastreador.']
    },
    campanha: {
      entrada: 'Duração: 14 dias. Serviço: consulta de nutrição esportiva. Objetivo: 8 pacientes agendados. Orçamento: R$ 30 por dia.',
      saida: `1. FICHA
Objetivo: 8 consultas agendadas em 14 dias. Público: corredores de 30 a 50 anos num raio de 5 km de Pinheiros. Mensagem central: "Organize a alimentação para correr com mais tranquilidade." Canais: Reels, WhatsApp, Meta (mensagens). Medição: mensagens, conversas, agendamentos, comparecimento, por origem.

2. REELS (títulos): "O que comer na véspera" | "Gel: precisa?" | "Café da manhã antes do treino longo"
3. CARROSSEL (7 slides): capa, problema, 3 erros comuns, o que costuma ajudar, quando procurar profissional, convite.
4. ANÚNCIOS: ver exemplo do anúncio.
5. WHATSAPP: boas-vindas e 3 respostas rápidas (ver exemplo de respostas rápidas).
6. CALENDÁRIO (trecho): dia 1 Reel 1 | dia 3 carrossel | dia 5 Reel 2 e início do impulsionamento | dia 7 leitura dos números | dia 10 Reel 3 | dia 14 balanço.
7. CHECAGEM [CONFIRMAR]: CFN não permite promoção nem sorteio como publicidade; sem imagem corporal; sem marcas; LGPD: consentimento no primeiro contato; políticas de saúde da Meta.

[CONFIRMAR] orçamento total (R$ 420), prazo de resposta que você consegue cumprir, horários disponíveis.`,
      revisar: ['Só rode campanha com atendimento e registro funcionando.', 'A meta de 8 consultas é um exemplo: use a sua linha de base.']
    },
    verificador: {
      entrada: 'Texto: "Perca 10 kg em 30 dias com o meu protocolo! Resultado garantido, veja o antes e depois das minhas pacientes. Só esta semana, 30% de desconto na consulta."',
      saida: `FRASE A FRASE
1. "Perca 10 kg em 30 dias": promessa de resultado e meta de peso; o CFN restringe.
2. "com o meu protocolo": sugere método exclusivo, sem comprovação.
3. "Resultado garantido": promessa de resultado.
4. "veja o antes e depois das minhas pacientes": exposição de pacientes e imagem corporal atribuindo resultado.
5. "Só esta semana, 30% de desconto": promoção, vedada como publicidade pelas normas aplicáveis.
6. Falta identificação: nome, CRN e especialidade.

VERSÃO CORRIGIDA
"Quer organizar a sua alimentação com acompanhamento? Na consulta de nutrição, avaliamos a sua rotina e montamos um plano por escrito. O resultado é diferente para cada pessoa. Bia Nunes, nutricionista, CRN-3 00000. Agende pelo WhatsApp."

Esta revisão não substitui a consulta à norma vigente.`,
      revisar: ['Confirme a regra mais atual no site do seu conselho.', 'Quando houver dúvida, pergunte ao conselho ou a um advogado.']
    }
  };
