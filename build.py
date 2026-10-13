#!/usr/bin/env python3
"""Monta o index.html do CliniLoop a partir de src/."""
import re, pathlib, urllib.parse
ROOT = pathlib.Path(__file__).parent
SRC = ROOT / 'src'
base = pathlib.Path('/home/claude/otimizador-de-oportunidades/index.html')
r = lambda n: (SRC / n).read_text(encoding='utf-8')

# CSS: base do BuscaLoop (mesmo design system), com a paleta de saúde
css_src = SRC / 'base.css'
if not css_src.exists():
    lines = base.read_text(encoding='utf-8').split('\n')
    a = lines.index('<style>') + 1
    b = lines.index('</style>')
    css = '\n'.join(lines[a:b])
    css = re.sub(r'  /\* ALERTS HUB \*/.*?  /\* TRACKER \*/', '  /* TRACKER */', css, flags=re.S)
    css_src.write_text(css, encoding='utf-8')
css = css_src.read_text(encoding='utf-8')
COLORS = [('#1C2B24', '#14303A'), ('#3B4A40', '#3A5059'), ('#F3EEE4', '#F4F1EA'), ('#E8DFCF', '#E6E0D3'), ('#A9481F', '#C2502F'),
          ('#F2B98F', '#F4BFA4'), ('#2E6A4F', '#1F6F78'), ('rgba(28,43,36', 'rgba(20,48,58'), ('rgba(243,238,228', 'rgba(244,241,234'),
          ('#8E3B18', '#9A3B20'), ('#6F2D12', '#6E2A16'), ('#B9542A', '#D05C3A'), ('rgba(169,72,31', 'rgba(194,80,47'), ('#24563F', '#185860'),
          ('#1A4030', '#10434A'), ('#337857', '#257F89'), ('rgba(46,106,79', 'rgba(31,111,120'), ('#EEF5F0', '#EAF4F5'), ('#E5EFE8', '#E2EFF0'),
          ('#CFD6CC', '#C9D6DA'), ('#E8ECE4', '#E6EEF0'), ('#A8B5AA', '#A3B4BA'), ('#E3E8DF', '#E1EAEC'), ('rgba(242,185,143', 'rgba(244,191,164'),
          ('rgba(232,236,228', 'rgba(230,238,240'), ('#F7DCC6', '#FADBCB'), ('#F2C29E', '#F5C1A6'), ('#EAA578', '#EDA07E'), ('#DD8A55', '#DC7A56'),
          ('#9AA59D', '#98A8AD'), ('#F6F9F5', '#F4F9F9')]
for a_, b_ in COLORS:
    css = css.replace(a_, b_).replace(a_.lower(), b_)
css += '\n' + r('extra.css')

logo = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M50.40,11.56 A27.50,27.50 0 1 1 21.70,6.50" fill="none" stroke="#1F6F78" stroke-width="4.60" stroke-linecap="round"/>'
        '<path d="M27.37,4.21 L22.53,11.77 L18.64,2.13 Z" fill="#1F6F78"/><rect x="27" y="18" width="10" height="28" rx="3.2" fill="#C2502F"/>'
        '<rect x="18" y="27" width="28" height="10" rx="3.2" fill="#C2502F"/><circle cx="32" cy="32" r="2.6" fill="#F4BFA4"/></svg>')
(ROOT / 'cliniloop-logo.svg').write_text(logo.replace('<svg ', '<svg width="512" height="512" role="img" aria-label="CliniLoop" ', 1), encoding='utf-8')
favicon = 'data:image/svg+xml,' + urllib.parse.quote(logo)

head = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CliniLoop — pacientes, colegas e campanhas com IA</title>
<link rel="icon" href="{favicon}">
<meta name="description" content="Para médicos, psiquiatras, dentistas, psicólogos, fisioterapeutas e clínicas: público, posicionamento, conteúdo, campanhas, rede de colegas e rastreador de pacientes, com prompts para o Claude gratuito e as regras do seu conselho.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Sora:wght@600&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
'''
settings = r('settings_part.html')
for a_, b_ in [('PacienteLoop', 'CliniLoop'),
               ('(público, nicho, linha editorial, CRM, ferramentas e ética)', '(público, nicho, pautas, formação, campanhas, ferramentas e verificador ético)'),
               ('sua profissão, regras do conselho, público, personas e tom de voz que você guardou', 'seu consultório, as regras do seu conselho e as decisões que você guardou'),
               ('Objetivo, perfil, decisões guardadas e números da semana ficam no armazenamento deste navegador.', 'Perfil do consultório, rastreador de pacientes, colegas, campanhas, conteúdos e decisões guardadas ficam no armazenamento deste navegador.'),
               ('A chave da API nunca entra no backup.', 'A chave da API nunca entra no backup. O arquivo de backup contém nomes e telefones de pacientes: guarde em local seguro.')]:
    assert a_ in settings, a_
    settings = settings.replace(a_, b_)

body2 = r('body2.html')
for a_, b_ in [('O PacienteLoop monta os prompts, o briefing e o e-book no seu navegador.', 'O CliniLoop monta os prompts, o rastreador, o briefing e o playbook no seu navegador.'),
               ('Em "Comece aqui": objetivo, profissão, especialidade, cidade e sua realidade de tempo. O painel "Hoje" passa a mostrar a próxima ação recomendada.', 'Em "Comece aqui": objetivo, tipo de profissional e perfil do consultório. O painel "Hoje" passa a mostrar a próxima ação recomendada e os próximos passos vencidos.'),
               ('Abra uma ferramenta e clique em "Gerar prompt". Cole no Claude.ai, ajuste na conversa e guarde a versão final no próprio PacienteLoop: ela alimenta as próximas ferramentas.', 'Abra uma ferramenta e clique em "Gerar prompt". Cole no Claude.ai, ajuste na conversa e guarde a versão final no próprio CliniLoop: ela alimenta as próximas ferramentas.'),
               ('<h3>Publique, atenda e meça</h3>', '<h3>Registre, meça e repita</h3>'),
               ('Marque no painel "Hoje" o que publicou e quantos contatos, agendamentos e atendimentos teve. A cada 2 semanas, gere o e-book e ajuste o plano.', 'Cada contato vai para o Rastreador, cada conteúdo para o Diário. Toda semana, o Assistente monta a agenda e o Painel aponta o gargalo. A cada 2 semanas, o playbook revisa o plano.'),
               ('<tr><th>Você preenche campos, guarda decisões, registra números ou gera o briefing e o e-book</th><td>Tudo é processado e guardado neste navegador. O PacienteLoop não tem servidor nem banco de dados para receber essas informações.</td></tr>',
                '<tr><th>Você preenche o perfil, registra pacientes, colegas, campanhas e conteúdos, ou gera o briefing e o playbook</th><td>Tudo é processado e guardado neste navegador. O CliniLoop não tem servidor nem banco de dados para receber essas informações.</td></tr>\n          <tr><th>Você gera um prompt</th><td>O prompt é montado na própria página e nunca inclui nomes ou telefones do Rastreador: no Assistente da semana, os pacientes viram "Contato 1, 2…"; em "Da conversa ao registro", telefones e e-mails são trocados por marcadores.</td></tr>'),
               ('<strong>Dados de pacientes ficam fora daqui</strong>\n        Nome, foto, diagnóstico e qualquer informação de saúde de pacientes são dados pessoais sensíveis pela LGPD. Não cole esses dados nos campos nem nos prompts. Para descrever casos, use padrões gerais ("adultos com dor lombar crônica"), nunca uma pessoa identificável. Os números do painel Hoje são só contagens, sem nomes.',
                '<strong>Dados de pacientes: o mínimo, só aqui e sem dado clínico</strong>\n        O Rastreador guarda nome, telefone, origem, serviço, etapa e consentimento, apenas neste navegador. Diagnóstico, exames e evolução ficam no prontuário, nunca aqui nem nos prompts. Registre o consentimento por finalidade (atendimento, lembretes, conteúdos) e respeite a revogação. Em computador compartilhado, use um perfil de navegador só seu, faça backup e apague os dados ao sair. Uma clínica com recepção e vários usuários precisa de um sistema com servidor e controle de acesso: isso fica para uma versão futura.'),
               ('O PacienteLoop começa no modo gratuito', 'O CliniLoop começa no modo gratuito'),
               ('Cole na caixa de mensagem do Claude e envie. Peça ajustes na mesma conversa ("mais simples", "refaça o item 3"). Quando gostar, cole a versão final em "Guardar a versão final" na ferramenta.', 'Cole na caixa de mensagem do Claude e envie. Peça ajustes na mesma conversa ("mais simples", "refaça o item 3"). Quando gostar, cole a versão final em "Guardar a versão final" na ferramenta.'),
               ('<summary>O PacienteLoop garante mais pacientes ou seguidores? <span class="chevron">▸</span></summary>', '<summary>O CliniLoop garante mais pacientes ou seguidores? <span class="chevron">▸</span></summary>'),
               ('O que o PacienteLoop organiza é o que depende de você: clareza de público e posicionamento, conteúdo constante e útil, perfil pronto para receber visitas, atendimento rápido e acompanhamento dos números.', 'O que o CliniLoop organiza é o que depende de você: clareza de público e posicionamento, conteúdo constante e útil, perfis prontos para receber visitas, rede de colegas, atendimento rápido e acompanhamento de cada contato.'),
               ('Veja os detalhes e as fontes na ferramenta 12 e confirme com o seu conselho.', 'Veja os detalhes e as fontes no Verificador ético (ferramenta 14) e confirme com o seu conselho.'),
               ('<summary>Meus dados ficam salvos em algum servidor? <span class="chevron">▸</span></summary>\n        <div class="faq-body">O PacienteLoop não tem servidor: objetivo, perfil, decisões guardadas e números ficam neste navegador, neste aparelho.', '<summary>Meus dados e os dos meus pacientes ficam em algum servidor? <span class="chevron">▸</span></summary>\n        <div class="faq-body">O CliniLoop não tem servidor: perfil, rastreador de pacientes, colegas, campanhas e decisões guardadas ficam neste navegador, neste aparelho, e os prompts nunca levam nomes ou telefones de pacientes.'),
               ('Defina os fundamentos (ferramentas 1 a 4) e use o Briefing para terceiros (ferramenta 13)', 'Defina o posicionamento (ferramentas 1 a 3) e use o Briefing para terceiros (ferramenta 15)'),
               ('<summary>Por que o PacienteLoop não publica direto no Instagram? <span class="chevron">▸</span></summary>\n        <div class="faq-body">Porque cada publicação em saúde precisa passar pelo seu olhar antes de ir ao ar. O PacienteLoop prepara', '<summary>Por que o CliniLoop não publica direto no Instagram nem manda WhatsApp sozinho? <span class="chevron">▸</span></summary>\n        <div class="faq-body">Porque cada publicação e cada mensagem em saúde precisam passar pelo seu olhar. Integrações com WhatsApp, agenda e conversões offline exigem servidor e estão no plano de uma versão futura. Hoje o CliniLoop prepara'),
               ('ferramentas de público, nicho, linha editorial, CRM e ética.', 'ferramentas de público, nicho, pautas, formação, campanhas e verificador ético.'),
               ('<span>PacienteLoop: roda 100% no navegador, sem backend.', '<span>CliniLoop: roda 100% no navegador, sem backend.')]:
    assert a_ in body2, a_[:70]
    body2 = body2.replace(a_, b_)
body2 = body2.replace('''      <details class="faq">
        <summary>Posso usar com outra IA''', '''      <details class="faq">
        <summary>Qual a relação com o BuscaLoop? <span class="chevron">▸</span></summary>
        <div class="faq-body">O CliniLoop mantém a lógica do BuscaLoop original, feito para a busca de emprego: um perfil base que alimenta todas as ferramentas, um funil por etapa, prompts personalizados e um ritual semanal. Muda o objeto: em vez de vagas, pacientes, colegas e campanhas.</div>
      </details>
      <details class="faq">
        <summary>Posso usar com outra IA''')

html = head + r('head_part.html') + r('config_part.html') + settings + r('tools.html') + body2 + '\n<script>\n' + r('app1.js') + r('app2.js') + r('app3.js') + r('app4.js') + '</script>\n</body>\n</html>\n'
assert 'PacienteLoop' not in html.replace('pacienteloop', ''), [m.start() for m in re.finditer('PacienteLoop', html)][:5]
(ROOT / 'index.html').write_text(html, encoding='utf-8')
print('index.html', len(html), 'bytes')
