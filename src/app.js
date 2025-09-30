// Tabs and install prompt
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('installBtn');
  installBtn.hidden = false;
  installBtn.onclick = async () => {
    installBtn.hidden = true;
    await deferredPrompt.prompt();
    deferredPrompt = null;
  };
});

document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'dashboard') { try { renderDashboards(); } catch {} }
  });
});

// Service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

// App init
(async function init() {
  await dbInit();
  await loadLanguageOptions();
  await refreshLessons();
  await refreshManageList();
  await updateProfile();
  if (document.getElementById('dashboard')) { try { await renderDashboards(); } catch {} }
})();

// Lessons save/search
document.getElementById('saveNoteBtn').addEventListener('click', async () => {
  const content = document.getElementById('noteInput').value.trim();
  if (!content) return;
  const title = content.split('\n')[0].slice(0, 40) || 'Untitled';
  await dbSaveLesson({ title, content, language: getSelectedLanguage(), createdAt: Date.now() });
  await awardXp(5);
  document.getElementById('noteInput').value = '';
  await refreshLessons();
  await refreshManageList();
  await updateProfile();
});

document.getElementById('searchInput').addEventListener('input', async (e) => {
  await refreshLessons(e.target.value);
});

async function refreshLessons(query = '') {
  const list = document.getElementById('lessonsList');
  list.innerHTML = '';
  const lessons = await dbGetLessons(query);
  lessons.forEach((l) => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.textContent = l.title;
    const right = document.createElement('div');
    const speakBtn = document.createElement('button');
    speakBtn.textContent = '🔊';
    speakBtn.onclick = () => speakText(l.content, l.language);
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.onclick = async () => { await dbDeleteLesson(l.id); await refreshLessons(); await refreshManageList(); };
    right.appendChild(speakBtn);
    right.appendChild(delBtn);
    li.appendChild(left);
    li.appendChild(right);
    list.appendChild(li);
  });
}

// Teacher upload
document.getElementById('uploadBtn').addEventListener('click', async () => {
  const title = document.getElementById('lessonTitle').value.trim();
  const content = document.getElementById('lessonContent').value.trim();
  if (!title || !content) return;
  await dbSaveLesson({ title, content, language: getSelectedLanguage(), createdAt: Date.now() });
  document.getElementById('lessonTitle').value = '';
  document.getElementById('lessonContent').value = '';
  await awardXp(10);
  await refreshLessons();
  await refreshManageList();
  await updateProfile();
});

document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const title = file.name.replace(/\.[^/.]+$/, '');
  await dbSaveLesson({ title, content: text, language: getSelectedLanguage(), createdAt: Date.now() });
  await awardXp(8);
  await refreshLessons();
  await refreshManageList();
  await updateProfile();
});

async function refreshManageList() {
  const list = document.getElementById('manageList');
  list.innerHTML = '';
  const lessons = await dbGetLessons();
  lessons.forEach((l) => {
    const li = document.createElement('li');
    li.textContent = l.title;
    const btns = document.createElement('div');
    const sumBtn = document.createElement('button');
    sumBtn.textContent = 'Summary';
    sumBtn.onclick = async () => { document.getElementById('summaryBox').textContent = await summarizeText(l.content); await awardXp(2); await updateProfile(); };
    const quizBtn = document.createElement('button');
    quizBtn.textContent = 'Quiz';
    quizBtn.onclick = async () => { document.getElementById('quizBox').innerHTML = renderQuiz(generateQuiz(l.content)); await awardXp(2); await updateProfile(); };
    btns.appendChild(sumBtn);
    btns.appendChild(quizBtn);
    li.appendChild(btns);
    list.appendChild(li);
  });
}

// Summarize/Quiz from editor
document.getElementById('summarizeBtn').addEventListener('click', async () => {
  const text = document.getElementById('noteInput').value.trim();
  if (!text) return;
  document.getElementById('summaryBox').textContent = await summarizeText(text);
  await awardXp(1); await updateProfile();
});

document.getElementById('quizBtn').addEventListener('click', async () => {
  const text = document.getElementById('noteInput').value.trim();
  if (!text) return;
  document.getElementById('quizBox').innerHTML = renderQuiz(generateQuiz(text));
  await awardXp(1); await updateProfile();
});

function renderQuiz(questions) {
  return questions.map((q, i) => {
    const options = q.options.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join('<br>');
    return `<div class="q"><div><b>${i+1}. ${q.question}</b></div>${options}</div>`;
  }).join('<hr>');
}

// Chatbot
document.getElementById('chatSendBtn').addEventListener('click', async () => {
  const input = document.getElementById('chatInput');
  const query = input.value.trim();
  if (!query) return;
  input.value = '';
  appendChat('you', query);
  const lessons = await dbGetLessons();
  const answer = await chatbotAnswer(query, lessons);
  appendChat('bot', answer);
  await awardXp(1); await updateProfile();
});

function appendChat(who, text) {
  const box = document.getElementById('chatBox');
  const div = document.createElement('div');
  div.className = who === 'you' ? 'you' : 'bot';
  div.textContent = (who === 'bot' ? '🤖 ' : '🧑 ') + text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// Voice controls
document.getElementById('ttsBtn').addEventListener('click', async () => {
  const text = document.getElementById('noteInput').value.trim();
  if (text) speakText(text, getSelectedLanguage());
});

document.getElementById('startRecBtn').addEventListener('click', startRecognition);
document.getElementById('stopRecBtn').addEventListener('click', stopRecognition);

// P2P Share
document.getElementById('hostBtn').addEventListener('click', () => startHost());
document.getElementById('joinBtn').addEventListener('click', () => startJoin());
document.getElementById('copyOfferBtn').addEventListener('click', () => {
  const ta = document.getElementById('signalOut'); ta.select(); document.execCommand('copy');
});
document.getElementById('connectBtn').addEventListener('click', () => completeSignal(document.getElementById('signalIn').value));

// Export/Import
document.getElementById('exportBtn').addEventListener('click', async () => {
  const blob = await exportAllData();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'smartedu-export.json'; a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0]; if (!file) return;
  const text = await file.text();
  await importAllData(JSON.parse(text));
  await refreshLessons(); await refreshManageList(); await updateProfile();
});

async function updateProfile() {
  const { xp, badges } = await dbGetProfile();
  document.getElementById('xpCount').textContent = xp.toString();
  document.getElementById('badgesList').textContent = badges.length ? badges.join(', ') : '-';
}

