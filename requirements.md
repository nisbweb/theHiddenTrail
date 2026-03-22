# Website Requirements: "Inspiro Valedictory — Digital Espionage Interactive Experience"

## Project Overview

Build a **multi-page**, interactive web-based narrative game called **"The Archivist"**.
It is a **Digital Espionage & Psychological Thriller** experience where participants act as "Digital Recovery Agents" trying to recover a whistleblower's final message before a 60-minute countdown timer expires.

Each level is a **separate HTML page** — this is intentional. The separation reinforces immersion (each page feels like a different "compromised system") and makes the Level 1 puzzle (View Page Source) work correctly without cluttering the source with other levels' code.

The entire experience runs in the browser — no backend required. All logic is client-side (HTML, CSS, Vanilla JavaScript).

---

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript (no frameworks)
- Web Audio API (for Morse code audio visualizer in Level 2)
- `sessionStorage` for passing timer and score state between pages
- No external dependencies except optionally a monospace Google Font (e.g., "Share Tech Mono" or "Courier Prime")

---

## File Structure

```
index.html          ← Prologue / entry screen (starts the timer)
level1.html         ← The Ghost in the Machine
level2.html         ← The Frequency of Truth
level3.html         ← The Glitch Map
level4.html         ← The Paradox Archive
level5.html         ← The Final Upload
victory.html        ← Master Rank / victory screen
failure.html        ← Failure screen (time out or selfish choice)
shared.css          ← All shared styles (CRT theme, animations, layout)
shared.js           ← Shared utilities: timer, score, sessionStorage helpers, audio, typewriter
level1.js           ← Level 1 specific logic
level2.js           ← Level 2 specific logic
level3.js           ← Level 3 specific logic
level4.js           ← Level 4 specific logic
level5.js           ← Level 5 specific logic
```

No build tools, no npm, no frameworks.

---

## State Management (sessionStorage)

Since the game spans multiple pages, use `sessionStorage` to persist state.

Keys to store and read on every page:

```js
sessionStorage.setItem('score', currentScore);        // integer, starts at 5000
sessionStorage.setItem('timeRemaining', seconds);     // integer, seconds remaining
sessionStorage.setItem('hintFrozenUntil', timestamp); // epoch ms, 0 if not frozen
sessionStorage.setItem('lockUntil', timestamp);       // epoch ms, 0 if not locked
sessionStorage.setItem('mapIconClicks', count);       // integer, for Level 4 puzzle
sessionStorage.setItem('failReason', reason);         // 'timeout' or 'selfish'
```

**On every level page load:**
1. Read `timeRemaining` and `score` from sessionStorage
2. If either is missing → redirect to `index.html` (player accessed URL directly)
3. If `timeRemaining <= 0` → set `failReason = 'timeout'` and redirect to `failure.html`
4. Resume the countdown and score decrement from the stored values
5. Save updated values to sessionStorage every second via `setInterval`

**On navigating to the next level** (correct password entered):
1. Save current score and timeRemaining to sessionStorage
2. Use `window.location.href = 'levelX.html'` to navigate

---

## Visual Design & Theme (shared.css)

- **Color palette:** Black background (`#000`), green terminal text (`#00FF41`), red for alerts/warnings (`#FF0000`)
- **Font:** Monospace throughout — use `Share Tech Mono` from Google Fonts or fall back to `'Courier New', monospace`
- **Style:** Hacker/CRT terminal — scanlines overlay (CSS pseudo-element), subtle screen flicker animation, cursor blink
- **No images needed** — all visuals are CSS-driven or canvas-based
- Add a CSS scanlines overlay on the full screen using a `::before` pseudo-element with repeating linear gradient
- All narrative text should "typewrite" itself on load (character-by-character, ~40ms per character)

### Shared Header (present on level1.html through level5.html only)

A slim header bar at the top of every level page containing:
- **Top left:** `SCORE: [current score]` — updates every second
- **Top right:** `TIME: MM:SS` — countdown, updates every second
- **Top center:** A small 🗺️ map icon (or inline SVG equivalent) — always visible, always clickable across all level pages. It does nothing visually in Levels 1–3 but its click count is tracked in sessionStorage (`mapIconClicks`). In Level 4, the game checks this count to solve the puzzle.

The header must **NOT** appear on `index.html`, `victory.html`, or `failure.html`.

### Shared Footer (present on level1.html through level5.html only)

A subtle line at the very bottom: `LEVEL X / 5` — where X is the current level number, hardcoded per page.

---

## Global Mechanics

### Timer (shared.js)

