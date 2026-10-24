import math, random, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
FONTS = ROOT.parent / 'fonts'
W, H = 1400, 1980
PAL = {
 'azul':  dict(bg1='#030C24', bg2='#0A3F9E', acc='#5BD0FF', acc2='#A8E6FF', glow='#2F7BFF', warm='#FFB454', ring='#1B5FD6'),
 'verde': dict(bg1='#02150F', bg2='#0A5240', acc='#4DE3B8', acc2='#B4F5DE', glow='#12A57C', warm='#F4C95D', ring='#0E7C5E'),
 'roxo':  dict(bg1='#12052B', bg2='#52209C', acc='#C8A2FF', acc2='#EBDDFF', glow='#8B4DFF', warm='#FF9EC4', ring='#6A32D1'),
}
# ---- ícones (caixa -1..1), traço branco ----
def ic(name):
    S = 'fill="none" stroke="#fff" stroke-width="0.11" stroke-linecap="round" stroke-linejoin="round"'
    return {
     'instagram': f'<g {S}><rect x="-.78" y="-.78" width="1.56" height="1.56" rx=".42"/><circle r=".36"/><circle cx=".52" cy="-.52" r=".05" fill="#fff"/></g>',
     'whatsapp': f'<g {S}><path d="M0 -.8A.8 .8 0 1 1 -.42 .68L-.8 .8L-.66 .4A.8 .8 0 0 1 0 -.8Z"/><path d="M-.3 -.2C-.2 .22 .22 .4 .38 .3L.4 .12L.2 .02L.08 .1C-.06 .06 -.12 -.02 -.14 -.14L-.04 -.24L-.12 -.42L-.3 -.4Z" fill="#fff" stroke="none"/></g>',
     'youtube': f'<g {S}><rect x="-.86" y="-.58" width="1.72" height="1.16" rx=".3"/><path d="M-.2 -.28L.34 0L-.2 .28Z" fill="#fff"/></g>',
     'linkedin': f'<g {S}><rect x="-.8" y="-.8" width="1.6" height="1.6" rx=".2"/><path d="M-.5 -.08V.5M-.5 -.42V-.4M-.14 .5V-.08M-.14 .12C-.14 -.1 .46 -.2 .46 .16V.5"/></g>',
     'tiktok': f'<g {S}><path d="M.12 -.8V.4A.34 .34 0 1 1 -.22 .06M.12 -.8C.16 -.4 .4 -.28 .64 -.26"/></g>',
     'google': f'<g {S}><path d="M0 .86C-.5 .3 -.62 .1 -.62 -.2A.62 .62 0 0 1 .62 -.2C.62 .1 .5 .3 0 .86Z"/><circle cy="-.2" r=".22"/></g>',
     'dente': f'<g {S}><path d="M-.62 -.5C-.62 -.84 -.2 -.84 0 -.68C.2 -.84 .62 -.84 .62 -.5C.62 -.1 .42 .1 .38 .5C.34 .86 .1 .86 .06 .5C.04 .24 -.04 .24 -.06 .5C-.1 .86 -.34 .86 -.38 .5C-.42 .1 -.62 -.1 -.62 -.5Z"/></g>',
     'estetoscopio': f'<g {S}><path d="M-.5 -.8V-.1A.5 .5 0 0 0 .5 -.1V-.8M-.5 -.8H-.3M.5 -.8H.3M0 .4V.46A.36 .36 0 0 0 .72 .46V.2"/><circle cx=".72" cy=".1" r=".14" fill="#fff"/></g>',
     'psi': '<text x="0" y=".42" text-anchor="middle" font-family="Fraunces,serif" font-size="1.45" fill="#fff" font-weight="500">Ψ</text>',
     'fisio': f'<g {S}><circle cx=".1" cy="-.62" r=".17"/><path d="M.04 -.36L-.12 .08L.3 .22L.1 .76M-.12 .08L-.5 .46M-.5 -.16L.3 -.2"/></g>',
     'nutri': f'<g {S}><path d="M0 -.3C-.3 -.6 -.84 -.4 -.76 .12C-.7 .6 -.3 .86 0 .72C.3 .86 .7 .6 .76 .12C.84 -.4 .3 -.6 0 -.3Z"/><path d="M0 -.3C0 -.5 .1 -.7 .3 -.84"/></g>',
     'medicina': f'<g {S}><path d="M0 -.86V.86M-.18 -.64H.18M-.42 -.2C.4 -.5 .4 .0 -.1 .04C-.5 .1 -.4 .5 .4 .3"/></g>',
    }[name]
ICONS = ['instagram','dente','whatsapp','estetoscopio','youtube','psi','linkedin','fisio','tiktok','nutri','google','medicina']
LABEL = {}

