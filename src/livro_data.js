
  // ===================== O Guia CliniLoop =====================
  // Cada parte do guia termina numa caixa "Sinergia CliniLoop". Este bloco é o mapa entre as duas obras.
  const LIVRO = {
    titulo: 'Guia CliniLoop',
    autor: '',
    tese: 'Conhecimentos dirigidos e um app de CRM para conquistar as sete decisões do paciente: olhar, confiar, ser indicado, chamar, agendar, comparecer e seguir o tratamento.',
    ideia: 'Conquistar pacientes é um projeto. Projetos têm objetivo, etapas, registros e revisões. É isso que transforma esforço em resultado.',
    etapas: [
      { n: 1, nome: 'Entenda o jogo e as regras', partes: [1, 2] },
      { n: 2, nome: 'Posicione-se', partes: [3] },
      { n: 3, nome: 'Gere autoridade e demanda', partes: [4, 5, 6, 7] },
      { n: 4, nome: 'Converta contatos em consultas', partes: [8, 9] },
      { n: 5, nome: 'Feche e acompanhe o tratamento', partes: [10] },
      { n: 6, nome: 'Meça e escale com CRM', partes: [11, 12, 13, 14] }
    ],
    partes: {
      0: { titulo: 'Apresentação: Oceano Vermelho e Oceano Azul', etapa: 0, tools: ['nicho'], sinergia: 'Nicho e diferencial', sinTxt: 'As quatro ações do Oceano Azul (eliminar, reduzir, elevar, criar) entram na análise de nicho e na proposta de valor.', pratica: 'Faça as quatro ações do Oceano Azul em relação ao padrão do seu setor: o que eliminar, o que reduzir, o que elevar e o que criar.' },
      1: { titulo: 'A jornada das sete decisões', etapa: 1, tools: ['config', 'painel'], sinergia: 'Configure seu consultório', sinTxt: 'Escolha o tipo de profissional. O app reordena as ferramentas e carrega as regras do conselho certo.', pratica: 'Escreva os sete sins numa folha e, ao lado de cada um, anote quantos pacientes passaram por ele no último mês. Onde você não sabe o número, está o primeiro campo do seu CRM.' },
      2: { titulo: 'Ética primeiro: conselhos e LGPD', etapa: 1, tools: ['etica'], sinergia: 'Verificador ético', sinTxt: 'Cole qualquer post, anúncio ou mensagem e receba os pontos que conflitam com o seu conselho, a LGPD e as políticas da Meta e do Google.', pratica: 'Abra os seus três últimos posts e o seu último anúncio. Confira identificação profissional, ausência de superlativos e de promessa, e exposição de paciente. Corrija ou arquive o que não passar.' },
      3: { titulo: 'Os canais, um a um: manual de configuração', etapa: 2, tools: ['perfil', 'publico', 'profissional', 'nicho', 'formacao'], sinergia: 'Perfis e presença', sinTxt: 'Traz o checklist de configuração de cada canal (Google, Instagram, YouTube, LinkedIn e TikTok) e audita e reescreve bio, título e descrições a partir do Perfil do consultório.', pratica: 'Pesquise seu nome e sua clínica no Google Maps. Se a ficha não existir ou estiver incompleta, crie ou reivindique o Perfil da Empresa no Google e reescreva a bio do Instagram em quatro linhas.' },
      4: { titulo: 'Conteúdo que gera autoridade e alcance', etapa: 3, tools: ['pautas', 'roteiro'], sinergia: 'Pautas e roteiros de conteúdo', sinTxt: 'Transforma dúvidas reais em pautas por tema e gera roteiros de Reels, carrosséis e vídeos com a palavra-chave da sua cidade.', pratica: 'Liste as dez perguntas que você mais ouve no consultório. Escolha uma, encaixe em um dos seus três temas de conteúdo e grave hoje um Reel de 30 segundos com o roteiro em seis tempos.' },
      5: { titulo: 'Reaproveitamento: uma aula, quatro entregas', etapa: 3, tools: ['reaproveitamento'], sinergia: 'Reaproveitamento de conteúdo', sinTxt: 'Cole a transcrição de uma aula ou podcast e receba o registro de ideias, o carrossel, o guia e o Reel em duas versões, com as pendências de fonte, autoria e compliance.', pratica: 'Escolha uma aula, podcast ou entrevista em que você participou bem. Liste as ideias aproveitáveis, com quem disse cada uma, e escolha um tema central para o primeiro conjunto.' },
      6: { titulo: 'A decisão dos colegas: a rede de indicação', etapa: 3, tools: ['colegas'], sinergia: 'Rede de colegas', sinTxt: 'Funil de colegas, carta de apresentação, relatório de contrarreferência e registro de quem indicou cada paciente.', pratica: 'Cadastre no CRM dez colegas que atendem o mesmo paciente antes ou depois de você e envie a carta de apresentação para os três mais próximos.' },
      7: { titulo: 'Anúncios: Meta Ads e Google Ads', etapa: 3, tools: ['campanha'], sinergia: 'Gerador de campanhas', sinTxt: 'Monta o plano de impulsionamento, os textos, títulos, palavras-chave e públicos para Meta Ads e Google Ads e liga cada campanha aos pacientes que ela trouxe.', pratica: 'Antes de investir, confira se o Pixel ou a tag do Google estão instalados e se cada conversa vinda de anúncio chega ao CRM com a origem marcada.' },
      8: { titulo: 'Do clique à consulta: a decisão de agendar', etapa: 4, tools: ['atendimento'], sinergia: 'Atendimento e agendamento', sinTxt: 'Respostas rápidas, roteiro de agendamento e retomadas de quem não marcou, registradas no Rastreador de pacientes.', pratica: 'Cadastre as 12 respostas rápidas no WhatsApp Business e meça, durante uma semana, o tempo da primeira resposta.' },
      9: { titulo: 'A decisão de comparecer', etapa: 4, tools: ['rastreador', 'atendimento'], sinergia: 'Rastreador de pacientes', sinTxt: 'Gera os lembretes de confirmação (.ics) e mostra a taxa de comparecimento por profissional, origem e dia da semana.', pratica: 'Configure a mensagem de confirmação de 48 horas e anote a taxa de faltas deste mês. Ela é a linha de base para o próximo.' },
      10: { titulo: 'A decisão de tratar: fechamento com ética', etapa: 5, tools: ['atendimento', 'rastreador', 'assistente'], sinergia: 'Rastreador e Assistente da semana', sinTxt: 'Destaca planos propostos sem decisão em 2, 7 e 15 dias e monta a agenda de acompanhamentos da semana.', pratica: 'Liste os planos propostos nos últimos 30 dias que não começaram. Para cada um, registre o motivo provável e marque um contato de acompanhamento com data.' },
      11: { titulo: 'O CRM: a gestão do relacionamento com o paciente', etapa: 6, tools: ['rastreador', 'painel', 'assistente', 'ebook'], sinergia: 'Rastreador, Painel e Playbook', sinTxt: 'Funil de sete etapas com próximos passos vencidos, painel semanal com o gargalo e revisões quinzenais agendadas.', pratica: 'Liste de memória os dez últimos pacientes que pediram informação e não agendaram, e os cinco últimos planos propostos. Para quantos você sabe dizer o próximo passo? Esse número é o seu ponto de partida.' },
      12: { titulo: 'O app CliniLoop: guia das ferramentas', etapa: 6, tools: ['config'], sinergia: 'O mapa completo', sinTxt: 'A tabela desta parte cruza cada ferramenta do BuscaLoop, o app do guia original, com o CliniLoop. Ela é a base do desenvolvimento do app.', pratica: 'Preencha o Perfil do consultório uma única vez: profissão, registro, especialidade, cidade, serviços, público ideal e temas de conteúdo. Ele alimenta todas as ferramentas.' },
      13: { titulo: 'Gerador de campanhas e biblioteca de prompts', etapa: 6, tools: ['campanha', 'etica'], sinergia: 'Gerador de campanhas e Verificador ético', sinTxt: 'A ficha da campanha vira um formulário; o resultado passa pelo verificador antes de ir para o ar.', pratica: 'Preencha a ficha de uma campanha para o seu serviço principal e rode o gerador. Passe tudo pelo verificador ético antes de publicar.' },
      14: { titulo: 'Ferramentas para materializar as campanhas', etapa: 6, tools: ['ferramentas', 'rastreador'], sinergia: 'Exportação e lembretes', sinTxt: 'O Rastreador exporta em planilha (.csv) e gera lembretes para Google Agenda ou Outlook, para conversar com as ferramentas que você já usa.', pratica: 'Escolha uma ferramenta por linha, no máximo. Ferramenta demais é registro duplicado, e registro duplicado é paciente esquecido.' }
    }
  };
  // Em que parte do guia cada ferramenta aparece (a primeira é a principal)
  const TOOL_PARTES = {
    config: [1, 12], publico: [3], profissional: [3], nicho: [0, 3], perfil: [3], pautas: [4], roteiro: [4], reaproveitamento: [5],
    formacao: [3], campanha: [7, 13], colegas: [6], atendimento: [8, 10], rastreador: [9, 11], assistente: [10, 11], painel: [11, 1],
    etica: [2, 13], briefing: [14], ferramentas: [14], ebook: [11]
  };
  // "Na prática" específico quando a ferramenta cobre um trecho da parte (texto do guia)
  const TOOL_PRATICA = {
    publico: 'Antes de abrir o aplicativo, responda por escrito: quem deve se interessar pelo seu conteúdo e que problema enfrenta? Gerar conversas para agendar, atrair seguidores qualificados ou levar a um conteúdo completo?',
    profissional: 'Escolha até cinco adjetivos que você quer que o paciente associe a você (por exemplo: claro, acolhedor, técnico, próximo, organizado), uma cor principal e uma ou duas fontes legíveis. Consistência importa mais que sofisticação.',
    formacao: 'Faça a auditoria do LinkedIn: registro no conselho e títulos em Licenças e certificados, título com especialidade, público, prova e local, e ao menos uma prova no Em destaque.',
    assistente: 'Marque um horário fixo, de preferência sexta à tarde, para o ritual semanal de 30 minutos: etapas, caça aos parados, acompanhamentos vencidos, números contra a meta, gargalo e plano da semana.',
    briefing: 'Se for delegar, comece pelo mínimo da Parte 14 e mande o briefing a dois ou três fornecedores. Quem promete seguidores ou pacientes não entende as regras do seu conselho.'
  };

  // As sete decisões (Parte 1)
  const SINS = [
    ['Atenção', 'A pessoa para no seu conteúdo (Reels, Shorts, anúncio, busca no Google).'],
    ['Confiança', 'Ela segue, assiste mais, lê a bio, confere o Google e o LinkedIn.'],
    ['Indicação', 'Um médico, dentista ou fisioterapeuta indica você pelo nome.'],
    ['Contato', 'A pessoa chama no WhatsApp, liga ou preenche um formulário.'],
    ['Agendamento', 'A consulta ou avaliação entra na agenda.'],
    ['Comparecimento', 'O paciente aparece no dia e na hora.'],
    ['Adesão', 'Ele aceita o plano proposto, segue até o fim, retorna e indica outras pessoas.']
  ];

  // A estrutura de um bom prompt e as quatro regras de IA (Introdução)
  const ESTRUTURA_PROMPT = [
    ['Personalidade', 'Diga quem a IA deve ser, por exemplo: "Atue como um profissional de marketing ético, especializado em saúde".'],
    ['Contexto', 'Conte quem você é e para quem é o texto: profissão, especialidade, cidade, público, canal e as regras que valem, como as normas do seu conselho.'],
    ['Tarefa', 'Peça uma coisa só, com um verbo claro: escrever, revisar, listar, resumir, comparar.'],
    ['Formato da resposta', 'Diga como quer receber: tamanho, tom, tópicos, tabela ou número de opções.'],
    ['Limites', 'Diga o que a IA não deve fazer: "não invente dados", "não prometa resultado", "marque com [CONFIRMAR] o que faltar".']
  ];
  const EXEMPLO_PROMPT = 'Atue como um profissional de marketing ético, especializado em comunicação para a saúde. Sou dentista e atendo adultos que têm medo de ir ao dentista. Escreva três legendas curtas para um post do Instagram explicando como é a primeira consulta. Use tom acolhedor e até 60 palavras em cada uma. Siga as normas do CFO, não prometa resultado e não invente informações.';
  const REGRAS_IA = [
    ['Não invente', 'Peça à IA que use só fatos fornecidos e marque com [CONFIRMAR] o que faltar, sobretudo informação clínica.'],
    ['Revise sempre', 'Nada vai para paciente, colega ou anúncio sem leitura do profissional responsável.'],
    ['Proteja dados', 'Nunca cole nome, prontuário, exame ou foto identificável de paciente em um assistente de IA.'],
    ['Mantenha a sua voz', 'Ajuste o texto até soar como você fala no consultório.']
  ];

  // Três temas de conteúdo por profissão (Parte 4): educar, humanizar, desmistificar
  const TEMAS_PROF = {
    medico: ['Quando procurar avaliação, o que levar à primeira consulta', 'Rotina, formação, congressos', 'Mitos e informações falsas sobre a doença'],
    dentista: ['Como funciona cada avaliação e tratamento', 'Bastidores, biossegurança, equipe', 'Mito ou verdade (clareamento, aparelho, implante)'],
    psicologo: ['Psicoeducação: o que é, como se trata', 'Como é uma sessão, o que a terapia não é', 'Estigmas e confusões comuns'],
    fisioterapeuta: ['Como funciona a avaliação, prevenção de lesão', 'Equipe, estrutura, raciocínio clínico com modelo', 'Mitos sobre dor, repouso, coluna'],
    nutricionista: ['Como funciona a consulta e o plano alimentar, leitura de rótulos', 'Rotina do consultório, preparo de refeições sem marcas em destaque', 'Mitos sobre dietas da moda e alimentos "proibidos"']
  };
  TEMAS_PROF.psiquiatra = TEMAS_PROF.psicologo;

  // Quem indica quem (Parte 6)
  const QUEM_INDICA = {
    fisioterapeuta: ['Fisioterapeuta', 'Ortopedistas, reumatologistas, neurologistas, cirurgiões, geriatras, educadores físicos, dentistas (DTM)', 'Médicos especialistas, nutricionistas, psicólogos'],
    dentista: ['Dentista', 'Clínicos gerais, pediatras, otorrinos, fonoaudiólogos, outros dentistas especialistas', 'Médicos, fisioterapeutas (DTM, postura), nutricionistas'],
    medico: ['Médico especialista', 'Clínicos, médicos de família, outros especialistas, dentistas, fisioterapeutas', 'Fisioterapeutas, psicólogos, nutricionistas, outros especialistas'],
    psicologo: ['Psicólogo', 'Psiquiatras, clínicos, pediatras, ginecologistas, escolas, RH de empresas', 'Psiquiatras, médicos, nutricionistas'],
    nutricionista: ['Nutricionista', 'Endocrinologistas, cardiologistas, gastroenterologistas, pediatras, ginecologistas, educadores físicos, psicólogos', 'Médicos, psicólogos, fisioterapeutas']
  };
  QUEM_INDICA.psiquiatra = QUEM_INDICA.medico;

  // Frequência sustentável (Parte 4)
  const FREQUENCIA = [
    ['Profissional sozinho', '2 Reels + 1 carrossel por semana, Stories em dias de atendimento', '1 vídeo por mês', '1 post por semana'],
    ['Clínica com equipe', '3 Reels + 2 carrosséis por semana, Stories diários', '2 a 4 vídeos por mês', '2 posts por semana']
  ];

  // Checklists de configuração de cada canal (Parte 3)
  const CANAIS_CHECK = [
    ['google', 'Perfil da Empresa no Google', 'Primeiro', [
      'Conta Google da clínica, não a pessoal; se a clínica já aparece no Maps, reivindique a ficha em vez de criar outra',
      'Nome exatamente como na fachada e nos documentos, sem palavras extras',
      'Categoria principal precisa ("Dentista", "Fisioterapeuta", "Psicólogo", "Nutricionista", "Médico") e secundárias',
      'Endereço, telefone, WhatsApp, página de agendamento e horários, incluindo feriados',
      'Verificação feita (vídeo, ligação, SMS, e-mail ou carta)',
      'Fotos reais de fachada, recepção, salas e equipe, logotipo e capa; nunca fotos de pacientes',
      'Serviços com descrição informativa e atributos (acessibilidade, estacionamento)',
      'Avaliações pedidas de forma neutra a todos os pacientes, e todas respondidas sem confirmar que a pessoa é paciente'
    ]],
    ['instagram', 'Instagram', 'Primeiro', [
      'Conta profissional com a categoria correta',
      'Foto com rosto nítido e próximo, fundo simples, luz frontal (clínica: logotipo legível)',
      'Nome de usuário curto, fácil de soletrar e igual nos outros canais',
      'Nome do perfil com nome + especialidade em palavras que o paciente pesquisa',
      'Credenciais corretas do seu conselho na página principal',
      'Bio em quatro linhas: quem você ajuda, com o quê, onde atende e o registro profissional',
      'Link com um destino só (WhatsApp com mensagem pronta ou página de agendamento), com origem rastreada',
      'Destaques: Comece aqui, Como funciona a consulta, Convênios e valores (quando permitido), Localização, Dúvidas, Equipe',
      'Até três posts fixados que apresentam você e respondem às dúvidas mais comuns',
      'Conta vinculada à página do Facebook da clínica e ao WhatsApp Business'
    ]],
    ['youtube', 'YouTube', 'Segundo', [
      'Canal com a conta Google da clínica, com o mesmo nome do Instagram',
      'Foto, banner com especialidade e cidade, descrição com proposta de valor, registro e links para agendamento',
      'Canal verificado com o número de telefone',
      'Playlists por problema do paciente, não por formato',
      'Vídeo de apresentação fixado: quem você é, quem atende, como é a primeira consulta',
      'Em cada vídeo: título com a dúvida pesquisada, link de agendamento nas duas primeiras linhas e capítulos'
    ]],
    ['linkedin', 'LinkedIn', 'Acessório, mas obrigatório ter', [
      'Foto atual, nítida e profissional',
      'Banner com especialidade e cidade',
      'Título com especialidade, público, prova e local (até 220 caracteres)',
      'Sobre em quatro blocos, com chamada para colegas no final',
      'Experiências com locais de atendimento e escopo',
      'Registro no conselho e títulos em Licenças e certificados',
      'Pelo menos uma recomendação dos últimos 12 meses',
      'Em destaque com ao menos uma prova',
      'URL personalizada do perfil'
    ]],
    ['tiktok', 'TikTok', 'Opcional', [
      'Conta criada com o e-mail da clínica e convertida em conta empresarial',
      'Mesmo nome, foto, credenciais e proposta de valor do Instagram',
      'Mesmo destino único no link da bio, quando disponível',
      'Vídeos exportados sem a marca d\'água de outra rede',
      'Dúvidas clínicas individuais nunca respondidas nos comentários: convide para o canal oficial'
    ]]
  ];

  // Roteiro de agendamento em cinco mensagens (Parte 8) e sequência de confirmação (Parte 9)
  const AGENDAMENTO_5 = [
    ['Acolher e identificar', '"Olá, [nome]! Aqui é a [atendente], da clínica [nome]. Que bom que você nos procurou. Como posso ajudar?"'],
    ['Entender a necessidade (sem triagem clínica)', '"Para eu direcionar ao profissional certo, você pode me contar em poucas palavras o motivo da consulta? Foi indicado(a) por algum profissional?"'],
    ['Explicar como funciona', 'Duração, o que acontece na primeira consulta, convênios ou particular, forma de pagamento, endereço ou link online.'],
    ['Oferecer dois horários', '"Tenho terça às 9h ou quinta às 18h. Qual fica melhor?" Duas opções fecham mais que "qual seu horário?".'],
    ['Confirmar e combinar a confirmação', 'Resumo com data, hora, endereço, o que levar, e o aviso de que haverá confirmação na véspera.']
  ];
  const CONFIRMACAO = [
    ['Ao agendar', 'Resumo com data, hora, endereço, mapa, o que levar', 'Clareza'],
    ['48 horas antes', '"Confirma sua consulta de [dia] às [hora]? Responda 1 para confirmar ou 2 para remarcar."', 'Confirmação ativa'],
    ['24 horas antes, se não respondeu', 'Ligação ou segunda mensagem', 'Recuperar silêncio'],
    ['2 horas antes', 'Lembrete curto com localização e estacionamento', 'Chegada no horário'],
    ['Após a falta, no mesmo dia', '"Sentimos sua falta. Quer remarcar?" com dois horários', 'Reagendar sem constranger']
  ];
  // Fechamento em cinco momentos e objeções (Parte 10)
  const FECHAMENTO_5 = [
    ['Avaliação que escuta', 'Pergunte o objetivo do paciente na vida real ("voltar a correr", "brincar com o neto sem dor", "mastigar sem medo").'],
    ['Plano por escrito', 'Diagnóstico funcional em linguagem simples, objetivos por fase, sessões ou etapas, frequência, o que depende do paciente, critérios de reavaliação e de alta. Nunca prometa resultado.'],
    ['Conversa sobre investimento em particular', 'Valor, formas de pagamento e alternativas (plano completo, por fase, convênio quando houver).'],
    ['Tempo para decidir, com data', '"Fique à vontade para pensar. Posso falar com você na quinta para tirar dúvidas?" A data vai para o CRM.'],
    ['Acompanhamento do plano em aberto', 'Contato em 2, 7 e 15 dias, com informação útil e disponibilidade, nunca pressão. Depois disso, plano marcado como não iniciado, com o motivo.']
  ];
  const OBJECOES = [
    ['"Vou pensar"', '"Claro. O que ficou menos claro no plano? Posso te ligar na [data] para conversarmos?"'],
    ['"Está caro"', 'Explique o que está incluído e ofereça alternativas legítimas (por fase, frequência ajustada, convênio). Nunca desconto como pressão.'],
    ['"Já melhorei"', 'Mostre o objetivo combinado e os testes da reavaliação: o que falta para a alta e o risco de recidiva, sem alarmismo.'],
    ['"Não tenho tempo"', 'Ajuste frequência e horários, exercícios domiciliares, teleatendimento quando permitido.']
  ];
  // Checklist do impulsionamento (Parte 7)
  const IMPULSO_CHECK = [
    'Post aprovado na revisão em duas etapas (Parte 2)',
    'Um objetivo só, ligado a uma ação mensurável',
    'Público local, por raio e idade, sem segmentar por saúde',
    'Orçamento diário e duração definidos',
    'WhatsApp pronto, com boas-vindas e alguém para responder',
    'Origem marcada no CRM',
    'Data de leitura dos resultados na agenda'
  ];
  // Ritual semanal de 30 minutos (Parte 11)
  const RITUAL = [
    'Atualize as etapas de cada paciente e colega.',
    'Caça aos parados: toda linha sem próximo passo ganha um, ou é marcada como Pausada ou Perdida.',
    'Envie os acompanhamentos vencidos.',
    'Leia os números da semana contra a meta.',
    'Encontre o gargalo: em que etapa os pacientes mais param? Escolha uma ação.',
    'Planeje a semana: conteúdo, anúncios, contatos com colegas.'
  ];

  // Biblioteca de prompts do guia (Parte 13), com o texto do box verde
  const PROMPTS_LIVRO = [
    { id: 'auditoria', titulo: 'Auditoria de perfis e canais', etapa: 'Posicionamento', parte: 3, tool: 'perfil', texto: `Você é consultor de marketing ético para profissionais de saúde no Brasil.
Analise meus perfis abaixo e devolva, para cada canal: (1) o que impede um paciente ou colega de confiar, (2) o que impede de agendar ou encaminhar, (3) a correção sugerida. Depois escreva uma bio de Instagram de até 150 caracteres, um título de LinkedIn de até 220 caracteres e a descrição do Perfil da Empresa no Google. Respeite as normas do [CONSELHO], não use superlativos nem promessas de resultado e não invente títulos ou números.
Profissão: [PROFISSÃO] | Especialidade: [ESPECIALIDADE] | Cidade: [CIDADE]
Público ideal: [QUEM VOCÊ QUER ATENDER]
Instagram: [COLE A BIO] | LinkedIn: [COLE TÍTULO E SOBRE]
Google: [COLE A DESCRIÇÃO] | YouTube ou TikTok: [COLE A DESCRIÇÃO]` },
    { id: 'reel', titulo: 'Roteiro de Reel ético', etapa: 'Conteúdo', parte: 4, tool: 'roteiro', texto: `Atue como roteirista de Reels para [PROFISSÃO] no Brasil, seguindo as normas de publicidade do [CONSELHO]. Crie 3 roteiros de 30 a 60 segundos sobre a dúvida [DÚVIDA DO PACIENTE], no tema [TEMA], momento da jornada [MOMENTO].
Para cada um: pergunta de abertura com texto na tela, resposta curta, demonstração segura (profissional, modelo ou ilustração), limite da orientação, CTA único, final que retoma a abertura, legenda com a palavra-chave [PALAVRA-CHAVE], a cidade [CIDADE] e a identificação profissional, e uma lista de pendências (fontes clínicas, autorizações, norma aplicável).
Proibido: promessa de resultado, superlativos, medo, autodiagnóstico, preço como chamariz.
Marque afirmações clínicas sem fonte como [PENDENTE DE VALIDAÇÃO].` },
    { id: 'episodio', titulo: 'Do episódio ao conjunto de peças', etapa: 'Reaproveitamento', parte: 5, tool: 'reaproveitamento', texto: `Vou colar a transcrição de [AULA/PODCAST/ENTREVISTA] em que participei como [PAPEL].
Público: [PÚBLICO]. Objetivo: [OBJETIVO]. Profissão e conselho: [PROFISSÃO, CONSELHO].
1. Liste as ideias aproveitáveis com trecho, quem disse, síntese fiel, exemplo da fonte e ressalva a preservar.
2. Escolha UM tema central e gere: carrossel (cards e legenda), guia (para quem, problema, passos, exemplo, checklist) e Reel de 30 a 45 s em duas versões (roteiro falado e tópicos de gravação).
3. Liste pendências: afirmações clínicas sem fonte, autoria a confirmar, links que faltam e pontos de compliance.
Não invente experiências, números nem depoimentos. Não use dados de pacientes.
Transcrição: [COLE AQUI]` },
    { id: 'carta', titulo: 'Carta de apresentação a colegas', etapa: 'Colegas', parte: 6, tool: 'colegas', texto: `Escreva uma mensagem de até 120 palavras, em tom cordial e técnico, de um(a) [PROFISSÃO] especializado(a) em [ÁREA] para um(a) [ESPECIALIDADE DO COLEGA] da região de [BAIRRO/CIDADE]. Objetivo: apresentar o serviço, explicar em quais casos o encaminhamento ajuda o paciente, como encaminhar ([CANAL]) e que o colega receberá relatório de avaliação e alta com autorização do paciente. Sem bajulação, sem oferta de vantagem, sem superlativos.` },
    { id: 'contrarref', titulo: 'Relatório de contrarreferência', etapa: 'Colegas', parte: 6, tool: 'colegas', texto: `Com base nas anotações abaixo, redija um relatório de contrarreferência de até 200 palavras para o(a) Dr(a). [NOME], que encaminhou o paciente.
Estrutura: motivo do encaminhamento, achados da avaliação, conduta proposta, previsão de reavaliação, agradecimento. Linguagem técnica e objetiva. Use apenas iniciais do paciente.
Anotações: [COLE AQUI, SEM DADOS IDENTIFICÁVEIS]` },
    { id: 'anuncio', titulo: 'Anúncio Meta e Google', etapa: 'Tráfego', parte: 7, tool: 'campanha', texto: `Crie para [PROFISSÃO/CLÍNICA] em [BAIRRO, CIDADE], serviço [SERVIÇO]: (a) 3 textos principais de até 125 caracteres e 3 títulos de até 40 caracteres para Meta Ads com CTA "Enviar mensagem"; (b) 15 títulos de até 30 caracteres e 4 descrições de até 90 caracteres para anúncio responsivo de pesquisa no Google; (c) 20 palavras-chave com intenção e local e 15 negativas.
Regras: normas do [CONSELHO], políticas de saúde da Meta e do Google, sem superlativos, sem promessa, sem afirmar condição de saúde do usuário.` },
    { id: 'impulso', titulo: 'Plano de impulsionamento', etapa: 'Tráfego', parte: 7, tool: 'campanha', texto: `Sou [PROFISSÃO] em [BAIRRO, CIDADE] e quero impulsionar o post abaixo na Meta. Objetivo: [VISITAS AO PERFIL / MENSAGENS NO WHATSAPP]. Orçamento total: [VALOR].
Devolva: (1) se o post é adequado para impulsionar e o que ajustar segundo as normas do [CONSELHO] e as políticas de saúde da Meta; (2) público sugerido (raio e idade), sem segmentar por condição de saúde; (3) orçamento diário e duração; (4) mensagem de boas-vindas no WhatsApp; (5) o que medir, quando e como registrar no CRM. Não invente números.
Post: [COLE O TEXTO E DESCREVA O VÍDEO]` },
    { id: 'respostas', titulo: 'Respostas rápidas', etapa: 'Agendamento', parte: 8, tool: 'atendimento', texto: `Crie 12 mensagens de resposta rápida para o WhatsApp da [CLÍNICA], para [PROFISSÃO]: boas-vindas, pedido de motivo da consulta, explicação da primeira consulta, convênios, valores (quando permitido), endereço, atendimento online, duas opções de horário, confirmação de agendamento, fora do horário, retomada em 1 dia e retomada em 7 dias. Tom acolhedor, frases curtas, sem orientação clínica, sem pressão.` },
    { id: 'plano', titulo: 'Plano de tratamento compreensível', etapa: 'Fechamento', parte: 10, tool: 'atendimento', texto: `Transforme as anotações técnicas abaixo em um plano de tratamento para o paciente ler, em linguagem simples, com: objetivo do paciente em uma frase, fases com metas mensuráveis, número estimado de sessões e frequência, o que depende do paciente, como e quando vamos reavaliar e critério de alta.
Não prometa resultado. Marque com [CONFIRMAR] o que faltar. Use apenas iniciais. Anotações:
[COLE AQUI]` },
    { id: 'registro', titulo: 'Da conversa ao registro', etapa: 'CRM', parte: 11, tool: 'rastreador', texto: `Vou colar a conversa de WhatsApp de um contato novo. Organize em: nome, origem, serviço de interesse, profissional indicado, etapa do funil (Novo contato, Em conversa, Agendado, Avaliado, Plano proposto, Em tratamento, Alta), próximo passo com data sugerida e um aprendizado. Não registre nenhuma informação clínica. Depois, escreva a próxima mensagem, em tom acolhedor, com até 400 caracteres. Conversa: [COLE SEM DADOS CLÍNICOS]` },
    { id: 'campanha', titulo: 'Gerador de campanha completa', etapa: 'Campanha', parte: 13, tool: 'campanha', texto: `Atue como estrategista de marketing ético para saúde no Brasil.
Monte uma campanha de [DURAÇÃO] para [PROFISSÃO/CLÍNICA] em [BAIRRO, CIDADE], serviço [SERVIÇO], objetivo [N] pacientes agendados, orçamento [R$/DIA].
Entregue:
1. Ficha da campanha (objetivo, público, mensagem central, canais, medição).
2. 3 roteiros de Reel (gancho, contexto, 3 a 5 pontos, CTA, legenda).
3. 1 carrossel de 7 slides.
4. Anúncios Meta (3 textos, 3 títulos) e Google (15 títulos, 4 descrições, 20 palavras-chave, 15 negativas).
5. Mensagem de boas-vindas do WhatsApp e 3 respostas rápidas.
6. Calendário dia a dia.
7. Lista de verificação ética do [CONSELHO], da LGPD e das políticas da Meta e do Google, marcando o que precisa de atenção.
Regras: sem promessa de resultado, sem superlativos, sem medo, sem afirmar condição de saúde do usuário, sem preço onde o conselho proíbe. Marque com [CONFIRMAR] tudo que eu não informei.` },
    { id: 'verificador', titulo: 'Verificador ético', etapa: 'Revisão', parte: 13, tool: 'etica', texto: `Revise o texto abaixo como se fosse a comissão de ética do [CONSELHO].
Aponte, frase a frase: promessa de resultado, superlativo, sensacionalismo, medo, exposição de paciente, preço ou promoção vedados, falta de identificação profissional, afirmação sobre condição de saúde do leitor.
Proponha uma versão corrigida. Lembre que esta revisão não substitui a consulta à norma vigente.
Texto: [COLE AQUI]` }
  ];

  // Anexo A do guia: glossário (75 termos)
  const GLOSSARIO = [
    ["Adesão", "Quanto o paciente segue o tratamento proposto até a alta"],
    ["Advantage+", "Opções automatizadas da Meta para público, posicionamento e criativo"],
    ["Agregador de IA", "Plataforma que reúne modelos de inteligência artificial de várias empresas em uma única assinatura, como a Adapta e o MyHub.IA"],
    ["Alcance", "Número de pessoas diferentes que viram um conteúdo"],
    ["API de Conversões", "Envio de eventos do site ou do CRM direto para a Meta, sem depender do navegador"],
    ["Banner", "Imagem de capa no topo do perfil do LinkedIn ou do canal do YouTube"],
    ["Carrossel", "Post com várias imagens que o usuário desliza"],
    ["Central de Contas", "Área da Meta que liga Instagram, Facebook e WhatsApp da mesma pessoa ou empresa"],
    ["CFM, CFO, CFP, COFFITO, CFN", "Conselhos federais de Medicina, Odontologia, Psicologia, Fisioterapia e Terapia Ocupacional, e Nutricionistas"],
    ["CliniLoop", "Aplicativo de CRM que acompanha este guia: registra pacientes, colegas e campanhas e leva os prompts para o dia a dia da clínica"],
    ["Conta profissional", "Tipo de conta do Instagram e do TikTok que libera estatísticas, botões de contato e anúncios"],
    ["Contrarreferência", "Retorno técnico ao colega que encaminhou o paciente"],
    ["Conversão offline", "Resultado que acontece fora do site (agendamento, comparecimento) e é informado à plataforma de anúncios"],
    ["CPA", "Custo por aquisição: quanto custou cada resultado definido"],
    ["CPC", "Custo por clique"],
    ["CRM", "Gestão do relacionamento: registro de contatos, etapas, próximos passos e resultados"],
    ["CTA", "Chamada para ação: o pedido feito ao final de um conteúdo ou anúncio"],
    ["CTR", "Taxa de cliques: cliques divididos por impressões"],
    ["Destaques", "Stories fixados no perfil do Instagram, organizados por assunto"],
    ["Direct", "Mensagens privadas do Instagram"],
    ["Escada de crescimento", "Os sete degraus do crescimento de um perfil: entender a plataforma, definir a promessa, montar a vitrine, produzir com rotina, ler os números, combinar formatos e fixar metas"],
    ["Em destaque", "Seção do LinkedIn que exibe provas: artigos, palestras, entrevistas"],
    ["Envio", "Compartilhamento de um post por mensagem direta, um dos sinais mais fortes do Instagram"],
    ["Funil", "Sequência de etapas da primeira atenção até a alta"],
    ["Gancho", "Os primeiros segundos ou a primeira frase que fazem a pessoa parar"],
    ["Gerenciador de Anúncios", "Ferramenta completa da Meta para criar e medir campanhas com vários anúncios e públicos"],
    ["Google Meu Negócio", "Nome antigo do Perfil da Empresa no Google"],
    ["Impulsionamento", "Pagar para um post já publicado alcançar mais pessoas; no Instagram, o botão \"Turbinar\""],
    ["Inovação de valor", "No Oceano Azul, buscar ao mesmo tempo diferenciação clara e custo sob controle"],
    ["Interação pública por view", "(Curtidas + comentários) ÷ views × 100; não inclui envios nem salvamentos"],
    ["Lead", "Contato que demonstrou interesse e ainda não agendou"],
    ["LGPD", "Lei Geral de Proteção de Dados (Lei 13.709/2018)"],
    ["Mediana de views", "Valor central das views de peças comparáveis; mais robusta que a média"],
    ["Meta", "Empresa dona do Instagram, do Facebook e do WhatsApp"],
    ["Meta Business Suite", "Painel gratuito da Meta para gerenciar posts, mensagens e anúncios de Instagram e Facebook"],
    ["Decisões (as sete)", "Atenção, confiança, indicação, contato, agendamento, comparecimento e adesão: as decisões que o paciente toma em sequência até seguir o tratamento"],
    ["No-show", "Falta do paciente sem aviso"],
    ["Oceano Azul", "Espaço de mercado ainda não disputado, criado por uma proposta de valor própria; conceito de estratégia de mercado"],
    ["Oceano Vermelho", "Mercado já existente, em que todos disputam os mesmos clientes com os mesmos argumentos"],
    ["Orçamento diário", "Valor máximo que a plataforma pode gastar por dia com um anúncio"],
    ["Palavra-chave negativa", "Termo que impede o anúncio do Google de aparecer em buscas irrelevantes"],
    ["Perfil da Empresa no Google", "Ficha da clínica na busca e no Maps, antes Google Meu Negócio"],
    ["Pixel", "Código da Meta no site que mede ações dos visitantes"],
    ["Plano proposto", "Tratamento apresentado ao paciente e ainda não iniciado"],
    ["Posicionamento (anúncio)", "Lugar em que o anúncio aparece: Feed, Stories, Reels, busca"],
    ["Prompt", "Texto que você escreve para pedir algo a uma ferramenta de inteligência artificial; neste guia, vem pronto na caixa verde"],
    ["Prontuário", "Registro clínico do paciente, regido pelo conselho; não é o CRM"],
    ["Proposta de valor", "Frase que diz quem você ajuda e com o quê; na saúde, promete informação e atendimento, não resultado"],
    ["Próximo passo", "A próxima ação com data registrada no CRM; o campo mais importante"],
    ["Quadro recorrente", "Série com formato fixo e uma pergunta por episódio, como \"Pergunta do consultório\""],
    ["Quatro ações", "Ferramenta do Oceano Azul: eliminar, reduzir, elevar e criar em relação ao padrão do setor"],
    ["Ciclo de adaptação", "Método de criação de roteiros a partir de referências: Referência, Observação, Adaptação, Troca. Não é ROAS"],
    ["Reaproveitamento", "Transformar aula, podcast, entrevista ou bastidor em várias peças com profundidades diferentes"],
    ["Reels", "Vídeos curtos verticais do Instagram, principal formato de descoberta"],
    ["Remarketing", "Anúncio para quem já interagiu; restrito na saúde"],
    ["Retenção", "Quanto do vídeo as pessoas assistem"],
    ["Revisão em duas etapas", "Revisão editorial seguida de aprovação clínica e ética pelo profissional responsável"],
    ["ROAS", "Retorno sobre gasto em anúncios: receita atribuída dividida pelo investimento em mídia"],
    ["RQE", "Registro de Qualificação de Especialista, exigido para o médico se anunciar especialista"],
    ["Sequência de confirmação", "Mensagens programadas antes da consulta para confirmar presença; no mercado, também chamada de régua"],
    ["Shorts", "Vídeos curtos verticais do YouTube"],
    ["Sobre", "Seção de apresentação do perfil do LinkedIn, com até 2.600 caracteres"],
    ["Taxa de aceitação", "Planos iniciados divididos por planos propostos"],
    ["Taxa de agendamento", "Agendados divididos por novos contatos"],
    ["TCLE", "Termo de Consentimento Livre e Esclarecido"],
    ["Tema de conteúdo", "Assunto fixo que organiza as publicações (educar, humanizar, desmistificar); também chamado de linha editorial"],
    ["TikTok", "Rede de vídeos curtos em que a recomendação depende do interesse de quem assiste"],
    ["Título (LinkedIn)", "Frase de até 220 caracteres abaixo do nome, que aparece nas buscas e nos comentários"],
    ["Tráfego orgânico", "Visitas e contatos sem anúncio pago"],
    ["Tráfego pago", "Visitas e contatos gerados por anúncios"],
    ["Trial Reels", "Reels testados primeiro com quem não segue o perfil"],
    ["Turbinar", "Nome do botão de impulsionamento no Instagram e no Facebook"],
    ["Verificação em duas etapas", "Proteção da conta que pede, além da senha, um código enviado ao celular ou gerado por aplicativo"],
    ["WhatsApp Business", "Versão do WhatsApp para empresas, com respostas rápidas e etiquetas"],
    ["YouTube Studio", "Painel do YouTube com estatísticas, edição e configuração do canal"]
  ];
