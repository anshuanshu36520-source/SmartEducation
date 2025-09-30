// Voice-based navigation between tabs
let navRec; let navActive=false;

function initNavRecognition(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR) return null;
  const r=new SR(); r.lang=getSelectedLanguage(); r.continuous=true; r.interimResults=false;
  r.onresult=(e)=>{
    const t=e.results[e.results.length-1][0].transcript.toLowerCase().trim();
    const mapping={
      'home':'home','hub':'hub','learning hub':'hub','community':'community','dashboard':'dashboard','support':'support',
      'lessons':'hub','chatbot':'support','teacher':'hub','share':'community','live':'hub','library':'hub','forum':'community','admin':'dashboard','notifications':'dashboard','certificate':'dashboard','certificates':'dashboard'
    };
    const key = Object.keys(mapping).find(k=> t.includes(k));
    if(key){
      const tab=mapping[key];
      const btn=[...document.querySelectorAll('.tab')].find(b=>b.dataset.tab===tab);
      if(btn) btn.click();
      speakText('Opening '+tab, getSelectedLanguage());
    }
  };
  r.onerror=()=>stopVoiceNav();
  return r;
}

function startVoiceNav(){ if(navActive) return; navRec=initNavRecognition(); if(!navRec) return; navActive=true; navRec.start(); }
function stopVoiceNav(){ if(!navActive) return; navActive=false; try{ navRec.stop(); }catch{} }

// Start voice nav automatically for demo
setTimeout(()=> startVoiceNav(), 1200);

