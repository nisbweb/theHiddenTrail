// Visualizer peak count: 17 | Correct passcode: 1089
document.addEventListener('DOMContentLoaded', ()=>{
  // enforce session state per requirements: redirect to index if missing
  const time = sessionStorage.getItem('timeRemaining'); const score = sessionStorage.getItem('score');
  if(!time || !score){ window.location.href = 'index.html'; return; }
  if(Number(time) <= 0){ sessionStorage.setItem('failReason','timeout'); window.location.href = 'failure.html'; return; }

  try{
    if(window.GA){
      window.GA.checkLockOnLoad && window.GA.checkLockOnLoad();
      window.GA.createHeader && window.GA.createHeader(2);
      window.GA.createFooter && window.GA.createFooter(2);
      window.GA.startClock && window.GA.startClock();
      window.GA.HINT_TEXT = "Count what you see, not what you hear.";
      window.GA.attachHint && window.GA.attachHint();
      window.GA.runTypewriters && window.GA.runTypewriters();
    }
  }catch(e){ console.warn('GA init failed', e); }

  const play = document.getElementById('playFile'); const canvas = document.getElementById('viz'); const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  const seq = [0,1,0,2,0,3,0,5,0,10,0,15,0,12,0,17,0,2,0,17,0,3,0,8]; // scripted peaks (17 high peaks appear)
  let playing=false;
  function drawFrame(i){
    if(!ctx) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const barW = canvas.width / seq.length;

    for(let j = 0; j < seq.length; j++){
        const h = (seq[j] / 17) * canvas.height;

        ctx.fillStyle = '#00ff66';
        ctx.fillRect(j * barW, canvas.height - h, barW - 2, h);
    }
}
  play && play.addEventListener('click', ()=>{ if(playing) return; playing=true; drawFrame(0); try{ window.beep && window.beep(700,300); }catch(e){} setTimeout(()=>{ playing=false; },900); });

  const form = document.getElementById('passForm'); const input = document.getElementById('passInput'); if(input) input.focus();
  form && form.addEventListener('submit', (e)=>{ e.preventDefault(); const v = (input && input.value||'').trim().toUpperCase(); if(v === '1039'){ try{ window.beep && window.beep(1200,120); }catch(e){} setTimeout(()=> window.location.href='level3.html',700); } else { try{ window.GA && window.GA.triggerSystemLock && window.GA.triggerSystemLock(); }catch(e){} alert('INCORRECT - SYSTEM LOCKED'); } });
});
