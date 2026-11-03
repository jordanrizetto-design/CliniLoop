
  // ===================== Os três módulos: Guia, Redes e CRM =====================
  // Uma tela por vez: Hoje, Redes (passos 1 a 6), CRM (passos 7 a 9 e o quadro), Guia e Ferramentas.
  // Só "var" e funções no topo: abrirPasso chama mostrarVisao durante a inicialização do caminho, antes deste trecho.
  var VISAO_KEY = 'cliniloop.visao.v1';
  var RECEPCAO_KEY = 'cliniloop.recepcao.v1';
  var quadroOk = false;
  function visaoAtual() { const m = document.body.className.match(/\bv-([a-z]+)\b/); return m ? m[1] : 'hoje'; }
  function emRecepcao() { return document.body.classList.contains('modo-recepcao'); }
  function mostrarVisao(v, opts) {
    opts = opts || {};
    if (emRecepcao() && v !== 'crm' && v !== 'todas') v = 'crm';
    const antes = visaoAtual();
    document.body.className = document.body.className.replace(/\bv-[a-z]+\b/g, '').trim() + ' v-' + v;
    document.querySelectorAll('[data-visao-link]').forEach((a) => { if (a.dataset.visaoLink === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (v !== 'todas') { try { window.localStorage.setItem(VISAO_KEY, JSON.stringify(v)); } catch (e) { /* preferência, não dado */ } }
    if (v === 'crm' && typeof renderQuadro === 'function') renderQuadro();
    if (opts.rolar && antes !== v) window.scrollTo(0, 0);
  }
  // A visão de um elemento é a da seção marcada mais próxima.
  function visaoDe(el) { const s = el && el.closest && el.closest('[data-visao]'); return s ? s.dataset.visao : null; }
  function mostrarVisaoDe(el) { const v = visaoDe(el); if (v && v !== visaoAtual()) mostrarVisao(v); }

  // --- Menu e botões que trocam de módulo ---
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-visao-link],[data-ir-visao]');
    if (!a) return;
    e.preventDefault();
    const v = a.dataset.visaoLink || a.dataset.irVisao;
    mostrarVisao(v, { rolar: true });
    window.scrollTo(0, 0);
    const alvo = document.getElementById('v-' + v);
    if (alvo && v !== 'hoje') { alvo.tabIndex = -1; alvo.focus({ preventScroll: true }); }
  }, true);
  // Links internos (#rastreador, #etica, #livro...) mostram primeiro o módulo onde o destino mora.
  document.addEventListener('click', (e) => {
    const l = e.target.closest('a[href^="#"]');
    if (!l || l.hasAttribute('data-visao-link')) return;
    const alvo = document.getElementById(l.getAttribute('href').slice(1));
    if (alvo) mostrarVisaoDe(alvo);
  }, true);

  // --- Modo recepção: abre direto no CRM e recolhe o resto (não é controle de acesso) ---
  function aplicarRecepcao(on) {
    document.body.classList.toggle('modo-recepcao', on);
    document.getElementById('recepcao-sair').hidden = !on;
    document.getElementById('recepcao-ligar').textContent = on ? 'Modo recepção ligado' : 'Modo recepção';
    document.getElementById('recepcao-ligar').setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) mostrarVisao('crm', { rolar: true });
  }
  document.getElementById('recepcao-ligar').addEventListener('click', () => {
    const on = !emRecepcao();
    try { window.localStorage.setItem(RECEPCAO_KEY, JSON.stringify(on)); } catch (e) { /* preferência deste navegador */ }
    aplicarRecepcao(on);
  });
  document.getElementById('recepcao-sair').addEventListener('click', () => {
    try { window.localStorage.setItem(RECEPCAO_KEY, 'false'); } catch (e) { /* noop */ }
    aplicarRecepcao(false);
    mostrarVisao('hoje', { rolar: true });
  });

  // --- Situação de cada módulo (no topo do Hoje e no cabeçalho do módulo Redes) ---
  function renderModulos() {
    const prontos = [1, 2, 3, 4, 5, 6].filter((n) => estadoPasso(n) === 'pronto').length;
    const abertos = pacientes.filter((p) => p.etapa !== 'Encerrado').length;
    const venc = pacientes.filter(FILAS.vencidos[1]).length;
    const r = document.querySelector('#hero-mods [data-mod="redes"] .hm-st'); if (r) r.textContent = `${prontos} de 6`;
    const c = document.querySelector('#hero-mods [data-mod="crm"] .hm-st'); if (c) c.textContent = pacientes.length ? `${abertos} em aberto${venc ? ' · ' + venc + ' vencido(s)' : ''}` : 'sem contatos';
    const prox = proximoPasso();
    const rs = document.getElementById('redes-status');
    if (rs) rs.innerHTML = `<span><b>${prontos} de 6</b> passos prontos</span>${prox <= 6 ? `<button type="button" class="btn btn-gold btn-sm" data-passo-abrir="${prox}">Continuar: passo ${prox}</button>` : ''}`;
  }

  // ===================== Quadro de contatos (CRM) =====================
  let qFila = ''; let qEnc = false; let qEncerrar = ''; let qArrastado = '';
  function qStatus(p) {
    const h = todayISO();
    if (p.etapa === 'Encerrado') return '';
    if (p.data && p.data < h) return 'venc';
    if (p.data === h) return 'hoje';
    if (!String(p.passo || '').trim() || !p.data) return 'sem';
    return '';
  }
  const Q_ROT = { venc: 'Vencido', hoje: 'Para hoje', sem: 'Sem próximo passo' };
  function qCartao(p) {
    const i = ETAPAS.indexOf(p.etapa);
    const st = qStatus(p);
    const col = p.colega ? colegaPorId(p.colega) : null;
    const prev = ETAPAS[i - 1]; const next = ETAPAS[i + 1];
    const enc = qEncerrar === p.id;
    return `<article class="q-card${st ? ' q-' + st : ''}" draggable="true" data-id="${escapeHtml(p.id)}" aria-label="${escapeHtml(p.nome)}, ${escapeHtml(etapaLabel(p.etapa))}">
      <p class="q-nome"><b>${escapeHtml(p.nome)}</b>${st ? `<span class="q-tag">${Q_ROT[st]}</span>` : ''}</p>
      <p class="q-meta">${escapeHtml(p.origem || 'origem não informada')}${col ? ' (' + escapeHtml(col.nome) + ')' : ''}${p.servico ? ' · ' + escapeHtml(p.servico) : ''}</p>
      ${p.etapa === 'Encerrado' ? `<p class="q-passo">${escapeHtml(p.resultado || 'Encerrado')}${p.motivo ? ' · ' + escapeHtml(p.motivo) : ''}</p>` : `<p class="q-passo">${p.passo ? escapeHtml(trim(p.passo, 70)) : 'Sem próximo passo'}${p.data ? ' · ' + (p.data === todayISO() ? 'hoje' : fmtShort(p.data)) : ''}</p>`}
      ${enc ? `<div class="q-enc"><label>Resultado<select class="q-res">${RESULTADOS.map((x) => `<option>${x}</option>`).join('')}</select></label><label>Motivo (sem dado clínico)<input type="text" class="q-mot" maxlength="200" placeholder="Ex: escolheu outro horário"></label><div class="q-enc-bts"><button type="button" class="btn btn-teal btn-sm" data-q="confirmar">Encerrar</button><button type="button" class="linkish" data-q="cancelar">Cancelar</button></div></div>`
        : `<div class="q-mov">${prev ? `<button type="button" class="q-b" data-q="prev" aria-label="Voltar ${escapeHtml(p.nome)} para ${escapeHtml(etapaLabel(prev))}">←</button>` : '<span></span>'}
        <button type="button" class="linkish q-det" data-q="det">Detalhes</button>
        ${p.etapa !== 'Encerrado' ? `<button type="button" class="linkish q-det" data-q="encerrar">Encerrar</button>` : ''}
        ${next ? `<button type="button" class="q-b" data-q="next" aria-label="Mover ${escapeHtml(p.nome)} para ${escapeHtml(etapaLabel(next))}">→</button>` : '<span></span>'}</div>`}
    </article>`;
  }
  function renderQuadro() {
    const box = document.getElementById('quadro-cols');
    if (!quadroOk || !box || visaoAtual() !== 'crm') return;
    const busca = normTxt(document.getElementById('q-busca').value).trim();
    const passa = (p) => (!qFila || FILAS[qFila][1](p)) && (!busca || normTxt(p.nome + ' ' + (p.servico || '') + ' ' + (p.origem || '')).includes(busca));
    const nf = (k) => pacientes.filter(FILAS[k][1]).length;
    document.getElementById('q-filas').innerHTML = `<button type="button" class="fila${qFila ? '' : ' on'}" data-qf="" aria-pressed="${!qFila}">Todos</button>` + Object.keys(FILAS).map((k) => `<button type="button" class="fila${qFila === k ? ' on' : ''}${k === 'vencidos' && nf(k) ? ' late' : ''}" data-qf="${k}" aria-pressed="${qFila === k}">${FILAS[k][0]} <b>${nf(k)}</b></button>`).join('');
    box.innerHTML = ETAPAS.map((e) => {
      let ps = pacientes.filter((p) => p.etapa === e && passa(p));
      const total = ps.length;
      if (e === 'Encerrado') ps = ps.sort((a, b) => String(b.atualizado || '').localeCompare(String(a.atualizado || ''))).slice(0, qEnc ? 50 : 0);
      else ps.sort((a, b) => String(a.data || '9999').localeCompare(String(b.data || '9999')));
      return `<section class="q-col${e === 'Encerrado' ? ' q-col-enc' : ''}" data-etapa="${e}" aria-label="${escapeHtml(etapaLabel(e))}: ${total} contato(s)">
        <header class="q-col-h"><b>${escapeHtml(etapaLabel(e))}</b><span class="q-n">${total}</span></header>
        <p class="q-dica">${escapeHtml(PASSO_TIPICO[e] || '')}</p>
        ${e === 'Encerrado' ? `<button type="button" class="linkish q-enc-tg" data-q="enc">${qEnc ? 'Esconder encerrados' : 'Mostrar encerrados'}</button>` : ''}
        <div class="q-lista">${ps.map(qCartao).join('') || (e === 'Encerrado' ? '' : '<p class="q-vazio">Nenhum contato aqui.</p>')}</div>
      </section>`;
    }).join('');
    if (!pacientes.length) box.insertAdjacentHTML('afterbegin', '<p class="q-sem">Ainda não há contatos. Clique em "Novo contato" a cada mensagem ou ligação nova, com a origem.</p>');
  }
  function qAnuncia(t) { let r = document.getElementById('q-anuncio'); if (!r) { r = document.createElement('p'); r.id = 'q-anuncio'; r.className = 'visually-hidden'; r.setAttribute('aria-live', 'polite'); document.getElementById('quadro').appendChild(r); } r.textContent = t; }
  function qMover(p, nova, extra) {
    if (!moverEtapa(p, nova, extra)) { qAnuncia('Não consegui gravar a mudança neste navegador.'); alertaQuadro('Não consegui gravar a mudança neste navegador. Tente de novo.'); return; }
    qEncerrar = '';
    renderQuadro(); renderTracker();
    qAnuncia(`${p.nome} agora em ${etapaLabel(nova)}.${p.passo ? ' Próximo passo: ' + p.passo + '.' : ''}`);
    const c = document.querySelector(`.q-card[data-id="${CSS.escape(p.id)}"]`);
    if (c) { c.classList.add('q-novo'); const b = c.querySelector('[data-q="next"]') || c.querySelector('[data-q="det"]'); if (b) b.focus({ preventScroll: true }); }
  }
  function alertaQuadro(t) { let m = document.getElementById('q-erro'); if (!m) { m = document.createElement('p'); m.id = 'q-erro'; m.className = 'form-msg error'; m.setAttribute('role', 'alert'); document.querySelector('.quadro-cab').appendChild(m); } m.textContent = t; }
  document.getElementById('quadro').addEventListener('click', (e) => {
    const b = e.target.closest('[data-q],[data-qf]');
    if (!b) return;
    if (b.dataset.qf !== undefined) { qFila = b.dataset.qf; renderQuadro(); return; }
    if (b.dataset.q === 'enc') { qEnc = !qEnc; renderQuadro(); return; }
    const card = b.closest('.q-card'); if (!card) return;
    const p = pacientes.find((x) => x.id === card.dataset.id); if (!p) return;
    const i = ETAPAS.indexOf(p.etapa);
    const q = b.dataset.q;
    if (q === 'prev' && i > 0) qMover(p, ETAPAS[i - 1]);
    else if (q === 'next' && i < ETAPAS.length - 1) { if (ETAPAS[i + 1] === 'Encerrado') { qEncerrar = p.id; renderQuadro(); const s = document.querySelector('.q-card .q-res'); if (s) s.focus(); } else qMover(p, ETAPAS[i + 1]); }
    else if (q === 'encerrar') { qEncerrar = p.id; renderQuadro(); const s = document.querySelector('.q-card .q-res'); if (s) s.focus(); }
    else if (q === 'cancelar') { qEncerrar = ''; renderQuadro(); }
    else if (q === 'confirmar') qMover(p, 'Encerrado', { resultado: card.querySelector('.q-res').value, motivo: card.querySelector('.q-mot').value });
    else if (q === 'det') {
      openTool('rastreador');
      const bsc = document.getElementById('t-busca'); bsc.value = p.nome; filaAtual = ''; renderTracker();
      setTimeout(() => { const it = document.querySelector('#t-list .track-item'); if (it) { it.scrollIntoView({ behavior: 'smooth', block: 'center' }); const f = it.querySelector('select, input'); if (f) f.focus({ preventScroll: true }); } }, 120);
    }
  });
  document.getElementById('q-busca').addEventListener('input', renderQuadro);
  // Arrastar e soltar (computador). No celular e no teclado, as setas do cartão fazem o mesmo.
  const qCols = document.getElementById('quadro-cols');
  qCols.addEventListener('dragstart', (e) => { const c = e.target.closest('.q-card'); if (!c) return; qArrastado = c.dataset.id; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', qArrastado); } catch (err) { /* noop */ } c.classList.add('q-arrastando'); });
  qCols.addEventListener('dragend', () => { qArrastado = ''; qCols.querySelectorAll('.q-sobre, .q-arrastando').forEach((x) => x.classList.remove('q-sobre', 'q-arrastando')); });
  qCols.addEventListener('dragover', (e) => { const col = e.target.closest('.q-col'); if (!col || !qArrastado) return; e.preventDefault(); qCols.querySelectorAll('.q-sobre').forEach((x) => { if (x !== col) x.classList.remove('q-sobre'); }); col.classList.add('q-sobre'); });
  qCols.addEventListener('drop', (e) => {
    const col = e.target.closest('.q-col'); if (!col) return;
    e.preventDefault();
    const p = pacientes.find((x) => x.id === qArrastado); qArrastado = '';
    if (!p || p.etapa === col.dataset.etapa) { renderQuadro(); return; }
    if (col.dataset.etapa === 'Encerrado') { qEncerrar = p.id; qEnc = true; renderQuadro(); const s = document.querySelector('.q-card .q-res'); if (s) s.focus(); return; }
    qMover(p, col.dataset.etapa);
  });
  document.getElementById('q-novo').addEventListener('click', () => { openTool('rastreador'); setTimeout(() => { const n = document.getElementById('t-nome'); n.scrollIntoView({ behavior: 'smooth', block: 'center' }); n.focus({ preventScroll: true }); }, 120); });
  document.addEventListener('cliniloop:dados', () => { renderQuadro(); renderModulos(); });

  // ===================== Procedimento da recepção =====================
  function procedimentoHtml() {
    const e = estrategia(); const r = resultados();
    const quem = cfg.nome || (profInfo() ? 'o(a) ' + profInfo().titulo : 'o profissional');
    const mostra = e.ja.length ? e.ja[0].charAt(0).toLowerCase() + e.ja[0].slice(1) : '';
    const precoRestrito = ['dentista', 'psicologo', 'fisioterapeuta', 'nutricionista'].includes(cfg.profissional);
    const P = [
      ['Novo', 'Em até 5 minutos, no horário de atendimento.', 'Agradeça, pergunte como a pessoa conheceu o consultório (é a origem) e ofereça dois horários.', `Olá! Aqui é [seu nome], da equipe de ${quem}. Obrigada pela mensagem. Posso te oferecer dois horários para a primeira consulta: [dia e hora] ou [dia e hora]. Qual fica melhor?`],
      ['Em conversa', 'Retome em 1, 3 e 7 dias se a pessoa não responder. Depois, encerre como "Pausado".', 'Explique como é a primeira consulta e o que a pessoa leva dela. Dúvida clínica vai para o profissional: a recepção não responde.', `Oi, [nome]! Passando para saber se algum dos horários ficou bom. Na primeira consulta, ${mostra ? 'você sai com ' + mostra : 'você sai sabendo os próximos passos'}.`],
      ['Agendado', 'Confirme 48 horas antes; se não responder, 24 horas antes. Lembrete 2 horas antes só para quem aceitou lembretes.', 'Se a pessoa faltar, ofereça remarcar no mesmo dia, sem constranger, e registre a falta como atividade.', `Oi, [nome]! Confirmando a sua consulta de [dia] às [hora] com ${quem}. Pode responder "sim" para confirmar? Se precisar remarcar, me avise por aqui.`],
      ['Avaliado', 'No mesmo dia da consulta.', 'Pergunte ao profissional se houve plano proposto. Se houve, mova o cartão para "Plano proposto".', ''],
      ['Plano proposto', 'Acompanhamento em 2, 7 e 15 dias.', `Mande algo útil sobre a dúvida da pessoa, sem pressão. ${precoRestrito ? 'Valores só na conversa privada e só como o profissional autorizou; nunca como promoção ou desconto.' : 'Valores só como o profissional autorizou; nunca como promoção casada ou premiação.'}`, `Oi, [nome]! Ficou alguma dúvida sobre o plano que ${quem} explicou? Se quiser, separo um horário para conversar.`],
      ['Em tratamento', 'Toda semana, confira as próximas sessões e reavaliações.', 'Registre faltas e remarque. O que acontece no tratamento fica no prontuário, não aqui.', ''],
      ['Encerrado', 'Ao encerrar.', 'Escolha o resultado (alta e vínculo, perdido ou pausado) e escreva o motivo, sem dado clínico. Peça avaliação no Google a todos os pacientes, de forma neutra e sem oferecer nada em troca.', '']
    ];
    const regras = [
      'Nenhum dado clínico no CRM nem nas mensagens: diagnóstico, exames, sintomas e evolução ficam no prontuário.',
      'Dúvida clínica é do profissional. A recepção agradece e encaminha.',
      'Consentimento só quando a pessoa aceitar, por finalidade: atendimento, lembretes e conteúdos. Pedido para não receber mensagens vale na hora.',
      'Não prometer resultado nem cura, e não comparar com outros profissionais.',
      'Sempre pergunte como a pessoa conheceu o consultório. Se ela não souber, marque "Não sei".',
      'Todo contato em aberto termina o dia com próximo passo e data.'
    ];
    if (isMental()) regras.push('Em saúde mental, a falta pode ser sinal clínico: avise o profissional antes de qualquer retomada.');
    return `<p class="proc-sub">${escapeHtml(cfg.nome || 'Consultório')}${cfg.registro ? ' · ' + escapeHtml(cfg.registro) : ''}${cfg.whatsapp ? ' · WhatsApp ' + escapeHtml(cfg.whatsapp) : ''} · atualizado em ${fmtDate(todayISO())}</p>
      <h4>Regras que valem sempre</h4><ul class="proc-regras">${regras.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
      <h4>O que fazer em cada etapa do quadro</h4>
      <div class="proc-etapas">${P.map(([et, prazo, fazer, msg]) => `<section class="proc-et"><h5>${escapeHtml(etapaLabel(et))}</h5><p><b>Quando:</b> ${escapeHtml(prazo)}</p><p><b>O que fazer:</b> ${escapeHtml(fazer)}</p>${msg ? `<p class="proc-msg"><b>Mensagem modelo:</b> ${escapeHtml(msg)}</p>` : ''}</section>`).join('')}</div>
      <h4>Como a nossa diferença aparece no atendimento</h4>
      ${e.ja.length ? `<ul>${e.ja.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul><p class="proc-nota">Fale disso com as palavras do paciente e só do que já acontece no consultório.</p>` : '<p class="proc-nota">Quando o profissional aprovar a proposta de valor (passo 3) e marcar o que já faz, os itens aparecem aqui.</p>'}
      <h4>Respostas aprovadas pelo profissional</h4>
      ${r.atendimento ? `<pre class="proc-resp">${escapeHtml(r.atendimento.t)}</pre>` : '<p class="proc-nota">Ainda não há respostas aprovadas no passo 7. Até lá, use as mensagens modelo acima, trocando o que está entre colchetes.</p>'}`;
  }
  function abrirProcedimento(on) {
    const s = document.getElementById('procedimento'); const b = document.getElementById('proc-abrir');
    s.hidden = !on; b.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) { document.getElementById('proc-corpo').innerHTML = procedimentoHtml(); s.scrollIntoView({ behavior: 'smooth', block: 'start' }); const t = document.getElementById('proc-t'); t.tabIndex = -1; t.focus({ preventScroll: true }); }
  }
  document.getElementById('proc-abrir').addEventListener('click', () => abrirProcedimento(document.getElementById('procedimento').hidden));
  document.getElementById('proc-fechar').addEventListener('click', () => { abrirProcedimento(false); document.getElementById('proc-abrir').focus(); });
  document.getElementById('proc-imprimir').addEventListener('click', () => printDoc(docShell('Procedimento da recepção', `<h1>Procedimento da recepção</h1>${procedimentoHtml()}`), document.getElementById('proc-msg')));

  // --- Início: escolhe o módulo da primeira tela ---
  (function initModulos() {
    quadroOk = true;
    let rec = false; try { rec = JSON.parse(window.localStorage.getItem(RECEPCAO_KEY) || 'false') === true; } catch (e) { rec = false; }
    let v = null; try { v = JSON.parse(window.localStorage.getItem(VISAO_KEY) || 'null'); } catch (e) { v = null; }
    if (!['hoje', 'redes', 'crm', 'guia', 'ferramentas'].includes(v)) v = 'hoje';
    if (estadoPasso(1) !== 'pronto' && v !== 'guia') v = 'hoje';
    const h = location.hash.slice(1);
    if (/^v-/.test(h)) v = h.slice(2);
    else if (h) { const alvo = document.getElementById(h); const vv = visaoDe(alvo); if (vv) v = vv; }
    mostrarVisao(v);
    if (rec) aplicarRecepcao(true);
    renderModulos();
  })();
