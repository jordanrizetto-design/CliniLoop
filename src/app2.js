
  // ===================== Perfil do consultório =====================
  const configEl = document.getElementById('config');
  function readConfig() {
    const fd = new FormData();
    configEl.querySelectorAll('input, select, textarea').forEach((el) => {
      if (!el.name) return;
      if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
      fd.append(el.name, el.value);
    });
    const t = (k) => (fd.get(k) || '').toString().trim();
    return {
      objetivo: t('objetivo') || 'agenda', metaFrase: t('metaFrase'), profissional: t('profissional'), multiProf: fd.getAll('multiProf'),
      nome: t('nome'), registro: t('registro'), conta: t('conta') || 'profissional', especialidade: t('especialidade'), cidade: t('cidade'),
      atendimento: fd.getAll('atendimento'), pagamento: t('pagamento') || 'particular', equipe: t('equipe'),
      servicos: t('servicos'), publico: t('publico'), transformacao: t('transformacao'), baldes: t('baldes'), arroba: t('arroba'),
      canais: fd.getAll('canais'), tempo: t('tempo') || '2a3', produtor: t('produtor') || 'eu', camera: t('camera') || 'medio',
      sobre: t('sobre'), plano: t('plano') || 'free'
    };
  }
  function applyConfig(c) {
    configEl.querySelectorAll('input, select, textarea').forEach((el) => {
      if (!el.name || !(el.name in c)) return;
      const v = c[el.name];
      if (el.type === 'radio') el.checked = el.value === v;
      else if (el.type === 'checkbox') { if (Array.isArray(v)) el.checked = v.includes(el.value); }
      else if (typeof v === 'string') el.value = v;
    });
  }
  let cfg = readConfig();
  const listFrom = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
  const servicosList = () => listFrom(cfg.servicos);
  const baldesList = () => listFrom(cfg.baldes).slice(0, 3);
  const equipeList = () => listFrom(cfg.equipe);
  function profInfo() { return PROFISSIONAIS[cfg.profissional] || null; }
  function councilKeys() {
    if (!cfg.profissional) return [];
    if (cfg.profissional === 'multi') {
      const ks = (cfg.multiProf && cfg.multiProf.length ? cfg.multiProf : ['medico']).map((p) => PROFISSIONAIS[p] && PROFISSIONAIS[p].council).filter(Boolean);
      return [...new Set(ks)];
    }
    return [PROFISSIONAIS[cfg.profissional].council];
  }
  function councilObjs() { return councilKeys().map((k) => COUNCILS[k]); }
  function conselhosTxt() { const c = councilObjs(); return c.length ? c.map((x) => x.conselho).join(' e ') : 'conselho profissional'; }
  function isMental() {
    if (cfg.profissional === 'multi') return (cfg.multiProf || []).includes('psicologo');
    return !!(profInfo() && profInfo().mental);
  }
  function profLabel() {
    const p = profInfo();
    if (!p) return '(tipo de profissional não definido)';
    if (cfg.profissional === 'multi') return `clínica multiprofissional (${(cfg.multiProf || []).map((x) => PROFISSIONAIS[x] ? PROFISSIONAIS[x].label : x).join(', ') || 'profissões não informadas'})`;
    return p.titulo;
  }
  function objInfo() { return OBJETIVOS[cfg.objetivo] || OBJETIVOS.agenda; }
  function metaPadrao() { return (TEMPO[cfg.tempo] || TEMPO['2a3']).meta; }
  // Temas de conteúdo sugeridos pelo guia para a profissão (educar, humanizar, desmistificar)
  function temasSugeridos() {
    const ks = cfg.profissional === 'multi' ? (cfg.multiProf || []) : [cfg.profissional];
    const t = ks.map((k) => TEMAS_PROF[k]).filter(Boolean)[0];
    return t ? t.join('; ') : '';
  }
  // Para médicos, psiquiatras e psicólogos sem planos por pacote, as etapas 5 e 6 viram "Retorno agendado" e "Em acompanhamento" (Parte 11)
  function semPacote() { return ['medico', 'psiquiatra', 'psicologo'].includes(cfg.profissional); }
  function etapaLabel(e) {
    if (semPacote()) { if (e === 'Plano proposto') return 'Retorno agendado'; if (e === 'Em tratamento') return 'Em acompanhamento'; }
    return e;
  }
  function trim(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; }

  // --- Resultados guardados (decisões que alimentam as próximas ferramentas)
  function resultados() { const r = storeGet(RES_KEY, {}); return r && typeof r === 'object' ? r : {}; }
  function saveResultado(id, txt) {
    const r = resultados();
    if (txt && txt.trim()) r[id] = { t: txt.slice(0, 20000), d: todayISO() };
    else delete r[id];
    storeSet(RES_KEY, r);
    if (txt && txt.trim()) markUsed(id, true);
    notifyData();
  }

  function planoLinha() {
    if (cfg.plano === 'pro') return '\n- Uso o Claude Pro/Max: pode aprofundar, trazer mais ideias e mais fontes quando pesquisar, e oferecer a entrega final também como documento para baixar.';
    if (cfg.plano === 'api') return '\n- A resposta será exibida numa página web: use Markdown simples (títulos curtos, listas e tabelas) e indique as fontes das informações pesquisadas.';
    return '';
  }
  function contextBlock(selfId) {
    const o = objInfo();
    const L = [];
    L.push(`- Profissional: ${profLabel()}`);
    if (cfg.nome) L.push(`- Nome nas redes: ${cfg.nome}`);
    L.push(`- Registro no conselho: ${cfg.registro || '[CONFIRMAR: número de registro]'}`);
    L.push(`- Tipo de conta: ${CONTA[cfg.conta] || CONTA.profissional}`);
    if (cfg.especialidade) L.push(`- Especialidade ou área: ${cfg.especialidade}`);
    if (cfg.cidade) L.push(`- Cidade e bairro: ${cfg.cidade}`);
    L.push(`- Atendimento: ${(cfg.atendimento || []).join(', ') || 'presencial'} · pagamento: ${cfg.pagamento}`);
    if (cfg.equipe) L.push(`- Equipe: ${cfg.equipe}`);
    if (cfg.servicos) L.push(`- Serviços a divulgar: ${cfg.servicos}`);
    if (cfg.publico) L.push(`- Público ideal: ${cfg.publico}`);
    if (cfg.transformacao) L.push(`- Proposta de valor: ${cfg.transformacao}`);
    if (cfg.baldes) L.push(`- Temas de conteúdo: ${cfg.baldes}`);
    if ((cfg.canais || []).length) L.push(`- Canais que uso: ${cfg.canais.join(', ')}${cfg.arroba ? ' (' + cfg.arroba + ')' : ''}`);
    L.push(`- Objetivo dos próximos 90 dias: ${o.label}${cfg.metaFrase ? ' — ' + cfg.metaFrase : ''}`);
    L.push(`- Realidade: ${(TEMPO[cfg.tempo] || TEMPO['2a3']).label} para conteúdo; quem produz: ${PRODUTOR[cfg.produtor] || cfg.produtor}; ${CAMERA[cfg.camera] || ''}`);
    if (cfg.sobre) L.push(`- Formação e diferenciais: ${trim(cfg.sobre, 1200)}`);

    const res = resultados();
    const dec = SAVE_TOOLS.filter((id) => id !== selfId && res[id] && res[id].t)
      .map((id) => `### ${SAVE_TITLES[id]} (definido em ${fmtDate(res[id].d)})\n${trim(res[id].t, 1500)}`);

    const R = [];
    const cs = councilObjs();
    if (!cs.length) R.push('- Tipo de profissional ainda não definido: siga as regras gerais de publicidade em saúde no Brasil e avise o que depende do conselho.');
    cs.forEach((c) => R.push(`- Regras do ${c.conselho}: ${c.resumo}`));
    if (cfg.profissional === 'multi') R.push('- Peças institucionais da clínica seguem a regra mais restritiva entre os conselhos acima; cada profissional se identifica com o próprio registro.');
    if (isMental()) R.push('- ' + SAUDE_MENTAL);
    REGRAS_GERAIS.forEach((g) => R.push('- ' + g));
    R.push('- Não prometa alcance, seguidores ou viralização. Em saúde, o objetivo é clareza, confiança e o próximo passo adequado.');
    R.push('- Procedência: distinga princípio de método, adaptação, observação de outros criadores, informação clínica validada e hipótese de desempenho. Afirmação clínica sem fonte fica marcada como [PENDENTE DE VALIDAÇÃO], nunca como fato.');
    R.push('- Sem medo, escassez, vergonha ou insegurança corporal para vender; humor nunca ridiculariza quem sente dor. Imagem gerada nunca aparece como paciente real nem como evidência clínica; personagem encenado é identificado como representação; não invente depoimentos nem histórias de pacientes.');
    R.push('- Sem diagnóstico por comentário, foto ou vídeo; sem prescrição individual em conteúdo genérico; nunca peça histórico de saúde nos comentários (encaminhe para o atendimento).');
    R.push('- Se alguma ideia puder ferir essas regras, não a sugira, ou marque com [VERIFICAR NO CONSELHO] e explique por quê.');
    R.push('- Nunca use, peça ou invente dados que identifiquem pacientes. Não invente números, títulos ou casos: marque [CONFIRMAR] ou [ESTIMATIVA].');

    return `

---
Contexto do meu consultório (considere em toda a resposta):
${L.join('\n')}
- Orientação para o meu objetivo: ${o.guia}
${dec.length ? `\nDecisões que já tomei (use como base, sem repetir):\n${dec.join('\n\n')}\n` : ''}
Regras que você deve seguir:
${R.join('\n')}${planoLinha()}

Responda em português do Brasil, com linguagem clara.`;
  }

  // ===================== Prompts =====================
  const nv = (v, alt) => (v && String(v).trim() ? v : (alt || '(não informado)'));
  function mascarar(txt) {
    return String(txt || '')
      .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[E-MAIL]')
      .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF]')
      .replace(/(\+?55\s?)?(\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}\b/g, '[TELEFONE]');
  }
  function colegaPorId(id) { return colegas.find((c) => c.id === id) || null; }

  const promptBuilders = {
    publico: (get) => `Aja como estrategista de marketing de saúde, especialista em clínicas e consultórios no Brasil.

Quero definir com clareza quem devo atrair.
- Quem atendo hoje: ${get('hoje')}
- Meus melhores pacientes têm em comum: ${nv(get('melhores'))}
- Serviços a priorizar: ${nv(get('servicos'), cfg.servicos)}
- Dúvidas que mais ouço: ${get('duvidas')}
- Objeções e medos: ${nv(get('objecoes'))}
- Como os pacientes descrevem o problema: ${nv(get('palavras'))}
- Quem prefiro não atrair: ${nv(get('evitar'))}

Entregue:
1. Público-alvo em uma frase e em até 3 segmentos, indicando qual priorizar primeiro e por quê, considerando meu objetivo.
2. ICP (perfil de paciente ideal) em tabela: problema ou objetivo de saúde, momento de vida e gatilho de busca, faixa etária, região e deslocamento, forma de pagamento, capacidade de investimento, quem participa da decisão e onde se informa (redes, Google, indicação de colega ou de paciente).
3. Anti-ICP: perfis com pouca chance de bom resultado para os dois lados e como a comunicação pode filtrar com respeito, sem discriminar.
4. Persona principal e secundária: nome fictício, idade, rotina, problema e impacto no dia a dia, medos e crenças erradas, objeções, desejos (resultado funcional e emocional), gatilhos para buscar ajuda agora, onde consome conteúdo e em que formatos, 10 frases na voz dela para usar em ganchos e o que NÃO dizer a ela.
5. Mapa de empatia da persona principal (pensa e sente, ouve, vê, fala e faz, dores, ganhos), em tabela.
6. Jornada: como descobre, o que pesquisa, o que compara e o que a faz agendar, comparecer, iniciar o tratamento, voltar e indicar.
7. As 15 perguntas que esse paciente digita no Google ou faz nas redes antes de marcar.

Use a pesquisa na web quando ajudar (dados da região, buscas comuns) e cite as fontes. As personas são modelos baseados em padrões, não pessoas reais.`,

    profissional: (get) => `Aja como estrategista de marca pessoal para profissionais de saúde.

Quero definir como apareço nas redes.
- Por que escolhi minha área: ${get('porque')}
- Valores e crenças sobre cuidado: ${nv(get('valores'))}
- Como pacientes e colegas me descrevem: ${nv(get('elogios'))}
- Histórias que posso contar: ${nv(get('historias'))}
- Temas ou formatos que não quero: ${nv(get('limites'))}
- Perfis que admiro: ${nv(get('refs'))}

Entregue:
1. Arquétipo predominante e secundário (por exemplo Cuidador, Sábio, Mentor, Explorador), com justificativa e exemplos de como aparecem no conteúdo.
2. No máximo 5 adjetivos de marca e o comportamento que cada um exige no conteúdo.
3. Tom de voz em tabela "faço / não faço", com exemplos de frases.
4. Bio curta para Instagram (até 150 caracteres, com especialidade, cidade e identificação do conselho), bio média para Google e site, e história de origem em até 200 palavras, em primeira pessoa.
5. Três bandeiras que defendo e três mitos que combato, com base em evidência.
6. Como aparecer de forma confortável para o meu nível de conforto com a câmera, incluindo formatos sem rosto se for o caso.
7. Limites éticos e pessoais da marca (o que nunca publicar).
8. Identidade de marca em 1 página: voz, paleta (cor principal pelo significado), tipografia, ambiente, padrões visuais e até 3 bordões, coerentes com o registro profissional. Mostrar cuidado e organização é diferente de sugerir que o ambiente garante resultado.
9. Confiança na câmera: um plano de 2 semanas de ensaios curtos sem obrigação de publicar, revisando um aspecto por vez (clareza, velocidade, apoio visual), e como pedir feedback. Não é tratamento para ansiedade.
10. Gravação no celular: ponto silencioso, luz suficiente, fundo sem dados de pacientes, teste de voz, conferir o recorte na tela e revisar termos clínicos nas legendas automáticas. Sem filtros que alterem a aparência de resultado clínico.

Autoridade em saúde vem de clareza, constância e responsabilidade, não de autopromoção.`,

    nicho: (get) => `Aja como estrategista de posicionamento para clínicas e consultórios.

- Formações, métodos e tecnologias que domino: ${get('formacao')}
- Casos que mais gosto de atender: ${nv(get('gosta'))}
- Até onde quero focar: ${get('amplitude')}
- Concorrentes ou referências na minha região: ${nv(get('concorrentes'), '(não informei: pesquise)')}

Entregue:
1. Ikigai profissional em tabela (o que amo, no que sou bom, o que minha região precisa, pelo que pagam) e as interseções.
2. Três opções de nicho (estreito, médio, amplo) com prós, contras, riscos e demanda local [ESTIMATIVA]; recomende uma.
3. Proposta de valor em 3 versões no formato "Ajudo [público] a [resultado] com [diferencial]", sem promessa de resultado.
4. Diferenciais verificáveis (formação, método, tecnologia, experiência, forma de atender) e como comunicá-los dentro das regras do conselho, sem superlativos.
5. Inteligência de nicho: pesquise na web os concorrentes citados e outros 10 a 20 perfis da minha área e região (Instagram, Google, YouTube), incluindo referências de outros mercados e em inglês. Em tabela: URL, formato, pergunta central, tipo de abertura, apoio visual, limite clínico, frequência, o que os pacientes elogiam nas avaliações públicas e lacunas não exploradas. Separe observação ("há uma pergunta no começo") de hipótese ("a pergunta causou as visualizações", que exige teste). Leia estruturas, não copie texto nem identidade, e não sugira pauta só porque um vídeo teve pico de audiência se ele atrai um público que nunca buscará meu consultório.
6. Posicionamento em uma frase e 10 palavras-chave para bio, Google e legendas (serviço + cidade ou bairro).
7. Como testar o nicho em 30 dias antes de mudar tudo, e o que medir.`,

    perfil: (get, getAll) => `Você é consultor de marketing ético para profissionais de saúde no Brasil.

Perfis para revisar: ${getAll('redes')}
Link da bio hoje: ${get('link')}. Destaques e fixados: ${nv(get('destaques'))}
Textos atuais:
"""
${get('atual')}
"""

Antes de postar ou anunciar, o paciente precisa encontrar, em qualquer canal, a mesma resposta para três perguntas: quem é você, quem você ajuda e como marcar uma consulta.

Entregue, para cada canal escolhido:
1. (a) O que impede um paciente ou colega de confiar, (b) o que impede de agendar ou encaminhar e (c) a correção sugerida.
2. Reescrita pronta para colar, com a identificação obrigatória do meu conselho e do tipo de conta (profissional ou clínica), sem slogan de resultado, superlativos ou títulos e números inventados:
   - Instagram: 3 opções de nome do perfil com nome + especialidade em palavras que o paciente pesquisa, 3 bios de até 150 caracteres em quatro linhas (quem ajudo, com o quê, onde atendo, registro), Destaques (Comece aqui, Como funciona a consulta, Convênios e valores quando permitido, Localização, Dúvidas, Equipe) com o que vai em cada um, até 3 posts para fixar e um destino único para o link, com mensagem pronta para o WhatsApp e origem rastreada.
   - Perfil da Empresa no Google: nome exatamente como na fachada, categoria principal e secundárias, serviços com descrição informativa, descrição de até 750 caracteres, fotos que faltam (nunca de pacientes), atributos, e como pedir avaliações de forma neutra a todos os pacientes e respondê-las sem confirmar que a pessoa é paciente.
   - YouTube: nome igual ao do Instagram, descrição com proposta de valor, registro e link de agendamento, playlists por problema do paciente (não por formato) e roteiro do vídeo de apresentação fixado.
   - LinkedIn: 5 títulos de até 220 caracteres na fórmula [profissão e especialidade] | [área de atuação ou público] | [prova] | [onde atende], e um Sobre em quatro blocos (abertura, o que faço, provas, chamada para colegas que querem encaminhar), em primeira pessoa.
   - TikTok: mesmos nome, foto, credenciais e proposta de valor do Instagram, conta empresarial e o cuidado de não responder dúvidas clínicas individuais nos comentários.
3. SEO local: palavras-chave com serviço + cidade ou bairro, e onde usar cada uma (nome, bio, legendas, descrição).
4. Checklist final para eu marcar.${get('assistenteBio') ? `
5. Texto-base de um assistente de orientação para a página da bio: em uma ou duas perguntas, leva a pessoa ao destino certo (o guia, o vídeo completo, o agendamento). Ele se apresenta como assistente de IA, usa só a base aprovada de serviços e conteúdos, não inventa preços, resultados nem condições e nunca faz triagem clínica. Liste o que preciso aprovar antes de publicar e lembre que painel de conversas e métricas exigem implementação, hospedagem e proteção de dados.` : ''}`,

    pautas: (get, getAll) => `Aja como estrategista de conteúdo para saúde, com foco em SEO social e busca local.

Banco de dúvidas reais dos meus pacientes:
"""
${get('banco')}
"""
Formatos com que me sinto bem: ${getAll('formatos')}
Datas importantes: ${nv(get('datas'), '(nenhuma)')}

Entregue:
1. Palavras-chave por serviço e por cidade ou bairro (Google, Instagram e YouTube), em tabela: termo, intenção (informar, comparar, agendar), serviço e onde usar. Pesquise na web as buscas relacionadas (Google Trends, sugestões de busca, Answer The Public) e indique a fonte.
2. As dúvidas do banco organizadas por tema de conteúdo (${cfg.baldes || temasSugeridos() || 'sugira até 3 temas: educar, humanizar e desmistificar'}) e pelo momento da jornada: entender um sintoma, compreender a avaliação, comparar caminhos de cuidado, preparar-se para a consulta, acompanhar o tratamento, conhecer a equipe. Sem repetir e sem afirmar "todo mundo pergunta" além do que está no banco.
3. 30 pautas em tabela, cada uma registrada com: dúvida, público, estágio de decisão, formato, palavra-chave, fonte clínica necessária, imagem de apoio (eu, modelo anatômico ou ilustração), responsável pela revisão e CTA. Priorize por pertinência ao público, segurança clínica, possibilidade de explicar visualmente, originalidade e alinhamento com os serviços.
4. Dois ou três quadros recorrentes (séries com nome, bordão e estrutura fixa, como "Pergunta do consultório"), com 4 episódios cada.
5. Metas S.M.A.R.T. para 8 semanas (específicas, mensuráveis, alcançáveis, relevantes e com prazo), incluindo uma meta de tarefa e uma de contatos qualificados.
6. Frequência realista para ${(TEMPO[cfg.tempo] || TEMPO['2a3']).label}, com quem produz sendo ${PRODUTOR[cfg.produtor] || cfg.produtor}: versão mínima e ideal por canal. Constância vale mais que volume.
Referência do guia (Parte 4): profissional sozinho, 2 Reels + 1 carrossel por semana, Stories em dias de atendimento, 1 vídeo de YouTube por mês e 1 post de LinkedIn por semana; clínica com equipe, 3 Reels + 2 carrosséis por semana, Stories diários, 2 a 4 vídeos por mês e 2 posts de LinkedIn por semana. A frequência é a que eu consigo revisar.
7. Calendário de 4 semanas (dia, canal, formato, pauta) e rotina de produção em lote, com tempo estimado por etapa (cronometre e comprometa-se só com o que cabe).
8. "Uma peça longa, quatro entregas": como transformar uma pauta em vídeo longo, Reel para uma dúvida, carrossel de preparação e Stories sobre quem atende, cada um fazendo sentido sozinho.
9. Datas de conscientização dos próximos 3 meses relevantes para minha área, com abordagem educativa. Em Setembro Amarelo: comunicação responsável, CVV (188) e nada de captação.

Alcance não é garantido; foque em sinais que dependem de mim (retenção, envios, salvamentos, conversas).`,

    roteiro: (get) => {
      const f = get('formato');
      const video = /Reels|YouTube/.test(f);
      let instr;
      if (/YouTube/.test(f)) {
        instr = `1. Objetivo e público da peça, a promessa central (verdadeira) e a pergunta principal.
2. Três títulos com a mesma promessa verdadeira e uma ideia de miniatura que acrescente contexto (sem radiografia nem transformação fictícia).
3. Roteiro com fala e apoio visual: abertura de 0 a 20 s nomeando a dúvida; de 20 a 60 s respondendo o ponto central e o que depende de avaliação individual; 3 a 5 blocos (ideia, exemplo seguro, limitação); fechamento com recapitulação e próximo passo proporcional, sem urgência fictícia.
4. Capítulos com tempo e descrição com palavras-chave, fontes, identificação profissional e canal oficial.
5. Versão curta autossuficiente (Reels de 30 a 60 s): reescreva abertura e fechamento e mantenha as ressalvas. Um vídeo longo não vira bom Reel só por ser cortado.`;
      } else if (video) {
        instr = `1. Objetivo e público da peça, a promessa central (verdadeira) e a pergunta principal.
2. Cinco aberturas de até 3 segundos, de tipos diferentes (dúvida específica, mito, diferença entre A e B, o que a avaliação precisa esclarecer, o que preparar antes da consulta), com texto na tela de até 6 palavras, e qual testar primeiro. Nada de cura em segundos, ameaça, "segredo que escondem" ou "todo mundo pergunta" sem observação.
3. Três títulos ou capas com a mesma promessa.
4. Roteiro com fala e apoio visual: pergunta específica → resposta cedo → demonstração ou exemplo seguro (eu mesmo, modelo anatômico ou ilustração identificada) → limite da orientação → um único pedido → final que conecta ao início. A ideia principal precisa estar no primeiro enquadramento.
5. Texto na tela por bloco, sem cobrir o que é demonstrado, e direção de gravação no celular: ponto silencioso, luz, fundo sem dados de pacientes, teste de voz, conferir o recorte e não usar filtro que altere a aparência de resultado.
6. Legenda com palavra-chave, identificação profissional e fontes; de 0 a 5 hashtags relevantes.
7. Versão de 15 segundos autossuficiente, com as ressalvas.`;
      } else if (/carrossel/.test(f)) {
        instr = `1. Objetivo, promessa central e pergunta principal.
2. Slide a slide (7 slides): capa com promessa precisa; uma ideia por slide; penúltimo com o insight para guardar ou enviar; último com um único pedido e a identificação profissional. Texto de até 25 palavras por slide e sugestão visual. Nunca uma árvore de autodiagnóstico.
3. Três opções de capa e a legenda com palavra-chave e fontes.`;
      } else if (/Stories/.test(f)) {
        instr = `1. Tela a tela (5 a 8), com figurinha interativa onde fizer sentido. Enquete sobre temas, nunca sobre histórico sensível; resposta de caixinha não autoriza divulgar dados nem imagem.
2. Bastidores sem pacientes identificáveis.
3. A última tela leva à conversa no canal oficial, com a frase exata, e qual tela salvar nos Destaques.`;
      } else if (/LinkedIn/.test(f)) {
        instr = `1. Post de até 1.300 caracteres para colegas e parceiros: abertura forte, aprendizado ou caso genérico (sem identificar paciente), reflexão e pergunta final.
2. Três aberturas alternativas.
3. Como usar o post para iniciar conversas com colegas que indicam.`;
      } else {
        instr = `1. Três versões com estruturas diferentes (pergunta e resposta, história, problema e solução sem alarmismo), indicando a estrutura usada.
2. Respeite o limite de caracteres do formato e use uma única chamada para ação, levando ao canal oficial.
3. Sugestão de teste A/B com uma variável só.${/lista de transmissão/.test(f) ? '\n4. Inclua a forma de sair da lista em cada mensagem.' : ''}`;
      }
      const quadro = get('quadro');
      const ref = get('referencia');
      return `Aja como roteirista e copywriter de conteúdo ético para profissionais de saúde, seguindo uma escada de crescimento para o Instagram (entender a plataforma, definir a promessa, montar a vitrine, produzir com rotina, ler os números, combinar formatos e fixar metas) e formatos recorrentes com promessa, curiosidade e recompensa.

Formato: ${f}
Tema ou dúvida do paciente: ${get('tema')}
Tema de conteúdo: ${nv(get('balde'), '(não definido)')} · Momento da jornada: ${nv(get('momento'))} · Palavra-chave: ${nv(get('kw'), '[sugira uma com serviço + cidade]')} · Objetivo da peça: ${get('objetivoPeca')} · Como apareço: ${get('aparece')} · Tom: ${get('tom')}
Pontos técnicos e fontes: ${nv(get('notas'), '(nenhum: marque afirmações clínicas como [PENDENTE DE VALIDAÇÃO])')}${quadro ? `\nQuadro recorrente: "${quadro}". Mantenha a série reconhecível: uma pergunta por episódio, resposta cedo, exemplo seguro, ressalva e o mesmo bordão de abertura ou fechamento.` : ''}${ref ? `\nReferência para modelar: ${ref}\nUse o R.O.A.S. (Roteiro, Observação, Adaptação, Substituição): leia a estrutura da referência, observe como ela começa, sustenta, contextualiza e encaminha, adapte ao meu tema e substitua conteúdo, exemplos e identidade. Não copie texto, imagem nem identidade de terceiros.` : ''}

Entregue:
${instr}

Depois, em duas etapas separadas:
A. Revisão editorial: a peça é específica, compreensível e entrega a promessa? Corrija o que precisar.
B. Pendências para a revisão clínica e ética (que eu ou o responsável técnico faremos): afirmações que precisam de fonte, autorização de imagem, regra do conselho para minha profissão e tipo de conta. Separe o que impede a publicação do que são ajustes menores e não declare a peça pronta enquanto houver impedimento.

No final, inclua sempre:
- CTA único e o canal oficial.
- Palavra-chave usada e onde ela aparece (fala, texto na tela, legenda).
- Hipótese de teste com uma variável só (pergunta, abertura, demonstração ou convite) e as métricas para comparar (retenção, envios, salvamentos, mensagens).
- Plano para a primeira hora: avisar nos Stories e responder os comentários.
- O que foi evitado: promessa de resultado, superlativos, medo, vergonha, preço onde o conselho proíbe, afirmação sobre condição de saúde de quem lê, exposição de pacientes.

Linguagem simples, termos técnicos explicados, frases curtas. Pontuação de roteiro, se usar, é ferramenta pedagógica, não previsão de viralidade.`;
    },

    reaproveitamento: (get, getAll) => `Aja como editor(a) de conteúdo para profissionais de saúde, seguindo o método de reaproveitamento do Guia CliniLoop (Parte 5): uma aula, quatro entregas.

Vou colar a transcrição de ${get('fonte')} em que participei como ${get('papel')}.
Público: ${nv(get('publico'), cfg.publico || '[PÚBLICO]')}. Objetivo: ${get('objetivo')}. Profissão e conselho: ${profLabel()}, ${conselhosTxt()}.
Destino confirmado do CTA e do guia: ${nv(get('link'), '[SEM LINK: o guia não pode ser divulgado até eu informar um destino real]')}
Minha voz: ${nv(get('voz'), '(não informei: pergunte "isso parece algo que eu realmente diria?" ao revisar)')}
Entregas pedidas: ${getAll('entregas')}

1. Registro de ideias: liste as ideias aproveitáveis em tabela com nome curto, trecho e tempo, quem disse (eu ou o convidado), síntese fiel, exemplo presente na fonte, ressalva a preservar e destino da peça.
2. Escolha UM tema central para o conjunto (não junte assuntos desconexos só porque estão no mesmo episódio; se houver temas independentes, sugira outros conjuntos sem forçar quantidade).
3. Distribua a profundidade:
   - Carrossel: abertura com uma dúvida ou contradição sustentada na fonte, uma ideia por card, aplicação prática e fechamento com o próximo passo; legenda que complementa os cards, sem repetir.
   - Guia: entrega valor sozinho e não repete os cards (para quem serve, o problema, como aplicar em passos, um exemplo da fonte ou marcado como proposto, checklist e o link do episódio completo).
   - Reel de 30 a 45 s com gancho nos 3 primeiros segundos, em duas versões: roteiro falado e tópicos de gravação. Estime a duração lendo em voz alta.${/Stories/.test(getAll('entregas')) ? '\n   - Stories: bastidor de quem atende ou de como a aula foi preparada, sem pacientes.' : ''}${/comentário/.test(getAll('entregas')) ? '\n   - Comentário que leva ao guia: palavra-chave e mensagem automática, avisando que é preciso confirmar se a conta e a integração (ex.: Manychat) suportam o fluxo e testar o envio. Nada de sorteio, promoção ou preço onde for vedado, e nenhuma pergunta sobre histórico de saúde no Direct.' : ''}
4. Preserve autoria e voz: fala de convidado não vira experiência minha; nada de "eu testei" ou "meus pacientes conseguiram" sem suporte na fonte.
5. Pendências: afirmações clínicas sem fonte (marque [PENDENTE DE VALIDAÇÃO]; ressalvas precisam sobreviver ao corte curto), autoria a confirmar, links que faltam e pontos de compliance para a revisão clínica e ética, separada da revisão editorial.

Não invente experiências, números nem depoimentos. Não use dados de pacientes.
Transcrição:
"""
${mascarar(get('transcricao'))}
"""`,

    formacao: (get, getAll) => `Aja como mentor(a) de carreira científica e de autoridade para profissionais de saúde.

- Formação e títulos atuais: ${get('atual')}
- Procuro: ${getAll('busca')}
- Tempo e orçamento por ano: ${nv(get('orcamento'))}
- Onde posso ir: ${nv(get('onde'), 'Brasil e online')}

Entregue:
1. Pesquise na web congressos, jornadas e simpósios dos próximos 12 meses na minha área, no Brasil e online: nome, data, cidade, sociedade organizadora, link e por que vale a pena. Confirme as datas na fonte.
2. Cursos e certificações reconhecidos (sociedades, universidades, conselhos), com carga horária, custo aproximado e link; separe o que fortalece a confiança de pacientes e colegas do que é só "bom ter".
3. Oportunidades de publicação e visibilidade: revistas, blogs de sociedades, podcasts, imprensa local, palestras para leigos.
4. Caminho para o título de especialista no meu conselho, se ainda não tenho.
5. Como comunicar formação e eventos no perfil, no LinkedIn e no Google, sem autopromoção e sem anunciar títulos que não tenho.
6. Plano de 12 meses dentro do meu tempo e orçamento.`,

    campanha: (get, getAll) => {
      const canais = getAll('canais');
      const reativ = /consentiram/.test(canais);
      const tipo = get('tipo') || 'completa';
      const onde = nv(cfg.cidade, '[BAIRRO, CIDADE]');
      const quem = cfg.nome ? `${cfg.nome} (${profLabel()})` : profLabel();
      const regras = `Regras: normas do ${conselhosTxt()}, políticas de saúde da Meta e do Google, sem promessa de resultado, sem superlativos, sem medo, sem afirmar condição de saúde do usuário (fale do tema, não da pessoa), sem preço onde o conselho proíbe, sem segmentar público por condição de saúde e sem subir listas de pacientes para públicos personalizados. Marque com [CONFIRMAR] tudo que eu não informei e não invente números.`;
      if (tipo === 'impulsionamento') {
        return `Sou ${quem} em ${onde} e quero impulsionar o post abaixo na Meta (botão Turbinar). Serviço: ${get('servico')}. Objetivo: ${get('n')} pacientes agendados em ${get('duracao')}. Orçamento: ${nv(get('orcamento'), '[VALOR]')}.
Atendimento: ${nv(get('atendimento'), '[CONFIRMAR: quem responde no horário do anúncio]')}

Devolva:
1. Se o post é adequado para impulsionar e o que ajustar segundo as normas do ${conselhosTxt()} e as políticas de saúde da Meta. Só peças educativas que já foram bem no orgânico e passaram pela revisão clínica e ética.
2. O objetivo único (visitas ao perfil ou mensagens no WhatsApp) e por quê.
3. Público sugerido: raio em torno do consultório e faixa de idade, sem segmentar por condição de saúde; interesses em branco ou amplos.
4. Orçamento diário e duração que eu consiga manter por pelo menos 7 dias sem mexer, separando orçamento de mídia do custo de produção.
5. Mensagem de boas-vindas no WhatsApp, com uma pergunta simples que qualifica.
6. Por que um impulsionamento costuma ser recusado (texto que afirma condição do leitor, antes e depois, promessa ou preço vedado, música protegida) e como evitar.
7. O que medir, quando (não alterar nada nos dois ou três primeiros dias) e como registrar no CRM: origem "Impulsionamento: [post], [data]", custo por conversa, por agendamento e por paciente que compareceu.

Post: ${nv(get('post'), '[COLE O TEXTO E DESCREVA O VÍDEO]')}

${regras}`;
      }
      if (tipo === 'anuncios') {
        return `Atue como gestor de tráfego ético para saúde no Brasil.

Crie para ${quem} em ${onde}, serviço ${get('servico')}:
(a) 3 textos principais de até 125 caracteres e 3 títulos de até 40 caracteres para Meta Ads com CTA "Enviar mensagem";
(b) 15 títulos de até 30 caracteres e 4 descrições de até 90 caracteres para anúncio responsivo de pesquisa no Google, informativos e verificáveis;
(c) 20 palavras-chave com intenção e local e 15 negativas (por exemplo: grátis, curso, emprego, salário);
(d) recursos do Google (local, ligação, sitelinks, frases de destaque);
(e) mensagem de boas-vindas do WhatsApp que qualifica, sem triagem clínica.
Público e dúvida principal: ${nv(get('publico'), cfg.publico)}. Mensagem central: ${nv(get('mensagem'), '[CONFIRMAR]')}.
Tipos de mensagem que funcionam e são éticos: educativa com convite, processo transparente, acesso e conveniência, autoridade sem superlativo, desmistificação.

${regras} Psicólogos e psiquiatras: evite termos que impliquem diagnóstico do usuário.`;
      }
      return `Atue como estrategista de marketing ético para saúde no Brasil.

Monte uma campanha de ${get('duracao')} para ${quem} em ${onde}, serviço ${get('servico')}, objetivo ${get('n')} pacientes agendados, orçamento ${nv(get('orcamento'), 'sem anúncios pagos (só orgânico)')}.
- Público e dúvida principal: ${nv(get('publico'), cfg.publico)}
- Mensagem central: ${nv(get('mensagem'), '[CONFIRMAR]')}
- Canais: ${canais}
- Atendimento: ${nv(get('atendimento'), '[CONFIRMAR: quem responde, com qual roteiro, em quanto tempo]')}

Entregue:
1. Ficha da campanha (objetivo, público, mensagem central, peças, canais, orçamento e duração, atendimento, medição e compliance).
2. 3 roteiros de Reel (gancho, contexto, 3 a 5 pontos, CTA, legenda).
3. 1 carrossel de 7 slides.
4. Anúncios Meta (3 textos de até 125 caracteres, 3 títulos de até 40) e Google (15 títulos de até 30 caracteres, 4 descrições de até 90, 20 palavras-chave, 15 negativas). Se algum desses canais não estiver na lista acima, diga em uma linha se vale incluí-lo.
5. Mensagem de boas-vindas do WhatsApp e 3 respostas rápidas.
6. Calendário dia a dia.
7. Lista de verificação ética do ${conselhosTxt()}, da LGPD e das políticas da Meta e do Google, marcando o que precisa de atenção.
8. Medição: contatos, agendados, comparecimentos e planos iniciados por origem, custo por paciente que compareceu, e o nome curto da campanha para eu registrar como origem no rastreador. Separe orçamento de mídia de custo de produção.
9. Se houver impulsionamento: qual peça educativa já revisada impulsionar, objetivo único, público por raio e idade, a ação acompanhada e quando ler os resultados. Não autorize gasto automaticamente: eu aprovo cada valor.${reativ ? '\n10. Mensagens de reativação só para quem consentiu receber lembretes, com opção de sair ("responda SAIR") em cada mensagem.' : ''}

${regras}`;
    },

    colegas: (get) => {
      const c = colegaPorId(get('colega'));
      const para = c ? `${c.nome}${c.prof ? ' (' + c.prof + ')' : ''}` : 'um(a) colega de outra especialidade que atende o mesmo paciente';
      const tipo = get('tipo');
      const formato = get('formato');
      if (tipo === 'contrarreferencia') {
        return `Aja como profissional de saúde experiente em comunicação entre colegas.

Crie um MODELO de relatório de contrarreferência de até 200 palavras para ${para}, que encaminhou o paciente. Use apenas iniciais e marcadores no lugar dos dados do paciente: [INICIAIS], [MOTIVO DO ENCAMINHAMENTO], [ACHADOS DA AVALIAÇÃO], [CONDUTA PROPOSTA], [PREVISÃO DE REAVALIAÇÃO].
Contexto: ${get('contexto')}

Entregue:
1. O modelo, na estrutura: motivo do encaminhamento, achados da avaliação, conduta proposta, previsão de reavaliação, agradecimento. Linguagem técnica e objetiva, com espaço para assinatura e registro profissional. Uma versão para a avaliação e outra para a alta.
2. Versão curta para ${formato}.
3. Orientações de envio seguro: canal protegido, consentimento do paciente para compartilhar informações e o que a LGPD exige.`;
      }
      if (tipo === 'agradecimento') {
        return `Aja como especialista em relacionamento entre profissionais de saúde.

Escreva uma mensagem de agradecimento (${formato}) para ${para} por uma indicação, sem citar dados do paciente, reforçando o compromisso com a contrarreferência.
Contexto: ${get('contexto')}

Entregue 3 versões curtas, com tons diferentes. Sem brindes, comissões ou vantagens que possam ser vistos como pagamento por indicação, o que os códigos de ética vedam.`;
      }
      return `Aja como especialista em relacionamento entre profissionais de saúde.

Escreva uma carta de apresentação (${formato}) de até 120 palavras, em tom cordial e técnico, de ${profLabel()}${cfg.especialidade ? ' especializado(a) em ' + cfg.especialidade : ''} para ${para}${cfg.cidade ? ', da região de ' + cfg.cidade : ''}.
Contexto: ${get('contexto')}

Objetivo: apresentar o serviço, explicar em quais casos o encaminhamento ajuda o paciente, como encaminhar (link ou WhatsApp exclusivo para colegas, com prioridade de agenda e um formulário simples) e que o colega receberá relatório de avaliação e alta com autorização do paciente. Sem bajulação, sem oferta de vantagem, sem superlativos. Não pague, não receba e não prometa vantagem financeira por encaminhamento: os códigos de ética vedam e isso configura captação indevida.

Entregue 2 versões: uma completa e uma curta para ${formato === 'mensagem de WhatsApp' ? 'o primeiro contato' : 'WhatsApp'}, um roteiro de follow-up para 7 dias depois e uma ideia de material técnico de uma página (o que trato, quando encaminhar, como encaminhar e o que o colega recebe de volta). Se fizer sentido, sugira uma collab com tema complementar.`;
    },

    atendimento: (get) => `Aja como consultor(a) de atendimento e experiência do paciente em clínicas e consultórios.

- Quem responde: ${get('quem')}; tempo médio de resposta: ${get('tempoResposta')}
- Como trato valores: ${get('valores')}
- Como o paciente agenda: ${nv(get('agenda'))}; faltas: ${get('faltas')}
- Perguntas que mais chegam: ${get('perguntas')}

O paciente que chama no WhatsApp quase sempre está conversando com mais de um consultório e costuma agendar com quem responde primeiro com clareza. Padrões: primeira resposta em até 5 minutos no horário comercial; fora dele, resposta automática que informa quando haverá retorno e já oferece horários; toda conversa termina com um próximo passo marcado.

Entregue, em blocos prontos para copiar, curtos e humanos:
1. 12 respostas rápidas do WhatsApp Business (com o atalho sugerido): boas-vindas, pedido de motivo da consulta, explicação da primeira consulta, convênios, valores (quando permitido), endereço, atendimento online, duas opções de horário, confirmação de agendamento, fora do horário, retomada em 1 dia e retomada em 7 dias.
2. Roteiro de agendamento em cinco mensagens: acolher e identificar; entender a necessidade sem triagem clínica (incluindo "Foi indicado(a) por algum profissional?"); explicar como funciona; oferecer dois horários; confirmar e combinar a confirmação.
3. Resposta para "quanto custa?" coerente com minha política e com o conselho, sempre com o contexto do que está incluído (diferencie publicidade de informação privada ao paciente; em psicologia, honorários só no privado).
4. Sequência de confirmação: ao agendar (resumo com data, hora, endereço, mapa e o que levar); 48 horas antes ("Responda 1 para confirmar ou 2 para remarcar"); 24 horas antes, se não respondeu (ligação ou segunda mensagem); 2 horas antes (localização e estacionamento); após a falta, no mesmo dia, com dois horários e sem constranger. Pacientes com duas faltas seguidas recebem contato humano.
5. Objeções com respostas honestas: "vou pensar", "está caro" (alternativas legítimas, nunca desconto como pressão), medo, "já melhorei", "não tenho tempo".
6. Retomadas: para quem não agendou, até três (no dia seguinte, em 3 dias e em 7 dias), sempre com algo útil e nunca com pressão; para planos propostos sem decisão, em 2, 7 e 15 dias; para retorno periódico, só para quem consentiu receber lembretes, com "responda SAIR".
7. Pós-consulta e pedido de avaliação no Google para todos os pacientes, sem filtrar os satisfeitos e sem oferecer vantagem.
8. Etiquetas do WhatsApp Business espelhando as etapas do rastreador: ${ETAPAS.map(etapaLabel).join(', ')}.
9. Regras de LGPD no atendimento: consentimento por finalidade (atendimento, lembretes, conteúdos), não pedir nem guardar informação clínica por mensagem além do necessário, acesso por função.${isMental() ? '\n10. Em saúde mental, a falta pode ser sinal clínico: o contato é do profissional ou de alguém treinado, com cuidado.' : ''}`,

    plano: (get) => `Aja como profissional de saúde experiente em comunicação com pacientes.

Na saúde, fechar não é vender: é o paciente entender o plano, confiar nele e decidir começar. Transforme as informações abaixo em um plano de tratamento para o paciente ler, em linguagem simples.
- Objetivo do paciente na vida real: ${nv(get('objetivo'), '[CONFIRMAR]')}
- Tratamento: ${get('tratamento')}
- Duração, sessões e frequência: ${nv(get('duracao'), '[CONFIRMAR]')}
- Etapas, cuidados e alternativas: ${get('etapas')}
- Critérios de reavaliação e de alta: ${nv(get('criterios'), '[CONFIRMAR]')}
- Investimento e condições (conversa privada): ${nv(get('investimento'), '[CONFIRMAR]')}
- Dúvidas comuns: ${nv(get('duvidas'))}

Entregue:
1. Plano de 1 página com: objetivo do paciente em uma frase, fases com metas mensuráveis, número estimado de sessões e frequência, o que depende do paciente, como e quando vamos reavaliar, critério de alta, alternativas com prós e contras, investimento e formas de pagamento (plano completo, por fase, convênio quando houver) e próximos passos. Use [INICIAIS] e [DATA] como marcadores.
2. Versão curta para WhatsApp.
3. Respostas honestas às dúvidas e objeções ("vou pensar", "está caro", "já melhorei", "não tenho tempo").
4. Mensagens de acompanhamento do plano em aberto para 2, 7 e 15 dias, com informação útil e disponibilidade, nunca pressão.
5. Checklist do que conversar na consulta e do consentimento informado.

Não prometa resultado e não minimize riscos; mostre metas e como serão medidas. Marque com [CONFIRMAR] o que faltar. Nenhum dado de paciente real.${['medico', 'psiquiatra', 'psicologo'].includes(cfg.profissional) ? ' Para mim, o fechamento é a adesão: o paciente entender a conduta, agendar o retorno e seguir o tratamento, sem linguagem comercial.' : ''}`,

    registro: (get) => `Aja como assistente de CRM de uma clínica. Telefones e e-mails da conversa abaixo já foram trocados por marcadores; se sobrar algum dado clínico ou nome, ignore e não repita.

"""
${mascarar(get('conversa'))}
"""

Organize em:
1. Nome (só o primeiro nome ou apelido), origem, serviço de interesse e profissional indicado.
2. Etapa do funil (uma de: ${ETAPAS.map(etapaLabel).join(', ')}) e por quê.
3. Próximo passo com data sugerida e quem deve fazer.
4. Um aprendizado: uma frase sobre objeções ou motivo de perda.
5. A próxima mensagem, em tom acolhedor, com até 400 caracteres.
6. Consentimentos que ainda faltam pedir (atendimento, lembretes, conteúdos).
Não registre nenhuma informação clínica: ela vai para o prontuário.`,

    assistente: (get) => `Aja como meu assistente executivo para a semana no consultório.

Pendências e números da semana (pacientes anonimizados):
"""
${get('pendencias')}
"""
Horas livres para marketing e relacionamento: ${nv(get('horas'))}
Compromissos fixos: ${nv(get('fixos'))}

Entregue:
1. Agenda da semana em blocos (dia e horário) para: acompanhamentos e retomadas do rastreador, produção e publicação de conteúdo (meta: ${metaSemana()} por semana), contatos com colegas e revisão de campanhas.
2. Prioridades de cada dia, de segunda a sexta, na ordem.
3. Mensagens prontas para os 3 acompanhamentos mais importantes (use "Contato 1", "Contato 2", sem dados pessoais).
4. O que delegar para a recepção ou para a equipe.
5. O ritual semanal de 30 minutos, de preferência sexta à tarde, na sequência: atualizar as etapas de cada paciente e colega; caça aos parados (toda linha sem próximo passo ganha um, ou é marcada como Pausada ou Perdida); enviar os acompanhamentos vencidos; ler os números da semana contra a meta; encontrar o gargalo e escolher uma ação; planejar conteúdo, anúncios e contatos com colegas.
6. Planos propostos sem decisão há 2, 7 ou 15 dias e contatos que não agendaram há 1, 3 ou 7 dias: quem contatar e com qual mensagem útil.`,

    painel: (get) => `Aja como analista de marketing e operação de clínicas e consultórios.

Números das últimas semanas (contagens, sem dados de pacientes):
"""
${get('dados')}
"""
O que mudou no período: ${nv(get('contexto'), '(nada informado)')}

Regras de leitura:
- Não compare Reels, Shorts e YouTube longo como a mesma unidade de atenção. Interação pública por visualização = (curtidas + comentários) ÷ visualizações × 100, e não é engajamento total. Prefira a mediana à média. Retenção vem dos dados da conta, não de números públicos.
- Compare peças com exposição parecida e trate à parte as impulsionadas.
- Muito alcance e pouca permanência: revise promessa × entrega. Permanência e poucas ações: revise clareza e convite. Muitos contatos e poucos atendimentos: revise adequação ao público, localização e processo de agendamento antes de culpar o roteiro.

Entregue:
1. Leitura do funil pelas sete decisões do paciente (atenção, confiança, indicação, contato, agendamento, comparecimento, adesão) e pelas métricas que importam: taxa de agendamento (agendados ÷ novos contatos), taxa de comparecimento (compareceram ÷ agendados), taxa de aceitação de planos (iniciaram ÷ planos propostos), taxa de conclusão (altas ÷ iniciados), custo por paciente que compareceu e indicações por colega. O número de referência é o meu próprio histórico; referências do setor só como [ESTIMATIVA].
2. O gargalo da semana e as 3 causas mais prováveis, aplicando as regras acima.
3. Três ações para a próxima semana, cada uma com responsável, prazo e métrica de sucesso.
4. Conteúdo: quais baldes, quadros e formatos geram mais retenção, envios, salvamentos e mensagens, e o que repetir. Atribua receita só se houver rastreamento.
5. O próximo ciclo de testes: série, hipótese, lote pequeno comparável e uma variável só (pergunta, abertura, demonstração ou convite), como medir e quando decidir.`,

    etica: (get) => {
      const anuncio = /anúncio/.test(get('tipo'));
      const regras = councilObjs().map((c) => `${c.conselho} (${c.norma}):
- Identificação: ${c.ident}
- Pode: ${c.pode.join(' ')}
- Não pode: ${c.nao.join(' ')}
- Observação: ${c.extra}`).join('\n\n') || 'Tipo de profissional não definido: use as regras gerais de publicidade em saúde no Brasil.';
      return `Revise o texto abaixo como se fosse a comissão de ética do ${conselhosTxt()}.
Tipo de peça: ${get('tipo')}. Imagens ou vídeo: ${get('imagem')}.

Aponte, frase a frase: promessa de resultado, superlativo, sensacionalismo, medo, exposição de paciente, preço ou promoção vedados, falta de identificação profissional, afirmação sobre condição de saúde do leitor. Confira também: cura em segundos, ameaça, "segredo que médicos escondem", diagnóstico por comentário ou aparência, pedido de histórico nos comentários, comparação depreciativa com colegas, percentual sem fonte, exploração de vergonha, medo ou insegurança corporal, imagem gerada apresentada como paciente real, depoimento ou caso inventado, humor que ridiculariza quem sente dor, e afirmação clínica sem fonte (marque [PENDENTE DE VALIDAÇÃO]). Tipo de conta: ${CONTA[cfg.conta] || CONTA.profissional} (algumas regras mudam para a conta da clínica).${anuncio ? ' Confira também as políticas de anúncios da Meta (atributos pessoais e saúde) e do Google (saúde e medicamentos).' : ''}

Regras que valem para mim (resumo conferido em outubro de 2026):
${regras}
${isMental() ? '\nSaúde mental: ' + SAUDE_MENTAL + '\n' : ''}
Entregue:
1. Semáforo geral (verde, amarelo ou vermelho) e por quê.
2. Tabela: trecho, problema, regra envolvida, como corrigir.
3. Versão corrigida completa, com a identificação profissional obrigatória.
4. Se houver imagem de paciente, antes e depois ou depoimento: autorizações necessárias e cuidados.

Não afirme conformidade legal integral: esta revisão não substitui a consulta à norma vigente nem a avaliação de um profissional competente. Se puder, confira na web se as normas citadas foram atualizadas e cite a fonte.

Texto:
"""
${get('texto')}
"""`;
    },

    briefing: () => `Aja como consultor(a) de marketing para clínicas e consultórios.

Revise o briefing abaixo, que vou enviar a um fornecedor:
"""
${lastBriefingMd}
"""

Entregue:
1. Lacunas e ambiguidades que podem gerar retrabalho, com a pergunta que resolve cada uma.
2. Riscos éticos ou de LGPD no escopo.
3. Métricas e prazos que faltam.
4. E-mail curto de pedido de proposta, com o briefing anexo.
5. Dez perguntas para a primeira reunião com o fornecedor.`,

    ferramentas: (get) => `Aja como consultor(a) de tecnologia para pequenos consultórios e clínicas.

- Orçamento mensal para ferramentas: ${get('orcamento')}
- Familiaridade com tecnologia: ${get('nivel')}
- O que já tenho: ${get('equip')}

Lista de referência (listada, não avaliada):
${KIT.map((k) => `- ${k[0]}: ${k[1]} (${k[2]})`).join('\n')}

Entregue:
1. No máximo uma ferramenta por necessidade, com opção gratuita e paga. Pesquise preços atuais na web e cite a fonte e a data.
2. Kit de gravação dentro do orçamento.
3. Configuração da primeira semana, passo a passo: WhatsApp Business, Perfil da Empresa no Google, Meta Business Suite e Canva.
4. Cuidados de LGPD ao escolher sistemas que guardam dados de pacientes: contrato de operador, onde ficam os dados, quem acessa.
5. O que NÃO contratar agora. Ferramenta demais é registro duplicado.`
  };
