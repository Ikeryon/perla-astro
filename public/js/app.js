// ── MULTILINGUA ──
let currentLang = localStorage.getItem('lang') || 'it';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  // aggiorna tutti gli elementi con data-it / data-en
  document.querySelectorAll('[data-it]').forEach(el => {
    el.textContent = el.getAttribute('data-' + lang);
  });

  // aggiorna lo switch visivo
  document.querySelectorAll('.lang-switch span').forEach(span => {
    span.classList.remove('active');
    if (span.textContent.toLowerCase() === lang) span.classList.add('active');
  });
}

// applica la lingua salvata al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
  setLang(currentLang);
});


// ── SERVICE WORKER (necessario perché il browser offra l'installazione reale) ──
const SW_URL = (() => {
  try {
    return new URL('../sw.js', document.currentScript.src).href;
  } catch (e) {
    return null;
  }
})();

if ('serviceWorker' in navigator && SW_URL) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SW_URL).catch(() => {});
  });
}

// ── INSTALLA COME APP (PWA) ──
let deferredPrompt;

// se è già installata (aperta come app standalone), il banner non serve
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
if (isStandalone) {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.install-banner').forEach(el => el.style.display = 'none');
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
    });
  } else {
    // fallback manuale per iOS (Safari non supporta il prompt automatico)
    alert(
      currentLang === 'it'
        ? 'Per salvare come app: tocca il tasto Condividi (□↑) in basso, poi "Aggiungi a schermata Home".'
        : 'To save as app: tap the Share button (□↑) at the bottom, then "Add to Home Screen".'
    );
  }
}

// ── PROPOSTA SPECIALE (accordion) ──
function toggleProposal(btn) {
  btn.nextElementSibling.classList.toggle('open');
}

// ── CONTATTACI (WhatsApp Tipicità) ──
function contactWhatsApp() {
  const messages = {
    it: 'Ciao Tipicità, vorrei avere maggiori informazioni su "La perla dei Sibillini", puoi aiutarmi?',
    en: "Hi Tipicità, I'd like to know more about Visso, can you help me?"
  };
  const text = encodeURIComponent(messages[currentLang] || messages.it);
  window.open('https://wa.me/390737685623?text=' + text, '_blank');
}