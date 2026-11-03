
  // ===================== Biblioteca de ferramentas =====================
  // A cesta completa, organizada por objetivo, com busca. Cada ferramenta diz para que serve, o que recebe,
  // o que entrega e o que vem depois. Não é um segundo catálogo: cada cartão abre a ferramenta onde ela mora.
  const BIB_GRUPOS = [
    ['Diferenciação e posicionamento', 'O eixo de tudo: o que só você oferece, e para quem.'],
    ['Presença digital', 'Cada perfil respondendo quem é você, quem você ajuda e como marcar.'],
    ['Conteúdo e comunicação', 'Peças que mostram o que você decidiu elevar e criar.'],
    ['Colegas e aquisição', 'Indicação e anúncios que amplificam a diferença, sem prometer resultado.'],
    ['Atendimento e relacionamento', 'A conversa que sustenta o que você anuncia.'],
    ['Gestão e evolução', 'Números com ressalvas, a rotina da semana e a revisão da estratégia.'],
    ['Apoios', 'Ética, terceiros, ferramentas externas, o guia e os seus dados.']
  ];
  // [id, grupo, para que serve, recebe, entrega, depois]
  const BIB = [
    ['config', 0, 'Carregar as regras do seu conselho e o seu objetivo em todos os prompts.', 'Profissão, registro, especialidade, cidade, serviços e objetivo.', 'O contexto que nenhuma ferramenta pede de novo.', 'Seu paciente ideal'],
    ['publico', 0, 'Saber quem você mais ajuda e quem não é o seu paciente.', 'Quem você atende hoje e as dúvidas que mais ouve.', 'ICP e persona do paciente, para revisar e aprovar.', 'Estratégia Oceano Azul'],
    ['oceano', 0, 'Sair da disputa pelo preço com uma diferença que um colega não poderia assinar.', 'Fatores do mercado, o que os pacientes dizem, quem não procura e as quatro ações.', 'Proposta de valor, marcada como hipótese ou aprovada, e o que falta validar.', 'Perfis, uma rede por vez'],
    ['nicho', 0, 'Aprofundar o nicho e olhar a concorrência local.', 'Formações, métodos e serviços.', 'Análise de nicho e uma frase para comparar com o Oceano Azul.', 'Aprovar a proposta no passo 3'],
    ['profissional', 0, 'Definir o seu tom de voz, a sua história e os seus limites.', 'A sua trajetória e os seus valores.', 'Marca e tom de voz, para revisar e aprovar.', 'Roteiros e copy'],
    ['formacao', 0, 'Mostrar títulos e eventos dentro das regras do conselho.', 'Formação, área e eventos dos próximos meses.', 'Plano de formação e como comunicar cada título.', 'Perfis (LinkedIn)'],
    ['perfil', 1, 'Fazer cada rede mostrar a sua diferença e dizer como marcar.', 'O texto de hoje de cada rede, parte por parte.', 'Textos revisados por rede e o checklist de configuração.', 'Pautas e palavras-chave'],
    ['pautas', 2, 'Transformar as dúvidas reais dos pacientes num calendário.', 'Banco de dúvidas, formatos e datas.', 'Palavras-chave, 30 pautas e o calendário de 4 semanas.', 'Roteiros e copy'],
    ['roteiro', 2, 'Escrever a peça com a sua voz e a sua diferença.', 'Uma pauta e o formato (Reel, carrossel, YouTube, LinkedIn).', 'Roteiro com ganchos e versão em blocos para o teleprompter.', 'Verificador ético e Diário de conteúdo'],
    ['reaproveitamento', 2, 'Fazer uma aula, um podcast ou uma entrevista render várias peças.', 'A transcrição, sem dados de pacientes.', 'Carrossel, guia, Reel e Stories, com pendências de fonte e autoria.', 'Verificador ético'],
    ['colegas', 3, 'Ter colegas que indicam e recebem os seus pacientes.', 'Colegas que atendem o mesmo paciente antes ou depois de você.', 'Funil de colegas, carta de apresentação e contrarreferência.', 'Gerador de campanhas'],
    ['campanha', 3, 'Amplificar com anúncio o que já funciona no orgânico.', 'Serviço, meta, prazo e o post que funcionou.', 'Ficha da campanha e as peças, para registrar e medir.', 'Verificador ético e Rastreador'],
    ['atendimento', 4, 'Fazer a conversa no WhatsApp virar consulta, sustentando o que você anuncia.', 'As perguntas que mais chegam e quem responde.', 'Respostas rápidas, roteiro de agendamento, confirmação e retomadas.', 'Rastreador de contatos'],
    ['rastreador', 4, 'Não esquecer nenhum contato e saber de onde cada um veio.', 'Nome, origem e próximo passo com data.', 'Filas de vencidos, de hoje e sem próximo passo, lembretes e planilha.', 'Ritual da semana'],
    ['painel', 5, 'Ler os números da semana, com período e ressalvas.', 'Conteúdos e contatos registrados.', 'Métricas por semana e uma leitura do gargalo, quando houver dados.', 'Assistente da semana'],
    ['assistente', 5, 'Organizar os 30 minutos do ritual semanal.', 'Pendências do rastreador, dos colegas e a meta de conteúdo.', 'A agenda da semana em blocos.', 'Marcar o ritual da semana'],
    ['ebook', 5, 'Juntar tudo num documento para revisar a cada 2 semanas.', 'O que está salvo no app.', 'Playbook da clínica com plano de 90 dias e revisões.', 'Revisar a estratégia quando os dados pedirem'],
    ['etica', 6, 'Revisar qualquer texto ou anúncio antes de publicar.', 'O texto, a legenda ou o anúncio.', 'Os pontos que conflitam com o seu conselho, a LGPD e as plataformas.', 'Corrigir e publicar'],
    ['briefing', 6, 'Contratar agência, social media ou editor sem perder a sua diferença.', 'Quem vai produzir e o que você precisa.', 'Briefing com escopo, regras do conselho, aprovação e métricas.', 'Enviar a 2 ou 3 fornecedores'],
    ['ferramentas', 6, 'Gravar, editar e criar imagens com o que cabe no orçamento.', 'O tipo de peça e o seu orçamento.', 'Kit de gravação, editores, geradores de imagem e o pedido de imagem para a IA.', 'Roteiros e copy'],
    ['#livro', 6, 'Consultar o guia sem sair do app.', 'Nada: é leitura.', 'Roteiro em seis etapas, plano de 30 dias, biblioteca de prompts e glossário.', 'Voltar ao seu passo'],
    ['#ajustes', 6, 'Escolher a sua IA, fazer backup e restaurar os seus dados.', 'Sua preferência de IA e o arquivo de backup.', 'Backup conferido, restauração com proteção e o Projeto para o Claude.', 'Voltar ao caminho']
  ];
  const BIB_NOME = { '#livro': 'O guia no app', '#ajustes': 'Ajustes e backup' };
  // Palavras que as pessoas usam para procurar cada ferramenta.
  const BIB_KW = {
    config: 'perfil consultorio registro conselho objetivo meta', publico: 'icp persona paciente ideal publico', oceano: 'oceano azul diferenca diferencial proposta de valor posicionamento estrategia',
    nicho: 'nicho concorrencia diferencial', profissional: 'marca pessoal tom de voz historia', formacao: 'titulos congresso cursos autoridade linkedin',
    perfil: 'bio instagram google maps ficha linkedin youtube tiktok perfil rede social', pautas: 'pautas calendario palavras-chave seo duvidas', roteiro: 'roteiro reels carrossel video legenda copy texto post',
    reaproveitamento: 'aula podcast entrevista transcricao reaproveitar', colegas: 'colegas indicacao encaminhamento carta medico', campanha: 'anuncio anuncios impulsionar turbinar meta ads google ads trafego campanha',
    atendimento: 'whatsapp mensagem resposta agendamento confirmacao falta', rastreador: 'crm contatos pacientes leads funil retorno lembrete', painel: 'metricas numeros gargalo resultado',
    assistente: 'semana agenda ritual rotina', ebook: 'playbook documento plano 90 dias', etica: 'etica conselho cfm cfo crp coffito cfn lgpd revisar post anuncio',
    briefing: 'agencia social media terceiros fornecedor contratar', ferramentas: 'canva capcut camera microfone imagem ia editor', '#livro': 'guia livro prompts glossario plano 30 dias', '#ajustes': 'backup restaurar ia chave api projeto claude configuracoes'
  };
  function bibOnde(id) {
    if (id[0] === '#') return 'Nesta página';
    const n = TOOL_PASSO[id];
    return n ? `Passo ${n}` : 'Abre logo abaixo';
  }
  (function montarBiblioteca() {
    const box = document.getElementById('biblioteca');
    if (!box) return;
    box.innerHTML = BIB_GRUPOS.map(([g, d], gi) => `<section class="bib-grupo" data-g="${gi}" aria-labelledby="bib-g${gi}"><h3 id="bib-g${gi}">${escapeHtml(g)}</h3><p class="bib-gd">${escapeHtml(d)}</p><div class="bib-cards">${BIB.filter((x) => x[1] === gi).map(([id, , serve, recebe, entrega, depois]) => {
      const nome = BIB_NOME[id] || TOOL_NAMES[id] || id;
      const busca = normTxt([nome, serve, recebe, entrega, BIB_GRUPOS[gi][0], BIB_KW[id] || ''].join(' '));
      const abrir = id[0] === '#' ? `<a class="btn btn-outline btn-sm" href="${id}">Abrir</a>` : `<button type="button" class="btn btn-outline btn-sm" data-abrir="${id}">Abrir</button>`;
      return `<article class="bib-card" data-busca="${escapeHtml(busca)}"><div class="bib-h"><h4>${escapeHtml(nome)}${id === 'oceano' ? ' <span class="bib-eixo">eixo do sistema</span>' : ''}</h4><span class="bib-onde">${bibOnde(id)}</span></div><p class="bib-serve">${escapeHtml(serve)}</p><dl><dt>Recebe</dt><dd>${escapeHtml(recebe)}</dd><dt>Entrega</dt><dd>${escapeHtml(entrega)}</dd><dt>Depois</dt><dd>${escapeHtml(depois)}</dd></dl>${abrir}</article>`;
    }).join('')}</div></section>`).join('');
    const q = document.getElementById('bib-q'); const n = document.getElementById('bib-n');
    const filtra = () => {
      const t = normTxt(q.value).trim();
      let vis = 0;
      box.querySelectorAll('.bib-card').forEach((c) => { const ok = !t || t.split(/\s+/).every((w) => c.dataset.busca.indexOf(w) >= 0); c.hidden = !ok; if (ok) vis++; });
      box.querySelectorAll('.bib-grupo').forEach((g) => { g.hidden = !g.querySelector('.bib-card:not([hidden])'); });
      n.textContent = t ? (vis ? `${vis} ferramenta(s) encontrada(s).` : 'Nenhuma ferramenta com esse termo. Tente outra palavra, como "perfil", "anúncio" ou "paciente".') : '';
    };
    q.addEventListener('input', filtra);
  })();

  // Tabelas largas rolam para o lado: precisam ser alcançáveis pelo teclado e ter nome para o leitor de tela.
  (function tabelasRolaveis() {
    const marca = () => document.querySelectorAll('.num-wrap:not([tabindex])').forEach((w) => { w.tabIndex = 0; w.setAttribute('role', 'region'); w.setAttribute('aria-label', 'Tabela: role para o lado para ver todas as colunas'); });
    marca();
    let t = null;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(marca, 50); }).observe(document.body, { childList: true, subtree: true });
  })();