def brain(pal, cx, cy, sc):
    rnd = random.Random(7)
    # silhueta: elipses (x,y,rx,ry,rot)
    E = [(0,-30,290,205,0),(70,95,190,82,-12),(165,150,95,64,-8),(95,185,34,95,18),(-120,40,120,95,0)]
    def inside(x,y,k=1.0):
        for ex,ey,rx,ry,rt in E:
            a=math.radians(rt); dx,dy=x-ex,y-ey
            u=dx*math.cos(a)+dy*math.sin(a); v=-dx*math.sin(a)+dy*math.cos(a)
            if (u/(rx*k))**2+(v/(ry*k))**2<=1: return True
        return False
    pts=[]
    tries=0
    while len(pts)<260 and tries<20000:
        tries+=1
        x=rnd.uniform(-310,310); y=rnd.uniform(-240,280)
        if not inside(x,y,0.93): continue
        if all((x-a)**2+(y-b)**2>26**2 for a,b in pts): pts.append((x,y))
    # bordas: pontos do contorno
    edge=[]
    for ex,ey,rx,ry,rt in E[:4]:
        a=math.radians(rt)
        for i in range(34):
            t=2*math.pi*i/34
            u=rx*math.cos(t); v=ry*math.sin(t)
            x=ex+u*math.cos(a)-v*math.sin(a); y=ey+u*math.sin(a)+v*math.cos(a)
            if inside(x,y,0.985) and not inside(x,y,1.03): edge.append((x,y))
    pts+=edge
    out=[]
    # contorno (truque do traço + preenchimento)
    shapes=''.join(f'<ellipse cx="{ex}" cy="{ey}" rx="{rx}" ry="{ry}" transform="rotate({rt} {ex} {ey})"/>' for ex,ey,rx,ry,rt in E)
    out.append(f'<g id="sil"><g fill="{pal["bg2"]}" stroke="{pal["acc"]}" stroke-width="7" stroke-opacity=".9" filter="url(#glow)">{shapes}</g><g fill="{pal["bg1"]}" fill-opacity=".92" stroke="none">{shapes}</g></g>')
    # giros
    for _ in range(9):
        x=rnd.uniform(-200,200); y=rnd.uniform(-170,110)
        if not inside(x,y,.8): continue
        d=f'M{x:.0f} {y:.0f}q{rnd.uniform(-60,60):.0f} {rnd.uniform(-50,50):.0f} {rnd.uniform(-90,90):.0f} {rnd.uniform(-30,60):.0f}'
        out.append(f'<path d="{d}" stroke="{pal["acc"]}" stroke-opacity=".22" stroke-width="3" fill="none" stroke-linecap="round"/>')
    # rede neural
    lines=[]; deg={}
    for i,(x,y) in enumerate(pts):
        near=sorted(((x-a)**2+(y-b)**2,j) for j,(a,b) in enumerate(pts) if j!=i)[:3]
        for d2,j in near:
            if d2<64**2 and deg.get((min(i,j),max(i,j))) is None:
                deg[(min(i,j),max(i,j))]=1
                lines.append(f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{pts[j][0]:.0f}" y2="{pts[j][1]:.0f}"/>')
    out.append(f'<g stroke="{pal["acc"]}" stroke-opacity=".55" stroke-width="2">{"".join(lines)}</g>')
    nodes=''
    for x,y in pts:
        r=rnd.choice([3,3,4,5,7]); c=pal['acc2'] if rnd.random()<.8 else pal['warm']
        nodes+=f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r}" fill="{c}"/>'
    out.append(f'<g filter="url(#glow2)">{nodes}</g>')
    # cruz médica no centro do cérebro
    out.append(f'<g transform="translate(-10,-25)"><rect x="-17" y="-52" width="34" height="104" rx="10" fill="{pal["warm"]}"/><rect x="-52" y="-17" width="104" height="34" rx="10" fill="{pal["warm"]}"/></g>')
    return f'<g transform="translate({cx} {cy}) scale({sc})">{"".join(out)}</g>'

