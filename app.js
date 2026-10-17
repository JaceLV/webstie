const API = 'http://127.0.0.1:8080/v1/chat/completions';
const MODEL = 'ggml-org/Qwen3.5-0.8B-GGUF';
const history = [];
const form = document.querySelector('#helper-form');
const input = document.querySelector('#helper-input');
const messages = document.querySelector('#assistant-messages');
const send = form.querySelector('button');
const status = document.querySelector('#ai-status');
let waiting = false;

function bubble(text, kind = 'helper-bubble') {
  const el = document.createElement('div');
  el.className = `bubble ${kind}`;
  el.textContent = text;
  messages.append(el);
  messages.scrollTop = messages.scrollHeight;
  return el;
}

async function checkServer() {
  try {
    const response = await fetch('http://127.0.0.1:8080/v1/models', { signal: AbortSignal.timeout(3500) });
    if (!response.ok) throw new Error('Server not ready');
    status.innerHTML = '<i></i> LLAMA.CPP READY';
    status.classList.add('online');
  } catch {
    status.innerHTML = '<i></i> START LOCAL SERVER';
    status.classList.remove('online');
  }
}

async function ask(prompt) {
  const text = prompt.trim();
  if (!text || waiting) return;
  waiting = true; send.disabled = true;
  bubble(text, 'user-bubble');
  history.push({ role: 'user', content: text });
  const thinking = bubble('Thinking with your local model…');
  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: 'You are Tempo, a calm and practical focus companion. Help the user plan a short, realistic focus session, brainstorm, or find one small next step. Be warm, concise, and avoid pretending to control any physical product.' }, ...history],
        stream: false,
        max_tokens: 350
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || data.error || `Local model returned HTTP ${response.status}.`);
    const answer = data.choices?.[0]?.message?.content;
    if (!answer?.trim()) throw new Error('The model returned an empty reply. Check the llama.cpp terminal for model or chat-template errors.');
    thinking.textContent = answer;
    history.push({ role: 'assistant', content: answer });
    status.innerHTML = '<i></i> LLAMA.CPP READY';
    status.classList.add('online');
  } catch (error) {
    thinking.classList.add('error-bubble');
    thinking.textContent = error.message.includes('Failed to fetch')
      ? 'I cannot reach llama.cpp yet. Start llama-server in your VS Code terminal and open this site at http://127.0.0.1:5500.'
      : error.message;
    history.pop();
    checkServer();
  } finally {
    waiting = false; send.disabled = false; input.focus(); messages.scrollTop = messages.scrollHeight;
  }
}

