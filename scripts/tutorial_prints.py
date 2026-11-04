"""Gera as imagens do tutorial da Parte 14 (guia/tutorial/*.jpg) com a personagem fictícia Dra. Bia Nunes.
Uso: python3 scripts/tutorial_prints.py  (depois de python3 build.py)"""
from playwright.sync_api import sync_playwright
OUT = '/home/claude/cliniloop/guia/tutorial/'
URL = 'file:///home/claude/cliniloop/index.html'

def shot(pg, sel, nome, max_h=None):
    from PIL import Image
    el = pg.locator(sel).first
    el.scroll_into_view_if_needed(); pg.wait_for_timeout(250)
    el.screenshot(path=OUT + nome)
    if max_h:
        im = Image.open(OUT + nome)
        lim = int(max_h * 2)  # device_scale_factor = 2
        if im.height > lim:
            im.crop((0, 0, im.width, lim)).save(OUT + nome)


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1180, 'height': 900}, device_scale_factor=2, locale='pt-BR')
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.evaluate('localStorage.clear()'); pg.reload(); pg.wait_for_timeout(800)
    pg.add_style_tag(content='html{scroll-behavior:auto !important}')
    # 1. Topo
    pg.screenshot(path=OUT + '01-topo.png', clip={'x': 0, 'y': 0, 'width': 1180, 'height': 720})
    pg.add_style_tag(content='header.nav{position:static !important}')
    # 2. Passo 1
    pg.click('#hero-cta'); pg.wait_for_timeout(300)
    pg.click('label.type-card:has(input[value=nutricionista])')
    pg.fill('#cfg-nome', 'Dra. Bia Nunes'); pg.fill('#cfg-registro', 'CRN-3 00000'); pg.fill('#cfg-espec', 'nutrição esportiva')
    pg.fill('#cfg-cidade', 'Pinheiros, São Paulo'); pg.fill('#cfg-servicos', 'consulta de nutrição esportiva, plano alimentar para provas')
    pg.fill('#cfg-meta', '20 primeiras consultas de corredores em 90 dias'); pg.wait_for_timeout(400)
    shot(pg, '#passo-1', '02-perfil.png', max_h=1500)
    pg.evaluate("document.querySelector('#passo-1 .js-passo-ok').click()"); pg.wait_for_timeout(400)
    # 3. Passo 2
    pg.fill('#cfg-publico', 'corredores amadores de 30 a 50 anos'); pg.fill('#cfg-icp-dor', 'cansa no fim das provas e não sabe o que comer antes de treinar')
    pg.fill('#cfg-icp-valoriza', 'explicação clara e um plano que caiba na rotina de treino'); pg.fill('#cfg-icp-onde', 'Instagram, grupos de corrida e indicação do ortopedista')
    pg.wait_for_timeout(400)
    shot(pg, '#passo-2', '03-paciente.png', max_h=1000)
    pg.evaluate("document.querySelector('#passo-2 .js-passo-ok').click()"); pg.wait_for_timeout(400)
    # 4. Passo 3: Oceano Azul até a proposta
    for i in (0, 4, 10, 11, 12): pg.check(f'#oa-f{i}')
    pg.evaluate("oaIr(4)"); pg.wait_for_timeout(200)
    pg.fill('#oa-elevar', '- Plano alimentar adaptado à rotina de treino'); pg.fill('#oa-criar', '- Revisão do plano depois de cada prova')
    pg.evaluate("oaIr(7)"); pg.wait_for_timeout(300)
    pg.fill('#oa-proposta', 'Para corredores amadores de 30 a 50 anos, ofereço um plano alimentar adaptado à rotina de treino, revisado depois de cada prova.')
    pg.click('#usar-rascunho'); pg.wait_for_timeout(500)
    pg.evaluate("(() => { const i = document.getElementById('cfg-transf'); i.blur(); i.setSelectionRange && i.setSelectionRange(0, 0); i.scrollLeft = 0; })()")
    shot(pg, '#passo-3 .proposta-final', '04a.png')
    shot(pg, '#est-aprovacao', '04b.png')
    from PIL import Image
    a_, b_ = Image.open(OUT + '04a.png'), Image.open(OUT + '04b.png')
    im = Image.new('RGB', (max(a_.width, b_.width), a_.height + b_.height + 24), (244, 241, 234)); im.paste(a_, (0, 0)); im.paste(b_, (0, a_.height + 24)); im.save(OUT + '04-oceano.png')
    import os; os.remove(OUT + '04a.png'); os.remove(OUT + '04b.png')
    pg.evaluate("document.querySelector('#passo-3 .js-passo-ok').click()"); pg.wait_for_timeout(400)
    # 5. Hoje
    pg.click('nav.links [data-visao-link="hoje"]'); pg.wait_for_timeout(300)
    pg.evaluate("document.getElementById('hoje').scrollIntoView()")
    shot(pg, '#hoje', '05-hoje.png', max_h=1050)
    # 6. Passo 4: uma rede
    pg.evaluate("abrirPasso(4,{scroll:false})")
    pg.click('details.rede[data-rede=instagram] > summary')
    pg.fill('#rd-instagram-nome', 'Bia Nunes Nutri'); pg.fill('#rd-instagram-bio', 'Nutrição para quem corre 🏃‍♀️\nAgende ⬇️')
    pg.click('form[data-tool=rede-instagram] button[type=submit]'); pg.wait_for_timeout(500)
    shot(pg, 'details.rede[data-rede=instagram]', '06-redes.png', max_h=1300)
    # 7. Aprovar e guardar a versão final
    pg.evaluate("document.querySelector('.saved-slot[data-save=perfil] details').open=true")
    pg.fill('#save-perfil', 'Instagram\nNome: Bia Nunes | Nutricionista esportiva\nBio: Nutricionista (CRN-3 00000) | Corredores de 30 a 50 anos | Pinheiros, SP | Agende pelo WhatsApp ⬇️')
    pg.wait_for_timeout(500); pg.click('.saved-slot[data-save=perfil] .js-aprovar'); pg.wait_for_timeout(400)
    shot(pg, '.saved-slot[data-save=perfil]', '07-guardar.png')
    # 8. IA preferida (menu Ferramentas, Configurações)
    pg.click('nav.links [data-visao-link="ferramentas"]'); pg.wait_for_timeout(200)
    pg.evaluate("document.getElementById('ajustes').open=true")
    pg.evaluate("const s=document.getElementById('ia-pref'); s.value='claude'; s.dispatchEvent(new Event('change'))")
    shot(pg, '#modo', '08-ia.png', max_h=900)
    # 9. CRM: novo contato
    pg.click('nav.links [data-visao-link="crm"]'); pg.wait_for_timeout(200)
    pg.click('#q-novo'); pg.wait_for_timeout(300)
    pg.fill('#t-nome', 'Rafael M.'); pg.select_option('#t-origem', 'Instagram orgânico')
    pg.fill('#t-passo', 'confirmar a primeira consulta'); pg.fill('#t-data', '2026-11-05'); pg.evaluate('document.activeElement.blur()')
    shot(pg, '#tracker-form', '09-rastreador.png', max_h=900)
    pg.locator('#tracker-form button[type=submit]').click(); pg.wait_for_timeout(300)
    # mais contatos fictícios, em etapas diferentes, para o quadro
    pg.evaluate("""(() => { const h = todayISO(); const add = (id, nome, etapa, origem, passo, data) => { const p = { id, nome, etapa, origem, passo, data, criado: addDays(h, -10), atualizado: h, hist: {}, consent: {}, revogado: {}, ativ: [] }; fillHist(p, etapa); pacientes.push(p); };
      add('t2', 'Carla S.', 'Em conversa', 'Indicação de colega', 'Oferecer dois horários', h);
      add('t3', 'Paulo T.', 'Agendado', 'Google orgânico', 'Confirmação 48 h antes', addDays(h, 3));
      add('t4', 'Marina R.', 'Plano proposto', 'Não informada', 'Acompanhamento do plano (2, 7 e 15 dias)', addDays(h, -1));
      savePac(); notifyData(); })()""")
    pg.click('nav.links [data-visao-link="crm"]'); pg.wait_for_timeout(300)
    shot(pg, '#quadro', '10-quadro.png', max_h=800)
    # 11. Ritual semanal
    pg.evaluate("abrirPasso(9,{scroll:false})"); pg.wait_for_timeout(300)
    shot(pg, '#passo-9', '11-semana.png', max_h=1000)
    # 12. Backup
    pg.click('nav.links [data-visao-link="ferramentas"]'); pg.wait_for_timeout(200)
    pg.evaluate("document.getElementById('ajustes').open=true"); pg.wait_for_timeout(200)
    shot(pg, '#bk-save >> xpath=ancestor::section[1]', '12-backup.png', max_h=500)
    print('erros', errs)
    b.close()

# PNG de alta resolução -> JPEG mais leve para o PDF
import glob, os
from PIL import Image
for f in sorted(glob.glob(OUT + '*.png')):
    im = Image.open(f).convert('RGB')
    if im.width > 1700:
        im = im.resize((1700, int(im.height * 1700 / im.width)), Image.LANCZOS)
    im.save(f[:-4] + '.jpg', quality=86, optimize=True, progressive=True)
    os.remove(f)
