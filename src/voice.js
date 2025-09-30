let recognition;
let recognizing = false;

function speakText(text, lang) {
  if (!('speechSynthesis' in window)) return alert('TTS not supported');
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang || 'en-IN';
  utter.rate = 1;
  speechSynthesis.speak(utter);
}

function initRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = getSelectedLanguage();
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = (e) => {
    let finalText = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += transcript + ' ';
    }
    if (finalText) {
      const ta = document.getElementById('noteInput');
      ta.value = (ta.value + ' ' + finalText).trim();
    }
  };
  rec.onerror = () => stopRecognition();
  return rec;
}

function startRecognition() {
  if (recognizing) return;
  recognition = initRecognition();
  if (!recognition) return alert('STT not supported on this device');
  recognizing = true;
  document.getElementById('startRecBtn').disabled = true;
  document.getElementById('stopRecBtn').disabled = false;
  recognition.start();
}

function stopRecognition() {
  if (!recognizing) return;
  recognizing = false;
  document.getElementById('startRecBtn').disabled = false;
  document.getElementById('stopRecBtn').disabled = true;
  try { recognition.stop(); } catch {}
}


