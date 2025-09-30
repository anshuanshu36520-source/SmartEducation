// Simple offline translation table (demo). Extendable per subject.
const TRANSLATE_TABLE = {
  'en-IN:hi-IN': { 'lesson': 'पाठ', 'question': 'प्रश्न', 'answer': 'उत्तर' },
  'hi-IN:en-IN': { 'पाठ': 'lesson', 'प्रश्न': 'question', 'उत्तर': 'answer' }
};

function translateText(text, from, to) {
  if (from===to) return text;
  const key = `${from}:${to}`;
  const table = TRANSLATE_TABLE[key] || {};
  const tokens = text.split(/(\s+)/);
  return tokens.map(t => table[t] || t).join('');
}


