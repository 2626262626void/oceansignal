const board = document.querySelector('#rhythmBoard');
const lanes = [...document.querySelectorAll('.lane')];
const feedback = document.querySelector('#rhythmFeedback');
const scoreEl = document.querySelector('#rhythmScore');
const comboEl = document.querySelector('#rhythmCombo');
const bestEl = document.querySelector('#rhythmBest');
const startLayer = document.querySelector('#rhythmStart');
const endLayer = document.querySelector('#rhythmEnd');
const resultEl = document.querySelector('#rhythmResult');
const resultDetail = document.querySelector('#rhythmResultDetail');
const keys = ['d', 'f', 'j', 'k'];
const pattern = [0,1,2,3,1,2,0,3, 0,2,1,3,2,0,1,3, 1,0,2,3,0,1,3,2, 0,2,3,1,0,1,2,3];
let game = null;

function makeGame() {
  return { running: false, score: 0, combo: 0, best: 0, start: 0, notes: [], raf: 0 };
}
function updateStats() {
  scoreEl.textContent = String(game.score).padStart(6, '0');
  comboEl.textContent = game.combo;
  bestEl.textContent = game.best;
}
function flash(text, grade) {
  feedback.textContent = text;
  feedback.className = `rhythm-feedback ${grade}`;
  clearTimeout(flash.timer);
  flash.timer = setTimeout(() => { feedback.textContent = ''; feedback.className = 'rhythm-feedback'; }, 480);
}
function spawn(note) {
  const el = document.createElement('i');
  el.className = `rhythm-note lane-${note.lane}`;
  el.innerHTML = '<b></b>';
  lanes[note.lane].append(el);
  note.el = el;
}
function startGame() {
  cancelAnimationFrame(game?.raf);
  game = makeGame();
  game.running = true;
  game.start = performance.now() + 750;
  game.notes = pattern.map((lane, index) => ({ lane, at: index * 540, hit: false, missed: false, el: null }));
  startLayer.hidden = true; startLayer.style.display = 'none';
  endLayer.hidden = true; endLayer.style.display = 'none';
  lanes.forEach(lane => lane.replaceChildren()); updateStats(); flash('GO!', 'perfect');
  game.raf = requestAnimationFrame(tick);
}
function endGame() {
  game.running = false;
  const perfect = game.score >= 5000;
  resultEl.textContent = perfect ? '파도와 완벽하게 맞췄어요!' : game.score >= 2500 ? '좋은 리듬이에요!' : '다음 파도를 기다려요!';
  resultDetail.textContent = `최종 점수 ${game.score.toLocaleString()} · 최고 콤보 ${game.best}`;
  endLayer.hidden = false;
  endLayer.style.display = 'grid';
}
function tick(now) {
  if (!game?.running) return;
  const elapsed = now - game.start;
  let remaining = 0;
  game.notes.forEach(note => {
    const delta = note.at - elapsed;
    if (delta < 1700 && !note.el && !note.hit && !note.missed) spawn(note);
    if (!note.hit && !note.missed) remaining++;
    if (note.el && !note.hit && !note.missed) {
      const progress = 1 - Math.max(-0.12, Math.min(1.16, delta / 1700));
      note.el.style.transform = `translateY(${progress * board.clientHeight * .83}px) rotate(${progress * 180}deg)`;
      if (delta < -180) { note.missed = true; note.el.remove(); game.combo = 0; updateStats(); flash('MISS', 'miss'); }
    }
  });
  if (elapsed > pattern.length * 540 + 1900 || remaining === 0 && elapsed > pattern.length * 540) return endGame();
  game.raf = requestAnimationFrame(tick);
}
function hit(laneIndex) {
  if (!game?.running) return;
  const now = performance.now() - game.start;
  const candidates = game.notes.filter(note => note.lane === laneIndex && !note.hit && !note.missed);
  const note = candidates.sort((a,b) => Math.abs(a.at-now)-Math.abs(b.at-now))[0];
  const distance = note ? Math.abs(note.at - now) : Infinity;
  const grade = distance < 95 ? 'perfect' : distance < 185 ? 'good' : '';
  lanes[laneIndex].classList.add('pressed'); setTimeout(() => lanes[laneIndex].classList.remove('pressed'), 100);
  if (!grade) { game.combo = 0; updateStats(); flash('MISS', 'miss'); return; }
  note.hit = true; note.el?.remove(); game.combo++; game.best = Math.max(game.best, game.combo);
  game.score += grade === 'perfect' ? 220 + game.combo * 4 : 110 + game.combo * 2;
  updateStats(); flash(grade === 'perfect' ? 'PERFECT!' : 'GOOD', grade);
}
document.querySelector('#rhythmStartButton').addEventListener('click', startGame);
document.querySelector('#rhythmRetryButton').addEventListener('click', startGame);
document.querySelectorAll('[data-lane-button]').forEach(button => button.addEventListener('pointerdown', () => hit(Number(button.dataset.laneButton))));
window.addEventListener('keydown', event => { const lane = keys.indexOf(event.key.toLowerCase()); if (lane >= 0) { event.preventDefault(); hit(lane); } });
game = makeGame();
endLayer.style.display = 'none';
updateStats();
