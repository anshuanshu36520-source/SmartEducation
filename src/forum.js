document.getElementById('threadPost').addEventListener('click', async ()=>{
  const title=document.getElementById('threadTitle').value.trim();
  const body=document.getElementById('threadBody').value.trim();
  if(!title||!body) return;
  await dbAddThread({ title, body, createdAt: Date.now() });
  document.getElementById('threadTitle').value='';
  document.getElementById('threadBody').value='';
  renderThreads();
});

async function renderThreads(){
  const list=document.getElementById('threadList'); list.innerHTML='';
  const threads=await dbGetThreads();
  threads.forEach(t=>{
    const li=document.createElement('li');
    li.textContent=t.title;
    const del=document.createElement('button'); del.textContent='🗑️'; del.onclick=async()=>{ await dbDeleteThread(t.id); renderThreads(); };
    li.appendChild(del);
    list.appendChild(li);
  });
}

renderThreads();


