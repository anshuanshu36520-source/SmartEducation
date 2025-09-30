let pc; let channel; let isHost=false;

async function startHost(){
  isHost=true;
  pc = new RTCPeerConnection();
  channel = pc.createDataChannel('share');
  setupChannel();
  pc.onicecandidate = () => updateSignalOut();
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  updateSignalOut();
  document.getElementById('p2pStatus').textContent = 'Hosting... Copy and share your offer.';
}

async function startJoin(){
  isHost=false;
  pc = new RTCPeerConnection();
  pc.ondatachannel = (e)=>{ channel=e.channel; setupChannel(); };
  pc.onicecandidate = () => updateSignalOut();
  document.getElementById('p2pStatus').textContent = 'Paste host offer and click Connect.';
}

async function completeSignal(remoteText){
  if(!pc) return;
  try{
    const remote = JSON.parse(remoteText);
    if(remote.type){
      await pc.setRemoteDescription(remote);
      if(remote.type==='offer'){
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        updateSignalOut();
      }
    } else if(remote.candidate){
      await pc.addIceCandidate(remote);
    }
    document.getElementById('p2pStatus').textContent = 'Signal applied.';
  }catch(e){
    document.getElementById('p2pStatus').textContent = 'Invalid signal.';
  }
}

function updateSignalOut(){
  const out = document.getElementById('signalOut'); if(!out||!pc) return;
  const desc = pc.localDescription ? JSON.stringify(pc.localDescription) : '';
  out.value = desc;
}

function setupChannel(){
  if(!channel) return;
  channel.onopen = async ()=>{
    document.getElementById('p2pStatus').textContent = 'Connected. Sharing lessons...';
    const blob = await exportAllData();
    const text = await blob.text();
    channel.send(text);
  };
  channel.onmessage = async (e)=>{
    try{ const data = JSON.parse(e.data); await importAllData(data); document.getElementById('p2pStatus').textContent='Imported shared content.'; }catch{}
  };
}


