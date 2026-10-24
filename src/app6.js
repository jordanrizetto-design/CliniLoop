
  // ===================== Modo guiado, primeiro ganho, feedback e instalação =====================

  function modoAtual() { return storeGet(MODO_KEY, '') === 'completo' ? 'completo' : 'guiado'; }

  // As ferramentas que mais ajudam agora: as 3 primeiras ações da lista de "Hoje" que apontam para uma ferramenta.
  function idsGuiados() {
    const ids = [];
    computeActions().forEach((a) => { if (a.tool && PB_TOOLS[a.tool] && ids.indexOf(a.tool) < 0) ids.push(a.tool); });
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

  // Primeiro ganho: bio e perfil prontos em poucos minutos.
  function renderPrimeiroGanho() {
    const hoje = document.getElementById('hoje');
    if (!hoje) return;
    let box = document.getElementById('primeiro-ganho');
    const uso = storeGet(USO_KEY, {}) || {};
    const fechado = storeGet(GANHO_KEY, false) || uso.perfil;
    if (fechado) { if (box) box.hidden = true; return; }
    if (!box) {
      box = document.createElement('div');
      box.id = 'primeiro-ganho'; box.className = 'ganho';
      hoje.querySelector('.hoje-head').after(box);
    }
    box.hidden = false;
    const ok1 = onbComplete();
    const passos = [
      [ok1, 'Conte sobre o seu consultório', 'Três passos rápidos em "Comece aqui". Fica só neste navegador.', 'Abrir "Comece aqui"', 'config'],
      [!!uso.perfil, 'Gere o prompt do seu perfil', 'A ferramenta Perfis e presença monta a auditoria da sua bio com as regras do seu conselho.', 'Abrir Perfis e presença', 'perfil'],
      [false, 'Cole no Claude e ajuste', 'Cole no Claude.ai (gratuito) ou use "Gerar resposta aqui" com a sua chave. Peça ajustes na mesma conversa.', 'Abrir o Claude.ai', null],
    ];
    const atual = passos.findIndex((p) => !p[0]);
    box.innerHTML = `<p class="hoje-label">Seu primeiro ganho em cerca de 10 minutos</p><ol class="ganho-list"></ol>`;
    const ol = box.querySelector('ol');
    passos.forEach((p, i) => {
      const li = document.createElement('li');
      li.className = p[0] ? 'feito' : (i === atual ? 'atual' : '');
      li.innerHTML = `<span class="ganho-n" aria-hidden="true">${p[0] ? '✓' : i + 1}</span><div><b>${p[1]}</b><span>${p[2]}</span></div>`;
      if (i === atual) {
        const b = document.createElement(p[4] ? 'button' : 'a');
        b.className = 'btn btn-gold btn-sm'; b.textContent = p[3];
        if (p[4]) { b.type = 'button'; b.addEventListener('click', () => openTool(p[4])); }
        else { b.href = 'https://claude.ai/new'; b.target = '_blank'; b.rel = 'noopener'; }
        li.querySelector('div').appendChild(b);
      }
      ol.appendChild(li);
    });
    const fim = document.createElement('button');
    fim.type = 'button'; fim.className = 'linkish ganho-fim'; fim.textContent = 'Já fiz isso, dispensar';
    fim.addEventListener('click', () => { storeSet(GANHO_KEY, true); renderPrimeiroGanho(); });
    box.appendChild(fim);
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

  function renderExtras() { applyModo(); renderPrimeiroGanho(); renderBeta(); }

  // Feedback de teste: sem dados de pacientes, vai por GitHub (issue) ou por cópia do texto.
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
    if (REPO_URL) gh.hidden = false;
    gh.addEventListener('click', () => {
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

  renderExtras();
