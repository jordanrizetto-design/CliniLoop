#!/usr/bin/env python3
"""Gera o PDF do Guia CliniLoop a partir de guia/partes/*.md.

Uso: python3 guia/build_guia.py   (gera guia/Guia-CliniLoop.pdf e guia/Guia-CliniLoop.html)
Duas passagens: a primeira mede em que página começa cada parte; a segunda preenche o sumário.
"""
import json, pathlib, re, subprocess, html, sys

ROOT = pathlib.Path(__file__).resolve().parent
REPO = ROOT.parent
PARTES = sorted((ROOT / 'partes').glob('*.md'))

# ---------- dados compartilhados com o app (plano, marcos, exemplos, glossário) ----------
def node_json(expr):
    src = (REPO / 'src/suplemento_data.js').read_text(encoding='utf-8') + '\n' + (REPO / 'src/livro_data.js').read_text(encoding='utf-8')
    js = f"{src}\nconsole.log(JSON.stringify({expr}));"
    out = subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout
    return json.loads(out)

DATA = node_json('{PLANO30, MARCOS, EXEMPLOS_LIVRO, GLOSSARIO, PROMPTS_LIVRO}')
E = html.escape

TOOLS = {'config': 'Comece aqui', 'etica': 'Verificador ético', 'publico': 'Público, ICP e persona', 'nicho': 'Nicho e diferencial', 'perfil': 'Perfis e presença',
         'pautas': 'Pautas e palavras-chave', 'roteiro': 'Roteiros e copy', 'reaproveitamento': 'Reaproveitamento de conteúdo', 'atendimento': 'Atendimento e agendamento',
         'rastreador': 'Rastreador de pacientes', 'colegas': 'Rede de colegas', 'painel': 'Painel e diagnóstico', 'assistente': 'Assistente da semana', 'ebook': 'Playbook da clínica'}


def md(text):
    r = subprocess.run(['pandoc', '-f', 'markdown+hard_line_breaks+pipe_tables+fenced_divs+smart', '-t', 'html5', '--wrap=none'],
                       input=text, capture_output=True, text=True, check=True)
    return r.stdout


def parse(path):
    raw = path.read_text(encoding='utf-8')
    m = re.match(r'---\n(.*?)\n---\n(.*)', raw, re.S)
    meta = {}
    for line in m.group(1).split('\n'):
        k, _, v = line.partition(':')
        meta[k.strip()] = v.strip().strip('"')
    return meta, m.group(2)


def exemplo_html(pid):
    e = DATA['EXEMPLOS_LIVRO'].get(pid)
    if not e:
        return ''
    return (f'<div class="box exemplo"><p class="box-label">Exemplo preenchido · personagem fictícia</p>'
            f'<p class="ex-h">O que foi colocado</p><p>{E(e["entrada"])}</p>'
            f'<p class="ex-h">O que a IA devolveu (trecho)</p><pre>{E(e["saida"])}</pre>'
            f'<p class="ex-h">Antes de usar</p><ul>{"".join("<li>" + E(x) + "</li>" for x in e["revisar"])}</ul></div>')


def expand(body):
    # {{exemplo:id}} -> caixa de exemplo ; {{plano}} -> plano de 30 dias ; {{marcos}} ; {{glossario}} ; {{prompt:id}} -> caixa de prompt do app
    body = re.sub(r'\{\{exemplo:(\w+)\}\}', lambda m: '\n\n```{=html}\n' + exemplo_html(m.group(1)) + '\n```\n\n', body)
    body = body.replace('{{plano}}', '\n\n```{=html}\n' + plano_html() + '\n```\n\n')
    body = body.replace('{{marcos}}', '\n\n```{=html}\n' + marcos_html() + '\n```\n\n')
    body = body.replace('{{glossario}}', '\n\n```{=html}\n' + glossario_html() + '\n```\n\n')
    return body


def plano_html():
    out = []
    for s in DATA['PLANO30']:
        rows = ''.join(f'<tr><td class="dia">{d["d"]}</td><td><b>{E(d["titulo"])}.</b> {E(d["acao"])}</td><td>{E(TOOLS.get(d["tool"], d["tool"]))}</td>'
                       f'<td>{E(d["entrega"])}</td><td class="min">{d["min"]} min</td></tr>' for d in s['dias'])
        out.append(f'<div class="semana"><h3>Semana {s["sem"]}: {E(s["tema"])} <span>partes {E(s["parte"])}</span></h3>'
                   f'<table class="plano"><thead><tr><th>Dia</th><th>Ação</th><th>Ferramenta</th><th>Entrega</th><th>Tempo</th></tr></thead><tbody>{rows}</tbody></table></div>')
    return '\n'.join(out)


