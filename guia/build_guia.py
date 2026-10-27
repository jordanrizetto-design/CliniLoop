#!/usr/bin/env python3
"""Gera o PDF do guia O Prompt do Sim a partir de guia/partes/*.md.

Uso: python3 guia/build_guia.py   (gera guia/O-Prompt-do-Sim.pdf e guia/O-Prompt-do-Sim.html)
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
    r = subprocess.run(['pandoc', '-f', 'markdown+hard_line_breaks+pipe_tables+fenced_divs+smart+ascii_identifiers', '-t', 'html5', '--wrap=none'],
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
    return '<dl class="glos">' + ''.join(f'<div id="{gid(g[0])}"><dt>{E(g[0])}</dt><dd>{E(g[1])}<!--usos:{gid(g[0])}--></dd></div>' for g in itens) + '</dl>'


def gid(termo):
    import unicodedata
    t = unicodedata.normalize('NFKD', termo).encode('ascii', 'ignore').decode().lower()
    return 'g-' + re.sub(r'[^a-z0-9]+', '-', t).strip('-')


GLOS_SKIP = {'Sobre', 'Título (LinkedIn)', 'Posicionamento (anúncio)', 'Em destaque'}
GLOS_CASE = {'Meta', 'Destaques', 'Direct', 'Envio', 'Prompt', 'Pixel', 'Banner'}  # só com a grafia exata


def _glos_patterns():
    pats = []
    for termo, _ in DATA['GLOSSARIO']:
        if termo in GLOS_SKIP:
            continue
        if termo.startswith('CFM, CFO'):
            for sig in ['CFM', 'CFO', 'CFP', 'COFFITO', 'CFN']:
                pats.append((sig, gid(termo), True))
            continue
        if termo == 'Decisões (as sete)':
            pats.append(('sete decisões', gid(termo), False)); continue
        base = re.sub(r'\s*\(.*?\)', '', termo).strip()
        pats.append((base, gid(termo), termo in GLOS_CASE or base.isupper()))
    pats.sort(key=lambda x: -len(x[0]))
    return pats


GLOS_PATS = None
GLOS_USOS = {}


def glos_link(html, sec_key):
    """Liga ao glossário a primeira ocorrência de cada termo em cada seção (fora de links, títulos e código)."""
    global GLOS_PATS
    if GLOS_PATS is None:
        GLOS_PATS = [(re.compile(r'(?<![\w-])' + re.escape(t) + r'(?:s|es)?(?![\w-])', 0 if cs else re.I), g) for t, g, cs in _glos_patterns()]
    if sec_key == 'ANEXO B':
        return html
    usados, out, skip = set(), [], 0
    for tok in re.split(r'(<[^>]+>)', html):
        if tok.startswith('<'):
            tag = re.match(r'</?\s*([a-zA-Z0-9]+)', tok)
            name = tag.group(1).lower() if tag else ''
            if name in ('a', 'h1', 'h2', 'h3', 'h4', 'pre', 'code', 'th'):
                skip = max(skip + (-1 if tok.startswith('</') else 1), 0)
            out.append(tok); continue
        if skip or not tok.strip():
            out.append(tok); continue
        # marca trechos já usados para não sobrepor termos
        spans = []
        for rx, g in GLOS_PATS:
            if g in usados:
                continue
            m = rx.search(tok)
            while m and any(not (m.end() <= a or m.start() >= b) for a, b, _ in spans):
                m = rx.search(tok, m.end())
            if m:
                spans.append((m.start(), m.end(), g)); usados.add(g)
        for a, b, g in sorted(spans, reverse=True):
            anc = f'r-{g[2:]}-{slug(sec_key)[2:]}'
            GLOS_USOS.setdefault(g, []).append((sec_key, anc))
            tok = tok[:a] + f'<a class="glos-link" id="{anc}" href="#{g}">{tok[a:b]}</a>' + tok[b:]
        out.append(tok)
    return ''.join(out)


# ---------- CSS ----------
FONT = ROOT / 'fonts'
def ff(family, file, weight, style='normal'):
    return f"@font-face{{font-family:'{family}';src:url('file://{FONT / file}') format('woff2');font-weight:{weight};font-style:{style};}}"

CSS = '\n'.join([
    ff('Poppins', 'poppins-latin-400-normal.woff2', 400), ff('Poppins', 'poppins-latin-400-italic.woff2', 400, 'italic'),
    ff('Poppins', 'poppins-latin-500-normal.woff2', 500), ff('Poppins', 'poppins-latin-600-normal.woff2', 600),
    ff('Poppins', 'poppins-latin-600-italic.woff2', 600, 'italic'), ff('Poppins', 'poppins-latin-700-normal.woff2', 700),
    ff('PlexMono', 'ibm-plex-mono-latin-500-normal.woff2', 500),
]) + '''
:root{--ink:#14303A;--soft:#3A5059;--teal:#1F6F78;--teal-d:#185860;--rust:#C2502F;--paper:#F4F1EA;--tealbg:#EAF4F5;--peach:#F4BFA4;--peachbg:#FFF6EF;--line:#D9E0E2;}
@page{size:A4;margin:30mm 26mm 32mm 26mm;
  @bottom-left{content:"O Prompt do Sim";font:500 7.6pt Poppins;color:#7C8E94;letter-spacing:.06em;text-transform:uppercase;padding-top:7mm;}
  @bottom-right{content:counter(page);font:500 8.5pt Poppins;color:#7C8E94;padding-top:7mm;}}
@page cover{margin:0;@bottom-left{content:none}@bottom-right{content:none}}
@page opener{margin:0;@bottom-left{content:none}@bottom-right{content:none}}
@page toc{margin:30mm 26mm 32mm 26mm;}
*{box-sizing:border-box}
html{font:400 9.9pt/1.68 Poppins,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{margin:0;orphans:3;widows:3;}
p{margin:0 0 4.4mm;}
h1,h2,h3,h4{font-family:Poppins;color:var(--ink);line-height:1.22;break-after:avoid;}
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
.lead{font:italic 400 11.6pt/1.6 Poppins;color:var(--soft);margin-bottom:7mm;}
section.sec{break-before:page;}
.kicker{font:600 8pt Poppins;letter-spacing:.16em;text-transform:uppercase;color:var(--rust);margin:0 0 4mm;}
h1.sec-title{font-size:30pt;font-weight:600;margin:0 0 6mm;}

/* capa */
.cover{page:cover;break-after:page;height:297mm;width:210mm;background:linear-gradient(160deg,#14303A 0%,#185860 100%);color:var(--paper);padding:20mm 24mm 22mm;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.cover::after{content:"";position:absolute;right:-45mm;bottom:-45mm;width:150mm;height:150mm;border-radius:50%;border:2.2mm solid rgba(244,191,164,.22);}
.cover::before{content:"";position:absolute;right:-20mm;bottom:-20mm;width:100mm;height:100mm;border-radius:50%;border:2.2mm solid rgba(244,191,164,.14);}
.cover .art{position:absolute;left:0;top:2mm;width:210mm;height:190mm;}
.cover .ctext{margin-top:170mm;position:relative;z-index:2;}
.cover .sub2{font:400 10.4pt/1.6 Poppins,sans-serif;color:#B9CDD1;max-width:130mm;margin:5mm 0 0;}
.cover .eyebrow{font:600 8.4pt Poppins;letter-spacing:.2em;text-transform:uppercase;color:var(--peach);margin:0 0 5mm;}
.cover h1{font:600 46pt/1.0 Poppins;color:var(--paper);margin:0 0 6mm;}
.cover h1 em{font-style:italic;font-weight:400;color:var(--peach);}
.cover .sub{font:400 15pt/1.4 Poppins;max-width:140mm;color:#DDE8EA;margin:0;}
.cover .foot{margin-top:auto;padding-top:7mm;font:500 8.4pt Poppins;letter-spacing:.12em;text-transform:uppercase;color:#A9C3C8;position:relative;z-index:2;}
.cover .foot b{color:var(--peach);font-weight:600;}

/* abertura de parte */
.opener{page:opener;break-before:page;break-after:page;height:297mm;width:210mm;background:var(--paper);padding:34mm 26mm 26mm;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.opener .band{position:absolute;left:0;top:0;bottom:0;width:9mm;background:var(--teal);}
.opener .num{font:600 120pt/0.9 Poppins;color:var(--peach);margin:12mm 0 4mm -2mm;}
.opener .etapa{font:600 8.4pt Poppins;letter-spacing:.17em;text-transform:uppercase;color:var(--rust);margin:0;}
.opener h1{font:600 31pt/1.1 Poppins;letter-spacing:-.01em;margin:0 0 9mm;max-width:150mm;}
.opener .lead{max-width:136mm;font-size:13.4pt;}
.opener .nesta{margin-top:auto;border-top:1px solid var(--line);padding-top:6mm;font-size:9.6pt;color:var(--soft);}
.opener .nesta b{display:block;font:600 7.8pt Poppins;letter-spacing:.16em;text-transform:uppercase;color:var(--teal);margin-bottom:2mm;}
.opener.alt{background:var(--ink);color:var(--paper);}
.opener.alt .band{background:var(--rust);}
.opener.alt h1,.opener.alt .num{color:var(--paper);}
.opener.alt .num{color:var(--peach);}
.opener.alt .lead,.opener.alt .nesta{color:#CFDDE0;}
.opener.alt .nesta{border-color:rgba(255,255,255,.2);}

/* sumário */
.toc{page:toc;break-before:page;}
.toc h1{font:600 30pt Poppins;margin:0 0 10mm;}
.toc .grp{font:600 8pt Poppins;letter-spacing:.16em;text-transform:uppercase;color:var(--rust);margin:9mm 0 3mm;}
.toc a{display:flex;align-items:baseline;gap:3mm;color:var(--ink);padding:1.7mm 0;border-bottom:1px dotted var(--line);}
.toc a .n{width:9mm;font:600 9.5pt Poppins;color:var(--teal);}
.toc a .t{flex:1;}
.toc a .p{font:500 9.5pt Poppins;color:var(--soft);}
.toc a.part{break-after:avoid;}
.toc a.sub{padding:.9mm 0;border-bottom:none;font-size:8.6pt;color:var(--soft);}
.toc a.sub .p{font-size:8.4pt;}
a.glos-link{color:inherit;text-decoration:underline dotted;text-decoration-color:var(--teal);text-decoration-thickness:.25mm;text-underline-offset:.7mm;}

/* caixas */
.box{break-inside:avoid;margin:7mm 0;padding:6mm 7mm;border-radius:2mm;font-size:10pt;line-height:1.62;}
.box p{margin:0 0 3mm;}
.box p:last-child,.box ul:last-child{margin-bottom:0;}
.box-label,.box>p:first-child strong:first-child{display:block;}
.box::before{display:block;font:600 7.6pt Poppins;letter-spacing:.17em;text-transform:uppercase;margin-bottom:3.4mm;}
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
.exemplo .box-label{font:600 7.6pt Poppins;letter-spacing:.17em;text-transform:uppercase;color:var(--soft);margin-bottom:3.4mm;}
.exemplo::before{content:none;}
.ex-h{font:600 8pt Poppins;letter-spacing:.1em;text-transform:uppercase;color:var(--teal-d);margin:4mm 0 1.6mm;}
.exemplo pre{white-space:pre-wrap;font:400 9pt/1.6 Poppins;margin:0;padding:4mm 5mm;background:#fff;border:.3mm solid var(--line);border-radius:1.6mm;overflow-wrap:anywhere;}
.exemplo ul{font-size:9.4pt;margin:0;padding-left:5.5mm;}
.tres{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin:7mm 0;}
.tres>div{break-inside:avoid;padding:5mm 5.5mm;border-radius:2mm;font-size:9.4pt;line-height:1.55;}
.tres b{display:block;font:600 7.6pt Poppins;letter-spacing:.15em;text-transform:uppercase;margin-bottom:2.4mm;}

/* tabelas */
table{width:100%;border-collapse:collapse;margin:6mm 0 8mm;font-size:9.1pt;line-height:1.5;}
thead{display:table-header-group;}
th{background:var(--teal);color:#fff;text-align:left;font:600 8.2pt Poppins;letter-spacing:.04em;padding:3.2mm 3.6mm;}
td{padding:3.2mm 3.6mm;vertical-align:top;border-bottom:.3mm solid var(--line);}
tr{break-inside:avoid;}
tbody tr:nth-child(even) td{background:#F7FAFA;}
td:first-child{font-weight:500;}
table.plano td.dia{font:600 11pt Poppins;color:var(--teal);width:9mm;text-align:center;}
table.plano td.min{white-space:nowrap;color:var(--soft);}
.semana{break-inside:auto;margin-bottom:6mm;}
.semana h3 span{font:500 8.4pt Poppins;color:var(--soft);margin-left:3mm;letter-spacing:.04em;}
.marcos{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin:6mm 0;}
.marco{break-inside:avoid;border:.35mm solid var(--line);border-top:1.4mm solid var(--teal);border-radius:2mm;padding:5mm 5.5mm;font-size:9.2pt;line-height:1.55;}
.marco h4{margin:0 0 3mm;font-size:12pt;}
.marco ul{margin:0;padding-left:4.5mm;}
.glos{columns:2;column-gap:10mm;margin:0;}
.glos>div{break-inside:avoid;margin-bottom:4.2mm;}
.glos dt{font:600 9.6pt Poppins;color:var(--teal-d);}
.glos dd{margin:.6mm 0 0;font-size:9pt;line-height:1.5;color:var(--soft);}
.glos .usos{display:block;margin-top:1mm;font-size:7.8pt;color:var(--teal-d);}
.glos .usos a{color:var(--teal-d);text-decoration:underline;text-decoration-thickness:.2mm;}
.fontes li{font-size:9.4pt;line-height:1.55;}
.nota{font-size:9pt;color:var(--soft);}
a.xref,a.url{color:var(--teal-d);text-decoration:underline;text-decoration-thickness:.2mm;text-underline-offset:.6mm;}
a.url{overflow-wrap:anywhere;}
.opener .nesta a{color:inherit;text-decoration:underline;text-decoration-thickness:.2mm;}
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


def slug(key):
    return 'm-' + re.sub(r'[^a-z0-9]', '', key.lower())


URL_RE = re.compile(r'(?<![\w@/.-])((?:https?://)?(?:[a-z0-9-]+\.)+(?:com\.br|org\.br|gov\.br|com|org|net|io|ai|tv|digital|app)(?:/[^\s<>)\]"]*[^\s<>)\]".,;:])?)(?![\w-])', re.I)
PARTE_RE = re.compile(r'\b(Partes?) (\d{1,2})((?:(?:, | e | a )\d{1,2})*)')
ANEXO_RE = re.compile(r'\bAnexo ([A-D])\b')


def _link_text(t):
    def parte(m):
        nums = re.findall(r'\d{1,2}|, | e | a ', m.group(2) + m.group(3))
        out, first = '', True
        for x in nums:
            if x.isdigit() and 1 <= int(x) <= 16:
                txt = f'{m.group(1)} {x}' if first else x
                out += f'<a class="xref" href="#m-parte{int(x):02d}">{txt}</a>'
            else:
                out += (f'{m.group(1)} {x}' if first else x)
            first = False
        return out
    t = PARTE_RE.sub(parte, t)
    t = ANEXO_RE.sub(lambda m: f'<a class="xref" href="#m-anexo{m.group(1).lower()}">Anexo {m.group(1)}</a>', t)
    t = URL_RE.sub(lambda m: f'<a class="url" href="{m.group(1) if m.group(1).lower().startswith("http") else "https://" + m.group(1)}">{m.group(1)}</a>', t)
    return t


def linkify(html):
    """Torna clicáveis as referências a Partes e Anexos e os endereços da web, só no texto fora de links, títulos e código."""
    out, skip = [], 0
    for tok in re.split(r'(<[^>]+>)', html):
        if tok.startswith('<'):
            tag = re.match(r'</?\s*([a-zA-Z0-9]+)', tok)
            name = tag.group(1).lower() if tag else ''
            if name in ('a', 'h1', 'h2', 'h3', 'pre', 'code', 'th'):
                skip += -1 if tok.startswith('</') else 1
                skip = max(skip, 0)
            out.append(tok)
        else:
            out.append(tok if skip else _link_text(tok))
    return ''.join(out)


def link_nesta(nesta_items, body_html):
    heads = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body_html)
    norm = lambda x: re.sub(r'<[^>]+>', '', x).lower()
    res = []
    for it in nesta_items:
        k = it.strip().lower()
        hit = next((i for i, h in heads if norm(h).startswith(k) or k in norm(h)), None)
        res.append(f'<a href="#{hit}">{E(it.strip())}</a>' if hit else E(it.strip()))
    return ' · '.join(res)


def nome_secao(key):
    m = re.match(r'PARTE (\d+)', key)
    if m:
        return f'Parte {int(m.group(1))}'
    if key.startswith('ANEXO'):
        return key.title()
    return key[:1] + key[1:].lower()


def build_html(pages):
    GLOS_USOS.clear()
    parts = [parse(p) for p in PARTES]
    toc_items, sections = [], []
    for meta, body in parts:
        kind = meta.get('tipo', 'parte')
        key = meta['marca']
        body_html = linkify(md(expand(body)))
        body_html = re.sub(r' id="(?!g-)', f' id="{slug(key)}-', body_html)
        body_html = glos_link(body_html, key)
        subs = [(i, re.sub(r'<[^>]+>', '', h)) for i, h in re.findall(r'<h2 id="([^"]+)"[^>]*>(.*?)</h2>', body_html)]
        if kind == 'parte':
            n = int(meta['num'])
            nesta = ''.join(f'<span>{E(x.strip())}</span>' for x in meta['nesta'].split('·'))
            alt = ' alt' if n % 2 == 0 else ''
            opener = (f'<section class="opener{alt}" id="{slug(key)}"><div class="band"></div><p class="etapa">{E(meta["etapa"])}</p><div class="num">{n:02d}</div>'
                      f'<h1>{E(meta["titulo"])}</h1><p class="lead">{E(meta["lead"])}</p>'
                      f'<div class="nesta"><b>Nesta parte · {E(key)}</b>{link_nesta(meta["nesta"].split("·"), body_html)}</div></section>')
            sections.append(opener + f'<section class="sec-body">{body_html}</section>')
            toc_items.append((meta['grupo'], f'{n:02d}', meta['titulo'], key, subs))
        else:
            kicker = f'<p class="kicker">{E(key)}</p>'
            sections.append(f'<section class="sec" id="{slug(key)}">{kicker}<h1 class="sec-title">{E(meta["titulo"])}</h1>{body_html}</section>')
            toc_items.append((meta['grupo'], '', meta['titulo'], key, subs))
    def usos(m):
        lst = GLOS_USOS.get(m.group(1), [])
        if not lst:
            return ''
        links = ' · '.join(f'<a href="#{anc}">{E(nome_secao(k))}</a>' for k, anc in lst)
        return f'<span class="usos">Volte ao texto: {links}</span>'
    sections = [re.sub(r'<!--usos:([a-z0-9-]+)-->', usos, sec) for sec in sections]
    toc = ['<section class="toc" id="sumario"><h1>Sumário</h1>']
    last = None
    for grupo, n, titulo, key, subs in toc_items:
        if grupo != last:
            toc.append(f'<p class="grp">{E(grupo)}</p>'); last = grupo
        pg = pages.get(key, '')
        toc.append(f'<a class="part" href="#{slug(key)}"><span class="n">{n}</span><span class="t">{E(titulo)}</span><span class="p">{pg}</span></a>')
        if key != 'ANEXO B':
            for hid, ht in subs:
                toc.append(f'<a class="sub" href="#{hid}"><span class="n"></span><span class="t">{E(ht)}</span><span class="p">{pages.get(hid, "")}</span></a>')
    toc.append('</section>')
    fim = ('<section class="fim"><h2>O Prompt do Sim</h2><p>Conhecimentos dirigidos e um app de CRM: o método Loop. O app CliniLoop, que completa este guia, registra pacientes, colegas e campanhas no seu navegador, '
           'sem servidor, e leva os prompts para o seu dia a dia.</p><p class="nota" style="color:#9FB6BB">Este guia não substitui a orientação do seu conselho profissional nem assessoria jurídica.</p></section>')
    doc = f'<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>O Prompt do Sim</title><style>{CSS}</style></head><body>{cover_html()}{"".join(toc)}{"".join(sections)}{fim}</body></html>'
    # âncoras de sumário
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
    """Página de cada parte e de cada subtítulo, lida dos destinos nomeados do PDF."""
    from pypdf import PdfReader
    r = PdfReader(str(pdf))
    dests = {}
    for name, d in r.named_destinations.items():
        try:
            dests[str(name).lstrip('/')] = r.get_destination_page_number(d) + 1
        except Exception:
            pass
    found = {}
    for _, _, _, key, subs in toc_items:
        if slug(key) in dests:
            found[key] = dests[slug(key)]
        for hid, _ in subs:
            if hid in dests:
                found[hid] = dests[hid]
    return found, len(r.pages)


def aplicar_capa(pdf_path):
    """Substitui a página 1 pela capa ilustrada (capa/capa-prompt-do-sim.png)."""
    from pypdf import PdfReader, PdfWriter
    from PIL import Image
    import io
    img = Image.open(ROOT / 'capa' / 'capa-prompt-do-sim.png').convert('RGB')
    alvo = round(img.height * 210 / 297)  # recorta as laterais para a proporção A4
    if img.width > alvo:
        x0 = (img.width - alvo) // 2
        img = img.crop((x0, 0, x0 + alvo, img.height))
    buf = io.BytesIO()
    img.save(buf, 'PDF', resolution=img.width / (210 / 25.4))
    cover = PdfReader(buf).pages[0]
    cover.scale_to(595.0, 842.0)
    w = PdfWriter(clone_from=PdfReader(str(pdf_path)))
    w.insert_page(cover, 0)
    w.remove_page(1)
    w.write(str(pdf_path))


def finalizar(pdf_path, pages):
    """Troca destinos nomeados por destinos explícitos (funcionam em mais leitores) e desenha os botões
    Voltar (volta ao ponto de onde o leitor veio), Início da parte e Sumário em cada página."""
    import io
    from pypdf import PdfReader, PdfWriter
    from pypdf.generic import (ArrayObject, DictionaryObject, FloatObject, NameObject, NullObject, NumberObject)
    from reportlab.pdfgen import canvas
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont('Poppins600', str(FONT / 'poppins-600.ttf')))
    r = PdfReader(str(pdf_path))
    alvo = {}
    for name, d in r.named_destinations.items():
        try:
            alvo['/' + str(name).lstrip('/')] = (r.get_destination_page_number(d), float(d.top or 842))
        except Exception:
            pass
    w = PdfWriter(clone_from=r)
    ref = lambda i: w.pages[i].indirect_reference

    def dest(i, top=None):
        if top is None:
            return ArrayObject([ref(i), NameObject('/Fit')])
        return ArrayObject([ref(i), NameObject('/XYZ'), NumberObject(0), FloatObject(min(top + 8, 842)), NullObject()])

    convertidos = 0
    for pg in w.pages:
        for a in pg.get('/Annots') or []:
            a = a.get_object()
            if a.get('/Subtype') != '/Link':
                continue
            d = a.get('/Dest')
            if d is None and a.get('/A') is not None and a['/A'].get('/S') == '/GoTo':
                d = a['/A'].get('/D')
            if d is not None and not isinstance(d, ArrayObject):
                nm = '/' + str(d).lstrip('/')
                if nm in alvo:
                    i, top = alvo[nm]
                    a[NameObject('/Dest')] = dest(i, top)
                    if '/A' in a:
                        del a['/A']
                    convertidos += 1

    n = len(w.pages)
    toc_pg = 2
    secoes = {k: v for k, v in pages.items() if not k.startswith('m-')}
    inicio = min(secoes.values()) if secoes else 3
    starts = sorted((v, k) for k, v in secoes.items())
    W, H = 595.28, 841.89
    right, y0, h, fs, gap = W - 73.7, H - 50, 17, 7.6, 6

    def botao(c, x_right, label):
        tw = pdfmetrics.stringWidth(label, 'Poppins600', fs)
        bw = tw + 26
        x = x_right - bw
        c.setFillColorRGB(0x1F / 255, 0x6F / 255, 0x78 / 255)
        c.roundRect(x, y0, bw, h, h / 2, stroke=0, fill=1)
        c.setStrokeColorRGB(1, 1, 1); c.setLineWidth(1.1); c.setLineCap(1); c.setLineJoin(1)
        ax, ay = x + 9, y0 + h / 2
        c.line(ax, ay, ax + 6, ay); c.line(ax, ay, ax + 2.6, ay + 2.6); c.line(ax, ay, ax + 2.6, ay - 2.6)
        c.setFillColorRGB(1, 1, 1); c.setFont('Poppins600', fs)
        c.drawString(x + 18, y0 + (h - fs) / 2 + 1.4, label)
        return [FloatObject(x), FloatObject(y0), FloatObject(x + bw), FloatObject(y0 + h)]

    def link(i, rect, destino=None, voltar=False):
        a = DictionaryObject({NameObject('/Type'): NameObject('/Annot'), NameObject('/Subtype'): NameObject('/Link'),
                              NameObject('/Rect'): ArrayObject(rect), NameObject('/Border'): ArrayObject([NumberObject(0)] * 3),
                              NameObject('/F'): NumberObject(4)})
        if voltar:
            a[NameObject('/A')] = DictionaryObject({NameObject('/S'): NameObject('/Named'), NameObject('/N'): NameObject('/GoBack')})
        else:
            a[NameObject('/Dest')] = destino
        a[NameObject('/P')] = w.pages[i].indirect_reference
        page = w.pages[i]
        if '/Annots' not in page:
            page[NameObject('/Annots')] = ArrayObject()
        annots = page['/Annots'].get_object() if hasattr(page['/Annots'], 'get_object') else page['/Annots']
        annots.append(w._add_object(a))

    for i in range(1, n):  # a página 1 é a capa
        pg = i + 1
        atual = None
        for spg, key in starts:
            if spg <= pg:
                atual = (spg, key)
        botoes, xr = [], right
        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=(W, H))
        if pg >= inicio:
            rect = botao(c, xr, 'Sumário'); botoes.append((rect, dest(toc_pg - 1), False)); xr = float(rect[0]) - gap
            if atual and atual[0] != pg:
                k = atual[1]
                label = 'Início da parte' if k.startswith('PARTE') else ('Início do anexo' if k.startswith('ANEXO') else 'Início da seção')
                rect = botao(c, xr, label); botoes.append((rect, dest(atual[0] - 1), False)); xr = float(rect[0]) - gap
        rect = botao(c, xr, 'Voltar'); botoes.append((rect, None, True))
        c.save()
        over = PdfReader(io.BytesIO(buf.getvalue())).pages[0]
        w.pages[i].merge_page(over)
        for rect, d, voltar in botoes:
            link(i, rect, d, voltar)
    w.write(str(pdf_path))
    return convertidos


if __name__ == '__main__':
    out = ROOT / 'O-Prompt-do-Sim.pdf'
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
    (ROOT / 'O-Prompt-do-Sim.html').write_text(doc.replace(str(FONT), 'fonts'), encoding='utf-8')
    print('páginas:', total, '| marcas encontradas:', sum(1 for i in items if i[3] in pages2), 'de', len(items), '| subtítulos no sumário:', sum(len(i[4]) for i in items))
    aplicar_capa(out)
    print('links convertidos para destino explícito:', finalizar(out, pages2))
