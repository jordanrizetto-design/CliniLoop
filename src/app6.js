
  // ===================== Modo guiado, primeiro ganho, feedback e instalação =====================

  function modoAtual() { return storeGet(MODO_KEY, '') === 'completo' ? 'completo' : 'guiado'; }

  // As ferramentas que mais ajudam agora: as 3 primeiras ações da lista de "Hoje" que apontam para uma ferramenta.
  function idsGuiados() {
    const ids = [];
    const ti = onbComplete() ? trilhaInfo() : null;
    if (ti && !ti.t.rotina && ti.pend.length) [ti.atual, ...ti.pend].forEach((id) => { if (id && ids.indexOf(id) < 0) ids.push(id); });
    else computeActions().forEach((a) => { if (a.tool && PB_TOOLS[a.tool] && ids.indexOf(a.tool) < 0) ids.push(a.tool); });
    const base = ids.slice(0, 3);
    if (pacientes.length && base.indexOf('rastreador') < 0) base.push('rastreador');
    return base;
  }
  function revealTool(id) {
    reveladas.add(id);
    const t = document.querySelector(`#tools-list .tool[data-id="${id}"]`);
    if (t) t.hidden = false;
  }
  function applyModo() {
    const list = document.getElementById('tools-list');
    if (!list) return;
    const tools = [...list.querySelectorAll('.tool[data-id]')];
    const guiaIds = idsGuiados();
    const guiado = modoAtual() === 'guiado' && guiaIds.length > 0;
    const vis = new Set([...guiaIds, ...reveladas]);
    let n = 0;
    tools.forEach((t) => {
      const mostrar = !guiado || vis.has(t.dataset.id) || t.open;
      t.hidden = !mostrar;
      if (mostrar) n++;
    });
    list.querySelectorAll('.tool-sep').forEach((s) => { s.hidden = guiado; });
    list.classList.toggle('modo-guiado', guiado);
    let bar = document.getElementById('modo-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'modo-bar';
      bar.className = 'modo-bar';
      bar.setAttribute('aria-live', 'polite');
      list.parentNode.insertBefore(bar, list);
      tools.forEach((t) => t.addEventListener('toggle', () => { if (t.open) reveladas.add(t.dataset.id); }));
    }
    bar.innerHTML = '';
    const txt = document.createElement('span');
    txt.innerHTML = guiado
      ? `<b>Modo guiado:</b> ${n} de ${tools.length} ferramentas, as que mais ajudam agora, na ordem do seu roteiro.`
      : `<b>Todas as ferramentas:</b> ${tools.length} ferramentas, agrupadas por etapa do funil.`;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'btn btn-outline btn-sm';
    btn.textContent = guiado ? `Mostrar as ${tools.length}` : 'Voltar ao modo guiado';
    btn.addEventListener('click', () => { storeSet(MODO_KEY, guiado ? 'completo' : 'guiado'); reveladas.clear(); applyModo(); });
    bar.append(txt, btn);
  }

  // Aviso honesto de versão beta.
  function renderBeta() {
    const hoje = document.getElementById('hoje');
    if (!hoje) return;
    let n = document.getElementById('beta-note');
    if (storeGet(BETA_KEY, false)) { if (n) n.hidden = true; return; }
    if (!n) {
      n = document.createElement('p');
      n.id = 'beta-note'; n.className = 'beta-note';
      n.innerHTML = '<span><b>Versão beta.</b> O CliniLoop ainda está em teste com profissionais de saúde. Se algo travar ou confundir, conte em <a href="#ajustes" id="beta-link">Ajustes → Ajude a testar</a>.</span>';
      const x = document.createElement('button');
      x.type = 'button'; x.className = 'linkish'; x.textContent = 'Dispensar';
      x.addEventListener('click', () => { storeSet(BETA_KEY, true); n.hidden = true; });
      n.appendChild(x);
      hoje.insertBefore(n, hoje.querySelector('.hoje-grid'));
      n.querySelector('#beta-link').addEventListener('click', (e) => { e.preventDefault(); const f = document.getElementById('feedback'); openTool('ajustes'); if (f) setTimeout(() => f.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250); });
    }
    n.hidden = false;
  }

  function renderExtras() { applyModo(); renderBeta(); if (typeof renderJornada === 'function') renderJornada(); }

  // Feedback de teste: sem dados de pacientes, vai por cópia do texto.
  (function feedback() {
    const nota = document.getElementById('fb-nota');
    if (!nota) return;
    const texto = document.getElementById('fb-texto');
    const gh = document.getElementById('fb-github');
    const cp = document.getElementById('fb-copiar');
    const st = document.getElementById('fb-status');
    const monta = () => {
      const t = (texto.value || '').trim();
      return { titulo: `Feedback de teste (nota ${nota.value}/5)`, corpo: `Foi fácil começar? ${nota.value}/5\n\nO que travou ou confundiu:\n${t || '(sem texto)'}\n\nTela: ${window.innerWidth}px de largura` };
    };
    if (gh) gh.addEventListener('click', () => {
      const f = monta();
      window.open(`${REPO_URL}/issues/new?title=${encodeURIComponent(f.titulo)}&body=${encodeURIComponent(f.corpo)}`, '_blank', 'noopener');
    });
    cp.addEventListener('click', async () => {
      const f = monta();
      try { await navigator.clipboard.writeText(f.titulo + '\n\n' + f.corpo); st.textContent = 'Copiado. Envie para quem convidou você para testar.'; }
      catch (e) { texto.focus(); texto.select(); st.textContent = 'Não consegui copiar sozinho. Selecione e copie o texto.'; }
    });
  })();

  // Instalação como aplicativo (PWA) e uso offline.
  (function pwa() {
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
    const btn = document.getElementById('pwa-install');
    let ev = null;
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); ev = e; if (btn) btn.hidden = false; });
    if (btn) btn.addEventListener('click', async () => { if (!ev) return; ev.prompt(); await ev.userChoice.catch(() => {}); ev = null; btn.hidden = true; });
  })();

  // ===================== Plano de 30 dias =====================
  const PLANO_KEY = PREFIX + 'plano30.v1';
  function renderPlano() {
    const lista = document.getElementById('plano-lista');
    if (!lista) return;
    const feito = storeGet(PLANO_KEY, {}) || {};
    lista.innerHTML = '';
    PLANO30.forEach((sem) => {
      const bloco = document.createElement('section');
      bloco.className = 'plano-sem';
      bloco.innerHTML = `<h4>Semana ${sem.sem}: ${escapeHtml(sem.tema)} <span>· partes ${escapeHtml(sem.parte)} do guia</span></h4>`;
      sem.dias.forEach((d) => {
        const row = document.createElement('div');
        row.className = 'plano-dia' + (feito[d.d] ? ' feito' : '');
        row.innerHTML = `<input type="checkbox" id="pl-${d.d}" ${feito[d.d] ? 'checked' : ''}><div class="pd-c"><label for="pl-${d.d}" class="pd-t">Dia ${d.d}: ${escapeHtml(d.titulo)}</label><span>${escapeHtml(d.acao)}</span><span class="pd-m">Entrega: ${escapeHtml(d.entrega)} · cerca de ${d.min} min</span><span class="pd-a"></span></div>`;
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'btn btn-outline btn-sm';
        b.textContent = 'Abrir ' + (TOOL_NAMES[d.tool] || d.tool);
        b.addEventListener('click', () => openTool(d.tool));
        row.querySelector('.pd-a').appendChild(b);
        row.querySelector('input').addEventListener('change', (e) => {
          const f = storeGet(PLANO_KEY, {}) || {};
          if (e.target.checked) f[d.d] = true; else delete f[d.d];
          storeSet(PLANO_KEY, f); renderPlano();
        });
        bloco.appendChild(row);
      });
      lista.appendChild(bloco);
    });
    const n = Object.keys(feito).length;
    document.getElementById('plano-bar').style.width = (n / 20 * 100) + '%';
    document.getElementById('plano-meter').setAttribute('aria-valuenow', String(n));
    document.getElementById('plano-txt').textContent = `${n} de 20 dias`;
    const mc = document.getElementById('plano-marcos');
    mc.innerHTML = MARCOS.map((m) => `<div><h5>${escapeHtml(m.fase)}</h5><ul>${m.itens.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>`).join('');
  }
  renderPlano();

  renderExtras();