form.addEventListener('submit', event => { event.preventDefault(); const value = input.value; input.value = ''; input.style.height = 'auto'; ask(value); });
input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 100)}px`; });
input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
document.querySelectorAll('.quick-prompts button').forEach(button => button.addEventListener('click', () => ask(button.dataset.prompt)));
document.querySelector('#play-film').addEventListener('click', event => {
  const screen = document.querySelector('#film-screen');
  const playing = screen.classList.toggle('playing');
  event.currentTarget.textContent = playing ? 'Ⅱ' : '▶';
  event.currentTarget.setAttribute('aria-label', playing ? 'Pause Tempo product film' : 'Play Tempo product film');
});
document.addEventListener('keydown', event => { if (event.key === 'Tab') document.body.classList.add('keyboard-user'); });

const playground = document.createElement('section');
playground.className = 'playground';
playground.id = 'playground';
playground.innerHTML = `
  <div class="playground-head"><div><div class="section-kicker">04 / THE TEMPO PLAYGROUND</div><h2>Try a little<br><em>time for yourself.</em></h2></div><p>Play with the product idea. No signup, no pressure—just a few small experiments in finding your pace.</p></div>
  <div class="play-grid">
    <article class="play-card timer-card"><div class="play-card-top"><span>01 · TRY THE TIMER</span><span class="mini-tag">INTERACTIVE</span></div><h3>Choose a focus window.</h3><p>Turn the dial to set a session, then press start.</p><div class="timer-face"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="timer-track" cx="60" cy="60" r="48"></circle><circle class="timer-progress" id="timer-progress" cx="60" cy="60" r="48"></circle></svg><div class="timer-readout"><strong id="timer-readout">15:00</strong><small id="timer-caption">MINUTES TO YOURSELF</small></div></div><label class="range-label" for="focus-length"><span>SESSION</span><output id="focus-length-output">15 min</output></label><input id="focus-length" type="range" min="5" max="50" step="5" value="15"><div class="timer-controls"><button class="start-timer" id="start-timer">Start session</button><button class="reset-timer" id="reset-timer">Reset</button></div><div class="timer-message" id="timer-message" aria-live="polite">A tiny demo timer. Your real day can wait.</div></article>
    <article class="play-card breathe-card"><div class="play-card-top"><span>02 · TAKE A RESET</span><span class="mini-tag">30 SECONDS</span></div><h3>Follow one easy breath.</h3><p>A short guided breathing break to test the Pebble’s gentle-light idea.</p><div class="breath-stage"><div class="breath-orb" id="breath-orb"><span id="breath-label">Ready?</span></div></div><div class="breath-controls"><button class="start-timer" id="start-breath">Start reset</button><span id="breath-time">00:30</span></div><div class="timer-message" id="breath-message" aria-live="polite">Inhale, pause, exhale. Follow the circle.</div></article>
    <article class="play-card picker-card"><div class="play-card-top"><span>03 · FIND YOUR RITUAL</span><span class="mini-tag">QUICK PICKER</span></div><h3>What would help right now?</h3><p>Choose the closest match. Tempo will suggest a gentle starting point.</p><div class="ritual-options"><button data-ritual="start">I need to get started</button><button data-ritual="focus">I want to stay focused</button><button data-ritual="reset">I need a reset</button></div><div class="ritual-result" id="ritual-result" aria-live="polite">Pick one to get a suggestion.</div><button class="ritual-to-timer" id="ritual-to-timer">Use this session ↗</button></article>
  </div>`;
document.querySelector('#helper').insertAdjacentElement('afterend', playground);
document.querySelector('#reviews .section-kicker').textContent = '05 / NOTES FROM THE DESK';
const pageHub = document.createElement('section');
pageHub.className = 'page-hub';
pageHub.innerHTML = `<div class="page-hub-heading"><div><span>WELCOME TO TEMPO</span><h2>Attention is a<br><em>cycle, not a race.</em></h2></div><p>Tempo stands for a kinder kind of ambition: your time belongs to you. Begin, focus, rest, and return when you’re ready.</p></div><div class="purpose-band"><div class="cycle-wheel" aria-label="Tempo cycle: begin, focus, rest, return"><svg viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="83" fill="none" stroke="#aebca8" stroke-width="1.5" stroke-dasharray="3 5"/><path d="M110 27a83 83 0 0 1 80 62" fill="none" stroke="#718a75" stroke-width="3" stroke-linecap="round"/><path d="m184 83 8 8-11 2" fill="none" stroke="#718a75" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M193 110a83 83 0 0 1-62 80" fill="none" stroke="#718a75" stroke-width="3" stroke-linecap="round"/><path d="m142 183-11 8-1-12" fill="none" stroke="#718a75" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M110 193a83 83 0 0 1-80-62" fill="none" stroke="#718a75" stroke-width="3" stroke-linecap="round"/><path d="m36 137-8-8 11-2" fill="none" stroke="#718a75" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 110a83 83 0 0 1 62-80" fill="none" stroke="#718a75" stroke-width="3" stroke-linecap="round"/><path d="m78 37 11-8 1 12" fill="none" stroke="#718a75" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="cycle-center"><strong>YOUR TIME</strong><span>YOURS AGAIN</span></div><b class="cycle-node node-top">BEGIN</b><b class="cycle-node node-right">FOCUS</b><b class="cycle-node node-bottom">REST</b><b class="cycle-node node-left">RETURN</b></div><div class="purpose-copy"><small>THE TEMPO PROMISE</small><h3>Focus should support a life, not consume it.</h3><p>We believe the best tools help you come back to yourself—then back to the people and things that matter. Tempo’s loop has no finish line. Every pause makes room for a fresh beginning.</p></div></div><div class="page-hub-grid"><a href="product.html"><small>01 / THE PRODUCT</small><strong>Meet the Pebble</strong><span>See what it does <b>↗</b></span></a><a href="experience.html"><small>02 / TRY IT</small><strong>Tempo Playground</strong><span>Explore the experience <b>↗</b></span></a><a href="reviews.html"><small>03 / REVIEWS</small><strong>Concept reviews</strong><span>Read sample stories <b>↗</b></span></a><a href="buy.html" class="hub-shop"><small>04 / SHOP</small><strong>Models & colors</strong><span>Choose your Pebble <b>→</b></span></a><a href="checkout.html"><small>05 / CHECKOUT PREVIEW</small><strong>Review your selection</strong><span>See your concept order <b>↗</b></span></a></div>`;
document.querySelector('.hero').insertAdjacentElement('afterend', pageHub);
const range = document.querySelector('#focus-length');
const timerReadout = document.querySelector('#timer-readout');
const timerProgress = document.querySelector('#timer-progress');
const sessionCaption = document.querySelector('#timer-caption');
const timerMessage = document.querySelector('#timer-message');
let totalSeconds = Number(range.value) * 60;
let remainingSeconds = totalSeconds;
let timerInterval = null;
function formatClock(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
function renderTimer() {
  timerReadout.textContent = formatClock(remainingSeconds);
  timerProgress.style.strokeDashoffset = `${301.6 * (1 - remainingSeconds / totalSeconds)}`;
  document.querySelector('#focus-length-output').textContent = `${range.value} min`;
}
range.addEventListener('input', () => {
  if (timerInterval) return;
  totalSeconds = Number(range.value) * 60; remainingSeconds = totalSeconds;
  sessionCaption.textContent = 'MINUTES TO YOURSELF'; timerMessage.textContent = 'A tiny demo timer. Your real day can wait.'; renderTimer();
});
document.querySelector('#start-timer').addEventListener('click', event => {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; event.currentTarget.textContent = 'Resume session'; sessionCaption.textContent = 'PAUSED'; return; }
  if (remainingSeconds <= 0) { remainingSeconds = totalSeconds; renderTimer(); }
  event.currentTarget.textContent = 'Pause session'; sessionCaption.textContent = 'FOCUS TIME';
  timerInterval = setInterval(() => {
    remainingSeconds = Math.max(0, remainingSeconds - 1); renderTimer();
    if (!remainingSeconds) { clearInterval(timerInterval); timerInterval = null; event.currentTarget.textContent = 'Start again'; sessionCaption.textContent = 'SESSION COMPLETE'; timerMessage.textContent = 'Nice work. Take a breath before the next thing.'; }
  }, 1000);
});
document.querySelector('#reset-timer').addEventListener('click', () => { clearInterval(timerInterval); timerInterval = null; totalSeconds = Number(range.value) * 60; remainingSeconds = totalSeconds; document.querySelector('#start-timer').textContent = 'Start session'; sessionCaption.textContent = 'MINUTES TO YOURSELF'; timerMessage.textContent = 'A tiny demo timer. Your real day can wait.'; renderTimer(); });
renderTimer();