- Countdown resumes from `timeRemaining` in sessionStorage; updates every second
- Displays in `MM:SS` format in the shared header
- At **900 seconds (15:00) remaining:** add CSS class `warn` to `<body>` — triggers a red border flash animation
- At **300 seconds (5:00) remaining:** add CSS class `critical` to `<body>` — shows a red "DELETE" progress bar in the header that fills from 0% to 100% over the remaining time
- If timer hits 0 → set `failReason = 'timeout'` in sessionStorage, redirect to `failure.html`

### Score (shared.js)

- Resumes from sessionStorage, decrements by 1 per second
- Does not go below 0
- Frozen (no decrement) while `Date.now() < hintFrozenUntil`
- Frozen while `Date.now() < lockUntil` (system lock active)

### Hint System (shared.js)

- On every level page, a small command line sits above the footer: `> _`
- If user types `/hint` and presses Enter:
  1. Show an overlay: `"WARNING: Requesting a hint will freeze your score for 120 seconds. Confirm? [Y/N]"`
  2. If Y → show level-specific hint text, set `hintFrozenUntil = Date.now() + 120000` in sessionStorage
  3. If N → dismiss overlay
- Hint text is defined per level in each level's JS file as a constant

### System Lock (shared.js)

- Triggered by a wrong password attempt or wrong city click sequence (Level 3)
- Set `lockUntil = Date.now() + 30000` in sessionStorage
- Show a full-screen overlay: `"⚠ SYSTEM LOCK — UNAUTHORIZED ATTEMPT DETECTED"` with a live 30-second countdown
- Disable all inputs during lock period
- Play System Lock alarm sound (Web Audio API)
- On page load: check if `lockUntil` is still in the future — if so, re-apply the lock for remaining duration

---

## index.html — Prologue (Entry Screen)

**No header or footer on this page.**

**Behaviour:**
- Screen is pitch black
- Three lines of green text typewrite themselves one after another (~500ms gap between lines):
  ```
  > Connection Established...
  > Unauthorized Access Detected.
  > Source: The Archivist (Status: Missing)
  ```
- After all three lines, a story paragraph typewriters in:
  > "You are a Digital Recovery Agent. A famous whistleblower known as 'The Archivist' has vanished. Before disappearing, he uploaded his consciousness into a fragmented server. You have 60 minutes to bypass his security layers and download 'The Truth' before the government Wipe Command deletes everything."
- A blinking `[ PRESS ENTER TO BEGIN ]` prompt appears after the story
- Pressing Enter:
  1. Initialises sessionStorage: `score=5000, timeRemaining=3600, hintFrozenUntil=0, lockUntil=0, mapIconClicks=0`
  2. Redirects to `level1.html`

---

## level1.html — The Ghost in the Machine

**Story text (typewrite in on load):**
> "The Archivist's voice: 'If you're reading this, they've found me. My entry key is hidden in the very foundation of this world.'"

**What the page shows:**
- Shared header and footer
- A "fake browser window" styled div that mimics a boring "Under Construction" webpage — no visible input or login box. Content example: `"🚧 Site Under Maintenance — Please Check Back Soon"` with a fake copyright footer
- Below the fake browser: a terminal input prompt `ENTER ACCESS KEY: > _`

**The puzzle:**
- Place this exact comment near the top of `<body>` in `level1.html`:
  ```html
  <!-- KEY: S3CUR1TY_BY_OBSCUR1TY -->
  ```
  It is a real HTML comment — invisible on screen, but visible in View Page Source and DevTools Inspector
- Players discover it by right-clicking → View Page Source, or opening DevTools

**Password:** `S3CUR1TY_BY_OBSCUR1TY` (case-insensitive, trimmed)

**On correct entry:** Flash `ACCESS GRANTED ✓` in green, play success beep, after 1.5s redirect to `level2.html`

**On wrong entry:** Trigger System Lock (30 seconds)

**Hint:** `"The answer is not on the surface. Have you looked beneath it?"`

---

## level2.html — The Frequency of Truth

**Story text (typewrite in on load):**
> "You break into the Communication Log. A file labeled VOICE_NOTE_04.wav appears. It sounds like distorted static and rhythmic beeping."

**What the page shows:**
- A fake "file system" UI — a styled div listing one file: `📄 VOICE_NOTE_04.wav` — clicking it plays the audio and starts the canvas visualizer
- A `<canvas>` audio visualizer showing a bar-chart waveform pulsing to a scripted sequence
- Below the visualizer, the riddle:
  > "To hear the future, you must count the pulses of the past. How many times does the heart of the machine beat before it breaks?"
