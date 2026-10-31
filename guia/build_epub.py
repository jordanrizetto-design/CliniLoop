#!/usr/bin/env python3
"""Gera o ePub do guia O Prompt do Sim a partir de guia/partes/*.md.

Uso: python3 guia/build_epub.py   (gera guia/O-Prompt-do-Sim.epub)
Reaproveita o pipeline do PDF (build_guia.py): mesmo texto, mesmas caixas, mesmo glossário com links.
Um arquivo XHTML por parte ou anexo; sumário navegável (nav.xhtml + toc.ncx); capa ilustrada; fontes Poppins embutidas.
"""
import datetime, io, pathlib, re, sys, uuid, zipfile
from html import escape as E

from lxml import etree, html as lhtml
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
import build_guia as bg  # noqa: E402

OUT = ROOT / 'O-Prompt-do-Sim.epub'
BOOK_ID = 'urn:uuid:' + str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://loopuniversity.com.br/o-prompt-do-sim'))
TITULO = 'O Prompt do Sim'
AUTOR = 'JR Tosoni'
EDITORA = 'Loop University'

ROTULOS = {'prompt': 'Prompt pronto', 'pratica': 'Na prática · até 30 minutos, hoje', 'noapp': 'No CliniLoop',
           'destaque': 'A ideia central', 'atencao': 'Atenção'}

FONTES = [('poppins-latin-400-normal.woff2', 400, 'normal'), ('poppins-latin-400-italic.woff2', 400, 'italic'),
          ('poppins-latin-500-normal.woff2', 500, 'normal'), ('poppins-latin-600-normal.woff2', 600, 'normal'),
          ('poppins-latin-600-italic.woff2', 600, 'italic'), ('poppins-latin-700-normal.woff2', 700, 'normal')]