def marcos_html():
    cols = ''.join(f'<div class="marco"><h4>{E(f["fase"])}</h4><ul>{"".join("<li>" + E(i) + "</li>" for i in f["itens"])}</ul></div>' for f in DATA['MARCOS'])
    return f'<div class="marcos">{cols}</div>'


def glossario_html():
    itens = sorted(DATA['GLOSSARIO'], key=lambda g: g[0].lower().replace('"', ''))
    return '<dl class="glos">' + ''.join(f'<div><dt>{E(g[0])}</dt><dd>{E(g[1])}</dd></div>' for g in itens) + '</dl>'


# ---------- CSS ----------
FONT = ROOT / 'fonts'
def ff(family, file, weight, style='normal'):
    return f"@font-face{{font-family:'{family}';src:url('file://{FONT / file}') format('woff2');font-weight:{weight};font-style:{style};}}"

CSS = '\n'.join([
    ff('Fraunces', 'fraunces-latin-400-normal.woff2', 400), ff('Fraunces', 'fraunces-latin-400-italic.woff2', 400, 'italic'),
    ff('Fraunces', 'fraunces-latin-600-normal.woff2', 600), ff('Fraunces', 'fraunces-latin-700-normal.woff2', 700),
    ff('Plex', 'ibm-plex-sans-latin-400-normal.woff2', 400), ff('Plex', 'ibm-plex-sans-latin-400-italic.woff2', 400, 'italic'),
    ff('Plex', 'ibm-plex-sans-latin-500-normal.woff2', 500), ff('Plex', 'ibm-plex-sans-latin-600-normal.woff2', 600),
    ff('Plex', 'ibm-plex-sans-latin-700-normal.woff2', 700), ff('PlexMono', 'ibm-plex-mono-latin-500-normal.woff2', 500),
]) + '''
:root{--ink:#14303A;--soft:#3A5059;--teal:#1F6F78;--teal-d:#185860;--rust:#C2502F;--paper:#F4F1EA;--tealbg:#EAF4F5;--peach:#F4BFA4;--peachbg:#FFF6EF;--line:#D9E0E2;}
@page{size:A4;margin:30mm 26mm 32mm 26mm;
  @bottom-left{content:"Guia CliniLoop";font:500 7.6pt Plex;color:#7C8E94;letter-spacing:.06em;text-transform:uppercase;padding-top:7mm;}
  @bottom-right{content:counter(page);font:500 8.5pt Plex;color:#7C8E94;padding-top:7mm;}}
@page cover{margin:0;@bottom-left{content:none}@bottom-right{content:none}}
@page opener{margin:0;@bottom-left{content:none}@bottom-right{content:none}}
@page toc{margin:30mm 26mm 32mm 26mm;}
*{box-sizing:border-box}
html{font:400 10.6pt/1.7 Plex,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{margin:0;orphans:3;widows:3;}
p{margin:0 0 4.4mm;}
h1,h2,h3,h4{font-family:Fraunces,Georgia,serif;color:var(--ink);line-height:1.22;break-after:avoid;}
h2{font-size:19pt;font-weight:600;margin:13mm 0 5mm;padding-top:6mm;position:relative;}
h2::before{content:"";position:absolute;top:0;left:0;width:14mm;height:1.1mm;background:var(--rust);}
h3{font-size:13.2pt;font-weight:600;margin:9mm 0 3.2mm;color:var(--teal-d);}
h4{font-size:11pt;font-weight:600;margin:6mm 0 2mm;}
ul,ol{margin:0 0 5mm;padding-left:6.2mm;}
li{margin:0 0 2.4mm;padding-left:1.2mm;}
li::marker{color:var(--teal);font-weight:600;}
b,strong{font-weight:600;}
a{color:var(--teal);text-decoration:none;}
hr{border:0;border-top:1px solid var(--line);margin:8mm 0;}
.lead{font:italic 400 13pt/1.6 Fraunces,serif;color:var(--soft);margin-bottom:7mm;}
section.sec{break-before:page;}
.kicker{font:600 8pt Plex;letter-spacing:.16em;text-transform:uppercase;color:var(--rust);margin:0 0 4mm;}
h1.sec-title{font-size:30pt;font-weight:600;margin:0 0 6mm;}

/* capa */
.cover{page:cover;break-after:page;height:297mm;width:210mm;background:linear-gradient(160deg,#14303A 0%,#185860 100%);color:var(--paper);padding:30mm 24mm 24mm;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.cover::after{content:"";position:absolute;right:-45mm;bottom:-45mm;width:150mm;height:150mm;border-radius:50%;border:2.2mm solid rgba(244,191,164,.22);}
.cover::before{content:"";position:absolute;right:-20mm;bottom:-20mm;width:100mm;height:100mm;border-radius:50%;border:2.2mm solid rgba(244,191,164,.14);}
.cover .logo{width:24mm;height:24mm;margin-bottom:12mm;}
.cover .logo svg{width:100%;height:100%;}
.cover .eyebrow{font:600 8.4pt Plex;letter-spacing:.2em;text-transform:uppercase;color:var(--peach);margin:0 0 7mm;}
.cover h1{font:600 52pt/1.02 Fraunces,serif;color:var(--paper);margin:0 0 8mm;}
.cover h1 em{font-style:italic;font-weight:400;color:var(--peach);}
.cover .sub{font:400 16pt/1.5 Fraunces,serif;max-width:125mm;color:#DDE8EA;margin:0;}
.cover .foot{margin-top:auto;font:500 8.4pt Plex;letter-spacing:.12em;text-transform:uppercase;color:#A9C3C8;position:relative;z-index:2;}
.cover .foot b{color:var(--peach);font-weight:600;}

/* abertura de parte */
.opener{page:opener;break-before:page;break-after:page;height:297mm;width:210mm;background:var(--paper);padding:34mm 26mm 26mm;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.opener .band{position:absolute;left:0;top:0;bottom:0;width:9mm;background:var(--teal);}
.opener .num{font:600 120pt/0.9 Fraunces,serif;color:var(--peach);margin:12mm 0 4mm -2mm;}
.opener .etapa{font:600 8.4pt Plex;letter-spacing:.17em;text-transform:uppercase;color:var(--rust);margin:0;}
.opener h1{font:600 36pt/1.08 Fraunces,serif;margin:0 0 9mm;max-width:150mm;}
.opener .lead{max-width:136mm;font-size:13.4pt;}
.opener .nesta{margin-top:auto;border-top:1px solid var(--line);padding-top:6mm;font-size:9.6pt;color:var(--soft);}
.opener .nesta b{display:block;font:600 7.8pt Plex;letter-spacing:.16em;text-transform:uppercase;color:var(--teal);margin-bottom:2mm;}
.opener.alt{background:var(--ink);color:var(--paper);}
.opener.alt .band{background:var(--rust);}
.opener.alt h1,.opener.alt .num{color:var(--paper);}
.opener.alt .num{color:var(--peach);}
.opener.alt .lead,.opener.alt .nesta{color:#CFDDE0;}
.opener.alt .nesta{border-color:rgba(255,255,255,.2);}

/* sumário */
.toc{page:toc;break-before:page;}
.toc h1{font:600 30pt Fraunces,serif;margin:0 0 10mm;}
.toc .grp{font:600 8pt Plex;letter-spacing:.16em;text-transform:uppercase;color:var(--rust);margin:9mm 0 3mm;}
.toc a{display:flex;align-items:baseline;gap:3mm;color:var(--ink);padding:1.7mm 0;border-bottom:1px dotted var(--line);}
.toc a .n{width:9mm;font:600 9.5pt Plex;color:var(--teal);}
.toc a .t{flex:1;}
.toc a .p{font:500 9.5pt Plex;color:var(--soft);}

/* caixas */
.box{break-inside:avoid;margin:7mm 0;padding:6mm 7mm;border-radius:2mm;font-size:10pt;line-height:1.62;}
.box p{margin:0 0 3mm;}
.box p:last-child,.box ul:last-child{margin-bottom:0;}
.box-label,.box>p:first-child strong:first-child{display:block;}
.box::before{display:block;font:600 7.6pt Plex;letter-spacing:.17em;text-transform:uppercase;margin-bottom:3.4mm;}
.prompt{background:var(--tealbg);border-left:1.6mm solid var(--teal);}
.prompt::before{content:"Prompt pronto";color:var(--teal-d);}
.prompt p{font-size:9.7pt;color:#16414A;}
.pratica{background:var(--peachbg);border:.35mm solid var(--peach);border-left:1.6mm solid var(--rust);}
.pratica::before{content:"Na prática · até 30 minutos, hoje";color:var(--rust);}
.noapp{background:var(--ink);color:var(--paper);}
.noapp::before{content:"No CliniLoop";color:var(--peach);}
.noapp strong{color:#fff;}
.destaque{background:var(--tealbg);border-radius:2mm;}
.destaque::before{content:"A ideia central";color:var(--teal-d);}
.atencao{background:#FFF3EE;border-left:1.6mm solid var(--rust);}
.atencao::before{content:"Atenção";color:var(--rust);}
.exemplo{background:#FBFAF6;border:.35mm dashed #B8C5C8;}
.exemplo .box-label{font:600 7.6pt Plex;letter-spacing:.17em;text-transform:uppercase;color:var(--soft);margin-bottom:3.4mm;}
.exemplo::before{content:none;}
.ex-h{font:600 8pt Plex;letter-spacing:.1em;text-transform:uppercase;color:var(--teal-d);margin:4mm 0 1.6mm;}
.exemplo pre{white-space:pre-wrap;font:400 9pt/1.6 Plex;margin:0;padding:4mm 5mm;background:#fff;border:.3mm solid var(--line);border-radius:1.6mm;overflow-wrap:anywhere;}
.exemplo ul{font-size:9.4pt;margin:0;padding-left:5.5mm;}
.tres{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin:7mm 0;}
.tres>div{break-inside:avoid;padding:5mm 5.5mm;border-radius:2mm;font-size:9.4pt;line-height:1.55;}
.tres b{display:block;font:600 7.6pt Plex;letter-spacing:.15em;text-transform:uppercase;margin-bottom:2.4mm;}

/* tabelas */
table{width:100%;border-collapse:collapse;margin:6mm 0 8mm;font-size:9.1pt;line-height:1.5;}
thead{display:table-header-group;}
th{background:var(--teal);color:#fff;text-align:left;font:600 8.2pt Plex;letter-spacing:.04em;padding:3.2mm 3.6mm;}
td{padding:3.2mm 3.6mm;vertical-align:top;border-bottom:.3mm solid var(--line);}
tr{break-inside:avoid;}
tbody tr:nth-child(even) td{background:#F7FAFA;}
td:first-child{font-weight:500;}
table.plano td.dia{font:600 11pt Fraunces,serif;color:var(--teal);width:9mm;text-align:center;}
table.plano td.min{white-space:nowrap;color:var(--soft);}
.semana{break-inside:auto;margin-bottom:6mm;}
.semana h3 span{font:500 8.4pt Plex;color:var(--soft);margin-left:3mm;letter-spacing:.04em;}
.marcos{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin:6mm 0;}
.marco{break-inside:avoid;border:.35mm solid var(--line);border-top:1.4mm solid var(--teal);border-radius:2mm;padding:5mm 5.5mm;font-size:9.2pt;line-height:1.55;}
.marco h4{margin:0 0 3mm;font-size:12pt;}
.marco ul{margin:0;padding-left:4.5mm;}
.glos{columns:2;column-gap:10mm;margin:0;}
.glos>div{break-inside:avoid;margin-bottom:4.2mm;}
.glos dt{font:600 9.6pt Plex;color:var(--teal-d);}
.glos dd{margin:.6mm 0 0;font-size:9pt;line-height:1.5;color:var(--soft);}
.fontes li{font-size:9.4pt;line-height:1.55;}
.nota{font-size:9pt;color:var(--soft);}
.fim{page:cover;break-before:page;height:297mm;width:210mm;background:var(--ink);color:var(--paper);display:flex;flex-direction:column;justify-content:center;padding:0 30mm;}
.fim h2{color:var(--paper);font-size:24pt;margin:0 0 6mm;padding:0;}
.fim h2::before{content:none;}
.fim p{color:#CFDDE0;max-width:120mm;}
'''


