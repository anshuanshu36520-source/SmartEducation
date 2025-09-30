// Local TF-IDF style retriever + extractive answer

function tokenize(text){
  return (text.toLowerCase().match(/[\p{L}']+/gu) || []).filter(w=>w.length>2);
}

function tf(docTokens){
  const f=Object.create(null); for(const w of docTokens) f[w]=(f[w]||0)+1; return f;
}

async function chatbotAnswer(query, lessons){
  const qTokens = tokenize(query);
  if (!qTokens.length || !lessons.length) return 'No cached lessons found.';
  const docs = lessons.map(l=>({ id:l.id, title:l.title, content:l.content, tokens: tokenize(l.content) }));
  const df = Object.create(null);
  for (const d of docs){
    const seen = new Set(d.tokens);
    for (const w of seen) df[w]=(df[w]||0)+1;
  }
  const N = docs.length;
  function score(doc){
    const tfdoc=tf(doc.tokens);
    let s=0;
    for(const w of qTokens){
      const idf = Math.log((N+1)/((df[w]||0)+1))+1;
      s += (tfdoc[w]||0) * idf;
    }
    return s;
  }
  docs.sort((a,b)=>score(b)-score(a));
  const top = docs.slice(0,3);
  // Extractive answer: pick best sentence from top documents
  let bestSent=''; let bestScore=-1;
  for(const d of top){
    const sentences = d.content.split(/(?<=[.!?])\s+/);
    for(const s of sentences){
      const stokens = tokenize(s);
      let sc=0; for(const w of qTokens) sc += stokens.includes(w)?1:0;
      if(sc>bestScore){ bestScore=sc; bestSent=s; }
    }
  }
  return bestScore>0 ? bestSent : `I couldn't find an exact answer. Top topic: ${top[0].title}`;
}