CSS = '\n'.join(f"@font-face{{font-family:'Poppins';src:url('../fonts/{f}');font-weight:{w};font-style:{s};}}" for f, w, s in FONTES) + '''
body{font-family:Poppins,sans-serif;line-height:1.6;color:#14303A;margin:0 4%;}
p{margin:0 0 .9em;}
h1,h2,h3,h4{font-family:Poppins,sans-serif;color:#14303A;line-height:1.25;page-break-after:avoid;break-after:avoid;}
h1{font-size:1.9em;font-weight:600;margin:.4em 0 .6em;}
h2{font-size:1.4em;font-weight:600;margin:1.8em 0 .6em;padding-top:.5em;border-top:3px solid #C2502F;}
h3{font-size:1.15em;font-weight:600;margin:1.4em 0 .4em;color:#185860;}
h4{font-size:1em;font-weight:600;margin:1em 0 .3em;}
ul,ol{margin:0 0 1em;padding-left:1.4em;}
li{margin:0 0 .45em;}
b,strong{font-weight:600;}
a{color:#1F6F78;text-decoration:none;}
a.xref,a.url{text-decoration:underline;}
a.url{word-wrap:break-word;overflow-wrap:anywhere;}
a.glos-link{color:inherit;border-bottom:1px dotted #1F6F78;}
hr{border:0;border-top:1px solid #D9E0E2;margin:1.5em 0;}
.lead{font-style:italic;font-size:1.1em;color:#3A5059;}
.kicker,.etapa{font-size:.72em;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#C2502F;margin:1em 0 .4em;}
.opener{margin:0 0 1.6em;padding:1.2em 0 1em;border-bottom:1px solid #D9E0E2;}
.opener .num{font-size:3.6em;font-weight:600;line-height:1;color:#F4BFA4;margin:.2em 0 .1em;}
.opener h1{margin-top:.1em;}
.nesta{font-size:.9em;color:#3A5059;}
.nesta b{display:block;font-size:.78em;letter-spacing:.14em;text-transform:uppercase;color:#1F6F78;margin-bottom:.3em;}
.box{margin:1.3em 0;padding:.9em 1em;border-radius:6px;page-break-inside:avoid;break-inside:avoid;}
.box p:last-child,.box ul:last-child{margin-bottom:0;}
.box-label{font-size:.72em;font-weight:600;letter-spacing:.14em;text-transform:uppercase;margin:0 0 .6em;}
.prompt{background:#EAF4F5;border-left:5px solid #1F6F78;}
.prompt .box-label{color:#185860;}
.pratica{background:#FFF6EF;border:1px solid #F4BFA4;border-left:5px solid #C2502F;}
.pratica .box-label{color:#C2502F;}
.noapp{background:#14303A;color:#F4F1EA;}
.noapp .box-label{color:#F4BFA4;}
.noapp a,.noapp strong{color:#FFFFFF;}
.destaque{background:#EAF4F5;}
.destaque .box-label{color:#185860;}
.atencao{background:#FFF3EE;border-left:5px solid #C2502F;}
.atencao .box-label{color:#C2502F;}
.exemplo{background:#FBFAF6;border:1px dashed #B8C5C8;}
.exemplo .box-label{color:#3A5059;}
.ex-h{font-size:.75em;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#185860;margin:1em 0 .3em;}
.exemplo pre{white-space:pre-wrap;font-family:Poppins,sans-serif;font-size:.9em;margin:0;padding:.7em .8em;background:#FFFFFF;border:1px solid #D9E0E2;border-radius:4px;}
.tres>div,.marco{margin:.8em 0;padding:.8em 1em;border:1px solid #D9E0E2;border-radius:6px;}
.tres b{display:block;font-size:.75em;letter-spacing:.12em;text-transform:uppercase;margin-bottom:.3em;}
.marco{border-top:4px solid #1F6F78;}
.marco h4{margin-top:0;}
table{width:100%;max-width:100%;border-collapse:collapse;margin:1em 0 1.4em;font-size:.8em;line-height:1.4;}
th,td{word-break:break-word;overflow-wrap:anywhere;-webkit-hyphens:auto;hyphens:auto;}
th{background:#1F6F78;color:#FFFFFF;text-align:left;font-weight:600;padding:.4em .4em;}
td{padding:.4em .4em;vertical-align:top;border-bottom:1px solid #D9E0E2;}
table.plano td.dia{font-weight:600;color:#1F6F78;text-align:center;}
.semana h3 span{font-size:.75em;font-weight:500;color:#3A5059;}
.glos div{margin-bottom:.9em;}
.glos dt{font-weight:600;color:#185860;}
.glos dd{margin:.15em 0 0;font-size:.92em;color:#3A5059;}
.glos .usos{display:block;margin-top:.2em;font-size:.82em;}
.glos .usos a{text-decoration:underline;}
.nota{font-size:.9em;color:#3A5059;}
figure{margin:1em 0 1.4em;text-align:center;page-break-inside:avoid;break-inside:avoid;}
figure img,img{max-width:100%;height:auto;}
figure img{border:1px solid #D9E0E2;border-radius:4px;}
figcaption{font-size:.82em;color:#3A5059;margin-top:.4em;}
.capa{margin:0;padding:0;text-align:center;}
.capa img{max-width:100%;max-height:100%;}
nav ol{list-style:none;padding-left:0;}
nav ol ol{padding-left:1.2em;font-size:.92em;}
nav li{margin:.35em 0;}
.fim{margin-top:3em;padding:1.4em;background:#14303A;color:#F4F1EA;border-radius:6px;}
.fim h2{color:#F4F1EA;border:0;margin-top:0;padding-top:0;}
.fim p{color:#CFDDE0;}
'''


def xhtml(title, body, extra_head='', epub_type=''):
    et = f' epub:type="{epub_type}"' if epub_type else ''
    return ('<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n'
            '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt-BR" xml:lang="pt-BR">'
            f'<head><meta charset="utf-8"/><title>{E(title)}</title><link rel="stylesheet" type="text/css" href="../css/guia.css"/>{extra_head}</head>'
            f'<body{et}>{body}</body></html>')


def to_xml(fragment_html):
    """HTML5 (pandoc) -> XHTML bem-formado."""
    parts = lhtml.fragments_fromstring(fragment_html)
    out = []
    for p in parts:
        if isinstance(p, str):
            out.append(E(p))
        else:
            out.append(etree.tostring(p, method='xml', encoding='unicode'))
    return ''.join(out)


def rotular_caixas(h):
    def sub(m):
        classes = m.group(1).split()
        tipo = next((c for c in classes if c in ROTULOS), None)
        return m.group(0) + (f'<p class="box-label">{ROTULOS[tipo]}</p>' if tipo else '')
    return re.sub(r'<div class="([^"]*\bbox\b[^"]*)">', sub, h)


