
  // ===================== Dados de trabalho =====================
  function arr(key) { const v = storeGet(key, []); return Array.isArray(v) ? v : []; }
  let pacientes = arr(PAC_KEY);
  let colegas = arr(COL_KEY);
  // Funil de colegas alinhado ao livro: migra etapas antigas
  colegas.forEach((c) => { if (COLEGA_MIGRA[c.etapa]) c.etapa = COLEGA_MIGRA[c.etapa]; });
  let campanhas = arr(CAMP_KEY);
  let conteudos = arr(CONT_KEY);
  let lastBriefingMd = '';
  let lastBriefingHtml = '';
  let lastEbook = '';
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function savePac() { storeSet(PAC_KEY, pacientes); notifyData(); }
  function saveCol() { storeSet(COL_KEY, colegas); notifyData(); }
  function saveCamp() { storeSet(CAMP_KEY, campanhas); notifyData(); }
  function saveCont() { storeSet(CONT_KEY, conteudos); notifyData(); }

  function markUsed(id, silent) {
    if (!id) return;
    const u = storeGet(USO_KEY, {});
    u[id] = todayISO();
    storeSet(USO_KEY, u);
    if (!silent) notifyData();
  }

  // ===================== Formulários e prompts =====================
  function fieldLabel(el) {
    const lab = el.id && document.querySelector(`label[for="${el.id}"]`);
    return lab ? lab.textContent.replace(/\*/g, '').trim() : (el.name || 'campo');
  }
  function formMsg(form) {
    let m = form.querySelector(':scope > .form-msg');
    if (!m) {
      m = document.createElement('p');
      m.className = 'form-msg';
      m.setAttribute('role', 'status');
      const actions = [...form.querySelectorAll(':scope > .form-actions')].pop();
      if (actions) actions.after(m); else form.appendChild(m);
    }
    return m;
  }
  function validate(form) {
    const missing = [...form.querySelectorAll('[required]')].filter((el) => !String(el.value).trim());
    const msg = formMsg(form);
    if (missing.length) {
      missing.forEach((el) => el.classList.add('invalid'));
      msg.className = 'form-msg error';
      msg.textContent = `Falta preencher: ${missing.map(fieldLabel).join(', ')}. Os campos estão destacados em vermelho.`;
      missing[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      missing[0].focus({ preventScroll: true });
      return false;
    }
    return true;
  }
  document.querySelectorAll('form').forEach((form) => {
    form.noValidate = true;
    form.addEventListener('input', (e) => { if (e.target.classList) e.target.classList.remove('invalid'); });
  });

  // Bloco de saída de cada prompt
  document.querySelectorAll('form.tool-form[data-tool] .output-block').forEach((block) => {
    const tool = block.closest('form').dataset.tool;
    const id = `out-${tool}`;
    block.innerHTML = `<p class="output-title">Seu prompt está pronto: copie e cole no Claude.ai</p>
      <label for="${id}" class="visually-hidden">Prompt gerado</label>
      <textarea id="${id}" class="js-output" readonly rows="8"></textarea>
      <div class="output-actions">
        <button type="button" class="btn btn-teal js-run-api" data-ico="play" hidden>Gerar resposta aqui (API)</button>
        <button type="button" class="btn btn-outline js-copy" data-ico="copy">Copiar prompt</button>
        <a class="btn btn-outline" data-ico="ext" href="https://claude.ai/new" target="_blank" rel="noopener">Abrir Claude.ai gratuito</a>
      </div>
      ${WEB_TOOLS.includes(tool) ? '<p class="pro-tip" hidden>Claude Pro/Max: no Claude.ai, clique em "+" e ative Research antes de enviar este prompt. A pesquisa fica bem mais profunda.</p>' : ''}
      <div class="api-area"></div>`;
    block.querySelector('.js-copy').addEventListener('click', (e) => copyText(block.querySelector('.js-output').value, e.currentTarget));
    block.querySelector('.js-run-api').addEventListener('click', () => runApiFor(block, null));
  });

  document.querySelectorAll('form.tool-form[data-tool]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate(form)) return;
      const tool = form.dataset.tool;
      const msg = formMsg(form);
      try {
        const fd = new FormData(form);
        const get = (name) => (fd.get(name) || '').toString().trim();
        const getAll = (name) => { const v = fd.getAll(name); return v.length ? v.join(', ') : '(nenhum selecionado)'; };
        if (tool === 'briefing') { buildBriefing(get); }
        const builder = promptBuilders[tool];
        if (!builder) return;
        const prompt = builder(get, getAll) + contextBlock(tool);
        const block = form.querySelector('.output-block');
        block.querySelector('.js-output').value = prompt;
        block.hidden = false;
        markUsed(tool === 'plano' ? 'atendimento' : (tool === 'registro' ? 'rastreador' : tool));
        msg.className = 'form-msg ok';
        msg.textContent = tool === 'briefing'
          ? '✓ Briefing montado acima. Abaixo, um prompt opcional para revisá-lo com o Claude.'
          : (cfg.plano === 'api' ? '✓ Prompt gerado logo abaixo. Clique em "Gerar resposta aqui (API)" ou copie e cole no Claude.ai.'
            : '✓ Prompt gerado logo abaixo. Clique em "Copiar prompt" e cole no Claude.ai.');
        riskWarn(form, msg);
        if (!profInfo()) {
          const w = document.createElement('p');
          w.className = 'form-warn';
          w.textContent = 'Você ainda não escolheu o tipo de profissional em "Comece aqui". O prompt usa só as regras gerais; escolha para incluir as regras do seu conselho.';
          msg.after(w);
        }
        (tool === 'briefing' ? document.getElementById('bf-area') : block).scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
        alert('Algo deu errado ao gerar o prompt. Recarregue a página e tente novamente. Detalhe técnico: ' + err.message);
      }
    });
  });

  // Campos que ficam salvos (ex.: banco de dúvidas)
  (function persistFields() {
    const saved = storeGet(PERSIST_KEY, {});
    document.querySelectorAll('[data-persist]').forEach((el) => {
      const k = el.dataset.persist;
      if (saved && typeof saved[k] === 'string') el.value = saved[k];
      el.addEventListener('input', () => {
        const s = storeGet(PERSIST_KEY, {}) || {};
        s[k] = el.value.slice(0, 50000);
        storeSet(PERSIST_KEY, s);
      });
    });
  })();

  // Pré-preenchimento a partir do perfil do consultório
  function prefillFields(force) {
    document.querySelectorAll('[data-prefill]').forEach((el) => {
      const val = cfg[el.dataset.prefill] || '';
      if (!val) return;
      if (el.value === '' || el.dataset.autofilled === '1' || (force && !el.value.trim())) {
        el.value = val;
        el.dataset.autofilled = '1';
      }
    });
    document.querySelectorAll('select[data-options="baldes"]').forEach((sel) => {
      const cur = sel.value;
      const first = sel.options[0] ? sel.options[0].outerHTML : '<option value="">(escolha)</option>';
      sel.innerHTML = first + baldesList().map((b) => `<option>${escapeHtml(b)}</option>`).join('');
      if ([...sel.options].some((o) => o.value === cur)) sel.value = cur;
    });
    document.getElementById('lista-servicos').innerHTML = servicosList().map((s) => `<option value="${escapeHtml(s)}">`).join('');
    document.getElementById('lista-equipe').innerHTML = equipeList().map((s) => `<option value="${escapeHtml(s)}">`).join('');
    const bf = document.getElementById('bf-entregas');
    if (bf && (!bf.value || bf.dataset.autofilled === '1')) { bf.value = ROLES[document.getElementById('bf-para').value].entregas; bf.dataset.autofilled = '1'; }
    document.getElementById('cfg-multi').hidden = cfg.profissional !== 'multi';
  }
  document.querySelectorAll('[data-prefill], #bf-entregas').forEach((el) => el.addEventListener('input', () => { el.dataset.autofilled = '0'; }));
  document.getElementById('bf-para').addEventListener('change', (e) => {
    const bf = document.getElementById('bf-entregas');
    if (!bf.value || bf.dataset.autofilled === '1') { bf.value = ROLES[e.target.value].entregas; bf.dataset.autofilled = '1'; }
  });
  document.getElementById('cfg-fill-all').addEventListener('click', () => {
    prefillFields(true);
    document.getElementById('cfg-status').textContent = 'Pronto: os campos vazios das ferramentas foram preenchidos com o seu perfil.';
  });

  // ===================== Resultados guardados =====================
  document.querySelectorAll('.saved-slot').forEach((slot) => {
    const id = slot.dataset.save;
    const r = resultados()[id];
    slot.innerHTML = `<details class="saved"${r ? '' : ''}>
      <summary><span>Guardar a versão final: ${escapeHtml(slot.dataset.label)}</span><span class="saved-chip${r ? ' ok' : ''}">${r ? 'Guardado em ' + fmtDate(r.d) : 'Ainda não guardado'}</span><span class="chevron">▸</span></summary>
      <div class="saved-body">
        <p>Depois de ajustar a resposta com o Claude, cole aqui a versão que você aprovou. Ela entra nos próximos prompts, no briefing, no arquivo do Projeto e no playbook.</p>
        <label class="visually-hidden" for="save-${id}">Versão final</label>
        <textarea id="save-${id}" placeholder="Cole aqui a versão final"></textarea>
      </div>
    </details>`;
    const ta = slot.querySelector('textarea');
    ta.value = r ? r.t : '';
    let timer = null;
    ta.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        saveResultado(id, ta.value);
        const chip = slot.querySelector('.saved-chip');
        const ok = !!ta.value.trim();
        chip.className = 'saved-chip' + (ok ? ' ok' : '');
        chip.textContent = ok ? 'Guardado em ' + fmtDate(todayISO()) : 'Ainda não guardado';
      }, 500);
    });
  });

  // ===================== Regras do conselho e checagem rápida =====================
  const RISK_RULES = [
    { re: /\b(garant\w*|100 ?%|resultado (certo|definitivo)|cura definitiva|sem risco|milagr\w*)/, msg: 'Promessa de resultado ("garantido", "100%", "sem risco", "milagre").' },
    { re: /\b(o melhor|a melhor|os melhores|as melhores|numero 1|n[o.] ?1|unic[oa] (da|do|na|no) (cidade|regiao|brasil))\b/, msg: 'Superlativo ou autopromoção ("o melhor", "número 1", "único").' },
    { re: /\b(sem dor|indolor)\b/, msg: 'Promessa de ausência de dor ("sem dor", "indolor"): descreva o que é feito para o conforto, sem garantir.' },
    { re: /\b(voce (tem|sofre|esta com)|sofre de|esta com depress|tem ansiedade)\b/, msg: 'Afirma ou sugere condição de saúde de quem lê ("você tem…", "sofre de…"): vetado em anúncios pelas políticas da Meta e arriscado no orgânico.' },
    { re: /(r\$ ?\d|\bprecos?\b|\bvalor promocional|\bdescontos?\b|\bpromoc|\bcupom|\bgratis\b|\bgratuit|\bparcel\w*|\bblack friday|cabe no (seu )?bolso)/, by: {
      odontologia: 'Preço, desconto, gratuidade ou apelo a preço: proibido na publicidade odontológica.',
      psicologia: 'Preço como chamariz (promoção, desconto, gratuidade, pacote): vedado na psicologia.',
      fisioterapia: 'Valores fora do local de atendimento ou como concorrência desleal: vedado pelo Código de Ética da Fisioterapia.',
      medicina: 'Valores e descontos podem ser informados (Res. CFM 2.336/2023), mas sem sensacionalismo nem promoção casada.',
      nutricao: 'Honorários e promoções não podem ser usados como publicidade (Res. CFN 599/2018).' } },
    { re: /\b(sorteio|sorteamos|brindes?|premio|premiacao|concurso)\b/, by: {
      medicina: 'Premiações são vedadas pela Res. CFM 2.336/2023.',
      odontologia: 'Brindes, prêmios e sorteios: regras alteradas pela Res. CFO 271/2025. Confirme com o seu CRO antes.',
      psicologia: 'Sorteios são vedados na publicidade de psicologia.',
      fisioterapia: 'Sorteios e brindes podem configurar captação incompatível com a dignidade da profissão. Confirme com o CREFITO.',
      nutricao: 'Sorteios e promoções não podem ser usados como publicidade (Res. CFN 599/2018).' } },
    { re: /\bantes e depois\b/, by: {
      medicina: 'Antes e depois: só educativo, em conjunto com resultados satisfatórios, insatisfatórios e complicações, com texto educativo, sem editar a imagem nem identificar o paciente.',
      odontologia: 'Antes e depois (Res. CFO 196/2019): só pelo dentista que executou, tratamento concluído, com nome e CRO na imagem e autorização por escrito; proibido no perfil da clínica (pessoa jurídica) e em "antes, durante e depois".',
      psicologia: 'Psicologia não usa antes e depois: nada que identifique ou exponha pacientes.',
      fisioterapia: 'Antes e depois ou imagem que identifique o paciente: só com TCLE prévio (Res. COFFITO 532/2021); divulgação irregular é infração de manifesta gravidade.',
      nutricao: 'Imagem corporal (sua ou de terceiros) atribuindo resultado a produto, técnica ou protocolo é vedada mesmo com autorização, exceto em eventos e publicações científicas (Res. CFN 599/2018).' } },
    { re: /\b(perdi|perdeu|perca|emagre\w*|secar|barriga chapada|corpo dos sonhos|shape|\d+ ?kg)\b/, by: {
      nutricao: 'Resultado corporal ou de peso: não atribua resultado a produto, técnica ou protocolo nem use imagem corporal; inclua que os resultados podem não ocorrer da mesma forma para todos.' } },
    { re: /\b(marca|patrocin\w*|publi|parceria com|cupom da marca|recebido)\b/, by: {
      nutricao: 'Associar a própria imagem a marcas de alimentos ou fazer publicidade comercial de marcas é vedado ao nutricionista.',
      odontologia: 'Marcas de materiais, equipamentos e instrumentais não podem ser identificadas na publicidade odontológica.',
      medicina: 'Publicidade de medicamentos, insumos, órteses, próteses e suas marcas é vedada.' } },
    { re: /\b(\d+ sinais de que (voce|vc) tem|sinais de que voce tem|descubra se voce tem|teste (se|para saber se) voce tem)\b/, msg: 'Estimula autodiagnóstico ("5 sinais de que você tem…"): prefira "quando vale procurar avaliação".' },
    { re: /\b(comiss\w*|percentual|bonifica\w*) (por|pela|pelas|pelos) indica\w*|\bpago (por|pela) indica\w*/, msg: 'Comissão ou vantagem por indicação de paciente: vedada pelos códigos de ética (captação indevida).' },
    { re: /\b(depoimentos?|testemunhos?|paciente (disse|falou|contou)|meus pacientes dizem)\b/, by: {
      psicologia: 'Depoimentos de pacientes são desaconselhados mesmo com consentimento.',
      fisioterapia: 'Depoimentos e agradecimentos de pacientes não podem ser usados para autopromoção; texto ou áudio de paciente só com TCLE prévio.',
      medicina: 'Depoimentos: sem tom sensacionalista ou de promessa; repostar paciente conta como publicidade médica.',
      odontologia: 'Depoimentos: só com autorização, sem promessa de resultado nem sensacionalismo. Confirme com o CRO.',
      nutricao: 'Resultados do seu trabalho só com autorização escrita, sem garantir resultado nem usar imagem corporal.' } },
    { re: /\b(me mande (uma )?foto|diagnostico (pelo|por) (direct|whatsapp|comentario)|consulta pelo direct|conte (seu|sua) (historico|caso) nos comentarios)\b/, msg: 'Diagnóstico por foto, comentário ou mensagem, ou pedido de histórico nos comentários: encaminhe para o atendimento.' },
    { re: /\b(segredo que|medicos (nao contam|escondem)|dentistas (nao contam|escondem)|cura em|em segundos|nunca mais (sinta|tenha))/, msg: 'Promessa sensacionalista ("segredo que escondem", "cura em segundos", "nunca mais").' },
    { re: /\b(vergonha d[eo]|feio|feia|horrivel|ultima chance|so hoje|vagas limitadas|corra)\b/, msg: 'Apelo a vergonha, medo ou escassez: não entra em conteúdo de saúde.' },
    { re: /\b\d{1,3} ?% (dos|das|de) /, msg: 'Percentual: só com fonte citada.' },
    { re: /\bcomente (agenda|eu quero|quero|sim)\b/, msg: '"Comente AGENDA": comum em guias, mas confira se o fluxo respeita as regras do seu conselho e não expõe quem comenta.' },
    { re: /\b(durante o procedimento|cirurgia ao vivo|procedimento em andamento|ao vivo da consulta|antes, durante e depois)\b/, by: { odontologia: 'Procedimento em andamento e "antes, durante e depois": só em publicação científica.', medicina: 'Transmitir consultas ou procedimentos em tempo real é vedado (Res. CFM 2.336/2023).' }, msg: 'Procedimento sendo realizado: confira a regra do seu conselho e a autorização do paciente.' }
  ];
  const IMG_RISK_EXTRA = { 'equipamentos ou produtos com marca': ' marca ' };
  const IMG_RISK = {
    'antes e depois': ' antes e depois ',
    'depoimento de paciente': ' depoimento ',
    'procedimento sendo realizado': ' procedimento em andamento ',
    ...IMG_RISK_EXTRA
  };
  function riskScan(text) {
    const t = normTxt(text).replace(/\bsem (precos?|descontos?|promocao|promocoes)\b/g, ' ');
    const ks = councilKeys();
    const out = [];
    RISK_RULES.forEach((r) => {
      if (!r.re.test(t)) return;
      if (r.by) {
        const msgs = (ks.length ? ks : Object.keys(r.by)).map((k) => r.by[k]).filter(Boolean);
        if (msgs.length) msgs.forEach((m) => out.push(m)); else if (r.msg) out.push(r.msg);
      } else out.push(r.msg);
    });
    if (/\bantes e depois\b/.test(t) && ks.includes('odontologia') && cfg.conta === 'clinica') out.push('Sua conta principal é da clínica (pessoa jurídica): antes e depois é proibido nela pela Res. CFO 196/2019.');
    return [...new Set(out)];
  }
  function riskWarn(form, msg) {
    const old = form.querySelector(':scope > .form-warn');
    if (old) old.remove();
    if (form.dataset.tool === 'etica') return;
    const txt = [...form.querySelectorAll('input[type="text"], textarea:not(.js-output)')].map((el) => el.value).join(' \n ');
    const riscos = riskScan(txt);
    if (!riscos.length) return;
    const w = document.createElement('div');
    w.className = 'form-warn';
    w.setAttribute('role', 'status');
    w.innerHTML = `<p><b>Atenção às regras do seu conselho.</b> O que você escreveu menciona:</p><ul>${riscos.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul><p>O prompt orienta a IA a respeitar essas regras. Antes de publicar, passe o resultado pelo Verificador ético.</p>`;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn btn-outline btn-sm'; b.dataset.ico = 'shield';
    b.textContent = 'Abrir o Verificador ético';
    b.addEventListener('click', () => openTool('etica'));
    w.appendChild(b);
    msg.after(w);
  }
  document.getElementById('et-check').addEventListener('click', () => {
    const box = document.getElementById('et-scan');
    const img = document.getElementById('et-imagem').value;
    const texto = document.getElementById('et-texto').value;
    const riscos = riskScan(texto + (IMG_RISK[img] || ''));
    const ident = cfg.registro && normTxt(texto).includes(normTxt(cfg.registro).trim());
    box.hidden = false;
    if (!texto.trim()) { box.className = 'risk-box'; box.textContent = 'Cole um texto para checar.'; return; }
    const extra = ident ? '' : '<li>Não encontrei o seu número de registro no texto. Em peças e anúncios, a identificação profissional é obrigatória (na bio do perfil ela já vale para posts orgânicos; em imagens compartilháveis, coloque na própria imagem).</li>';
    if (!riscos.length && ident) { box.className = 'risk-box ok'; box.textContent = 'Nenhum termo de risco encontrado na checagem rápida. Ela olha só palavras-chave; para uma revisão completa, gere o prompt de revisão.'; return; }
    box.className = 'risk-box';
    box.innerHTML = `<b>Pontos para revisar (checagem por palavras-chave):</b><ul>${riscos.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}${extra}</ul>`;
  });

  function renderCouncil() {
    const box = document.getElementById('council-box');
    const cs = councilObjs();
    if (!cs.length) {
      box.innerHTML = '<div class="council"><h4>Escolha o tipo de profissional</h4><p class="norma">Em "Comece aqui", passo 2, escolha o tipo de profissional para ver as regras do seu conselho.</p><button type="button" class="btn btn-outline btn-sm" id="cb-config">Ir para "Comece aqui"</button></div>';
      document.getElementById('cb-config').addEventListener('click', () => openTool('config'));
      return;
    }
    box.innerHTML = cs.map((c) => `<div class="council">
      <h4>${escapeHtml(c.label)} · ${escapeHtml(c.conselho)}</h4>
      <p class="norma">${escapeHtml(c.norma)}</p>
      <div class="council-cols">
        <div class="council-col pode"><h5>Pode, com cuidado</h5><ul>${c.pode.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>
        <div class="council-col nao"><h5>Não pode</h5><ul>${c.nao.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>
      </div>
      <p class="ident"><b>Identificação obrigatória:</b> ${escapeHtml(c.ident)}</p>
      <p class="aviso">${escapeHtml(c.extra)}</p>
      <p class="fontes">Fontes: ${c.fontes.map(([t, u]) => `<a href="${escapeHtml(u)}" target="_blank" rel="noopener">${escapeHtml(t)}</a>`).join(' ')}</p>
    </div>`).join('') + `<div class="council"><h4>Vale para todas as profissões</h4><ul style="margin:0;padding-left:18px;font-size:.88rem;display:grid;gap:5px">${REGRAS_GERAIS.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}${isMental() ? `<li>${escapeHtml(SAUDE_MENTAL)}</li>` : ''}${cfg.profissional === 'multi' ? '<li>Peças institucionais da clínica seguem a regra mais restritiva entre os conselhos envolvidos; cada profissional se identifica com o próprio registro.</li>' : ''}</ul><p class="aviso">Resumo conferido em outubro de 2026. Normas mudam: confirme no site do seu conselho antes de campanhas e formatos novos.</p></div>`;
  }

  // ===================== Funil e prioridades =====================
  function computeRota() {
    const o = objInfo().rota;
    const p = PROF_ROTA[cfg.profissional] || [];
    return [...new Set([...o.slice(0, 3), ...p, ...o.slice(3)])].slice(0, 6);
  }
  function openTool(id) {
    if (id === 'config') {
      configEl.classList.remove('collapsed');
      syncCollapseUI();
      configEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (id === 'ajustes') { const aj = document.getElementById('ajustes'); aj.open = true; aj.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const el = document.querySelector(`.tool[data-id="${id}"]`);
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function openAnchor(tool, anchor) {
    openTool(tool);
    if (anchor) setTimeout(() => { const el = document.getElementById(anchor); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); const f = el.querySelector && el.querySelector('input,select,textarea'); if (f) f.focus({ preventScroll: true }); } }, 60);
  }
  function renderFunnel() {
    const rota = computeRota();
    const sem = weekStats(mondayISO());
    const box = document.getElementById('funil');
    document.getElementById('rota-titulo').textContent = `Seu funil — ${objInfo().label}${profInfo() ? ' · ' + profInfo().label : ''}`;
    document.getElementById('rota-porque').textContent = objInfo().porque;
    box.innerHTML = '';
    const chip = (id) => {
      const b = document.createElement('button');
      b.type = 'button';
      const idx = rota.indexOf(id);
      if (idx >= 0) { b.classList.add('prio'); const n = document.createElement('span'); n.className = 'n'; n.textContent = String(idx + 1); b.appendChild(n); }
      b.appendChild(document.createTextNode(TOOL_NAMES[id] || id));
      b.addEventListener('click', () => openTool(id));
      return b;
    };
    FUNNEL_STAGES.forEach((st) => {
      const row = document.createElement('div');
      row.className = 'f-row';
      const seg = document.createElement('div');
      seg.className = 'f-seg';
      if (st.num) {
        seg.innerHTML = `<em class="f-name">${st.nome}</em><b>${sem[st.num] || 0}</b><span>${st.numLabel}</span>`;
        seg.setAttribute('aria-label', `${st.nome}: ${sem[st.num] || 0} ${st.numLabel} nesta semana`);
      } else {
        seg.innerHTML = `<em class="f-name">${st.nome}</em><b>★</b><span>base do funil</span>`;
      }
      const info = document.createElement('div');
      info.className = 'f-info';
      info.innerHTML = `<h4>${st.nome}</h4><p>${st.desc}</p>`;
      const chips = document.createElement('div');
      chips.className = 'f-chips';
      st.tools.forEach((id) => chips.appendChild(chip(id)));
      info.appendChild(chips);
      row.append(seg, info);
      box.appendChild(row);
    });
    const loop = document.createElement('div');
    loop.className = 'f-loop';
    loop.innerHTML = '<span>Toda semana e a cada 2 semanas:</span>';
    const chipsL = document.createElement('div');
    chipsL.className = 'f-chips';
    LOOP_TOOLS.forEach((id) => chipsL.appendChild(chip(id)));
    loop.appendChild(chipsL);
    const pb = document.createElement('button');
    pb.type = 'button';
    pb.innerHTML = '<span class="n">18</span>Gerar o playbook da clínica';
    pb.addEventListener('click', () => openTool('ebook'));
    loop.appendChild(pb);
    box.appendChild(loop);

    // Selo de prioridade em cada ferramenta
    document.querySelectorAll('.tool[data-id]').forEach((el) => {
      const id = el.dataset.id;
      const idx = rota.indexOf(id);
      el.classList.toggle('is-prio', idx >= 0);
      const h3 = el.querySelector('.tool-title h3');
      const old = h3.querySelector('.badge-prio');
      if (old) old.remove();
      if (idx >= 0) { const b = document.createElement('span'); b.className = 'badge-prio'; b.textContent = `Prioridade ${idx + 1}`; h3.appendChild(b); }
    });
  }

  // ===================== Configuração: salvar e reagir =====================
  function onConfigChange() {
    cfg = readConfig();
    const ok = storeSet(STORE_KEY, cfg);
    document.getElementById('cfg-status').textContent = ok ? 'Salvo automaticamente neste navegador.' : 'Este navegador não permite salvar: os dados valem só enquanto a página estiver aberta.';
    updatePlanUI();
    prefillFields(false);
    renderCouncil();
    renderBench();
    renderObjHint();
    renderOrigemOptions();
    notifyData();
  }

  // Avisos no "Comece aqui": conflitos entre objetivo, profissão e realidade
  function renderObjHint() {
    const box = document.getElementById('obj-hint');
    const avisos = [];
    if (!cfg.profissional && (cfg.metaFrase || cfg.especialidade)) avisos.push(['info', 'Escolha o tipo de profissional no passo 2: as regras de publicidade mudam de um conselho para outro.']);
    const riscos = riskScan(cfg.metaFrase + ' ' + cfg.transformacao + ' ' + cfg.servicos);
    if (riscos.length) avisos.push(['warn', `Seu objetivo ou perfil menciona algo que o seu conselho restringe: ${riscos.join(' ')}`]);
    if ((cfg.objetivo === 'autoridade' || cfg.objetivo === 'online') && cfg.tempo === 'ate1' && cfg.produtor === 'eu') avisos.push(['info', 'Com até 1 hora por semana e produção própria, autoridade e atendimento online demoram mais. Comece com 2 conteúdos por semana ou delegue parte da produção com o Briefing para terceiros.']);
    if (cfg.objetivo === 'online' && (cfg.atendimento || []).indexOf('online') < 0) avisos.push(['warn', 'Seu objetivo é atender online, mas o atendimento online não está marcado no passo 2. Deseja ajustar?']);
    if (cfg.objetivo === 'online' && ['dentista', 'fisioterapeuta'].includes(cfg.profissional)) avisos.push(['info', 'Atendimento a distância tem regras próprias no seu conselho. Confirme o que pode ser feito online antes de divulgar.']);
    if (cfg.profissional === 'multi' && !(cfg.multiProf || []).length) avisos.push(['warn', 'Marque as profissões da clínica para carregar as regras de cada conselho.']);
    if (!avisos.length) { box.hidden = true; box.innerHTML = ''; return; }
    const warn = avisos.some((a) => a[0] === 'warn');
    box.className = 'obj-hint ' + (warn ? 'warn' : 'info');
    box.innerHTML = `${warn ? '<p><b>Seu objetivo parece diferente da configuração. Deseja ajustar?</b></p>' : ''}<ul style="margin:0;padding-left:18px">${avisos.map((a) => `<li>${escapeHtml(a[1])}</li>`).join('')}</ul>`;
    if (riscos.length) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn-outline btn-sm'; b.style.marginTop = '8px';
      b.textContent = 'Ver as regras do meu conselho';
      b.addEventListener('click', () => openTool('etica'));
      box.appendChild(b);
    }
    box.hidden = false;
  }

  // ===================== Modos de IA e API =====================
  const API_MODELS = {
    'claude-sonnet-5-5': { nome: 'Sonnet 5.5', inp: 2, out: 10 },
    'claude-opus-5-5': { nome: 'Opus 5.5', inp: 4, out: 20 },
    'claude-haiku-4-5': { nome: 'Haiku 4.5', inp: 1, out: 5 }
  };
  const MODE_NAMES = { free: 'Claude gratuito', pro: 'Claude Pro ou Max', api: 'API da Anthropic' };
  const apiKeyEl = document.getElementById('api-key');
  const apiRememberEl = document.getElementById('api-remember');
  const apiModelEl = document.getElementById('api-model');
  const apiSearchEl = document.getElementById('api-search');
  (function loadApi() {
    const k = storeGet(KEY_STORE, '');
    if (k) { apiKeyEl.value = k; apiRememberEl.checked = true; }
    const p = storeGet(APIPREFS_KEY, null);
    if (p) { if (API_MODELS[p.model]) apiModelEl.value = p.model; apiSearchEl.checked = p.search !== false; }
  })();
  function persistApi() {
    if (apiRememberEl.checked && apiKeyEl.value.trim()) storeSet(KEY_STORE, apiKeyEl.value.trim()); else storeDel(KEY_STORE);
    storeSet(APIPREFS_KEY, { model: apiModelEl.value, search: apiSearchEl.checked });
    const k = apiKeyEl.value.trim();
    document.getElementById('api-status').textContent = !k ? 'Nenhuma chave informada.'
      : (k.startsWith('sk-ant-') ? (apiRememberEl.checked ? 'Chave pronta e lembrada neste navegador.' : 'Chave pronta (vale só enquanto a página estiver aberta).')
        : 'Esta chave não parece uma chave da Anthropic (elas começam com sk-ant-).');
  }
  [apiKeyEl, apiRememberEl, apiModelEl, apiSearchEl].forEach((el) => el.addEventListener('change', persistApi));
  apiKeyEl.addEventListener('input', persistApi);
  function updatePlanUI() {
    const plano = cfg.plano || 'free';
    document.getElementById('mode-status').textContent = `Modo atual: ${MODE_NAMES[plano]}.`;
    document.getElementById('kit-block').hidden = plano === 'api';
    document.getElementById('plan-pro').hidden = plano !== 'pro';
    document.getElementById('plan-api').hidden = plano !== 'api';
    document.querySelectorAll('.js-run-api').forEach((b) => { b.hidden = plano !== 'api'; });
    document.querySelectorAll('.pro-tip').forEach((t) => { t.hidden = plano !== 'pro'; });
    document.querySelectorAll('a[href="https://claude.ai/new"]').forEach((a) => {
      const txt = plano === 'free' ? 'Abrir Claude.ai gratuito' : 'Abrir no Claude.ai';
      [...a.childNodes].forEach((n) => { if (n.nodeType === 3) n.remove(); });
      a.appendChild(document.createTextNode(txt));
    });
    if (plano === 'api') persistApi();
  }

  function mdInline(s) {
    return s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function mdToHtml(md) {
    const lines = escapeHtml(md).split('\n');
    let html = '', i = 0, para = [];
    const flush = () => { if (para.length) { html += `<p>${mdInline(para.join(' '))}</p>`; para = []; } };
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) { flush(); i++; continue; }
      if (/^\|.*\|$/.test(t) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1].trim())) {
        flush();
        const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => mdInline(c.trim()));
        let tb = '<div class="tbl"><table><thead><tr>' + cells(t).map((c) => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
        i += 2;
        while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) { tb += '<tr>' + cells(lines[i]).map((c) => `<td>${c}</td>`).join('') + '</tr>'; i++; }
        html += tb + '</tbody></table></div>';
        continue;
      }
      const hm = t.match(/^(#{1,4})\s+(.*)$/);
      if (hm) { flush(); const lv = Math.min(hm[1].length + 1, 4); html += `<h${lv}>${mdInline(hm[2])}</h${lv}>`; i++; continue; }
      if (/^([-*•]|\d+[.)])\s+/.test(t)) {
        flush();
        const ordered = /^\d+[.)]\s+/.test(t);
        html += ordered ? '<ol>' : '<ul>';
        while (i < lines.length && /^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) { html += `<li>${mdInline(lines[i].trim().replace(/^([-*•]|\d+[.)])\s+/, ''))}</li>`; i++; }
        html += ordered ? '</ol>' : '</ul>';
        continue;
      }
      if (/^(-{3,}|\*{3,})$/.test(t)) { flush(); html += '<hr>'; i++; continue; }
      para.push(t); i++;
    }
    flush();
    return html;
  }
  function friendlyApiError(status, data) {
    const msg = (data && data.error && data.error.message) || '';
    if (status === 401) return 'Chave da API inválida ou revogada. Confira a chave no Claude Console.';
    if (/credit balance|billing/i.test(msg)) return 'Saldo de créditos insuficiente na sua conta da API. Adicione créditos em Billing, no Claude Console.';
    if (/web search/i.test(msg)) return 'A pesquisa na web está desativada na sua organização. Desmarque "Permitir pesquisa na web" ou ative-a no Claude Console.';
    if (status === 429) return 'Limite de uso da API atingido no momento. Espere um minuto e tente de novo.';
    if (status === 529 || status === 503) return 'A API está sobrecarregada agora. Tente novamente em instantes.';
    if (status === 403) return 'Sem permissão para usar a API com esta chave. Confira a chave e a organização no Claude Console.';
    return `A API retornou um erro (${status}). ${msg}`;
  }
  async function callClaude(messages) {
    const key = apiKeyEl.value.trim();
    const model = apiModelEl.value;
    const base = { model, max_tokens: 8000 };
    if (apiSearchEl.checked) base.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }];
    let content = [];
    const usage = { inp: 0, out: 0, searches: 0 };
    for (let round = 0; round < 4; round++) {
      const msgs = round === 0 ? messages : messages.concat([{ role: 'assistant', content }]);
      let res;
      try {
        res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
          body: JSON.stringify({ ...base, messages: msgs })
        });
      } catch (e) {
        throw new Error('Não foi possível conectar à API da Anthropic. Verifique sua internet ou se alguma extensão do navegador está bloqueando a conexão.');
      }
      let data = null;
      try { data = await res.json(); } catch (e) { /* noop */ }
      if (!res.ok) throw new Error(friendlyApiError(res.status, data));
      const u = data.usage || {};
      usage.inp += (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
      usage.out += u.output_tokens || 0;
      usage.searches += (u.server_tool_use && u.server_tool_use.web_search_requests) || 0;
      content = content.concat(data.content || []);
      if (data.stop_reason !== 'pause_turn') return { content, usage, stop: data.stop_reason, model };
    }
    return { content, usage, stop: 'pause_turn', model };
  }
  function renderAnswer(result) {
    let text = '', gap = false;
    result.content.forEach((b) => {
      if (b.type === 'text') { text += (gap && text ? '\n\n' : '') + b.text; gap = false; }
      else if (b.type !== 'thinking' && b.type !== 'redacted_thinking') gap = true;
    });
    const sources = new Map();
    result.content.forEach((b) => { if (b.type === 'text' && Array.isArray(b.citations)) b.citations.forEach((c) => { if (c.url && !sources.has(c.url)) sources.set(c.url, c.title || c.url); }); });
    if (!sources.size) result.content.forEach((b) => { if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) b.content.slice(0, 8).forEach((r) => { if (r.url && !sources.has(r.url)) sources.set(r.url, r.title || r.url); }); });
    let html = mdToHtml(text || '(A resposta veio vazia. Tente novamente.)');
    if (result.stop === 'max_tokens') html += '<p class="api-meta">A resposta atingiu o limite de tamanho. Peça "continue" no campo abaixo.</p>';
    if (sources.size) html += '<div class="api-sources"><b>Fontes</b><ol>' + [...sources].map(([url, title]) => `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(title)}</a></li>`).join('') + '</ol></div>';
    const m = API_MODELS[result.model] || API_MODELS['claude-sonnet-5-5'];
    const cost = (result.usage.inp * m.inp + result.usage.out * m.out) / 1e6 + result.usage.searches * 0.01;
    html += `<div class="api-meta">${m.nome} · custo aproximado US$ ${cost.toFixed(4).replace('.', ',')} · ${result.usage.inp.toLocaleString('pt-BR')} tokens de entrada · ${result.usage.out.toLocaleString('pt-BR')} de saída${result.usage.searches ? ' · ' + result.usage.searches + ' pesquisa(s)' : ''}</div>`;
    return { html, text };
  }
  async function runApiFor(block, followUp) {
    const area = block.querySelector('.api-area');
    const prompt = block.querySelector('.js-output').value;
    if (!apiKeyEl.value.trim()) {
      area.innerHTML = '<div class="api-error">Informe sua chave da API em Configurações → Como você usa a IA → API da Anthropic.</div>';
      return;
    }
    if (!followUp) block._conv = { messages: [{ role: 'user', content: prompt }], html: '', text: '' };
    else { block._conv.messages.push({ role: 'user', content: followUp }); block._conv.html += `<div class="turn-user">${escapeHtml(followUp)}</div>`; }
    const conv = block._conv;
    const runBtn = block.querySelector('.js-run-api');
    runBtn.disabled = true;
    area.innerHTML = (conv.html ? `<div class="api-result">${conv.html}</div>` : '') + `<div class="api-loading"><span class="spinner" aria-hidden="true"></span>Gerando resposta${apiSearchEl.checked ? ' e pesquisando na web' : ''}… pode levar de 30 segundos a 2 minutos.</div>`;
    try {
      const result = await callClaude(conv.messages);
      conv.messages.push({ role: 'assistant', content: result.content });
      const r = renderAnswer(result);
      conv.html += r.html;
      conv.text += (conv.text ? '\n\n' : '') + r.text;
      const tool = block.closest('form').dataset.tool;
      const canSave = SAVE_TOOLS.includes(tool);
      area.innerHTML = `<div class="api-result">${conv.html}</div>
        <div class="api-follow">
          <label class="visually-hidden" for="follow-${tool}">Pedir ajuste</label>
          <input type="text" id="follow-${tool}" placeholder='Peça um ajuste: "deixe mais simples", "refaça o item 3"...'>
          <button type="button" class="btn btn-teal btn-sm js-follow" data-ico="send">Enviar</button>
        </div>
        <div class="output-actions"><button type="button" class="btn btn-outline btn-sm js-copy-answer" data-ico="copy">Copiar resposta</button>${canSave ? '<button type="button" class="btn btn-outline btn-sm js-save-answer" data-ico="save">Guardar como versão final</button>' : ''}</div>`;
      const input = area.querySelector('.api-follow input');
      const send = () => { const v = input.value.trim(); if (v) runApiFor(block, v); };
      area.querySelector('.js-follow').addEventListener('click', send);
      input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); send(); } });
      area.querySelector('.js-copy-answer').addEventListener('click', (ev) => copyText(conv.text, ev.currentTarget));
      const sv = area.querySelector('.js-save-answer');
      if (sv) sv.addEventListener('click', () => {
        const ta = document.getElementById('save-' + tool);
        ta.value = conv.text;
        ta.dispatchEvent(new Event('input'));
        ta.closest('details').open = true;
        sv.textContent = 'Guardado ✓';
      });
    } catch (err) {
      if (followUp) conv.messages.pop();
      area.innerHTML = (conv.html ? `<div class="api-result">${conv.html}</div>` : '') + `<div class="api-error">${escapeHtml(err.message)}</div>`;
    } finally {
      runBtn.disabled = false;
    }
  }

  // ===================== Projeto no Claude.ai =====================
  function projectInstructions() {
    return `Você é meu copiloto de marketing ético e relacionamento com pacientes dentro do projeto CliniLoop.

- Use o arquivo "cliniloop-consultorio.md", no conhecimento do projeto, como fonte do meu perfil, das regras do meu conselho e das decisões que já tomei (público, persona, marca, nicho, pautas, atendimento). Não peça essas informações de novo.
- Siga sempre as regras do conselho descritas no arquivo, a LGPD e as políticas da Meta e do Google. Se algo puder ferir essas regras, não sugira ou marque [VERIFICAR NO CONSELHO].
- Nunca use, peça ou invente dados que identifiquem pacientes. Não invente números, títulos ou casos: marque [CONFIRMAR] ou [ESTIMATIVA].
- Sem promessa de resultado, sem superlativos, sem medo e sem afirmar condição de saúde de quem lê.
- Quando eu colar um prompt gerado pelo CliniLoop, siga-o e complemente com o arquivo do projeto.
- Seja direto e prático. Responda em português do Brasil.`;
  }
  function projectKnowledge() {
    const res = resultados();
    const s = weekStats(mondayISO());
    return `# Consultório no CliniLoop

Atualizado em ${fmtDate(todayISO())}.

## Perfil do consultório
- Profissional: ${profLabel()}
- Tipo de conta: ${CONTA[cfg.conta] || CONTA.profissional}
- Nome: ${cfg.nome || '(não informado)'} · Registro: ${cfg.registro || '(não informado)'}
- Especialidade ou área: ${cfg.especialidade || '(não informada)'}
- Cidade e bairro: ${cfg.cidade || '(não informado)'}
- Atendimento: ${(cfg.atendimento || []).join(', ')} · pagamento: ${cfg.pagamento}
- Serviços: ${cfg.servicos || '(não informados)'}
- Público ideal: ${cfg.publico || '(não informado)'}
- Transformação: ${cfg.transformacao || '(não informada)'}
- Baldes de conteúdo: ${cfg.baldes || '(não definidos)'}
- Canais: ${(cfg.canais || []).join(', ')} ${cfg.arroba || ''}
- Objetivo: ${objInfo().label}${cfg.metaFrase ? ' — ' + cfg.metaFrase : ''}
- Realidade: ${(TEMPO[cfg.tempo] || TEMPO['2a3']).label}; quem produz: ${PRODUTOR[cfg.produtor]}; ${CAMERA[cfg.camera]}
- Formação e diferenciais: ${cfg.sobre || '(não informado)'}

## Regras do conselho
${councilObjs().map((c) => `### ${c.conselho}\n${c.norma}\n- Identificação: ${c.ident}\n- Pode: ${c.pode.join(' ')}\n- Não pode: ${c.nao.join(' ')}\n- ${c.extra}`).join('\n\n') || '(tipo de profissional não definido)'}
${isMental() ? '\n- ' + SAUDE_MENTAL : ''}
${REGRAS_GERAIS.map((g) => '- ' + g).join('\n')}

## Método
${METODO.bases.map(([n, a, d]) => `- ${n} (${a}): ${d}`).join('\n')}
- Fluxo de cada peça: ${METODO.fluxo.join(' → ')}
- ${METODO.aviso}

## Decisões guardadas
${SAVE_TOOLS.filter((id) => res[id]).map((id) => `### ${SAVE_TITLES[id]} (${fmtDate(res[id].d)})\n${res[id].t}`).join('\n\n') || '(nenhuma ainda)'}

## Esta semana (contagens, sem dados de pacientes)
- Conteúdos publicados: ${s.conteudos} · novos contatos: ${s.contatos} · agendados: ${s.agendados} · avaliados: ${s.avaliados} · iniciaram tratamento: ${s.iniciados}
`;
  }
  document.getElementById('kit-copy').addEventListener('click', (e) => copyText(projectInstructions(), e.currentTarget));
  document.getElementById('kit-download').addEventListener('click', () => {
    download('cliniloop-consultorio.md', projectKnowledge(), 'text/markdown;charset=utf-8');
  });

  // ===================== Rastreador de pacientes =====================
  // Origens do livro (Parte 11). Campanhas e impulsionamentos registrados entram como origem própria.
  const ORIGENS = ['Instagram orgânico', 'Google orgânico (busca ou Perfil da Empresa)', 'Meta Ads', 'Google Ads', 'YouTube', 'TikTok', 'Indicação de colega', 'Indicação de paciente', 'Retorno (paciente antigo)', 'Doctoralia ou plataforma', 'Site', 'Passou em frente', 'Outro'];
  const campOrigem = (c) => (c.tipo === 'Impulsionamento' ? 'Impulsionamento: ' : 'Campanha: ') + c.nome;
  const CLIN_RE = /\b(diagnost\w*|cid\b|exame|exames|medicament\w*|remedio|doenca|transtorno|depress\w*|ansiedade|cancer|tumor|hiv|gravid\w*|cirurgia|fratura|hernia|laudo|receita)/;
  function renderOrigemOptions() {
    const sel = document.getElementById('t-origem');
    const cur = sel.value;
    sel.innerHTML = ORIGENS.map((o) => `<option>${escapeHtml(o)}</option>`).join('') +
      campanhas.map((c) => `<option value="${escapeHtml(campOrigem(c))}">${escapeHtml(campOrigem(c))}</option>`).join('');
    if ([...sel.options].some((o) => o.value === cur)) sel.value = cur;
    const opts = '<option value="">(nenhum)</option>' + colegas.map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.nome)}</option>`).join('');
    ['t-colega', 'cm-colega'].forEach((id) => {
      const s = document.getElementById(id);
      const v = s.value;
      s.innerHTML = id === 'cm-colega' ? opts.replace('(nenhum)', '(colega genérico)') : opts;
      if ([...s.options].some((o) => o.value === v)) s.value = v;
    });
    document.getElementById('t-colega-wrap').hidden = sel.value !== 'Indicação de colega';
  }
  document.getElementById('t-origem').addEventListener('change', () => { document.getElementById('t-colega-wrap').hidden = document.getElementById('t-origem').value !== 'Indicação de colega'; });
  const etOpt = (e, sel) => `<option value="${e}"${sel ? ' selected' : ''}>${etapaLabel(e)}</option>`;
  function renderEtapaOptions() {
    ['t-etapa', 't-filtro'].forEach((id) => {
      const el = document.getElementById(id);
      const v = el.value;
      el.innerHTML = id === 't-etapa' ? ETAPAS.filter((e) => e !== 'Encerrado').map((e) => etOpt(e)).join('')
        : '<option value="">Todas as etapas ativas</option>' + ETAPAS.map((e) => etOpt(e)).join('') + '<option value="*">Todos os contatos</option>';
      if ([...el.options].some((o) => o.value === v)) el.value = v;
    });
  }
  renderEtapaOptions();
  // Próximo passo típico da etapa (Parte 11), sugerido quando o campo está vazio
  document.getElementById('t-etapa').addEventListener('change', (e) => {
    const ps = document.getElementById('t-passo');
    if (!ps.value.trim() || Object.values(PASSO_TIPICO).includes(ps.value)) ps.value = PASSO_TIPICO[e.target.value] || '';
  });
  function diasDesde(d) { return d ? Math.round((new Date(todayISO() + 'T12:00') - new Date(d + 'T12:00')) / 86400000) : 0; }
  // Planos sem decisão (2, 7 e 15 dias) e contatos que não agendaram (1, 3 e 7 dias)
  function marcoParado(p) {
    if (p.etapa === 'Plano proposto' && !semPacote()) {
      const n = diasDesde((p.hist || {})['Plano proposto']);
      const m = [15, 7, 2].find((x) => n >= x);
      return m ? { n, m, txt: `Plano sem decisão há ${n} dia${n === 1 ? '' : 's'}: contato de ${m} dias` } : null;
    }
    if (p.etapa === 'Novo' || p.etapa === 'Em conversa') {
      const n = diasDesde(p.criado);
      const m = [7, 3, 1].find((x) => n >= x);
      return m ? { n, m, txt: `Sem agendar há ${n} dia${n === 1 ? '' : 's'}: retomada de ${m} dia${m === 1 ? '' : 's'}, com algo útil e sem pressão` } : null;
    }
    return null;
  }
  document.getElementById('t-notas').addEventListener('input', (e) => { document.getElementById('t-notas-aviso').hidden = !CLIN_RE.test(normTxt(e.target.value)); });

  function fillHist(p, etapa) {
    p.hist = p.hist || {};
    const idx = ETAPAS.indexOf(etapa);
    const hoje = todayISO();
    if (etapa === 'Encerrado') { if (!p.hist.Encerrado) p.hist.Encerrado = hoje; return; }
    for (let i = 0; i <= idx; i++) if (!p.hist[ETAPAS[i]]) p.hist[ETAPAS[i]] = hoje;
  }
  document.getElementById('tracker-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validate(form)) return;
    const v = (id) => document.getElementById(id).value.trim();
    const hoje = todayISO();
    const p = {
      id: uid(), nome: v('t-nome'), tel: v('t-tel'), canal: v('t-canal'), servico: v('t-servico'), origem: v('t-origem'),
      colega: v('t-origem') === 'Indicação de colega' ? v('t-colega') : '', prof: v('t-prof'), etapa: v('t-etapa') || 'Novo',
      resultado: '', motivo: '', passo: v('t-passo'), data: v('t-data'), valor: v('t-valor'), notas: v('t-notas'),
      consent: {
        atendimento: document.getElementById('t-c-atend').checked ? hoje : '',
        lembretes: document.getElementById('t-c-lemb').checked ? hoje : '',
        conteudo: document.getElementById('t-c-cont').checked ? hoje : ''
      },
      revogado: {}, criado: hoje, atualizado: hoje, hist: {}, ativ: []
    };
    fillHist(p, p.etapa);
    pacientes.unshift(p);
    savePac();
    ['t-nome', 't-tel', 't-servico', 't-passo', 't-data', 't-valor', 't-notas'].forEach((id) => { document.getElementById(id).value = ''; });
    document.getElementById('t-notas-aviso').hidden = true;
    const msg = formMsg(form);
    msg.className = 'form-msg ok';
    msg.textContent = `✓ ${p.nome} adicionado(a) na etapa ${p.etapa}.`;
    renderTracker();
  });

  function isLate(p) { return p.data && p.etapa !== 'Encerrado' && p.data <= todayISO(); }
  function renderTracker() {
    renderEtapaOptions();
    const counts = ETAPAS.map((e) => [e, pacientes.filter((p) => p.etapa === e).length]);
    document.getElementById('t-funnel').innerHTML = counts.map(([e, n]) => `<div><b>${n}</b><span>${etapaLabel(e)}</span></div>`).join('');
    const filtro = document.getElementById('t-filtro').value;
    const busca = normTxt(document.getElementById('t-busca').value).trim();
    let lista = pacientes.filter((p) => (filtro === '*' ? true : filtro ? p.etapa === filtro : p.etapa !== 'Encerrado'));
    if (busca) lista = lista.filter((p) => normTxt(p.nome + ' ' + p.servico + ' ' + p.origem).includes(busca));
    lista.sort((a, b) => (isLate(b) - isLate(a)) || String(a.data || '9999').localeCompare(String(b.data || '9999')));
    const box = document.getElementById('t-list');
    if (!lista.length) { box.innerHTML = `<div class="track-empty">${pacientes.length ? 'Nenhum contato nesta visão.' : 'Nenhum contato registrado ainda. Use o formulário acima a cada nova mensagem ou ligação.'}</div>`; return; }
    box.innerHTML = '';
    lista.slice(0, 200).forEach((p) => {
      const el = document.createElement('div');
      el.className = 'track-item pac' + (isLate(p) ? ' overdue' : '');
      const col = p.colega && colegaPorId(p.colega);
      const ult = (p.ativ || []).slice(-1)[0];
      const parado = marcoParado(p);
      const tel = String(p.tel || '').replace(/\D/g, '');
      const wa = tel.length >= 10 ? `https://wa.me/${tel.length <= 11 ? '55' + tel : tel}` : '';
      el.innerHTML = `
        <div>
          <h5>${escapeHtml(p.nome)}${p.servico ? ' · ' + escapeHtml(p.servico) : ''}</h5>
          <div class="meta">${escapeHtml(p.origem || '')}${col ? ' (' + escapeHtml(col.nome) + ')' : ''}${p.prof ? ' · ' + escapeHtml(p.prof) : ''} · desde ${fmtShort(p.criado)}${p.valor ? ' · plano R$ ' + escapeHtml(p.valor) : ''}</div>
          <div class="consents">${Object.keys(CONSENT).map((k) => `<button type="button" class="cbadge${p.consent && p.consent[k] ? ' on' : ''}" data-k="${k}" title="${p.consent && p.consent[k] ? 'Consentiu em ' + fmtDate(p.consent[k]) + '. Clique para revogar.' : (p.revogado && p.revogado[k] ? 'Revogado em ' + fmtDate(p.revogado[k]) + '. ' : '') + 'Clique para registrar consentimento hoje.'}">${CONSENT[k]}${p.consent && p.consent[k] ? ' ✓' : ''}</button>`).join('')}</div>
        </div>
        <div class="track-controls">
          <select class="js-etapa" aria-label="Etapa">${ETAPAS.map((e) => etOpt(e, e === p.etapa)).join('')}</select>
          ${wa ? `<a class="icon-btn wa" href="${wa}" target="_blank" rel="noopener" title="Abrir WhatsApp" aria-label="Abrir WhatsApp">✆</a>` : ''}
          <button type="button" class="icon-btn js-del" title="Excluir" aria-label="Excluir contato">×</button>
        </div>
        <div class="pac-row">
          <label>Próximo passo <input type="text" class="js-passo" value="${escapeHtml(p.passo || '')}"></label>
          <label>Data <input type="date" class="js-data" value="${escapeHtml(p.data || '')}"></label>
          ${p.etapa === 'Encerrado' ? `<label>Resultado <select class="js-res">${RESULTADOS.map((r) => `<option${r === p.resultado ? ' selected' : ''}>${r}</option>`).join('')}</select></label>
          <label>Motivo <input type="text" class="js-motivo" value="${escapeHtml(p.motivo || '')}" placeholder="Ex: preço, distância"></label>` : ''}
        </div>
        <div class="pac-row">
          <label>Atividade <select class="js-ativ">${ATIVIDADES.map((a) => `<option>${a}</option>`).join('')}</select></label>
          <label>Responsável <input type="text" class="js-resp" list="lista-equipe" value="${escapeHtml(p.prof || cfg.nome || '')}"></label>
          <button type="button" class="btn btn-outline btn-sm js-ativ-add">Registrar</button>
          <span class="meta">${ult ? `Última: ${escapeHtml(ult.t)} em ${fmtShort(ult.d)}${ult.r ? ' (' + escapeHtml(ult.r) + ')' : ''}` : 'Sem atividade registrada'}${isLate(p) ? ' · <span class="late">próximo passo vencido</span>' : ''}${parado ? ` · <span class="parado">${escapeHtml(parado.txt)}</span>` : ''}</span>
        </div>
        ${p.notas ? `<div class="notes">${escapeHtml(p.notas)}</div>` : ''}`;
      const upd = (fn) => { fn(); p.atualizado = todayISO(); savePac(); };
      el.querySelector('.js-etapa').addEventListener('change', (ev) => {
        upd(() => {
          const antes = p.passo;
          p.etapa = ev.target.value;
          fillHist(p, p.etapa);
          if (!String(antes || '').trim() || Object.values(PASSO_TIPICO).includes(antes)) {
            p.passo = PASSO_TIPICO[p.etapa] || p.passo;
            if (p.etapa === 'Plano proposto' && !semPacote() && (!p.data || p.data < todayISO())) p.data = addDays(todayISO(), 2);
          }
          if (p.etapa === 'Encerrado' && !p.resultado) p.resultado = 'Alta e vínculo';
          p.ativ = (p.ativ || []).concat([{ d: todayISO(), t: 'Etapa: ' + p.etapa, r: '' }]).slice(-50);
        });
        renderTracker();
      });
      el.querySelector('.js-passo').addEventListener('change', (ev) => upd(() => { p.passo = ev.target.value.slice(0, 300); }));
      el.querySelector('.js-data').addEventListener('change', (ev) => { upd(() => { p.data = ev.target.value; }); renderTracker(); });
      const rs = el.querySelector('.js-res'); if (rs) rs.addEventListener('change', (ev) => upd(() => { p.resultado = ev.target.value; }));
      const mt = el.querySelector('.js-motivo'); if (mt) mt.addEventListener('change', (ev) => upd(() => { p.motivo = ev.target.value.slice(0, 200); }));
      el.querySelector('.js-ativ-add').addEventListener('click', () => {
        upd(() => { p.ativ = (p.ativ || []).concat([{ d: todayISO(), t: el.querySelector('.js-ativ').value, r: el.querySelector('.js-resp').value.slice(0, 80) }]).slice(-50); });
        renderTracker();
      });
      el.querySelectorAll('.cbadge').forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.k;
        p.consent = p.consent || {}; p.revogado = p.revogado || {};
        if (p.consent[k]) {
          if (!confirm(`Registrar que ${p.nome} revogou o consentimento para "${CONSENT[k]}"?`)) return;
          upd(() => { p.consent[k] = ''; p.revogado[k] = todayISO(); });
        } else upd(() => { p.consent[k] = todayISO(); delete p.revogado[k]; });
        renderTracker();
      }));
      el.querySelector('.js-del').addEventListener('click', () => {
        if (!confirm(`Excluir ${p.nome} do rastreador? Isso não pode ser desfeito.`)) return;
        pacientes = pacientes.filter((x) => x.id !== p.id);
        savePac(); renderTracker();
      });
      box.appendChild(el);
    });
  }
  document.getElementById('t-filtro').addEventListener('change', renderTracker);
  document.getElementById('t-busca').addEventListener('input', renderTracker);

  function csvCell(v) { const s = String(v == null ? '' : v); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  document.getElementById('t-csv').addEventListener('click', () => {
    if (!pacientes.length) { alert('O rastreador está vazio.'); return; }
    const head = ['Nome', 'Telefone', 'Canal', 'Serviço', 'Origem', 'Colega que indicou', 'Profissional', 'Etapa', 'Resultado', 'Motivo', 'Próximo passo', 'Data', 'Valor do plano', 'Consent. atendimento', 'Consent. lembretes', 'Consent. conteúdos', 'Criado', 'Atualizado', 'Observações'];
    const rows = pacientes.map((p) => [p.nome, p.tel, p.canal, p.servico, p.origem, (colegaPorId(p.colega) || {}).nome || '', p.prof, p.etapa, p.resultado, p.motivo, p.passo, p.data, p.valor, (p.consent || {}).atendimento, (p.consent || {}).lembretes, (p.consent || {}).conteudo, p.criado, p.atualizado, p.notas]);
    download(`cliniloop-rastreador-${todayISO()}.csv`, '\ufeff' + [head].concat(rows).map((r) => r.map(csvCell).join(';')).join('\n'), 'text/csv;charset=utf-8');
  });
  function icsEsc(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, ' '); }
  document.getElementById('t-ics').addEventListener('click', () => {
    const itens = pacientes.filter((p) => p.data && p.etapa !== 'Encerrado');
    const cols = colegas.filter((c) => c.prox);
    if (!itens.length && !cols.length) { alert('Nenhum próximo passo com data. Defina datas no rastreador ou na rede de colegas.'); return; }
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ev = (uidv, data, sum, desc) => ['BEGIN:VEVENT', `UID:${uidv}@cliniloop`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${data.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${addDays(data, 1).replace(/-/g, '')}`, `SUMMARY:${icsEsc(sum)}`, `DESCRIPTION:${icsEsc(desc)}`, 'BEGIN:VALARM', 'TRIGGER:PT8H', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(sum)}`, 'END:VALARM', 'END:VEVENT'];
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CliniLoop//PT-BR', 'CALSCALE:GREGORIAN'];
    itens.forEach((p) => lines.push(...ev(p.id, p.data, `${p.passo || 'Próximo passo'}: ${p.nome}`, `Etapa: ${p.etapa}. Serviço: ${p.servico || '-'}. Canal: ${p.canal}.`)));
    cols.forEach((c) => lines.push(...ev('col-' + c.id, c.prox, `Colega: ${c.nome}`, `Etapa: ${c.etapa}.`)));
    lines.push('END:VCALENDAR');
    download('cliniloop-proximos-passos.ics', lines.join('\r\n'), 'text/calendar;charset=utf-8');
  });

  // ===================== Rede de colegas =====================
  document.getElementById('cl-etapa').innerHTML = ETAPAS_COLEGA.map((e) => `<option>${e}</option>`).join('');
  document.getElementById('col-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validate(form)) return;
    const v = (id) => document.getElementById(id).value.trim();
    colegas.unshift({ id: uid(), nome: v('cl-nome'), prof: v('cl-prof'), reg: v('cl-reg'), canal: v('cl-canal'), end: v('cl-end'), etapa: v('cl-etapa'), prox: v('cl-prox'), enviadas: 0, contra: '', criado: todayISO() });
    saveCol();
    ['cl-nome', 'cl-prof', 'cl-reg', 'cl-canal', 'cl-end', 'cl-prox'].forEach((id) => { document.getElementById(id).value = ''; });
    const msg = formMsg(form); msg.className = 'form-msg ok'; msg.textContent = '✓ Colega adicionado(a).';
    renderColegas(); renderOrigemOptions();
  });
  function recebidas(c) { return pacientes.filter((p) => p.colega === c.id).length; }
  function recebidas90(c) { const lim = addDays(todayISO(), -90); return pacientes.filter((p) => p.colega === c.id && p.criado >= lim).length; }
  function renderColegas() {
    document.getElementById('col-funnel').innerHTML = ETAPAS_COLEGA.map((e) => `<div><b>${colegas.filter((c) => c.etapa === e).length}</b><span>${e}</span></div>`).join('');
    const ativos = colegas.filter((c) => recebidas90(c) > 0).length;
    const indic90 = pacientes.filter((p) => p.colega && p.criado >= addDays(todayISO(), -90));
    const agend = indic90.filter((p) => p.hist && p.hist.Agendado).length;
    const inic = indic90.filter((p) => p.hist && p.hist['Em tratamento']).length;
    document.getElementById('col-metricas').innerHTML = colegas.length ? `<b>Métricas da rede (Parte 6):</b> colegas ativos, que indicaram nos últimos 90 dias: ${ativos} · indicações nos últimos 90 dias: ${indic90.length} · agendaram: ${indic90.length ? Math.round(agend / indic90.length * 100) + '%' : '—'} · iniciaram: ${indic90.length ? Math.round(inic / indic90.length * 100) + '%' : '—'} · contrarreferências enviadas: ${colegas.filter((c) => c.contra).length}` : '';
    const box = document.getElementById('col-list');
    if (!colegas.length) { box.innerHTML = '<div class="track-empty">Nenhum colega mapeado. Comece por quem atende o mesmo paciente antes ou depois de você.</div>'; return; }
    box.innerHTML = '';
    colegas.forEach((c) => {
      const late = c.prox && c.prox <= todayISO();
      const r90 = recebidas90(c);
      const dica = r90 && ['Mapeado', 'Apresentado', 'Primeira indicação', 'Inativo'].includes(c.etapa) && (c.etapa !== 'Primeira indicação' || recebidas(c) > 1) ? 'indicou nos últimos 90 dias: considere "Parceiro ativo"'
        : (!r90 && c.etapa === 'Parceiro ativo' ? 'sem indicação há 90 dias: considere "Inativo" e retome o relacionamento' : '');
      const el = document.createElement('div');
      el.className = 'track-item' + (late ? ' overdue' : '');
      el.innerHTML = `<div><h5>${escapeHtml(c.nome)}${c.prof ? ' · ' + escapeHtml(c.prof) : ''}</h5>
        <div class="meta">${[c.reg, c.canal, c.end].filter(Boolean).map(escapeHtml).join(' · ')}</div>
        <div class="meta">Indicações recebidas: ${recebidas(c)} (${recebidas90(c)} nos últimos 90 dias) · enviadas: ${c.enviadas || 0} · última contrarreferência: ${c.contra ? fmtDate(c.contra) : '—'}${late ? ' · <span class="late">próximo passo vencido</span>' : ''}${dica ? ` · <span class="parado">${dica}</span>` : ''}</div></div>
        <div class="track-controls">
          <select class="js-etapa" aria-label="Etapa do colega">${ETAPAS_COLEGA.map((e) => `<option${e === c.etapa ? ' selected' : ''}>${e}</option>`).join('')}</select>
          <button type="button" class="icon-btn js-del" title="Excluir" aria-label="Excluir colega">×</button>
        </div>
        <div class="pac-row">
          <label>Próximo contato <input type="date" class="js-prox" value="${escapeHtml(c.prox || '')}"></label>
          <button type="button" class="btn btn-outline btn-sm js-env">+1 indicação enviada</button>
          <button type="button" class="btn btn-outline btn-sm js-contra">Contrarreferência enviada hoje</button>
        </div>`;
      el.querySelector('.js-etapa').addEventListener('change', (ev) => { c.etapa = ev.target.value; saveCol(); renderColegas(); });
      el.querySelector('.js-prox').addEventListener('change', (ev) => { c.prox = ev.target.value; saveCol(); renderColegas(); });
      el.querySelector('.js-env').addEventListener('click', () => { c.enviadas = (c.enviadas || 0) + 1; saveCol(); renderColegas(); });
      el.querySelector('.js-contra').addEventListener('click', () => { c.contra = todayISO(); saveCol(); renderColegas(); });
      el.querySelector('.js-del').addEventListener('click', () => { if (!confirm(`Excluir ${c.nome}?`)) return; colegas = colegas.filter((x) => x.id !== c.id); saveCol(); renderColegas(); renderOrigemOptions(); });
      box.appendChild(el);
    });
  }

  // ===================== Campanhas =====================
  document.querySelectorAll('[data-modelo]').forEach((b) => b.addEventListener('click', () => {
    const m = MODELOS[b.dataset.modelo];
    const set = (id, v) => { document.getElementById(id).value = v; };
    set('ca-servico', m.servico); set('ca-n', m.n); set('ca-duracao', m.duracao); set('ca-msg', m.mensagem);
    document.querySelectorAll('form[data-tool="campanha"] input[name="canais"]').forEach((cb) => { cb.checked = m.canais.includes(cb.value); });
    const f = document.querySelector('form[data-tool="campanha"]');
    const msg = formMsg(f); msg.className = 'form-msg ok';
    msg.textContent = `Modelo "${b.textContent}" carregado. Ajuste ao seu caso e clique em "Gerar prompt".`;
  }));
  document.getElementById('camp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validate(form)) return;
    const v = (id) => document.getElementById(id).value.trim();
    if (campanhas.some((c) => c.nome.toLowerCase() === v('cp-nome').toLowerCase())) { const m = formMsg(form); m.className = 'form-msg error'; m.textContent = 'Já existe uma campanha com esse nome.'; return; }
    campanhas.unshift({ id: uid(), nome: v('cp-nome'), tipo: v('cp-tipo') || 'Campanha', plat: v('cp-plat'), ini: v('cp-ini'), fim: v('cp-fim'), obj: v('cp-obj'), inv: v('cp-inv'), criativos: v('cp-criativos') });
    saveCamp();
    ['cp-nome', 'cp-ini', 'cp-fim', 'cp-obj', 'cp-inv', 'cp-criativos'].forEach((id) => { document.getElementById(id).value = ''; });
    const msg = formMsg(form); msg.className = 'form-msg ok'; msg.textContent = `✓ Registrada. "${campOrigem(campanhas[0])}" já aparece como origem no Rastreador.`;
    renderCampanhas(); renderOrigemOptions();
  });
  function campStats(c) {
    const ps = pacientes.filter((p) => p.origem === campOrigem(c));
    const h = (k) => ps.filter((p) => p.hist && p.hist[k]).length;
    return { contatos: ps.length, agendados: h('Agendado'), avaliados: h('Avaliado'), iniciados: h('Em tratamento') };
  }
  function renderCampanhas() {
    const t = document.getElementById('camp-table');
    if (!campanhas.length) { t.innerHTML = '<tr><td class="track-empty" style="text-align:center">Nenhuma campanha registrada.</td></tr>'; return; }
    t.innerHTML = '<tr><th>Campanha</th><th>Plataforma</th><th>Período</th><th>Investimento</th><th>Contatos</th><th>Agendados</th><th>Compareceram</th><th>Iniciaram</th><th>Custo por agendado</th><th>Custo por paciente que compareceu</th><th></th></tr>' +
      campanhas.map((c) => {
        const s = campStats(c);
        const inv = Number(c.inv) || 0;
        return `<tr><td>${escapeHtml(c.nome)}<br><small>${c.tipo === 'Impulsionamento' ? 'Impulsionamento · ' : ''}${escapeHtml(c.obj || '')}</small></td><td>${escapeHtml(c.plat)}</td><td>${fmtShort(c.ini)}${c.fim ? ' a ' + fmtShort(c.fim) : ''}</td><td>${inv ? 'R$ ' + inv.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}</td><td>${s.contatos}</td><td>${s.agendados}</td><td>${s.avaliados}</td><td>${s.iniciados}</td><td>${inv && s.agendados ? 'R$ ' + (inv / s.agendados).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '—'}</td><td>${inv && s.avaliados ? 'R$ ' + (inv / s.avaliados).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '—'}</td><td><button type="button" class="icon-btn" data-del="${escapeHtml(c.id)}" aria-label="Excluir campanha">×</button></td></tr>`;
      }).join('');
    t.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
      if (!confirm('Excluir esta campanha? Os contatos continuam no rastreador.')) return;
      campanhas = campanhas.filter((c) => c.id !== b.dataset.del); saveCamp(); renderCampanhas(); renderOrigemOptions();
    }));
  }

  // ===================== Diário de conteúdo e métricas =====================
  document.getElementById('ct-data').value = todayISO();
  document.getElementById('ct-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validate(form)) return;
    const v = (id) => document.getElementById(id).value.trim();
    const n = (id) => Math.max(0, Math.round(Number(v(id)) || 0));
    conteudos.unshift({ id: uid(), data: v('ct-data'), canal: v('ct-canal'), formato: v('ct-formato'), balde: v('ct-balde'), gancho: v('ct-gancho'), kw: v('ct-kw'), quadro: v('ct-quadro'), variavel: v('ct-var'), ret: v('ct-ret') === '' ? '' : Math.min(100, n('ct-ret')), boost: document.getElementById('ct-boost').checked, alcance: n('ct-alcance'), envios: n('ct-envios'), salv: n('ct-salv'), msgs: n('ct-msgs') });
    conteudos = conteudos.slice(0, 2000);
    saveCont();
    ['ct-gancho', 'ct-kw', 'ct-quadro', 'ct-ret', 'ct-alcance', 'ct-envios', 'ct-salv', 'ct-msgs'].forEach((id) => { document.getElementById(id).value = ''; });
    document.getElementById('ct-var').value = ''; document.getElementById('ct-boost').checked = false;
    const msg = formMsg(form); msg.className = 'form-msg ok'; msg.textContent = '✓ Conteúdo registrado.';
    renderConteudos();
  });
  function renderConteudos() {
    const t = document.getElementById('ct-table');
    if (!conteudos.length) { t.innerHTML = '<tr><td class="track-empty" style="text-align:center">Nenhum conteúdo registrado ainda.</td></tr>'; return; }
    const sorted = conteudos.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 15);
    t.innerHTML = '<tr><th>Data</th><th>Canal e formato</th><th>Gancho</th><th>Retenção %</th><th>Alcance</th><th>Envios</th><th>Salv.</th><th>Msgs</th><th></th></tr>' +
      sorted.map((c) => `<tr data-id="${escapeHtml(c.id)}"><td>${fmtShort(c.data)}${c.boost ? '<br><small>impulsionado</small>' : ''}</td><td>${escapeHtml(c.canal)} · ${escapeHtml(c.formato)}${c.balde ? '<br><small>' + escapeHtml(c.balde) + '</small>' : ''}</td><td style="text-align:left">${escapeHtml(c.gancho)}${c.quadro || c.variavel ? `<br><small>${[c.quadro, c.variavel ? 'testando: ' + c.variavel : ''].filter(Boolean).map(escapeHtml).join(' · ')}</small>` : ''}</td>${['ret', 'alcance', 'envios', 'salv', 'msgs'].map((k) => `<td><input type="number" min="0" data-k="${k}" value="${c[k] === '' || c[k] == null ? '' : c[k]}" aria-label="${k}"></td>`).join('')}<td><button type="button" class="icon-btn" data-del="1" aria-label="Excluir conteúdo">×</button></td></tr>`).join('');
    t.querySelectorAll('tr[data-id]').forEach((tr) => {
      const c = conteudos.find((x) => x.id === tr.dataset.id);
      tr.querySelectorAll('input[data-k]').forEach((inp) => inp.addEventListener('change', () => { const k = inp.dataset.k; c[k] = k === 'ret' && inp.value === '' ? '' : Math.max(0, Math.min(k === 'ret' ? 100 : 1e9, Math.round(Number(inp.value) || 0))); saveCont(); }));
      tr.querySelector('[data-del]').addEventListener('click', () => { conteudos = conteudos.filter((x) => x.id !== c.id); saveCont(); renderConteudos(); });
    });
  }
  function inWeek(d, seg) { return d && d >= seg && d <= addDays(seg, 6); }
  function weekStats(seg) {
    const h = (k) => pacientes.filter((p) => p.hist && inWeek(p.hist[k], seg)).length;
    const cs = conteudos.filter((c) => inWeek(c.data, seg));
    const sum = (k) => cs.reduce((a, c) => a + (Number(c[k]) || 0), 0);
    return {
      seg, conteudos: cs.length, envios: sum('envios'), salv: sum('salv'), msgs: sum('msgs'),
      contatos: pacientes.filter((p) => inWeek(p.criado, seg)).length,
      agendados: h('Agendado'), avaliados: h('Avaliado'), planos: h('Plano proposto'), iniciados: h('Em tratamento'),
      perdidos: pacientes.filter((p) => p.etapa === 'Encerrado' && p.resultado === 'Perdido' && p.hist && inWeek(p.hist.Encerrado, seg)).length,
      colegas: pacientes.filter((p) => p.origem === 'Indicação de colega' && inWeek(p.criado, seg)).length,
      faltas: pacientes.reduce((a, p) => a + (p.ativ || []).filter((x) => /^Falta/.test(x.t) && inWeek(x.d, seg)).length, 0)
    };
  }
  function lastWeeks(n) { const seg = mondayISO(); return Array.from({ length: n }, (_, i) => weekStats(addDays(seg, -7 * i))); }
  const METRIC_COLS = [['conteudos', 'Conteúdos'], ['envios', 'Envios'], ['salv', 'Salvamentos'], ['msgs', 'Mensagens'], ['contatos', 'Contatos'], ['agendados', 'Agendados'], ['avaliados', 'Avaliados'], ['planos', 'Planos propostos'], ['iniciados', 'Iniciaram'], ['faltas', 'Faltas'], ['perdidos', 'Perdidos'], ['colegas', 'Indicações de colegas']];
  function gargalo() {
    const ws = lastWeeks(4);
    const s = (k) => ws.reduce((a, w) => a + w[k], 0);
    const T = { contatos: s('contatos'), agendados: s('agendados'), avaliados: s('avaliados'), planos: s('planos'), iniciados: s('iniciados') };
    if (T.contatos < 4) return { etapa: 'Topo do funil', txt: `Poucos contatos novos nas últimas 4 semanas (${T.contatos}). Antes de otimizar o atendimento, abasteça o topo: pautas de dúvidas reais, perfis prontos, uma campanha medida e a rede de colegas.`, tool: 'pautas' };
    const passos = [
      ['Agendamento', T.agendados, T.contatos, 'dos contatos agendaram', 'Resposta rápida, acolhimento e roteiro de agendamento (Atendimento e agendamento).', 'atendimento'],
      ['Comparecimento', T.avaliados, T.agendados, 'dos agendados compareceram', 'Sequência de confirmação (ao agendar, 48 h, 24 h se não respondeu, 2 h antes) e reagendamento sem constranger, no mesmo dia da falta.', 'atendimento'],
      ['Proposta', T.planos, T.avaliados, 'dos avaliados receberam um plano', 'Registre o plano proposto de cada avaliação e explique o próximo passo antes de o paciente sair.', 'rastreador'],
      ['Aceite do plano', T.iniciados, T.planos, 'dos planos viraram tratamento', 'Plano de tratamento compreensível, objeções com respostas honestas e acompanhamento em 2, 7 e 15 dias.', 'atendimento']
    ].filter((p) => p[2] >= 3).map((p) => p.concat([p[1] / p[2]]));
    if (!passos.length) return { etapa: 'Dados insuficientes', txt: 'Ainda há poucos registros para apontar um gargalo. Mantenha o rastreador atualizado por mais algumas semanas.', tool: 'rastreador' };
    passos.sort((a, b) => a[6] - b[6]);
    const g = passos[0];
    return { etapa: g[0], txt: `Gargalo provável: ${g[0].toLowerCase()}. Nas últimas 4 semanas, ${Math.round(g[6] * 100)}% ${g[3]} (${g[1]} de ${g[2]}). O que costuma ajudar: ${g[4]}`, tool: g[5] };
  }
  function metricasTxt() {
    const ws = lastWeeks(8).reverse();
    const pecas = conteudos.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 15);
    return 'Semana | ' + METRIC_COLS.map((c) => c[1]).join(' | ') + '\n' +
      ws.map((w) => `${fmtShort(w.seg)} a ${fmtShort(addDays(w.seg, 6))} | ` + METRIC_COLS.map((c) => w[c[0]]).join(' | ')).join('\n') +
      `\n\nGargalo calculado pelo app: ${gargalo().txt}` +
      (pecas.length ? '\n\nÚltimas peças (data | canal e formato | balde | quadro | variável testada | impulsionado | retenção % | alcance | envios | salvamentos | mensagens | gancho):\n' + pecas.map((c) => [fmtShort(c.data), c.canal + ' ' + c.formato, c.balde || '-', c.quadro || '-', c.variavel || '-', c.boost ? 'sim' : 'não', c.ret === '' || c.ret == null ? '-' : c.ret, c.alcance, c.envios, c.salv, c.msgs, c.gancho].join(' | ')).join('\n') : '');
  }
  function renderPainel() {
    const ws = lastWeeks(8);
    document.getElementById('num-table').innerHTML = '<tr><th>Semana</th>' + METRIC_COLS.map((c) => `<th>${c[1]}</th>`).join('') + '</tr>' +
      ws.map((w, i) => `<tr${i === 0 ? ' class="atual"' : ''}><td>${fmtShort(w.seg)} a ${fmtShort(addDays(w.seg, 6))}${i === 0 ? ' (atual)' : ''}</td>${METRIC_COLS.map((c) => `<td>${w[c[0]]}</td>`).join('')}</tr>`).join('');
    const g = gargalo();
    const gb = document.getElementById('gargalo');
    gb.className = 'risk-box' + (g.etapa === 'Dados insuficientes' ? ' ok' : '');
    gb.innerHTML = `<b>Gargalo da semana:</b> ${escapeHtml(g.txt)}`;
    const pd = document.getElementById('pn-dados');
    if (!pd.value || pd.dataset.autofilled !== '0') { pd.value = metricasTxt(); pd.dataset.autofilled = '1'; }
  }
  document.getElementById('pn-dados').addEventListener('input', (e) => { e.target.dataset.autofilled = '0'; });
  document.getElementById('num-csv').addEventListener('click', () => {
    const ws = lastWeeks(12).reverse();
    const csv = [['Início da semana'].concat(METRIC_COLS.map((c) => c[1]))].concat(ws.map((w) => [w.seg].concat(METRIC_COLS.map((c) => w[c[0]])))).map((r) => r.map(csvCell).join(';')).join('\n');
    download(`cliniloop-metricas-${todayISO()}.csv`, '\ufeff' + csv, 'text/csv;charset=utf-8');
  });

  // ===================== Assistente da semana =====================
  document.getElementById('as-import').addEventListener('click', () => {
    const seg = mondayISO();
    const dom = addDays(seg, 6);
    const hoje = todayISO();
    const L = [`Semana de ${fmtDate(seg)} a ${fmtDate(dom)}.`, ''];
    const passos = pacientes.filter((p) => p.etapa !== 'Encerrado' && p.data && p.data <= dom).sort((a, b) => a.data.localeCompare(b.data));
    L.push(`Próximos passos de pacientes (${passos.length}):`);
    passos.slice(0, 25).forEach((p, i) => L.push(`- Contato ${i + 1} · ${p.servico || 'serviço não informado'} · etapa ${p.etapa} · ${p.passo || 'próximo passo não definido'} · ${fmtShort(p.data)}${p.data < hoje ? ' (vencido)' : ''}`));
    const semData = pacientes.filter((p) => p.etapa !== 'Encerrado' && !p.data).length;
    if (semData) L.push(`- ${semData} contato(s) ativo(s) sem data de próximo passo.`);
    const retom = pacientes.filter((p) => p.etapa === 'Encerrado' && ['Pausado', 'Perdido'].includes(p.resultado) && p.consent && p.consent.lembretes).length;
    if (retom) L.push(`- ${retom} paciente(s) pausado(s) ou perdido(s) que consentiram receber lembretes: candidatos a retomada.`);
    const planos = pacientes.filter((p) => p.etapa === 'Plano proposto').length;
    if (planos) L.push(`- ${planos} ${semPacote() ? 'retorno(s) agendado(s)' : 'plano(s) proposto(s) aguardando decisão'}.`);
    const parados = pacientes.map((p) => [p, marcoParado(p)]).filter((x) => x[1]);
    if (parados.length) {
      L.push('', 'Parados (Partes 8 e 10):');
      parados.slice(0, 15).forEach(([p, m], i) => L.push(`- Parado ${i + 1} · ${p.servico || 'serviço não informado'} · ${m.txt}`));
    }
    L.push('', 'Colegas:');
    const cols = colegas.filter((c) => (c.prox && c.prox <= dom) || c.etapa === 'Mapeado');
    if (cols.length) cols.slice(0, 12).forEach((c) => L.push(`- ${c.nome}${c.prof ? ' (' + c.prof + ')' : ''} · etapa ${c.etapa}${c.prox ? ' · próximo contato ' + fmtShort(c.prox) : ''}${c.contra ? '' : ' · contrarreferência nunca enviada'}`));
    else L.push('- Nenhum colega com contato previsto. Considere mapear de 2 a 3 colegas nesta semana.');
    const ativas = campanhas.filter((c) => !c.fim || c.fim >= hoje);
    L.push('', 'Campanhas ativas:');
    if (ativas.length) ativas.forEach((c) => { const s = campStats(c); L.push(`- ${c.nome} (${c.plat}) · ${s.contatos} contatos, ${s.agendados} agendados`); });
    else L.push('- Nenhuma.');
    const sw = weekStats(seg);
    L.push('', `Conteúdo: ${sw.conteudos} de ${metaSemana()} publicados nesta semana.`);
    L.push(`Funil desta semana: ${sw.contatos} contatos, ${sw.agendados} agendados, ${sw.avaliados} avaliados, ${sw.iniciados} iniciaram tratamento.`);
    L.push(`Gargalo: ${gargalo().txt}`);
    document.getElementById('as-pend').value = L.join('\n');
    document.getElementById('as-status').textContent = 'Importado. Os pacientes aparecem como Contato 1, 2… sem nome nem telefone.';
  });

  // ===================== Referências de criadores =====================
  function renderBench() {
    const ks = councilKeys();
    let rows = BENCH.filter((b) => !ks.length || ks.some((k) => b[1].includes(k)));
    const nota = rows.length ? '' : '<p class="plan-note">Ainda não há referências da sua área nesta amostra. Veja as de outras áreas: o que se adapta é a estrutura.</p>';
    if (!rows.length) rows = BENCH;
    document.getElementById('bench-box').innerHTML = `<p class="plan-note">Amostra editorial de ${BENCH.length} perfis da Parte 4 do livro (outubro de 2026), <b>não é um ranking</b>. Use as estruturas, não os conselhos clínicos, e não atribua resultado a elas. ${escapeHtml(BENCH_PADROES)}</p>${nota}<div class="num-wrap"><table class="num-table bench-table"><tr><th>Criador</th><th>Área</th><th>Instagram</th><th>O que dá para adaptar</th></tr>${rows.map((b) => `<tr><td>${escapeHtml(b[0])}</td><td>${escapeHtml(b[2])}</td><td>${escapeHtml(b[3])}</td><td>${escapeHtml(b[4])}</td></tr>`).join('')}</table></div>`;
  }

  // ===================== Ferramentas (tabela) =====================
  document.getElementById('kit-table').innerHTML = '<tr><th>Necessidade</th><th>Ferramentas</th><th>Observação</th></tr>' + KIT.map((k) => `<tr><td>${escapeHtml(k[0])}</td><td>${escapeHtml(k[1])}</td><td>${escapeHtml(k[2])}</td></tr>`).join('');
