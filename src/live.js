let livePc; let liveDc; let liveIsHost=false;

async function liveHost(){
  liveIsHost=true; livePc=new RTCPeerConnection();
  liveDc=livePc.createDataChannel('room');
  setupLiveChannel();
  livePc.onicecandidate=()=>updateLiveSignalOut();
  const offer=await livePc.createOffer(); await livePc.setLocalDescription(offer); updateLiveSignalOut();
  setLiveStatus('Hosting...');
}

async function liveJoin(){
  liveIsHost=false; livePc=new RTCPeerConnection();
  livePc.ondatachannel=(e)=>{ liveDc=e.channel; setupLiveChannel(); };
  livePc.onicecandidate=()=>updateLiveSignalOut();
  setLiveStatus('Paste host offer and connect.');
}

async function liveConnect(remoteText){
  if(!livePc) return; try{
    const remote=JSON.parse(remoteText);
    if(remote.type){
      await livePc.setRemoteDescription(remote);
      if(remote.type==='offer'){
        const ans=await livePc.createAnswer(); await livePc.setLocalDescription(ans); updateLiveSignalOut();
      }
    } else if(remote.candidate){ await livePc.addIceCandidate(remote); }
    setLiveStatus('Signal applied.');
  }catch{ setLiveStatus('Invalid signal.'); }
}

function updateLiveSignalOut(){
  const ta=document.getElementById('liveSignalOut');
  ta.value= livePc?.localDescription ? JSON.stringify(livePc.localDescription) : '';
}

function setupLiveChannel(){
  if(!liveDc) return;
  liveDc.onopen=()=>setLiveStatus('Connected. Start chatting.');
  liveDc.onmessage=(e)=> appendLiveChat('peer', e.data);
}

function appendLiveChat(who,text){
  const box=document.getElementById('liveChat');
  const div=document.createElement('div');
  div.textContent=(who==='peer'?'👥 ':'🧑 ')+text; box.appendChild(div); box.scrollTop=box.scrollHeight;
}

function setLiveStatus(t){ document.getElementById('liveStatus').textContent=t; }

document.getElementById('liveHost').addEventListener('click', liveHost);
document.getElementById('liveJoin').addEventListener('click', liveJoin);
document.getElementById('liveCopy').addEventListener('click',()=>{ const ta=document.getElementById('liveSignalOut'); ta.select(); document.execCommand('copy'); });
document.getElementById('liveConnect').addEventListener('click',()=> liveConnect(document.getElementById('liveSignalIn').value));
document.getElementById('liveSend').addEventListener('click',()=>{ const i=document.getElementById('liveMsg'); const v=i.value.trim(); if(!v||!liveDc) return; liveDc.send(v); appendLiveChat('you',v); i.value=''; });