def main():
    bg.GLOS_USOS.clear()
    imagens = {}
    capitulos = []  # (arquivo, titulo, chave, html, subtitulos)
    for i, path in enumerate(bg.PARTES, 1):
        meta, body = bg.parse(path)
        key = meta['marca']
        kind = meta.get('tipo', 'parte')
        h = bg.linkify(bg.md(bg.expand(body)))
        h = re.sub(r' id="(?!g-)', f' id="{bg.slug(key)}-', h)
        h = bg.glos_link(h, key)
        h = rotular_caixas(h)
        h = re.sub(r'<colgroup>.*?</colgroup>', '', h, flags=re.S)  # larguras fixas do pandoc estouram telas pequenas

        def img(m):
            src = m.group(1)
            nome = 'img-' + pathlib.Path(src).stem + '.jpg'
            imagens[nome] = ROOT / src
            return f'src="../images/{nome}"'
        h = re.sub(r'src="([^"]+)"', img, h)
        subs = [(sid, re.sub(r'<[^>]+>', '', t)) for sid, t in re.findall(r'<h2 id="([^"]+)"[^>]*>(.*?)</h2>', h)]
        if kind == 'parte':
            n = int(meta['num'])
            topo = (f'<section class="opener" id="{bg.slug(key)}"><p class="etapa">{E(meta["etapa"])}</p><p class="num">{n:02d}</p>'
                    f'<h1>{E(meta["titulo"])}</h1><p class="lead">{E(meta["lead"])}</p>'
                    f'<p class="nesta"><b>Nesta parte · {E(key.title())}</b>{bg.link_nesta(meta["nesta"].split("·"), h)}</p></section>')
            titulo = f'{n:02d}. {meta["titulo"]}'
        else:
            topo = f'<section id="{bg.slug(key)}"><p class="kicker">{E(key)}</p><h1>{E(meta["titulo"])}</h1></section>'
            titulo = meta['titulo']
        capitulos.append([f'cap{i:02d}.xhtml', titulo, key, topo + h, subs, meta.get('grupo', '')])

    # "Volte ao texto" no glossário
    def usos(m):
        lst = bg.GLOS_USOS.get(m.group(1), [])
        if not lst:
            return ''
        return '<span class="usos">Volte ao texto: ' + ' · '.join(f'<a href="#{a}">{E(bg.nome_secao(k))}</a>' for k, a in lst) + '</span>'
    for c in capitulos:
        c[3] = re.sub(r'<!--usos:([a-z0-9-]+)-->', usos, c[3])

    # converte para XHTML e resolve links entre arquivos
    for c in capitulos:
        c[3] = to_xml(c[3])
    onde = {}
    for arq, _, _, h, _, _ in capitulos:
        for i in re.findall(r' id="([^"]+)"', h):
            onde[i] = arq
    perdidos = set()
    for c in capitulos:
        def fix(m):
            alvo = m.group(1)
            if alvo not in onde:
                perdidos.add(alvo)
                return 'href="#"'
            return f'href="{onde[alvo] if onde[alvo] != c[0] else ""}#{alvo}"'
        c[3] = re.sub(r'href="#([^"]*)"', fix, c[3])
        c[3] = c[3].replace('href="#"', '').replace('<a >', '<a>')

    fim = ('<section class="fim"><h2>O Prompt do Sim</h2><p>Conhecimentos dirigidos e um app de CRM: o Sistema Loop. O app CliniLoop, que completa este guia, '
           'registra pacientes, colegas e campanhas no seu navegador e leva os prompts para o seu dia a dia.</p>'
           '<p class="nota">Este guia não substitui a orientação do seu conselho profissional nem assessoria jurídica.</p>'
           '<p class="nota">Acesso ao app: clini.loopuniversity.com.br · Atendimento: atendimento@loopuniversity.com.br</p></section>')
    capitulos[-1][3] += fim

    agora = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    # sumário (EPUB 3) e toc.ncx (leitores antigos)
    nav = ['<nav epub:type="toc" id="toc"><h1>Sumário</h1><ol>']
    ncx = []
    ordem = 1
    for arq, titulo, key, _, subs, _ in capitulos:
        nav.append(f'<li><a href="{arq}">{E(titulo)}</a>')
        ncx.append(f'<navPoint id="np{ordem}" playOrder="{ordem}"><navLabel><text>{E(titulo)}</text></navLabel><content src="text/{arq}"/>')
        ordem += 1
        if subs and key != 'ANEXO B':
            nav.append('<ol>' + ''.join(f'<li><a href="{arq}#{sid}">{E(t)}</a></li>' for sid, t in subs) + '</ol>')
            for sid, t in subs:
                ncx.append(f'<navPoint id="np{ordem}" playOrder="{ordem}"><navLabel><text>{E(t)}</text></navLabel><content src="text/{arq}#{sid}"/></navPoint>')
                ordem += 1
        nav.append('</li>')
        ncx.append('</navPoint>')
    nav.append('</ol></nav><nav epub:type="landmarks" hidden=""><ol>'
               '<li><a epub:type="cover" href="capa.xhtml">Capa</a></li>'
               '<li><a epub:type="toc" href="nav.xhtml">Sumário</a></li>'
               f'<li><a epub:type="bodymatter" href="{capitulos[0][0]}">Início</a></li></ol></nav>')
    nav_doc = xhtml('Sumário', ''.join(nav))
    ncx_doc = ('<?xml version="1.0" encoding="utf-8"?>\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">'
               f'<head><meta name="dtb:uid" content="{BOOK_ID}"/><meta name="dtb:depth" content="2"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head>'
               f'<docTitle><text>{TITULO}</text></docTitle><navMap>{"".join(ncx)}</navMap></ncx>')
    capa_doc = xhtml(TITULO, f'<div class="capa"><img src="../images/capa.jpg" alt="{TITULO}: marketing, inteligência artificial e CRM para profissionais da saúde"/></div>', epub_type='cover')

    # manifesto
    man = ['<item id="nav" href="text/nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
           '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
           '<item id="css" href="css/guia.css" media-type="text/css"/>',
           '<item id="capa-img" href="images/capa.jpg" media-type="image/jpeg" properties="cover-image"/>',
           '<item id="capa" href="text/capa.xhtml" media-type="application/xhtml+xml"/>']
    for f, _, _ in FONTES:
        man.append(f'<item id="f-{f.split(".")[0]}" href="fonts/{f}" media-type="font/woff2"/>')
    for nome in sorted(imagens):
        man.append(f'<item id="{nome.rsplit(".", 1)[0]}" href="images/{nome}" media-type="image/jpeg"/>')
    spine = ['<itemref idref="capa" linear="yes"/>', '<itemref idref="nav"/>']
    for arq, *_ in capitulos:
        iid = arq.split('.')[0]
        man.append(f'<item id="{iid}" href="text/{arq}" media-type="application/xhtml+xml"/>')
        spine.append(f'<itemref idref="{iid}"/>')
    opf = ('<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="pt-BR">'
           '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">'
           f'<dc:identifier id="bookid">{BOOK_ID}</dc:identifier><dc:title>{TITULO}</dc:title><dc:creator>{AUTOR}</dc:creator>'
           f'<dc:publisher>{EDITORA}</dc:publisher><dc:language>pt-BR</dc:language><dc:date>2026</dc:date>'
           '<dc:subject>Marketing na saúde</dc:subject><dc:subject>Inteligência artificial</dc:subject><dc:subject>CRM</dc:subject>'
           '<dc:description>Marketing, inteligência artificial e CRM para profissionais da saúde. O guia do Sistema Loop, que acompanha o app CliniLoop.</dc:description>'
           f'<meta property="dcterms:modified">{agora}</meta><meta name="cover" content="capa-img"/></metadata>'
           f'<manifest>{"".join(man)}</manifest><spine toc="ncx">{"".join(spine)}</spine>'
           '<guide><reference type="cover" title="Capa" href="text/capa.xhtml"/><reference type="toc" title="Sumário" href="text/nav.xhtml"/></guide></package>')
    container = ('<?xml version="1.0" encoding="utf-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">'
                 '<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>')

    def jpg(path, max_lado):
        im = Image.open(path).convert('RGB')
        im.thumbnail((max_lado, max_lado))
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=85, optimize=True, progressive=True)
        return buf.getvalue()

    with zipfile.ZipFile(OUT, 'w') as z:
        z.writestr(zipfile.ZipInfo('mimetype'), 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
        w = lambda n, d: z.writestr(n, d, compress_type=zipfile.ZIP_DEFLATED)
        w('META-INF/container.xml', container)
        w('OEBPS/content.opf', opf)
        w('OEBPS/toc.ncx', ncx_doc)
        w('OEBPS/css/guia.css', CSS)
        w('OEBPS/text/capa.xhtml', capa_doc)
        w('OEBPS/text/nav.xhtml', nav_doc)
        for arq, titulo, _, h, _, _ in capitulos:
            w(f'OEBPS/text/{arq}', xhtml(titulo, h))
        for f, _, _ in FONTES:
            w(f'OEBPS/fonts/{f}', (bg.FONT / f).read_bytes())
        w('OEBPS/images/capa.jpg', jpg(ROOT / 'capa' / 'capa-prompt-do-sim.png', 2400))
        for nome, src in imagens.items():
            w(f'OEBPS/images/{nome}', jpg(src, 1400))
    print('capítulos:', len(capitulos), '| imagens:', len(imagens), '| links sem destino:', sorted(perdidos) or 'nenhum')
    print('arquivo:', OUT, round(OUT.stat().st_size / 1e6, 2), 'MB')


if __name__ == '__main__':
    main()
