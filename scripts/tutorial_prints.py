"""Gera as imagens do tutorial da Parte 14 (guia/tutorial/*.jpg) com a personagem fictícia Dra. Bia Nunes.
Uso: python3 scripts/tutorial_prints.py  (depois de python3 build.py)"""
from playwright.sync_api import sync_playwright
OUT = '/home/claude/cliniloop/guia/tutorial/'
URL = 'file:///home/claude/cliniloop/index.html'

def shot(pg, sel, nome, pad=8, max_h=None):
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
    pg = b.new_page(viewport={'width': 1180, 'height': 900}, device_scale_factor=2)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.evaluate('localStorage.clear()'); pg.reload(); pg.wait_for_timeout(800)
    FIX = 'header.nav{position:static !important}'
    # 1. Topo
    pg.screenshot(path=OUT + '01-topo.png', clip={'x': 0, 'y': 0, 'width': 1180, 'height': 900})
    pg.add_style_tag(content=FIX)
    # 2. Perfil
    pg.click('#jor-go'); pg.wait_for_timeout(200)
    pg.click('label.type-card:has(input[value=nutricionista])')
    pg.fill('#cfg-nome', 'Dra. Bia Nunes'); pg.fill('#cfg-registro', 'CRN-3 00000'); pg.fill('#cfg-espec', 'nutrição esportiva')
    pg.fill('#cfg-cidade', 'Pinheiros, São Paulo'); pg.fill('#cfg-servicos', 'consulta de nutrição esportiva, plano alimentar para provas')
    pg.fill('#cfg-publico', 'corredores amadores de 30 a 50 anos'); pg.fill('#cfg-icp-dor', 'cansa no fim das provas e não sabe o que comer antes de treinar')
    pg.fill('#cfg-sobre', '10 anos de consultório, especialização em nutrição esportiva, atendimento presencial e online')
    pg.wait_for_timeout(300)
    shot(pg, '#painel', '02-perfil.png', max_h=1100)
    # 3. Objetivo
    pg.click('#cfg-done'); pg.wait_for_timeout(300); pg.click('#jor-go'); pg.wait_for_timeout(200)
    pg.fill('#cfg-meta', '20 primeiras consultas de corredores em 90 dias'); pg.wait_for_timeout(300)
    shot(pg, '#painel', '03-objetivo.png', max_h=1000)
    # 4. Diagnóstico
    pg.click('#cfg-done'); pg.wait_for_timeout(300); pg.click('#jor-go'); pg.wait_for_timeout(300)
    shot(pg, '.jor-card', '04-diagnostico.png', max_h=1000)
    # 5. Plano (Hoje)
    pg.click('#jor-prox'); pg.wait_for_timeout(200); pg.click('#jor-go'); pg.wait_for_timeout(300)
    shot(pg, '#hoje', '05-hoje.png', max_h=900)
    # 6. IA preferida
    pg.evaluate("document.getElementById('ajustes').open=true")
    pg.evaluate("const s=document.getElementById('ia-pref'); s.value='claude'; s.dispatchEvent(new Event('change'))")
    shot(pg, '#modo', '06-ia.png', max_h=900)
    pg.evaluate("document.getElementById('ajustes').open=false")
    # 7. Ferramenta: gerar prompt
    pg.evaluate("document.querySelector('details.tool[data-id=publico]').open=true"); pg.wait_for_timeout(200)
    pg.fill('#pu-hoje', 'Adultos de 30 a 50 anos que correm provas de rua; a maioria chega pelo Instagram ou por indicação do ortopedista.')
    pg.fill('#pu-duvidas', 'O que comer antes do longão?\nPreciso de suplemento?\nComo não passar mal na prova?')
    pg.locator('details.tool[data-id=publico] button[type=submit]').click(); pg.wait_for_timeout(400)
    shot(pg, 'details.tool[data-id=publico] .output-block', '07-prompt.png', max_h=700)
    # 8. Guardar a versão final
    pg.evaluate("document.querySelector('.saved-slot[data-save=publico] details').open=true")
    pg.fill('#save-publico', 'ICP: corredores amadores de 30 a 50 anos, Pinheiros e região, que treinam para provas de 10 km a meia maratona...\nPersona principal: Rafael, 41 anos, ...')
    pg.wait_for_timeout(700)
    shot(pg, '.saved-slot[data-save=publico]', '08-guardar.png')
    # 9. Rastreador
    pg.evaluate("openTool('rastreador')"); pg.wait_for_timeout(200)
    pg.fill('#t-nome', 'Rafael M.'); pg.fill('#t-tel', '(11) 90000-0000'); pg.fill('#t-servico', 'consulta de nutrição esportiva')
    pg.fill('#t-passo', 'confirmar a primeira consulta')
    pg.locator('#tracker-form button[type=submit]').click(); pg.wait_for_timeout(400)
    shot(pg, 'details.tool[data-id=rastreador]', '09-rastreador.png', max_h=1100)
    # 10. Ritual semanal
    pg.evaluate("openTool('assistente')"); pg.wait_for_timeout(300)
    shot(pg, 'details.tool[data-id=assistente]', '10-semana.png', max_h=900)
    # 11. Backup
    pg.evaluate("document.getElementById('ajustes').open=true"); pg.wait_for_timeout(200)
    shot(pg, '#bk-save >> xpath=ancestor::section[1]', '11-backup.png', max_h=500)
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
