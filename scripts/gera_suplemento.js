// Gera docs/SUPLEMENTO_EDICAO_2.md a partir dos dados do app (src/suplemento_data.js) e dos textos fixos abaixo.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'src/suplemento_data.js'), 'utf8') + '\nmodule.exports={PLANO30,MARCOS,EXEMPLOS_LIVRO};';
const m = { exports: {} };
new Function('module', 'exports', src)(m, m.exports);
const { PLANO30, MARCOS, EXEMPLOS_LIVRO } = m.exports;
const livro = fs.readFileSync(path.join(ROOT, 'src/livro_data.js'), 'utf8');
const titulos = {};
for (const x of livro.matchAll(/id: '([a-z]+)', titulo: '([^']+)', etapa: '([^']+)', parte: (\d+)/g)) titulos[x[1]] = { t: x[2], e: x[3], p: x[4] };
const TOOLS = { config: 'Comece aqui', etica: 'Verificador ético', publico: 'Público, ICP e persona', nicho: 'Nicho e diferencial', perfil: 'Perfis e presença', pautas: 'Pautas e palavras-chave', roteiro: 'Roteiros e copy', reaproveitamento: 'Reaproveitamento de conteúdo', atendimento: 'Atendimento e agendamento', rastreador: 'Rastreador de pacientes', colegas: 'Rede de colegas', painel: 'Painel e diagnóstico', assistente: 'Assistente da semana', ebook: 'Playbook da clínica' };

let o = `# Suplemento para a 2ª edição: plano de 30 dias, exemplos preenchidos e marcos

**Guia digital _Prompt do Sim · Saúde_ + CliniLoop.** Proposta de texto para a próxima edição do e-book. Gerado em outubro de 2026.

> Estado real: o guia ainda não foi testado com profissionais nem revisado por advogado. Todos os exemplos usam uma personagem fictícia (Dra. Bia Nunes, nutricionista esportiva, Pinheiros) e não representam casos reais. Os marcos são metas de planejamento, não médias de mercado.

## Como encaixar no livro

| Peça | Onde entra | Por quê |
|---|---|---|
| Plano de 30 dias | Logo depois da Apresentação, antes da Parte 1 | Dá ao leitor uma ordem única para a primeira semana |
| Exemplo preenchido | Abaixo de cada "Prompt do Sim" da Parte 13 (e, resumido, nas partes 3 a 11) | Mostra o que a IA devolve e o que revisar |
| Marcos de referência | Final da Parte 11 (CRM) e na Parte 14 | Dá ao leitor um ponto de comparação consigo mesmo |
| Dados de mercado | Anexo, com as fontes | Separa o que é fato verificado do que é estimativa |

## 1. Plano de 30 dias

Uma ação de 20 a 30 minutos por dia útil, em quatro semanas. Cada dia termina em uma entrega que você consegue conferir. Se perder um dia, siga do próximo.

`;
for (const s of PLANO30) {
  o += `### Semana ${s.sem}: ${s.tema} (partes ${s.parte} do livro)\n\n| Dia | Ação | Ferramenta | Entrega | Tempo |\n|---|---|---|---|---|\n`;
  for (const d of s.dias) o += `| ${d.d} | **${d.titulo}.** ${d.acao} | ${TOOLS[d.tool] || d.tool} | ${d.entrega} | ${d.min} min |\n`;
  o += '\n';
}
o += `## 2. Marcos de referência

Não encontramos referência pública e confiável de volume de pacientes por canal para consultórios brasileiros (veja a seção 4). Por isso, os marcos abaixo medem **processo** e comparam você com a sua própria linha de base.

`;
for (const f of MARCOS) o += `**${f.fase}**\n\n${f.itens.map((i) => '- ' + i).join('\n')}\n\n`;
o += `**Fórmulas**

- Taxa de agendamento = agendados ÷ contatos novos.
- Taxa de comparecimento = atendidos ÷ agendados.
- Taxa de faltas = faltas sem aviso ÷ agendados.
- Colega ativo = indicou pelo menos um paciente nos últimos 90 dias.
- Regra de uso: meça por 4 semanas, escolha **uma** taxa para melhorar e mude **uma** coisa por vez.

## 3. Os 12 prompts com exemplo preenchido

Personagem fictícia: Dra. Bia Nunes, nutricionista esportiva, Pinheiros (São Paulo), CRN-3 00000 (inventado). A saída é um **trecho** do que uma IA pode devolver; o resultado real varia. Revise tudo antes de usar.

`;
let i = 1;
for (const id of Object.keys(EXEMPLOS_LIVRO)) {
  const t = titulos[id] || { t: id, e: '', p: '' }, e = EXEMPLOS_LIVRO[id];
  o += `### 3.${i++} ${t.t} (Parte ${t.p})\n\n**O que foi colocado:** ${e.entrada}\n\n**O que a IA devolveu (trecho):**\n\n\`\`\`text\n${e.saida}\n\`\`\`\n\n**Antes de usar:**\n\n${e.revisar.map((x) => '- ' + x).join('\n')}\n\n`;
}
o += fs.readFileSync(path.join(ROOT, 'scripts/_mercado.md'), 'utf8');
fs.writeFileSync(path.join(ROOT, 'docs/SUPLEMENTO_EDICAO_2.md'), o);
console.log('ok', o.length);
