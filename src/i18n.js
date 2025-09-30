const LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'gu-IN', label: 'Gujarati' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'ml-IN', label: 'Malayalam' },
  { code: 'pa-IN', label: 'Punjabi' }
];

async function loadLanguageOptions() {
  const sel = document.getElementById('languageSelect');
  sel.innerHTML = '';
  LANGUAGES.forEach((l) => {
    const opt = document.createElement('option');
    opt.value = l.code; opt.textContent = l.label; sel.appendChild(opt);
  });
  const saved = localStorage.getItem('lang') || 'en-IN';
  sel.value = saved;
  sel.addEventListener('change', () => localStorage.setItem('lang', sel.value));
}

function getSelectedLanguage() {
  return document.getElementById('languageSelect').value || 'en-IN';
}


