// Acesso ao app CliniLoop (Cloudflare Pages Functions).
// - Só quem comprou entra: o e-mail da compra recebe um código de 6 dígitos.
// - A Hotmart avisa cada venda, reembolso e chargeback pelo webhook; o acesso é liberado e retirado sozinho.
// - A sessão fica num cookie assinado; a situação do comprador é reconferida uma vez por dia.
//
// Configuração no painel da Cloudflare (Pages > projeto > Settings):
//   KV namespace binding:  ACESSOS
//   Secrets:               SESSION_SECRET, RESEND_API_KEY, HOTMART_HOTTOK
//   Variáveis:             EMAIL_FROM        ex.: "CliniLoop <acesso@cliniloop.com.br>"
//                          APP_PRODUCT_IDS   ids dos produtos da Hotmart que dão acesso ao app, separados por vírgula
//                          ACCESS_DAYS       dias de acesso após a compra (0 = sem prazo)
//                          ADMIN_EMAILS      e-mails que sempre entram (para testes), separados por vírgula
//                          DEV_ECHO_CODE     "1" só em teste local: devolve o código na resposta, sem enviar e-mail

const PUBLICO = [/^\/auth\//, /^\/hotmart\//, /^\/icons\//, /^\/manifest\.webmanifest$/, /^\/cliniloop-[\w-]+\.svg$/, /^\/favicon\.ico$/];
const SESSAO_DIAS = 60;
const RECHECAGEM_MS = 24 * 3600 * 1000;
const CONCEDE = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE'];
const REVOGA = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_CANCELED', 'PURCHASE_PROTEST'];

const enc = new TextEncoder();
const normEmail = (e) => String(e || '').trim().toLowerCase();
const lista = (v) => String(v || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
const json = (obj, status = 200, extra = {}) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function sha(data) {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(data));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/=+$/, '');
const unb64 = (s) => decodeURIComponent(escape(atob(s)));

async function criaSessao(env, email) {
  const payload = b64(JSON.stringify({ e: email, x: Date.now() + SESSAO_DIAS * 864e5, c: Date.now() }));
  return `${payload}.${await hmac(env.SESSION_SECRET, payload)}`;
}
async function leSessao(env, cookieHeader) {
  const m = /(?:^|;\s*)cl_sessao=([^;]+)/.exec(cookieHeader || '');
  if (!m) return null;
  const [payload, sig] = m[1].split('.');
  if (!payload || !sig || sig !== await hmac(env.SESSION_SECRET, payload)) return null;
  try {
    const s = JSON.parse(unb64(payload));
    return s.x > Date.now() ? s : null;
  } catch (e) { return null; }
}
const cookie = (valor, maxAge) => `cl_sessao=${valor}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

async function temAcesso(env, email) {
  if (lista(env.ADMIN_EMAILS).includes(email)) return true;
  const r = await env.ACESSOS.get('c:' + email, 'json');
  if (!r || r.status !== 'ativo') return false;
  return !r.ate || r.ate > Date.now();
}

async function enviaCodigo(env, email, codigo) {
  if (env.DEV_ECHO_CODE === '1') return true;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.EMAIL_FROM, to: [email], subject: `Seu código de acesso ao CliniLoop: ${codigo}`,
      text: `Seu código de acesso ao CliniLoop é ${codigo}.\n\nEle vale por 10 minutos. Se você não pediu este código, ignore este e-mail.`,
      html: `<div style="font-family:Arial,sans-serif;color:#14303A;max-width:480px"><p>Seu código de acesso ao <b>CliniLoop</b>:</p><p style="font-size:30px;font-weight:700;letter-spacing:6px;margin:12px 0">${codigo}</p><p>Ele vale por 10 minutos. Se você não pediu este código, ignore este e-mail.</p></div>`
    })
  });
  return r.ok;
}

// ---------- rotas de login ----------
async function pedirCodigo(request, env) {
  const { email: bruto } = await request.json().catch(() => ({}));
  const email = normEmail(bruto);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, msg: 'Digite um e-mail válido.' }, 400);
  const generico = { ok: true, msg: 'Se houver uma compra com este e-mail, o código chega em instantes. Confira também a caixa de spam.' };
  if (!(await temAcesso(env, email))) return json(generico);
  const rlKey = 'rl:' + email;
  const n = parseInt(await env.ACESSOS.get(rlKey) || '0', 10);
  if (n >= 5) return json({ ok: false, msg: 'Muitos pedidos de código. Espere uma hora e tente de novo.' }, 429);
  await env.ACESSOS.put(rlKey, String(n + 1), { expirationTtl: 3600 });
  const codigo = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
  await env.ACESSOS.put('code:' + email, JSON.stringify({ h: await sha(email + ':' + codigo), t: 0 }), { expirationTtl: 600 });
  const ok = await enviaCodigo(env, email, codigo);
  if (!ok) return json({ ok: false, msg: 'Não consegui enviar o e-mail agora. Tente de novo em alguns minutos.' }, 502);
  return json(env.DEV_ECHO_CODE === '1' ? { ...generico, dev_codigo: codigo } : generico);
}

async function entrar(request, env) {
  const { email: bruto, codigo } = await request.json().catch(() => ({}));
  const email = normEmail(bruto);
  const k = 'code:' + email;
  const reg = await env.ACESSOS.get(k, 'json');
  if (!reg) return json({ ok: false, msg: 'Código vencido. Peça um novo.' }, 400);
  if (reg.h !== await sha(email + ':' + String(codigo || '').trim())) {
    reg.t += 1;
    if (reg.t >= 5) await env.ACESSOS.delete(k); else await env.ACESSOS.put(k, JSON.stringify(reg), { expirationTtl: 600 });
    return json({ ok: false, msg: reg.t >= 5 ? 'Código errado várias vezes. Peça um novo.' : 'Código incorreto. Confira e tente de novo.' }, 400);
  }
  await env.ACESSOS.delete(k);
  if (!(await temAcesso(env, email))) return json({ ok: false, msg: 'Este e-mail não tem acesso ativo ao app.' }, 403);
  return json({ ok: true }, 200, { 'set-cookie': cookie(await criaSessao(env, email), SESSAO_DIAS * 86400) });
}

// ---------- webhook da Hotmart ----------
async function hotmart(request, env) {
  const body = await request.json().catch(() => null);
  const tok = request.headers.get('x-hotmart-hottok') || (body && body.hottok);
  if (!env.HOTMART_HOTTOK || tok !== env.HOTMART_HOTTOK) return json({ ok: false }, 401);
  const ev = body && body.event;
  const d = (body && body.data) || {};
  const email = normEmail(d.buyer && d.buyer.email);
  const produto = String((d.product && d.product.id) || '');
  if (!email || !ev) return json({ ok: true, ignorado: 'sem e-mail ou evento' });
  const ids = lista(env.APP_PRODUCT_IDS);
  if (ids.length && !ids.includes(produto.toLowerCase())) return json({ ok: true, ignorado: 'produto sem app' });
  const k = 'c:' + email;
  const atual = (await env.ACESSOS.get(k, 'json')) || {};
  const agora = Date.now();
  if (CONCEDE.includes(ev)) {
    const dias = parseInt(env.ACCESS_DAYS || '0', 10);
    await env.ACESSOS.put(k, JSON.stringify({ ...atual, status: 'ativo', produto, transacao: d.purchase && d.purchase.transaction, desde: atual.desde || agora, ate: dias > 0 ? agora + dias * 864e5 : null, ev, em: agora }));
  } else if (REVOGA.includes(ev)) {
    await env.ACESSOS.put(k, JSON.stringify({ ...atual, status: 'revogado', ev, em: agora }));
  } else {
    return json({ ok: true, ignorado: ev });
  }
  return json({ ok: true });
}

// ---------- página de login ----------
function paginaLogin() {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Entrar · CliniLoop</title><link rel="icon" href="/icons/icon-192.png"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#14303A;font-family:Poppins,Arial,sans-serif;color:#F4F2EC;padding:24px}
.card{width:100%;max-width:420px;background:#0F2830;border:1px solid rgba(244,191,164,.3);border-radius:16px;padding:32px 28px}
.logo{display:block;margin-bottom:22px;max-width:100%;height:auto}
h1{font-size:1.25rem;margin:0 0 6px}p{color:#B9CDD1;font-size:.92rem;line-height:1.5;margin:0 0 18px}
label{display:block;font-size:.8rem;font-weight:600;margin:0 0 6px;color:#F4BFA4;letter-spacing:.04em}
input{width:100%;font:inherit;font-size:1rem;padding:12px 14px;border-radius:10px;border:1px solid #3D5F68;background:#14303A;color:#fff;margin-bottom:14px}
input:focus{outline:2px solid #4CC9C6;border-color:transparent}
button{width:100%;font:inherit;font-weight:600;font-size:1rem;padding:12px;border:0;border-radius:10px;background:#C2502F;color:#fff;cursor:pointer}
button[disabled]{opacity:.6;cursor:wait}.msg{min-height:1.4em;font-size:.86rem;margin-top:12px;color:#F4BFA4}.msg.ok{color:#9FE0DC}
.link{background:none;color:#B9CDD1;text-decoration:underline;font-weight:400;font-size:.85rem;padding:8px 0 0}
.hidden{display:none}small{display:block;color:#7FA0A8;font-size:.76rem;margin-top:18px;line-height:1.45}
</style></head><body><main class="card">
<img class="logo" src="/cliniloop-wordmark-escuro.svg" alt="CliniLoop" width="190">
<section id="p1"><h1>Entre no CliniLoop</h1><p>Digite o e-mail que você usou na compra. Enviamos um código de 6 dígitos para ele.</p>
<form id="f1"><label for="email">E-mail da compra</label><input id="email" type="email" autocomplete="email" required placeholder="voce@exemplo.com.br"><button id="b1">Receber código</button></form></section>
<section id="p2" class="hidden"><h1>Digite o código</h1><p id="p2t">Enviamos o código para o seu e-mail. Ele vale por 10 minutos.</p>
<form id="f2"><label for="codigo">Código de 6 dígitos</label><input id="codigo" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required placeholder="000000"><button id="b2">Entrar</button></form>
<button class="link" id="volta" type="button">Usar outro e-mail ou pedir novo código</button></section>
<div class="msg" id="msg" role="status" aria-live="polite"></div>
<small>Não recebeu? Confira a caixa de spam e se é o e-mail usado na Hotmart. Ajuda: atendimento@loopuniversity.com.br</small>
</main><script>
const $=(i)=>document.getElementById(i),msg=$('msg');
async function post(u,d){const r=await fetch(u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)});return r.json().catch(()=>({ok:false,msg:'Erro inesperado.'}));}
$('f1').addEventListener('submit',async(e)=>{e.preventDefault();$('b1').disabled=true;msg.className='msg';msg.textContent='Enviando…';
const r=await post('/auth/codigo',{email:$('email').value});$('b1').disabled=false;msg.textContent=r.msg||'';
if(r.ok){msg.className='msg ok';$('p1').classList.add('hidden');$('p2').classList.remove('hidden');$('codigo').focus();if(r.dev_codigo)$('codigo').value=r.dev_codigo;}});
$('f2').addEventListener('submit',async(e)=>{e.preventDefault();$('b2').disabled=true;msg.className='msg';msg.textContent='Conferindo…';
const r=await post('/auth/entrar',{email:$('email').value,codigo:$('codigo').value});$('b2').disabled=false;
if(r.ok){msg.className='msg ok';msg.textContent='Tudo certo. Abrindo o app…';location.replace(location.pathname==='/auth/login'?'/':location.href);}else msg.textContent=r.msg||'Não foi possível entrar.';});
$('volta').addEventListener('click',()=>{$('p2').classList.add('hidden');$('p1').classList.remove('hidden');msg.textContent='';$('codigo').value='';});
</script></body></html>`;
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const p = url.pathname;
  // Publicado antes de configurar o banco de acessos e a chave de sessão: avisa em vez de quebrar
  if (!env.ACESSOS || !env.SESSION_SECRET) {
    return new Response('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CliniLoop</title></head><body style="font-family:Arial,sans-serif;background:#14303A;color:#F4F2EC;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px"><div style="max-width:420px"><h1 style="font-size:1.3rem">CliniLoop em configuração</h1><p>O app está publicado, mas o acesso ainda não foi ligado. Falta configurar: ' + [!env.ACESSOS && 'o banco de acessos (ACESSOS)', !env.SESSION_SECRET && 'a chave de sessão (SESSION_SECRET)'].filter(Boolean).join(' e ') + '.</p></div></body></html>', { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  }
  if (p === '/auth/codigo' && request.method === 'POST') return pedirCodigo(request, env);
  if (p === '/auth/entrar' && request.method === 'POST') return entrar(request, env);
  if (p === '/auth/sair') return new Response(null, { status: 302, headers: { location: '/', 'set-cookie': cookie('', 0) } });
  if (p === '/hotmart/webhook' && request.method === 'POST') return hotmart(request, env);
  if (p === '/auth/login') return new Response(paginaLogin(), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  if (PUBLICO.some((re) => re.test(p))) return next();

  const s = await leSessao(env, request.headers.get('cookie'));
  if (!s) {
    // 401 para o service worker do app não guardar a tela de login no lugar do app
    return new Response(paginaLogin(), { status: 401, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  }
  // Reconfere a compra uma vez por dia (pega reembolso e prazo vencido)
  if (Date.now() - (s.c || 0) > RECHECAGEM_MS) {
    if (!(await temAcesso(env, s.e))) {
      return new Response(paginaLogin(), { status: 401, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'set-cookie': cookie('', 0) } });
    }
    const res = await next();
    const r2 = new Response(res.body, res);
    r2.headers.append('set-cookie', cookie(await criaSessao(env, s.e), SESSAO_DIAS * 86400));
    return r2;
  }
  return next();
}
