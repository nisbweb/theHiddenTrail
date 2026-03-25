document.addEventListener('DOMContentLoaded', ()=>{
  const time = sessionStorage.getItem('timeRemaining'); const score = sessionStorage.getItem('score');
  if(!time || !score) { window.location.href='index.html'; return; }
  if(Number(time) <= 0){ sessionStorage.setItem('failReason','timeout'); window.location.href='failure.html'; return; }
  window.GA.checkLockOnLoad(); window.GA.createHeader(3); window.GA.createFooter(3); window.GA.startClock();
  window.GA.HINT_TEXT = "The sun rises in the East. Start there.";
  window.GA.attachHint && window.GA.attachHint();
  window.GA.runTypewriters && window.GA.runTypewriters();

  const order = ['Tokyo','Cairo','Paris','London','New York','Sydney']; let pos=0; const slots = document.getElementById('seqSlots');
  document.querySelectorAll('#map .city').forEach(g=>{ g.style.cursor='pointer';
    // start with flicker class on group
    g.classList.add('flicker');
    g.addEventListener('click', ()=>{
      const name = g.getAttribute('data-name');
      if(name === order[pos]){
        // mark solid (stop flicker) and set color
        g.classList.add('solid');
        const c = g.querySelector('circle'); if(c) c.setAttribute('fill','#0f0');
        try{ window.beep(800,80); }catch(e){}
        pos++; updateSlots();
        if(pos===order.length){ alert('Sequence complete. Passcode revealed.'); document.getElementById('mapInput').value='TIMEZONE_7734'; }
      } else {
        document.body.classList.add('warn-border'); setTimeout(()=>document.body.classList.remove('warn-border'),400);
        pos=0; updateSlots(); try{ window.GA && window.GA.triggerSystemLock && window.GA.triggerSystemLock(); }catch(e){}
        alert('INCORRECT SEQUENCE - RESETTING');
        // reset solid/flicker state
        document.querySelectorAll('#map .city').forEach(h=>{ h.classList.remove('solid'); });
      }
    });
  });
  function updateSlots(){ const out = order.map((o,i)=> i<pos? o : '[?]'); slots.textContent = out.join(' > '); }
  updateSlots();

  const form = document.getElementById('mapForm'); form.addEventListener('submit', (e)=>{ e.preventDefault(); const v = (document.getElementById('mapInput').value||'').trim().toUpperCase(); if(v === 'TIMEZONE_7734'){ window.beep(1200,120); setTimeout(()=> window.location.href='level4.html',700); } else { window.GA.triggerSystemLock(); alert('INCORRECT - SYSTEM LOCKED'); } });
});
