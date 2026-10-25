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
.cover{page:cover;break-after:page;height:297mm;width:210mm;background:linear-gradient(160deg,#14303A 0%,#185860 100%);color:var(--paper);padding:20mm 24mm 22mm;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.cover::after{content:"";position:absolute;right:-45mm;bottom:-45mm;width:150mm;height:150mm;border-radius:50%;border:2.2mm solid rgba(244,191,164,.22);}
.cover::before{content:"";position:absolute;right:-20mm;bottom:-20mm;width:100mm;height:100mm;border-radius:50%;border:2.2mm solid rgba(244,191,164,.14);}
.cover .art{position:absolute;left:0;top:2mm;width:210mm;height:190mm;}
.cover .ctext{margin-top:170mm;position:relative;z-index:2;}
.cover .sub2{font:400 10.4pt/1.6 Plex,sans-serif;color:#B9CDD1;max-width:130mm;margin:5mm 0 0;}
.cover .eyebrow{font:600 8.4pt Plex;letter-spacing:.2em;text-transform:uppercase;color:var(--peach);margin:0 0 5mm;}
.cover h1{font:600 46pt/1.0 Fraunces,serif;color:var(--paper);margin:0 0 6mm;}
.cover h1 em{font-style:italic;font-weight:400;color:var(--peach);}
.cover .sub{font:400 15pt/1.4 Fraunces,serif;max-width:140mm;color:#DDE8EA;margin:0;}
.cover .foot{margin-top:auto;padding-top:7mm;font:500 8.4pt Plex;letter-spacing:.12em;text-transform:uppercase;color:#A9C3C8;position:relative;z-index:2;}
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
    art = '''<svg class="art" viewBox="0 0 210 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><radialGradient id="gl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F4BFA4" stop-opacity=".30"/><stop offset="1" stop-color="#F4BFA4" stop-opacity="0"/></radialGradient></defs>
<circle cx="105" cy="98" r="86" fill="url(#gl)"/>
<g stroke="#F4BFA4" stroke-opacity=".22" fill="none" stroke-width=".5">
<path d="M0 40H34L44 50H70M210 150H176L166 160H140M0 150H28L38 160H60M210 40H182L172 30H150M105 0V22M105 190V176"/>
<path d="M18 80H42M168 80H192M18 120H40M170 120H194"/></g>
<g fill="#F4BFA4" fill-opacity=".5"><circle cx="70" cy="50" r="1.4"/><circle cx="140" cy="160" r="1.4"/><circle cx="60" cy="160" r="1.4"/><circle cx="150" cy="30" r="1.4"/><circle cx="42" cy="80" r="1.4"/><circle cx="168" cy="80" r="1.4"/></g>
<circle cx="105" cy="98" r="62" fill="none" stroke="#F4BFA4" stroke-opacity=".55" stroke-width=".8" stroke-dasharray="1.2 2.4"/>
<circle cx="105" cy="98" r="50" fill="#0F2830" stroke="#F4BFA4" stroke-width="1.2"/>
<g><rect x="94" y="66" width="22" height="64" rx="6" fill="#FFFFFF"/><rect x="73" y="87" width="64" height="22" rx="6" fill="#FFFFFF"/>
<rect x="94" y="66" width="22" height="64" rx="6" fill="none" stroke="#1F6F78" stroke-width=".8"/></g>
<path d="M58 98H84L90 86L97 114L104 70L112 124L119 98H132L142 86L150 90L160 70" fill="none" stroke="#C2502F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M153 68L162 67L161 76" fill="none" stroke="#C2502F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<g stroke="#F4BFA4" stroke-opacity=".6" stroke-width=".7"><path d="M105 30V48M105 148V166M48 98H55M155 98H162"/><path d="M60 58L72 66M150 58L138 66M60 138L72 130M150 138L138 130"/></g>
<g fill="#14303A" stroke="#F4BFA4" stroke-width="1.2">
<circle cx="105" cy="22" r="11"/><circle cx="46" cy="52" r="11"/><circle cx="164" cy="52" r="11"/><circle cx="40" cy="132" r="11"/><circle cx="170" cy="132" r="11"/><circle cx="105" cy="174" r="11"/></g>
<g fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
<path d="M105 14.5L107 20L112.5 22L107 24L105 29.5L103 24L97.5 22L103 20Z" fill="#F4BFA4" stroke="none"/>
<path d="M40 47H52Q53.5 47 53.5 48.5V54.5Q53.5 56 52 56H46L42 59V56H40Q38.5 56 38.5 54.5V48.5Q38.5 47 40 47Z"/><path d="M42 51.5H50" stroke-width="1.1"/>
<path d="M157 46H171L166.5 52V58L162.5 56V52Z"/>
<path d="M33 128V133Q33 138 38 138Q43 138 43 133V128M35 127V129M41 127V129M38 138V142Q38 145 42 145" stroke-width="1.3"/><circle cx="44" cy="145" r="1.6" fill="#FFFFFF"/>
<path d="M170 140.5C161 134 163 127 167 127C169 127 170 128.5 170 129.5C170 128.5 171 127 173 127C177 127 179 134 170 140.5Z" fill="#C2502F" stroke="none"/>
<path d="M98 178V172M103 178V168M108 178V174M113 178V166"/></g>
<g fill="#F4BFA4"><circle cx="30" cy="30" r="2"/><circle cx="182" cy="108" r="2"/><circle cx="26" cy="108" r="2"/><circle cx="188" cy="170" r="2"/></g>
</svg>'''
    return f'''<section class="cover">{art}
<div class="ctext"><p class="eyebrow">Saúde · marketing digital · tecnologia</p>
<h1>Prompt<br><em>do Sim</em></h1>
<p class="sub">Guia digital para o sucesso do profissional da saúde.</p>
<p class="sub2">Conhecimentos dirigidos e o app de CRM CliniLoop, para atrair pacientes e colegas com ética, método e inteligência artificial.</p></div>
<p class="foot"><b>Edição 2026</b> · versão beta · app CliniLoop</p></section>'''


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
    fim = ('<section class="fim"><h2>Guia CliniLoop</h2><p>Conhecimentos dirigidos e um app de CRM. O app CliniLoop, que completa este guia, registra pacientes, colegas e campanhas no seu navegador, '
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


def aplicar_capa(pdf_path):
    """Substitui a página 1 pela capa ilustrada (capa/capa-azul.png)."""
    from pypdf import PdfReader, PdfWriter
    from PIL import Image
    import io
    img = Image.open(ROOT / 'capa' / 'capa-azul.png').convert('RGB')
    buf = io.BytesIO()
    img.save(buf, 'PDF', resolution=img.width / (210 / 25.4))
    cover = PdfReader(buf).pages[0]
    cover.scale_to(595.0, 842.0)
    w = PdfWriter(clone_from=PdfReader(str(pdf_path)))
    w.insert_page(cover, 0)
    w.remove_page(1)
    w.write(str(pdf_path))


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
    aplicar_capa(out)
