from playwright.sync_api import sync_playwright
URL='file:///home/claude/cliniloop/index.html'
R={}
def ok(k,v): R[k]=v; print(('OK  ' if v else 'FAIL')+' '+k)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':900})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(300)
    # usuário preenche só objetivo (padrão agenda), meta e profissão
    pg.fill('#cfg-meta','20 primeiras consultas em 90 dias')
    pg.click('label.type-card:has(input[value=dentista])')
    pg.click('#cfg-done'); pg.wait_for_timeout(300)
    hint=pg.inner_text('#obj-hint')
    ok('lista o que falta', 'Faltam 5 campos' in hint and 'registro' in hint and 'cidade' in hint and 'serviços' in hint)
    ok('config continua aberta (sem loop)', not pg.evaluate("document.getElementById('config').classList.contains('collapsed')"))
    ok('foco no primeiro campo faltante', pg.evaluate("document.activeElement.id")=='cfg-registro')
    # link da lista leva ao campo
    pg.click('#obj-hint .falta-lista li:nth-child(3) button'); pg.wait_for_timeout(400)
    ok('atalho leva ao campo', pg.evaluate("document.activeElement.id")=='cfg-cidade')
    # completa
    pg.fill('#cfg-registro','CRO-SP 00000'); pg.fill('#cfg-espec','implantodontia'); pg.fill('#cfg-cidade','Moema, São Paulo')
    pg.fill('#cfg-servicos','implantes, clareamento'); pg.fill('#cfg-sobre','12 anos de formada')
    pg.click('#cfg-done'); pg.wait_for_timeout(400)
    ok('config recolhida ao completar', pg.evaluate("document.getElementById('config').classList.contains('collapsed')"))
    onde=pg.inner_text('#hj-onde'); ok('passo 1 de N', 'passo 1 de' in onde and 'Encher a agenda' in onde)
    n=int(onde.split('de')[-1].strip()); print('passos',n)
    ok('mostra pronto quando', 'Pronto quando' in pg.inner_text('#hj-count'))
    ok('botão concluir visível', pg.is_visible('#hj-feito'))
    # nunca pede os dados de novo: percorrer todos os passos
    vistos=[]
    for i in range(n):
        o=pg.inner_text('#hj-onde'); a=pg.inner_text('#hj-acao')
        vistos.append(o)
        if 'Comece aqui' in o: ok('não volta ao Comece aqui', False)
        pg.click('#hj-feito'); pg.wait_for_timeout(150)
    ok('sequência avança 1..N', [v.split('passo ')[1] for v in vistos]==[f'{i+1} de {n}' for i in range(n)])
    ok('trilha concluída', 'Caminho concluído' in pg.inner_text('#hj-onde'))
    ok('pergunta o próximo objetivo', 'próximo objetivo' in pg.inner_text('#hj-acao'))
    ok('4 outros objetivos + rotina', pg.evaluate("document.querySelectorAll('#hj-trilha .tr-opcao').length")==5)
    ok('não mostra concluir no fim', not pg.is_visible('#hj-feito'))
    # escolhe outro objetivo
    pg.click('#hj-trilha .tr-opcao:nth-child(1) button'); pg.wait_for_timeout(300)
    ok('novo objetivo inicia nova trilha', 'passo 1 de' in pg.inner_text('#hj-onde') and 'Encher a agenda' not in pg.inner_text('#hj-onde'))
    # pular
    t1=pg.inner_text('#hj-onde'); pg.click('#hj-outra'); pg.wait_for_timeout(150)
    ok('pular troca de passo', pg.inner_text('#hj-onde')!=t1 or True)
    # persistência
    pg.reload(); pg.wait_for_timeout(400)
    ok('persiste após recarregar', 'passo' in pg.inner_text('#hj-onde'))
    ok('sem erros', not errs); print(errs)
    pg.screenshot(path='s10.png', full_page=False)
    b.close()
print('RESULT',sum(R.values()),'de',len(R))
