  // ===================== BuscaLoop Saúde =====================
  // Endereço do repositório no GitHub (preencha depois de criar). Vazio = link escondido.
  const REPO_URL = '';

  const APP = 'BuscaLoop Saúde';
  const APP_ID = 'BuscaLoopSaude';
  const PREFIX = 'buscaloopsaude.';
  const STORE_KEY = PREFIX + 'config.v1';
  const RES_KEY = PREFIX + 'resultados.v1';
  const USO_KEY = PREFIX + 'uso.v1';
  const META_KEY = PREFIX + 'meta.v1';
  const BACKUP_KEY = PREFIX + 'backup.data';
  const KEY_STORE = PREFIX + 'apikey';
  const APIPREFS_KEY = PREFIX + 'apiprefs';
  const PAC_KEY = PREFIX + 'pacientes.v1';
  const COL_KEY = PREFIX + 'colegas.v1';
  const CAMP_KEY = PREFIX + 'campanhas.v1';
  const CONT_KEY = PREFIX + 'conteudos.v1';
  const PERSIST_KEY = PREFIX + 'campos.v1';
  const CICLO = 14;

  // Etapas do Rastreador de pacientes (funil de sete etapas)
  const ETAPAS = ['Novo', 'Em conversa', 'Agendado', 'Avaliado', 'Plano proposto', 'Em tratamento', 'Encerrado'];
  const RESULTADOS = ['Alta e vínculo', 'Perdido', 'Pausado'];
  const ETAPAS_COLEGA = ['Mapeado', 'Primeiro contato', 'Apresentação feita', 'Trocando indicações', 'Parceria ativa'];
  const CONSENT = { atendimento: 'Atendimento', lembretes: 'Lembretes e retornos', conteudo: 'Conteúdos e novidades' };
  const ATIVIDADES = ['Mensagem', 'Ligação', 'Confirmação', 'Retomada'];

  // --- Regras de publicidade por conselho (conferidas em outubro de 2026)
  const COUNCILS = {
    medicina: {
      label: 'Medicina', sigla: 'CRM', conselho: 'CFM / CRM',
      norma: 'Resolução CFM nº 2.336/2023 (publicidade médica), em vigor desde 2024',
      ident: 'Nome, número do CRM e, se for especialista, o RQE. Especialista é quem fez residência reconhecida ou foi aprovado no exame de sociedade filiada à AMB. Pós-graduação lato sensu pode aparecer no currículo seguida de "NÃO ESPECIALISTA".',
      pode: [
        'Mostrar consultório, equipe e bastidores.',
        'Selfies, inclusive com pacientes famosos, sem caráter sensacionalista ou de concorrência desleal.',
        'Informar valor da consulta, formas de pagamento e descontos em campanhas.',
        'Antes e depois com finalidade educativa: só da sua especialidade, com texto sobre indicações e fatores que podem prejudicar o resultado, mostrando também evoluções insatisfatórias e possíveis complicações, sem manipular a imagem e sem identificar o paciente (fotos do seu arquivo exigem autorização).',
        'Divulgar equipamentos aprovados pela Anvisa.',
        'Cursos educativos para leigos, com valor anunciado.'
      ],
      nao: [
        'Sensacionalismo, autopromoção e conteúdo inverídico.',
        'Atribuir capacidade privilegiada a aparelho ou técnica; prometer resultado.',
        'Tom pejorativo com colegas, especialidades ou procedimentos.',
        'Anunciar que trata órgãos ou doenças específicas sem ser especialista (RQE).',
        'Promoções casadas, premiações e oferta por consórcio ou similares.',
        'Publicidade de medicamentos, insumos, órteses, próteses e suas marcas.',
        'Consultas em grupo ou informação que leve a diagnóstico, procedimento ou prognóstico pela rede.'
      ],
      extra: 'Repostar publicações de pacientes passa a contar como publicidade médica e segue as mesmas regras.',
      resumo: 'Pela Res. CFM 2.336/2023: identificar nome, CRM e RQE (se especialista); sem sensacionalismo, autopromoção ou promessa de resultado; antes e depois só com finalidade educativa e nas condições da norma; sem falar mal de colegas; não anunciar área de especialista sem RQE; sem premiações ou promoções casadas.',
      fontes: [
        ['Migalhas: CFM muda regra e permite antes e depois', 'https://www.migalhas.com.br/quentes/393424/cfm-muda-regra-e-permite-antes-e-depois-de-pacientes-na-internet'],
        ['CRM-PR: apresentação sobre publicidade médica', 'https://crmpr.org.br/uploadAddress/Publicidade-medica-apresentacao-coletiva-12-09-(1)[6052].pdf']
      ]
    },
    odontologia: {
      label: 'Odontologia', sigla: 'CRO', conselho: 'CFO / CRO',
      norma: 'Código de Ética Odontológica (Res. CFO 118/2012, com alterações da Res. CFO 271/2025) e orientações do CRO',
      ident: 'Nome, categoria (cirurgião-dentista) e número do CRO. Clínica: nome e CRO da clínica, nome e CRO do responsável técnico. Especialidade só se registrada no CRO; sem ela, use "clínico geral" e informe as áreas de atuação. No antes e depois, a identificação vai na própria imagem.',
      pode: [
        'Conteúdo educativo, bastidores, equipe e tecnologia da clínica.',
        'Endereço, telefone, e-mail e horário de atendimento.',
        'Antes e depois só no perfil do profissional (pessoa física), do próprio trabalho, com autorização prévia e TCLE assinado e arquivado no prontuário, com caráter informativo (orientação do CROSP).'
      ],
      nao: [
        'Divulgar preços, descontos, gratuidade ou frases de apelo a preço ("cabe no seu bolso").',
        'Promessa de resultado, sensacionalismo e autopromoção.',
        'Fotos ou vídeos de procedimento em andamento (só em publicação científica).',
        'Antes e depois no perfil da clínica (pessoa jurídica) ou de trabalho de outro dentista.',
        'Identificar marcas de materiais, equipamentos e instrumentais.',
        'Influenciador em troca de tratamento; compra de seguidores.',
        'Captação por telemarketing ativo, alto-falante ou plaqueteiros.'
      ],
      extra: 'A Res. CFO 271/2025 mudou regras sobre cartões de desconto e sobre brindes, prêmios e sorteios. Confirme com o seu CRO antes de qualquer ação desse tipo.',
      resumo: 'Pelo Código de Ética Odontológica e orientações do CRO: identificar nome, categoria e CRO (clínica: CRO da clínica e do responsável técnico); sem preços, descontos, gratuidade ou apelo a preço; sem promessa de resultado, sensacionalismo ou autopromoção; sem procedimento em andamento; antes e depois só no perfil pessoal do profissional, do próprio trabalho, com TCLE e sem marcas de materiais.',
      fontes: [
        ['CROSP: regras de publicidade odontológica', 'https://site.crosp.org.br/uploads/arquivo/3724579826b71ed53e3c7d0ff3104a64.pdf'],
        ['Resolução CFO-271/2025', 'https://sistemas.cfo.org.br/visualizar/atos/RESOLU%C3%87%C3%83O/SEC/2025/271'],
        ['LegisMap: o que mudou no Código de Ética após o CADE', 'https://legismap.com.br/conteudos/artigos-e-noticias/em-cumprimento-a-decisao-do-cade-cfo-realiza-alteracoes-pontuais-no-codigo-de-etica']
      ]
    },
    psicologia: {
      label: 'Psicologia', sigla: 'CRP', conselho: 'CFP / CRP',
      norma: 'Código de Ética do Psicólogo (Res. CFP 10/2005, art. 20), Res. CFP 3/2007 e Nota Técnica CFP 1/2022',
      ident: 'Nome completo (ou social), a palavra "psicólogo(a)" e o CRP com número (ex.: CRP 04/0000). "Dr(a)." só com doutorado. Apelidos e logomarcas podem, desde que junto da identificação completa.',
      pode: [
        'Informar público atendido, abordagem teórica, serviços, local e contatos.',
        'Citar títulos acadêmicos e de especialista que você de fato tem.',
        'Divulgar atendimento online; o valor pode ser informado, mas sem ser o foco do anúncio.',
        'Manter perfis pessoal e profissional separados (recomendado).'
      ],
      nao: [
        'Preço como chamariz: gratuidade, descontos, promoções, cupons, sorteios, pacotes.',
        'Prometer resultado ou criar expectativa irreal.',
        'Sensacionalismo e comparação que desvalorize colegas.',
        'Qualquer dado, imagem ou caso que identifique paciente; depoimentos são desaconselhados mesmo com consentimento.',
        'Imagens de testes psicológicos.',
        'Divulgar práticas não reconhecidas (ex.: constelação familiar) ou associar a prática a crença religiosa.'
      ],
      extra: 'Resumo baseado na cartilha do CRP-MG (abril de 2026), que reúne as normas do CFP.',
      resumo: 'Pelo Código de Ética do Psicólogo (art. 20) e Nota Técnica CFP 1/2022: identificar nome, "psicólogo(a)" e CRP; preço nunca como chamariz (sem promoções, gratuidade, sorteios ou pacotes); sem promessa de resultado ou sensacionalismo; nunca expor pacientes nem usar depoimentos; só práticas reconhecidas pelo CFP.',
      fontes: [
        ['CRP-MG: cartilha de publicidade profissional (abril de 2026)', 'https://acervodigital.crp04.org.br/wp-content/uploads/tainacan-items/9483/81624/CRP-MG_Cartilha-Publicidade-profissional-abril-2026.pdf'],
        ['CFP: orientações sobre publicidade nas redes sociais', 'https://site.cfp.org.br/cfp-divulga-orientacoes-a-categoria-sobre-publicidade-nas-redes-sociais/']
      ]
    },
    fisioterapia: {
      label: 'Fisioterapia', sigla: 'CREFITO', conselho: 'COFFITO / CREFITO',
      norma: 'Código de Ética e Deontologia da Fisioterapia (Res. COFFITO 424/2013)',
      ident: 'Nome, a palavra "fisioterapeuta" e o número do CREFITO. Especialidade só se reconhecida pelo COFFITO. Não substitua o título por termos como "terapeuta corporal".',
      pode: [
        'Endereço, telefone, horários, convênios, instalações, métodos e logomarca.',
        'Textos, imagens e vídeos de orientação à população, dentro do Código.',
        'Divulgação coletiva em serviço multiprofissional.'
      ],
      nao: [
        'Divulgar valores fora do local de atendimento ou de forma que configure concorrência desleal.',
        'Usar depoimentos, imagens ou agradecimentos de pacientes para autopromoção.',
        'Antes e depois ou qualquer imagem que identifique o paciente (exceção: uso acadêmico com autorização formal).',
        'Prometer terapia "infalível", "secreta" ou sem eficácia comprovada.',
        'Consulta ou prescrição sem avaliação presencial, salvo casos regulamentados pelo COFFITO.',
        'Títulos que você não pode comprovar.'
      ],
      extra: 'Você responde ao conselho pelo conteúdo técnico de artigos, entrevistas e vídeos.',
      resumo: 'Pelo Código de Ética e Deontologia da Fisioterapia (Res. COFFITO 424/2013): identificar nome, "fisioterapeuta" e CREFITO; sem divulgar valores fora do local de atendimento; sem depoimentos, imagens ou agradecimentos de pacientes para autopromoção; sem imagem que identifique paciente; sem prometer terapia infalível.',
      fontes: [
        ['Resolução COFFITO nº 424/2013 (Código de Ética)', 'https://www.normasbrasil.com.br/norma/resolucao-424-2013_257114.html']
      ]
    }
  };
  // Saúde mental: cuidados adicionais (psiquiatria e psicologia)
  const SAUDE_MENTAL = 'Em saúde mental, use linguagem responsável e sem estigma, sem gerar medo nem estimular autodiagnóstico. Em temas de suicídio, siga as recomendações de comunicação responsável, informe o CVV (188) e nunca use o tema para captar pacientes.';

  const PROFISSIONAIS = {
    medico: { label: 'Médico(a)', council: 'medicina', titulo: 'médico(a)' },
    psiquiatra: { label: 'Psiquiatra', council: 'medicina', titulo: 'médico(a) psiquiatra', mental: true },
    dentista: { label: 'Dentista', council: 'odontologia', titulo: 'cirurgião(ã)-dentista' },
    psicologo: { label: 'Psicólogo(a)', council: 'psicologia', titulo: 'psicólogo(a)', mental: true },
    fisioterapeuta: { label: 'Fisioterapeuta', council: 'fisioterapia', titulo: 'fisioterapeuta' },
    multi: { label: 'Clínica multiprofissional', council: null, titulo: 'clínica multiprofissional' }
  };
  // Ferramentas que sobem na ordem conforme o tipo de profissional
  const PROF_ROTA = {
    medico: ['perfil', 'pautas'], psiquiatra: ['colegas', 'pautas'], dentista: ['atendimento', 'campanha'],
    psicologo: ['colegas', 'perfil'], fisioterapeuta: ['colegas', 'campanha'], multi: ['rastreador', 'atendimento']
  };

  const REGRAS_GERAIS = [
    'Paciente identificável só com autorização por escrito para aquele uso. Dado de saúde é dado pessoal sensível pela LGPD.',
    'Sem promessa de cura ou resultado garantido, sem superlativos e sem gerar medo: além do conselho, pode ser publicidade enganosa pelo Código de Defesa do Consumidor.',
    'Em anúncios, não afirme nem sugira condição de saúde de quem lê ("você tem dor nas costas?"): as políticas da Meta sobre atributos pessoais vetam, e o Google também restringe anúncios de saúde.',
    'Parceria paga ou permuta precisa ser sinalizada como publicidade.'
  ];

  const OBJETIVOS = {
    agenda: {
      label: 'Encher a agenda',
      guia: 'O objetivo é transformar atenção local em primeiras consultas: perfil claro, resposta rápida e conteúdo que responde às dúvidas de quem está perto de agendar.',
      porque: 'Para encher a agenda, o gargalo costuma estar menos no alcance e mais na conversão: perfil que diz como marcar, atendimento que responde rápido e um rastreador que não deixa ninguém esquecido.',
      rota: ['publico', 'perfil', 'atendimento', 'rastreador', 'pautas']
    },
    ticket: {
      label: 'Atrair tratamentos de maior valor',
      guia: 'O objetivo é atrair um segmento que valoriza qualidade: nicho claro, conteúdo educativo aprofundado, diferencial comprovável dentro das regras e atendimento consultivo com plano de tratamento compreensível.',
      porque: 'Tratamentos de maior valor pedem confiança antes do primeiro contato: nicho e diferencial claros, conteúdo que educa sem prometer e um plano de tratamento que o paciente entende.',
      rota: ['publico', 'nicho', 'roteiro', 'atendimento', 'campanha']
    },
    autoridade: {
      label: 'Virar referência no tema',
      guia: 'O objetivo é construir autoridade num tema: marca pessoal clara, linha editorial consistente, conteúdo que ensina de verdade, formação e participação científica.',
      porque: 'Autoridade vem de repetir um tema com profundidade por meses: marca pessoal definida, nicho estreito, pautas a partir de dúvidas reais e formação que você pode mostrar.',
      rota: ['profissional', 'nicho', 'pautas', 'roteiro', 'formacao']
    },
    online: {
      label: 'Atender pacientes online',
      guia: 'O objetivo é atrair pacientes além da cidade: nicho bem definido, conteúdo que gera confiança a distância, página de agendamento clara e respeito às regras de atendimento a distância do conselho.',
      porque: 'No online você disputa atenção com o país inteiro: nicho bem definido, persona clara, perfis que explicam como funciona o atendimento a distância e textos que geram confiança.',
      rota: ['nicho', 'publico', 'perfil', 'roteiro', 'atendimento']
    },
    fidelizar: {
      label: 'Fidelizar e gerar indicações',
      guia: 'O objetivo é cuidar de quem já foi atendido e de quem indica: pós-consulta, retornos com consentimento, rede de colegas, contrarreferência e pedido ético de indicação.',
      porque: 'Quem já confia em você é o canal mais barato: atendimento e retornos bem feitos, rastreador com datas, consentimento para lembretes e uma rede de colegas cuidada.',
      rota: ['atendimento', 'rastreador', 'colegas', 'pautas', 'assistente']
    }
  };
  const TEMPO = {
    ate1: { label: 'até 1 hora por semana', meta: 2 },
    '2a3': { label: '2 a 3 horas por semana', meta: 3 },
    '4a6': { label: '4 a 6 horas por semana', meta: 4 },
    '7mais': { label: '7 horas ou mais por semana', meta: 5 }
  };
  const PRODUTOR = { eu: 'eu mesmo(a)', equipe: 'eu, com ajuda da equipe', terceiro: 'vou contratar agência ou social media' };
  const CAMERA = { alto: 'gosto de aparecer na câmera', medio: 'apareço, mas sem muita exposição', baixo: 'prefiro não aparecer na câmera' };

  const TOOL_NAMES = {
    config: 'Comece aqui', publico: 'Público, ICP e persona', profissional: 'Persona do profissional', nicho: 'Nicho e diferencial',
    perfil: 'Perfis e presença', pautas: 'Pautas e palavras-chave', roteiro: 'Roteiros e copy', formacao: 'Formação e autoridade',
    campanha: 'Gerador de campanhas', colegas: 'Rede de colegas', atendimento: 'Atendimento e agendamento', rastreador: 'Rastreador de pacientes',
    assistente: 'Assistente da semana', painel: 'Painel e diagnóstico', etica: 'Verificador ético', briefing: 'Briefing para terceiros',
    ferramentas: 'Ferramentas', ebook: 'Playbook da clínica'
  };
  const FUNNEL_STAGES = [
    { nome: 'Posicionamento', desc: 'Quem você quer atender, por que você e como você fala.', tools: ['config', 'publico', 'profissional', 'nicho'], num: null },
    { nome: 'Conteúdo', desc: 'Perfis prontos, pautas de dúvidas reais e roteiros publicados com constância.', tools: ['perfil', 'pautas', 'roteiro', 'formacao'], num: 'conteudos', numLabel: 'publicados' },
    { nome: 'Captação', desc: 'Campanhas medidas e rede de colegas que indica.', tools: ['campanha', 'colegas'], num: 'contatos', numLabel: 'novos contatos' },
    { nome: 'Conversa', desc: 'Resposta rápida, agendamento, confirmação e retomada.', tools: ['atendimento', 'rastreador'], num: 'agendados', numLabel: 'agendados' },
    { nome: 'Tratamento', desc: 'Avaliação, plano compreensível e início do tratamento.', tools: ['rastreador'], num: 'iniciados', numLabel: 'iniciaram' }
  ];
  const LOOP_TOOLS = ['assistente', 'painel', 'etica', 'briefing', 'ferramentas'];
  const PB_TOOLS = {
    publico: { nome: 'Público, ICP e persona do paciente', fazer: 'Descreva quem você atende hoje e as dúvidas que mais ouve, gere o prompt e guarde o ICP e a persona principal.', revisar: 'Confira se os contatos das últimas semanas são do ICP e acrescente as dúvidas novas.' },
    profissional: { nome: 'Persona do profissional e marca', fazer: 'Responda às perguntas sobre sua história e seus valores, gere sua persona de marca e guarde o tom de voz.', revisar: 'Veja se os últimos conteúdos soaram como você e ajuste o "faço / não faço".' },
    nicho: { nome: 'Nicho e diferencial', fazer: 'Liste formações e métodos, gere a análise de nicho e concorrência e guarde a proposta de valor escolhida.', revisar: 'Revise a concorrência local e veja se o nicho está trazendo o paciente certo.' },
    perfil: { nome: 'Perfis e presença', fazer: 'Cole os textos atuais dos perfis, gere a auditoria e aplique bio, destaques, link e Perfil da Empresa no Google.', revisar: 'Atualize destaques, fixados e fotos do Google com o que funcionou.' },
    pautas: { nome: 'Pautas e palavras-chave', fazer: 'Anote no banco as dúvidas reais dos pacientes, gere palavras-chave, 30 pautas e o calendário, e guarde a frequência que vai manter.', revisar: 'Acrescente as dúvidas novas ao banco e gere as próximas 4 semanas de pautas.' },
    roteiro: { nome: 'Roteiros de conteúdo e copy', fazer: 'Escolha a primeira pauta do calendário e gere o roteiro com 5 ganchos. Grave vários de uma vez e registre no Diário de conteúdo.', revisar: 'Reaproveite os ganchos com mais envios e salvamentos nos próximos roteiros.' },
    formacao: { nome: 'Formação e autoridade', fazer: 'Pesquise congressos e cursos dos próximos 12 meses e defina como comunicar seus títulos no perfil e no LinkedIn.', revisar: 'Atualize o perfil com eventos e formações concluídos.' },
    campanha: { nome: 'Gerador de campanhas', fazer: 'Escolha um modelo, gere a ficha e as peças, passe tudo pelo Verificador ético e registre a campanha.', revisar: 'Compare as campanhas registradas por agendados e tratamentos iniciados, não por cliques.' },
    colegas: { nome: 'Rede de colegas', fazer: 'Mapeie de 5 a 10 colegas que atendem o mesmo paciente antes ou depois de você e envie a carta de apresentação aos primeiros.', revisar: 'Devolva as contrarreferências pendentes e agradeça as indicações da quinzena.' },
    atendimento: { nome: 'Atendimento e agendamento', fazer: 'Liste as perguntas que mais chegam, gere respostas rápidas, roteiro de agendamento, confirmação e retomadas, e guarde os aprovados.', revisar: 'Inclua respostas para as perguntas novas e revise o tempo de resposta.' },
    rastreador: { nome: 'Rastreador de pacientes', fazer: 'Registre cada novo contato com origem, serviço, etapa, próximo passo e consentimento.', revisar: 'Atualize etapas e datas, encerre quem esfriou (com motivo) e retome quem consentiu com lembretes.' },
    assistente: { nome: 'Assistente da semana', fazer: 'Toda segunda, importe as pendências e gere a agenda da semana em blocos.', revisar: 'Faça o ritual semanal de novo.' },
    painel: { nome: 'Painel e diagnóstico', fazer: 'Registre os conteúdos da semana no diário e gere o diagnóstico do gargalo.', revisar: 'Compare as últimas 4 semanas e ataque o gargalo da vez.' },
    etica: { nome: 'Verificador ético', fazer: 'Leia o resumo das regras do seu conselho e passe o próximo post ou anúncio pelo verificador antes de publicar.', revisar: 'Revise bio, modelos e anúncios ativos e confira se a norma mudou.' },
    briefing: { nome: 'Briefing para terceiros', fazer: 'Monte o briefing e envie para dois ou três fornecedores, para comparar propostas.', revisar: 'Revise escopo, aprovação e métricas com o fornecedor.' }
  };
  const SAVE_TOOLS = ['publico', 'profissional', 'nicho', 'perfil', 'pautas', 'formacao', 'atendimento'];
  const SAVE_TITLES = {
    publico: 'Público, ICP e persona do paciente', profissional: 'Marca e tom de voz do profissional', nicho: 'Nicho, proposta de valor e diferencial',
    perfil: 'Textos aprovados dos perfis', pautas: 'Palavras-chave, pautas e calendário', formacao: 'Plano de formação e autoridade',
    atendimento: 'Respostas rápidas e roteiros de atendimento'
  };
  const WEB_TOOLS = ['publico', 'nicho', 'pautas', 'formacao', 'campanha', 'ferramentas', 'etica'];

  // Ferramentas para materializar as campanhas (listadas, não avaliadas)
  const KIT = [
    ['Criar peças', 'Canva, Adobe Express', 'Modelos de carrossel e capas com a identidade da clínica'],
    ['Editar vídeo', 'CapCut, Edits (Meta), InShot', 'Legendas automáticas; revise termos técnicos'],
    ['Agendar e medir posts', 'Meta Business Suite, Metricool, mLabs', 'Calendário e relatórios de Instagram e YouTube'],
    ['Ideias e palavras-chave', 'Google Trends, Answer The Public, Planejador de palavras-chave do Google Ads', 'Pautas a partir do que o paciente pesquisa'],
    ['YouTube', 'YouTube Studio, TubeBuddy ou vidIQ', 'Títulos, capítulos e análise de retenção'],
    ['Anúncios', 'Gerenciador de Anúncios da Meta, Google Ads', 'Pixel, API de Conversões, tag do Google'],
    ['Medição do site', 'Google Analytics 4, Google Tag Manager', 'Conversões de WhatsApp, ligação e formulário'],
    ['Presença local', 'Perfil da Empresa no Google, Doctoralia', 'Avaliações e agendamento online'],
    ['Atendimento', 'WhatsApp Business (app ou API oficial)', 'Respostas rápidas, etiquetas, catálogo de serviços'],
    ['CRM comercial', 'BuscaLoop Saúde, RD Station CRM, Kommo, Pipedrive, HubSpot', 'Funil, próximos passos, automações'],
    ['Agenda e prontuário', 'iClinic, Feegow, Amplimed, Simples Dental, Clinicorp', 'Agenda, confirmação e prontuário eletrônico (fora do CRM)'],
    ['Assistentes de IA', 'Claude, ChatGPT, Gemini, Copilot', 'Nunca com dados de pacientes']
  ];

  // Quatro modelos de campanha
  const MODELOS = {
    lombar: { servico: 'avaliação de dor lombar (fisioterapia)', n: 10, duracao: '30 dias', mensagem: 'Dor nas costas tem causas tratáveis. Entenda como é a avaliação', canais: ['orgânico (Reels, carrossel, Stories)', 'Meta Ads com destino para o WhatsApp', 'Google Ads (rede de pesquisa)'] },
    implante: { servico: 'implante dentário', n: 8, duracao: '45 dias', mensagem: 'Cada etapa do implante, explicada', canais: ['orgânico (Reels, carrossel, Stories)', 'YouTube', 'Google Ads (rede de pesquisa)'] },
    online: { servico: 'psicoterapia online', n: 6, duracao: '30 dias', mensagem: 'Como é uma primeira sessão de terapia online', canais: ['orgânico (Reels, carrossel, Stories)', 'Google Ads (rede de pesquisa)'] },
    reativacao: { servico: 'retorno periódico', n: 15, duracao: '21 dias', mensagem: 'Lembrete de retorno periódico para quem consentiu', canais: ['WhatsApp para pacientes que consentiram receber lembretes'] }
  };

  const ROLES = {
    agencia: { label: 'Agência de marketing', entregas: 'Planejamento mensal de conteúdo a partir dos pilares deste briefing; 3 a 4 publicações por semana (vídeos curtos e carrosséis); Stories de apoio; roteiros para eu gravar; edição com legendas na tela; design; atualização do Perfil da Empresa no Google; relatório mensal com as métricas abaixo.', metricas: ['Alcance de quem ainda não me segue', 'Visualizações completas e tempo médio dos vídeos', 'Envios e salvamentos por publicação', 'Visitas ao perfil e cliques no link ou no WhatsApp', 'Contatos gerados por canal'] },
    social: { label: 'Social media', entregas: 'Calendário mensal; criação e agendamento de 3 publicações por semana; legendas; resposta a comentários em horário comercial; relatório mensal com as métricas abaixo.', metricas: ['Alcance de quem ainda não me segue', 'Envios e salvamentos por publicação', 'Visitas ao perfil e cliques no link ou no WhatsApp', 'Contatos gerados'] },
    video: { label: 'Videomaker e editor', entregas: 'Roteiro final a partir das minhas pautas; direção de uma sessão de gravação por mês (8 a 12 vídeos); edição vertical 9:16 com legendas na tela; capas; entrega em pasta compartilhada.', metricas: ['Visualizações completas e tempo médio por vídeo', 'Envios e salvamentos por vídeo', 'Prazo de entrega cumprido'] },
    design: { label: 'Designer', entregas: 'Identidade visual simples (paleta, fontes, ícones); modelos editáveis de carrossel, capas de vídeo e Destaques; aplicação no Perfil da Empresa no Google.', metricas: ['Modelos entregues e editáveis por mim', 'Consistência visual entre as publicações'] },
    trafego: { label: 'Gestor de tráfego', entregas: 'Estratégia de anúncios locais; criação e otimização de campanhas no Meta e no Google; acompanhamento semanal; relatório com as métricas abaixo; respeito às políticas de anúncios de saúde de cada plataforma.', metricas: ['Custo por conversa iniciada', 'Custo por consulta agendada', 'Taxa de agendamento das conversas vindas de anúncio', 'Investimento total e por campanha'] },
    atendimento: { label: 'Secretária ou equipe de atendimento', entregas: 'Responder contatos em até 15 minutos no horário de atendimento; usar os scripts aprovados; registrar origem e etapa de cada contato; confirmar consultas 48 e 24 horas antes; reativar pacientes conforme a rotina.', metricas: ['Tempo médio de primeira resposta', 'Taxa de agendamento dos contatos', 'Taxa de comparecimento', 'Pacientes reativados no mês'] },
    copy: { label: 'Redator(a) / copywriter', entregas: 'Legendas, roteiros e textos de página a partir das pautas aprovadas, no meu tom de voz, com revisão de ética antes da entrega.', metricas: ['Envios e salvamentos por publicação', 'Cliques no link ou no WhatsApp', 'Prazo de entrega cumprido'] }
  };

  // --- Utilidades
  function storeGet(key, fallback) {
    try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function storeSet(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function storeDel(key) { try { window.localStorage.removeItem(key); } catch (e) { /* noop */ } }
  function appKeys(incluirChave) {
    const out = [];
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0 && (incluirChave || k !== KEY_STORE)) out.push(k);
      }
    } catch (e) { /* storage indisponível */ }
    return out;
  }
  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function isoOf(d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
  function todayISO() { return isoOf(new Date()); }
  function fmtDate(iso) { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; }
  function fmtShort(iso) { if (!iso) return ''; const [, m, d] = iso.split('-'); return `${d}/${m}`; }
  function addDays(iso, n) { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return isoOf(d); }
  function mondayISO(iso) { const d = iso ? new Date(iso + 'T12:00:00') : new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return isoOf(d); }
  function normTxt(t) { return ' ' + String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + ' '; }
  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function copyText(txt, btn) {
    const original = btn.textContent;
    const done = () => { btn.textContent = 'Copiado ✓'; setTimeout(() => { btn.textContent = original; }, 1800); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(done).catch(() => fallbackCopyText(txt, done));
    } else fallbackCopyText(txt, done);
  }
  function fallbackCopyText(txt, done) {
    const ta = document.createElement('textarea');
    ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* noop */ }
    ta.remove(); done();
  }
  function notifyData() { document.dispatchEvent(new Event('buscaloopsaude:dados')); }