- Terminal input: `ENTER PASSCODE: > _`

**The puzzle:**
- Use Web Audio API + canvas animation to simulate a Morse-like audio-visual sequence
- The visualizer plays a scripted sequence with exactly **17 distinct high peaks** (bars that reach maximum height)
- The correct passcode is `1089`
- Add JS comment: `// Visualizer peak count: 17 | Correct passcode: 1089`
- The audio + visualizer plays once and stops; clicking the file again replays it

**Password:** `1089`

**On correct entry:** Flash `FREQUENCY DECODED ✓`, redirect to `level3.html`

**On wrong entry:** Trigger System Lock

**Hint:** `"Count what you see, not what you hear."`

---

## level3.html — The Glitch Map

**Story text (typewrite in on load):**
> "You access the Archivist's Travel History. A world map appears with 6 flickering cities. A note reads: 'I followed the sun, but I started in the land where time begins. I ended where the ocean meets the edge of the world.'"

**What the page shows:**
- A simple SVG schematic world map (flat rectangle with rough continent outlines — keep it abstract, not realistic)
- 6 clickable city dot + label elements, positioned approximately on the map, each with a CSS flicker animation:
  - Tokyo, Cairo, Paris, London, New York, Sydney
- A sequence tracker below the map: `SEQUENCE: [?] > [?] > [?] > [?] > [?] > [?]` — updates as cities are clicked correctly
- The riddle cryptic note displayed above the map

**The puzzle:**
- Correct click order (East to West by time zone): **Tokyo → Cairo → Paris → London → New York → Sydney**
- Wrong city clicked: red flash, text `"INCORRECT SEQUENCE — RESETTING"`, sequence resets, System Lock triggered
- Each correct click: soft beep (Web Audio API oscillator), that city's label turns solid green (flicker stops)
- Full correct sequence: city dots cascade-blink, then `TIMEZONE_7734` appears revealed on screen and auto-fills into the terminal input
- Player must still press Enter to confirm

**Password:** `TIMEZONE_7734` (auto-filled, Enter to confirm)

**On correct entry:** Flash `MAP DECODED ✓`, redirect to `level4.html`

**Hint:** `"The sun rises in the East. Start there."`

---

## level4.html — The Paradox Archive

**Story text (typewrite in on load):**
> "Only 15 minutes left. The Antagonist takes control."

**What the page shows:**
- Background border is always red on this page (forced, CSS class on body)
- A chat-box UI (terminal-style) where the System AI sends pre-scripted messages with delays:
  1. (after 1s) `"SYSTEM_AI > Impressive. But you won't win. The Archivist was a traitor."`
  2. (after 3s) `"SYSTEM_AI > You're wasting your time. Let's play a little game, shall we?"`
- Three large clickable door buttons appear after the messages:
  - `[ DOOR 1: The Path of Gold (Lies) ]`
  - `[ DOOR 2: The Path of Blood (Violence) ]`
  - `[ DOOR 3: The Path of Silence ]`
- The riddle below the doors:
  > "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?"
- The 🗺️ map icon is present in the shared header as always

**The puzzle:**
- The answer is "A Map" — but players do NOT type it
- They must click the 🗺️ map icon in the shared header **3 times** (tracked via `mapIconClicks` in sessionStorage, which has been incrementing since Level 1)
- After 3rd click on this page → display `"THE ANSWER WAS ALWAYS THERE ✓"`, redirect to `level5.html`
- Clicking any Door: the chat box appends a sarcastic AI response:
  - Door 1: `"SYSTEM_AI > Gold? How predictable."`
  - Door 2: `"SYSTEM_AI > Violence solves nothing. Try again."`
  - Door 3: `"SYSTEM_AI > Silence is not an answer."`

**No terminal password input on this level.** Interaction is via map icon and door buttons only.

**Hint:** `"The answer has been watching you since the very beginning."`

---

## level5.html — The Final Upload

**Story text (typewrite in on load):**
> "5 minutes remaining. The DELETE sequence has begun. The Archivist's final message plays."

**What the page shows:**
- A large red "DELETE" progress bar at the top of the content area — fills from 0% to 100% over 300 seconds. If `timeRemaining < 300`, sync the fill duration to actual remaining time.
- The Archivist's final message typewriters in:
  > "The truth isn't a word. It's a choice. To save the world, you must sacrifice your progress."
- Two large buttons:
  - `[ ▶ SUBMIT SCORE ]` — styled red
  - `[ ↺ RESET SYSTEM ]` — styled white/grey

