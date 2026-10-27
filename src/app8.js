
  // ===================== Estratégia Oceano Azul (ferramenta guiada) =====================
  (function oceanoAzul() {
    const form = document.getElementById('oa-form');
    if (!form) return;
    const KEY = 'cliniloop.oceano.v1';
    const FATORES = [
      'Menor valor da consulta', 'Aceitar convênios', 'Localização', 'Equipamentos e tecnologia', 'Títulos e formação',
      'Rapidez para agendar', 'Horário estendido', 'Posts genéricos e datas comemorativas', 'Promessa de ser "o melhor"',
      'Ambiente e decoração', 'Tempo de consulta', 'Explicação do tratamento', 'Acompanhamento entre as consultas', 'Resposta no WhatsApp'
    ];
    const SUG = {
      eliminar: ['Posts de data comemorativa sem conteúdo', 'Competir pelo menor valor', 'Jargão técnico nas respostas', 'Primeiro contato sem retorno no WhatsApp'],
      reduzir: ['Tempo de espera na recepção', 'Etapas para conseguir agendar', 'Dependência de um único convênio', 'Quantidade de serviços anunciados'],
      elevar: ['Clareza sobre a avaliação e o tratamento', 'Tempo de escuta na primeira consulta', 'Plano de tratamento por escrito', 'Rapidez na resposta ao primeiro contato'],
      criar: ['Acompanhamento entre as consultas', 'Quadro recorrente que responde dúvidas reais', 'Guia de preparação para a primeira consulta', 'Rede de colegas para encaminhar e devolver o paciente']
    };
    const SUG_PROF = {
      dentista: { elevar: ['Acolhimento de quem tem medo de dentista'], criar: ['Planejamento digital mostrado antes de começar'] },
      medico: { elevar: ['Explicação dos exames e dos próximos passos'], criar: ['Resumo escrito da consulta para o paciente'] },
      psiquiatra: { elevar: ['Explicação do plano e do tempo de cada etapa'], criar: ['Canal combinado para dúvidas entre as consultas'] },
      psicologo: { elevar: ['Acolhimento no primeiro contato'], criar: ['Série psicoeducativa sobre um tema da sua prática'] },
      fisioterapeuta: { elevar: ['Reavaliação com metas medidas'], criar: ['Programa de exercícios em casa, acompanhado'] },
      nutricionista: { elevar: ['Plano alimentar adaptado à rotina real'], criar: ['Acompanhamento por mensagem entre as consultas'] }
    };
    const ACOES = ['eliminar', 'reduzir', 'elevar', 'criar'];
    const st = Object.assign({ fatores: [], extra: '', eliminar: '', reduzir: '', elevar: '', criar: '', notas: {}, publico: '', proposta: '', propostaManual: false }, storeGet(KEY, {}) || {});
    const save = () => storeSet(KEY, st);
    const linhas = (t) => (t || '').split(/\n|;/).map((x) => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
    const el = (id) => document.getElementById(id);

    // Passo 1: fatores
    const boxF = el('oa-fatores');
    boxF.innerHTML = FATORES.map((f, i) => `<label><input type="checkbox" name="fatores" value="${escapeHtml(f)}" id="oa-f${i}"> ${escapeHtml(f)}</label>`).join('');
    boxF.querySelectorAll('input').forEach((c) => { c.checked = st.fatores.includes(c.value); });
    el('oa-extra').value = st.extra;
    ACOES.forEach((a) => { el('oa-' + a).value = st[a]; });
    if (st.publico) el('oa-publico').value = st.publico;
    el('oa-proposta').value = st.proposta;

    // Passo 2: sugestões por profissão
    function renderSug() {
      const extra = SUG_PROF[cfg.profissional] || {};
      form.querySelectorAll('.oa-acao').forEach((box) => {
        const a = box.dataset.acao;
        const lista = [...(extra[a] || []), ...SUG[a]];
        const sug = box.querySelector('.oa-sug');
        sug.innerHTML = lista.map((t) => `<button type="button" class="oa-chip">+ ${escapeHtml(t)}</button>`).join('');
        sug.querySelectorAll('.oa-chip').forEach((b, i) => b.addEventListener('click', () => {
          const ta = el('oa-' + a);
          const atual = linhas(ta.value);
          if (!atual.includes(lista[i])) ta.value = [...atual, lista[i]].map((x) => '- ' + x).join('\n');
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }));
      });
    }

    // Passo 3: curva de valor
    function fatoresAtuais() {
      const base = [...boxF.querySelectorAll('input:checked')].map((c) => c.value);
      const extra = (el('oa-extra').value || '').split(',').map((x) => x.trim()).filter(Boolean);
      const criados = linhas(el('oa-criar').value).map((x) => x + ' (novo)');
      return [...new Set([...base, ...extra, ...criados])].slice(0, 12);
    }
    function nota(f) {
      if (!st.notas[f]) {
        const novo = / \(novo\)$/.test(f);
        const elim = linhas(el('oa-eliminar').value).some((x) => f.toLowerCase().includes(x.toLowerCase().slice(0, 12)));
        st.notas[f] = { m: novo ? 0 : 3, v: novo ? 4 : (elim ? 1 : 3) };
      }
      return st.notas[f];
    }
    function renderRows() {
      const fs = fatoresAtuais();
      const rows = el('oa-rows');
      if (!fs.length) { rows.innerHTML = '<p class="oa-hint">Marque os fatores no passo 1 para montar a curva.</p>'; el('oa-canvas').innerHTML = ''; return; }
      rows.innerHTML = `<div class="oa-row oa-head"><span>Fator</span><span>Mercado</span><span>Você</span></div>` + fs.map((f, i) => {
        const n = nota(f);
        return `<div class="oa-row"><span class="oa-f">${escapeHtml(f)}</span>
          <label><span class="visually-hidden">Mercado em ${escapeHtml(f)}</span><input type="range" min="0" max="5" step="1" value="${n.m}" data-f="${i}" data-k="m"><output>${n.m}</output></label>
          <label><span class="visually-hidden">Você em ${escapeHtml(f)}</span><input type="range" min="0" max="5" step="1" value="${n.v}" data-f="${i}" data-k="v"><output>${n.v}</output></label></div>`;
      }).join('');
      rows.querySelectorAll('input[type="range"]').forEach((r) => r.addEventListener('input', () => {
        const f = fs[+r.dataset.f];
        st.notas[f][r.dataset.k] = +r.value;
        r.nextElementSibling.textContent = r.value;
        drawCanvas(fs); save();
      }));
      drawCanvas(fs);
    }
    function drawCanvas(fs) {
      const W = 640, H = 310, L = 34, R = 124, T = 16, B = 112;
      const step = fs.length > 1 ? (W - L - R) / (fs.length - 1) : 0;
      const X = (i) => fs.length > 1 ? L + i * step : (W + L - R) / 2;
      const Y = (v) => T + (5 - v) * (H - T - B) / 5;
      const pts = (k) => fs.map((f, i) => `${X(i).toFixed(1)},${Y(nota(f)[k]).toFixed(1)}`).join(' ');
      const grid = [0, 1, 2, 3, 4, 5].map((v) => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="oa-grid"/><text x="${L - 8}" y="${Y(v) + 4}" text-anchor="end" class="oa-tick">${v}</text>`).join('');
      const labels = fs.map((f, i) => {
        const t = f.replace(/ \(novo\)$/, '');
        const curto = t.length > 22 ? t.slice(0, 21) + '…' : t;
        return `<text x="${X(i)}" y="${H - B + 14}" transform="rotate(38 ${X(i)} ${H - B + 14})" class="oa-lab${/ \(novo\)$/.test(f) ? ' novo' : ''}"><title>${escapeHtml(t)}</title>${escapeHtml(curto)}</text>`;
      }).join('');
      const dots = (k, cls) => fs.map((f, i) => `<circle cx="${X(i)}" cy="${Y(nota(f)[k])}" r="4" class="${cls}"/>`).join('');
      el('oa-canvas').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Curva de valor: mercado e você">${grid}
        <polyline points="${pts('m')}" class="oa-line-m"/>${dots('m', 'oa-dot-m')}
        <polyline points="${pts('v')}" class="oa-line-v"/>${dots('v', 'oa-dot-v')}${labels}</svg>
        <p class="oa-legend"><span class="m"></span> Mercado <span class="v"></span> Você, depois das quatro ações</p>`;
      el('oa-curva').value = fs.map((f) => `${f}: mercado ${nota(f).m}, você ${nota(f).v}`).join('; ');
    }

    // Passo 4: rascunho da proposta
    function rascunho() {
      const pub = el('oa-publico').value.trim() || '[público]';
      const cr = linhas(el('oa-criar').value), ev = linhas(el('oa-elevar').value), el1 = linhas(el('oa-eliminar').value);
      const oferta = [cr[0], ev[0]].filter(Boolean).map((x) => x.charAt(0).toLowerCase() + x.slice(1)).join(' e ') || '[o que você cria e eleva]';
      const sem = el1[0] ? `, sem ${el1[0].charAt(0).toLowerCase() + el1[0].slice(1)}` : '';
      return `Para ${pub}, ofereço ${oferta}${sem}.`;
    }
    function updProposta() {
      if (!st.propostaManual) { el('oa-proposta').value = rascunho(); st.proposta = el('oa-proposta').value; }
    }
    el('oa-proposta').addEventListener('input', () => { st.propostaManual = !!el('oa-proposta').value.trim(); st.proposta = el('oa-proposta').value; save(); });

    form.addEventListener('input', (e) => {
      if (e.target.type === 'range' || e.target.id === 'oa-proposta') return;
      st.fatores = [...boxF.querySelectorAll('input:checked')].map((c) => c.value);
      st.extra = el('oa-extra').value;
      ACOES.forEach((a) => { st[a] = el('oa-' + a).value; });
      st.publico = el('oa-publico').value;
      renderRows(); updProposta(); save();
    });
    form.addEventListener('change', (e) => { if (e.target.type === 'checkbox') form.dispatchEvent(new Event('input')); });
    const det = form.closest('details');
    if (det) det.addEventListener('toggle', () => { if (det.open) { renderSug(); renderRows(); updProposta(); } });
    renderSug(); renderRows(); updProposta();
  })();
