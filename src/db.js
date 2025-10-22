const DB_NAME = 'smartedu-db';
const DB_VER = 2;
let db;

async function dbInit() {
  db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('lessons')){
        const lessons = d.createObjectStore('lessons', { keyPath: 'id', autoIncrement: true });
        lessons.createIndex('title', 'title', { unique: false });
        lessons.createIndex('content', 'content', { unique: false });
      }
      if (!d.objectStoreNames.contains('profile')){
        d.createObjectStore('profile', { keyPath: 'key' });
      }
      if (!d.objectStoreNames.contains('resources')){
        const res = d.createObjectStore('resources', { keyPath: 'id', autoIncrement: true });
        res.createIndex('title', 'title', { unique: false });
      }
      if (!d.objectStoreNames.contains('forum')){
        const forum = d.createObjectStore('forum', { keyPath: 'id', autoIncrement: true });
        forum.createIndex('title', 'title', { unique: false });
      }
      if (!d.objectStoreNames.contains('users')){
        d.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
      }
      if (!d.objectStoreNames.contains('notifications')){
        d.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  // init profile
  const tx = db.transaction('profile', 'readwrite');
  const store = tx.objectStore('profile');
  const get = await store.get('me');
  if (!get) {
    await new Promise((res, rej) => {
      const r = store.put({ key: 'me', xp: 0, badges: [] });
      r.onsuccess = res; r.onerror = rej;
    });
  }
  await tx.complete;
  try { await mongoMirrorSnapshot(); } catch {}
}

function dbSaveLesson(lesson) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('lessons', 'readwrite');
    tx.objectStore('lessons').add(lesson).onsuccess = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function dbDeleteLesson(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('lessons', 'readwrite');
    tx.objectStore('lessons').delete(id).onsuccess = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function dbGetLessons(query = '', disease) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('lessons');
    const store = tx.objectStore('lessons');
    const req = store.getAll();
    req.onsuccess = () => {
      const items = (req.result || []).sort((a, b) => (b.createdAt||0) - (a.createdAt||0));
      const diseaseFiltered = (disease && disease !== 'all') ? items.filter((x)=> (x.disease||'general') === disease) : items;
      if (!query) return resolve(diseaseFiltered);
      const q = query.toLowerCase();
      resolve(diseaseFiltered.filter((x) => x.title.toLowerCase().includes(q) || x.content.toLowerCase().includes(q)));
    };
    req.onerror = () => reject(req.error);
  });
}

function dbGetProfile() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('profile');
    const req = tx.objectStore('profile').get('me');
    req.onsuccess = () => resolve(req.result || { xp: 0, badges: [] });
    req.onerror = () => reject(req.error);
  });
}

async function awardXp(amount) {
  const cur = await dbGetProfile();
  cur.xp = (cur.xp || 0) + amount;
  const newBadges = [];
  if (cur.xp >= 10) newBadges.push('Learner');
  if (cur.xp >= 50) newBadges.push('Achiever');
  if (cur.xp >= 100) newBadges.push('Champion');
  cur.badges = Array.from(new Set([...(cur.badges||[]), ...newBadges]));
  await new Promise((res, rej) => {
    const tx = db.transaction('profile', 'readwrite');
    const r = tx.objectStore('profile').put({ key: 'me', xp: cur.xp, badges: cur.badges });
    r.onsuccess = res; r.onerror = rej;
  });
}

async function exportAllData() {
  const lessons = await dbGetLessons();
  const profile = await dbGetProfile();
  const resources = await dbGetResources();
  const forum = await dbGetThreads();
  const users = await dbGetUsers();
  const notifications = await dbGetNotifications();
  const data = { lessons, profile, resources, forum, users, notifications, exportedAt: Date.now() };
  return new Blob([JSON.stringify(data)], { type: 'application/json' });
}

