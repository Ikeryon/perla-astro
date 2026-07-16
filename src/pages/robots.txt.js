// robots.txt generato in build: il link alla sitemap segue `site` in astro.config.mjs
// (test.laperladeisibillini.it ora, www.laperladeisibillini.it dopo il cutover).
export function GET({ site }) {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