def svg(nome):
    p = PAL[nome]
    cx, cy = 700, 715
    parts=[]
    parts.append(f'''<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="{p['bg1']}"/><stop offset="1" stop-color="{p['bg2']}"/></linearGradient>
<radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="{p['glow']}" stop-opacity=".55"/><stop offset="1" stop-color="{p['glow']}" stop-opacity="0"/></radialGradient>
<filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="glow2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<linearGradient id="badge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{p['ring']}"/><stop offset="1" stop-color="{p['bg1']}"/></linearGradient>
</defs>
<rect width="{W}" height="{H}" fill="url(#bg)"/>
<circle cx="{cx}" cy="{cy}" r="620" fill="url(#halo)"/>''')
    # malha de fundo
    rnd=random.Random(3)
    grid=''
    for i in range(26):
        x=rnd.randint(0,W); y=rnd.randint(0,1180)
        grid+=f'<path d="M{x} {y}h{rnd.randint(60,200)}l{rnd.randint(20,60)} {rnd.randint(20,60)}h{rnd.randint(40,120)}" />'
    parts.append(f'<g stroke="{p["acc"]}" stroke-opacity=".12" stroke-width="2" fill="none">{grid}</g>')
    # anéis
    parts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="540" ry="520" fill="none" stroke="{p["acc"]}" stroke-opacity=".35" stroke-width="2" stroke-dasharray="4 14"/>')
    parts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="470" ry="450" fill="none" stroke="{p["acc"]}" stroke-opacity=".18" stroke-width="2"/>')
    # ícones em órbita + conexões
    n=len(ICONS); conn=''; badges=''
    for i,name in enumerate(ICONS):
        ang=-math.pi/2+2*math.pi*i/n
        x=cx+540*math.cos(ang); y=cy+520*math.sin(ang)
        bx=cx+250*math.cos(ang); by=cy+215*math.sin(ang)
        conn+=f'<line x1="{bx:.0f}" y1="{by:.0f}" x2="{x:.0f}" y2="{y:.0f}"/>'
        social = i%2==0
        stroke = p['acc'] if social else p['warm']
        badges+=f'<g transform="translate({x:.0f} {y:.0f})"><circle r="62" fill="url(#badge)" stroke="{stroke}" stroke-width="4" filter="url(#glow)"/><g transform="scale(32)">{ic(name)}</g></g>'
    parts.append(f'<g stroke="{p["acc"]}" stroke-opacity=".4" stroke-width="2">{conn}</g>')
    parts.append(brain(p,cx,cy,1.0))
    parts.append(badges)
    # título
    parts.append(f'''<text x="{W/2}" y="1360" text-anchor="middle" font-family="IBM Plex Sans" font-weight="600" font-size="26" letter-spacing="7" fill="{p['acc']}">SAÚDE · MARKETING DIGITAL · INTELIGÊNCIA ARTIFICIAL</text>
<text x="{W/2}" y="1520" text-anchor="middle" font-family="Fraunces" font-weight="700" font-size="170" fill="#fff">Prompt</text>
<text x="{W/2}" y="1680" text-anchor="middle" font-family="Fraunces" font-style="italic" font-weight="400" font-size="170" fill="{p['warm']}">do Sim</text>
<rect x="{W/2-70}" y="1732" width="140" height="6" rx="3" fill="{p['warm']}"/>
<text x="{W/2}" y="1800" text-anchor="middle" font-family="Fraunces" font-size="44" fill="#fff" fill-opacity=".92">Guia digital para o sucesso</text>
<text x="{W/2}" y="1856" text-anchor="middle" font-family="Fraunces" font-size="44" fill="#fff" fill-opacity=".92">do profissional da saúde</text>
<text x="{W/2}" y="1930" text-anchor="middle" font-family="IBM Plex Sans" font-weight="500" font-size="22" letter-spacing="5" fill="{p['acc']}" fill-opacity=".85">EDIÇÃO 2026 · COM O APP CLINILOOP</text>''')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{"".join(parts)}</svg>'

def html(nome):
    ff=''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:{st};src:url('file://{FONTS}/{f}') format('woff2');}}" for fam,w,st,f in [
      ('Fraunces',400,'normal','fraunces-latin-400-normal.woff2'),('Fraunces',400,'italic','fraunces-latin-400-italic.woff2'),('Fraunces',600,'normal','fraunces-latin-600-normal.woff2'),('Fraunces',700,'normal','fraunces-latin-700-normal.woff2'),
      ('IBM Plex Sans',500,'normal','ibm-plex-sans-latin-500-normal.woff2'),('IBM Plex Sans',600,'normal','ibm-plex-sans-latin-600-normal.woff2')])
    return f'<!doctype html><meta charset="utf-8"><style>{ff} html,body{{margin:0;background:#000}}</style>{svg(nome)}'

if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b=pw.chromium.launch(); pg=b.new_page(viewport={'width':W,'height':H})
        for nome in PAL:
            f=ROOT/f'_c_{nome}.html'; f.write_text(html(nome),encoding='utf-8')
            pg.goto(f'file://{f}'); pg.wait_for_timeout(500)
            pg.screenshot(path=str(ROOT/f'capa-{nome}.png'))
            (ROOT/f'capa-{nome}.svg').write_text(svg(nome),encoding='utf-8'); f.unlink()
        b.close()
    print('ok')
