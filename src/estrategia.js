
  // ===================== Núcleo da estratégia (Oceano Azul) =====================
  // Um contexto só, lido por todas as ferramentas: para quem, a proposta, as quatro ações, o que já acontece,
  // o que ainda vai ser implantado, a evidência coletada e as pendências. Separa hipótese, evidência e decisão aprovada.
  // Usa só "var" e funções: pode ser chamado por trechos que rodam antes deste arquivo.
  var EST_KEY = 'cliniloop.estrategia.v1';
  var EST_SLOGANS = ['humanizado', 'humanizada', 'qualidade', 'excelencia', 'o melhor', 'a melhor', 'os melhores', 'as melhores', 'diferenciado', 'diferenciada', 'referencia', 'de ponta', 'top', 'premium', 'completo', 'completa', 'cuidado integral', 'atendimento personalizado'];
  // Entregas que expressam a estratégia: quando ela muda, a versão aprovada delas precisa de revisão.
  var EST_DEPENDENTES = { perfil: ['Textos dos perfis', 4], pautas: ['Pautas e calendário', 5], atendimento: ['Respostas do atendimento', 7], formacao: ['Plano de formação e autoridade', 0], profissional: ['Marca e tom de voz', 0] };

  function estLinhas(t) { return String(t || '').split(/\n|;/).map((x) => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean); }
  function estHash(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return (h >>> 0).toString(36); }
  function estSt() { const a = storeGet(EST_KEY, null); return a && typeof a === 'object' ? a : {}; }
  function sloganGenerico(t) {
    const n = normTxt(t);
    return EST_SLOGANS.filter((w) => n.indexOf(' ' + w + ' ') >= 0 || n.indexOf(' ' + w + ',') >= 0 || n.indexOf(' ' + w + '.') >= 0);
  }

  function estrategia() {
    const o = storeGet('cliniloop.oceano.v1', {}) || {};
    const c = (typeof cfg !== 'undefined' && cfg) || {};
    const e = {
      publico: String(c.publico || o.publico || '').trim(), proposta: String(c.transformacao || '').trim(),
      eliminar: estLinhas(o.eliminar), reduzir: estLinhas(o.reduzir), elevar: estLinhas(o.elevar), criar: estLinhas(o.criar),
      fatores: (o.fatores || []).concat(estLinhas(o.extra)), impl: (o.impl && typeof o.impl === 'object') ? o.impl : {},
      avaliacoes: String(o.avaliacoes || '').trim(), vozPacientes: String(o.pacientes || '').trim(),
      naoClientes: [o.nc1, o.nc2, o.nc3].map((x) => String(x || '').trim()).filter(Boolean)
    };
    e.hash = estHash(JSON.stringify([e.publico, e.proposta, e.eliminar, e.reduzir, e.elevar, e.criar]));
    e.temEvidencia = !!(e.avaliacoes || e.vozPacientes);
    const itens = [...new Set([...e.elevar, ...e.criar])];
    const sit = (t) => (e.impl[t] || {}).s || '';
    e.ja = itens.filter((t) => sit(t) === 'ja');
    e.vou = itens.filter((t) => sit(t) === 'vou');
    e.incerto = itens.filter((t) => sit(t) !== 'ja' && sit(t) !== 'vou');
    e.comoMostrar = itens.map((t) => [t, (e.impl[t] || {}).m || '']).filter((x) => x[1]);
    const a = estSt();
    e.aprov = a.aprovada || null;
    e.status = !e.proposta ? 'vazia' : (!e.aprov ? 'hipotese' : (e.aprov.hash === e.hash ? 'aprovada' : 'revisar'));
    e.slogans = sloganGenerico(e.proposta);
    // Pendências: o que ainda é hipótese ou falta decidir. Cada uma diz onde resolver.
    const P = [];
    if (e.fatores.length < 4) P.push(['Marcar em que a sua área compete na sua cidade', 1]);
    if (!e.temEvidencia) P.push(['Ouvir o que os pacientes dizem: ler avaliações e perguntar a alguns pacientes', 2]);
    if (!e.naoClientes.length) P.push(['Olhar para quem ainda não procura ninguém da sua área', 3]);
    if (!e.elevar.length && !e.criar.length) P.push(['Decidir o que você vai elevar e criar', 4]);
    if (e.incerto.length) P.push([`Dizer se já faz hoje: ${e.incerto.slice(0, 3).join('; ')}${e.incerto.length > 3 ? '…' : ''}`, 6]);
    if (e.vou.length) P.push([`Implantar antes de anunciar: ${e.vou.slice(0, 3).join('; ')}${e.vou.length > 3 ? '…' : ''}`, 6]);
    if (!e.proposta) P.push(['Escrever a proposta de valor em uma frase', 7]);
    if (e.slogans.length) P.push([`Trocar palavras genéricas da proposta ("${e.slogans.join('", "')}") pelo que muda de fato para o paciente`, 7]);
    if (e.status === 'hipotese') P.push(['Aprovar a proposta quando estiver de acordo com ela', 7]);
    if (e.status === 'revisar') P.push(['A proposta mudou depois da aprovação: revise e aprove de novo', 7]);
    e.pend = P;
    return e;
  }
  var EST_ROTULO = { vazia: 'Não definida', hipotese: 'Hipótese', aprovada: 'Aprovada', revisar: 'Precisa revisar' };

  // Bloco que entra em todos os prompts: a diferença escolhida e como ela deve aparecer na peça.
  function estrategiaBloco(selfId) {
    if (selfId === 'oceano') return '';
    const e = estrategia();
    if (e.status === 'vazia') {
      return '\n\nMinha diferenciação (Oceano Azul): ainda não definida.\n- Não invente um diferencial nem credenciais. Escreva de forma clara e correta e, no fim, lembre que falta definir a proposta de valor no passo 3 do CliniLoop.';
    }
    const L = [];
    const st = e.status === 'aprovada' ? `APROVADA por mim em ${fmtDate(e.aprov.d)}` : (e.status === 'revisar' ? 'EM REVISÃO: mudei a proposta depois de aprová-la' : 'HIPÓTESE: ainda não aprovada por mim');
    L.push(`- Situação: ${st}; evidência: ${e.temEvidencia ? 'tenho relatos de pacientes ou avaliações (resumo abaixo)' : 'NENHUMA coletada ainda, então trate a diferença como hipótese'}.`);
    if (e.publico) L.push(`- Para quem: ${e.publico}`);
    L.push(`- Proposta de valor: ${e.proposta}`);
    [['Eliminar', e.eliminar], ['Reduzir', e.reduzir], ['Elevar', e.elevar], ['Criar', e.criar]].forEach(([k, v]) => { if (v.length) L.push(`- ${k}: ${v.join('; ')}`); });
    if (e.ja.length) L.push(`- O que eu JÁ faço hoje e pode ser mostrado: ${e.ja.join('; ')}`);
    if (e.comoMostrar.length) L.push(`- Como mostrar: ${e.comoMostrar.map((x) => x[0] + ': ' + x[1]).join(' | ')}`);
    if (e.vou.length || e.incerto.length) L.push(`- O que AINDA NÃO acontece (não anuncie como se existisse): ${[...e.vou, ...e.incerto].join('; ')}`);
    if (e.temEvidencia) L.push(`- O que os pacientes dizem (padrões, sem identificar ninguém): ${trim([e.vozPacientes, e.avaliacoes].filter(Boolean).join(' / '), 600)}`);
    return `\n\nMinha diferenciação (Oceano Azul), que deve aparecer nesta entrega:\n${L.join('\n')}
- Como usar: a peça precisa materializar pelo menos um item de Elevar ou Criar que eu já faço, dito em linguagem concreta (o que muda para o paciente), e não em adjetivos como "humanizado" ou "qualidade". Se precisar citar algo que ainda não acontece, marque [AINDA NÃO IMPLANTADO]. Não invente credenciais, números, depoimentos nem dados sobre concorrentes. Diga, no fim, qual item da minha diferenciação a peça mostra.`;
  }

  // Entregas aprovadas antes de a estratégia mudar.
  function entregasRevisar() {
    const e = estrategia(); const r = resultados();
    return Object.keys(EST_DEPENDENTES).filter((id) => r[id] && r[id].ev && r[id].ev !== e.hash);
  }

  // Faixa "a sua diferença neste prompt", no topo das ferramentas que produzem entregas.
  var EST_FAIXA_TOOLS = ['pautas', 'roteiro', 'reaproveitamento', 'campanha', 'colegas', 'atendimento', 'briefing', 'formacao', 'profissional', 'publico'];
  function renderFaixasDif() {
    const e = estrategia();
    const html = () => {
      if (e.status === 'vazia') return `<p><span class="dif-badge vazia">Sem diferença definida</span> <b>Este prompt ainda não tem a sua diferença.</b> Sem ela, a entrega sai parecida com a de qualquer colega. <button type="button" class="linkish" data-abrir="oceano">Fazer o Oceano Azul (passo 3)</button></p>`;
      const ac = [['Elevar', e.elevar], ['Criar', e.criar]].filter((x) => x[1].length).map(([k, v]) => `<b>${k}:</b> ${escapeHtml(v.slice(0, 3).join('; '))}`).join(' · ');
      return `<p><span class="dif-badge ${e.status}">${EST_ROTULO[e.status]}</span> <b>A sua diferença entra neste prompt:</b> “${escapeHtml(trim(e.proposta, 160))}”</p>
        ${ac ? `<p class="dif-acoes">${ac}</p>` : ''}
        <p class="dif-nota">${e.status === 'hipotese' ? 'Ainda é hipótese: o prompt pede para a IA não apresentar como certo o que você não confirmou. ' : ''}${e.vou.length || e.incerto.length ? 'O que ainda não acontece no seu atendimento entra como [AINDA NÃO IMPLANTADO]. ' : ''}<button type="button" class="linkish" data-abrir="oceano">Ajustar no passo 3</button></p>`;
    };
    document.querySelectorAll('.dif-faixa').forEach((box) => { box.className = 'dif-faixa st-' + e.status; box.innerHTML = html(); });
  }
  (function montarFaixas() {
    EST_FAIXA_TOOLS.forEach((id) => {
      const body = document.querySelector(`.tool[data-id="${id}"] > .tool-body`);
      if (!body || body.querySelector(':scope > .dif-faixa')) return;
      const f = document.createElement('div'); f.className = 'dif-faixa';
      const desc = body.querySelector(':scope > p.desc');
      if (desc) desc.after(f); else body.prepend(f);
    });
    const p4 = document.getElementById('redes-uso');
    if (p4 && !document.getElementById('dif-faixa-redes')) { const f = document.createElement('div'); f.className = 'dif-faixa'; f.id = 'dif-faixa-redes'; p4.parentNode.insertBefore(f, p4); }
    renderFaixasDif();
  })();

  // Aprovação da proposta (passo 3): decisão separada da evidência.
  function aprovarProposta() {
    const e = estrategia();
    if (!e.proposta) return false;
    const a = estSt();
    const hist = Array.isArray(a.hist) ? a.hist : [];
    if (a.aprovada) hist.unshift(a.aprovada);
    a.aprovada = { hash: e.hash, d: todayISO(), proposta: e.proposta, comEvidencia: e.temEvidencia, elevar: e.elevar, criar: e.criar };
    a.hist = hist.slice(0, 10);
    return storeSet(EST_KEY, a);
  }
  function renderAprovacao() {
    const box = document.getElementById('est-aprovacao');
    if (!box) return;
    const e = estrategia();
    const ev = e.temEvidencia ? '<span class="dif-badge aprovada">Com evidência</span> relatos de pacientes ou avaliações registrados na etapa 2' : '<span class="dif-badge hipotese">Sem evidência</span> ainda não há relatos de pacientes nem avaliações na etapa 2';
    const dec = e.status === 'aprovada' ? `<span class="dif-badge aprovada">Aprovada em ${fmtDate(e.aprov.d)}</span>` : `<span class="dif-badge ${e.status}">${EST_ROTULO[e.status]}</span>`;
    const pend = e.pend.filter((p) => !/^Aprovar a proposta|^A proposta mudou/.test(p[0]));
    box.innerHTML = `<div class="est-linhas"><p><b>Decisão:</b> ${dec}</p><p><b>Evidência:</b> ${ev}</p></div>
      ${e.slogans.length ? `<p class="est-slogan" role="status">"${escapeHtml(e.slogans.join('", "'))}" serve para qualquer colega. Diga o que muda, na prática, para o paciente: por exemplo, "sai da primeira consulta com o plano por escrito".</p>` : ''}
      ${pend.length ? `<div class="est-pend"><p><b>O que ainda falta validar ou decidir</b> (pode ficar para depois, mas continua marcado):</p><ul>${pend.map(([t, et]) => `<li><button type="button" class="linkish" data-oa-etapa="${et}">${escapeHtml(t)}</button> <small>etapa ${et}</small></li>`).join('')}</ul></div>` : '<p class="est-ok">Nada pendente nas sete etapas.</p>'}
      ${e.status === 'aprovada' ? '<p class="jor-sub">Se mudar a proposta ou as quatro ações, ela volta para "Precisa revisar", e as entregas feitas com a versão anterior ficam marcadas para revisão.</p>' : (e.proposta ? `<div class="est-aprovar">
        <button type="button" class="btn btn-teal btn-sm" id="est-abrir-aprov">Aprovar esta proposta</button>
        <fieldset class="est-confirma" hidden><legend>Antes de aprovar, confirme:</legend>
          <label><input type="checkbox" class="est-c"> Ela diz o que muda, na prática, para o paciente, e não só adjetivos.</label>
          <label><input type="checkbox" class="est-c"> Ela não promete resultado de tratamento nem cura.</label>
          <label><input type="checkbox" class="est-c"> O que ela anuncia já acontece no meu atendimento, ou está marcado como "vou implementar".</label>
          <button type="button" class="btn btn-gold btn-sm" id="est-confirmar" disabled>Confirmar aprovação</button>
          <p class="save-status" id="est-st" aria-live="polite"></p>
        </fieldset></div>` : '')}`;
    const ab = document.getElementById('est-abrir-aprov');
    if (ab) ab.addEventListener('click', () => { box.querySelector('.est-confirma').hidden = false; ab.hidden = true; box.querySelector('.est-c').focus(); });
    const cs = [...box.querySelectorAll('.est-c')];
    const cf = document.getElementById('est-confirmar');
    cs.forEach((c) => c.addEventListener('change', () => { cf.disabled = !cs.every((x) => x.checked); }));
    if (cf) cf.addEventListener('click', () => {
      if (!aprovarProposta()) { document.getElementById('est-st').textContent = 'Não consegui gravar a aprovação neste navegador. Tente de novo.'; return; }
      notifyData();
    });
  }
