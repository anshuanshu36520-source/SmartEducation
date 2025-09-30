document.getElementById('userAdd').addEventListener('click', async ()=>{
  const name=document.getElementById('userName').value.trim();
  const role=document.getElementById('userRole').value;
  if(!name) return;
  await dbAddUser({ name, role, createdAt: Date.now() });
  document.getElementById('userName').value='';
  renderUsers();
});

document.getElementById('notifySend').addEventListener('click', async ()=>{
  const text=document.getElementById('notifyText').value.trim();
  if(!text) return;
  await dbAddNotification({ text, createdAt: Date.now(), read:false });
  document.getElementById('notifyText').value='';
  renderNotifications();
  if ('Notification' in window && Notification.permission==='granted') new Notification('SmartEdu', { body: text });
});

async function renderUsers(){
  const list=document.getElementById('userList'); list.innerHTML='';
  const users=await dbGetUsers();
  users.forEach(u=>{ const li=document.createElement('li'); li.textContent=`${u.name} (${u.role})`; const del=document.createElement('button'); del.textContent='🗑️'; del.onclick=async()=>{ await dbDeleteUser(u.id); renderUsers(); }; li.appendChild(del); list.appendChild(li); });
}

renderUsers();


