function drawCertificate(name, course){
  const c=document.getElementById('certCanvas'); const ctx=c.getContext('2d');
  ctx.fillStyle='#0b0f12'; ctx.fillRect(0,0,c.width,c.height);
  ctx.strokeStyle='#22c55e'; ctx.lineWidth=6; ctx.strokeRect(12,12,c.width-24,c.height-24);
  ctx.fillStyle='#e2e8f0'; ctx.font='bold 42px system-ui'; ctx.fillText('Certificate of Completion', 140, 120);
  ctx.font='24px system-ui'; ctx.fillText('This certifies that', 140, 200);
  ctx.font='bold 36px system-ui'; ctx.fillText(name||'Student Name', 140, 250);
  ctx.font='24px system-ui'; ctx.fillText('has successfully completed', 140, 300);
  ctx.font='bold 30px system-ui'; ctx.fillText(course||'Course Name', 140, 350);
  ctx.font='18px system-ui'; ctx.fillText('Date: '+new Date().toLocaleDateString(), 140, 420);
}

document.getElementById('certGen').addEventListener('click',()=>{
  drawCertificate(document.getElementById('certName').value.trim(), document.getElementById('certCourse').value.trim());
});

document.getElementById('certDownload').addEventListener('click',()=>{
  const c=document.getElementById('certCanvas'); const a=document.createElement('a'); a.href=c.toDataURL('image/png'); a.download='certificate.png'; a.click();
});

drawCertificate('', '');


