
  // ===================== O caminho: nove passos, em ordem =====================
  // Um caminho só, em três movimentos (defina a sua diferença, mostre onde o paciente procura, meça quem fica).
  // Cada passo reúne os campos, os prompts e o que guardar. O passo concluído mostra um resumo e se edita ali mesmo.
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
    { n: 8, titulo: 'Rastreador de pacientes' },
    { n: 9, titulo: 'Ritual da semana' }
  ];
  // Onde mora cada ferramenta do caminho. As demais ficam na caixa de ferramentas.
  const TOOL_PASSO = { config: 1, publico: 2, oceano: 3, perfil: 4, pautas: 5, roteiro: 5, colegas: 6, campanha: 6, atendimento: 7, rastreador: 8, assistente: 9, painel: 9 };
  // Campos obrigatórios dos três primeiros passos: [id do campo, chave em cfg, como chamar].
  const OBRIG = {
    1: [['prof', 'profissional', 'o tipo de profissional'], ['cfg-registro', 'registro', 'o registro no conselho'], ['cfg-espec', 'especialidade', 'a especialidade'],
      ['cfg-cidade', 'cidade', 'cidade e bairro'], ['cfg-servicos', 'servicos', 'os serviços que quer divulgar'], ['cfg-sobre', 'sobre', 'formação, experiência e diferenciais'],
      ['cfg-meta', 'metaFrase', 'o resultado que você quer em 90 dias']],
    2: [['cfg-publico', 'publico', 'quem é o seu paciente ideal'], ['cfg-icp-dor', 'icpDor', 'a principal dor ou dúvida dele']],
    3: [['cfg-transf', 'transformacao', 'a sua proposta de valor em uma frase']]
  };

  function camSt() {
    const s = storeGet(CAM_KEY, null) || {};
    return { feitos: s.feitos || {}, aberto: s.aberto === undefined ? null : s.aberto };
  }
  function camSet(s) { storeSet(CAM_KEY, s); }
  function faltandoPasso(n) {
    return (OBRIG[n] || []).filter((x) => !String(cfg[x[1]] || '').trim()).map((x) => ({ id: x[0], txt: x[2] }));
  }
  const usoDe = () => storeGet(USO_KEY, {}) || {};
  function canaisFeitos() { const s = storeGet(CANAIS_KEY, {}) || {}; return Object.keys(s).length; }

  // Um passo está feito quando o profissional concluiu, ou quando os dados mostram que ele já foi percorrido.
  function passoFeito(n, st) {
    st = st || camSt();
    if (n <= 3 && faltandoPasso(n).length) return false;
    if (st.feitos[n]) return true;
    const uso = usoDe(); const r = resultados(); const j = waSt();
    switch (n) {
      case 1: case 2: case 3: return true;
      case 4: return !!r.perfil || canaisFeitos() >= 3;
      case 5: return conteudos.length > 0 || !!r.pautas;
      case 6: return colegas.length > 0 || campanhas.length > 0;
      case 7: return !!r.atendimento || WA_ITENS.filter(([id]) => j[id]).length >= 4;
      case 8: return pacientes.length > 0;
      case 9: return !!uso.assistente;
    }
    return false;
  }
  function proximoPasso(st) { const p = PASSOS.find((x) => !passoFeito(x.n, st)); return p ? p.n : null; }

  // Resumo de uma linha que aparece no cabeçalho do passo concluído.
  function resumoPasso(n) {
    const t = (s, k) => trim(s, k || 90);
    const r = resultados();
    switch (n) {
      case 1: return [profInfo() ? profInfo().label : '', cfg.especialidade, cfg.cidade].filter(Boolean).join(' · ') + (cfg.metaFrase ? ' — ' + t(cfg.metaFrase, 70) : '');
      case 2: return cfg.publico ? t(cfg.publico, 60) + (cfg.icpDor ? ' · dúvida: ' + t(cfg.icpDor, 50) : '') : '';
      case 3: return cfg.transformacao ? '"' + t(cfg.transformacao, 110) + '"' : '';
      case 4: { const u = (cfg.canais || []).filter((c) => REDE_IDS[c]); return u.length ? u.map((c) => REDE_NOME[REDE_IDS[c]]).join(', ') + (r.perfil ? ' · textos aprovados guardados' : '') : ''; }
      case 5: return [cfg.baldes ? 'Temas: ' + t(cfg.baldes, 60) : '', conteudos.length ? conteudos.length + (conteudos.length === 1 ? ' conteúdo registrado' : ' conteúdos registrados') : ''].filter(Boolean).join(' · ');
      case 6: return [colegas.length ? colegas.length + (colegas.length === 1 ? ' colega' : ' colegas') : '', campanhas.length ? campanhas.length + (campanhas.length === 1 ? ' campanha' : ' campanhas') : ''].filter(Boolean).join(' · ');
      case 7: { const j = waSt(); const f = WA_ITENS.filter(([id]) => j[id] || (id === 'wa6' && pacientes.length)).length; return `${f} de ${WA_ITENS.length} passos do WhatsApp prontos`; }
      case 8: { const ab = pacientes.filter((p) => p.etapa !== 'Encerrado').length; return pacientes.length ? `${pacientes.length} ${pacientes.length === 1 ? 'contato' : 'contatos'} · ${ab} em aberto` : ''; }
      case 9: { const u = usoDe().assistente; return u ? 'Último ritual em ' + fmtDate(u) : ''; }
    }
    return '';
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
      if (opts.alvo) {
        const a = opts.alvo;
        setTimeout(() => a.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
      } else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el.focus({ preventScroll: true }), 250);
  }

  // --- Concluir um passo ---
  function concluirPasso(n) {
    const falta = faltandoPasso(n);
    const box = passoEl(n).querySelector('.passo-falta');
    passoEl(n).querySelectorAll('.invalid').forEach((x) => x.classList.remove('invalid'));
    if (falta.length) {
      box.innerHTML = `<b>Falta${falta.length > 1 ? 'm' : ''} ${falta.length} ${falta.length > 1 ? 'campos' : 'campo'}:</b> `;
      falta.forEach((f, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'linkish'; b.textContent = f.txt;
        b.addEventListener('click', () => irAoCampoPasso(f.id));
        if (i) box.appendChild(document.createTextNode(' · '));
        box.appendChild(b);
        const el = f.id !== 'prof' && document.getElementById(f.id); if (el) el.classList.add('invalid');
      });
      box.hidden = false;
      irAoCampoPasso(falta[0].id);
      return;
    }
    box.hidden = true;
    const st = camSt(); st.feitos[n] = st.feitos[n] || todayISO(); camSet(st);
    if (n === 9) markUsed('assistente', true);
    const prox = proximoPasso(st);
    renderCaminho();
    if (prox) abrirPasso(prox);
    else { fecharPassos(); renderCaminho(); passoEl(9).scrollIntoView({ behavior: 'smooth', block: 'start' }); }
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
  Object.keys(REDE_PEDIDO).forEach((id) => {
    promptBuilders['rede-' + id] = (get) => {
      const extra = id === 'instagram' ? `\nLink da bio hoje: ${get('link')}. Destaques e fixados: ${nv(get('destaques'))}${cfg.arroba ? `\nMeu @: ${cfg.arroba}` : ''}` : '';
      return `Você é consultor de marketing ético para profissionais de saúde no Brasil.

Quero revisar só um canal agora: ${REDE_NOME[id] === 'Google' ? 'o Perfil da Empresa no Google' : 'o ' + REDE_NOME[id]}.${extra}
Texto atual:
"""
${get('atual') || 'Ainda não tenho este perfil. Crie do zero.'}
"""

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
      c.querySelector('.rede-st').textContent = [gerou ? 'prompt gerado' : '', itens.length ? `checklist ${f} de ${itens.length}` : ''].filter(Boolean).join(' · ');
      c.classList.toggle('ok', itens.length > 0 && f === itens.length);
    });
  }
  // A análise conjunta junta os textos colados em cada rede.
  document.querySelector('form.tool-form[data-tool="perfil"]').addEventListener('submit', () => {
    const partes = [...document.querySelectorAll('details.rede')].map((c) => {
      const v = (c.querySelector('textarea[name="atual"]').value || '').trim();
      return v ? `${REDE_NOME[c.dataset.rede]}: ${v}` : '';
    }).filter(Boolean);
    document.getElementById('pf-atual').value = partes.length ? partes.join('\n\n') : 'Ainda não tenho textos nos perfis. Crie do zero.';
    document.getElementById('pf-link').value = document.getElementById('rd-instagram-link').value;
    document.getElementById('pf-destaques').value = document.getElementById('rd-instagram-destaques').value;
    const marcadas = new Set(cfg.canais || []);
    document.querySelectorAll('form[data-tool="perfil"] input[name="redes"]').forEach((cb) => { if (!cb.dataset.mexeu) cb.checked = marcadas.has(cb.value) || (!marcadas.size && (cb.value === 'Instagram' || cb.value === 'Perfil da Empresa no Google')); });
  }, true);
  document.querySelectorAll('form[data-tool="perfil"] input[name="redes"]').forEach((cb) => cb.addEventListener('change', () => { cb.dataset.mexeu = '1'; }));
  document.querySelectorAll('form.rede-form').forEach((f) => f.addEventListener('submit', () => setTimeout(arrumarRedes, 50)));

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

  // --- Placar do ritual (passo 9): o funil em números, sem botões ---
  function renderPlacar() {
    const box = document.getElementById('placar-box');
    const lim = addDays(todayISO(), -90);
    const co = pacientes.filter((p) => p.criado >= lim);
    const H = (k) => co.filter((p) => p.hist && p.hist[k]).length;
    const n = co.length, ag = H('Agendado'), av = H('Avaliado'), pl = H('Plano proposto'), ini = H('Em tratamento');
    const pct = (a, b) => (b ? Math.round(a / b * 100) + '%' : '—');
    const linhas = [['Contatos', n, 'nos últimos 90 dias'], ['Agendaram', ag, pct(ag, n) + ' dos contatos'], ['Compareceram', av, pct(av, ag) + ' dos agendados'], ['Em tratamento', ini, pct(ini, pl) + ' dos planos propostos']];
    const taxas = [];
    if (n >= 5) taxas.push(['agendamento', ag / n, 7, 'Responda em até 5 minutos, ofereça dois horários e faça as retomadas de 1, 3 e 7 dias.']);
    if (ag >= 5) taxas.push(['comparecimento', av / ag, 8, 'Ative a confirmação 48 horas antes, o lembrete de 2 horas e agende o retorno antes de o paciente sair.']);
    if (pl >= 5) taxas.push(['aceitação do plano', ini / pl, 7, 'Entregue o plano por escrito, com o objetivo do paciente, as fases e uma data para decidir, e acompanhe em 2, 7 e 15 dias.']);
    let ajuste;
    if (n < 5) ajuste = '<p><b>Ainda há poucos dados.</b> Com pelo menos 5 contatos no Rastreador, o placar aponta o gargalo. Enquanto isso, mantenha a rotina de conteúdo.</p>';
    else if (!taxas.length) ajuste = '<p>Continue registrando: com mais agendamentos e planos, o placar compara as taxas e mostra o gargalo.</p>';
    else {
      taxas.sort((a, b) => a[1] - b[1]);
      const g = taxas[0];
      ajuste = `<p><b>Seu gargalo hoje: ${escapeHtml(g[0])}.</b> É a menor das taxas que já dá para medir. ${escapeHtml(g[3])}</p><button type="button" class="btn btn-outline btn-sm" data-abrir="${g[2] === 8 ? 'rastreador' : 'atendimento'}">Ir ao passo ${g[2]}</button>`;
    }
    box.innerHTML = `<h4 class="passo-sub">O placar</h4><div class="placar">${linhas.map(([a, b, c], i) => `<div class="pl-c"><small>${a}</small><b>${b}</b><span>${c}</span></div>${i < linhas.length - 1 ? '<span class="pl-seta" aria-hidden="true">→</span>' : ''}`).join('')}</div>
      <div class="jor-ajuste">${ajuste}</div>
      <p class="jor-sub">A cada 90 dias, revise o objetivo no <button type="button" class="linkish" data-abrir="config">passo 1</button> e, se mudou o que você entrega, a proposta no <button type="button" class="linkish" data-abrir="oceano">passo 3</button>.</p>`;
  }

  // --- Desenho do caminho ---
  function renderPasso(n) {
    if (n === 4) { arrumarRedes(); }
    if (n === 7) renderWa();
    if (n === 9) renderPlacar();
  }
  function renderCaminho() {
    if (!camOk) return;
    const st = camSt();
    const prox = proximoPasso(st);
    let feitos = 0;
    PASSOS.forEach((p) => {
      const el = passoEl(p.n);
      const ok = passoFeito(p.n, st);
      if (ok) feitos++;
      el.classList.toggle('feito', ok);
      el.classList.toggle('atual', p.n === prox);
      el.querySelector('.passo-n').textContent = ok ? '✓' : String(p.n);
      el.querySelector('.passo-st').textContent = ok ? 'Feito' : (p.n === prox ? 'Agora' : '');
      const rs = el.querySelector('.passo-resumo');
      const resumo = ok ? resumoPasso(p.n) : '';
      rs.textContent = resumo || rs.dataset.vazio;
      const bt = el.querySelector('.js-passo-ok');
      const ultimo = p.n === PASSOS.length;
      if (ok) bt.textContent = ultimo ? 'Fechar' : (prox && prox !== p.n ? `Salvar e ir ao passo ${prox}` : 'Salvar e fechar');
      else bt.textContent = ultimo ? 'Fiz o ritual desta semana' : `Concluir e seguir para o passo ${p.n + 1}`;
    });
    // movimentos no topo
    document.querySelectorAll('#hero-movs li').forEach((li) => {
      const m = Number(li.dataset.mov); const ns = [m * 3 - 2, m * 3 - 1, m * 3];
      const f = ns.filter((n) => passoFeito(n, st)).length;
      li.classList.toggle('ok', f === 3); li.classList.toggle('cur', prox && ns.indexOf(prox) >= 0);
      li.querySelector('.hm-st').textContent = `${f} de 3`;
    });
    const cta = document.getElementById('hero-cta');
    if (feitos === 0) { cta.textContent = 'Começar pelo passo 1'; cta.dataset.passo = '1'; }
    else if (prox) { cta.textContent = `Continuar: passo ${prox} · ${PASSOS[prox - 1].titulo}`; cta.dataset.passo = String(prox); }
    else { cta.textContent = 'Fazer o ritual da semana'; cta.dataset.passo = '9'; }
    // cartão do caminho no painel Hoje
    const hoje = document.getElementById('hoje');
    hoje.hidden = !passoFeito(1, st);
    document.getElementById('cm-prog-t').textContent = `Seu caminho · ${feitos} de ${PASSOS.length} passos`;
    document.getElementById('cm-prog-bar').style.width = Math.round(feitos / PASSOS.length * 100) + '%';
    const onde = document.getElementById('cm-onde'); const acao = document.getElementById('cm-acao'); const cont = document.getElementById('cm-continuar');
    if (prox) { onde.textContent = `Próximo · passo ${prox} de ${PASSOS.length}`; acao.textContent = PASSOS[prox - 1].titulo; cont.textContent = 'Continuar'; cont.dataset.passo = String(prox); }
    else { onde.textContent = 'Caminho completo'; acao.textContent = 'Agora o ciclo é o ritual da semana: placar, gargalo e agenda.'; cont.textContent = 'Abrir o ritual'; cont.dataset.passo = '9'; }
    const ab = st.aberto;
    if (ab) renderPasso(ab);
  }

  // --- Eventos ---
  document.querySelectorAll('.passo-toggle').forEach((bt) => bt.addEventListener('click', () => {
    const n = Number(bt.closest('.passo').dataset.passo);
    if (bt.getAttribute('aria-expanded') === 'true') fecharPassos(); else abrirPasso(n);
  }));
  document.querySelectorAll('.js-passo-ok').forEach((bt) => bt.addEventListener('click', () => {
    const n = Number(bt.closest('.passo').dataset.passo);
    if (passoFeito(n)) {
      const prox = proximoPasso();
      if (prox && prox !== n) abrirPasso(prox); else { fecharPassos(); passoEl(n).scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      renderCaminho();
      return;
    }
    concluirPasso(n);
  }));
  const abrirPorPasso = (e) => { e.preventDefault(); abrirPasso(Number(e.currentTarget.dataset.passo || 1)); };
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
    const a = e.target.closest('[data-abrir],[data-copiar]');
    if (a && a.dataset.abrir) { openTool(a.dataset.abrir); return; }
    if (a && a.dataset.copiar) { copyText(a.dataset.copiar, a); return; }
    // Links internos para algo dentro de um passo fechado: abre o passo antes de rolar.
    const l = e.target.closest('a[href^="#"]');
    if (!l) return;
    const id = l.getAttribute('href').slice(1);
    const alvo = id && document.getElementById(id);
    if (!alvo) return;
    const p = alvo.closest('.passo');
    if (p && !alvo.classList.contains('passo')) {
      e.preventDefault();
      if (alvo.matches('details')) alvo.open = true;
      abrirPasso(Number(p.dataset.passo), { alvo });
    } else if (alvo.matches('details.tool, details.settings')) { e.preventDefault(); alvo.open = true; alvo.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (alvo.classList.contains('passo')) { e.preventDefault(); abrirPasso(Number(alvo.dataset.passo)); }
  });
  document.addEventListener('change', (e) => {
    const w = e.target.closest && e.target.closest('[data-wa]');
    if (w) { waSet(w.dataset.wa, w.checked); renderWa(); renderCaminho(); return; }
    if (e.target.name === 'canais') arrumarRedes();
  });
  // Os campos do perfil mudam os resumos e o que está feito.
  let camTimer = null;
  document.addEventListener('input', (e) => {
    if (!(e.target.closest && e.target.closest('.cfg-campos'))) return;
    clearTimeout(camTimer); camTimer = setTimeout(() => { renderCaminho(); if (e.target.id === 'cfg-whatsapp') renderWa(); }, 300);
  });

  // --- Índice da caixa de ferramentas ---
  (function caixaIndice() {
    const box = document.getElementById('caixa-indice');
    const ordem = ['config', 'publico', 'oceano', 'perfil', 'pautas', 'roteiro', 'colegas', 'campanha', 'atendimento', 'rastreador', 'assistente', 'painel', 'etica', 'briefing', 'nicho', 'profissional', 'reaproveitamento', 'formacao', 'ferramentas', 'ebook'];
    box.innerHTML = ordem.filter((id) => id === 'config' || document.querySelector(`.tool[data-id="${id}"]`)).map((id) => {
      const n = TOOL_PASSO[id];
      return `<button type="button" class="ci-b${n ? '' : ' ci-aqui'}" data-abrir="${id}"><span>${escapeHtml(TOOL_NAMES[id] || id)}</span><small>${n ? 'passo ' + n : 'aqui embaixo'}</small></button>`;
    }).join('');
  })();

  // --- Início: abre o passo em que a pessoa parou (ou o primeiro que falta) ---
  (function initCaminho() {
    camOk = true;
    const st = camSt();
    renderCaminho();
    const prox = proximoPasso(st);
    const n = st.aberto === 0 ? 0 : (st.aberto || prox || 0);
    if (n) abrirPasso(n, { scroll: false });
    if (location.hash && location.hash.length > 1) {
      const alvo = document.getElementById(location.hash.slice(1));
      const p = alvo && alvo.closest('.passo');
      if (p) abrirPasso(Number(p.dataset.passo), { alvo: alvo.classList.contains('passo') ? null : alvo });
    }
  })();
