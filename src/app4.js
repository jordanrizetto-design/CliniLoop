
  // ===================== Plano de ações (Hoje e playbook) =====================
  function metaSemana() {
    const m = storeGet(META_KEY, null);
    const n = m && Number(m.n);
    return n >= 1 ? Math.min(30, Math.round(n)) : metaPadrao();
  }
  function statusDe(last) {
    const hoje = todayISO();
    if (!last) return { cls: 'pend', label: 'Pendente' };
    const due = addDays(last, CICLO);
    return due < hoje ? { cls: 'late', label: `Revisão atrasada (desde ${fmtDate(due)})`, last }
      : { cls: 'ok', label: `Feito em ${fmtDate(last)} · revisar até ${fmtDate(due)}`, last };
  }
  function computeActions() {
    const uso = storeGet(USO_KEY, {}) || {};
    const hoje = todayISO();
    const rota = computeRota();
    const A = [];
    const add = (p, txt, onde, tool, anchor) => A.push({ p, txt, onde, tool, anchor });
    if (!cfg.profissional) add(-1, 'Escolha o tipo de profissional (passo 2 de "Comece aqui"). As regras do seu conselho entram em todos os prompts.', 'Comece aqui', 'config');
    if (!cfg.metaFrase) add(-0.9, 'Escreva em uma frase o resultado que você quer, para qual serviço e em quanto tempo (passo 1).', 'Comece aqui', 'config', 'cfg-meta');
    if (!cfg.especialidade) add(-0.8, 'Informe sua especialidade ou área de atuação (passo 2).', 'Comece aqui', 'config', 'cfg-espec');
    if (!cfg.cidade) add(-0.7, 'Informe cidade e bairro (passo 2): eles entram nas palavras-chave e nas campanhas.', 'Comece aqui', 'config', 'cfg-cidade');
    if (!cfg.servicos) add(-0.65, 'Liste os serviços que quer divulgar (passo 3). Eles viram opções no Rastreador e nas campanhas.', 'Comece aqui', 'config', 'cfg-servicos');
    if (!cfg.sobre) add(-0.6, 'Descreva formação, experiência e diferenciais (passo 3). Esse texto alimenta quase todas as ferramentas.', 'Comece aqui', 'config', 'cfg-sobre');
    const riscos = riskScan(cfg.metaFrase + ' ' + cfg.transformacao + ' ' + cfg.servicos);
    if (riscos.length) add(-0.5, 'Seu objetivo ou perfil menciona algo que o seu conselho restringe. Revise no "Comece aqui".', 'Comece aqui', 'config');
    if (cfg.objetivo === 'online' && (cfg.atendimento || []).indexOf('online') < 0) add(-0.45, 'Seu objetivo é atender online, mas o atendimento online não está marcado. Ajuste no passo 2.', 'Comece aqui', 'config');
    const atr = pacientes.filter(isLate);
    if (atr.length) add(0.2, atr.length === 1 ? 'Faça o próximo passo vencido no Rastreador e defina uma nova data.' : `Faça os ${atr.length} próximos passos vencidos no Rastreador e defina novas datas.`, 'Rastreador de pacientes', 'rastreador');
    const colAtr = colegas.filter((c) => c.prox && c.prox <= hoje);
    if (colAtr.length) add(0.3, `Retome o contato com ${colAtr.length === 1 ? colAtr[0].nome : colAtr.length + ' colegas'} (data vencida).`, 'Rede de colegas', 'colegas');
    if (!cfg.registro && cfg.profissional) add(0.5, 'Informe seu registro no conselho (passo 2): ele é obrigatório na publicidade.', 'Comece aqui', 'config', 'cfg-registro');
    const dow = new Date().getDay();
    const sw = weekStats(mondayISO());
    if ((dow >= 4 || dow === 0) && sw.conteudos < metaSemana() && uso.roteiro) add(0.6, `Faltam ${metaSemana() - sw.conteudos} conteúdo(s) para a meta da semana. Use uma pauta do calendário e registre no Diário.`, 'Roteiros de conteúdo', 'roteiro');
    if (pacientes.length && (!uso.assistente || uso.assistente < mondayISO())) add(0.7, 'Faça o ritual da semana: importe as pendências e gere a agenda em blocos.', 'Assistente da semana', 'assistente');
    const parados = pacientes.filter((p) => marcoParado(p));
    const planosParados = parados.filter((p) => p.etapa === 'Plano proposto').length;
    if (planosParados) add(0.35, planosParados === 1 ? 'Um plano proposto está sem decisão há 2 dias ou mais. Faça o contato de acompanhamento, com informação útil e sem pressão.' : `${planosParados} planos propostos estão sem decisão há 2, 7 ou 15 dias. Faça os contatos de acompanhamento, com informação útil e sem pressão.`, 'Rastreador de pacientes', 'rastreador');
    if (parados.length > planosParados) add(0.4, `${parados.length - planosParados} contato(s) ainda não agendaram (retomadas de 1, 3 e 7 dias). Mande algo útil sobre a dúvida da pessoa, sem pressão.`, 'Rastreador de pacientes', 'rastreador');
    const semData = pacientes.filter((p) => p.etapa !== 'Encerrado' && !p.data).length;
    if (semData) add(0.9, semData === 1 ? 'Defina a data do próximo passo do contato que está sem data.' : `Defina a data do próximo passo dos ${semData} contatos sem data.`, 'Rastreador de pacientes', 'rastreador');
    Object.keys(PB_TOOLS).forEach((id, i) => {
      if (id === 'briefing' && cfg.produtor !== 'terceiro') return;
      const st = statusDe(uso[id]);
      const idx = rota.indexOf(id);
      if (st.cls === 'pend') {
        let p = idx >= 0 ? 1 + idx : 10 + i;
        if (id === 'briefing') p = 1.5;
        if (id === 'etica' && (uso.roteiro || uso.campanha)) p = 2.5;
        if (id === 'rastreador' && !pacientes.length) p = Math.min(p, 3);
        add(p, PB_TOOLS[id].fazer, PB_TOOLS[id].nome, id);
      } else if (st.cls === 'late') add(0.8, `Revisão atrasada: ${PB_TOOLS[id].revisar}`, PB_TOOLS[id].nome, id);
    });
    if (!sw.conteudos && uso.roteiro) add(4, 'Registre no Diário de conteúdo o que publicou nesta semana, para o painel medir.', 'Painel e diagnóstico', 'painel', 'diario');
    A.sort((a, b) => a.p - b.p);
    return A;
  }

  // ===================== "Comece aqui" recolhido =====================
  const cfgSummary = document.getElementById('cfg-summary');
  const cfgEdit = document.getElementById('cfg-edit');
  function onbComplete() { return camposFaltando().length === 0; }
  // Campos obrigatórios do "Comece aqui", na ordem em que o usuário os encontra.
  function camposFaltando(fase) {
    const P = [['prof', 'profissional', 'o tipo de profissional'], ['cfg-registro', 'registro', 'o registro no conselho'],
      ['cfg-espec', 'especialidade', 'a especialidade'], ['cfg-cidade', 'cidade', 'cidade e bairro'], ['cfg-servicos', 'servicos', 'os serviços que quer divulgar'],
      ['cfg-publico', 'publico', 'o público ideal'], ['cfg-icp-dor', 'icpDor', 'a principal dor ou dúvida do paciente ideal'], ['cfg-sobre', 'sobre', 'formação e diferenciais']];
    const O = [['cfg-meta', 'metaFrase', 'o resultado que você quer (objetivo)']];
    const L = fase === 1 ? P : (fase === 2 ? O : P.concat(O));
    return L.filter((x) => !String(cfg[x[1]] || '').trim()).map((x) => ({ id: x[0], txt: x[2] }));
  }
  function syncCollapseUI() {
    const c = configEl.classList.contains('collapsed');
    cfgSummary.hidden = !c;
    cfgEdit.hidden = !c;
    document.getElementById('cfg-sub').textContent = c ? 'Tudo pronto. Edite quando seu objetivo ou seus serviços mudarem.' : 'Três passos para o CliniLoop entender seu consultório. Fica salvo neste navegador.';
    cfgSummary.innerHTML = `<b>Objetivo:</b> ${escapeHtml(objInfo().label)}${cfg.metaFrase ? ' — ' + escapeHtml(cfg.metaFrase) : ''} · ${escapeHtml(profInfo() ? profInfo().label : 'profissão não definida')} · ${escapeHtml(cfg.especialidade || '')} · ${escapeHtml(cfg.cidade || '')}`;
  }
  cfgEdit.addEventListener('click', () => { configEl.classList.remove('collapsed'); syncCollapseUI(); document.getElementById('cfg-meta').focus(); });
  function irAoCampo(id) {
    configEl.classList.remove('collapsed'); syncCollapseUI();
    const el = id === 'prof' ? document.querySelector('input[name="profissional"]') : document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el.focus({ preventScroll: true }), 250);
  }
  document.getElementById('cfg-done').addEventListener('click', () => {
    const faltam = camposFaltando(typeof jorCfgFase === 'function' ? jorCfgFase() : undefined);
    const box = document.getElementById('obj-hint');
    document.querySelectorAll('#onb-body .invalid').forEach((x) => x.classList.remove('invalid'));
    if (faltam.length) {
      box.className = 'obj-hint warn';
      box.innerHTML = `<b>Falta${faltam.length > 1 ? 'm' : ''} ${faltam.length} ${faltam.length > 1 ? 'campos' : 'campo'} para montar o seu caminho.</b> Clique para ir direto ao campo:<ul class="falta-lista"></ul>`;
      faltam.forEach((f) => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'linkish'; b.textContent = f.txt;
        b.addEventListener('click', () => irAoCampo(f.id));
        li.appendChild(b); box.querySelector('ul').appendChild(li);
        const el = f.id !== 'prof' && document.getElementById(f.id); if (el) el.classList.add('invalid');
      });
      box.hidden = false;
      irAoCampo(faltam[0].id);
      return;
    }
    box.hidden = true;
    if (typeof jorAvancar === 'function' && jorAvancar()) return;
    configEl.classList.add('collapsed'); syncCollapseUI();
    hojeIdx = 0;
    renderHoje();
    const h = document.getElementById('hoje');
    h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const card = h.querySelector('.hoje-next');
    card.classList.remove('flash-card'); void card.offsetWidth; card.classList.add('flash-card');
  });

  // ===================== Trilha do objetivo =====================
  // O objetivo vira uma sequência de passos. O app conduz um passo por vez, até o fim, e só então pergunta o próximo objetivo.
  function trilhaPassos() {
    const ids = computeRota().filter((id) => PB_TOOLS[id]);
    if (ids.indexOf('painel') < 0) ids.push('painel');
    return ids;
  }
  function trilhaSt() {
    const t = storeGet(TRILHA_KEY, {}) || {};
    if (t.obj !== cfg.objetivo) return { obj: cfg.objetivo, feitos: {}, pulados: [], rotina: false };
    return { obj: t.obj, feitos: t.feitos || {}, pulados: t.pulados || [], rotina: !!t.rotina };
  }
  function passoFeito(id, t) { return !!t.feitos[id] || (id === 'rastreador' && pacientes.length > 0) || (id === 'colegas' && colegas.length > 0); }
  function trilhaInfo() {
    const t = trilhaSt();
    const passos = trilhaPassos();
    const pend = passos.filter((id) => !passoFeito(id, t));
    let atual = pend.find((id) => t.pulados.indexOf(id) < 0) || null;
    if (!atual && pend.length) { atual = pend[0]; t.pulados = []; }
    return { t, passos, pend, atual };
  }
  function renderTrilha(tr) {
    const ol = document.getElementById('hj-trilha');
    ol.innerHTML = '';
    tr.passos.forEach((id, i) => {
      const li = document.createElement('li');
      const feito = passoFeito(id, tr.t);
      li.className = feito ? 'feito' : (id === tr.atual ? 'atual' : '');
      li.innerHTML = `<span class="tr-n" aria-hidden="true">${feito ? '✓' : i + 1}</span><span class="tr-t">${escapeHtml(TOOL_NAMES[id] || id)}</span>`;
      if (id === tr.atual) li.setAttribute('aria-current', 'step');
      ol.appendChild(li);
    });
    ol.hidden = false;
  }
  function renderTrilhaFim(tr) {
    const ol = document.getElementById('hj-trilha');
    ol.innerHTML = '';
    Object.keys(OBJETIVOS).filter((k) => k !== cfg.objetivo).forEach((k) => {
      const li = document.createElement('li'); li.className = 'tr-opcao';
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn-outline btn-sm'; b.textContent = OBJETIVOS[k].label;
      b.addEventListener('click', () => { const r = document.querySelector(`input[name="objetivo"][value="${k}"]`); if (r) r.click(); hojeIdx = 0; renderHoje(); });
      li.appendChild(b); ol.appendChild(li);
    });
    const li = document.createElement('li'); li.className = 'tr-opcao';
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'linkish'; b.textContent = 'Por enquanto, só a rotina semanal';
    b.addEventListener('click', () => { tr.t.rotina = true; storeSet(TRILHA_KEY, tr.t); renderHoje(); });
    li.appendChild(b); ol.appendChild(li);
    ol.hidden = false;
  }

  // ===================== Painel "Hoje" =====================
  let hojeIdx = 0;
  function renderHoje() {
    const acoes = computeActions();
    document.getElementById('hoje-data').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const ondeEl = document.getElementById('hj-onde');
    const acaoEl = document.getElementById('hj-acao');
    const fazer = document.getElementById('hj-fazer');
    const outra = document.getElementById('hj-outra');
    const count = document.getElementById('hj-count');
    const feitoBtn = document.getElementById('hj-feito');
    const trilhaEl = document.getElementById('hj-trilha');
    const tr = onbComplete() ? trilhaInfo() : null;
    const emTrilha = !!tr && !tr.t.rotina;
    fazer.hidden = false; feitoBtn.hidden = true; trilhaEl.hidden = true; outra.dataset.modo = '';
    if (emTrilha && tr.atual) {
      const a = tr.atual;
      const n = tr.passos.indexOf(a) + 1;
      ondeEl.textContent = `${objInfo().label} · passo ${n} de ${tr.passos.length}`;
      acaoEl.textContent = PB_TOOLS[a].fazer;
      fazer.dataset.tool = a; fazer.dataset.anchor = '';
      feitoBtn.dataset.tool = a; feitoBtn.hidden = false;
      outra.hidden = tr.pend.length < 2; outra.textContent = 'Pular por enquanto'; outra.dataset.modo = 'trilha';
      count.innerHTML = `<b>Pronto quando:</b> ${escapeHtml(TRILHA_FIM[a] || 'você terminar a ferramenta.')} Depois, clique em "Concluí este passo".`;
      renderTrilha(tr);
    } else if (emTrilha) {
      ondeEl.textContent = 'Caminho concluído';
      acaoEl.textContent = `Você completou os ${tr.passos.length} passos de "${objInfo().label}". Qual será o próximo objetivo?`;
      fazer.dataset.tool = 'ebook'; fazer.dataset.anchor = ''; fazer.textContent = 'Ver o playbook';
      outra.hidden = true; count.textContent = 'Você também pode manter só a rotina semanal e voltar a este caminho quando quiser.';
      renderTrilhaFim(tr);
    } else if (!acoes.length) {
      ondeEl.textContent = 'Tudo em dia';
      acaoEl.textContent = 'Registre os números da semana e gere o playbook para planejar as próximas duas semanas.';
      fazer.dataset.tool = 'ebook'; fazer.dataset.anchor = '';
      outra.hidden = true; count.textContent = '';
    } else {
      if (hojeIdx >= acoes.length) hojeIdx = 0;
      const a = acoes[hojeIdx];
      ondeEl.textContent = a.onde;
      acaoEl.textContent = a.txt;
      fazer.dataset.tool = a.tool; fazer.dataset.anchor = a.anchor || '';
      outra.hidden = acoes.length < 2; outra.textContent = 'Outra sugestão';
      count.innerHTML = `${hojeIdx + 1} de ${acoes.length} ${acoes.length === 1 ? 'ação' : 'ações'} no seu plano · <button type="button" class="linkish" id="hj-plano">ver todas no Playbook</button>`;
      document.getElementById('hj-plano').addEventListener('click', () => openTool('ebook'));
    }
    if (!(emTrilha && !tr.atual)) fazer.textContent = 'Fazer agora';

    const hoje = todayISO();
    const atr = pacientes.filter(isLate).map((p) => ({ t: `${p.nome}${p.passo ? ' · ' + p.passo : ''} — ${fmtShort(p.data)}`, d: p.data }))
      .concat(colegas.filter((c) => c.prox && c.prox <= hoje).map((c) => ({ t: `Colega: ${c.nome} — ${fmtShort(c.prox)}`, d: c.prox })))
      .sort((a, b) => a.d.localeCompare(b.d));
    const nEl = document.getElementById('hj-atr-n');
    nEl.textContent = String(atr.length);
    nEl.classList.toggle('late', atr.length > 0);
    const ul = document.getElementById('hj-atr-list');
    ul.innerHTML = '';
    const li = (txt, vazio) => { const el = document.createElement('li'); el.textContent = txt; if (vazio) el.className = 'vazio'; ul.appendChild(el); };
    if (!pacientes.length && !colegas.length) li('Registre cada novo contato no Rastreador, com próximo passo e data.', true);
    else if (!atr.length) li('Nenhum próximo passo vencido. Ótimo.', true);
    atr.slice(0, 3).forEach((x) => li(x.t));
    if (atr.length > 3) li(`e mais ${atr.length - 3}`);

    const meta = metaSemana();
    const sw = weekStats(mondayISO());
    const mi = document.getElementById('hj-meta-n');
    if (document.activeElement !== mi) mi.value = meta;
    document.getElementById('hj-posts').textContent = String(sw.conteudos);
    document.getElementById('hj-meta-bar').style.width = Math.min(100, Math.round((sw.conteudos / meta) * 100)) + '%';
    const meter = document.getElementById('hj-meter');
    meter.setAttribute('aria-valuenow', String(sw.conteudos));
    meter.setAttribute('aria-valuemax', String(meta));
    meter.classList.toggle('done', sw.conteudos >= meta);
    document.getElementById('hj-semana').textContent = `Novos contatos: ${sw.contatos} · agendados: ${sw.agendados} · iniciaram tratamento: ${sw.iniciados}`;

    const bk = document.getElementById('hj-backup');
    const temDados = pacientes.length || colegas.length || cfg.sobre || Object.keys(resultados()).length;
    const ultimo = storeGet(BACKUP_KEY, '');
    if (temDados && (!ultimo || addDays(ultimo, CICLO) < hoje)) {
      bk.innerHTML = `<span>Seus dados ficam só neste navegador. ${ultimo ? `Último backup em ${fmtDate(ultimo)}.` : 'Você ainda não fez um backup.'}</span>`;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn-outline btn-sm'; b.dataset.ico = 'download';
      b.textContent = 'Fazer backup agora';
      b.addEventListener('click', fazerBackup);
      bk.appendChild(b);
      bk.hidden = false;
    } else bk.hidden = true;
    if (typeof renderExtras === 'function') renderExtras();
    syncCollapseUI();
  }
  document.getElementById('hj-fazer').addEventListener('click', (e) => openAnchor(e.currentTarget.dataset.tool || 'config', e.currentTarget.dataset.anchor));
  document.getElementById('hj-outra').addEventListener('click', (e) => {
    if (e.currentTarget.dataset.modo === 'trilha') { const tr = trilhaInfo(); if (tr.atual) { tr.t.pulados = (tr.t.pulados || []).concat(tr.atual); storeSet(TRILHA_KEY, tr.t); } }
    else hojeIdx++;
    renderHoje();
  });
  document.getElementById('hj-feito').addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.tool; if (!id) return;
    const t = trilhaSt(); t.feitos[id] = todayISO(); storeSet(TRILHA_KEY, t); markUsed(id, true);
    renderHoje();
    const h = document.getElementById('hoje'); h.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.getElementById('hj-rastreador').addEventListener('click', () => openTool('rastreador'));
  document.getElementById('hj-conteudo').addEventListener('click', () => openAnchor('painel', 'ct-form'));
  document.getElementById('hj-contato').addEventListener('click', () => openAnchor('rastreador', 'tracker-form'));
  document.getElementById('hj-meta-n').addEventListener('change', (e) => {
    const n = Math.max(1, Math.min(30, Math.round(Number(e.target.value) || 0)));
    storeSet(META_KEY, { n });
    e.target.value = n;
    renderHoje();
  });

  // ===================== Briefing para terceiros =====================
  function buildBriefing(get) {
    const role = ROLES[get('para')] || ROLES.agencia;
    const res = resultados();
    const E = escapeHtml;
    const cs = councilObjs();
    const secoes = [];
    const sec = (titulo, corpoMd) => secoes.push([titulo, corpoMd]);
    sec('Quem sou', [
      `- **Profissional:** ${profLabel()}`, `- **Nome:** ${cfg.nome || '[CONFIRMAR]'}`, `- **Registro:** ${cfg.registro || '[CONFIRMAR]'}`,
      `- **Especialidade ou área:** ${cfg.especialidade || '[CONFIRMAR]'}`, `- **Tipo de conta:** ${CONTA[cfg.conta] || CONTA.profissional}`, `- **Onde atendo:** ${cfg.cidade || '[CONFIRMAR]'} · ${(cfg.atendimento || []).join(', ')} · ${cfg.pagamento}`,
      `- **Serviços a divulgar:** ${cfg.servicos || '[CONFIRMAR]'}`, `- **Canais atuais:** ${(cfg.canais || []).join(', ') || '—'} ${cfg.arroba || ''}`,
      `- **Formação e diferenciais:** ${cfg.sobre || '[CONFIRMAR]'}`].join('\n'));
    sec('Objetivo dos próximos 90 dias', `**${objInfo().label}.** ${cfg.metaFrase || ''}\n\n${objInfo().guia}`);
    const bloco = (id, rec) => (res[id] ? res[id].t : `_Ainda não definido. ${rec}_`);
    sec('Público, ICP e persona', `${cfg.publico ? `**Público ideal:** ${cfg.publico}\n\n` : ''}${bloco('publico', 'Recomendação: definir com a ferramenta Público, ICP e persona antes de produzir.')}`);
    sec('Marca e tom de voz', bloco('profissional', 'Recomendação: definir com a ferramenta Persona do profissional. Enquanto isso: linguagem simples, acolhedora e sem autopromoção.'));
    sec('Nicho e diferencial', `${cfg.transformacao ? `**Proposta de valor:** ${cfg.transformacao}\n\n` : ''}${bloco('nicho', 'Recomendação: definir com a ferramenta Nicho e diferencial.')}`);
    sec('Conteúdo: temas, pautas e frequência', `${cfg.baldes ? `**Temas de conteúdo:** ${cfg.baldes}\n\n` : ''}**Meta:** ${metaSemana()} conteúdos por semana (${(TEMPO[cfg.tempo] || TEMPO['2a3']).label} disponíveis da minha parte; ${CAMERA[cfg.camera]}).\n\n${bloco('pautas', 'Recomendação: gerar palavras-chave, 30 pautas e calendário com a ferramenta Pautas e palavras-chave.')}`);
    if (['atendimento', 'agencia', 'trafego'].includes(get('para'))) sec('Atendimento', bloco('atendimento', 'Recomendação: aprovar as 12 respostas rápidas e o roteiro de agendamento em cinco mensagens com a ferramenta Atendimento e agendamento.'));
    sec('Escopo e entregas', `${get('entregas')}\n\n- **Orçamento:** ${get('orcamento') || '[CONFIRMAR]'}\n- **Início e período de teste:** ${get('prazo') || '[CONFIRMAR]'}\n- **Aprovação:** ${get('aprovacao') || 'Nada é publicado sem a minha aprovação.'}\n- **Acessos:** ${get('acessos') || '[CONFIRMAR]'} (prefira acesso de parceiro em vez de senha pessoal)\n- **O que não pode:** ${get('restricoes') || '—'}`);
    sec('Fluxo de produção e aprovação', `${METODO.fluxo.map((x, i) => `${i + 1}. ${x}`).join('\n')}\n\n- A revisão editorial (a peça é específica, compreensível e entrega a promessa) vem antes da revisão clínica e ética, que é sempre minha ou do responsável técnico.\n- Cada pauta chega com: dúvida do paciente, público, estágio de decisão, formato, fonte clínica, imagem de apoio e autorização, responsável pela revisão e CTA.\n- Afirmação clínica sem fonte fica marcada como pendente de validação. Nada vai ao ar com pendência que impeça a publicação.\n- Toda peça longa sai com versão curta autossuficiente, com as ressalvas.\n- Impulsionamento só de peça educativa já revisada, com valor aprovado por mim e público com pertinência geográfica.`);
    sec('Regras inegociáveis', `${cs.map((c) => `**${c.conselho}** — ${c.norma}\n- Identificação obrigatória: ${c.ident}\n${c.nao.map((x) => '- Não: ' + x).join('\n')}\n- Observação: ${c.extra}`).join('\n\n') || 'Tipo de profissional não definido: [CONFIRMAR as regras do conselho].'}\n\n${REGRAS_GERAIS.map((g) => '- ' + g).join('\n')}${isMental() ? '\n- ' + SAUDE_MENTAL : ''}${cfg.profissional === 'multi' ? '\n- Peças institucionais da clínica seguem a regra mais restritiva entre os conselhos envolvidos.' : ''}\n- Toda peça passa pelo Verificador ético e pela minha aprovação antes de ir ao ar.\n- Dados de pacientes (nomes, fotos, conversas, prontuário) nunca são usados sem autorização por escrito e nunca saem dos canais oficiais da clínica (LGPD). O fornecedor assina termo de confidencialidade.`);
    sec('Como vamos medir', `${role.metricas.map((m) => '- ' + m).join('\n')}\n- E, acima de tudo: contatos, agendados, comparecimentos e tratamentos iniciados por origem, que eu acompanho no meu rastreador.\n\nRelatório mensal com esses números e as 3 decisões para o mês seguinte. Seguidores e curtidas, sozinhos, não são métrica de sucesso.`);
    sec('Perguntas para avaliar o fornecedor', ['Que trabalhos fizeram para profissionais de saúde (com autorização para mostrar)?', `Como conhecem e aplicam as regras do ${conselhosTxt()}? Quem revisa?`, 'Qual é o processo de aprovação e o prazo de cada etapa?', 'Quem é o responsável pela minha conta e como é o contato no dia a dia?', 'O que vem no relatório mensal e quais métricas consideram sucesso?', 'Qual o prazo mínimo de contrato e como é o encerramento?', 'De quem são as contas, os arquivos e os criativos ao final do contrato?', 'Como tratam dados de pacientes e o que diz o contrato sobre LGPD?'].map((q, i) => `${i + 1}. ${q}`).join('\n'));
    sec('Sinais de alerta', ['Promete número de seguidores, viralização ou de pacientes.', 'Sugere comprar seguidores ou engajamento.', 'Propõe preço, promoção, sorteio, antes e depois ou depoimento sem checar o conselho.', 'Quer publicar sem a sua aprovação.', 'Só fala de curtidas e alcance, nunca de conversas e agendamentos.', 'Pede sua senha pessoal em vez de acesso de parceiro.', 'Não aceita termo de confidencialidade.'].map((x) => '- ' + x).join('\n'));

    lastBriefingMd = `# Briefing — ${role.label}\n\n${cfg.nome || profLabel()} · ${fmtDate(todayISO())}\n\n` + secoes.map(([t, c]) => `## ${t}\n\n${c}`).join('\n\n') + '\n\n_Montado com o CliniLoop. Não substitui orientação do conselho profissional nem assessoria jurídica._\n';
    lastBriefingHtml = docShell(`Briefing — ${role.label}`, `
      <section class="cover small"><div class="brand">${brandWord()}</div>
      <div><div class="kicker">Briefing · ${E(fmtDate(todayISO()))}</div><h1>Briefing para ${E(role.label.toLowerCase())}</h1><p>${E(cfg.nome || profLabel())}${cfg.cidade ? ' · ' + E(cfg.cidade) : ''}</p></div></section>
      <div class="content">${secoes.map(([t, c]) => `<section class="chapter flow"><h2>${E(t)}</h2>${mdToHtml(c)}</section>`).join('')}</div>
      <div class="foot">Montado com o CliniLoop em ${E(fmtDate(todayISO()))}, no seu navegador. Não substitui orientação do conselho profissional nem assessoria jurídica.</div>`);
    document.getElementById('bf-area').hidden = false;
    document.getElementById('bf-frame').srcdoc = lastBriefingHtml;
    markUsed('briefing');
  }
  function printDoc(html, msgEl) {
    const withPrint = html.replace('</body>', '<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},600);});<\/script></body>');
    const url = URL.createObjectURL(new Blob([withPrint], { type: 'text/html;charset=utf-8' }));
    const w = window.open(url, '_blank');
    if (msgEl) { msgEl.hidden = false; msgEl.textContent = w ? 'Abrimos o documento numa nova aba com a janela de impressão. Escolha "Salvar como PDF" como destino.' : 'O navegador bloqueou a nova aba. Baixe o arquivo .html, abra e imprima com Ctrl+P (Cmd+P no Mac), escolhendo "Salvar como PDF".'; }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  document.getElementById('bf-pdf').addEventListener('click', () => printDoc(lastBriefingHtml, formMsg(document.querySelector('form[data-tool="briefing"]'))));
  document.getElementById('bf-html').addEventListener('click', () => download(`briefing-cliniloop-${todayISO()}.html`, lastBriefingHtml, 'text/html;charset=utf-8'));
  document.getElementById('bf-md').addEventListener('click', (e) => copyText(lastBriefingMd, e.currentTarget));

  function brandWord() {
    return '<svg height="40" xmlns="http://www.w3.org/2000/svg" viewBox="-10 -794 4640 1068" role="img" aria-label="CliniLoop"><path fill="#FFFFFF" d="M389 -707Q506 -707 594.0 -647.0Q682 -587 717 -481H556Q532 -531 488.5 -556.0Q445 -581 388 -581Q327 -581 279.5 -552.5Q232 -524 205.5 -472.0Q179 -420 179 -350Q179 -281 205.5 -228.5Q232 -176 279.5 -147.5Q327 -119 388 -119Q445 -119 488.5 -144.5Q532 -170 556 -220H717Q682 -113 594.5 -53.5Q507 6 389 6Q289 6 208.5 -39.5Q128 -85 81.5 -166.0Q35 -247 35 -350Q35 -453 81.5 -534.5Q128 -616 208.5 -661.5Q289 -707 389 -707Z M977 -740V0H837V-740Z M1100 -702Q1100 -737 1124.5 -760.5Q1149 -784 1186 -784Q1223 -784 1247.5 -760.5Q1272 -737 1272 -702Q1272 -667 1247.5 -643.5Q1223 -620 1186 -620Q1149 -620 1124.5 -643.5Q1100 -667 1100 -702ZM1255 -554V0H1115V-554Z M1921 -325V0H1781V-306Q1781 -372 1748.0 -407.5Q1715 -443 1658 -443Q1600 -443 1566.5 -407.5Q1533 -372 1533 -306V0H1393V-554H1533V-485Q1561 -521 1604.5 -541.5Q1648 -562 1700 -562Q1799 -562 1860.0 -499.5Q1921 -437 1921 -325Z M2039 -702Q2039 -737 2063.5 -760.5Q2088 -784 2125 -784Q2162 -784 2186.5 -760.5Q2211 -737 2211 -702Q2211 -667 2186.5 -643.5Q2162 -620 2125 -620Q2088 -620 2063.5 -643.5Q2039 -667 2039 -702ZM2194 -554V0H2054V-554Z"/><path fill="#4CC9C6" d="M2472 -111H2702V0H2332V-698H2472Z M4334.24 -563Q4405.24 -563 4462.74 -528.0Q4520.24 -493 4553.74 -428.5Q4587.24 -364 4587.24 -279Q4587.24 -194 4553.74 -128.5Q4520.24 -63 4462.74 -27.0Q4405.24 9 4334.24 9Q4273.24 9 4226.74 -16.0Q4180.24 -41 4151.24 -79V264H4011.24V-554H4151.24V-474Q4178.24 -512 4225.74 -537.5Q4273.24 -563 4334.24 -563ZM4297.24 -440Q4259.24 -440 4225.74 -420.5Q4192.24 -401 4171.74 -364.0Q4151.24 -327 4151.24 -277Q4151.24 -227 4171.74 -190.0Q4192.24 -153 4225.74 -133.5Q4259.24 -114 4297.24 -114Q4336.24 -114 4369.74 -134.0Q4403.24 -154 4423.74 -191.0Q4444.24 -228 4444.24 -279Q4444.24 -329 4423.74 -365.5Q4403.24 -402 4369.74 -421.0Q4336.24 -440 4297.24 -440Z"/><path fill="none" stroke="#4CC9C6" stroke-width="140" stroke-linejoin="round" d="M3327.1 -277.0 L3448.6 -418.0 A216.0 216.0 0 1 1 3448.6 -136.0 L3205.6 -418.0 A216.0 216.0 0 1 0 3205.6 -136.0 Z"/></svg>';
  }
  function brandMark() {
    return '<svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true"><path d="M50.40,11.56 A27.50,27.50 0 1 1 21.70,6.50" fill="none" stroke="#7FC4CA" stroke-width="4.60" stroke-linecap="round"/><path d="M27.37,4.21 L22.53,11.77 L18.64,2.13 Z" fill="#7FC4CA"/><rect x="27" y="18" width="10" height="28" rx="3.2" fill="#E07A5F"/><rect x="18" y="27" width="28" height="10" rx="3.2" fill="#E07A5F"/><circle cx="32" cy="32" r="2.6" fill="#F4BFA4"/></svg>';
  }
  function docShell(title, body) {
    return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @page{size:A4; margin:16mm 15mm;}
  *{box-sizing:border-box}
  body{margin:0; background:#E6E0D3; color:#14303A; font-family:'Poppins',system-ui,sans-serif; font-size:15px; line-height:1.6;}
  .book{max-width:820px; margin:24px auto; background:#fff; box-shadow:0 10px 40px rgba(20,48,58,.15);}
  .cover{background:#14303A; color:#F4F2EC; padding:72px 64px; min-height:560px; display:flex; flex-direction:column; justify-content:space-between;}
  .cover.small{min-height:300px; padding:48px 64px;}
  .cover .brand{display:flex; align-items:center; gap:12px; font-family:'Poppins',sans-serif; font-size:1.3rem;}
  .cover .brand .loop{color:#F4BFA4;}
  .cover .kicker{font-family:'Poppins',sans-serif; font-size:.75rem; letter-spacing:.14em; text-transform:uppercase; color:#F4BFA4; margin:40px 0 12px;}
  .cover h1{font-family:'Poppins',sans-serif; font-size:2.4rem; line-height:1.1; margin:0 0 16px;}
  .cover p{color:#C9D6DA; max-width:56ch;}
  .cover .meta{display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:36px;}
  .cover .meta div{border:1.5px solid rgba(244,191,164,.45); border-radius:10px; padding:10px 12px;}
  .cover .meta b{display:block; font-family:'Poppins',sans-serif; font-size:.66rem; letter-spacing:.08em; text-transform:uppercase; color:#F4BFA4; font-weight:500;}
  .content{padding:48px 64px;}
  .chapter{padding-top:8px; margin-bottom:36px;}
  .chapter + .chapter{border-top:1px solid #E6E0D3; padding-top:32px;}
  .chap-n{font-family:'Poppins',sans-serif; font-size:.75rem; letter-spacing:.12em; text-transform:uppercase; color:#C2502F;}
  h2{font-family:'Poppins',sans-serif; font-size:1.6rem; line-height:1.2; margin:4px 0 14px;}
  h3{font-size:1.08rem; margin:20px 0 6px;}
  h4{font-size:.98rem; margin:14px 0 6px;}
  .toc ol{padding-left:22px;} .toc li{margin:4px 0;}
  table{border-collapse:collapse; width:100%; font-size:.86rem; margin:8px 0 14px;}
  th,td{border:1px solid #D8D2C4; padding:7px 9px; text-align:left; vertical-align:top;}
  th{background:#F4F1EA;}
  .tbl{overflow-x:auto;}
  .num td{text-align:center;} .num td:first-child{text-align:left;}
  .pill{display:inline-block; font-size:.74rem; font-weight:600; padding:3px 10px; border-radius:999px; margin:2px 0 6px;}
  .pill.ok{background:#E2EFF0; color:#1F6F78;} .pill.pend{background:#FBE3D8; color:#C2502F;} .pill.late{background:#FBEDEB; color:#B3261E;}
  .tool{border:1px solid #E6E0D3; border-left:4px solid #D8D2C4; border-radius:8px; padding:12px 14px; margin:0 0 12px; break-inside:avoid-page;}
  .tool.prio{border-left-color:#C2502F;}
  .livro-ref{font-family:'Poppins',sans-serif; font-size:.62rem; text-transform:uppercase; letter-spacing:.06em; color:#1F6F78; border:1px solid #1F6F78; padding:1px 7px; border-radius:999px; vertical-align:middle; font-weight:500; margin-left:4px;}
  .tag{font-family:'Poppins',sans-serif; font-size:.62rem; text-transform:uppercase; letter-spacing:.06em; background:#C2502F; color:#fff; padding:2px 7px; border-radius:999px; vertical-align:middle;}
  .saved{background:#F4F9F9; border-radius:8px; padding:10px 14px; margin-top:6px; font-size:.92rem;}
  .saved p, .flow p{margin:0 0 .7em;}
  .rec{margin:4px 0 0; font-size:.92rem;}
  .acoes{padding-left:22px;} .acoes li{margin:0 0 10px;}
  .onde{display:block; font-family:'Poppins',sans-serif; font-size:.68rem; letter-spacing:.06em; text-transform:uppercase; color:#C2502F;}
  .box{background:#F4F1EA; border-radius:10px; padding:14px 18px; margin:12px 0;}
  .cols{display:grid; grid-template-columns:1fr 1fr; gap:14px;}
  .pode{background:#EAF4F5; border-radius:10px; padding:10px 14px;} .nao{background:#FBEDEB; border-radius:10px; padding:10px 14px;}
  .checklist{list-style:none; padding:0;} .checklist li{padding:6px 0 6px 30px; position:relative; border-bottom:1px dashed #E6E0D3;}
  .checklist li::before{content:''; position:absolute; left:0; top:9px; width:16px; height:16px; border:2px solid #1F6F78; border-radius:4px;}
  .foot{font-size:.8rem; color:#3A5059; border-top:1px solid #E6E0D3; padding:18px 64px 28px;}
  a{color:#1F6F78;}
  @media (max-width:640px){ .cover,.content{padding:32px 22px;} .cover .meta,.cols{grid-template-columns:1fr;} .foot{padding:18px 22px;} }
  @media print{
    body{background:#fff;} .book{box-shadow:none; margin:0; max-width:none;}
    .cover{-webkit-print-color-adjust:exact; print-color-adjust:exact; break-after:page;}
    .pill,.tag,th,.box,.saved,.pode,.nao{-webkit-print-color-adjust:exact; print-color-adjust:exact;}
    .chapter{break-before:page; border-top:none !important;} .chapter.flow{break-before:auto;} .chapter:first-child{break-before:auto;}
    .content{padding:0;}
  }
</style></head><body><div class="book">${body}</div></body></html>`;
  }

  // ===================== Playbook da clínica =====================
  function buildEbook() {
    const E = escapeHtml;
    const hoje = todayISO();
    const uso = storeGet(USO_KEY, {}) || {};
    const res = resultados();
    const rota = computeRota();
    const pill = (st) => `<span class="pill ${st.cls}">${E(st.label)}</span>`;
    const toolCard = (id) => {
      const t = PB_TOOLS[id];
      const st = statusDe(uso[id]);
      const prio = rota.includes(id);
      const saved = res[id] ? `<div class="saved"><b>Versão guardada em ${E(fmtDate(res[id].d))}:</b>${mdToHtml(res[id].t)}</div>` : '';
      const rec = st.cls === 'pend' ? `<p class="rec"><b>Recomendação para concluir:</b> ${E(t.fazer)}</p>` : `<p class="rec"><b>Na próxima revisão:</b> ${E(t.revisar)}</p>`;
      const partes = (TOOL_PARTES[id] || []).map((n) => n === 0 ? 'Apresentação' : 'Parte ' + n).join(' e ');
      return `<div class="tool${prio ? ' prio' : ''}"><h4>${E(t.nome)}${prio ? ` <span class="tag">prioridade ${rota.indexOf(id) + 1}</span>` : ''}${partes ? ` <span class="livro-ref">No guia: ${E(partes)}</span>` : ''}</h4>${pill(st)}${rec}${saved}</div>`;
    };
    const cfgRows = [
      ['Objetivo', objInfo().label + (cfg.metaFrase ? ' — ' + cfg.metaFrase : ''), cfg.metaFrase ? null : 'Escreva o resultado, o serviço e o prazo no passo 1.'],
      ['Tipo de profissional', profInfo() ? profLabel() : '—', profInfo() ? null : 'Escolha no passo 2 para carregar as regras do conselho.'],
      ['Registro', cfg.registro || '—', cfg.registro ? null : 'Informe o registro: é obrigatório na publicidade.'],
      ['Especialidade', cfg.especialidade || '—', cfg.especialidade ? null : 'Informe sua especialidade ou área de atuação.'],
      ['Cidade e bairro', cfg.cidade || '—', cfg.cidade ? null : 'Informe para as palavras-chave locais.'],
      ['Serviços', cfg.servicos || '—', cfg.servicos ? null : 'Liste os serviços que quer divulgar.'],
      ['Público ideal', cfg.publico || '—', cfg.publico ? null : 'Descreva em uma linha ou use a ferramenta Público, ICP e persona.'],
      ['Proposta de valor', cfg.transformacao || '—', cfg.transformacao ? null : 'Escreva "Ajudo [público] a [entender ou cuidar de algo]" ou use a ferramenta Nicho e diferencial.'],
      ['Temas de conteúdo', cfg.baldes || '—', cfg.baldes ? null : 'Defina de dois a três temas (educar, humanizar, desmistificar) que nascem da proposta de valor e das dúvidas do paciente.'],
      ['Modo de IA', MODE_NAMES[cfg.plano || 'free'], null]
    ];
    const ws = lastWeeks(8).reverse();
    const g = gargalo();
    const ativos = ETAPAS.map((e) => [etapaLabel(e), pacientes.filter((p) => p.etapa === e).length]);
    const consent = { lemb: pacientes.filter((p) => p.consent && p.consent.lembretes).length, cont: pacientes.filter((p) => p.consent && p.consent.conteudo).length };
    const acoes = computeActions();
    const metaN = metaSemana();
    const ciclos = [1, 2, 3].map((k) => addDays(hoje, CICLO * k));
    const capitulos = ['Como usar este playbook', 'O guia e as sete decisões', 'O método', 'Perfil do consultório', 'Posicionamento', 'Presença e conteúdo', 'Captação: campanhas e colegas', 'Conversão: atendimento e rastreador', 'Painel e gargalo', 'Regras do seu conselho', 'Plano de ação', 'Plano de 90 dias', 'Rotina semanal e quinzenal'];
    const titulo = cfg.metaFrase ? cfg.metaFrase : 'Do primeiro contato ao tratamento';
    let n = 0;
    const cap = (t, body) => { n++; return `<section class="chapter"><div class="chap-n">Capítulo ${n}</div><h2>${E(t)}</h2>${body}</section>`; };
    const conselhoHtml = councilObjs().map((c) => `<h3>${E(c.label)} · ${E(c.conselho)}</h3><p>${E(c.norma)}</p><div class="cols"><div class="pode"><b>Pode, com cuidado</b><ul>${c.pode.map((x) => `<li>${E(x)}</li>`).join('')}</ul></div><div class="nao"><b>Não pode</b><ul>${c.nao.map((x) => `<li>${E(x)}</li>`).join('')}</ul></div></div><p><b>Identificação obrigatória:</b> ${E(c.ident)}</p><p><i>${E(c.extra)}</i></p><p>Fontes: ${c.fontes.map(([t, u]) => `<a href="${E(u)}">${E(t)}</a>`).join(' · ')}</p>`).join('') || '<p><span class="pill pend">Pendente</span> Escolha o tipo de profissional em "Comece aqui" para carregar as regras do seu conselho.</p>';

    return docShell(`Playbook da clínica — ${fmtDate(hoje)}`, `
<section class="cover">
  <div class="brand">${brandWord()}</div>
  <div>
    <div class="kicker">Playbook da clínica · ${E(fmtDate(hoje))}</div>
    <h1>${E(titulo)}</h1>
    <p>Todos os passos para o seu funil girar, do posicionamento ao paciente em tratamento: o que já está feito, o que falta concluir e o que revisar, no mínimo a cada 2 semanas.</p>
  </div>
  <div class="meta">
    <div><b>Profissional</b>${E(profInfo() ? profInfo().label : '—')}${cfg.especialidade ? ' · ' + E(cfg.especialidade) : ''}</div>
    <div><b>Objetivo</b>${E(objInfo().label)}</div>
    <div><b>Próxima revisão</b>${E(fmtDate(ciclos[0]))}</div>
  </div>
</section>
<div class="content">
  <section class="chapter toc"><div class="chap-n">Sumário</div><h2>Neste playbook</h2><ol>${capitulos.map((c) => `<li>${E(c)}</li>`).join('')}</ol></section>
  ${cap('Como usar este playbook', `<p>Atrair pacientes é um funil: muita gente vê o conteúdo, algumas conversam, menos agendam, comparecem e iniciam o tratamento. O CliniLoop transforma isso num ritual: <b>toda semana</b>, Assistente da semana e Painel; <b>a cada 2 semanas</b>, este playbook. ${E(objInfo().porque)}</p><div class="box"><b>Como ler os selos:</b> <span class="pill ok">Feito</span> mostra quando você usou a ferramenta e até quando revisar; <span class="pill pend">Pendente</span> traz uma recomendação para concluir; <span class="pill late">Revisão atrasada</span> indica que se passaram mais de 2 semanas.</div><p>Este documento não contém nomes nem dados de pacientes: os números do funil são contagens.</p>`)}
  ${cap('O guia e as sete decisões', `<p>Este playbook acompanha o <b>${E(LIVRO.titulo)}</b>: ${E(LIVRO.tese)} ${E(LIVRO.ideia)}</p><div class="tbl"><table><tr><th>Etapa</th><th>Partes do guia</th><th>Ferramentas do CliniLoop</th></tr>${LIVRO.etapas.map((et) => `<tr><td>${et.n}. ${E(et.nome)}</td><td>${et.partes.map((n) => `${n}. ${E(LIVRO.partes[n].titulo)}`).join('<br>')}</td><td>${[...new Set(et.partes.flatMap((n) => LIVRO.partes[n].tools))].map((id) => E(TOOL_NAMES[id] || id)).join(', ')}</td></tr>`).join('')}</table></div><h3>Os sete decisões nos últimos 30 dias</h3><div class="tbl"><table class="num"><tr><th>Sim</th><th>O que é</th><th>Últimos 30 dias</th></tr>${sinsDados().map((x) => `<tr><td>${E(x.nome)}</td><td style="text-align:left">${E(x.desc)}</td><td>${E(x.valor)}</td></tr>`).join('')}</table></div><p>Onde aparece um traço, está o primeiro campo a registrar.</p>`)}
  ${cap('O método', `<p>O CliniLoop organiza o trabalho com três bases:</p>${METODO.bases.map(([n, a, d]) => `<h3>${E(n)} <span style="font-weight:400;font-size:.85rem">(${E(a)})</span></h3><p>${E(d)}</p>`).join('')}<h3>Fluxo de cada peça</h3><p>${METODO.fluxo.map(E).join(' → ')}</p><h3>Princípios que valem sempre</h3><ul><li>Viralizar não se garante: em saúde, o objetivo é clareza, confiança e o próximo passo adequado.</li><li>Estratégia antes de produção: transformação, público e baldes antes de roteiros em série.</li><li>Uma promessa verdadeira e uma pergunta por peça; resposta cedo; limite da orientação; um único pedido.</li><li>Procedência: princípio de método, adaptação, observação, informação clínica validada e hipótese são coisas diferentes. Afirmação clínica sem fonte fica pendente de validação.</li><li>Revisão em duas etapas: editorial, depois clínica e ética. A IA aponta problemas, mas não assume responsabilidade profissional.</li><li>Teste uma variável por vez (pergunta, abertura, demonstração ou convite) e compare peças com exposição parecida.</li></ul><h3>Metas S.M.A.R.T. sugeridas para 8 semanas</h3><ul><li>Publicar ${metaN} conteúdos por semana, por 8 semanas, a partir do banco de dúvidas.</li><li>Registrar 100% dos novos contatos no rastreador, com próximo passo e data.</li><li>Responder todo contato novo no mesmo dia.</li><li>Mapear 10 colegas e enviar a carta de apresentação a 5 até o fim do segundo mês.</li></ul><p><i>${E(METODO.aviso)}</i></p>`)}
  ${cap('Perfil do consultório', `<table><tr><th>Item</th><th>Situação</th><th>O que fazer</th></tr>${cfgRows.map(([a, b, c]) => `<tr><td>${E(a)}</td><td>${E(b)}</td><td>${c ? E(c) : '<span class="pill ok">Ok</span>'}</td></tr>`).join('')}</table>`)}
  ${cap('Posicionamento', ['publico', 'profissional', 'nicho'].map(toolCard).join(''))}
  ${cap('Presença e conteúdo', ['perfil', 'pautas', 'roteiro', 'reaproveitamento', 'formacao'].map(toolCard).join('') + `<h3>Roteiro de Reel para saúde em seis tempos (Parte 4)</h3><ol><li>Pergunta específica (0 a 3 s), com texto grande na tela.</li><li>Resposta curta, logo no início.</li><li>Demonstração ou exemplo seguro, com o profissional, um modelo ou uma ilustração.</li><li>Limite da orientação: o que depende de avaliação individual.</li><li>Próxima ação única: enviar para alguém, salvar ou conhecer o atendimento.</li><li>Final que retoma a abertura.</li></ol><h3>Frequência sustentável</h3><div class="tbl"><table><tr><th>Rotina</th><th>Instagram</th><th>YouTube</th><th>LinkedIn</th></tr>${FREQUENCIA.map((r) => `<tr>${r.map((c) => `<td>${E(c)}</td>`).join('')}</tr>`).join('')}</table></div><h3>Antes de publicar</h3><ul class="checklist"><li>Gancho claro nos 3 primeiros segundos, e a promessa é entregue</li><li>Legenda na tela e palavra-chave na legenda; de 0 a 5 hashtags</li><li>Uma única chamada para ação, para o canal oficial</li><li>Fonte para cada afirmação clínica</li><li>Imagem autorizada e permitida para a profissão e o tipo de conta</li><li>Identificação profissional correta</li><li>Ressalvas preservadas na versão curta</li><li>Revisão editorial e revisão clínica e ética feitas</li><li>Plano para a primeira hora</li><li>Registrado no Diário de conteúdo, com a variável testada</li></ul><p><b>Meta:</b> ${metaN} conteúdos por semana (${E((TEMPO[cfg.tempo] || TEMPO['2a3']).label)}).</p>`)}
  ${cap('Captação: campanhas e colegas', ['campanha', 'colegas'].map(toolCard).join('') + (campanhas.length ? `<h3>Campanhas registradas</h3><div class="tbl"><table class="num"><tr><th>Campanha</th><th>Plataforma</th><th>Contatos</th><th>Agendados</th><th>Compareceram</th><th>Iniciaram</th></tr>${campanhas.map((c) => { const s = campStats(c); return `<tr><td>${E(c.nome)}</td><td>${E(c.plat)}</td><td>${s.contatos}</td><td>${s.agendados}</td><td>${s.avaliados}</td><td>${s.iniciados}</td></tr>`; }).join('')}</table></div>` : '') + (colegas.length ? `<h3>Rede de colegas</h3><div class="tbl"><table class="num"><tr>${ETAPAS_COLEGA.map((e) => `<th>${E(e)}</th>`).join('')}</tr><tr>${ETAPAS_COLEGA.map((e) => `<td>${colegas.filter((c) => c.etapa === e).length}</td>`).join('')}</tr></table></div><p>Contrarreferências pendentes: ${colegas.filter((c) => !c.contra && recebidas(c)).length}. Indicações recebidas no total: ${pacientes.filter((p) => p.colega).length}.</p>` : ''))}
  ${cap('Conversão: atendimento e rastreador', ['atendimento', 'rastreador'].map(toolCard).join('') + `<h3>Funil de pacientes hoje</h3><div class="tbl"><table class="num"><tr>${ativos.map(([e]) => `<th>${E(e)}</th>`).join('')}</tr><tr>${ativos.map(([, v]) => `<td>${v}</td>`).join('')}</tr></table></div><p>Próximos passos vencidos: <b>${pacientes.filter(isLate).length}</b>. Contatos que consentiram receber lembretes: ${consent.lemb}; conteúdos e novidades: ${consent.cont}.</p>`)}
  ${cap('Painel e gargalo', `${['assistente', 'painel'].map(toolCard).join('')}<div class="box"><b>Gargalo da semana:</b> ${E(g.txt)}</div><div class="tbl"><table class="num"><tr><th>Semana</th>${METRIC_COLS.map((c) => `<th>${E(c[1])}</th>`).join('')}</tr>${ws.map((w) => `<tr><td>${fmtShort(w.seg)}</td>${METRIC_COLS.map((c) => `<td>${w[c[0]]}</td>`).join('')}</tr>`).join('')}</table></div>`)}
  ${cap('Regras do seu conselho', `${['etica'].map(toolCard).join('')}${conselhoHtml}<h3>Vale para todas as profissões</h3><ul>${REGRAS_GERAIS.map((x) => `<li>${E(x)}</li>`).join('')}${isMental() ? `<li>${E(SAUDE_MENTAL)}</li>` : ''}</ul><p><i>Resumo conferido em outubro de 2026. Não substitui a norma vigente nem orientação do conselho ou de advogado.</i></p>`)}
  ${cap('Plano de ação', `<p>Todos os passos e mudanças pendentes, na ordem recomendada para o seu objetivo e o seu tipo de profissional. Comece pelo primeiro e avance um por vez.</p>${acoes.length ? `<ol class="acoes">${acoes.map((a) => `<li><span class="onde">${E(a.onde)}</span>${E(a.txt)}</li>`).join('')}</ol>` : '<p>Tudo o que o CliniLoop acompanha está em dia. Siga a rotina abaixo.</p>'}${cfg.produtor === 'terceiro' ? toolCard('briefing') : ''}`)}
  ${cap('Plano de 90 dias', `<table><tr><th>Semanas</th><th>Foco</th><th>Entregas</th></tr>
    <tr><td>1 e 2</td><td>Fundamentos</td><td>Público, ICP e persona; marca e tom de voz; nicho e diferencial; perfis e Google revisados; respostas rápidas e rastreador em uso desde o primeiro contato.</td></tr>
    <tr><td>3 a 6</td><td>Constância</td><td>${metaN} conteúdos por semana a partir do banco de dúvidas; gravação em lote uma vez por semana; ritual de segunda (Assistente) e de sexta (Diário e Painel); toda peça pelo Verificador ético; primeiros 5 colegas mapeados.</td></tr>
    <tr><td>7 a 10</td><td>Ajuste</td><td>Comparar baldes, quadros e formatos por retenção, envios, salvamentos e mensagens; testar uma variável por vez (com Trial Reels, se a conta tiver 1.000 seguidores ou mais); atacar o gargalo do funil; primeira campanha medida (orgânica ou paga).</td></tr>
    <tr><td>11 a 13</td><td>Escala</td><td>Repetir o que funcionou; collab com público sobreposto ou palestra local; impulsionar só peças educativas já revisadas; ampliar a rede de colegas; considerar delegar com o Briefing; novo playbook e metas S.M.A.R.T. do próximo trimestre.</td></tr></table>`)}
  ${cap('Rotina semanal e quinzenal', `<h3>Todo dia</h3><ul class="checklist"><li>Primeira resposta em até 5 minutos no horário comercial</li><li>Todo contato vira um registro no Rastreador, com origem; toda conversa termina com um próximo passo marcado</li></ul><h3>Toda semana: o ritual de 30 minutos (Parte 13)</h3><p>Horário fixo, de preferência sexta à tarde, a mesma sequência sempre:</p><ul class="checklist">${RITUAL.map((x) => `<li>${E(x)}</li>`).join('')}</ul><h3>A cada 2 semanas</h3><p>Próximas datas: <b>${ciclos.map(fmtDate).join(' · ')}</b>.</p><ul class="checklist"><li>Atualizar o perfil do consultório e o banco de dúvidas</li><li>Gerar as próximas pautas e o calendário</li><li>Revisar campanhas por agendados e tratamentos iniciados</li><li>Devolver contrarreferências e agradecer indicações</li><li>Retomar pacientes pausados que consentiram receber lembretes</li><li>Conferir se as regras do conselho mudaram</li><li>Fazer backup e gerar um novo playbook</li></ul>`)}
</div>
<div class="foot">Montado pelo CliniLoop em ${E(fmtDate(hoje))}, no seu navegador, a partir dos dados salvos nele. Revise sempre as recomendações antes de aplicá-las.</div>`);
  }
  document.getElementById('pb-build').addEventListener('click', () => {
    lastEbook = buildEbook();
    document.getElementById('pb-area').hidden = false;
    document.getElementById('pb-frame').srcdoc = lastEbook;
    const msg = document.getElementById('pb-msg');
    msg.hidden = false;
    msg.textContent = `✓ Playbook gerado em ${fmtDate(todayISO())}. Próxima revisão sugerida: ${fmtDate(addDays(todayISO(), CICLO))}.`;
    markUsed('ebook');
    document.getElementById('pb-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.getElementById('pb-html').addEventListener('click', () => { if (!lastEbook) lastEbook = buildEbook(); download(`playbook-cliniloop-${todayISO()}.html`, lastEbook, 'text/html;charset=utf-8'); });
  document.getElementById('pb-pdf').addEventListener('click', () => { if (!lastEbook) lastEbook = buildEbook(); printDoc(lastEbook, document.getElementById('pb-msg')); });
  document.getElementById('pb-ics').addEventListener('click', () => {
    const start = addDays(todayISO(), CICLO);
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const desc = icsEsc('Revisão quinzenal do CliniLoop: atualizar perfil e banco de dúvidas; gerar pautas; revisar campanhas; contrarreferências e agradecimentos; retomadas com consentimento; conferir regras do conselho; backup e novo playbook.');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CliniLoop//PT-BR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:revisao-${todayISO()}@cliniloop`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${start.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${addDays(start, 1).replace(/-/g, '')}`,
      'RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=13', 'SUMMARY:Revisão quinzenal (CliniLoop)', `DESCRIPTION:${desc}`,
      'BEGIN:VALARM', 'TRIGGER:PT9H', 'ACTION:DISPLAY', 'DESCRIPTION:Revisão quinzenal', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    download('cliniloop-revisao-quinzenal.ics', ics, 'text/calendar;charset=utf-8');
  });

  // ===================== Backup, restauração e limpeza =====================
  function fazerBackup() {
    storeSet(BACKUP_KEY, todayISO());
    const dados = {};
    appKeys(false).forEach((k) => { try { dados[k] = window.localStorage.getItem(k); } catch (e) { /* noop */ } });
    download(`cliniloop-backup-${todayISO()}.json`, JSON.stringify({ app: APP_ID, versao: 1, criadoEm: new Date().toISOString(), dados }, null, 2), 'application/json');
    document.getElementById('bk-status').textContent = `Backup feito em ${fmtDate(todayISO())}. O arquivo contém nomes e telefones de pacientes: guarde em local seguro e não envie por mensagem.`;
    renderHoje();
  }
  document.getElementById('bk-save').addEventListener('click', fazerBackup);
  const S = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
  const D = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');
  const N = (v) => Math.max(0, Math.round(Number(v) || 0));
  const SANITIZE = {
    [PAC_KEY]: (a) => a.slice(0, 5000).map((p) => ({
      id: S(p.id, 40).replace(/[^a-z0-9]/gi, '') || uid(), nome: S(p.nome, 120), tel: S(p.tel, 40), canal: S(p.canal, 40), servico: S(p.servico, 120),
      origem: S(p.origem, 160), colega: S(p.colega, 40), prof: S(p.prof, 120), etapa: ETAPAS.includes(p.etapa) ? p.etapa : 'Novo',
      resultado: RESULTADOS.includes(p.resultado) ? p.resultado : '', motivo: S(p.motivo, 200), passo: S(p.passo, 300), data: D(p.data), valor: S(String(p.valor || ''), 20),
      notas: S(p.notas, 500), consent: Object.fromEntries(Object.keys(CONSENT).map((k) => [k, D(p.consent && p.consent[k])])),
      revogado: Object.fromEntries(Object.keys(CONSENT).map((k) => [k, D(p.revogado && p.revogado[k])]).filter((x) => x[1])),
      criado: D(p.criado) || todayISO(), atualizado: D(p.atualizado), hist: Object.fromEntries(ETAPAS.map((e) => [e, D(p.hist && p.hist[e])]).filter((x) => x[1])),
      ativ: Array.isArray(p.ativ) ? p.ativ.slice(-50).map((x) => ({ d: D(x && x.d), t: S(x && x.t, 60), r: S(x && x.r, 80) })) : []
    })),
    [COL_KEY]: (a) => a.slice(0, 1000).map((c) => ({ id: S(c.id, 40).replace(/[^a-z0-9]/gi, '') || uid(), nome: S(c.nome, 120), prof: S(c.prof, 120), reg: S(c.reg, 60), canal: S(c.canal, 80), end: S(c.end, 200), etapa: ETAPAS_COLEGA.includes(COLEGA_MIGRA[c.etapa] || c.etapa) ? (COLEGA_MIGRA[c.etapa] || c.etapa) : 'Mapeado', prox: D(c.prox), enviadas: N(c.enviadas), contra: D(c.contra), criado: D(c.criado) })),
    [CAMP_KEY]: (a) => a.slice(0, 500).map((c) => ({ id: S(c.id, 40).replace(/[^a-z0-9]/gi, '') || uid(), nome: S(c.nome, 80), tipo: c.tipo === 'Impulsionamento' ? 'Impulsionamento' : 'Campanha', plat: S(c.plat, 40), ini: D(c.ini), fim: D(c.fim), obj: S(c.obj, 200), inv: S(String(c.inv || ''), 20), criativos: S(c.criativos, 200) })),
    [CONT_KEY]: (a) => a.slice(0, 2000).map((c) => ({ id: S(c.id, 40).replace(/[^a-z0-9]/gi, '') || uid(), data: D(c.data) || todayISO(), canal: S(c.canal, 40), formato: S(c.formato, 40), balde: S(c.balde, 80), gancho: S(c.gancho, 200), kw: S(c.kw, 120), quadro: S(c.quadro, 80), variavel: S(c.variavel, 40), ret: c.ret === '' || c.ret == null ? '' : Math.min(100, N(c.ret)), boost: c.boost === true, alcance: N(c.alcance), envios: N(c.envios), salv: N(c.salv), msgs: N(c.msgs) }))
  };
  document.getElementById('bk-file').addEventListener('change', (e) => {
    const input = e.target;
    const f = input.files && input.files[0];
    const status = document.getElementById('bk-status');
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { status.textContent = 'Arquivo grande demais para ser um backup do CliniLoop.'; input.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => {
      let pack = null;
      try { pack = JSON.parse(reader.result); } catch (err) { pack = null; }
      if (!pack || pack.app !== APP_ID || !pack.dados || typeof pack.dados !== 'object') { status.textContent = 'Este arquivo não é um backup válido do CliniLoop.'; input.value = ''; return; }
      const entradas = [];
      Object.entries(pack.dados).forEach(([k, v]) => {
        if (!/^cliniloop\.[a-z0-9.\-]+$/i.test(k) || k === KEY_STORE || typeof v !== 'string' || v.length > 4000000) return;
        let parsed;
        try { parsed = JSON.parse(v); } catch (err) { return; }
        if (SANITIZE[k]) { if (!Array.isArray(parsed)) return; entradas.push([k, JSON.stringify(SANITIZE[k](parsed.filter((x) => x && typeof x === 'object')))]); return; }
        entradas.push([k, v]);
      });
      if (!entradas.length) { status.textContent = 'O backup está vazio ou não tem dados reconhecidos.'; input.value = ''; return; }
      const quando = pack.criadoEm ? fmtDate(String(pack.criadoEm).slice(0, 10)) : 'data desconhecida';
      if (!confirm(`Restaurar o backup de ${quando}? Os dados atuais deste navegador serão substituídos (a chave da API, se houver, é mantida).`)) { input.value = ''; return; }
      appKeys(false).forEach((k) => storeDel(k));
      let ok = true;
      entradas.forEach(([k, v]) => { try { window.localStorage.setItem(k, v); } catch (err) { ok = false; } });
      if (!ok) { status.textContent = 'Não foi possível gravar todos os dados neste navegador.'; return; }
      window.location.reload();
    };
    reader.onerror = () => { status.textContent = 'Não foi possível ler o arquivo.'; };
    reader.readAsText(f);
  });
  document.getElementById('cfg-clear').addEventListener('click', () => {
    if (!confirm('Apagar perfil do consultório, rastreador de pacientes, colegas, campanhas, conteúdos, decisões guardadas e a chave da API deste navegador? Se quiser guardar uma cópia, faça um backup antes. Isso não pode ser desfeito.')) return;
    appKeys(true).forEach((k) => storeDel(k));
    window.location.reload();
  });

  // ===================== Ícones dos botões =====================
  (function icons() {
    const set = (sel, ico) => document.querySelectorAll(sel).forEach((el) => { if (!el.dataset.ico) el.dataset.ico = ico; });
    set('form.tool-form[data-tool] button[type="submit"]', 'spark');
    set('#kit-copy', 'copy');
    set('#kit-download', 'download');
    set('a.btn[target="_blank"]', 'ext');
    set('#cfg-clear', 'trash');
    set('#tracker-form button[type="submit"]', 'plus');
    document.querySelectorAll('.btn[data-ico]').forEach((el) => el.childNodes.forEach((nd) => { if (nd.nodeType === 3) nd.textContent = nd.textContent.replace(/\s*↗\s*$/, ''); }));
  })();

  // ===================== Inicialização =====================
  (function init() {
    if (REPO_URL) {
      ['nav-github', 'foot-github'].forEach((id) => { const a = document.getElementById(id); a.href = REPO_URL; a.hidden = false; });
      document.getElementById('foot-license').hidden = true;
    }
    const saved = storeGet(STORE_KEY, null);
    if (saved && typeof saved === 'object') applyConfig(saved);
    cfg = readConfig();
    configEl.addEventListener('input', onConfigChange);
    configEl.addEventListener('change', onConfigChange);
    const ultimo = storeGet(BACKUP_KEY, '');
    document.getElementById('bk-status').textContent = ultimo ? `Último backup em ${fmtDate(ultimo)}.` : 'Nenhum backup feito ainda.';
    updatePlanUI();
    prefillFields(false);
    renderCouncil();
    renderBench();
    renderObjHint();
    renderOrigemOptions();
    renderTracker();
    renderColegas();
    renderCampanhas();
    renderConteudos();
    renderPainel();
    renderFunnel();
    if (onbComplete()) configEl.classList.add('collapsed');
    renderHoje();
    document.addEventListener('cliniloop:dados', () => { renderHoje(); renderFunnel(); renderPainel(); renderCampanhas(); renderColegas(); renderTracker(); });
  })();