**The twist:**
- `SUBMIT SCORE` → set `failReason = 'selfish'` in sessionStorage, redirect to `failure.html`
- `RESET SYSTEM` → white screen flash, CSS glitch animation (~1 second), then redirect to `victory.html`

**No hint available.** If `/hint` is typed: `"SYSTEM_AI > There are no hints left. Only choices."`

---

## victory.html — Master Rank

**No shared header/footer — standalone page.**

**What the page shows:**
- Boot sequence typewriters in:
  ```
  > WIPE COMMAND... CANCELLED.
  > UPLOADING TRUTH... COMPLETE.
  > SYSTEM RESTORED.
  ```
- A fake classified document rendered in ASCII box style:
  ```
  ╔══════════════════════════════════════╗
  ║   [CLASSIFIED] — THE ARCHIVIST      ║
  ║   DOCUMENT REF: ARCHIVE-ZERO-0001   ║
  ╠══════════════════════════════════════╣
  ║ "The truth was never hidden.        ║
  ║  It was buried under comfort.       ║
  ║  You chose discomfort. You chose    ║
  ║  truth. That is enough."            ║
  ║                              — T.A. ║
  ╚══════════════════════════════════════╝
  ```
- `RANK: ★★★★★ MASTER`
- `FINAL SCORE: [score from sessionStorage]`
- `"Thank you for participating in Inspiro Valedictory."`
- A leaderboard table with hardcoded placeholder entries, player's score inserted and highlighted:
  ```
  ╔═══╦══════════════════╦══════════╦═════════════╗
  ║ # ║ AGENT            ║ SCORE    ║ RANK        ║
  ╠═══╬══════════════════╬══════════╬═════════════╣
  ║ 1 ║ AGENT_ZERO       ║ 4721 pts ║ MASTER ★★★★★║
  ║ 2 ║ [PLAYER]         ║ ???? pts ║ MASTER ★★★★★║  ← highlighted green
  ║ 3 ║ CIPHER_HAWK      ║ 3890 pts ║ ELITE  ★★★★ ║
  ║ 4 ║ GHOST_PROTOCOL   ║ 3201 pts ║ ELITE  ★★★★ ║
  ║ 5 ║ ORACLE_7         ║ 2540 pts ║ AGENT  ★★★  ║
  ╚═══╩══════════════════╩══════════╩═════════════╝
  ```
  Insert player's actual score from sessionStorage and rank it correctly among the placeholders.

---

## failure.html — Failure Screen

**No shared header/footer — standalone page.**

Read `failReason` from sessionStorage:

**`failReason = 'timeout'`:**
```
> CONNECTION LOST.
> TIME EXPIRED. THE WIPE COMMAND EXECUTED.
> The Archivist's files are gone forever.
> RANK: ✗ ELIMINATED
> FINAL SCORE: [score]
```

**`failReason = 'selfish'`:**
```
> SCORE SUBMITTED.
> You chose yourself over the truth.
> The files were deleted. The Archivist's message was never delivered.
> RANK: ✗ COMPROMISED
> FINAL SCORE: [score]
```

Both modes show a `[ PLAY AGAIN ]` button that clears sessionStorage and redirects to `index.html`.

---

## Audio (shared.js)

All audio via **Web Audio API only** — no `.mp3` or `.wav` file imports.

| Sound | Trigger | Description |
|---|---|---|
| Typewriter tick | Each character in typewriter animations | Short click — square wave oscillator, ~1ms |
| Success beep | Correct password accepted | Short ascending two-tone beep |
| Error buzz | Wrong password or wrong city click | Low descending buzz, ~300ms |
| System Lock alarm | Lock triggered | Repeating beep for 2–3 seconds |
| City click beep | Correct city clicked in Level 3 | Soft mid-range oscillator ping |
| Ambient hum | All level pages (optional) | Very low volume sine wave drone |

---

## UX Notes

- Terminal input auto-focuses on page load for every level
- Pressing `Enter` submits passwords
- All password comparisons: `.trim().toUpperCase()`
- If sessionStorage is missing on a level page (direct URL access), redirect to `index.html`
- Mobile NOT required — desktop/laptop only, minimum 1024px viewport

---

## Password Summary

| Page | Puzzle Type | Answer |
|---|---|---|
| `level1.html` | View Page Source → HTML comment | `S3CUR1TY_BY_OBSCUR1TY` |
| `level2.html` | Count visualizer peaks | `1089` |
| `level3.html` | Click cities East → West | `TIMEZONE_7734` (auto-revealed) |
| `level4.html` | Click map icon 3× | No text input |
| `level5.html` | Choose RESET over SUBMIT | Button click |
