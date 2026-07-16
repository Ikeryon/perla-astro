// Iscrizione newsletter Tipicità — Vercel Serverless Function.
// Aggiunge il contatto alla lista d'ingresso NL_ALL_LIMBO (#209) su Brevo con
// l'attributo LINGUA (ITA/ENG): da lì parte lo scenario di double opt-in
// "NL_Invio conferma". La chiave API vive solo nelle env di Vercel (BREVO_API_KEY).

const ENTRY_LIST_ID = 209; // NL_ALL_LIMBO

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { email, lang, website } = req.body || {};

  // honeypot anti-bot: campo invisibile, se è compilato è spam
  if (website) return res.status(200).json({ ok: true });

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }
  if (!process.env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY mancante nelle env');
    return res.status(500).json({ error: 'not_configured' });
  }

  const LINGUA = lang === 'en' ? 'ENG' : 'ITA';

  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      attributes: { LINGUA },
      listIds: [ENTRY_LIST_ID],
      updateEnabled: true, // se il contatto esiste già, lo aggiorna e lo aggiunge alla lista
    }),
  });

  // 201 = creato, 204 = aggiornato
  if (r.ok || r.status === 204) {
    return res.status(200).json({ ok: true });
  }

  const detail = await r.text().catch(() => '');
  console.error('Errore Brevo', r.status, detail);
  return res.status(502).json({ error: 'brevo_error' });
}