const breathButton = document.querySelector('#start-breath');
let breathInterval = null;
let breathRemaining = 30;
document.querySelector('#start-breath').addEventListener('click', () => {
  if (breathInterval) { clearInterval(breathInterval); breathInterval = null; breathButton.textContent = 'Start reset'; document.querySelector('#breath-label').textContent = 'Paused'; document.querySelector('#breath-orb').classList.remove('breathing'); return; }
  breathRemaining = 30; breathButton.textContent = 'Reset'; document.querySelector('#breath-orb').classList.add('breathing');
  const startedAt = Date.now();
  const phases = [{until:4,label:'Inhale'}, {until:8,label:'Hold'}, {until:14,label:'Exhale'}];
  const updateBreath = () => {
    breathRemaining = Math.max(0, 30 - Math.floor((Date.now() - startedAt) / 1000));
    document.querySelector('#breath-time').textContent = formatClock(breathRemaining);
    const cycle = ((30 - breathRemaining) % 14);
    const phase = phases.find(item => cycle < item.until) || phases[0];
    document.querySelector('#breath-label').textContent = breathRemaining ? phase.label : 'Done';
    if (!breathRemaining) { clearInterval(breathInterval); breathInterval = null; breathButton.textContent = 'Try again'; document.querySelector('#breath-orb').classList.remove('breathing'); document.querySelector('#breath-message').textContent = 'That’s your reset. Take the next thing one step at a time.'; }
  };
  document.querySelector('#breath-message').textContent = 'Breathe at your own pace. Stop whenever you like.';
  updateBreath(); breathInterval = setInterval(updateBreath, 250);
});

const rituals = {
  start: {text:'Try 5 minutes. Pick the smallest visible next step, then let the timer hold the space.', minutes:5},
  focus: {text:'Try 25 minutes. Choose one task and put one distracting tab away before you begin.', minutes:25},
  reset: {text:'Try 10 minutes after a short pause. Get some water, stretch, then come back gently.', minutes:10}
};
let pickedRitual = null;
document.querySelectorAll('[data-ritual]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-ritual]').forEach(item => item.classList.remove('chosen'));
  button.classList.add('chosen'); pickedRitual = rituals[button.dataset.ritual];
  document.querySelector('#ritual-result').textContent = pickedRitual.text;
}));
document.querySelector('#ritual-to-timer').addEventListener('click', () => {
  if (!pickedRitual) { document.querySelector('#ritual-result').textContent = 'Pick one of the three options first.'; return; }
  const minutes = Math.min(50, Math.max(5, Math.round(pickedRitual.minutes / 5) * 5));
  range.value = minutes; range.dispatchEvent(new Event('input')); document.querySelector('#playground').scrollIntoView({behavior:'smooth'});
});
checkServer();
