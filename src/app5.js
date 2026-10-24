
  // ===================== O guia no app =====================
  const CANAIS_KEY = PREFIX + 'canais.v1';
  const TEMAS_CURTOS = {
    medico: ['Educar: quando procurar avaliação', 'Humanizar: rotina e formação', 'Desmistificar: mitos sobre a doença'],
    dentista: ['Educar: como funciona cada tratamento', 'Humanizar: bastidores e biossegurança', 'Desmistificar: mito ou verdade'],
    psicologo: ['Educar: psicoeducação', 'Humanizar: como é uma sessão', 'Desmistificar: estigmas e confusões'],
    fisioterapeuta: ['Educar: avaliação e prevenção', 'Humanizar: raciocínio clínico com modelo', 'Desmistificar: mitos sobre dor e coluna'],
    nutricionista: ['Educar: consulta, plano alimentar e rótulos', 'Humanizar: rotina do consultório', 'Desmistificar: dietas da moda']
  };
  TEMAS_CURTOS.psiquiatra = TEMAS_CURTOS.psicologo;
  const parteNome = (n) => (n === 0 ? 'Apresentação' : `Parte ${n}`);
  const etapaTxt = (n) => { const e = LIVRO.etapas.find((x) => x.n === n); return e ? `Etapa ${e.n} de 6 · ${e.nome}` : 'Antes do roteiro'; };

  // Preenche os colchetes dos prompts do guia com o Perfil do consultório
  function fillLivro(txt) {
    const p = profInfo();
    const tit = p ? (cfg.profissional === 'multi' ? 'clínica multiprofissional' : p.titulo) : '';
    const cons = councilKeys().length ? conselhosTxt() : '';
    const map = {
      'PROFISSÃO, CONSELHO': tit && cons ? `${tit}, ${cons}` : '',
      'PROFISSÃO/CLÍNICA': cfg.nome ? `${cfg.nome}${tit ? ' (' + tit + ')' : ''}` : tit,
      'PROFISSÃO': tit, 'CONSELHO': cons, 'CLÍNICA': cfg.nome, 'ESPECIALIDADE': cfg.especialidade, 'ÁREA': cfg.especialidade,
      'CIDADE': cfg.cidade, 'BAIRRO, CIDADE': cfg.cidade, 'BAIRRO/CIDADE': cfg.cidade,
      'QUEM VOCÊ QUER ATENDER': cfg.publico, 'PÚBLICO': cfg.publico, 'SERVIÇO': servicosList()[0] || '', 'OBJETIVO': cfg.metaFrase
    };
    return String(txt).replace(/\[([^\]]+)\]/g, (m, k) => (map[k] ? map[k] : m));
  }
  const pendentes = (t) => (String(t).match(/\[[A-ZÀ-Ú][^\]]*\]/g) || []).filter((x) => !/^\[(CONFIRMAR|PENDENTE DE VALIDAÇÃO|ESTIMATIVA)\]$/.test(x)).length;
  const claudeLink = (t) => 'https://claude.ai/new?q=' + encodeURIComponent(t);

  function promptCard(pr, compact) {
    const d = document.createElement('details');
    d.className = 'ls-prompt';
    d.dataset.prompt = pr.id;
    d.innerHTML = `<summary><span class="ls-tag">Prompt</span> ${escapeHtml(pr.titulo)} <span class="ls-parte">${escapeHtml(parteNome(pr.parte))}${compact ? '' : ' · ' + escapeHtml(pr.etapa)}</span><span class="chevron">▸</span></summary>
      <div class="ls-body">
        <label class="visually-hidden" for="lp-${compact ? 't' : 'b'}-${pr.id}">Prompt do guia: ${escapeHtml(pr.titulo)}</label>
        <textarea id="lp-${compact ? 't' : 'b'}-${pr.id}" readonly rows="7"></textarea>
        <p class="ls-pend"></p>
        ${(typeof EXEMPLOS_LIVRO !== 'undefined' && EXEMPLOS_LIVRO[pr.id]) ? `<details class="ls-exemplo"><summary>Ver exemplo preenchido (fictício)</summary><div class="ls-ex-body"><p class="ls-ex-aviso">Exemplo inventado para ilustrar: Dra. Bia Nunes, nutricionista esportiva, Pinheiros. Não é caso real nem resultado de paciente. Troque tudo pelos seus dados e valide com a norma do seu conselho.</p><h5>O que foi colocado</h5><p>${escapeHtml(EXEMPLOS_LIVRO[pr.id].entrada)}</p><h5>O que a IA devolveu (trecho)</h5><pre>${escapeHtml(EXEMPLOS_LIVRO[pr.id].saida)}</pre><h5>Antes de usar</h5><ul>${EXEMPLOS_LIVRO[pr.id].revisar.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div></details>` : ''}
        <div class="output-actions">
          <button type="button" class="btn btn-outline btn-sm js-lp-copy" data-ico="copy">Copiar prompt</button>
          <a class="btn btn-outline btn-sm js-lp-open" data-ico="ext" href="https://claude.ai/new" target="_blank" rel="noopener">Abrir no Claude</a>
          ${compact || !pr.tool ? '' : `<button type="button" class="btn btn-outline btn-sm js-lp-tool">Abrir ${escapeHtml(TOOL_NAMES[pr.tool] || pr.tool)}</button>`}
        </div>
      </div>`;
    d.querySelector('.js-lp-copy').addEventListener('click', (e) => { copyText(d.querySelector('textarea').value, e.currentTarget); markUsed(pr.tool, true); });
    d.querySelector('.js-lp-open').addEventListener('click', () => markUsed(pr.tool, true));
    const bt = d.querySelector('.js-lp-tool');
    if (bt) bt.addEventListener('click', () => openTool(pr.tool));
    return d;
  }
  function refreshPromptCards() {
    document.querySelectorAll('.ls-prompt').forEach((d) => {
      const pr = PROMPTS_LIVRO.find((x) => x.id === d.dataset.prompt);
      if (!pr) return;
      const t = fillLivro(pr.texto);
      d.querySelector('textarea').value = t;
      d.querySelector('.js-lp-open').href = claudeLink(t);
      const n = pendentes(t);
      d.querySelector('.ls-pend').textContent = n ? `Troque os ${n} campo(s) entre colchetes que o seu perfil ainda não preenche. Os prompts das ferramentas do app são mais completos e já trazem as regras do seu conselho.` : 'Preenchido com o seu perfil. Revise antes de enviar.';
    });
  }

  // Faixa "No livro" em cada ferramenta
  (function livroStrips() {
    document.querySelectorAll('.tool[data-id]').forEach((tool) => {
      const id = tool.dataset.id;
      const ps = TOOL_PARTES[id];
      const body = tool.querySelector('.tool-body');
      if (!ps || !body) return;
      const n = ps[0];
      const parte = LIVRO.partes[n];
      const strip = document.createElement('div');
      strip.className = 'livro-strip';
      const extra = ps.slice(1).map((k) => `${parteNome(k)} · ${LIVRO.partes[k].titulo}`).join('; ');
      strip.innerHTML = `<div class="ls-head"><span class="ls-badge">No guia</span><b>${escapeHtml(parteNome(n))} · ${escapeHtml(parte.titulo)}</b><span class="ls-etapa">${escapeHtml(etapaTxt(parte.etapa))}${extra ? ' · também ' + escapeHtml(extra) : ''}</span></div>
        <p class="ls-pratica"><b>Na prática, até 30 minutos, hoje:</b> ${escapeHtml(TOOL_PRATICA[id] || parte.pratica)}</p>`;
      const prompts = PROMPTS_LIVRO.filter((p) => p.tool === id);
      prompts.forEach((pr) => strip.appendChild(promptCard(pr, true)));
      const desc = body.querySelector(':scope > p.desc');
      if (desc) desc.after(strip); else body.prepend(strip);
    });
  })();

  // Seção "O guia e o app"
  function renderLivroRoteiro() {
    const uso = storeGet(USO_KEY, {}) || {};
    const box = document.getElementById('livro-roteiro');
    box.innerHTML = LIVRO.etapas.map((et) => `<div class="lr-etapa"><div class="lr-n">${et.n}</div><div class="lr-body"><h3>${escapeHtml(et.nome)}</h3>${et.partes.map((n) => {
      const pt = LIVRO.partes[n];
      const nPr = PROMPTS_LIVRO.filter((p) => p.parte === n).length;
      return `<div class="lr-parte"><div class="lr-pt"><span class="lr-num">${String(n).padStart(2, '0')}</span><div><b>${escapeHtml(pt.titulo)}</b><p><span class="lr-lab">Na prática:</span> ${escapeHtml(pt.pratica)}</p><p><span class="lr-lab">Sinergia CliniLoop · ${escapeHtml(pt.sinergia)}:</span> ${escapeHtml(pt.sinTxt)}</p></div></div><div class="lr-tools">${pt.tools.map((id) => `<button type="button" class="lr-tool${uso[id] ? ' ok' : ''}" data-tool="${id}">${uso[id] ? '✓ ' : ''}${escapeHtml(TOOL_NAMES[id] || id)}</button>`).join('')}${nPr ? `<button type="button" class="lr-tool lr-pr" data-parte="${n}">${nPr} prompt${nPr > 1 ? 's' : ''} do guia</button>` : ''}</div></div>`;
    }).join('')}</div></div>`).join('') +
      `<div class="lr-etapa lr-anexo"><div class="lr-n">+</div><div class="lr-body"><h3>Anexos</h3><div class="lr-tools"><button type="button" class="lr-tool" data-tab-go="glossario">Glossário (75 termos)</button><button type="button" class="lr-tool" data-tab-go="ia">As quatro regras de IA</button></div></div></div>`;
    box.querySelectorAll('[data-tool]').forEach((b) => b.addEventListener('click', () => openTool(b.dataset.tool)));
    box.querySelectorAll('[data-parte]').forEach((b) => b.addEventListener('click', () => { livroTab('prompts'); const d = document.querySelector(`#livro-prompts .ls-prompt[data-parte-n="${b.dataset.parte}"]`); if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }));
    box.querySelectorAll('[data-tab-go]').forEach((b) => b.addEventListener('click', () => livroTab(b.dataset.tabGo)));
  }
  (function livroPrompts() {
    const box = document.getElementById('livro-prompts');
    PROMPTS_LIVRO.forEach((pr) => { const c = promptCard(pr, false); c.dataset.parteN = String(pr.parte); box.appendChild(c); });
  })();
  (function livroIA() {
    document.getElementById('livro-estrutura').innerHTML = ESTRUTURA_PROMPT.map(([t, d]) => `<li><b>${escapeHtml(t)}.</b> ${escapeHtml(d)}</li>`).join('');
    document.getElementById('livro-regras').innerHTML = REGRAS_IA.map(([t, d]) => `<li><b>${escapeHtml(t)}.</b> ${escapeHtml(d)}</li>`).join('');
    document.getElementById('livro-exemplo').textContent = EXEMPLO_PROMPT;
    document.getElementById('livro-exemplo-copy').addEventListener('click', (e) => copyText(EXEMPLO_PROMPT, e.currentTarget));
  })();
  (function glossario() {
    const dl = document.getElementById('glos-lista');
    const render = () => {
      const q = normTxt(document.getElementById('glos-busca').value).trim();
      const itens = GLOSSARIO.filter(([t, d]) => !q || normTxt(t + ' ' + d).includes(q));
      dl.innerHTML = itens.length ? itens.map(([t, d]) => `<div><dt>${escapeHtml(t)}</dt><dd>${escapeHtml(d)}</dd></div>`).join('') : '<div class="glos-vazio">Nenhum termo encontrado.</div>';
    };
    document.getElementById('glos-busca').addEventListener('input', render);
    render();
  })();
  function livroTab(tab) {
    document.querySelectorAll('.livro-tabs [data-tab]').forEach((b) => { const on = b.dataset.tab === tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    document.querySelectorAll('.livro-panel').forEach((p) => { p.hidden = p.dataset.panel !== tab; });
  }
  document.querySelectorAll('.livro-tabs [data-tab]').forEach((b) => b.addEventListener('click', () => livroTab(b.dataset.tab)));

  // As sete decisões com os números do app (últimos 30 dias)
  function sinsDados() {
    const lim = addDays(todayISO(), -30);
    const em = (d) => d && d >= lim;
    const cs = conteudos.filter((c) => em(c.data));
    const sum = (k) => cs.reduce((a, c) => a + (Number(c[k]) || 0), 0);
    const temPac = pacientes.length > 0;
    const h = (k) => pacientes.filter((p) => p.hist && em(p.hist[k])).length;
    const faltas = pacientes.reduce((a, p) => a + (p.ativ || []).filter((x) => /^Falta/.test(x.t) && em(x.d)).length, 0);
    const altas = pacientes.filter((p) => p.etapa === 'Encerrado' && p.resultado === 'Alta e vínculo' && p.hist && em(p.hist.Encerrado)).length;
    const v = [
      cs.length ? `${sum('alcance').toLocaleString('pt-BR')} de alcance em ${cs.length} peça(s)` : '—',
      cs.length ? `${sum('envios') + sum('salv')} envios e salvamentos` : '—',
      temPac ? `${pacientes.filter((p) => p.colega && em(p.criado)).length} indicação(ões) de colegas` : '—',
      temPac ? `${pacientes.filter((p) => em(p.criado)).length} novo(s) contato(s)` : '—',
      temPac ? `${h('Agendado')} agendado(s)` : '—',
      temPac ? `${h('Avaliado')} compareceram${faltas ? ' · ' + faltas + ' falta(s)' : ''}` : '—',
      temPac ? `${h('Em tratamento')} iniciaram${altas ? ' · ' + altas + ' alta(s)' : ''}` : '—'
    ];
        return SINS.map(([nome, desc], i) => ({ nome: `${i + 1}. ${nome}`, desc, valor: v[i] }));
  }
  function renderSins() {
    const box = document.getElementById('livro-sins');
    box.innerHTML = `<div class="sins-grid">${sinsDados().map((x, i) => `<div class="sin${i < 2 ? ' vis' : (i === 2 ? ' rel' : ' crm')}"><span class="sin-n">${escapeHtml(x.nome)}</span><p>${escapeHtml(x.desc)}</p><b>${escapeHtml(x.valor)}</b></div>`).join('')}</div><p class="livro-note">Visibilidade e autoridade · relacionamento profissional · atendimento e CRM.</p>`;
  }

  // Métricas que importam (Parte 11), por origem, profissional e dia da semana
  function renderMetricasLivro() {
    const box = document.getElementById('metricas-livro');
    const lim = addDays(todayISO(), -90);
    const coorte = pacientes.filter((p) => p.criado >= lim);
    if (!coorte.length) { box.innerHTML = '<p class="plan-note">Registre os contatos no Rastreador para ver as taxas de agendamento, comparecimento, aceitação e conclusão.</p>'; return; }
    const H = (ps, k) => ps.filter((p) => p.hist && p.hist[k]).length;
    const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '—');
    const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const altas = (ps) => ps.filter((p) => p.etapa === 'Encerrado' && p.resultado === 'Alta e vínculo' && p.hist && p.hist['Em tratamento']).length;
    const faltas90 = pacientes.reduce((a, p) => a + (p.ativ || []).filter((x) => /^Falta/.test(x.t) && x.d >= lim).length, 0);
    const inv = campanhas.reduce((a, c) => a + (Number(c.inv) || 0), 0);
    const compCamp = campanhas.reduce((a, c) => a + campStats(c).avaliados, 0);
    const ativos = colegas.filter((c) => recebidas90(c) > 0);
    const indic = coorte.filter((p) => p.colega).length;
    const ag = H(coorte, 'Agendado'); const av = H(coorte, 'Avaliado'); const pl = H(coorte, 'Plano proposto'); const ini = H(coorte, 'Em tratamento');
    const linhas = [
      ['Taxa de agendamento', 'Agendados ÷ novos contatos', pct(ag, coorte.length), 'Qualidade do atendimento e do tráfego'],
      ['Taxa de comparecimento', 'Compareceram ÷ agendados', pct(av, ag), 'Eficácia da sequência de confirmação'],
      ['Taxa de faltas', 'Faltas registradas ÷ agendados', ag ? pct(faltas90, ag) : '—', 'Linha de base para o próximo mês'],
      [semPacote() ? 'Taxa de adesão' : 'Taxa de aceitação de planos', semPacote() ? 'Em acompanhamento ÷ retornos agendados' : 'Iniciaram ÷ planos propostos', pct(ini, pl), semPacote() ? 'Adesão à conduta' : 'Fechamento, por profissional'],
      ['Taxa de conclusão', 'Altas ÷ iniciados', pct(altas(coorte), ini), 'Adesão e resultado clínico'],
      ['Custo por paciente que compareceu', 'Investimento em mídia ÷ comparecimentos das campanhas', inv && compCamp ? brl(inv / compCamp) : '—', 'Onde investir'],
      ['Indicações por colega', 'Indicações ÷ colegas ativos ÷ 3 meses', ativos.length ? (indic / ativos.length / 3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' por mês' : '—', 'Saúde da rede']
    ];
    const grupo = (chave) => {
      const g = {};
      coorte.forEach((p) => { const k = chave(p) || '(não informado)'; (g[k] = g[k] || []).push(p); });
      return Object.entries(g).sort((a, b) => b[1].length - a[1].length);
    };
    const tab = (titulo, rows) => `<h5 class="ml-h">${titulo}</h5><div class="num-wrap"><table class="num-table"><tr><th></th><th>Contatos</th><th>Agendados</th><th>Compareceram</th><th>Comparecimento</th><th>Iniciaram</th><th>Receita dos planos iniciados</th></tr>${rows.map(([k, ps]) => { const a = H(ps, 'Agendado'); const c = H(ps, 'Avaliado'); const i = H(ps, 'Em tratamento'); const rec = ps.filter((p) => p.hist && p.hist['Em tratamento']).reduce((s, p) => s + (Number(String(p.valor).replace(',', '.')) || 0), 0); return `<tr><td style="text-align:left">${escapeHtml(k)}</td><td>${ps.length}</td><td>${a}</td><td>${c}</td><td>${pct(c, a)}</td><td>${i}</td><td>${rec ? brl(rec) : '—'}</td></tr>`; }).join('')}</table></div>`;
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const fd = [0, 0, 0, 0, 0, 0, 0];
    pacientes.forEach((p) => (p.ativ || []).forEach((x) => { if (/^Falta/.test(x.t) && x.d >= lim) fd[new Date(x.d + 'T12:00').getDay()]++; }));
    const profs = grupo((p) => p.prof);
    box.innerHTML = `<div class="num-wrap"><table class="num-table ml-table"><tr><th>Métrica</th><th>Como calcular</th><th>Últimos 90 dias</th><th>Para que serve</th></tr>${linhas.map((l) => `<tr><td style="text-align:left"><b>${escapeHtml(l[0])}</b></td><td style="text-align:left">${escapeHtml(l[1])}</td><td>${escapeHtml(l[2])}</td><td style="text-align:left">${escapeHtml(l[3])}</td></tr>`).join('')}</table></div>` +
      tab('Por origem', grupo((p) => p.origem)) + (profs.length > 1 || (profs[0] && profs[0][0] !== '(não informado)') ? tab('Por profissional', profs) : '') +
      (faltas90 ? `<h5 class="ml-h">Faltas por dia da semana</h5><div class="num-wrap"><table class="num-table"><tr>${dias.map((d) => `<th>${d}</th>`).join('')}</tr><tr>${fd.map((n) => `<td>${n}</td>`).join('')}</tr></table></div>` : '<p class="plan-note">Registre "Falta (no-show)" como atividade no Rastreador para ver as faltas por dia da semana.</p>');
  }

  // Blocos de referência do guia nas ferramentas
  (function refs() {
    const E = escapeHtml;
    document.getElementById('ref-trafego').innerHTML = `<p class="plan-note">Anúncio não conserta perfil fraco nem atendimento lento; ele acelera o que já funciona. A ordem é: perfil pronto, conteúdo orgânico testado, atendimento e CRM prontos, e só então dinheiro em mídia.</p>
      <div class="num-wrap"><table class="num-table"><tr><th>Situação do paciente</th><th>Plataforma</th><th>Tipo de campanha</th></tr>
      <tr><td style="text-align:left">Já sabe que precisa e está procurando</td><td>Google Ads</td><td style="text-align:left">Pesquisa, com palavras-chave de intenção e local</td></tr>
      <tr><td style="text-align:left">Precisa, mas ainda não está procurando</td><td>Meta Ads</td><td style="text-align:left">Mensagens para WhatsApp com Reel educativo</td></tr>
      <tr><td style="text-align:left">Ainda não conhece você</td><td>Meta Ads e YouTube</td><td style="text-align:left">Alcance ou visualização de vídeo de autoridade</td></tr>
      <tr><td style="text-align:left">Já interagiu e não agendou</td><td>Meta Ads</td><td style="text-align:left">Público de envolvimento com o perfil (sem listas de pacientes)</td></tr></table></div>
      <h5 class="ml-h">Checklist do impulsionamento</h5><ul class="check-list">${IMPULSO_CHECK.map((x) => `<li>${E(x)}</li>`).join('')}</ul>
      <p class="plan-note">ROAS é a receita atribuída dividida pelo gasto em anúncios. Só calcule com rastreamento real até o paciente que iniciou o tratamento, e não o confunda com o ciclo de adaptação de referências da Parte 4, que é um método de criação de roteiros.</p>`;
    document.getElementById('ref-atend').innerHTML = `<ul class="check-list"><li>Primeira resposta em até 5 minutos no horário comercial. Fora dele, resposta automática que informa quando haverá retorno e já oferece horários.</li><li>Todo contato vira um registro no Rastreador com origem (Instagram orgânico, Meta Ads, Google, indicação de colega e qual, paciente antigo).</li><li>Toda conversa termina com um próximo passo marcado: consulta agendada, retorno combinado ou motivo de perda registrado.</li></ul>
      <h5 class="ml-h">Roteiro de agendamento em cinco mensagens</h5><ol class="livro-ol">${AGENDAMENTO_5.map(([t, d]) => `<li><b>${E(t)}.</b> ${E(d)}</li>`).join('')}</ol>
      <p class="plan-note"><b>Quem não agendou na hora:</b> até três retomadas (no dia seguinte, em 3 dias e em 7 dias), sempre com algo útil e nunca com pressão. Depois disso, a pessoa vai para uma lista de relacionamento, se consentiu.</p>
      <h5 class="ml-h">Sequência de confirmação</h5><div class="num-wrap"><table class="num-table"><tr><th>Quando</th><th>Mensagem</th><th>Objetivo</th></tr>${CONFIRMACAO.map((r) => `<tr>${r.map((c) => `<td style="text-align:left">${E(c)}</td>`).join('')}</tr>`).join('')}</table></div>
      <p class="plan-note">Agende o retorno antes de o paciente sair da consulta. Mantenha lista de espera para vagas liberadas. Pacientes com duas faltas seguidas recebem contato humano, não automático. Registre cada falta como atividade no Rastreador: o Painel mostra a taxa de faltas por origem, profissional e dia da semana.</p>`;
    document.getElementById('ref-fecha').innerHTML = `<ol class="livro-ol">${FECHAMENTO_5.map(([t, d]) => `<li><b>${E(t)}.</b> ${E(d)}</li>`).join('')}</ol>
      <div class="num-wrap"><table class="num-table"><tr><th>Objeção</th><th>Resposta</th></tr>${OBJECOES.map(([o, r]) => `<tr><td style="text-align:left">${E(o)}</td><td style="text-align:left">${E(r)}</td></tr>`).join('')}</table></div>
      <p class="plan-note">Médicos, psiquiatras e psicólogos: o fechamento é a adesão. O paciente entende a conduta, agenda o retorno e segue o tratamento. Em saúde mental, qualquer contato de acompanhamento parte de critério clínico, nunca de meta comercial.</p>`;
    document.getElementById('ritual-list').innerHTML = RITUAL.map((x) => `<li>${E(x)}</li>`).join('');
  })();
  function renderQuemIndica() {
    const box = document.getElementById('quem-indica');
    const ks = cfg.profissional === 'multi' ? (cfg.multiProf || []) : (cfg.profissional ? [cfg.profissional] : Object.keys(QUEM_INDICA).filter((k) => k !== 'psiquiatra'));
    const rows = [...new Set(ks.map((k) => QUEM_INDICA[k]).filter(Boolean))];
    box.innerHTML = rows.length ? `<div class="num-wrap"><table class="num-table qi-table"><tr><th>Você é</th><th>Quem pode indicar você</th><th>Para quem você pode indicar</th></tr>${rows.map((r) => `<tr>${r.map((c) => `<td style="text-align:left">${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</table></div><p class="plan-note"><b>Limites inegociáveis:</b> não pague, não receba e não prometa vantagem financeira por encaminhamento. Indicação se retribui com qualidade, retorno técnico e reciprocidade quando faz sentido clínico. O paciente sempre tem liberdade de escolher outro profissional.</p>` : '';
  }
  function renderCanaisCheck() {
    const box = document.getElementById('canais-check');
    const st = storeGet(CANAIS_KEY, {}) || {};
    const abertos = new Set([...box.querySelectorAll('details[open]')].map((d) => d.dataset.canal));
    box.innerHTML = CANAIS_CHECK.map(([id, nome, prio, itens]) => {
      const feitos = itens.filter((_, i) => st[`${id}-${i}`]).length;
      return `<details class="canal" data-canal="${id}"${abertos.has(id) ? ' open' : ''}><summary><b>${escapeHtml(nome)}</b><span class="canal-prio">${escapeHtml(prio)}</span><span class="canal-n${feitos === itens.length ? ' ok' : ''}">${feitos} de ${itens.length}</span><span class="chevron">▸</span></summary><ul>${itens.map((t, i) => `<li><label><input type="checkbox" data-k="${id}-${i}"${st[`${id}-${i}`] ? ' checked' : ''}> ${escapeHtml(t)}</label></li>`).join('')}</ul></details>`;
    }).join('');
    box.querySelectorAll('input[data-k]').forEach((cb) => cb.addEventListener('change', () => {
      const s = storeGet(CANAIS_KEY, {}) || {};
      if (cb.checked) s[cb.dataset.k] = todayISO(); else delete s[cb.dataset.k];
      storeSet(CANAIS_KEY, s);
      markUsed('perfil', true);
      renderCanaisCheck();
    }));
  }
  function renderTemasSug() {
    const el = document.getElementById('cfg-temas-sug');
    const k = cfg.profissional === 'multi' ? (cfg.multiProf || [])[0] : cfg.profissional;
    const t = TEMAS_PROF[k];
    if (!t) { el.textContent = 'Educar, humanizar e desmistificar (Parte 4). Todo post precisa caber em um deles.'; return; }
    el.innerHTML = `Sugestão do guia para ${escapeHtml(PROFISSIONAIS[k].label.toLowerCase())}: educar (${escapeHtml(t[0])}), humanizar (${escapeHtml(t[1])}) e desmistificar (${escapeHtml(t[2])}). `;
    if (!cfg.baldes) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'linkish'; b.textContent = 'Usar estas sugestões';
      b.addEventListener('click', () => { const inp = document.getElementById('cfg-baldes'); inp.value = TEMAS_CURTOS[k].join(', '); inp.dispatchEvent(new Event('input', { bubbles: true })); });
      el.appendChild(b);
    }
  }
  // Campanha: o tipo muda os campos
  (function campTipo() {
    const sel = document.getElementById('ca-tipo');
    const sync = () => { document.getElementById('ca-post-wrap').hidden = sel.value !== 'impulsionamento'; };
    sel.addEventListener('change', sync);
    sync();
  })();

  function renderLivro() {
    refreshPromptCards();
    renderLivroRoteiro();
    renderSins();
    renderMetricasLivro();
    renderQuemIndica();
    renderTemasSug();
  }
  renderCanaisCheck();
  renderLivro();
  document.addEventListener('cliniloop:dados', renderLivro);
