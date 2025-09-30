// Lightweight on-device summarizer & quiz generator (heuristic)

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

async function summarizeText(text) {
  const t = normalizeText(text);
  if (!t) return '';
  const sentences = t.split(/(?<=[.!?])\s+/);
  // Score sentences by TF-IDF-ish weighting
  const words = t.toLowerCase().match(/[\p{L}']+/gu) || [];
  const freq = Object.create(null);
  for (const w of words) freq[w] = (freq[w]||0)+1;
  const top = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0, 12).map(x=>x[0]);
  const scored = sentences.map(s => ({ s, score: top.reduce((acc,w)=> acc + (s.toLowerCase().includes(w)?1:0), 0) + Math.min(3, s.length/120) }));
  const best = scored.sort((a,b)=>b.score-a.score).slice(0, Math.min(3, sentences.length));
  return best.map(x=>x.s).join(' ');
}

function generateQuiz(text) {
  const t = normalizeText(text);
  const sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
  const questions = [];
  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    const s = sentences[i];
    const key = (s.match(/[\p{L}']+/gu) || []).filter(w=>w.length>4)[0] || 'topic';
    const q = `What is mentioned about ${key}?`;
    const correct = s;
    const distractors = sentences.filter(x=>x!==s).slice(0,3);
    const options = shuffle([correct, ...distractors]);
    questions.push({ question: q, options, answerIndex: options.indexOf(correct) });
  }
  return questions;
}

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}


