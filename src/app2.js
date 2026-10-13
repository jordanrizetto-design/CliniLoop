
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
    if (cfg.transformacao) L.push(`- Transformação: ${cfg.transformacao}`);
    if (cfg.baldes) L.push(`- Baldes de conteúdo: ${cfg.baldes}`);
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

    perfil: (get, getAll) => `Aja como consultor(a) de presença digital para profissionais de saúde.

Perfis para revisar: ${getAll('redes')}
Link da bio hoje: ${get('link')}. Destaques e fixados: ${nv(get('destaques'))}
Textos atuais:
"""
${get('atual')}
"""

Entregue, para cada perfil escolhido:
1. Nota de 0 a 10 para clareza (para quem é, o que faço, onde atendo, como agendar) e justificativa.
2. Reescrita pronta para colar, com a identificação obrigatória do meu conselho e do tipo de conta (profissional ou clínica). Em saúde, a bio traz identidade e credenciais corretas e leva ao canal oficial, sem slogan de resultado:
   - Instagram: 3 opções de nome do perfil com palavra-chave (o Instagram busca pelo nome), 3 bios de até 150 caracteres, Destaques na ordem do caminho do paciente (ex.: Comece aqui, Dúvidas, Tratamentos, Bastidores, Como agendar, Localização) com o que vai em cada um, 3 posts para fixar e o destino do link com mensagem pronta para o WhatsApp.
   - Perfil da Empresa no Google: categoria principal e secundárias, serviços, descrição de até 750 caracteres, fotos que faltam, perguntas e respostas, frequência de posts e como pedir avaliações sem oferecer vantagem e respeitando o conselho.
   - YouTube: nome e descrição do canal, palavras-chave, playlists por dúvida e ideia de trailer.
   - LinkedIn: título, "Sobre" e destaques pensados para colegas e parceiros que indicam.
3. SEO local: palavras-chave com serviço + cidade ou bairro.
4. Checklist final de 15 itens para eu marcar.`,

    pautas: (get, getAll) => `Aja como estrategista de conteúdo para saúde, com foco em SEO social e busca local.

Banco de dúvidas reais dos meus pacientes:
"""
${get('banco')}
"""
Formatos com que me sinto bem: ${getAll('formatos')}
Datas importantes: ${nv(get('datas'), '(nenhuma)')}

Entregue:
1. Palavras-chave por serviço e por cidade ou bairro (Google, Instagram e YouTube), em tabela: termo, intenção (informar, comparar, agendar), serviço e onde usar. Pesquise na web as buscas relacionadas (Google Trends, sugestões de busca, Answer The Public) e indique a fonte.
2. As dúvidas do banco organizadas por balde de conteúdo (${cfg.baldes || 'sugira até 3 baldes'}) e pelo momento da jornada: entender um sintoma, compreender a avaliação, comparar caminhos de cuidado, preparar-se para a consulta, acompanhar o tratamento, conhecer a equipe. Sem repetir e sem afirmar "todo mundo pergunta" além do que está no banco.
3. 30 pautas em tabela, cada uma registrada com: dúvida, público, estágio de decisão, formato, palavra-chave, fonte clínica necessária, imagem de apoio (eu, modelo anatômico ou ilustração), responsável pela revisão e CTA. Priorize por pertinência ao público, segurança clínica, possibilidade de explicar visualmente, originalidade e alinhamento com os serviços.
4. Dois ou três quadros recorrentes (séries com nome, bordão e estrutura fixa, como "Pergunta do consultório"), com 4 episódios cada.
5. Metas S.M.A.R.T. para 8 semanas (específicas, mensuráveis, alcançáveis, relevantes e com prazo), incluindo uma meta de tarefa e uma de contatos qualificados.
6. Frequência realista para ${(TEMPO[cfg.tempo] || TEMPO['2a3']).label}, com quem produz sendo ${PRODUTOR[cfg.produtor] || cfg.produtor}: versão mínima e ideal por canal. Constância vale mais que volume.
Referência: independentes, cerca de 3 publicações por semana (2 Reels e 1 carrossel); com equipe, 5 e Stories diários. Qualidade vence volume.
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
      return `Aja como roteirista e copywriter de conteúdo ético para profissionais de saúde, seguindo o Método Foguete adaptado ao Instagram e os princípios do Efeito Di.

