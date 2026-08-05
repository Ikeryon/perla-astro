// robots.txt generato in build: il link alla sitemap segue `site` in astro.config.mjs
// (test.laperladeisibillini.it ora, www.laperladeisibillini.it dopo il cutover).
export function GET({ site }) {
  /* gruppo esplicito per lo scraper di Meta: la verifica del dominio in Business Manager
     passa solo se `facebookexternalhit` riesce a leggere la home. E' ridondante rispetto a
     `User-agent: *`, ma toglie ogni ambiguita' ed e' cio' che Meta chiede nei suoi messaggi. */
  const body = `User-agent: *\nAllow: /\n\nUser-agent: facebookexternalhit\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