async function importAllData(json) {
  const tx = db.transaction(['lessons', 'profile','resources','forum','users','notifications'], 'readwrite');
  const lessons = tx.objectStore('lessons');
  const profile = tx.objectStore('profile');
  const resources = tx.objectStore('resources');
  const forum = tx.objectStore('forum');
  const users = tx.objectStore('users');
  const notifications = tx.objectStore('notifications');
  await new Promise((res, rej) => { lessons.clear().onsuccess = res; lessons.clear().onerror = rej; });
  await new Promise((res, rej) => { profile.clear().onsuccess = res; profile.clear().onerror = rej; });
  await new Promise((res, rej) => { resources.clear().onsuccess = res; resources.clear().onerror = rej; });
  await new Promise((res, rej) => { forum.clear().onsuccess = res; forum.clear().onerror = rej; });
  await new Promise((res, rej) => { users.clear().onsuccess = res; users.clear().onerror = rej; });
  await new Promise((res, rej) => { notifications.clear().onsuccess = res; notifications.clear().onerror = rej; });
  for (const l of json.lessons || []) { await new Promise((res, rej) => { const r=lessons.add(l); r.onsuccess=res; r.onerror=rej; }); }
  await new Promise((res, rej) => { const r=profile.put({ key: 'me', ...(json.profile||{ xp:0, badges:[] }) }); r.onsuccess=res; r.onerror=rej; });
  for (const r of json.resources || []) { await new Promise((res, rej) => { const x=resources.add(r); x.onsuccess=res; x.onerror=rej; }); }
  for (const t of json.forum || []) { await new Promise((res, rej) => { const x=forum.add(t); x.onsuccess=res; x.onerror=rej; }); }
  for (const u of json.users || []) { await new Promise((res, rej) => { const x=users.add(u); x.onsuccess=res; x.onerror=rej; }); }
  for (const n of json.notifications || []) { await new Promise((res, rej) => { const x=notifications.add(n); x.onsuccess=res; x.onerror=rej; }); }
}

// --- Mock MongoDB sync layer (simulation via localStorage) ---
async function mongoMirrorSnapshot(){
  const snapshot = {
    lessons: await dbGetLessons(),
    profile: await dbGetProfile(),
    resources: await dbGetResources(),
    forum: await dbGetThreads(),
    users: await dbGetUsers(),
    notifications: await dbGetNotifications()
  };
  localStorage.setItem('mongoMirror', JSON.stringify(snapshot));
}

async function mongoApplyFromMirror(){
  const raw = localStorage.getItem('mongoMirror'); if(!raw) return;
  const data = JSON.parse(raw);
  await importAllData(data);
}

// Resources API
function dbAddResource(item){ return new Promise((res,rej)=>{ const tx=db.transaction('resources','readwrite'); tx.objectStore('resources').add(item).onsuccess=()=>res(); tx.onerror=()=>rej(tx.error); }); }
function dbDeleteResource(id){ return new Promise((res,rej)=>{ const tx=db.transaction('resources','readwrite'); tx.objectStore('resources').delete(id).onsuccess=()=>res(); tx.onerror=()=>rej(tx.error); }); }
function dbGetResources(disease){ return new Promise((res,rej)=>{ const tx=db.transaction('resources'); const r=tx.objectStore('resources').getAll(); r.onsuccess=()=>{ const items=r.result||[]; res((disease&&disease!=='all')?items.filter(x=>(x.disease||'general')===disease):items); }; r.onerror=()=>rej(r.error); }); }

// Forum API
function dbAddThread(item){ return new Promise((res,rej)=>{ const tx=db.transaction('forum','readwrite'); tx.objectStore('forum').add(item).onsuccess=()=>res(); tx.onerror=()=>rej(tx.error); }); }
function dbDeleteThread(id){ return new Promise((res,rej)=>{ const tx=db.transaction('forum','readwrite'); tx.objectStore('forum').delete(id).onsuccess=()=>res(); tx.onerror=()=>rej(tx.error); }); }
function dbGetThreads(disease){ return new Promise((res,rej)=>{ const tx=db.transaction('forum'); const r=tx.objectStore('forum').getAll(); r.onsuccess=()=>{ const items=r.result||[]; res((disease&&disease!=='all')?items.filter(x=>(x.disease||'general')===disease):items); }; r.onerror=()=>rej(r.error); }); }

// Users API
function dbAddUser(item){ return new Promise((res,rej)=>{ const tx=db.transaction('users','readwrite'); tx.objectStore('users').add(item).onsuccess=()=>res(); tx.onerror=()=>rej(tx.error); }); }
function dbDeleteUser(id){ return new Promise((res,rej)=>{ const tx=db.transaction('users','readwrite'); tx.objectStore('users').delete(id).onsuccess=()=>res(); tx.onerror=()=>rej(tx.error); }); }
function dbGetUsers(){ return new Promise((res,rej)=>{ const tx=db.transaction('users'); const r=tx.objectStore('users').getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error); }); }

// Notifications API
function dbAddNotification(item){ return new Promise((res,rej)=>{ const tx=db.transaction('notifications','readwrite'); tx.objectStore('notifications').add(item).onsuccess=()=>res(); tx.onerror=()=>rej(tx.error); }); }
function dbGetNotifications(){ return new Promise((res,rej)=>{ const tx=db.transaction('notifications'); const r=tx.objectStore('notifications').getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error); }); }
function dbMarkNotification(id,read){ return new Promise((res,rej)=>{ const tx=db.transaction('notifications','readwrite'); const st=tx.objectStore('notifications'); const g=st.get(id); g.onsuccess=()=>{ const it=g.result; if(!it) return res(); it.read=!!read; st.put(it).onsuccess=()=>res(); }; g.onerror=()=>rej(g.error); }); }

