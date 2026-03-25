document.addEventListener('DOMContentLoaded', ()=>{
  // enforce session state per requirements: redirect to index if missing
  const time = sessionStorage.getItem('timeRemaining'); const score = sessionStorage.getItem('score');
  if(!time || !score){ window.location.href = 'index.html'; return; }
  if(Number(time) <= 0){ sessionStorage.setItem('failReason','timeout'); window.location.href = 'failure.html'; return; }

  try{
    if(window.GA){
      window.GA.checkLockOnLoad && window.GA.checkLockOnLoad();
      window.GA.createHeader && window.GA.createHeader(1);
      window.GA.createFooter && window.GA.createFooter(1);
      window.GA.startClock && window.GA.startClock();
      window.GA.HINT_TEXT = "The answer is not on the surface. Have you looked beneath it?";
      window.GA.attachHint && window.GA.attachHint();
      window.GA.runTypewriters && window.GA.runTypewriters();
    }
  }catch(e){ console.warn('GA init failed', e); }

  const form = document.getElementById('keyForm'); const input = document.getElementById('keyInput'); if(input) input.focus();
  form && form.addEventListener('submit', (e)=>{
    e.preventDefault(); const val = (input && input.value||'').trim().toUpperCase();
    if(val === 'S3CUR1TY_BY_OBSCUR1TY'){
      document.body.style.outline='2px solid #0f0';
      try{ window.beep && window.beep(1200,120); }catch(e){}
      setTimeout(()=>{ window.location.href='level2.html'; },1400);
    } else {
      try{ window.GA && window.GA.triggerSystemLock && window.GA.triggerSystemLock(); }catch(e){}
      alert('INCORRECT - SYSTEM LOCKED');
    }
  });
});
