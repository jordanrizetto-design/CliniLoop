  // ===================== Jornada em 6 fases =====================
  // Perfil completo (consultório, ICP, redes) → objetivo → diagnóstico → plano e campanhas por mídia → WhatsApp e CRM → avaliar e ajustar.
  // Cada fase abre com uma mensagem de estímulo e o motivo de estar ali.
  var JOR_FASES = [
    { n: 1, nome: 'Seu perfil', curto: 'Perfil', msg: 'Vamos montar o seu perfil completo: consultório, paciente ideal e as redes que você já usa. Leva poucos minutos.', why: 'Com isso, cada texto, anúncio e mensagem sai com o seu registro, as regras do seu conselho e a linguagem do seu paciente, sem você repetir nada.' },
    { n: 2, nome: 'Seu objetivo', curto: 'Objetivo', msg: 'Perfil pronto! Agora a pergunta que organiza tudo: qual resultado você quer alcançar nos próximos 90 dias?', why: 'Um objetivo claro decide o que criar primeiro e o que deixar para depois. Sem ele, tudo parece urgente e nada avança.' },
    { n: 3, nome: 'Diagnóstico', curto: 'Diagnóstico', msg: 'Agora vamos olhar o que você já tem e o que ainda precisa ser criado para chegar ao seu objetivo.', why: 'Criar só o necessário poupa o seu tempo e evita refazer o que já funciona. É o atalho mais curto entre onde você está e onde quer chegar.' },
    { n: 4, nome: 'Plano e campanhas', curto: 'Plano', msg: 'Hora de agir. Vou conduzir você passo a passo, e mostrar a campanha certa para cada mídia.', why: 'Passos pequenos, na ordem certa, evitam a paralisia. Cada campanha nasce do seu paciente ideal, não de um modelo genérico.' },
    { n: 5, nome: 'WhatsApp e CRM', curto: 'WhatsApp e CRM', msg: 'Os contatos vão chegar. Vamos preparar o WhatsApp e o CRM para que nenhum se perca.', why: 'A maior perda de pacientes acontece entre o "oi" e a consulta. Resposta rápida e registro de cada contato recuperam agenda que hoje se perde em silêncio.' },
    { n: 6, nome: 'Avaliar e ajustar', curto: 'Avaliação', msg: 'Chegou a hora de ler os resultados e ajustar o rumo, sem achismo.', why: 'O que você mede, você melhora. Olhar o funil mostra onde está o gargalo e qual é a única ação que mais vale a pena agora.' }
  ];
  function jorGet() {
    let j = storeGet(JOR_KEY, null);
    if (!j) {
      const old = storeGet(STORE_KEY, null);
      if (old && old.profissional && old.metaFrase) j = { fase: 4, view: 4, seen: { 1: 1, 2: 1, 3: 1, 4: 1 }, wa: {}, mig: true };
      else j = { fase: 1, view: 1, seen: {}, wa: {} };
    }
    j.wa = j.wa || {}; j.seen = j.seen || {};
    if (!j.view || j.view > j.fase) j.view = j.fase;
    return j;
  }
  function jorSet(j) { storeSet(JOR_KEY, j); }
  function jorCfgFase() { const f = configEl.dataset.jf; return f === '1' ? 1 : (f === '2' ? 2 : undefined); }
  function jorAvancar() {
    const j = jorGet(); const f = jorCfgFase();
    if (!f) return false;
    const prox = f + 1;
    j.fase = Math.max(j.fase, prox); j.view = prox; j.seen[prox] = 0;
    jorSet(j); renderJornada();
    document.getElementById('jornada').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  // --- Diagnóstico: o que existe e o que criar ---
  var CANAL_CAT = [
    { id: 'Perfil da Empresa no Google', nome: 'Perfil da Empresa no Google', parte: 3, tool: 'perfil' },
    { id: 'WhatsApp Business', nome: 'WhatsApp Business', parte: 10, tool: 'atendimento' },
    { id: 'Instagram', nome: 'Instagram', parte: 3, tool: 'perfil' },
    { id: 'indicação de colegas', nome: 'Rede de indicação de colegas', parte: 8, tool: 'colegas' },
    { id: 'YouTube', nome: 'YouTube', parte: 3, tool: 'perfil' },
    { id: 'site ou blog', nome: 'Site ou página de agendamento', parte: 3, tool: 'perfil' },
    { id: 'LinkedIn', nome: 'LinkedIn', parte: 3, tool: 'perfil' },
    { id: 'Doctoralia ou plataforma de agendamento', nome: 'Doctoralia ou plataforma de agendamento', parte: 16, tool: 'ferramentas' },
    { id: 'TikTok', nome: 'TikTok', parte: 3, tool: 'perfil' }
  ];
  function relevancia(id) {
    const o = cfg.objetivo; const tempo = cfg.tempo; const cam = cfg.camera;
    const baixoTempo = tempo === 'ate1';
    switch (id) {
      case 'Perfil da Empresa no Google': return [3, 'quem já precisa procura no Google e escolhe pelo que vê na ficha'];
      case 'WhatsApp Business': return [3, 'é onde o contato vira consulta, e responder rápido decide a agenda'];
      case 'Instagram': return [o === 'online' || o === 'autoridade' || o === 'agenda' || o === 'ticket' ? 3 : 2, 'é onde o paciente descobre você e decide se confia'];
      case 'indicação de colegas': return [o === 'fidelizar' || o === 'ticket' ? 3 : 2, 'o paciente indicado chega com confiança prévia e adere mais'];
      case 'YouTube': return [(o === 'autoridade' || o === 'ticket') && !baixoTempo ? 3 : (baixoTempo ? 1 : 2), 'responde dúvidas em profundidade e continua trazendo gente por anos'];
      case 'site ou blog': return [o === 'online' || o === 'ticket' || o === 'autoridade' ? 2 : 1, 'um destino próprio para agendar e para a campanha de busca'];
      case 'LinkedIn': return [o === 'autoridade' || o === 'fidelizar' ? 2 : 1, 'colegas e jornalistas conferem quem você é antes de indicar'];
      case 'Doctoralia ou plataforma de agendamento': return [1, 'ajuda a ser encontrado, mas depende de plataforma de terceiros'];
      case 'TikTok': return [!baixoTempo && cam !== 'baixo' && (tempo === '4a6' || tempo === '7mais') ? 2 : 0, 'alcance amplo, mas só vale quando o Instagram já tem rotina'];
    }
    return [1, ''];
  }
  function jorDiag() {
    const tem = [], criar = [], depois = [];
    const usa = new Set(cfg.canais || []);
    CANAL_CAT.forEach((c) => {
      const [rel, porque] = relevancia(c.id);
      if (usa.has(c.id)) tem.push({ ...c, porque });
      else if (rel >= 3) criar.push({ ...c, porque, rel });
      else if (rel === 2) criar.push({ ...c, porque, rel });
      else if (rel === 1) depois.push({ ...c, porque });
    });
    criar.sort((a, b) => b.rel - a.rel);
    const cap = { ate1: 2, '2a3': 3, '4a6': 4, '7mais': 5 }[cfg.tempo] || 3;
    const agora = criar.slice(0, Math.max(cap - 0, 1));
    const resto = criar.slice(agora.length).concat(depois);
    const notas = [];
    notas.push(`Com ${TEMPO[cfg.tempo] ? TEMPO[cfg.tempo].label : 'o tempo informado'}, vale manter no máximo ${cap} frentes ao mesmo tempo. O resto fica para a próxima rodada.`);
    if (cfg.camera === 'baixo') notas.push('Você prefere não aparecer na câmera: priorize carrossel, voz sobre modelo ou ilustração e vídeos com o corpo clínico.');
    if (cfg.produtor === 'terceiro') notas.push('Como outra pessoa vai produzir, o briefing e a revisão clínica e ética são seus: use o Briefing para terceiros e o Verificador ético.');
    if (!String(cfg.transformacao || '').trim()) notas.push('A proposta de valor ainda está em branco. Complete em "Nicho e diferencial": é o que diferencia você dos outros bons profissionais.');
    if (usa.has('Instagram') && !String(cfg.arroba || '').trim()) notas.push('Você marcou o Instagram, mas não informou o @. Informe para o app auditar a bio.');
    return { tem, agora, resto, notas };
  }
  function diagHtml() {
    const d = jorDiag();
    const li = (c, extra) => `<li><b>${escapeHtml(c.nome)}</b><span>${escapeHtml(c.porque || '')}</span>${extra || ''}</li>`;
    const btn = (c, t) => `<button type="button" class="btn btn-outline btn-sm" data-jor-tool="${c.tool}">${t}</button>`;
    return `<div class="jor-cols">
      <div class="jor-col"><h4>O que você já tem</h4><p class="jor-sub">Vamos auditar, não refazer.</p>
        <ul class="jor-list">${d.tem.length ? d.tem.map((c) => li(c, btn(c, 'Auditar'))).join('') : '<li><span>Você ainda não marcou nenhuma rede. Tudo bem: começamos do zero.</span></li>'}</ul></div>
      <div class="jor-col jor-col-hl"><h4>O que criar agora, em ordem</h4><p class="jor-sub">Prioridade para o seu objetivo: ${escapeHtml(objInfo().label.toLowerCase())}.</p>
        <ol class="jor-list">${d.agora.length ? d.agora.map((c) => li(c, btn(c, 'Como criar'))).join('') : '<li><span>Nada essencial a criar. Foque em melhorar o que existe.</span></li>'}</ol></div>
    </div>
    ${d.resto.length ? `<p class="jor-later"><b>Fica para depois:</b> ${d.resto.map((c) => escapeHtml(c.nome)).join(', ')}.</p>` : ''}
    <ul class="jor-notes">${d.notas.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>`;
  }

  // --- Campanhas por mídia ---
  function jorCampanhas() {
    const serv = servicosList()[0] || 'o seu serviço principal';
    const cid = (cfg.cidade || 'a sua cidade').split(',').pop().trim() || 'a sua cidade';
    const dor = cfg.icpDor ? `"${cfg.icpDor}"` : 'a principal dúvida do paciente ideal';
    const semPreco = ['dentista', 'psicologo'].includes(cfg.profissional);
    const usa = new Set(cfg.canais || []);
    const o = cfg.objetivo;
    const L = [];
    L.push({ midia: 'Google Pesquisa', quando: 'Para quem já procura', ideia: `Anúncio informativo para "${serv} ${cid}", com extensão de ligação e rota. Palavras negativas desde o primeiro dia.`, tool: 'campanha', rel: o === 'online' ? 2 : 3 });
    L.push({ midia: 'Meta Ads (Instagram e Facebook)', quando: 'Para quem ainda não procura', ideia: `Reel educativo respondendo ${dor}, com botão "Enviar mensagem" para o WhatsApp.${semPreco ? ' Sem preço, desconto ou promoção.' : ''}`, tool: 'campanha', rel: 3 });
    L.push({ midia: 'Impulsionamento de post', quando: 'O primeiro anúncio de quem nunca anunciou', ideia: 'Escolha o post orgânico com mais envios e salvamentos e impulsione com um único objetivo (mensagens), por pelo menos 7 dias sem mexer.', tool: 'campanha', rel: 2 });
    L.push({ midia: 'Instagram orgânico', quando: 'Constância e confiança', ideia: `Série com 3 temas (educar, humanizar, desmistificar), partindo de ${dor}. ${TEMPO[cfg.tempo] ? 'Meta: ' + TEMPO[cfg.tempo].meta + ' peças por semana.' : ''}`, tool: 'roteiro', rel: usa.has('Instagram') ? 3 : 2 });
    L.push({ midia: 'YouTube', quando: 'Autoridade duradoura', ideia: `Um vídeo de 6 a 10 minutos respondendo ${dor}, com o link de agendamento nas duas primeiras linhas.`, tool: 'roteiro', rel: o === 'autoridade' || o === 'ticket' ? 3 : 1 });
    L.push({ midia: 'Perfil da Empresa no Google', quando: 'Presença local', ideia: 'Fotos reais, serviços cadastrados, um post por mês e pedido de avaliação a todos os pacientes após o atendimento.', tool: 'perfil', rel: 3 });
    L.push({ midia: 'Rede de colegas', quando: 'Indicação qualificada', ideia: 'Carta de apresentação para os 3 colegas mais próximos e relatório de contrarreferência para cada paciente indicado.', tool: 'colegas', rel: o === 'fidelizar' || o === 'ticket' ? 3 : 2 });
    L.push({ midia: 'LinkedIn', quando: 'Reputação e indicação de colegas', ideia: 'Um post técnico por semana a partir do melhor tema do mês, com referência científica, e comentários de qualidade nas publicações de colegas que encaminham pacientes.', tool: 'roteiro', rel: o === 'autoridade' || o === 'ticket' ? 3 : (usa.has('LinkedIn') ? 2 : 1) });
    if (usa.has('TikTok')) L.push({ midia: 'TikTok', quando: 'Alcance amplo por interesse', ideia: 'Os mesmos roteiros dos Reels, exportados sem marca d\'água. Para anunciar, Promote ou TikTok Ads Manager com público a partir de 18 anos.', tool: 'roteiro', rel: 2 });
    if (o === 'online') L.push({ midia: 'Site ou página de agendamento', quando: 'Pacientes de outras cidades', ideia: 'Página com como funciona o atendimento online, duração, valores (quando permitido) e botão de agendar.', tool: 'perfil', rel: 3 });
    return L.sort((a, b) => b.rel - a.rel).slice(0, 6);
  }
  function campanhasHtml() {
    return `<div class="jor-camps">${jorCampanhas().map((c) => `<div class="jor-camp"><h5>${escapeHtml(c.midia)}</h5><small>${escapeHtml(c.quando)}</small><p>${escapeHtml(c.ideia)}</p><button type="button" class="btn btn-outline btn-sm" data-jor-tool="${c.tool}">Montar</button></div>`).join('')}</div>
    <p class="jor-sub">Toda peça passa pelo Verificador ético antes de ir ao ar. Defina um valor diário que você possa manter por pelo menos 14 dias sem mexer.</p>`;
  }

  // --- WhatsApp e CRM ---
  var WA_ITENS = [
    ['wa1', 'Instale o WhatsApp Business e preencha o perfil: nome, endereço, horário, descrição e catálogo de serviços.', 'atendimento'],
    ['wa2', 'Cadastre a mensagem de boas-vindas e a de fora do horário (já oferecendo dois horários).', 'atendimento'],
    ['wa3', 'Cadastre as 12 respostas rápidas do guia, geradas com o seu perfil.', 'atendimento'],
    ['wa4', 'Crie etiquetas com as sete etapas do funil: Novo, Em conversa, Agendado, Avaliado, Plano proposto, Em tratamento, Encerrado.', null],
    ['wa5', 'Troque o link da bio e dos anúncios pelos links com origem (abaixo), para saber de onde cada contato veio.', null],
    ['wa6', 'Cadastre o primeiro contato no Rastreador de pacientes, com origem, etapa, próximo passo e consentimento.', 'rastreador'],
    ['wa7', 'Defina o ritual semanal de 30 minutos (sexta à tarde) e abra o Assistente da semana.', 'assistente']
  ];
  function waLink(origem) {
    let n = String(cfg.whatsapp || '').replace(/\D/g, '');
    if (n.length < 10) return '';
    if (n.length <= 11) n = '55' + n;
    const serv = servicosList()[0] || 'o atendimento';
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(`Olá! Vim pelo ${origem} e gostaria de saber mais sobre ${serv}.`);
  }
  function waHtml() {
    const j = jorGet();
    const auto = { wa6: pacientes.length > 0 };
    const feito = (id) => !!j.wa[id] || !!auto[id];
    const items = WA_ITENS.map(([id, txt, tool]) => `<li class="${feito(id) ? 'ok' : ''}"><label><input type="checkbox" data-jor-wa="${id}" ${feito(id) ? 'checked' : ''}> <span>${escapeHtml(txt)}</span></label>${tool ? `<button type="button" class="btn btn-outline btn-sm" data-jor-tool="${tool}">Abrir</button>` : ''}</li>`).join('');
    const usa = new Set(cfg.canais || []);
    const origens = ['Instagram', 'Google', 'YouTube'].concat(usa.has('TikTok') ? ['TikTok'] : [], usa.has('LinkedIn') ? ['LinkedIn'] : [], ['anúncio da Meta', 'anúncio do Google'], usa.has('TikTok') ? ['anúncio do TikTok'] : [], ['indicação de colega', 'site']);
    const rotulo = (o) => o.charAt(0).toUpperCase() + o.slice(1);
    const links = cfg.whatsapp && waLink('Instagram')
      ? `<div class="jor-links">${origens.map((o) => `<div><b>${escapeHtml(rotulo(o))}</b><code>${escapeHtml(waLink(o))}</code><button type="button" class="btn btn-outline btn-sm" data-jor-copy="${escapeHtml(waLink(o))}">Copiar</button></div>`).join('')}</div>`
      : '<p class="jor-sub">Informe o WhatsApp do consultório em "Editar objetivo e perfil" para gerar os links com origem.</p>';
    const funil = ETAPAS.map((e) => `<li><b>${escapeHtml(e)}</b><span>${escapeHtml(PASSO_TIPICO[e])}</span></li>`).join('');
    const feitos = WA_ITENS.filter(([id]) => feito(id)).length;
    return `<div class="meter jor-meter"><span style="width:${Math.round(feitos / WA_ITENS.length * 100)}%"></span></div><p class="jor-sub">${feitos} de ${WA_ITENS.length} passos prontos.</p>
      <ul class="jor-check">${items}</ul>
      <h4>Links do WhatsApp com origem</h4>${links}
      <h4>O modelo de CRM: sete etapas, um próximo passo em cada uma</h4>
      <ol class="jor-funil">${funil}</ol>
      <p class="jor-sub">Regra de ouro: toda linha tem um próximo passo com data. Dado clínico não entra no CRM.</p>`;
  }

  // --- Avaliação e ajuste ---
  function avalHtml() {
    const lim = addDays(todayISO(), -90);
    const co = pacientes.filter((p) => p.criado >= lim);
    const H = (k) => co.filter((p) => p.hist && p.hist[k]).length;
    const n = co.length, ag = H('Agendado'), av = H('Avaliado'), pl = H('Plano proposto'), ini = H('Em tratamento');
    const pct = (a, b) => (b ? Math.round(a / b * 100) + '%' : '—');
    const linhas = [['Contatos novos', n, 'últimos 90 dias'], ['Agendaram', ag, pct(ag, n) + ' dos contatos'], ['Compareceram', av, pct(av, ag) + ' dos agendados'], ['Iniciaram o tratamento', ini, pct(ini, pl) + ' dos planos propostos']];
    const taxas = [];
    if (n >= 5) taxas.push(['agendamento', ag / n, 'atendimento', 'Responda em até 5 minutos, ofereça dois horários e faça as retomadas de 1, 3 e 7 dias.']);
    if (ag >= 5) taxas.push(['comparecimento', av / ag, 'rastreador', 'Ative a confirmação ativa 48 horas antes, o lembrete de 2 horas e agende o retorno antes de o paciente sair.']);
    if (pl >= 5) taxas.push(['aceitação do plano', ini / pl, 'atendimento', 'Entregue o plano por escrito, com objetivo do paciente, fases e data para decidir, e acompanhe em 2, 7 e 15 dias.']);
    let ajuste;
    if (n < 5) ajuste = `<p><b>Ainda há poucos dados.</b> Registre pelo menos 5 contatos no Rastreador para o app apontar o gargalo. Enquanto isso, mantenha a rotina de conteúdo e as campanhas da fase 4.</p><button type="button" class="btn btn-gold btn-sm" data-jor-tool="rastreador">Registrar contato</button>`;
    else if (!taxas.length) ajuste = '<p>Continue registrando: com mais agendamentos e planos, o app compara as taxas e mostra o gargalo.</p>';
    else {
      taxas.sort((a, b) => a[1] - b[1]);
      const g = taxas[0];
      ajuste = `<p><b>Seu gargalo hoje: ${escapeHtml(g[0])}.</b> É a menor das taxas que já dá para medir. ${escapeHtml(g[3])}</p><button type="button" class="btn btn-gold btn-sm" data-jor-tool="${g[2]}">Ajustar agora</button>`;
    }
    return `<div class="jor-aval">${linhas.map(([a, b, c]) => `<div><small>${a}</small><b>${b}</b><span>${c}</span></div>`).join('')}</div>
      <div class="jor-ajuste">${ajuste}</div>
      <p class="jor-sub">Repita este olhar toda sexta, no ritual de 30 minutos. A cada 90 dias, revise o objetivo.</p>
      <div class="jor-actions"><button type="button" class="btn btn-outline btn-sm" data-jor-tool="painel">Painel e diagnóstico</button><button type="button" class="btn btn-outline btn-sm" data-jor-tool="assistente">Assistente da semana</button><button type="button" class="btn btn-teal btn-sm" id="jor-novo">Definir novo objetivo</button></div>`;
  }

  // --- Renderização ---
  function renderJornada() {
    const box = document.getElementById('jornada');
    if (!box || !JOR_FASES) return;
    const j = jorGet();
    const v = j.view; const F = JOR_FASES[v - 1];
    const painel = document.getElementById('painel');
    painel.dataset.jfase = v;
    const editando = configEl.dataset.jf === 'all';
    const emCfg = v === 1 || v === 2;
    if (emCfg && !editando) configEl.dataset.jf = String(v);
    if (!emCfg && !editando) configEl.dataset.jf = '';
    configEl.classList.toggle('collapsed', !emCfg && !editando);
    configEl.classList.toggle('jor-wait', emCfg && !j.seen[v]);
    document.getElementById('hoje').hidden = v < 4 || v === 3;
    const done = document.getElementById('cfg-done');
    if (done && !editando) done.textContent = v === 1 ? 'Concluir perfil e escolher o objetivo' : (v === 2 ? 'Confirmar objetivo e ver o diagnóstico' : 'Ver minha próxima ação');
    if (editando) done.textContent = 'Salvar e voltar';
    syncCollapseUI();
    const steps = JOR_FASES.map((f) => {
      const st = f.n < j.fase ? 'done' : (f.n === j.fase ? 'cur' : 'lock');
      return `<li class="${st}${f.n === v ? ' view' : ''}"><button type="button" ${f.n > j.fase ? 'disabled' : ''} data-jor-ir="${f.n}"><span class="n">${f.n < j.fase ? '✓' : f.n}</span><span class="t">${escapeHtml(f.curto)}</span></button></li>`;
    }).join('');
    let corpo = '', rodape = '';
    if (!j.seen[v]) {
      rodape = `<button type="button" class="btn btn-gold" id="jor-go" data-ico="arrow">Vamos em frente</button>`;
    } else if (v === 1 || v === 2) {
      const falt = camposFaltando(v).length;
      corpo = `<p class="jor-sub">${falt ? (falt > 1 ? `Faltam ${falt} campos obrigatórios. Eles estão marcados com * logo abaixo.` : 'Falta 1 campo obrigatório. Ele está marcado com * logo abaixo.') : 'Tudo preenchido. Use o botão ao final do formulário para seguir.'}</p>`;
    } else if (v === 3) { corpo = diagHtml(); rodape = '<button type="button" class="btn btn-gold" id="jor-prox">Entendi, montar meu plano</button>'; }
    else if (v === 4) { corpo = campanhasHtml() + '<div class="jor-prod"><div><b>Para produzir as peças:</b> roteiro em blocos para o teleprompter, kit de gravação que cabe no orçamento, editor de vídeo e pedido de imagem para a IA, com as regras do seu conselho. O passo a passo está nas Partes 6 e 7 e no Anexo A do guia.</div><div class="jor-prod-btns"><button type="button" class="btn btn-outline btn-sm" data-jor-tool="roteiro">Roteiro e teleprompter</button><button type="button" class="btn btn-outline btn-sm" data-jor-tool="ferramentas">Vídeo e imagem</button></div></div><p class="jor-sub">O seu passo a passo está logo abaixo, em <b>Hoje</b>: faça um passo por vez, até o fim.</p>'; rodape = '<button type="button" class="btn btn-gold" id="jor-prox">Plano em andamento: ir ao WhatsApp e CRM</button>'; }
    else if (v === 5) { corpo = waHtml(); rodape = '<button type="button" class="btn btn-gold" id="jor-prox">Pronto: avaliar resultados</button>'; }
    else if (v === 6) { corpo = avalHtml(); }
    box.innerHTML = `<ol class="jor-steps" aria-label="Fases da jornada">${steps}</ol>
      <div class="jor-card"><p class="jor-eyebrow">Fase ${v} de 6 · ${escapeHtml(F.nome)}</p><h3>${escapeHtml(F.msg)}</h3><p class="jor-why"><b>Por que isso importa:</b> ${escapeHtml(F.why)}</p>${corpo}${rodape ? `<div class="jor-foot">${rodape}</div>` : ''}</div>`;
  }
  function jorIr(n) { const j = jorGet(); j.view = Math.min(n, j.fase); jorSet(j); configEl.dataset.jf = ''; renderJornada(); }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-jor-ir],[data-jor-tool],[data-jor-copy],#jor-go,#jor-prox,#jor-novo,.stim-go');
    if (!t) return;
    const j = jorGet();
    if (t.dataset.jorIr) { jorIr(Number(t.dataset.jorIr)); return; }
    if (t.dataset.jorTool) { openTool(t.dataset.jorTool); return; }
    if (t.dataset.jorCopy) { copyText(t.dataset.jorCopy, t); return; }
    if (t.id === 'jor-go') { j.seen[j.view] = 1; jorSet(j); renderJornada(); if (j.view < 3) { const first = configEl.querySelector(j.view === 1 ? '#stim-prof' : '#stim-obj'); if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    if (t.id === 'jor-prox') { const p = j.view + 1; j.fase = Math.max(j.fase, p); j.view = p; j.seen[p] = 0; jorSet(j); renderJornada(); document.getElementById('jornada').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (t.id === 'jor-novo') { j.view = 2; j.fase = 2; j.seen[2] = 0; jorSet(j); configEl.dataset.jf = '2'; renderJornada(); document.getElementById('jornada').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (t.classList.contains('stim-go')) {
      const s = t.closest('.stim'); s.classList.add('on'); t.hidden = true;
      const el = document.getElementById(s.dataset.foco);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => el.focus({ preventScroll: true }), 250); }
    }
  });
  document.addEventListener('change', (e) => {
    const w = e.target.closest && e.target.closest('[data-jor-wa]');
    if (!w) return;
    const j = jorGet(); j.wa[w.dataset.jorWa] = w.checked ? 1 : 0; jorSet(j); renderJornada();
  });
  document.getElementById('cfg-edit').addEventListener('click', () => { configEl.dataset.jf = 'all'; renderJornada(); });
  configEl.addEventListener('input', () => { if (jorCfgFase()) renderJornada(); });
  renderJornada();
