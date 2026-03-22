// Shared utilities: timer, score, header/footer, hint, lock, audio ticks
(() => {
  window.GA = window.GA || {};
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  function playTypeTick(){ try{ const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='square'; o.frequency.value=1200; g.gain.value=0.0008; o.connect(g); g.connect(ctx.destination); o.start(); setTimeout(()=>{ o.stop(); },12); }catch(e){} }
  window.playTypeTick = playTypeTick;

  function beep(freq=800,dur=120){ try{ const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='sine'; o.frequency.value=freq; g.gain.value=0.02; o.connect(g); g.connect(ctx.destination); o.start(); setTimeout(()=>{ o.stop(); },dur); }catch(e){} }
  window.beep = beep;

  // Typewriter utility for hint and story reveals
  async function typeWrite(el, text, delay=40){ el.textContent = ''; for(let i=0;i<text.length;i++){ el.textContent += text[i]; try{ playTypeTick(); }catch(e){} await new Promise(r=>setTimeout(r, delay)); } }
  window.GA.typeWrite = typeWrite;

  function runTypewriters(){ document.querySelectorAll('.typewriter').forEach(el=>{ const txt = el.getAttribute('data-text') || el.textContent; // preserve existing text if not provided
    // avoid re-typing if element already has data-typed
    if(el.dataset.typed === '1') return;
    el.textContent = '';
    // Prefer explicit data-text; if none and txt is empty, nothing to do
    if(!txt) return;
    typeWrite(el, txt, 40).then(()=>{ el.dataset.typed = '1'; }).catch(()=>{});
  }); }
  window.GA.runTypewriters = runTypewriters;

  function formatMMSS(s){ const m=Math.floor(s/60); const sec=s%60; return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'); }

  function createHeader(level){ const existing=document.querySelector('header.shared'); if(existing) return existing;
    const h=document.createElement('header'); h.className='shared';
    const left=document.createElement('div'); left.className='left'; left.innerHTML=`SCORE: <span class="score">--</span>`;
    const center=document.createElement('div'); center.className='center'; center.innerHTML=`<span class="map-icon" title="Map">🗺️</span>`;
    const right=document.createElement('div'); right.className='right'; right.innerHTML=`TIME: <span class="time">--:--</span>`;
    h.appendChild(left); h.appendChild(center); h.appendChild(right);
    document.body.appendChild(h);
    const map = h.querySelector('.map-icon'); map.addEventListener('click', ()=>{
      const clicks = Number(sessionStorage.getItem('mapIconClicks')||'0')+1; sessionStorage.setItem('mapIconClicks', String(clicks));
      beep(900,80);
    });
    return h;
  }
  function createFooter(level){ const existing=document.querySelector('footer.shared'); if(existing) return existing;
    const f=document.createElement('footer'); f.className='shared'; f.textContent = `LEVEL ${level} / 5`;
    document.body.appendChild(f); return f;
  }

  // Lock overlay
  let lockTimer=null;
  function applyLock(remainingMs){ clearInterval(lockTimer); const overlay=document.createElement('div'); overlay.className='overlay'; overlay.innerHTML=`<div class="lock-overlay"><h2>⚠ SYSTEM LOCK — UNAUTHORIZED ATTEMPT DETECTED</h2><div id="lock-count">${Math.ceil(remainingMs/1000)}s</div></div>`; document.body.appendChild(overlay);
    const start=Date.now(); lockTimer = setInterval(()=>{
      const left = Math.max(0, Math.ceil((remainingMs - (Date.now()-start))/1000)); const el=document.getElementById('lock-count'); if(el) el.textContent=left+'s';
      if((Date.now()-start) >= remainingMs){ clearInterval(lockTimer); overlay.remove(); sessionStorage.setItem('lockUntil','0'); }
    },250);
    // play alarm
    try{ const o=ctx.createOscillator(); const g=ctx.createGain(); o.frequency.value=600; o.type='sine'; g.gain.value=0.03; o.connect(g); g.connect(ctx.destination); o.start(); setTimeout(()=>o.stop(),1700);}catch(e){}
  }

  function checkLockOnLoad(){ const lockUntil = Number(sessionStorage.getItem('lockUntil')||'0'); if(Date.now() < lockUntil){ applyLock(lockUntil - Date.now()); disableInputs(true); } }
  function disableInputs(dis){ document.querySelectorAll('input,button,textarea').forEach(el=>el.disabled = dis); }

  // Timer & score
  let tickHandle=null;
  function startClock(){ if(tickHandle) return; tickHandle = setInterval(()=>{
    let time = Number(sessionStorage.getItem('timeRemaining')||'0'); let score = Math.max(0, Number(sessionStorage.getItem('score')||'0'));
    const hintFrozen = Number(sessionStorage.getItem('hintFrozenUntil')||'0'); const lockUntil = Number(sessionStorage.getItem('lockUntil')||'0');
    if(Date.now() >= lockUntil && lockUntil!==0){ sessionStorage.setItem('lockUntil','0'); }
    const lockedNow = Date.now() < Number(sessionStorage.getItem('lockUntil')||'0');
    if(!(Date.now() < hintFrozen) && !lockedNow){ score = Math.max(0, score-1); sessionStorage.setItem('score',String(score)); }
    time = Math.max(0, time-1); sessionStorage.setItem('timeRemaining',String(time));
    const sEl = document.querySelector('header.shared .score'); const tEl = document.querySelector('header.shared .time'); if(sEl) sEl.textContent = String(score); if(tEl) tEl.textContent = formatMMSS(time);
    if(time === 900) document.body.classList.add('warn');
    if(time === 300) document.body.classList.add('critical');
    // critical delete bar
    if(document.body.classList.contains('critical')){
      let bar = document.querySelector('.delete-bar i'); if(!bar){ const wrap=document.createElement('div'); wrap.className='delete-bar'; wrap.innerHTML='<i></i>'; document.querySelector('header.shared .center').appendChild(wrap); bar = wrap.querySelector('i'); }
      const total = Math.max(1, Number(sessionStorage.getItem('timeRemaining')||'1'));
      const elapsed = 300 - total; const pct = Math.min(100, Math.round((elapsed/300)*100)); document.querySelector('.delete-bar i').style.width = pct + '%';
    }
    if(time <= 0){ sessionStorage.setItem('failReason','timeout'); window.location.href = 'failure.html'; }
  },1000); }

  // Hint UI
  function attachHintCommand(){ const cmd = document.querySelector('.hint-command'); if(!cmd) return; const input = cmd.querySelector('input'); cmd.addEventListener('submit', (e)=>{ e.preventDefault(); const v = input.value.trim(); if(v === '/hint'){ const ok = confirm('WARNING: Requesting a hint will freeze your score for 120 seconds. Confirm?'); if(ok){ sessionStorage.setItem('hintFrozenUntil', String(Date.now()+120000)); alert('HINT:\n'+(window.GA.HINT_TEXT||'No hint available.')); } } input.value=''; }); }
  
  // Replace attachHintCommand with a more robust modal-based implementation
  function attachHintCommand(){ const container = document.querySelector('.hint-command'); if(!container) return; const form = container.querySelector('form'); const input = form && form.querySelector('input'); if(!form || !input) return;
    form.addEventListener('submit', (e)=>{ e.preventDefault(); const v = (input.value||'').trim(); input.value = '';
      if(v !== '/hint') return;
      const hintText = window.GA.HINT_TEXT || 'No hint available.';
      const existingUntil = Number(sessionStorage.getItem('hintFrozenUntil')||'0');
      if(Date.now() < existingUntil){ showHintModal(hintText, existingUntil); return; }
      // show warning modal
      showHintModal(hintText, 0, true);
    }); }

  // Hint modal: warning -> on confirm freeze score and reveal hint with typewriter + countdown
  // Use localized strings from window.GA.L10N_HINTS (fallback to English)
  function showHintModal(hintText, until=0, askConfirm=false){
    const L = (window.GA && window.GA.L10N_HINTS) ? window.GA.L10N_HINTS : {
      titleWarning: 'WARNING: Request Hint',
      confirmText: 'Requesting a hint will freeze your score for 120 seconds. Confirm?',
      btnConfirm: 'Confirm', btnCancel: 'Cancel',
      hintTitle: 'HINT', freezeLabel: 'Freeze ends in', closeText: 'Close'
    };

    const overlay = document.createElement('div'); overlay.className = 'overlay hint-overlay'; overlay.style.zIndex = 500;
    const box = document.createElement('div'); box.className = 'hint-modal';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    let countdownHandle = null;
    function close(){ if(countdownHandle) clearInterval(countdownHandle); overlay.remove(); }

    if(askConfirm){
      box.innerHTML = `<h3 class="hint-title">${escapeHtml(L.titleWarning)}</h3><p class="hint-msg">${escapeHtml(L.confirmText)}</p>`;
      const btnRow = document.createElement('div'); btnRow.className = 'hint-actions';
      const ok = document.createElement('button'); ok.className='btn'; ok.textContent=L.btnConfirm;
      const cancel = document.createElement('button'); cancel.className='btn'; cancel.textContent=L.btnCancel;
      btnRow.appendChild(ok); btnRow.appendChild(cancel); box.appendChild(btnRow);
      cancel.addEventListener('click', ()=>{ close(); });
      ok.addEventListener('click', ()=>{
        const untilTs = Date.now()+120000; sessionStorage.setItem('hintFrozenUntil', String(untilTs));
        // replace box with hint reveal
        revealHint(untilTs);
      });
    } else if(until && Date.now() < until){
      // show active hint countdown
      revealHint(until);
    } else {
      // just reveal hint without freezing
      revealHint(until);
    }

    function revealHint(untilTs){
      box.innerHTML = `<h3 class="hint-title">${escapeHtml(L.hintTitle)}</h3><div id="hintText" class="hint-body" style="min-height:48px"></div><div class="hint-count">${escapeHtml(L.freezeLabel)} <span id="hintCountdown"></span></div><div class="hint-actions"><button id="hintClose" class="btn">${escapeHtml(L.closeText)}</button></div>`;
      const hintEl = box.querySelector('#hintText'); const cdEl = box.querySelector('#hintCountdown'); const closeBtn = box.querySelector('#hintClose');
      // type the hint
      typeWrite(hintEl, hintText, 30).catch(()=>{});
      function updateCountdown(){ const now = Date.now(); const left = Math.max(0, Math.ceil(((untilTs||0) - now)/1000)); cdEl.textContent = left + 's'; if(left<=0){ cdEl.textContent = '0s'; if(countdownHandle){ clearInterval(countdownHandle); countdownHandle=null; } }
      }
      if(untilTs && untilTs > Date.now()){ updateCountdown(); countdownHandle = setInterval(updateCountdown, 1000); }
      closeBtn.addEventListener('click', ()=>{ close(); });
    }
  }
  window.GA.showHintModal = showHintModal;

  // small HTML escape helper
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // Wrong attempt -> lock
  function triggerSystemLock(){ const until = Date.now()+30000; sessionStorage.setItem('lockUntil', String(until)); applyLock(30000); disableInputs(true); setTimeout(()=>{ disableInputs(false); },31000); }

  // Expose API
  window.GA.createHeader = createHeader; window.GA.createFooter = createFooter; window.GA.startClock = startClock; window.GA.attachHint = attachHintCommand; window.GA.checkLockOnLoad = checkLockOnLoad; window.GA.triggerSystemLock = triggerSystemLock; window.GA.ctx = ctx;
})();
