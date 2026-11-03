"""Testes de aceite do caminho (jornada do herói em 9 passos), com dados fictícios.
Uso: python3 scripts/teste_caminho.py  (depois de python3 build.py)"""
from playwright.sync_api import sync_playwright
import json, os, tempfile
URL = 'file:///home/claude/cliniloop/index.html'
R = {}
def ok(k, v): R[k] = bool(v); print(('OK  ' if v else 'FAIL') + ' ' + k)
abertos = lambda pg: pg.evaluate("[...document.querySelectorAll('.passo.aberto')].map(x=>x.dataset.passo)")
estado = lambda pg, n: pg.evaluate(f"estadoPasso({n})")
NOCSS = 'html{scroll-behavior:auto!important}'

def preencher_obrigatorios(pg, form_sel):
    pg.evaluate(f"""document.querySelectorAll('{form_sel} [required]').forEach((el) => {{
        if (el.tagName === 'SELECT') {{ if (!el.value) el.selectedIndex = Math.min(1, el.options.length - 1); }}
        else if (!el.value) el.value = 'Teste fictício'; el.dispatchEvent(new Event('input', {{bubbles: true}})); }})""")

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 900})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: d.accept())
    pg.goto(URL); pg.evaluate('localStorage.clear()'); pg.reload(); pg.wait_for_timeout(400); pg.add_style_tag(content=NOCSS)

    # 1. O diferencial do produto é construir a diferenciação
    ok('A1 primeira visita fala de diferença', 'Descubra sua diferença' in pg.inner_text('#hero-t'))
    ok('A1 uma única ação primária', pg.locator('.hero .btn').count() == 1 and pg.inner_text('#hero-cta') == 'Construir minha diferenciação')
    ok('A1 Oceano Azul é o passo 3 e o eixo da biblioteca', 'Oceano Azul' in pg.inner_text('#passo-3 .passo-titulo') and 'eixo do sistema' in pg.inner_text('#biblioteca').lower())
    ok('A1 nove passos em três atos', pg.locator('.passo').count() == 9 and 'a partida' in pg.inner_text('.mov[data-mov="1"]').lower())
    ok('sem funil, fases ou trilha antigos', pg.evaluate("!document.getElementById('funil') && !document.getElementById('jornada') && !document.querySelector('.hero-funil')"))
    ok('Hoje escondido na primeira visita', not pg.is_visible('#hoje'))
    # teclado: Enter no botão abre o passo 1 e leva o foco para ele
    pg.focus('#hero-cta'); pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
    ok('A10 teclado: Enter abre o passo e move o foco', abertos(pg) == ['1'] and pg.evaluate("document.activeElement.closest('#passo-1') !== null"))

    # passo 1: contexto essencial, com erro associado ao campo
    pg.click('#passo-1 .js-passo-ok'); pg.wait_for_timeout(200)
    ok('lista o que falta (contexto essencial)', 'Faltam 6 campos' in pg.inner_text('#passo-1 .passo-falta'))
    ok('A10 erro associado ao campo', pg.get_attribute('#cfg-registro', 'aria-invalid') == 'true' and pg.get_attribute('#cfg-registro', 'aria-describedby') == 'passo-1-falta')
    pg.click('label.type-card:has(input[value=dentista])')
    for k, v in [('#cfg-registro', 'CRO-SP 12345'), ('#cfg-espec', 'implantodontia'), ('#cfg-cidade', 'Moema, São Paulo'), ('#cfg-servicos', 'implantes, clareamento'), ('#cfg-meta', '8 avaliações de implante por mês em 90 dias')]:
        pg.fill(k, v)
    pg.wait_for_timeout(450)
    ok('passo 1 pronto sem a formação (aprofundar)', estado(pg, 1) == 'pronto')
    pg.click('#passo-1 .js-passo-ok'); pg.wait_for_timeout(250)
    ok('segue para o passo 2', abertos(pg) == ['2'])
    pg.fill('#cfg-publico', 'adultos de 40 a 65 anos com medo de dentista'); pg.fill('#cfg-icp-dor', 'medo de implante doer'); pg.wait_for_timeout(450)
    pg.click('#passo-2 .js-passo-ok'); pg.wait_for_timeout(250)
    ok('segue para o Oceano Azul', abertos(pg) == ['3'])

    # Oceano Azul em etapas, uma de cada vez
    ok('uma etapa de cada vez', pg.evaluate("[...document.querySelectorAll('#oa-form > fieldset.oa-step')].filter(f=>!f.hidden).length") == 1)
    for i in range(5): pg.check(f'#oa-f{i}')
    pg.click('#oa-pe button.btn-teal'); pg.wait_for_timeout(150)
    ok('etapa de evidência pode ficar para depois', 'Fazer depois' in pg.inner_text('#oa-pe') and 'evidência' in pg.inner_text('#oa-nav').lower())
    pg.click('[data-oa-etapa="4"]'); pg.wait_for_timeout(150)
    pg.fill('#oa-elevar', '- Plano de tratamento por escrito'); pg.fill('#oa-criar', '- Guia de preparação para a primeira consulta'); pg.wait_for_timeout(300)
    pg.click('[data-oa-etapa="7"]'); pg.wait_for_timeout(200)
    ok('rascunho da proposta na etapa 7', 'Plano de tratamento por escrito'.lower() in pg.input_value('#oa-proposta').lower())
    pg.fill('#cfg-transf', 'Atendimento humanizado e de qualidade'); pg.wait_for_timeout(450)
    ok('alerta de proposta genérica', 'humanizado' in pg.inner_text('#est-aprovacao') and 'serve para qualquer colega' in pg.inner_text('#est-aprovacao'))
    pg.click('#usar-rascunho'); pg.wait_for_timeout(450)
    ok('A3 sem evidência continua hipótese', estado(pg, 3) == 'andamento' and pg.evaluate("estrategia().status") == 'hipotese')
    ctx = pg.evaluate("contextBlock('roteiro')")
    ok('A3 prompt marca hipótese e não inventa', 'HIPÓTESE' in ctx and 'NENHUMA coletada' in ctx and 'Não invente credenciais' in ctx and 'AINDA NÃO acontece' in ctx)
    pg.click('#passo-3 .js-passo-ok'); pg.wait_for_timeout(250)
    ok('segue com a hipótese para os perfis', abertos(pg) == ['4'] and estado(pg, 3) != 'pronto')

    # 2. A diferença muda as entregas: presença, conteúdo e atendimento
    pg.click('details.rede[data-rede=instagram] > summary')
    pg.click('form[data-tool=rede-instagram] button[type=submit]'); pg.wait_for_timeout(150)
    ok('rede vazia não gera prompt', 'Cole pelo menos uma parte' in pg.inner_text('form[data-tool=rede-instagram] .form-msg'))
    pg.fill('#rd-instagram-nome', 'Dra Ana'); pg.fill('#rd-instagram-bio', 'Sorrisos lindos | Agende já')
    pg.click('form[data-tool=rede-instagram] button[type=submit]'); pg.wait_for_timeout(200)
    out_p = pg.input_value('#out-rede-instagram')
    prop = pg.evaluate("estrategia().proposta")
    ok('A2 presença: o prompt da rede leva a proposta e as quatro ações', prop and prop in out_p and 'Elevar: Plano de tratamento por escrito' in out_p)
    ok('A7 prompt gerado não conclui o passo', estado(pg, 4) == 'andamento')
    ok('ciclo da IA visível', pg.locator('form[data-tool=rede-instagram] .ciclo-ia li').count() == 4)
    pg.evaluate("openTool('roteiro')"); preencher_obrigatorios(pg, 'form[data-tool=roteiro]')
    pg.click('form[data-tool=roteiro] button[type=submit]'); pg.wait_for_timeout(200)
    ok('A2 conteúdo: o roteiro leva a proposta', prop in pg.input_value('#out-roteiro') and 'Criar: Guia de preparação' in pg.input_value('#out-roteiro'))
    pg.evaluate("openTool('atendimento')"); preencher_obrigatorios(pg, 'form[data-tool=atendimento]')
    pg.click('form[data-tool=atendimento] button[type=submit]'); pg.wait_for_timeout(200)
    ok('A2 atendimento: as respostas levam a proposta', prop in pg.input_value('#out-atendimento'))
    ok('faixa da diferença nas ferramentas', 'Hipótese' in pg.inner_text('.tool[data-id=roteiro] .dif-faixa'))

    # 6. Aprovar, mudar a estratégia e ver as entregas para revisar, com a versão anterior guardada
    pg.evaluate("abrirPasso(4,{scroll:false}); document.querySelector('.saved-slot[data-save=perfil] details').open=true")
    pg.fill('#save-perfil', 'Bio revisada: Cirurgiã-dentista (CRO-SP 12345) | Implantes sem medo | Moema')
    pg.wait_for_timeout(500)
    ok('rascunho não é aprovação', pg.evaluate("!resultados().perfil") and 'não aprovado' in pg.inner_text('.saved-slot[data-save=perfil] .js-sv-st'))
    pg.click('.saved-slot[data-save=perfil] .js-aprovar'); pg.wait_for_timeout(200)
    ok('aprovar guarda com a estratégia', pg.evaluate("resultados().perfil.ev === estrategia().hash"))
    pg.evaluate("openTool('oceano'); oaIr(7)"); pg.wait_for_timeout(200)
    pg.click('#est-abrir-aprov'); [pg.check(f'.est-c >> nth={i}') for i in range(3)]; pg.click('#est-confirmar'); pg.wait_for_timeout(300)
    ok('aprovada sem evidência fica marcada', pg.evaluate("estrategia().status") == 'aprovada' and 'NENHUMA coletada' in pg.evaluate("contextBlock('roteiro')") and estado(pg, 3) == 'andamento')
    pg.evaluate("oaIr(4)"); pg.fill('#oa-criar', '- Guia de preparação para a primeira consulta\n- Retorno por mensagem em 48 horas'); pg.wait_for_timeout(500)
    ok('A6 mudar a estratégia pede revisão', pg.evaluate("estrategia().status") == 'revisar' and estado(pg, 3) == 'revisar')
    pg.click('#cfg-transf') if pg.is_visible('#cfg-transf') else None
    pg.evaluate("abrirPasso(4,{scroll:false})"); pg.wait_for_timeout(200)
    ok('A6 entrega afetada marcada para revisar', 'precisa revisar' in pg.inner_text('.saved-slot[data-save=perfil] .saved-chip').lower() and pg.evaluate("!document.getElementById('hj-revisar').hidden"))
    pg.fill('#save-perfil', 'Bio nova com retorno em 48 horas'); pg.wait_for_timeout(450); pg.click('.saved-slot[data-save=perfil] .js-aprovar'); pg.wait_for_timeout(200)
    ok('A6 versão anterior preservada', pg.evaluate("resultados().perfil.hist.length") == 1 and 'Versões anteriores (1)' in pg.inner_text('.saved-slot[data-save=perfil] .versoes summary'))

    # 4 e 5. Biblioteca completa, por objetivo, com busca
    ok('A4 biblioteca com as 19 ferramentas e apoios', pg.locator('#biblioteca .bib-card').count() == 22 and pg.evaluate("document.querySelectorAll('.tool[data-id]').length") == 19)
    ok('A4 sete grupos', pg.locator('#biblioteca .bib-grupo').count() == 7)
    pg.click('nav.links [data-visao-link=ferramentas]'); pg.wait_for_timeout(150)
    ok('menu Ferramentas mostra só a biblioteca', pg.is_visible('#biblioteca') and not pg.is_visible('#passo-4'))
    pg.fill('#bib-q', 'anúncio'); pg.wait_for_timeout(100)
    ok('A5 busca pelo objetivo', pg.is_visible('.bib-card:has([data-abrir=campanha])') and not pg.is_visible('.bib-card:has([data-abrir=rastreador])'))
    pg.fill('#bib-q', 'bio'); pg.wait_for_timeout(100)
    pg.click('.bib-card:has([data-abrir=perfil]) [data-abrir=perfil]'); pg.wait_for_timeout(250)
    ok('A5 abre no passo, com o contexto já carregado', abertos(pg) == ['4'] and 'CRO-SP 12345' in pg.evaluate("contextBlock('rede-google')"))
    pg.evaluate("document.getElementById('bib-q').value=''; document.getElementById('bib-q').dispatchEvent(new Event('input'))")

    # 8. Contatos: origem explícita, consentimento não herdado, filas
    pg.evaluate("openTool('rastreador')"); pg.wait_for_timeout(200)
    ok('A8 origem começa sem escolha', pg.input_value('#t-origem') == '')
    pg.fill('#t-nome', 'Contato Fictício 1'); pg.click('#tracker-form button[type=submit]'); pg.wait_for_timeout(150)
    ok('A8 sem origem não cadastra', pg.evaluate("pacientes.length") == 0 and pg.get_attribute('#t-origem', 'aria-invalid') == 'true')
    pg.evaluate("document.getElementById('t-mais').open=true")
    ok('A8 consentimentos começam desmarcados', not any(pg.is_checked(x) for x in ['#t-c-atend', '#t-c-lemb', '#t-c-cont']))
    pg.select_option('#t-origem', 'Não informada'); pg.check('#t-c-atend'); pg.check('#t-c-lemb')
    pg.click('#tracker-form button[type=submit]'); pg.wait_for_timeout(150)
    ok('A8 "não sei" é uma escolha explícita', pg.evaluate("pacientes[0].origem") == 'Não informada')
    ok('A8 formulário limpo não herda consentimento', not any(pg.is_checked(x) for x in ['#t-c-atend', '#t-c-lemb', '#t-c-cont']) and pg.input_value('#t-origem') == '')
    ok('A8 contato sem data vai para "Sem próximo passo"', 'Sem próximo passo 1' in pg.inner_text('#t-filas').replace('\n', ' '))
    ok('A7 um contato não conclui o passo 8', estado(pg, 8) == 'andamento')

    # Módulo CRM: quadro com as caixas, procedimento da recepção e modo recepção
    pg.click('nav.links [data-visao-link=crm]'); pg.wait_for_timeout(200)
    ok('módulo CRM: quadro com as sete etapas', pg.locator('#quadro-cols .q-col').count() == 7 and not pg.is_visible('#passo-3'))
    c = pg.locator('.q-card').first; nome = c.locator('.q-nome b').inner_text()
    c.locator('[data-q=next]').click(); pg.wait_for_timeout(200)
    ok('quadro: seta move para a etapa seguinte e sugere o passo', pg.evaluate(f"(() => {{ const p = pacientes.find(x => x.nome === {nome!r}); return p.etapa === 'Em conversa' && p.passo === 'Oferecer dois horários' && !!p.hist['Em conversa']; }})()"))
    pg.locator('.q-card').first.locator('[data-q=encerrar]').click(); pg.wait_for_timeout(150)
    ok('quadro: encerrar pede resultado e motivo', pg.is_visible('.q-card .q-res'))
    pg.locator('.q-card .q-res').select_option('Perdido'); pg.fill('.q-card .q-mot', 'escolheu outro horário'); pg.click('.q-card [data-q=confirmar]'); pg.wait_for_timeout(150)
    ok('quadro: encerrado com resultado escolhido', pg.evaluate(f"pacientes.find(x => x.nome === {nome!r}).resultado") == 'Perdido')
    pg.click('#proc-abrir'); pg.wait_for_timeout(150)
    proc = pg.inner_text('#procedimento')
    ok('procedimento da recepção por etapa e com regras', 'Nenhum dado clínico' in proc and 'Mensagem modelo' in proc and 'Plano proposto' in proc)
    pg.click('#recepcao-ligar'); pg.wait_for_timeout(150)
    ok('modo recepção mostra só o CRM', pg.is_visible('#quadro') and not pg.is_visible('nav.links [data-visao-link=redes]') and pg.is_visible('#recepcao-sair'))
    pg.click('#recepcao-sair'); pg.wait_for_timeout(150)
    ok('sair do modo recepção', pg.is_visible('nav.links [data-visao-link=redes]'))
    pg.evaluate("pacientes.splice(0); savePac(); notifyData()")

    # 7. Ritual semanal tem data e semana
    ok('ritual começa pendente nesta semana', estado(pg, 9) == 'semana-pend')
    pg.evaluate("const s=camSt(); s.ritual={[addDays(mondayISO(),-7)]: addDays(todayISO(),-7)}; camSet(s); renderCaminho()")
    ok('A7 ritual da semana passada não vale para esta', estado(pg, 9) == 'semana-pend')
    pg.evaluate("abrirPasso(9,{scroll:false})"); pg.click('#passo-9 .js-passo-ok'); pg.wait_for_timeout(200)
    ok('ritual desta semana registrado', estado(pg, 9) in ('semana-ok', 'semana-pend') and pg.evaluate("!!camSt().ritual[mondayISO()]"))
    ok('painel sem dados não aponta gargalo', 'Ainda não há dados' in pg.evaluate("(pacientes.splice(0), gargalo().txt)"))

    # 6. Interromper e retomar
    pg.evaluate("abrirPasso(3,{scroll:false}); oaIr(2)"); pg.reload(); pg.wait_for_timeout(500)
    ok('A6 retoma no passo e na etapa', abertos(pg) == ['3'] and pg.evaluate("camSt().oaEtapa") == 2 and 'Retorno por mensagem' in pg.input_value('#oa-criar'))

    # 9. Falhas não viram falso sucesso
    pg.evaluate("Object.defineProperty(navigator, 'clipboard', {value: {writeText: () => Promise.reject(new Error('negado'))}, configurable: true}); document.execCommand = () => false;")
    pg.evaluate("abrirPasso(4,{scroll:false}); document.querySelector('details.rede[data-rede=instagram]').open=true")
    pg.click('form[data-tool=rede-instagram] button[type=submit]'); pg.wait_for_timeout(150)
    pg.click('form[data-tool=rede-instagram] .js-copy'); pg.wait_for_timeout(300)
    ok('A9 cópia negada não diz "Copiado"', 'Copiado' not in pg.inner_text('form[data-tool=rede-instagram] .js-copy') and 'Não consegui copiar' in pg.inner_text('form[data-tool=rede-instagram] .output-actions'))
    pg.evaluate("window.__set = Storage.prototype.setItem; Object.defineProperty(Storage.prototype, 'setItem', {value: function(){ throw new Error('QuotaExceededError'); }, configurable: true, writable: true})")
    pg.evaluate("document.querySelector('.saved-slot[data-save=perfil] details').open=true")
    pg.fill('#save-perfil', 'Outra versão'); pg.click('.saved-slot[data-save=perfil] .js-aprovar'); pg.wait_for_timeout(200)
    pg.wait_for_timeout(150)
    ok('A9 gravação recusada não diz "guardado"', 'Não consegui guardar' in pg.inner_text('.saved-slot[data-save=perfil] .js-sv-st') and pg.is_visible('#aviso-dados'))
    pg.evaluate("Object.defineProperty(Storage.prototype, 'setItem', {value: window.__set, configurable: true, writable: true})")
    # leitura ilegível: preserva o original e avisa
    pg2 = b.new_page(viewport={'width': 1280, 'height': 900}); pg2.on('pageerror', lambda e: errs.append('2:' + str(e)))
    pg2.goto(URL); pg2.evaluate("localStorage.clear(); localStorage.setItem('cliniloop.pacientes.v1', '{quebrado')"); pg2.reload(); pg2.wait_for_timeout(400)
    ok('A9 leitura ilegível avisa e preserva o original', pg2.is_visible('#aviso-dados') and pg2.evaluate("localStorage.getItem('cliniloop.pacientes.v1.ilegivel')") == '{quebrado')
    # restauração que falha no meio volta ao estado anterior
    pg2.evaluate("localStorage.clear(); localStorage.setItem('cliniloop.pacientes.v1', JSON.stringify([{id:'a1',nome:'Atual Fictício',etapa:'Novo',origem:'Não informada',criado:'2026-10-01'}]))"); pg2.reload(); pg2.wait_for_timeout(300)
    bk = {"app": "CliniLoop", "versao": 1, "criadoEm": "2026-10-20T10:00:00Z", "dados": {"cliniloop.pacientes.v1": json.dumps([{"id": "b1", "nome": "Do Backup", "etapa": "Novo", "origem": "Instagram orgânico", "criado": "2026-10-10"}]), "cliniloop.colegas.v1": json.dumps([{"id": "c1", "nome": "Colega Fictício"}])}}
    f = tempfile.NamedTemporaryFile('w', suffix='.json', delete=False); json.dump(bk, f); f.close()
    pg2.on('dialog', lambda d: d.accept())
    pg2.evaluate("window.__set = Storage.prototype.setItem; Object.defineProperty(Storage.prototype, 'setItem', {value: function(k, v){ if (k === 'cliniloop.colegas.v1') throw new Error('QuotaExceededError'); return window.__set.call(this, k, v); }, configurable: true, writable: true})")
    pg2.evaluate("document.getElementById('ajustes').open=true"); pg2.set_input_files('#bk-file', f.name); pg2.wait_for_timeout(500)
    ok('A9 restauração com falha desfaz tudo', 'Desfiz tudo' in pg2.inner_text('#bk-status') and 'Atual Fictício' in pg2.evaluate("localStorage.getItem('cliniloop.pacientes.v1')"))
    os.unlink(f.name)
    ok('nenhum prompt na URL das IAs', pg.evaluate("[...document.querySelectorAll('a[href]')].every(a => a.href.indexOf('?q=') < 0)"))

    # 10. Celular, tablet e zoom de 200%
    for w, h in [(360, 740), (390, 844), (768, 1024), (640, 450)]:
        m = b.new_page(viewport={'width': w, 'height': h}); m.on('pageerror', lambda e: errs.append(f'{w}:' + str(e)))
        m.goto(URL); m.wait_for_timeout(300)
        largo = []
        for n in range(1, 10):
            m.evaluate(f"abrirPasso({n},{{scroll:false}})"); m.wait_for_timeout(40)
            if m.evaluate("document.documentElement.scrollWidth") > w: largo.append(n)
        nav = m.evaluate("(() => { const r = [...document.querySelectorAll('nav.links > a, .nav-mais > summary')].map(e => e.getBoundingClientRect()); return r.every(x => x.right <= innerWidth + 1 && x.width > 0); })()")
        ok(f'A10 {w}px: sem rolagem lateral e menu visível', not largo and nav)
        m.close()
    ok('sem erros de página', not errs); print(errs)
    b.close()
print('RESULT', sum(R.values()), 'de', len(R))