def cover_html():
    logo = (REPO / 'cliniloop-logo.svg').read_text(encoding='utf-8')
    logo = re.sub(r'width="512" height="512" ', '', logo)
    logo = logo.replace('#1F6F78', '#F4BFA4').replace('#C2502F', '#FFFFFF').replace('#F4BFA4"/></svg>', '#14303A"/></svg>')
    return f'''<section class="cover"><div class="logo">{logo}</div>
<p class="eyebrow">Guia digital + app de CRM</p>
<h1>Guia<br><em>CliniLoop</em></h1>
<p class="sub">Conhecimentos dirigidos e um app de CRM para profissionais de saúde atraírem pacientes e colegas com ética, método e registro.</p>
<p class="foot"><b>Edição 2026</b> · versão beta · cliniloop</p></section>'''


def build_html(pages):
    parts = [parse(p) for p in PARTES]
    toc_items, sections = [], []
    for meta, body in parts:
        kind = meta.get('tipo', 'parte')
        key = meta['marca']
        body_html = md(expand(body))
        if kind == 'parte':
            n = int(meta['num'])
            nesta = ''.join(f'<span>{E(x.strip())}</span>' for x in meta['nesta'].split('·'))
            alt = ' alt' if n % 2 == 0 else ''
            opener = (f'<section class="opener{alt}"><div class="band"></div><p class="etapa">{E(meta["etapa"])}</p><div class="num">{n:02d}</div>'
                      f'<h1>{E(meta["titulo"])}</h1><p class="lead">{E(meta["lead"])}</p>'
                      f'<div class="nesta"><b>Nesta parte · {E(key)}</b>{E(meta["nesta"])}</div></section>')
            sections.append(opener + f'<section class="sec-body">{body_html}</section>')
            toc_items.append((meta['grupo'], f'{n:02d}', meta['titulo'], key))
        else:
            kicker = f'<p class="kicker">{E(key)}</p>'
            sections.append(f'<section class="sec">{kicker}<h1 class="sec-title">{E(meta["titulo"])}</h1>{body_html}</section>')
            toc_items.append((meta['grupo'], '', meta['titulo'], key))
    toc = ['<section class="toc"><h1>Sumário</h1>']
    last = None
    for grupo, n, titulo, key in toc_items:
        if grupo != last:
            toc.append(f'<p class="grp">{E(grupo)}</p>'); last = grupo
        pg = pages.get(key, '')
        toc.append(f'<a href="#m-{re.sub(r"[^a-z0-9]", "", key.lower())}"><span class="n">{n}</span><span class="t">{E(titulo)}</span><span class="p">{pg}</span></a>')
    toc.append('</section>')
    fim = ('<section class="fim"><h2>Guia CliniLoop</h2><p>Conhecimentos dirigidos e um app de CRM. O app gratuito acompanha este guia: registra pacientes, colegas e campanhas no seu navegador, '
           'sem servidor, e leva os prompts para o seu dia a dia.</p><p class="nota" style="color:#9FB6BB">Este guia não substitui a orientação do seu conselho profissional nem assessoria jurídica.</p></section>')
    doc = f'<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Guia CliniLoop</title><style>{CSS}</style></head><body>{cover_html()}{"".join(toc)}{"".join(sections)}{fim}</body></html>'
    # âncoras de sumário
    for _, _, _, key in toc_items:
        doc = doc.replace(f'{E(key)}</b>', f'{E(key)}</b>', 1)
    return doc, toc_items


