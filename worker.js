// Entrada do app como Cloudflare Worker (com arquivos estáticos).
// Toda requisição passa primeiro pelo login (functions/_middleware.js);
// só depois o arquivo pedido é servido a partir dos arquivos publicados (ASSETS).
import { onRequest } from './functions/_middleware.js';

export default {
  fetch(request, env, ctx) {
    return onRequest({
      request,
      env,
      next: () => env.ASSETS.fetch(request),
      waitUntil: (p) => ctx.waitUntil(p)
    });
  }
};
