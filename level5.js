document.addEventListener('DOMContentLoaded', ()=>{
  const timeRaw = sessionStorage.getItem('timeRemaining'); const score = sessionStorage.getItem('score');
  if(!timeRaw || !score){ window.location.href='index.html'; return; }
  const time = Number(timeRaw||'0');
  if(time <= 0){ sessionStorage.setItem('failReason','timeout'); window.location.href='failure.html'; return; }
  window.GA.checkLockOnLoad(); window.GA.createHeader(5); window.GA.createFooter(5); window.GA.startClock();
  window.GA.HINT_TEXT = "SYSTEM_AI > There are no hints left. Only choices.";
  window.GA.attachHint && window.GA.attachHint();
  window.GA.runTypewriters && window.GA.runTypewriters();

  const wrap = document.getElementById('deleteWrap'); const bar = document.createElement('div'); bar.className='delete-bar'; bar.innerHTML='<i></i>'; wrap.appendChild(bar);
  function syncBar(){ const t = Number(sessionStorage.getItem('timeRemaining')||'0'); const remaining = Math.max(0, t); const total = Math.min(300, Math.max(1, remaining)); const pct = Math.round(((300 - total)/300)*100); bar.querySelector('i').style.width = pct+'%'; }
  syncBar(); setInterval(syncBar,1000);

  document.getElementById('submit').addEventListener('click', ()=>{ sessionStorage.setItem('failReason','selfish'); window.location.href='failure.html'; });
  document.getElementById('reset').addEventListener('click', ()=>{ document.body.style.background='#fff'; setTimeout(()=>{ window.location.href='victory.html'; },900); });
});
