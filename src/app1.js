  // ===================== CliniLoop =====================
  // Endereço do repositório no GitHub (preencha depois de criar). Vazio = link escondido.
  const REPO_URL = 'https://github.com/jordanrizetto-design/CliniLoop';

  const APP = 'CliniLoop';
  const APP_ID = 'CliniLoop';
  const PREFIX = 'cliniloop.';
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
  const MODO_KEY = PREFIX + 'modo.v1';
  const BETA_KEY = PREFIX + 'beta.v1';
  const reveladas = new Set();
  const TRILHA_KEY = PREFIX + 'trilha.v1';
  const JOR_KEY = PREFIX + 'jornada.v1';
  // "Pronto quando": o critério que mostra ao usuário onde cada passo termina.
  const TRILHA_FIM = {
    publico: 'você tem 10 dúvidas reais dos pacientes e a persona principal guardada.',
    nicho: 'uma frase de proposta de valor está guardada.',
    profissional: 'seu tom de voz e a persona de marca estão guardados.',
    perfil: 'bio, Perfil da Empresa no Google e LinkedIn estão atualizados, com link para agendar.',
    pautas: 'quatro pautas do calendário estão escolhidas e a frequência de publicação definida.',
    roteiro: 'o primeiro roteiro foi gravado, verificado e registrado no Diário de conteúdo.',
    reaproveitamento: 'um conjunto de peças (carrossel, guia e Reel) foi gerado e guardado.',
    formacao: 'formação e títulos estão comunicados no perfil e no LinkedIn.',
    campanha: 'a campanha foi gerada, passou pelo Verificador ético e está registrada.',
    colegas: 'dez colegas estão cadastrados e a carta foi enviada aos três mais próximos.',
    atendimento: 'as respostas rápidas estão salvas no WhatsApp e a confirmação de agendamento está em uso.',
    rastreador: 'todos os contatos abertos estão cadastrados, cada um com próximo passo e data.',
    assistente: 'a agenda em blocos da semana foi gerada.',
    painel: 'os números da semana foram lançados e o gargalo foi identificado.',
    etica: 'o texto foi revisado e corrigido.',
    briefing: 'o briefing foi enviado a quem vai produzir.'
  };

  // Etapas do Rastreador de pacientes (funil de sete etapas)
  const ETAPAS = ['Novo', 'Em conversa', 'Agendado', 'Avaliado', 'Plano proposto', 'Em tratamento', 'Encerrado'];
  const RESULTADOS = ['Alta e vínculo', 'Perdido', 'Pausado'];
  // Funil dos colegas do guia (Parte 13). Parceiro ativo = indicou nos últimos 90 dias.
  const ETAPAS_COLEGA = ['Mapeado', 'Apresentado', 'Primeira indicação', 'Parceiro ativo', 'Inativo'];
  const COLEGA_MIGRA = { 'Primeiro contato': 'Apresentado', 'Apresentação feita': 'Apresentado', 'Trocando indicações': 'Primeira indicação', 'Parceria ativa': 'Parceiro ativo' };
  const CONSENT = { atendimento: 'Atendimento', lembretes: 'Lembretes e retornos', conteudo: 'Conteúdos e novidades' };
  const ATIVIDADES = ['Mensagem', 'Ligação', 'Confirmação', 'Retomada', 'Falta (no-show)', 'Remarcação'];
  // Próximo passo típico de cada etapa (Parte 13 do guia)
  const PASSO_TIPICO = {
    'Novo': 'Responder em até 5 minutos', 'Em conversa': 'Oferecer dois horários', 'Agendado': 'Confirmação 48 h antes',
    'Avaliado': 'Apresentar plano ou conduta', 'Plano proposto': 'Acompanhamento do plano (2, 7 e 15 dias)', 'Em tratamento': 'Reavaliação programada',
    'Encerrado': 'Contato de acompanhamento e pedido de avaliação no Google'
  };

  // --- Regras de publicidade por conselho (conferidas em outubro de 2026)
  const COUNCILS = {
    medicina: {
      label: 'Medicina', sigla: 'CRM', conselho: 'CFM / CRM',
      norma: 'Resolução CFM nº 2.336/2023 (publicidade médica), em vigor desde 2024; revogou as Resoluções 1.974/2011, 2.126/2015 e 2.133/2015',
      ident: 'Nome, número do CRM e a palavra "MÉDICO"; especialidade só com RQE. Estabelecimento: registro no CRM e nome do Diretor Técnico. Nas redes, esses dados ficam na página principal do perfil. Pós-graduação lato sensu pode aparecer no currículo seguida de "NÃO ESPECIALISTA".',
      pode: [
        'Mostrar consultório, equipe e bastidores; selfies sem caráter sensacionalista ou de concorrência desleal.',
        'Informar valor da consulta, formas de pagamento e descontos em campanhas, sem venda casada nem premiação.',
        'Imagens de pacientes só com finalidade educativa: antes e depois em conjunto, mostrando resultados satisfatórios, insatisfatórios e complicações, com texto educativo, sem identificar o paciente e sem editar ou "melhorar" a imagem. Fotos do seu arquivo exigem autorização e anonimato. "Antes e depois permitido" não é autorização irrestrita.',
        'Divulgar equipamentos aprovados pela Anvisa e cursos educativos para leigos, com valor anunciado.'
      ],
      nao: [
        'Garantir ou insinuar resultado; "descobertas milagrosas".',
        'Sensacionalismo, autopromoção e conteúdo inverídico; atribuir capacidade privilegiada a aparelho ou técnica.',
        'Tom pejorativo com colegas, especialidades ou procedimentos.',
        'Anunciar que trata órgãos ou doenças específicas sem ser especialista (RQE).',
        'Serviços gratuitos em consultório privado como concorrência desleal; promoções casadas, premiações e consórcios.',
        'Transmitir consultas ou procedimentos em tempo real.',
        'Publicidade de medicamentos, insumos, órteses, próteses e suas marcas.',
        'Informação que leve a diagnóstico, procedimento ou prognóstico pela rede.'
      ],
      extra: 'Conteúdo de terceiros que você reposta passa a ser considerado seu, inclusive publicações de pacientes.',
      resumo: 'Pela Res. CFM 2.336/2023: identificar nome, CRM, a palavra "MÉDICO" e RQE (se especialista); sem garantir ou insinuar resultado, sensacionalismo ou autopromoção; imagens de pacientes só educativas, com resultados satisfatórios, insatisfatórios e complicações, sem identificar nem editar; sem transmitir consultas ou procedimentos; sem falar mal de colegas; não anunciar área de especialista sem RQE; valores e descontos permitidos, sem venda casada nem premiação; o que reposto vira conteúdo meu.',
      fontes: [
        ['CFM: Resolução 2.336/2023 (texto oficial)', 'https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2023/2336_2023.pdf'],
        ['Migalhas: o que mudou na publicidade médica', 'https://www.migalhas.com.br/quentes/393424/cfm-muda-regra-e-permite-antes-e-depois-de-pacientes-na-internet']
      ]
    },
    odontologia: {
      label: 'Odontologia', sigla: 'CRO', conselho: 'CFO / CRO',
      norma: 'Código de Ética Odontológica (Res. CFO 118/2012, com alterações da Res. CFO 271/2025), Res. CFO 196/2019 (antes e depois) e orientações do CRO',
      ident: 'Nome, categoria (cirurgião-dentista) e número do CRO. Clínica: nome e CRO da clínica, nome e CRO do responsável técnico. Especialidade só se registrada no CRO; sem ela, use "clínico geral" e informe as áreas de atuação. No antes e depois, nome e CRO de quem fez o procedimento vão na própria imagem.',
      pode: [
        'Conteúdo educativo, bastidores, equipe e tecnologia da clínica.',
        'Endereço, telefone, e-mail e horário de atendimento.',
        'Antes e depois (Res. CFO 196/2019) só pelo cirurgião-dentista que executou o procedimento, com tratamento concluído (o registro do diagnóstico é o "antes"), com nome e CRO na imagem. O CFO não tem modelo de termo e recomenda, além da autorização verbal, autorização formal por escrito do paciente.'
      ],
      nao: [
        'Antes e depois no perfil da clínica (pessoa jurídica): segue proibido. Também é vedado divulgar trabalho de outro dentista.',
        'Publicações de "antes, durante e depois"; procedimentos complexos só em publicação científica.',
        'Divulgar preços, descontos, gratuidade ou frases de apelo a preço ("cabe no seu bolso").',
        'Promessa de resultado, sensacionalismo e autopromoção.',
        'Identificar marcas de materiais, equipamentos e instrumentais.',
        'Influenciador em troca de tratamento; compra de seguidores; exibir paciente sem autorização.',
        'Captação por telemarketing ativo, alto-falante ou plaqueteiros.'
      ],
      extra: 'O antes e depois "não está liberado de forma indiscriminada" (FAQ do CFO). A Res. CFO 271/2025 mudou regras sobre cartões de desconto e sobre brindes, prêmios e sorteios: confirme com o seu CRO antes de qualquer ação desse tipo. O guia do CROSP não informa data; confirme a versão.',
      resumo: 'Pelo Código de Ética Odontológica, Res. CFO 196/2019 e orientações do CRO: identificar nome, categoria e CRO (clínica: CRO da clínica e do responsável técnico); sem preços, descontos, gratuidade ou apelo a preço; sem promessa de resultado, sensacionalismo ou autopromoção; sem "antes, durante e depois"; antes e depois só pelo dentista que executou, tratamento concluído, com nome e CRO na imagem e autorização por escrito, nunca no perfil da clínica (pessoa jurídica); sem marcas de materiais.',
      fontes: [
        ['CFO: FAQ da Resolução 196/2019', 'https://website.cfo.org.br/resolucao-cfo-196-2019/'],
        ['CROSP: regras de publicidade odontológica', 'https://site.crosp.org.br/uploads/arquivo/3724579826b71ed53e3c7d0ff3104a64.pdf'],
        ['Resolução CFO-271/2025', 'https://sistemas.cfo.org.br/visualizar/atos/RESOLU%C3%87%C3%83O/SEC/2025/271']
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
      norma: 'Res. COFFITO 532/2021 (publicidade e uso de imagem) e Código de Ética e Deontologia da Fisioterapia (Res. COFFITO 424/2013)',
      ident: 'Toda publicação traz nome do profissional, número de inscrição no CREFITO e data. Use a palavra "fisioterapeuta"; especialidade só se reconhecida pelo COFFITO. Não substitua o título por termos como "terapeuta corporal".',
      pode: [
        'Endereço, telefone, horários, convênios, instalações, métodos e logomarca.',
        'Textos, imagens e vídeos de orientação à população.',
        'Imagens, textos e áudios autênticos de pacientes só com autorização prévia por TCLE, do próprio paciente ou do representante legal.',
        'Divulgação coletiva em serviço multiprofissional.'
      ],
      nao: [
        'Sensacionalismo, concorrência desleal e promessa de resultado ou de terapia "infalível".',
        'Divulgar casos clínicos de autoria de terceiros.',
        'Expor dados que identifiquem o paciente, inclusive antes e depois, sem autorização formal prévia. Divulgação irregular de imagem de paciente é infração ética de manifesta gravidade.',
        'Usar depoimentos ou agradecimentos de pacientes para autopromoção.',
        'Divulgar valores fora do local de atendimento ou de forma que configure concorrência desleal.',
        'Consulta ou prescrição sem avaliação, salvo casos regulamentados pelo COFFITO.'
      ],
      extra: 'Você responde ao conselho pelo conteúdo técnico de artigos, entrevistas e vídeos.',
      resumo: 'Pela Res. COFFITO 532/2021 e pelo Código de Ética (Res. 424/2013): toda publicação com nome, número do CREFITO e data; imagem, texto ou áudio de paciente só com TCLE prévio; sem sensacionalismo, concorrência desleal ou promessa de resultado infalível; sem casos clínicos de terceiros; sem expor paciente identificável, inclusive antes e depois, sem autorização formal; sem depoimentos para autopromoção; sem valores fora do local de atendimento.',
      fontes: [
        ['COFFITO: Resolução 532/2021', 'https://www.coffito.gov.br/nsite/?p=18752'],
        ['Resolução COFFITO nº 424/2013 (Código de Ética)', 'https://www.normasbrasil.com.br/norma/resolucao-424-2013_257114.html']
      ]
    },
    nutricao: {
      label: 'Nutrição', sigla: 'CRN', conselho: 'CFN / CRN',
      norma: 'Código de Ética e de Conduta do Nutricionista (Resolução CFN 599/2018), capítulos IV e V, sobre comunicação e marcas',
      ident: 'Nome, a palavra "nutricionista" e o número do CRN com a região (ex.: CRN-3 00000). Nas redes, esses dados ficam na página principal do perfil.',
      pode: [
        'Conteúdo focado em promoção da saúde e educação alimentar, com base científica e o aviso de que os resultados podem não ocorrer da mesma forma para todos.',
        'Divulgar resultados do seu trabalho com autorização escrita.',
        'Mostrar como funciona a consulta e o plano alimentar, leitura de rótulos e a rotina do consultório.'
      ],
      nao: [
        'Garantir resultado ou alegar exclusividade.',
        'Sensacionalismo.',
        'Divulgar imagem corporal, sua ou de terceiros, atribuindo resultado a produto, técnica ou protocolo, mesmo com autorização (exceto em eventos e publicações científicas).',
        'Usar honorários, promoções e sorteios como publicidade.',
        'Associar a própria imagem a marcas de alimentos ou fazer publicidade comercial de marcas.'
      ],
      extra: 'No preparo de refeições e na rotina do consultório, mantenha marcas fora de destaque. Mitos sobre dietas da moda e alimentos "proibidos" são bons temas para desmistificar.',
      resumo: 'Pelo Código de Ética e de Conduta do Nutricionista (Res. CFN 599/2018): identificar nome, "nutricionista" e CRN com a região; conteúdo de promoção da saúde e educação alimentar com base científica e o aviso de que resultados variam; sem garantir resultado nem alegar exclusividade; sem sensacionalismo; nunca usar imagem corporal (minha ou de terceiros) atribuindo resultado a produto, técnica ou protocolo; sem honorários, promoções ou sorteios como publicidade; sem associar minha imagem a marcas de alimentos.',
      fontes: [
        ['CFN: Resolução 599/2018 (Código de Ética e de Conduta)', 'https://cfn.org.br/wp-content/uploads/resolucoes/Res_599_2018.html'],
        ['CFN: Código de Ética e de Conduta do Nutricionista (PDF)', 'https://www.cfn.org.br/wp-content/uploads/2019/06/Novo_Codigo_de_Etica-e-de-Conduta-do-Nutricionista.pdf']
      ]
    }
  };
  // Saúde mental: cuidados adicionais (psiquiatria e psicologia)
  const SAUDE_MENTAL = 'Em saúde mental, use linguagem responsável e sem estigma, sem gerar medo nem estimular autodiagnóstico: evite "5 sinais de que você tem TDAH" e prefira "quando vale procurar avaliação". Nunca use casos reais, mesmo anonimizados, como chamariz. Em psicologia e psiquiatria, a falta pode ser sinal clínico: o contato de acompanhamento parte de critério clínico, nunca de meta comercial. Em temas de suicídio, siga as recomendações de comunicação responsável, informe o CVV (188) e nunca use o tema para captar pacientes.';

  const PROFISSIONAIS = {
    medico: { label: 'Médico(a)', council: 'medicina', titulo: 'médico(a)' },
    psiquiatra: { label: 'Psiquiatra', council: 'medicina', titulo: 'médico(a) psiquiatra', mental: true },
    dentista: { label: 'Dentista', council: 'odontologia', titulo: 'cirurgião(ã)-dentista' },
    psicologo: { label: 'Psicólogo(a)', council: 'psicologia', titulo: 'psicólogo(a)', mental: true },
    fisioterapeuta: { label: 'Fisioterapeuta', council: 'fisioterapia', titulo: 'fisioterapeuta' },
    nutricionista: { label: 'Nutricionista', council: 'nutricao', titulo: 'nutricionista' },
    multi: { label: 'Clínica multiprofissional', council: null, titulo: 'clínica multiprofissional' }
  };
  // Ferramentas que sobem na ordem conforme o tipo de profissional
  const PROF_ROTA = {
    medico: ['perfil', 'pautas'], psiquiatra: ['colegas', 'pautas'], dentista: ['atendimento', 'campanha'],
    psicologo: ['colegas', 'perfil'], fisioterapeuta: ['colegas', 'campanha'], nutricionista: ['colegas', 'pautas'], multi: ['rastreador', 'atendimento']
  };

  const REGRAS_GERAIS = [
    'Paciente identificável só com autorização por escrito para aquele uso. Dado de saúde é dado pessoal sensível pela LGPD.',
    'Sem promessa de cura ou resultado garantido, sem superlativos e sem gerar medo: além do conselho, pode ser publicidade enganosa pelo Código de Defesa do Consumidor.',
    'Em anúncios, não afirme nem sugira condição de saúde de quem lê ("você tem dor nas costas?"): as políticas da Meta sobre atributos pessoais vetam, e o Google também restringe anúncios de saúde.',
    'Parceria paga ou permuta precisa ser sinalizada como publicidade.',
    'Escreva sobre o tema, não sobre a pessoa ("Ansiedade tem tratamento", e não "Você sofre de ansiedade?").',
    'Não pague, não receba e não prometa vantagem financeira por indicação de paciente: a indicação entre colegas é técnica, não comercial.',
    'LGPD na prática: consentimento específico para mensagens de relacionamento, com saída fácil ("responda SAIR"); nunca suba lista de pacientes para públicos personalizados de anúncios sem base legal e consentimento; acesso por função (a recepção vê agenda, não evolução clínica); transcrições de consultas e lives não viram conteúdo sem autorização formal e anonimização.'
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
  const CONTA = { profissional: 'perfil do profissional (pessoa física)', clinica: 'perfil da clínica (pessoa jurídica)', ambos: 'perfil do profissional e perfil da clínica' };
  const PRODUTOR = { eu: 'eu mesmo(a)', equipe: 'eu, com ajuda da equipe', terceiro: 'vou contratar agência ou social media' };
  const CAMERA = { alto: 'gosto de aparecer na câmera', medio: 'apareço, mas sem muita exposição', baixo: 'prefiro não aparecer na câmera' };

  const TOOL_NAMES = {
    config: 'Comece aqui', publico: 'Público, ICP e persona', profissional: 'Persona do profissional', nicho: 'Nicho e diferencial',
    perfil: 'Perfis e presença', pautas: 'Pautas e palavras-chave', roteiro: 'Roteiros e copy', reaproveitamento: 'Reaproveitamento de conteúdo', formacao: 'Formação e autoridade',
    campanha: 'Gerador de campanhas', colegas: 'Rede de colegas', atendimento: 'Atendimento e agendamento', rastreador: 'Rastreador de pacientes',
    assistente: 'Assistente da semana', painel: 'Painel e diagnóstico', etica: 'Verificador ético', briefing: 'Briefing para terceiros',
    ferramentas: 'Ferramentas', ebook: 'Playbook da clínica'
  };
  const FUNNEL_STAGES = [
    { nome: 'Posicionamento', desc: 'Quem você quer atender, por que você e como você fala.', tools: ['config', 'publico', 'profissional', 'nicho'], num: null },
    { nome: 'Conteúdo', desc: 'Perfis prontos, pautas de dúvidas reais e roteiros publicados com constância.', tools: ['perfil', 'pautas', 'roteiro', 'reaproveitamento', 'formacao'], num: 'conteudos', numLabel: 'publicados' },
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
    reaproveitamento: { nome: 'Reaproveitamento de conteúdo', fazer: 'Escolha uma aula, podcast ou entrevista em que você participou bem, cole a transcrição e gere o primeiro conjunto: carrossel, guia e Reel.', revisar: 'Compare o tempo por conjunto, o número de correções e os salvamentos, envios e acessos ao guia antes de fazer o próximo.' },
    formacao: { nome: 'Formação e autoridade', fazer: 'Pesquise congressos e cursos dos próximos 12 meses e defina como comunicar seus títulos no perfil e no LinkedIn.', revisar: 'Atualize o perfil com eventos e formações concluídos.' },
    campanha: { nome: 'Gerador de campanhas', fazer: 'Escolha um modelo, gere a ficha e as peças, passe tudo pelo Verificador ético e registre a campanha.', revisar: 'Compare as campanhas registradas por agendados e tratamentos iniciados, não por cliques.' },
    colegas: { nome: 'Rede de colegas', fazer: 'Cadastre dez colegas que atendem o mesmo paciente antes ou depois de você e envie a carta de apresentação aos três mais próximos.', revisar: 'Devolva as contrarreferências pendentes, agradeça as indicações da quinzena e veja quem está ativo (indicou nos últimos 90 dias).' },
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
    ['Gravar vídeo', 'Celular, tripé, ring light ou painel de LED, microfone de lapela', 'Primeiro som, depois luz, por último câmera (Parte 6)'],
    ['Falar sem decorar', 'BIGVU, PromptSmart, Teleprompter.com', 'Teleprompter no celular, com rolagem pela voz em alguns (Parte 6)'],
    ['Editar vídeo', 'Editores nativos das redes, Edits (Meta), CapCut, Canva, InShot, Descript', 'Comece pelo nativo; revise as legendas automáticas (Parte 7 e Anexo A)'],
    ['Gerar imagens com IA', 'ChatGPT, Gemini, Meta AI, Canva, Adobe Firefly', 'Ilustração, nunca paciente ou resultado; revise a anatomia (Anexo A)'],
    ['Avatar e voz com IA', 'HeyGen, Synthesia', 'Só a sua imagem e voz, com aviso de IA (Parte 7)'],
    ['Agendar e medir posts', 'Meta Business Suite, Metricool, mLabs', 'Calendário e relatórios de Instagram e YouTube'],
    ['Reaproveitamento', 'Transcrição do app de gravação ou do YouTube, Claude', 'Da aula ou do podcast às peças; nunca transcreva consultas'],
    ['Comentário que leva ao guia', 'Manychat', 'Exige configuração e teste; respeite as regras do conselho'],
    ['Ideias e palavras-chave', 'Google Trends, Answer The Public, Planejador de palavras-chave do Google Ads', 'Pautas a partir do que o paciente pesquisa'],
    ['Vídeos curtos fora do Instagram', 'TikTok, TikTok Studio', 'Opcional; publique sem marca d\'água de outra rede; anúncios pelo Promote ou TikTok Ads Manager (Anexo A)'],
    ['Impulsionamento', 'Botão Turbinar no Instagram, Meta Business Suite', 'O primeiro anúncio de quem nunca anunciou (Parte 9)'],
    ['YouTube', 'YouTube Studio, TubeBuddy ou vidIQ', 'Títulos, capítulos e análise de retenção'],
    ['Anúncios', 'Gerenciador de Anúncios da Meta, Google Ads', 'Pixel, API de Conversões, tag do Google'],
    ['Medição do site', 'Google Analytics 4, Google Tag Manager', 'Conversões de WhatsApp, ligação e formulário'],
    ['Presença local', 'Perfil da Empresa no Google, Doctoralia', 'Avaliações e agendamento online'],
    ['Atendimento', 'WhatsApp Business (app ou API oficial)', 'Respostas rápidas, etiquetas, catálogo de serviços'],
    ['CRM comercial', 'CliniLoop, RD Station CRM, Kommo, Pipedrive, HubSpot', 'Funil, próximos passos, automações'],
    ['Agenda e prontuário', 'iClinic, Feegow, Amplimed, Simples Dental, Clinicorp', 'Agenda, confirmação e prontuário eletrônico (fora do CRM)'],
    ['Assistentes de IA', 'Claude, ChatGPT, Gemini, Copilot', 'Use com as quatro regras de IA; nunca com dados de pacientes']
  ];

  // Geradores de imagem por ferramenta de IA (Parte 7 e Anexo A do guia). Listados, não avaliados.
  const IMG_IA = [
    ['ChatGPT', 'Gerador de imagens do próprio ChatGPT', 'Ilustrações a partir de descrições longas, edição por conversa, texto curto na imagem', 'Plano gratuito com limite diário'],
    ['Gemini (Google)', 'Modelos de imagem do Gemini (Nano Banana)', 'Edição de fotos por conversa, variações rápidas, alta resolução', 'Limites variam por plano'],
    ['Meta AI', 'Gerador dentro do WhatsApp, do Instagram e do Facebook', 'Ilustrações rápidas sem sair dos apps que você já usa', 'Gratuito; varia por país'],
    ['Copilot (Microsoft)', 'Gerador de imagens do Copilot', 'Ilustrações e ícones simples', 'Gratuito com limites'],
    ['Claude', 'Não gera fotos nem ilustrações realistas', 'Infográficos, fluxogramas e diagramas criados como página ou código', 'Útil para explicar etapas'],
    ['Canva', 'Dream Lab e Mídia Mágica', 'Imagem que já entra no design com a identidade da clínica', 'Cota mensal pequena no gratuito'],
    ['Adobe Firefly e Express', 'Modelos Firefly', 'Uso comercial com treinamento licenciado; edição de partes da imagem', 'Créditos mensais'],
    ['Midjourney', 'Midjourney', 'Ilustrações com acabamento artístico', 'Só planos pagos'],
    ['Ideogram', 'Ideogram', 'Imagens com texto longo e legível (cartazes, capas)', 'Créditos gratuitos limitados'],
    ['CapCut (Dreamina)', 'Gerador de imagens do CapCut', 'Capas e imagens dentro do fluxo de edição de vídeo', 'Créditos por plano']
  ];
  const IMG_RECOMENDA = {
    'ilustração educativa': 'ChatGPT ou Gemini para criar; Canva para montar a peça com a sua identidade',
    'ícone ou elemento gráfico': 'Canva (Dream Lab) ou Copilot; para um conjunto coerente, peça todos no mesmo pedido',
    'fluxograma ou infográfico': 'Claude, que monta o diagrama como página; finalize no Canva',
    'cenário ou ambiente (sem pessoas)': 'Gemini ou ChatGPT; Adobe Firefly se a peça for para anúncio',
    'capa com texto': 'Ideogram ou Canva; melhor ainda: gere a imagem sem texto e escreva o texto no Canva'
  };

  // Referências de criadores clínicos brasileiros (Parte 4 do guia): amostra editorial da skill Creator
  // (outubro de 2026), não um ranking. Use as estruturas, não os conselhos clínicos.
  const BENCH = [
    ['Ana Escobar', 'medicina', 'Pediatria', '@draanaescobar', 'Pergunta específica, acolhimento, passos compreensíveis, CRM e RQE visíveis.'],
    ['Bruna Conde', 'odontologia', 'Odontologia', '@drabrunaconde', 'Quadro Mito ou Verdade com afirmações verificadas.'],
    ['José Arbex Filho', 'odontologia', 'Odontologia estética', '@arbexfilho', 'Analogia concreta para explicar raciocínio e acompanhamento.'],
    ['Paulo Muzy', 'medicina', 'Ortopedia e medicina esportiva', '@paulomuzy', 'Dúvidas gerais com proximidade e ressalvas.'],
    ['Dayan Siebra', 'medicina', 'Cirurgia vascular', '@dayansiebra', 'Dupla entrevistador e especialista com objetos do cotidiano.'],
    ['Leonardo Ávila', 'medicina fisioterapia', 'Dor', '@tudosobredor', 'Série temática com conversa e bibliografia.'],
    ['Bernardo Sampaio', 'fisioterapia', 'Fisioterapia', '@bernardosam', 'Pergunta real anonimizada, resposta concisa com limites.'],
    ['Robson Sitta', 'fisioterapia', 'Fisioterapia ortopédica', '@dr.robsonsitta', 'Raciocínio clínico mostrado com modelo, sem prescrição universal.']
  ];
  const BENCH_PADROES = 'Padrões recorrentes: problema específico na abertura; explicação concreta (objetos, analogias, modelos), sem estilo único vencedor; autoridade visível, mas não autossuficiente; quadros e continuidade; um próximo passo por peça; limites clínicos que sobrevivem ao corte curto.';

  // As bases do método (créditos)
  const METODO = {
    bases: [
      ['Guia CliniLoop', 'método', 'Conquistar pacientes é um projeto, com objetivo, etapas, registros e revisões. Seis etapas, sete decisões do paciente (atenção, confiança, indicação, contato, agendamento, comparecimento, adesão) e três caixas em cada parte: Prompt, Na prática e No CliniLoop.'],
      ['Oceano Azul', 'estratégia', 'Sair da disputa por atenção com conteúdo igual ao de todos. As quatro ações (eliminar, reduzir, elevar, criar) em relação ao padrão do setor viram uma proposta de valor própria e ética.'],
      ['Escada de crescimento', 'método de perfis', 'Sete degraus: entender a plataforma, definir a promessa (transformação, adjetivos de marca, temas de conteúdo), montar a vitrine, produzir com rotina, ler os números, combinar formatos e fixar metas.'],
      ['Formatos recorrentes', 'síntese de formatos', 'Promessa, curiosidade e recompensa; quadros recorrentes, personagens editoriais, biblioteca de formatos, análise de referências, frequência que cabe na revisão e o ciclo de adaptação (Referência, Observação, Adaptação, Troca).'],
      ['Reaproveitamento', 'método', 'O que falta à maioria dos especialistas não é conhecimento, é reaproveitamento: uma aula, podcast ou entrevista vira carrossel, guia, Reel e Stories, com registro de ideias, autoria e pendências.'],
      ['Pesquisa e normas', 'out/2026', 'Sinais do algoritmo do Instagram (tempo de visualização, envios por alcance e curtidas por alcance confirmados pela plataforma; o resto é heurística de mercado) e regras de publicidade do CFM, CFO, CFP, COFFITO e CFN.']
    ],
    fluxo: ['Ideia', 'Roteiro', 'Revisão editorial', 'Revisão clínica e ética', 'Gravação', 'Revisão final', 'Publicação', 'Análise'],
    aviso: 'O CliniLoop usa princípios dessas fontes, não reproduz o material dos cursos. Rótulos pedagógicos (como "viciante") não são métricas, e linguagem sobre emoção e neuroquímica é editorial, não evidência científica. O ciclo de adaptação não é o ROAS de mídia paga.'
  };

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
  function notifyData() { document.dispatchEvent(new Event('cliniloop:dados')); }
