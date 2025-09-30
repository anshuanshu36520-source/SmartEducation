document.getElementById('notifPerm').addEventListener('click', async ()=>{
  if (!('Notification' in window)) return alert('Notifications not supported');
  const p = await Notification.requestPermission();
  if (p==='granted') new Notification('SmartEdu', { body: 'Notifications enabled' });
});

async function renderNotifications(){
  const list=document.getElementById('notifList'); if(!list) return; list.innerHTML='';
  const items=await dbGetNotifications();
  items.sort((a,b)=>b.createdAt-a.createdAt).forEach(n=>{
    const li=document.createElement('li');
    li.textContent=new Date(n.createdAt).toLocaleString()+': '+n.text;
    const btn=document.createElement('button'); btn.textContent=n.read?'Read':'Mark read'; btn.onclick=async()=>{ await dbMarkNotification(n.id,true); renderNotifications(); };
    li.appendChild(btn); list.appendChild(li);
  });
}

renderNotifications();


