document.addEventListener('DOMContentLoaded', ()=>{
  const time = sessionStorage.getItem('timeRemaining'); const score = sessionStorage.getItem('score');
  if(!time || !score) { window.location.href='index.html'; return; }
  if(Number(time) <= 0){ sessionStorage.setItem('failReason','timeout'); window.location.href='failure.html'; return; }
  // force red border background per requirements
  document.body.style.border = '6px solid rgba(255,0,0,.12)';
  window.GA.checkLockOnLoad(); window.GA.createHeader(4); window.GA.createFooter(4); window.GA.startClock();
  window.GA.HINT_TEXT = "The answer has been watching you since the very beginning.";
  window.GA.attachHint && window.GA.attachHint();
  window.GA.runTypewriters && window.GA.runTypewriters();

  const msgs = document.getElementById('messages'); function push(msg){ const p = document.createElement('div'); p.textContent = msg; msgs.appendChild(p); }
  setTimeout(()=>push('SYSTEM_AI > Impressive. But you won\'t win. The Archivist was a traitor.'),1000);
  setTimeout(()=>push('SYSTEM_AI > You\'re wasting your time. Let\'s play a little game, shall we?'),3000);

  document.getElementById('door1').addEventListener('click', ()=>{ push('SYSTEM_AI > Gold? How predictable.'); });
  document.getElementById('door2').addEventListener('click', ()=>{ push('SYSTEM_AI > Violence solves nothing. Try again.'); });
  document.getElementById('door3').addEventListener('click', ()=>{ push('SYSTEM_AI > Silence is not an answer.'); });

  // Require 3 fresh clicks per page load to solve; do not persist progress between visits
  const required = 3;
  let mapClicks = 0;
  const mapBtn = document.getElementById('mapIcon');
  if(mapBtn){
    mapBtn.addEventListener('click', ()=>{
      mapClicks += 1;
      if(mapClicks >= required){
        alert('THE ANSWER WAS ALWAYS THERE ✓');
        window.location.href = 'level5.html';
      }
    });
  }
});