Formato: ${f}
Tema ou dúvida do paciente: ${get('tema')}
Balde: ${nv(get('balde'), '(não definido)')} · Objetivo da peça: ${get('objetivoPeca')} · Como apareço: ${get('aparece')} · Tom: ${get('tom')}
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
      return `Atue como estrategista de marketing ético para saúde no Brasil.

Monte uma campanha de ${get('duracao')} para ${profLabel()} em ${nv(cfg.cidade, '[BAIRRO, CIDADE]')}, serviço ${get('servico')}, objetivo ${get('n')} pacientes agendados, orçamento ${nv(get('orcamento'), 'sem anúncios pagos (só orgânico)')}.
- Público e dúvida principal: ${nv(get('publico'), cfg.publico)}
- Mensagem central: ${nv(get('mensagem'), '[CONFIRMAR]')}
- Canais: ${canais}
- Atendimento: ${nv(get('atendimento'), '[CONFIRMAR: quem responde, com qual roteiro, em quanto tempo]')}

Entregue:
1. Ficha da campanha (objetivo, público, mensagem central, peças, canais, orçamento e duração, atendimento, medição e compliance).
2. 3 roteiros de Reel (gancho, contexto, 3 a 5 pontos, CTA, legenda).
3. 1 carrossel de 7 slides.
4. Anúncios Meta (3 textos, 3 títulos) e Google (15 títulos, 4 descrições, 20 palavras-chave, 15 negativas). Se algum desses canais não estiver na lista acima, diga em uma linha se vale incluí-lo.
5. Mensagem de boas-vindas do WhatsApp e 3 respostas rápidas.
6. Calendário dia a dia.
7. Lista de verificação ética do ${conselhosTxt()}, da LGPD e das políticas da Meta e do Google, marcando o que precisa de atenção.
8. Medição: contatos, agendados, comparecimentos e planos iniciados por origem, e o nome curto da campanha para eu registrar como origem no rastreador. Separe orçamento de mídia de custo de produção.
9. Se houver impulsionamento: objetivo, qual peça educativa já revisada impulsionar, público com pertinência geográfica (para clínica local, vale mais que audiência nacional), a ação acompanhada (visita ao perfil ou contato qualificado) e quando pausar. Não autorize gasto automaticamente: eu aprovo cada valor.${reativ ? '\n10. Mensagens de reativação só para quem consentiu receber lembretes, com opção de sair em cada mensagem.' : ''}

Regras: sem promessa de resultado, sem superlativos, sem medo, sem afirmar condição de saúde do usuário, sem preço onde o conselho proíbe. Marque com [CONFIRMAR] tudo que eu não informei.`;
    },

    colegas: (get) => {
      const c = colegaPorId(get('colega'));
      const para = c ? `${c.nome}${c.prof ? ' (' + c.prof + ')' : ''}` : 'um(a) colega de outra especialidade que atende o mesmo paciente';
      const tipo = get('tipo');
      const formato = get('formato');
      if (tipo === 'contrarreferencia') {
        return `Aja como profissional de saúde experiente em comunicação entre colegas.

Crie um MODELO de relatório de contrarreferência para ${para}. Use apenas marcadores no lugar dos dados do paciente: [PACIENTE], [IDADE], [MOTIVO DO ENCAMINHAMENTO], [AVALIAÇÃO], [CONDUTA], [PLANO], [PRÓXIMA REAVALIAÇÃO], [SINAIS DE ALERTA].
Contexto: ${get('contexto')}

Entregue:
1. O modelo, com estrutura clara, linguagem técnica adequada ao colega, espaço para assinatura e registro profissional, e uma frase de agradecimento pela confiança.
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

Escreva uma carta de apresentação (${formato}) para ${para}.
Contexto: ${get('contexto')}

Inclua: quem sou e onde atendo, que tipo de paciente acompanho e em que momento a parceria ajuda o paciente, como faço a contrarreferência (o que devolvo e em quanto tempo), contato direto e uma proposta concreta e leve (café, visita ou conversa de 15 minutos). Tom profissional e colaborativo, sem autopromoção e sem oferecer vantagem financeira por indicação, o que os códigos de ética vedam.

Entregue 2 versões: uma completa e uma curta para ${formato === 'mensagem de WhatsApp' ? 'o primeiro contato' : 'WhatsApp'}, e um roteiro de follow-up para 7 dias depois.`;
    },

    atendimento: (get) => `Aja como consultor(a) de atendimento e experiência do paciente em clínicas e consultórios.

- Quem responde: ${get('quem')}; tempo médio de resposta: ${get('tempoResposta')}
- Como trato valores: ${get('valores')}
- Como o paciente agenda: ${nv(get('agenda'))}; faltas: ${get('faltas')}
- Perguntas que mais chegam: ${get('perguntas')}

Entregue, em blocos prontos para copiar, curtos e humanos:
1. Respostas rápidas do WhatsApp Business (com o atalho sugerido): saudação, ausência, horários e endereço, convênios, primeira consulta, como chegar.
2. Primeira resposta para quem chega do Instagram, do Google ou de anúncio, em até 5 minutos, e 3 perguntas de acolhimento que não pedem dado clínico por mensagem.
3. Resposta para "quanto custa?" coerente com minha política e com o conselho (diferencie publicidade de informação privada ao paciente).
4. Roteiro de agendamento: confirmação de dados, orientações para a consulta e mensagem de confirmação.
5. Régua de confirmação: 48 h antes, 24 h antes e no dia; reagendamento e falta sem constranger.
6. Objeções: preço, medo, "vou pensar", falta de tempo, comparação com outro profissional.
7. Retomadas: para quem parou de responder (3 e 7 dias), para planos propostos sem resposta e para retorno periódico, só para quem consentiu receber lembretes e com opção de sair.
8. Pós-consulta e pedido de avaliação no Google ou de indicação, sem oferecer vantagem em troca.
9. Etiquetas do WhatsApp Business espelhando as etapas do rastreador: ${ETAPAS.join(', ')}.
10. Regras de LGPD no atendimento: consentimento por finalidade (atendimento, lembretes, conteúdos), não pedir nem guardar informação clínica por mensagem além do necessário, quem tem acesso ao celular.`,

    plano: (get) => `Aja como profissional de saúde experiente em comunicação com pacientes.

Explique um plano de tratamento em linguagem simples, para o paciente decidir com segurança.
- Tratamento: ${get('tratamento')}
- Duração e sessões: ${nv(get('duracao'))}
- Etapas, cuidados e alternativas: ${get('etapas')}
- Investimento e condições (conversa privada): ${nv(get('investimento'), '[CONFIRMAR]')}
- Dúvidas comuns: ${nv(get('duvidas'))}

Entregue:
1. Texto de 1 página para entregar ao paciente: o que é, por que foi indicado ([MOTIVO], para eu completar), etapas e o que acontece em cada uma, tempo, cuidados, sinais para entrar em contato, alternativas com prós e contras, investimento e condições, próximos passos. Use [NOME] e [DATA] como marcadores.
2. Versão curta para WhatsApp.
3. Respostas às dúvidas comuns.
4. Checklist do que conversar na consulta e do consentimento informado.

Sem promessa de resultado e sem minimizar riscos; leitura acessível; nenhum dado de paciente real.`,

    registro: (get) => `Aja como assistente de CRM de uma clínica. Telefones e e-mails da conversa abaixo já foram trocados por marcadores; se sobrar algum dado clínico ou nome, ignore e não repita.

"""
${mascarar(get('conversa'))}
"""

Entregue:
1. Etapa do funil (uma de: ${ETAPAS.join(', ')}) e por quê.
2. Serviço de interesse, origem provável e objeções percebidas.
3. Próximo passo, com data sugerida e quem deve fazer.
4. Mensagem de resposta pronta para enviar agora, curta e acolhedora.
5. Consentimentos que ainda faltam pedir (atendimento, lembretes, conteúdos).
6. O que NÃO registrar no CRM: informação clínica vai para o prontuário.`,

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
5. Ritual de sexta (15 minutos): o que atualizar no rastreador, no diário de conteúdo e no painel.`,

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
1. Leitura do funil: conversões entre etapas (contato → agendado → avaliado → plano proposto → em tratamento), comparadas com referências do setor marcadas como [ESTIMATIVA].
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