def render(doc, out_pdf):
    from playwright.sync_api import sync_playwright
    tmp = ROOT / '_guia.html'
    tmp.write_text(doc, encoding='utf-8')
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.goto(f'file://{tmp}')
        pg.wait_for_timeout(600)
        pg.evaluate('document.fonts.ready')
        pg.pdf(path=str(out_pdf), prefer_css_page_size=True, print_background=True, outline=True, tagged=True)
        b.close()


def find_pages(pdf, toc_items):
    import pdfplumber
    found = {}
    with pdfplumber.open(pdf) as doc:
        texts = [(i + 1, ' '.join((pg.extract_text() or '').split())) for i, pg in enumerate(doc.pages)]
    for _, _, titulo, key in toc_items:
        for i, t in texts[2:]:
            if key.upper() in t.upper() and ('NESTA PARTE' in t.upper() or titulo.upper() in t.upper()):
                found[key] = i
                break
    return found, len(texts)


if __name__ == '__main__':
    out = ROOT / 'Guia-CliniLoop.pdf'
    doc, items = build_html({})
    render(doc, out)
    pages, total = find_pages(out, items)
    doc, items = build_html(pages)
    render(doc, out)
    pages2, total = find_pages(out, items)
    if pages2 != pages:  # sumário mudou a paginação: mais uma passagem
        doc, items = build_html(pages2)
        render(doc, out)
        pages2, total = find_pages(out, items)
    (ROOT / 'Guia-CliniLoop.html').write_text(doc.replace(str(FONT), 'fonts'), encoding='utf-8')
    print('páginas:', total, '| marcas encontradas:', len(pages2), 'de', len(items))
