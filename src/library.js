document.getElementById('resAdd').addEventListener('click', async ()=>{
  const title=document.getElementById('resTitle').value.trim();
  const desc=document.getElementById('resDesc').value.trim();
  const file=document.getElementById('resFile').files[0];
  if(!title) return;
  let content=desc;
  if(file) content += '\n' + await file.text();
  await dbAddResource({ title, content, createdAt: Date.now() });
  document.getElementById('resTitle').value='';
  document.getElementById('resDesc').value='';
  document.getElementById('resFile').value='';
  renderResources();
});

document.getElementById('resSearch').addEventListener('input', renderResources);

async function renderResources(){
  const q=(document.getElementById('resSearch').value||'').toLowerCase();
  const list=document.getElementById('resList'); list.innerHTML='';
  const items=await dbGetResources();
  items.filter(r=>!q||r.title.toLowerCase().includes(q)||r.content.toLowerCase().includes(q))
    .forEach(r=>{ const li=document.createElement('li'); li.textContent=r.title; const del=document.createElement('button'); del.textContent='🗑️'; del.onclick=async()=>{ await dbDeleteResource(r.id); renderResources(); }; li.appendChild(del); list.appendChild(li); });
}

renderResources();


