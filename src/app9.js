
  // ===================== O caminho: a jornada do herói em nove passos =====================
  // Três atos (a partida, as provas, o retorno), nove passos. Cada passo segue o mesmo padrão:
  // o que você leva daqui, o que já foi aproveitado, a ação, a entrega mínima e o próximo passo.
  // Estados visíveis: em andamento, pronto, precisa revisar. Gerar um prompt é atividade, não entrega.
  // var (e não const): renderCaminho pode ser chamada pela inicialização antes deste trecho rodar.
  var camOk = false;
  const CAM_KEY = PREFIX + 'caminho.v1';
  const PASSOS = [
    { n: 1, titulo: 'Seu consultório e objetivo' },
    { n: 2, titulo: 'Seu paciente ideal' },
    { n: 3, titulo: 'Oceano Azul: sua proposta de valor' },
    { n: 4, titulo: 'Seus perfis, uma rede por vez' },
    { n: 5, titulo: 'Plano de conteúdo e roteiros' },
    { n: 6, titulo: 'Colegas e campanhas' },
    { n: 7, titulo: 'WhatsApp e atendimento' },
    { n: 8, titulo: 'Contatos: o rastreador' },
    { n: 9, titulo: 'Ritual da semana' }
  ];
  // Onde mora cada ferramenta do caminho. As demais ficam na biblioteca de ferramentas.
  const TOOL_PASSO = { config: 1, publico: 2, oceano: 3, perfil: 4, pautas: 5, roteiro: 5, colegas: 6, campanha: 6, atendimento: 7, rastreador: 8, assistente: 9, painel: 9 };
  // O contexto essencial: sem ele, os passos seguintes não funcionam. O resto é aprofundamento.
  const OBRIG = {
    1: [['prof', 'profissional', 'o tipo de profissional'], ['cfg-registro', 'registro', 'o registro no conselho'], ['cfg-espec', 'especialidade', 'a especialidade'],
      ['cfg-cidade', 'cidade', 'cidade e bairro'], ['cfg-servicos', 'servicos', 'os serviços que quer divulgar'], ['cfg-meta', 'metaFrase', 'o resultado que você quer em 90 dias']],
    2: [['cfg-publico', 'publico', 'quem é o seu paciente ideal'], ['cfg-icp-dor', 'icpDor', 'a principal dor ou dúvida dele']],
    3: [['cfg-transf', 'transformacao', 'a sua proposta de valor em uma frase (pode ser uma hipótese)']]
  };

  function camSt() {
    const s = storeGet(CAM_KEY, null) || {};
    let avanco = Number(s.avanco) || 0;
    // Migração: quem concluía passos na versão anterior continua de onde estava.
    if (!avanco && s.feitos && typeof s.feitos === 'object') { const ns = Object.keys(s.feitos).map(Number).filter(Boolean); if (ns.length) avanco = Math.min(9, Math.max(...ns) + 1); }
    return { avanco: avanco || 1, aberto: s.aberto === undefined ? null : s.aberto, ritual: (s.ritual && typeof s.ritual === 'object') ? s.ritual : {}, oaEtapa: Number(s.oaEtapa) || 1, feitos: s.feitos || {} };
  }
  function camSet(s) { return storeSet(CAM_KEY, s); }
  function faltandoPasso(n) {
    return (OBRIG[n] || []).filter((x) => !String(cfg[x[1]] || '').trim()).map((x) => ({ id: x[0], txt: x[2] }));
  }
  const usoDe = () => storeGet(USO_KEY, {}) || {};
  const REDES_IDS = ['google', 'instagram', 'linkedin', 'youtube', 'tiktok'];
  function checklistCompleto(id) {
    const st = storeGet(CANAIS_KEY, {}) || {};
    const c = CANAIS_CHECK.find((x) => x[0] === id);
    return !!c && c[3].every((_, i) => st[`${id}-${i}`]);
  }
  const aberto8 = (p) => p.etapa !== 'Encerrado';

  // Entrega mínima de cada passo. [texto, feito, opcional]. O passo só fica pronto quando o que não é opcional existe.
  function entregas(n) {
    const r = resultados(); const u = usoDe();
    switch (n) {
      case 1: return [['Profissão e registro no conselho', !!(cfg.profissional && cfg.registro)], ['Especialidade, cidade e serviços', !!(cfg.especialidade && cfg.cidade && cfg.servicos)], ['O resultado que você quer em 90 dias', !!cfg.metaFrase], ['Formação e diferenciais (aprofundar)', !!cfg.sobre, true]];
      case 2: return [['Quem é o seu paciente ideal', !!cfg.publico], ['A principal dor ou dúvida dele', !!cfg.icpDor], ['ICP e persona revisados e aprovados (aprofundar)', !!r.publico, true]];
      case 3: {
        const e = estrategia();
        return [['Em que a sua área compete: 4 fatores ou mais (etapa 1)', e.fatores.length >= 4], ['O que os pacientes dizem: evidência (etapa 2)', e.temEvidencia], ['Quem ainda não procura ninguém (etapa 3)', e.naoClientes.length > 0, true],
          ['As quatro ações, com algo a elevar ou criar (etapa 4)', e.elevar.length + e.criar.length > 0], ['Se cada item já acontece no atendimento (etapa 6)', (e.elevar.length + e.criar.length) > 0 && !e.incerto.length],
          ['A proposta em uma frase', !!e.proposta], ['A proposta aprovada por você', e.status === 'aprovada']];
      }
      case 4: return [['O prompt de pelo menos uma rede preparado', REDES_IDS.some((id) => u['rede-' + id]) || !!u.perfil], ['Textos dos perfis revisados e aprovados', !!r.perfil], ['Checklist completo de pelo menos uma rede', REDES_IDS.some(checklistCompleto)]];
      case 5: return [['Temas de conteúdo definidos', !!cfg.baldes], ['Pautas e calendário revisados e aprovados', !!r.pautas], ['A primeira peça publicada e registrada no Diário', conteudos.length > 0]];
      case 6: return [['Pelo menos 3 colegas mapeados', colegas.length >= 3], ['Carta de apresentação enviada a pelo menos um colega', colegas.some((c) => c.etapa && c.etapa !== 'Mapeado')], ['A primeira campanha registrada (quando fizer sentido)', campanhas.length > 0, true]];
      case 7: { const j = waSt(); const f = WA_ITENS.filter(([id]) => j[id] || (id === 'wa6' && pacientes.length)).length;
        return [['WhatsApp do consultório informado', String(cfg.whatsapp || '').replace(/\D/g, '').length >= 10], [`Pelo menos 5 dos 7 itens do WhatsApp prontos (${f} de 7)`, f >= 5], ['Respostas do atendimento revisadas e aprovadas', !!r.atendimento]]; }
      case 8: { const ab = pacientes.filter(aberto8);
        return [['Pelo menos um contato registrado', pacientes.length > 0], ['Todo contato em aberto com a origem informada (ou "não sei")', pacientes.length > 0 && ab.every((p) => String(p.origem || '').trim())], ['Todo contato em aberto com próximo passo e data', pacientes.length > 0 && !pacientes.filter(FILAS.sem[1]).length]]; }
      case 9: { const st = camSt(); return [['Agenda da semana preparada no Assistente', (u.assistente || '') >= mondayISO()], ['Ritual desta semana marcado como feito', !!st.ritual[mondayISO()]]]; }
    }
    return [];
  }
  // Motivo para revisar um passo que já estava pronto (ou em andamento).
  function revisarPasso(n) {
    const rev = entregasRevisar();
    if (n === 3 && estrategia().status === 'revisar') return 'Você mudou a proposta ou as quatro ações depois de aprovar. Revise e aprove de novo.';
    if (n === 4 && rev.indexOf('perfil') >= 0) return 'A estratégia mudou depois dos textos aprovados dos perfis.';
    if (n === 5 && rev.indexOf('pautas') >= 0) return 'A estratégia mudou depois das pautas aprovadas.';
    if (n === 7 && rev.indexOf('atendimento') >= 0) return 'A estratégia mudou depois das respostas aprovadas do atendimento.';
    if (n === 8) { const v = pacientes.filter(FILAS.vencidos[1]).length; if (v) return `${v} próximo(s) passo(s) vencido(s) no Rastreador.`; }
    return '';
  }
  function comecou(n) {
    if (n === 3) { const o = storeGet('cliniloop.oceano.v1', {}) || {}; return !!((o.fatores || []).length || o.eliminar || o.reduzir || o.elevar || o.criar || o.avaliacoes || o.pacientes || cfg.transformacao); }
    if (n === 4) return REDES_IDS.some((id) => { const f = redeForm(id); return f && !!textoRede(id); });
    return false;
  }
  function estadoPasso(n, st) {
    const it = entregas(n);
    const req = it.filter((x) => !x[2]);
    if (n === 9) return req.every((x) => x[1]) ? 'semana-ok' : 'semana-pend';
    const pronto = req.every((x) => x[1]);
    const motivo = revisarPasso(n);
    if (motivo && (pronto || n === 3 || n === 8)) return 'revisar';
    if (pronto) return 'pronto';
    if (it.some((x) => x[1]) || comecou(n)) return 'andamento';
    return 'novo';
  }
  const ESTADO_ROT = { novo: '', andamento: 'Em andamento', pronto: 'Pronto', revisar: 'Precisa revisar', 'semana-ok': 'Feito nesta semana', 'semana-pend': 'Pendente nesta semana' };
  function passoFeito(n, st) { return estadoPasso(n, st) === 'pronto'; }
  // Próximo passo: o primeiro não pronto a partir de onde a pessoa chegou. O que ficou para trás aparece como pendência.
  function proximoPasso(st) {
    st = st || camSt();
    for (let n = Math.min(st.avanco, 9); n <= 8; n++) if (estadoPasso(n, st) !== 'pronto') return n;
    return 9;
  }
  function pendentesAntes(st) {
    st = st || camSt();
    const L = [];
    for (let n = 1; n < Math.min(st.avanco, 9); n++) { const e = estadoPasso(n, st); if (e !== 'pronto') L.push(n); }
    return L;
  }

  // Resumo de uma linha no cabeçalho do passo.
  function resumoPasso(n) {
    const t = (s, k) => trim(s, k || 90);
    const r = resultados();
    switch (n) {
      case 1: return [profInfo() ? profInfo().label : '', cfg.especialidade, cfg.cidade].filter(Boolean).join(' · ') + (cfg.metaFrase ? ' — ' + t(cfg.metaFrase, 70) : '');
      case 2: return cfg.publico ? t(cfg.publico, 60) + (cfg.icpDor ? ' · dúvida: ' + t(cfg.icpDor, 50) : '') : '';
      case 3: { const e = estrategia(); return e.proposta ? `${EST_ROTULO[e.status]}${e.temEvidencia ? '' : ', sem evidência'}: "${t(e.proposta, 100)}"` : ''; }
      case 4: { const u = (cfg.canais || []).filter((c) => REDE_IDS[c]); return u.length ? u.map((c) => REDE_NOME[REDE_IDS[c]]).join(', ') + (r.perfil ? ' · textos aprovados' : '') : ''; }
      case 5: return [cfg.baldes ? 'Temas: ' + t(cfg.baldes, 60) : '', conteudos.length ? conteudos.length + (conteudos.length === 1 ? ' conteúdo registrado' : ' conteúdos registrados') : ''].filter(Boolean).join(' · ');
      case 6: return [colegas.length ? colegas.length + (colegas.length === 1 ? ' colega' : ' colegas') : '', campanhas.length ? campanhas.length + (campanhas.length === 1 ? ' campanha' : ' campanhas') : ''].filter(Boolean).join(' · ');
      case 7: { const j = waSt(); const f = WA_ITENS.filter(([id]) => j[id] || (id === 'wa6' && pacientes.length)).length; return f ? `${f} de ${WA_ITENS.length} itens do WhatsApp prontos` : ''; }
      case 8: { const ab = pacientes.filter(aberto8).length; return pacientes.length ? `${pacientes.length} ${pacientes.length === 1 ? 'contato' : 'contatos'} · ${ab} em aberto` : ''; }
      case 9: { const st = camSt(); const d = st.ritual[mondayISO()]; return d ? `Ritual desta semana feito em ${fmtDate(d)}` : `Semana de ${fmtShort(mondayISO())}: ritual pendente`; }
    }
    return '';
  }

  // O que você leva do passo e o que o app já aproveitou de antes.
  const TAREFA_SAI = {
    1: 'o seu consultório e o objetivo dos 90 dias, que entram em todos os prompts.',
    2: 'o paciente ideal e a dúvida principal dele, de onde saem ganchos, pautas e respostas.',
    3: 'uma proposta de valor própria, com o que ainda é hipótese marcado como hipótese.',
    4: 'a bio e os textos de cada rede revisados, mostrando a sua diferença.',
    5: 'pautas das dúvidas reais e o roteiro da primeira peça, com a sua diferença dentro.',
    6: 'colegas mapeados, a primeira carta enviada e, quando fizer sentido, a primeira campanha.',
    7: 'o WhatsApp pronto para receber, com respostas que sustentam o que você anuncia.',
    8: 'cada contato com origem, próximo passo e data, sem dado clínico.',
    9: 'o placar da semana, o gargalo da vez e a agenda da próxima semana.'
  };
  function renderTarefa(n) {
    const box = document.querySelector(`.tarefa[data-tarefa="${n}"]`);
    if (!box) return;
    const e = estrategia();
    const chip = (rot, v) => (v ? `<li><b>${escapeHtml(rot)}:</b> ${escapeHtml(trim(v, 70))}</li>` : '');
    const prop = e.proposta ? `${EST_ROTULO[e.status].toLowerCase()} · “${e.proposta}”` : '';
    const acoes = [...e.elevar, ...e.criar].slice(0, 3).join('; ');
    const usa = {
      1: [],
      2: [['Profissão', profInfo() ? profInfo().label + (cfg.especialidade ? ', ' + cfg.especialidade : '') : ''], ['Cidade', cfg.cidade]],
      3: [['Paciente ideal', cfg.publico], ['A dúvida dele', cfg.icpDor], ['Serviços', cfg.servicos]],
      4: [['Proposta', prop], ['Elevar e criar', acoes], ['Registro', cfg.registro], ['Cidade', cfg.cidade]],
      5: [['Proposta', prop], ['Paciente e dúvida', [cfg.publico, cfg.icpDor].filter(Boolean).join(' · ')], ['Temas', cfg.baldes]],
      6: [['Proposta', prop], ['Especialidade', cfg.especialidade], ['Serviços', cfg.servicos]],
      7: [['Proposta', prop], ['Elevar e criar', acoes], ['Serviços', cfg.servicos]],
      8: [['Serviços', cfg.servicos], ['Origens', 'as suas redes e campanhas registradas']],
      9: [['Contatos', pacientes.length ? pacientes.length + ' registrados' : ''], ['Conteúdos', conteudos.length ? conteudos.length + ' no Diário' : ''], ['Colegas', colegas.length ? colegas.length + ' na rede' : '']]
    }[n].map(([a, b]) => chip(a, b)).join('');
    box.innerHTML = `<p class="tarefa-sai"><b>Você sai daqui com</b> ${escapeHtml(TAREFA_SAI[n])}</p>${n === 1 ? '<p class="tarefa-ja">Primeiro passo: preencha uma vez e nada mais precisa ser repetido.</p>' : (usa ? `<div class="tarefa-ja"><p>Já aproveitado, sem você repetir:</p><ul>${usa}</ul></div>` : '<p class="tarefa-ja">Ainda não há nada dos passos anteriores para aproveitar aqui.</p>')}`;
  }
  // A entrega mínima, com o estado do passo.
  function renderEntrega(n) {
    const el = passoEl(n); const box = el.querySelector('.entrega');
    const est = estadoPasso(n); const motivo = revisarPasso(n);
    const it = entregas(n);
    box.className = 'entrega est-' + est;
    box.innerHTML = `<p class="entrega-t"><b>${n === 9 ? `Ritual da semana de ${fmtShort(mondayISO())}` : 'Entrega mínima deste passo'}</b>${ESTADO_ROT[est] ? ` <span class="estado ${est}">${ESTADO_ROT[est]}</span>` : ''}</p>
      ${motivo ? `<p class="entrega-rev">${escapeHtml(motivo)}</p>` : ''}
      <ul>${it.map(([t, ok, opc]) => `<li class="${ok ? 'ok' : ''}${opc ? ' opc' : ''}"><span class="ck" aria-hidden="true">${ok ? '✓' : '○'}</span><span>${escapeHtml(t)}${ok ? '<span class="visually-hidden"> (feito)</span>' : '<span class="visually-hidden"> (pendente)</span>'}</span></li>`).join('')}</ul>
      ${n === 3 ? '<p class="jor-sub">A proposta pode seguir como hipótese. O que ainda não foi validado continua marcado aqui e nos prompts, até você ouvir os pacientes e aprovar.</p>' : ''}
      ${n === 9 ? '<p class="jor-sub">Este passo não termina: toda semana ele volta como pendente.</p>' : ''}`;
  }

  // --- Abrir e fechar passos (um aberto por vez) ---
  function passoEl(n) { return document.getElementById('passo-' + n); }
  function abrirPasso(n, opts) {
    opts = opts || {};
    PASSOS.forEach((p) => {
      const el = passoEl(p.n); const corpo = el.querySelector('.passo-corpo'); const bt = el.querySelector('.passo-toggle');
      const on = p.n === n;
      corpo.hidden = !on; bt.setAttribute('aria-expanded', on ? 'true' : 'false'); el.classList.toggle('aberto', on);
    });
    const st = camSt(); st.aberto = n; camSet(st);
    renderPasso(n);
    if (opts.scroll !== false && n) {
      const el = passoEl(n);
      if (opts.alvo) { const a = opts.alvo; setTimeout(() => a.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); }
      else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (opts.foco) setTimeout(() => passoEl(n).querySelector('.passo-toggle').focus({ preventScroll: true }), 40);
  }
  function fecharPassos() {
    PASSOS.forEach((p) => { const el = passoEl(p.n); el.querySelector('.passo-corpo').hidden = true; el.querySelector('.passo-toggle').setAttribute('aria-expanded', 'false'); el.classList.remove('aberto'); });
    const st = camSt(); st.aberto = 0; camSet(st);
  }
  // Chamado por openTool: abre o passo onde a ferramenta mora e, se ela for um sub-bloco, abre e rola até ele.
  function abrirNoCaminho(id) {
    const n = TOOL_PASSO[id];
    if (!n) return false;
    const t = document.querySelector(`#passo-${n} .tool[data-id="${id}"]`);
    if (t) t.open = true;
    abrirPasso(n, { alvo: t && t.classList.contains('in-sub') ? t : null });
    return true;
  }
  function irAoCampoPasso(id) {
    const el = id === 'prof' ? document.querySelector('input[name="profissional"]') : document.getElementById(id);
    if (!el) return;
    const p = el.closest('.passo');
    if (p && p.querySelector('.passo-corpo').hidden) abrirPasso(Number(p.dataset.passo), { scroll: false });
    const det = el.closest('details'); if (det && !det.open) det.open = true;
    if (id === 'cfg-transf' && typeof oaIr === 'function') oaIr(7);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el.focus({ preventScroll: true }), 250);
  }

  // --- Seguir: avança sem chamar de pronto o que ainda não está ---
  function seguirPasso(n) {
    const falta = faltandoPasso(n);
    const el = passoEl(n);
    const box = el.querySelector('.passo-falta');
    el.querySelectorAll('[aria-invalid="true"]').forEach((x) => { x.classList.remove('invalid'); x.removeAttribute('aria-invalid'); x.removeAttribute('aria-describedby'); });
    if (falta.length) {
      box.id = box.id || `passo-${n}-falta`;
      box.innerHTML = `<b>Falta${falta.length > 1 ? 'm' : ''} ${falta.length} ${falta.length > 1 ? 'campos' : 'campo'} para seguir:</b> `;
      falta.forEach((f, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'linkish'; b.textContent = f.txt;
        b.addEventListener('click', () => irAoCampoPasso(f.id));
        if (i) box.appendChild(document.createTextNode(' · '));
        box.appendChild(b);
        const c = f.id === 'prof' ? document.querySelector('input[name="profissional"]') : document.getElementById(f.id);
        if (c) { c.classList.add('invalid'); c.setAttribute('aria-invalid', 'true'); c.setAttribute('aria-describedby', box.id); }
      });
      box.hidden = false;
      irAoCampoPasso(falta[0].id);
      return;
    }
    box.hidden = true;
    const st = camSt();
    if (n === 9) {
      st.ritual[mondayISO()] = todayISO();
      Object.keys(st.ritual).sort().slice(0, -26).forEach((k) => delete st.ritual[k]);
      if (!camSet(st)) { box.hidden = false; box.textContent = 'Não consegui gravar neste navegador. Tente de novo.'; return; }
      renderCaminho(); renderEntrega(9);
      return;
    }
    st.avanco = Math.max(st.avanco, n + 1);
    if (!camSet(st)) { box.hidden = false; box.textContent = 'Não consegui gravar o seu avanço neste navegador. O que você preencheu continua na tela.'; return; }
    renderCaminho();
    abrirPasso(proximoPasso(), { foco: true });
  }

  // --- Oceano Azul em etapas: uma de cada vez, com retomada ---
  const OA_ETAPAS = [
    [1, 'Em que todos competem', 'O mercado'], [2, 'O que os pacientes dizem', 'Evidência'], [3, 'Quem ainda não procura', 'Evidência'],
    [4, 'As quatro ações', 'Decisão'], [5, 'Sua curva de valor', 'Decisão'], [6, 'Fazer antes de mostrar', 'Viabilidade e prova'], [7, 'Sua proposta', 'Proposta']
  ];
  function oaFeita(k) {
    const e = estrategia();
    return [null, e.fatores.length >= 4, e.temEvidencia, e.naoClientes.length > 0, e.elevar.length + e.criar.length > 0, e.fatores.length >= 4 && (e.elevar.length + e.criar.length > 0), (e.elevar.length + e.criar.length) > 0 && !e.incerto.length, !!e.proposta][k];
  }
  function oaIr(k) {
    k = Math.max(1, Math.min(7, k));
    const st = camSt(); st.oaEtapa = k; camSet(st);
    renderOaEtapas();
  }
  function renderOaEtapas() {
    const form = document.getElementById('oa-form'); const p3 = passoEl(3);
    if (!form) return;
    const k = camSt().oaEtapa;
    const fs = [...form.querySelectorAll(':scope > fieldset.oa-step')];
    fs.forEach((f, i) => { f.hidden = i + 1 !== k; f.dataset.etapa = String(i + 1); });
    p3.classList.toggle('oa-e7', k === 7);
    let nav = document.getElementById('oa-nav');
    if (!nav) { nav = document.createElement('div'); nav.id = 'oa-nav'; nav.className = 'oa-nav'; form.parentNode.insertBefore(nav, form); }
    nav.innerHTML = `<p class="oa-nav-t" id="oa-nav-t">Etapa ${k} de 7 · ${escapeHtml(OA_ETAPAS[k - 1][1])} <span class="oa-tipo">${escapeHtml(OA_ETAPAS[k - 1][2])}</span></p>
      <ol class="oa-dots" aria-label="Etapas do Oceano Azul">${OA_ETAPAS.map(([i, t]) => `<li><button type="button" data-oa-etapa="${i}" class="${i === k ? 'on' : ''}${oaFeita(i) ? ' ok' : ''}" ${i === k ? 'aria-current="step"' : ''} aria-label="Etapa ${i}: ${escapeHtml(t)}${oaFeita(i) ? ' (preenchida)' : ''}">${oaFeita(i) ? '✓' : i}</button></li>`).join('')}</ol>`;
    let pe = document.getElementById('oa-pe');
    if (!pe) { pe = document.createElement('div'); pe.id = 'oa-pe'; pe.className = 'oa-pe'; form.after(pe); }
    const depois = k === 2 || k === 3;
    pe.innerHTML = `${k > 1 ? '<button type="button" class="btn btn-outline btn-sm" data-oa-etapa="' + (k - 1) + '">← Etapa anterior</button>' : ''}
      ${k < 7 ? `<button type="button" class="btn btn-teal btn-sm" data-oa-etapa="${k + 1}">${depois && !oaFeita(k) ? 'Fazer depois e seguir' : 'Próxima etapa'} →</button>` : ''}
      ${depois && !oaFeita(k) ? '<p class="oa-depois">Pode seguir sem esta etapa hoje. Ela fica marcada como pendente, e a proposta continua como hipótese até você ouvir os pacientes.</p>' : ''}`;
    // A curva de valor sem evidência é a percepção do profissional, não um fato.
    let hip = document.getElementById('oa-hip');
    const f5 = fs[4];
    if (f5 && !hip) { hip = document.createElement('p'); hip.id = 'oa-hip'; hip.className = 'oa-hip'; f5.querySelector('legend').after(hip); }
    if (hip) { const ev = estrategia().temEvidencia; hip.className = 'oa-hip' + (ev ? ' ok' : ''); hip.textContent = ev ? 'Você registrou o que os pacientes dizem na etapa 2: use isso para dar as notas, e não só a sua impressão.' : 'Sem a etapa 2, estas notas são a sua percepção: uma hipótese. Elas continuam úteis, mas marcadas como hipótese.'; }
  }
  // --- Redes do passo 4 ---
  const REDE_IDS = { 'Perfil da Empresa no Google': 'google', Instagram: 'instagram', LinkedIn: 'linkedin', YouTube: 'youtube', TikTok: 'tiktok' };
  const REDE_NOME = { google: 'Google', instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', tiktok: 'TikTok' };
  const REDE_PEDIDO = {
    google: 'Perfil da Empresa no Google: nome exatamente como na fachada, categoria principal e secundárias, serviços com descrição informativa, descrição de até 750 caracteres, fotos que faltam (nunca de pacientes), atributos, e como pedir avaliações de forma neutra a todos os pacientes e respondê-las sem confirmar que a pessoa é paciente.',
    instagram: 'Instagram: 3 opções de nome do perfil com nome + especialidade em palavras que o paciente pesquisa, 3 bios de até 150 caracteres em quatro linhas (quem ajudo, com o quê, onde atendo, registro), Destaques (Comece aqui, Como funciona a consulta, Convênios e valores quando permitido, Localização, Dúvidas, Equipe) com o que vai em cada um, até 3 posts para fixar e um destino único para o link, com mensagem pronta para o WhatsApp e origem rastreada.',
    linkedin: 'LinkedIn: 5 títulos de até 220 caracteres na fórmula [profissão e especialidade] | [área de atuação ou público] | [prova] | [onde atende], e um Sobre em quatro blocos (abertura, o que faço, provas, chamada para colegas que querem encaminhar), em primeira pessoa.',
    youtube: 'YouTube: nome igual ao do Instagram, descrição com proposta de valor, registro e link de agendamento, playlists por problema do paciente (não por formato) e roteiro do vídeo de apresentação fixado.',
    tiktok: 'TikTok: mesmos nome, foto, credenciais e proposta de valor do Instagram, conta empresarial e o cuidado de não responder dúvidas clínicas individuais nos comentários.'
  };
  // Um campo para cada parte do perfil, com o nome que a pessoa vê na tela da rede.
  const REDE_CAMPOS = {
    google: [['nome', 'Nome da ficha no Google Maps'], ['categoria', 'Categoria'], ['descricao', 'Descrição'], ['servicos', 'Serviços cadastrados'], ['avaliacoes', 'Nota e número de avaliações']],
    instagram: [['nome', 'Nome do perfil'], ['bio', 'Bio']],
    linkedin: [['titulo', 'Título'], ['sobre', 'Sobre']],
    youtube: [['nome', 'Nome do canal'], ['descricao', 'Descrição do canal']],
    tiktok: [['nome', 'Nome do perfil'], ['bio', 'Bio']]
  };
  const redeForm = (id) => document.querySelector(`form[data-tool="rede-${id}"]`);
  const getDe = (form) => (n) => { const el = form.querySelector(`[name="${n}"]`); return el ? (el.type === 'checkbox' ? (el.checked ? 'sim' : '') : String(el.value || '').trim()) : ''; };
  // Texto do perfil de hoje, campo a campo. Vazio quando a pessoa ainda não tem o perfil ou não colou nada.
  function textoRede(id, get) {
    get = get || getDe(redeForm(id));
    if (get('naoTenho')) return '';
    return REDE_CAMPOS[id].map(([c, rot]) => { const v = get('f_' + c); if (!v) return ''; return v.indexOf('\n') >= 0 ? `${rot}:\n"""\n${v}\n"""` : `${rot}: ${v}`; }).filter(Boolean).join('\n');
  }
  Object.keys(REDE_PEDIDO).forEach((id) => {
    promptBuilders['rede-' + id] = (get) => {
      const extra = id === 'instagram' ? `\nLink da bio hoje: ${get('link')}. Destaques e fixados: ${nv(get('destaques'))}${cfg.arroba ? `\nMeu @: ${cfg.arroba}` : ''}` : '';
      return `Você é consultor de marketing ético para profissionais de saúde no Brasil.

Quero revisar só um canal agora: ${REDE_NOME[id] === 'Google' ? 'o Perfil da Empresa no Google' : 'o ' + REDE_NOME[id]}.${extra}
Como está hoje:
${textoRede(id, get) || 'Ainda não tenho este perfil. Crie do zero.'}

Antes de postar ou anunciar, o paciente precisa encontrar, em qualquer canal, a mesma resposta para três perguntas: quem é você, quem você ajuda e como marcar uma consulta.${cfg.transformacao ? ` Use a minha proposta de valor como fio condutor: "${cfg.transformacao}".` : ''}

Entregue:
1. (a) O que impede um paciente ou colega de confiar, (b) o que impede de agendar ou encaminhar e (c) a correção sugerida.
2. Reescrita pronta para colar, com a identificação obrigatória do meu conselho e do tipo de conta (profissional ou clínica), sem slogan de resultado, superlativos ou títulos e números inventados.
   ${REDE_PEDIDO[id]}
3. Palavras-chave com serviço + cidade ou bairro para este canal, e onde usar cada uma.
4. Um checklist curto para eu marcar depois de aplicar.`;
    };
  });
  function arrumarRedes() {
    const uso = document.getElementById('redes-uso');
    const outras = document.getElementById('redes-outras');
    const lista = document.getElementById('redes-outras-lista');
    const marcadas = new Set(cfg.canais || []);
    const cards = [...document.querySelectorAll('details.rede')];
    let nOutras = 0;
    cards.forEach((c) => {
      const usa = marcadas.has(c.dataset.canal);
      const alvo = usa ? uso : lista;
      if (c.parentNode !== alvo) alvo.appendChild(c);
      if (!usa) nOutras++;
    });
    // mantém a ordem original dentro de cada lista
    ['google', 'instagram', 'linkedin', 'youtube', 'tiktok'].forEach((id) => { const c = document.querySelector(`details.rede[data-rede="${id}"]`); if (c) c.parentNode.appendChild(c); });
    outras.hidden = !nOutras;
    if (!uso.querySelector('details.rede')) { uso.innerHTML = '<p class="redes-vazio">Marque acima as redes que você já usa. As outras ficam logo abaixo, para criar do zero quando chegar a vez delas.</p>'; }
    else { const v = uso.querySelector('.redes-vazio'); if (v) v.remove(); }
    const st = storeGet(CANAIS_KEY, {}) || {};
    const usoT = usoDe();
    cards.forEach((c) => {
      const id = c.dataset.rede;
      const itens = (CANAIS_CHECK.find((x) => x[0] === id) || [, , , []])[3];
      const f = itens.filter((_, i) => st[`${id}-${i}`]).length;
      const gerou = !!(usoT['rede-' + id] || c.querySelector('.js-output') && c.querySelector('.js-output').value);
      const nao = c.querySelector('input[name="naoTenho"]').checked;
      c.querySelector('.rede-st').textContent = [nao ? 'ainda não tenho' : '', gerou ? 'prompt gerado' : '', itens.length ? `checklist ${f} de ${itens.length}` : ''].filter(Boolean).join(' · ');
      c.classList.toggle('ok', itens.length > 0 && f === itens.length);
    });
  }
  // A análise conjunta junta os textos colados em cada rede.
  document.querySelector('form.tool-form[data-tool="perfil"]').addEventListener('submit', () => {
    const partes = [...document.querySelectorAll('details.rede')].map((c) => {
      const v = textoRede(c.dataset.rede);
      return v ? `${REDE_NOME[c.dataset.rede].toUpperCase()}\n${v}` : '';
    }).filter(Boolean);
    document.getElementById('pf-atual').value = partes.length ? partes.join('\n\n') : 'Ainda não tenho textos nos perfis. Crie do zero.';
    document.getElementById('pf-link').value = document.getElementById('rd-instagram-link').value;
    document.getElementById('pf-destaques').value = document.getElementById('rd-instagram-destaques').value;
    const marcadas = new Set(cfg.canais || []);
    document.querySelectorAll('form[data-tool="perfil"] input[name="redes"]').forEach((cb) => { if (!cb.dataset.mexeu) cb.checked = marcadas.has(cb.value) || (!marcadas.size && (cb.value === 'Instagram' || cb.value === 'Perfil da Empresa no Google')); });
  }, true);
  document.querySelectorAll('form[data-tool="perfil"] input[name="redes"]').forEach((cb) => cb.addEventListener('change', () => { cb.dataset.mexeu = '1'; }));
  document.querySelectorAll('form.rede-form').forEach((f) => {
    const id = f.dataset.tool.slice(5);
    // Antes de gerar: ou a pessoa colou alguma parte do perfil, ou marcou que ainda não tem.
    f.addEventListener('submit', (e) => {
      if (textoRede(id) || getDe(f)('naoTenho')) { setTimeout(arrumarRedes, 50); return; }
      e.preventDefault(); e.stopImmediatePropagation();
      const msg = formMsg(f);
      msg.className = 'form-msg error';
      msg.textContent = `Cole pelo menos uma parte do seu ${REDE_NOME[id]} nos campos acima, ou marque "Ainda não tenho" no topo do cartão.`;
      const primeiro = f.querySelector('.rede-campos input, .rede-campos textarea');
      if (primeiro) { primeiro.classList.add('invalid'); primeiro.focus(); }
    }, true);
    // "Ainda não tenho": esconde os campos e o prompt cria o perfil do zero.
    const nao = f.querySelector('input[name="naoTenho"]');
    const aplicaNao = () => { f.querySelector('.rede-campos').hidden = nao.checked; f.querySelector('.rede-zero').hidden = !nao.checked; };
    const salvos = storeGet(PERSIST_KEY, {}) || {};
    nao.checked = salvos['rede-' + id + '-nao'] === 'sim';
    // Quem colou tudo numa caixa só, na versão anterior, encontra o texto no campo principal.
    const antigo = salvos['rede-' + id];
    const principal = f.querySelector('textarea[name^="f_"]');
    if (antigo && principal && !principal.value) principal.value = antigo;
    aplicaNao();
    nao.addEventListener('change', () => {
      const s2 = storeGet(PERSIST_KEY, {}) || {}; s2['rede-' + id + '-nao'] = nao.checked ? 'sim' : ''; storeSet(PERSIST_KEY, s2);
      aplicaNao(); arrumarRedes();
    });
  });

  // --- WhatsApp (passo 7): checklist e links com origem ---
  const WA_ITENS = [
    ['wa1', 'Instale o WhatsApp Business e preencha o perfil: nome, endereço, horário, descrição e catálogo de serviços.', null],
    ['wa2', 'Cadastre a mensagem de boas-vindas e a de fora do horário (já oferecendo dois horários).', 'atendimento'],
    ['wa3', 'Cadastre as respostas rápidas, geradas logo abaixo com o seu perfil.', 'atendimento'],
    ['wa4', 'Crie etiquetas com as sete etapas: Novo, Em conversa, Agendado, Avaliado, Plano proposto, Em tratamento, Encerrado.', null],
    ['wa5', 'Troque o link da bio e dos anúncios pelos links com origem, logo abaixo.', null],
    ['wa6', 'Cadastre o primeiro contato no Rastreador de pacientes (passo 8).', 'rastreador'],
    ['wa7', 'Marque na agenda o ritual semanal de 30 minutos, toda sexta (passo 9).', 'assistente']
  ];
  function waSt() { const j = storeGet(JOR_KEY, null); return (j && j.wa) || {}; }
  function waSet(id, v) { const j = storeGet(JOR_KEY, null) || {}; j.wa = j.wa || {}; j.wa[id] = v ? 1 : 0; storeSet(JOR_KEY, j); }
  function waLink(origem) {
    let n = String(cfg.whatsapp || '').replace(/\D/g, '');
    if (n.length < 10) return '';
    if (n.length <= 11) n = '55' + n;
    const serv = servicosList()[0] || 'o atendimento';
    return 'https://wa.me/' + n + '?text=' + encodeURIComponent(`Olá! Vim pelo ${origem} e gostaria de saber mais sobre ${serv}.`);
  }
  function renderWa() {
    const box = document.getElementById('wa-box');
    const j = waSt();
    const feito = (id) => !!j[id] || (id === 'wa6' && pacientes.length > 0);
    const items = WA_ITENS.map(([id, txt, tool]) => `<li class="${feito(id) ? 'ok' : ''}"><label><input type="checkbox" data-wa="${id}" ${feito(id) ? 'checked' : ''}> <span>${escapeHtml(txt)}</span></label>${tool && tool !== 'atendimento' ? `<button type="button" class="btn btn-outline btn-sm" data-abrir="${tool}">Ir ao passo ${TOOL_PASSO[tool]}</button>` : ''}</li>`).join('');
    const usa = new Set(cfg.canais || []);
    const origens = ['Instagram', 'Google', 'YouTube'].concat(usa.has('TikTok') ? ['TikTok'] : [], usa.has('LinkedIn') ? ['LinkedIn'] : [], ['anúncio da Meta', 'anúncio do Google'], usa.has('TikTok') ? ['anúncio do TikTok'] : [], ['indicação de colega', 'site']);
    const rotulo = (o) => o.charAt(0).toUpperCase() + o.slice(1);
    const links = waLink('Instagram')
      ? `<div class="jor-links">${origens.map((o) => `<div><b>${escapeHtml(rotulo(o))}</b><code>${escapeHtml(waLink(o))}</code><button type="button" class="btn btn-outline btn-sm" data-copiar="${escapeHtml(waLink(o))}">Copiar</button></div>`).join('')}</div>`
      : '<p class="jor-sub">Informe o WhatsApp do consultório logo acima para gerar os links com origem.</p>';
    const feitos = WA_ITENS.filter(([id]) => feito(id)).length;
    box.innerHTML = `<h4 class="passo-sub">Prepare o WhatsApp</h4><div class="meter jor-meter"><span style="width:${Math.round(feitos / WA_ITENS.length * 100)}%"></span></div><p class="jor-sub">${feitos} de ${WA_ITENS.length} prontos.</p>
      <ul class="jor-check">${items}</ul>
      <h4 class="passo-sub">Links do WhatsApp com origem</h4><p class="jor-sub">Use um link por lugar (bio, anúncio, site). A primeira mensagem já diz de onde a pessoa veio, e o Rastreador registra a origem.</p>${links}`;
  }


  // --- Placar do ritual (passo 9): o funil em números, com período e denominadores ---
  function renderPlacar() {
    const box = document.getElementById('placar-box');
    const hoje = todayISO(); const lim = addDays(hoje, -90);
    const co = pacientes.filter((p) => p.criado >= lim);
    const H = (k) => co.filter((p) => p.hist && p.hist[k]).length;
    const n = co.length, ag = H('Agendado'), av = H('Avaliado'), pl = H('Plano proposto'), ini = H('Em tratamento');
    const pct = (a, b) => (b ? `${Math.round(a / b * 100)}% (${a} de ${b})` : 'sem base para calcular');
    const periodo = `de ${fmtShort(lim)} a ${fmtShort(hoje)}`;
    if (!pacientes.length) {
      box.innerHTML = `<h4 class="passo-sub">O placar</h4><p class="placar-vazio">Ainda não há dados registrados para analisar. Isso não quer dizer falta de pacientes: quer dizer que ainda não há registros. Registre cada contato no <button type="button" class="linkish" data-abrir="rastreador">Rastreador (passo 8)</button>, com a origem, e o placar aparece aqui.</p>`;
      return;
    }
    const linhas = [['Contatos', n, `criados ${periodo}`], ['Agendaram', ag, pct(ag, n) + ' dos contatos'], ['Compareceram', av, pct(av, ag) + ' dos agendados'], ['Em tratamento', ini, pct(ini, pl) + ' dos planos']];
    const taxas = [];
    if (n >= 5) taxas.push(['agendamento', ag / n, 7, 'Responda em até 5 minutos, ofereça dois horários e faça as retomadas de 1, 3 e 7 dias.', ag, n]);
    if (ag >= 5) taxas.push(['comparecimento', av / ag, 8, 'Ative a confirmação 48 horas antes, o lembrete de 2 horas e agende o retorno antes de o paciente sair.', av, ag]);
    if (pl >= 5) taxas.push(['aceitação do plano', ini / pl, 7, 'Entregue o plano por escrito, com o objetivo do paciente, as fases e uma data para decidir, e acompanhe em 2, 7 e 15 dias.', ini, pl]);
    let ajuste;
    if (n < 5) ajuste = `<p><b>Poucos registros para analisar:</b> ${n} contato(s) ${periodo}. Com tão poucos, qualquer taxa engana: por enquanto, o placar só descreve. Com 5 contatos ou mais, ele compara as taxas.</p>`;
    else if (!taxas.length) ajuste = '<p>Ainda não há agendamentos ou planos suficientes (5 ou mais) para comparar as taxas. Continue registrando cada mudança de etapa.</p>';
    else {
      taxas.sort((a, b) => a[1] - b[1]);
      const g = taxas[0];
      ajuste = `<p><b>Gargalo provável: ${escapeHtml(g[0])}</b>, ${Math.round(g[1] * 100)}% (${g[4]} de ${g[5]}) ${periodo}. É a menor das taxas que já dá para medir${g[5] < 10 ? ', mas com menos de 10 na base: trate como pista' : ''}. ${escapeHtml(g[3])}</p><button type="button" class="btn btn-outline btn-sm" data-abrir="${g[2] === 8 ? 'rastreador' : 'atendimento'}">Ir ao passo ${g[2]}</button>`;
    }
    box.innerHTML = `<h4 class="passo-sub">O placar</h4><div class="placar">${linhas.map(([a, b, c], i) => `<div class="pl-c"><small>${a}</small><b>${b}</b><span>${c}</span></div>${i < linhas.length - 1 ? '<span class="pl-seta" aria-hidden="true">→</span>' : ''}`).join('')}</div>
      <div class="jor-ajuste">${ajuste}</div>
      <p class="jor-sub">Quando os números de algumas semanas mostrarem que a porta do preço continua trazendo mais gente que a da confiança, ou que os pacientes não reconhecem a diferença anunciada, revise a estratégia no <button type="button" class="linkish" data-abrir="oceano">passo 3</button>. Com poucos dados, não mude a estratégia: registre mais.</p>`;
  }

  // --- Desenho do caminho ---
  function renderPasso(n) {
    if (!n) return;
    renderTarefa(n); renderEntrega(n);
    if (n === 3) { renderOaEtapas(); renderAprovacao(); }
    if (n === 4) arrumarRedes();
    if (n === 7) renderWa();
    if (n === 9) renderPlacar();
  }
  function renderCaminho() {
    if (!camOk) return;
    const st = camSt();
    const prox = proximoPasso(st);
    let prontos = 0;
    const est = {};
    PASSOS.forEach((p) => {
      const el = passoEl(p.n);
      const e = estadoPasso(p.n, st); est[p.n] = e;
      if (e === 'pronto' && p.n <= 8) prontos++;
      ['pronto', 'andamento', 'revisar', 'semana-ok', 'semana-pend'].forEach((c) => el.classList.toggle(c, e === c));
      el.classList.toggle('feito', e === 'pronto' || e === 'semana-ok');
      el.classList.toggle('atual', p.n === prox);
      el.querySelector('.passo-n').textContent = (e === 'pronto' || e === 'semana-ok') ? '✓' : (e === 'revisar' ? '!' : String(p.n));
      el.querySelector('.passo-st').textContent = ESTADO_ROT[e] || (p.n === prox ? 'Agora' : '');
      const rs = el.querySelector('.passo-resumo');
      const resumo = e !== 'novo' || p.n === 9 ? resumoPasso(p.n) : '';
      rs.textContent = resumo || rs.dataset.vazio;
      const bt = el.querySelector('.js-passo-ok');
      if (p.n === 9) bt.textContent = st.ritual[mondayISO()] ? 'Ritual desta semana feito ✓' : 'Fiz o ritual desta semana';
      else if (p.n === 3) bt.textContent = estrategia().status === 'aprovada' ? 'Seguir para o passo 4' : 'Seguir com a hipótese para o passo 4';
      else if (p.n <= 2) bt.textContent = `Salvar e seguir para o passo ${p.n + 1}`;
      else bt.textContent = e === 'pronto' ? `Seguir para o passo ${p.n + 1}` : `Seguir para o passo ${p.n + 1} (o que falta fica pendente)`;
    });
    // Os três atos no topo
    document.querySelectorAll('#hero-movs li').forEach((li) => {
      const m = Number(li.dataset.mov); const ns = [m * 3 - 2, m * 3 - 1, m * 3];
      const f = ns.filter((n) => est[n] === 'pronto' || est[n] === 'semana-ok').length;
      li.classList.toggle('ok', f === 3); li.classList.toggle('cur', ns.indexOf(prox) >= 0);
      li.querySelector('.hm-st').textContent = `${f} de 3`;
    });
    const cta = document.getElementById('hero-cta');
    const nada = PASSOS.every((p) => est[p.n] === 'novo' || p.n === 9) && st.avanco === 1;
    if (nada) { cta.textContent = 'Construir minha diferenciação'; cta.dataset.passo = '1'; }
    else { cta.textContent = `Continuar: passo ${prox} · ${PASSOS[prox - 1].titulo}`; cta.dataset.passo = String(prox); }
    document.getElementById('hero-nota').hidden = !nada;
    // Painel Hoje
    const hoje = document.getElementById('hoje');
    hoje.hidden = est[1] !== 'pronto';
    const e = estrategia();
    document.getElementById('cm-prop').innerHTML = e.proposta ? `<span class="dif-badge ${e.status}">${EST_ROTULO[e.status]}</span>${e.temEvidencia ? '' : ' <span class="dif-badge hipotese">Sem evidência</span>'} “${escapeHtml(trim(e.proposta, 140))}”` : 'Ainda não definida. <button type="button" class="linkish" data-abrir="oceano">Construir no passo 3</button>';
    document.getElementById('cm-prog-t').textContent = `Seu caminho · ${prontos} de 8 passos prontos`;
    const mt = document.getElementById('cm-meter'); mt.setAttribute('aria-valuenow', String(prontos)); mt.setAttribute('aria-valuetext', `${prontos} de 8 passos prontos`);
    document.getElementById('cm-prog-bar').style.width = Math.round(prontos / 8 * 100) + '%';
    const onde = document.getElementById('cm-onde'); const acao = document.getElementById('cm-acao'); const cont = document.getElementById('cm-continuar');
    onde.textContent = prox === 9 && st.avanco > 8 ? 'Agora, toda semana' : `Próximo · passo ${prox} de 9`;
    acao.textContent = PASSOS[prox - 1].titulo; cont.dataset.passo = String(prox);
    const pend = pendentesAntes(st);
    document.getElementById('cm-pend').innerHTML = pend.length ? `<li class="hj-pend-t">Pendente em passos anteriores:</li>${pend.map((n) => `<li><button type="button" class="linkish" data-passo-abrir="${n}">Passo ${n} · ${escapeHtml(PASSOS[n - 1].titulo)}</button> <small>${ESTADO_ROT[est[n]] || 'não iniciado'}</small></li>`).join('')}` : '';
    document.getElementById('hj-ritual').textContent = st.ritual[mondayISO()] ? `Ritual desta semana feito em ${fmtDate(st.ritual[mondayISO()])}.` : `Ritual da semana de ${fmtShort(mondayISO())}: pendente.`;
    const rev = entregasRevisar();
    const rv = document.getElementById('hj-revisar');
    rv.hidden = !rev.length && e.status !== 'revisar';
    rv.innerHTML = `<p><b>A sua estratégia mudou.</b> Estas entregas foram aprovadas com a versão anterior e precisam de revisão (as versões antigas ficam guardadas):</p><ul>${e.status === 'revisar' ? '<li><button type="button" class="linkish" data-abrir="oceano">Proposta de valor: aprovar de novo (passo 3)</button></li>' : ''}${rev.map((id) => `<li><button type="button" class="linkish" data-abrir="${id}">${escapeHtml(EST_DEPENDENTES[id][0])}${EST_DEPENDENTES[id][1] ? ' (passo ' + EST_DEPENDENTES[id][1] + ')' : ''}</button></li>`).join('')}</ul>`;
    renderFaixasDif();
    // A versão aprovada de cada entrega mostra na hora se a estratégia mudou depois dela.
    document.querySelectorAll('.saved-slot').forEach((sl) => { if (sl.querySelector('textarea')) renderSavedSlot(sl); });
    if (st.aberto) renderPasso(st.aberto);
  }

  // --- Eventos ---
  document.querySelectorAll('.passo-toggle').forEach((bt) => bt.addEventListener('click', () => {
    const n = Number(bt.closest('.passo').dataset.passo);
    if (bt.getAttribute('aria-expanded') === 'true') fecharPassos(); else abrirPasso(n);
  }));
  document.querySelectorAll('.js-passo-ok').forEach((bt) => bt.addEventListener('click', () => seguirPasso(Number(bt.closest('.passo').dataset.passo))));
  const abrirPorPasso = (e) => { e.preventDefault(); abrirPasso(Number(e.currentTarget.dataset.passo || 1), { foco: true }); };
  document.getElementById('hero-cta').addEventListener('click', abrirPorPasso);
  document.getElementById('cm-continuar').addEventListener('click', abrirPorPasso);
  document.getElementById('usar-rascunho').addEventListener('click', () => {
    const r = document.getElementById('oa-proposta').value.trim();
    const f = document.getElementById('cfg-transf');
    if (!r) { document.getElementById('oa-proposta').focus(); return; }
    f.value = r.replace(/\s+/g, ' ');
    f.dispatchEvent(new Event('input', { bubbles: true }));
    f.focus();
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-abrir],[data-copiar],[data-oa-etapa],[data-passo-abrir]');
    if (a && a.dataset.abrir) { openTool(a.dataset.abrir); return; }
    if (a && a.dataset.copiar) { copyText(a.dataset.copiar, a); return; }
    if (a && a.dataset.oaEtapa) {
      const k = Number(a.dataset.oaEtapa);
      if (passoEl(3).querySelector('.passo-corpo').hidden) abrirPasso(3, { scroll: false });
      oaIr(k);
      const alvo = document.getElementById('oa-nav');
      if (alvo) { alvo.scrollIntoView({ behavior: 'smooth', block: 'start' }); const t = document.getElementById('oa-nav-t'); t.tabIndex = -1; t.focus({ preventScroll: true }); }
      return;
    }
    if (a && a.dataset.passoAbrir) { abrirPasso(Number(a.dataset.passoAbrir), { foco: true }); return; }
    // Links internos para algo dentro de um passo fechado: abre o passo antes de rolar.
    const l = e.target.closest('a[href^="#"]');
    if (!l) return;
    const id = l.getAttribute('href').slice(1);
    const alvo = id && document.getElementById(id);
    const mais = l.closest('.nav-mais'); if (mais) mais.open = false;
    if (id === 'hoje' && alvo && alvo.hidden) { e.preventDefault(); abrirPasso(proximoPasso(), { foco: true }); return; }
    if (!alvo) return;
    const p = alvo.closest('.passo');
    if (p && !alvo.classList.contains('passo')) {
      e.preventDefault();
      if (alvo.matches('details')) alvo.open = true;
      abrirPasso(Number(p.dataset.passo), { alvo });
    } else if (alvo.matches('details.tool, details.settings')) { e.preventDefault(); alvo.open = true; alvo.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (alvo.classList.contains('passo')) { e.preventDefault(); abrirPasso(Number(alvo.dataset.passo), { foco: true }); }
  });
  document.addEventListener('change', (e) => {
    const w = e.target.closest && e.target.closest('[data-wa]');
    if (w) { waSet(w.dataset.wa, w.checked); renderWa(); renderCaminho(); return; }
    if (e.target.name === 'canais') arrumarRedes();
  });
  // Campos do perfil e do Oceano Azul mudam resumos, estados e as faixas de diferença.
  let camTimer = null;
  document.addEventListener('input', (e) => {
    if (e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true') { e.target.removeAttribute('aria-invalid'); e.target.classList.remove('invalid'); }
    if (!(e.target.closest && (e.target.closest('.cfg-campos') || e.target.closest('#oa-form') || e.target.closest('.rede-form')))) return;
    clearTimeout(camTimer); camTimer = setTimeout(() => { renderCaminho(); if (e.target.id === 'cfg-whatsapp') renderWa(); }, 350);
  });
  document.addEventListener('cliniloop:dados', () => renderCaminho());

  // --- Início: abre o passo em que a pessoa parou (ou o próximo que falta) ---
  // Nas ferramentas que são o próprio passo, a explicação longa vai para "Entender este passo" e a faixa do guia, para o fim.
  function moverExplicacoes() {
    // Na etapa 7 do Oceano Azul, a frase final e a aprovação ficam logo depois do rascunho; a análise da IA vem depois, opcional.
    const oa = document.getElementById('oa-form');
    const f7 = oa && oa.querySelectorAll(':scope > fieldset.oa-step')[6];
    const pf = document.querySelector('#passo-3 .proposta-final'); const ap = document.getElementById('est-aprovacao');
    if (f7 && pf && ap) { f7.after(pf); pf.after(ap); }
    const bt = oa && oa.querySelector(':scope > .form-actions button[type="submit"]');
    if (bt) { bt.textContent = 'Pedir a análise da IA (opcional)'; const n = document.createElement('p'); n.className = 'oa-ia-nota'; n.textContent = 'A IA confere a sua estratégia, diz se ela é um espaço novo ou uma diferenciação dentro do mercado que já existe, aponta riscos e monta um plano de 12 semanas. Ela não valida a estratégia por você.'; bt.parentNode.before(n); }
    document.querySelectorAll('.passo .tool.in-solo > .tool-body').forEach((body) => {
      const ent = body.closest('.passo').querySelector('.entender-corpo');
      if (!ent) return;
      const d = body.querySelector(':scope > p.desc'); if (d) ent.insertBefore(d, ent.querySelector('.entender-guia'));
      const g = body.querySelector(':scope > .livro-strip'); if (g) body.appendChild(g);
    });
  }
  (function initCaminho() {
    camOk = true;
    moverExplicacoes();
    const st = camSt();
    renderCaminho();
    const n = st.aberto === 0 ? 0 : (st.aberto || proximoPasso(st));
    if (n) abrirPasso(n, { scroll: false });
    if (location.hash && location.hash.length > 1) {
      const alvo = document.getElementById(location.hash.slice(1));
      const p = alvo && alvo.closest('.passo');
      if (p) abrirPasso(Number(p.dataset.passo), { alvo: alvo.classList.contains('passo') ? null : alvo });
    }
    notifyData();
  })();
