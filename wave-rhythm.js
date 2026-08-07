const board = document.querySelector('#rhythmBoard');
const lanes = [...document.querySelectorAll('.lane')];
const feedback = document.querySelector('#rhythmFeedback');
const scoreEl = document.querySelector('#rhythmScore');
const comboEl = document.querySelector('#rhythmCombo');
const bestEl = document.querySelector('#rhythmBest');
const hpEl = document.querySelector('#rhythmHp');
const startLayer = document.querySelector('#rhythmStart');
const endLayer = document.querySelector('#rhythmEnd');
const resultEl = document.querySelector('#rhythmResult');
const resultDetail = document.querySelector('#rhythmResultDetail');
const keys = ['d', 'f', 'j', 'k'];
const pattern = [0,1,2,3,1,2,0,3, 0,2,1,3,2,0,1,3, 1,0,2,3,0,1,3,2, 0,2,3,1,0,1,2,3];
const trackSelect = document.querySelector('#rhythmTrack');
const difficultySelect = document.querySelector('#rhythmDifficulty');
const speedModeSelect = document.querySelector('#rhythmSpeedMode');
const movementModeSelect = document.querySelector('#rhythmMovementMode');
const trackInfo = document.querySelector('#rhythmTrackInfo');
const pauseButton = document.querySelector('#rhythmPauseButton');
const restartButton = document.querySelector('#rhythmRestartButton');
const nicknameInput = document.querySelector('#rhythmNickname');
const rankSaveButton = document.querySelector('#rhythmRankSave');
const rankMessage = document.querySelector('#rhythmRankMessage');
const rankingList = document.querySelector('#rhythmRankingList');
const rankingKey = 'oceansignal-wave-rhythm-top10';
const audio = document.querySelector('#rhythmAudio');
const tracks = {
  tide: { name: 'Tide Runner', bpm: 120, url: 'https://cdn.pixabay.com/download/audio/2022/01/27/audio_c1b8597f23.mp3?filename=happy-upbeat-uplifting-hopeful-acoustic-guitar-fun-corporate-music-16504.mp3', credit: 'Pixabay 무료 음원 · 120 BPM' },
  sun: { name: 'Summer Pulse', bpm: 128, url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1a89.mp3', credit: 'Pixabay 무료 음원 · 128 BPM' },
  deep: { name: 'Deep Sea Drift', bpm: 100, url: 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_b9bd4170e4.mp3?filename=ocean-waves-112906.mp3', credit: 'Pixabay 무료 음원 · 100 BPM' },
  coral: { name: 'Coral Pop', bpm: 118, synth: [261.63, 329.63, 392], credit: '오션시그널 오리지널 루프 · 118 BPM' },
  moon: { name: 'Moonlit Current', bpm: 92, synth: [220, 261.63, 329.63], credit: '오션시그널 오리지널 루프 · 92 BPM' },
  aqua: { name: 'Aqua Sprint', bpm: 132, synth: [293.66, 369.99, 440], credit: '오션시그널 오리지널 루프 · 132 BPM' },
  blue: { name: 'Blue Horizon', bpm: 108, synth: [246.94, 311.13, 369.99], credit: '오션시그널 오리지널 루프 · 108 BPM' },
  foam: { name: 'Sea Foam', bpm: 116, synth: [196, 246.94, 293.66], credit: '오션시그널 오리지널 루프 · 116 BPM' },
  neon: { name: 'Neon Harbor', bpm: 126, synth: [329.63, 415.3, 493.88], credit: '오션시그널 오리지널 루프 · 126 BPM' },
  shell: { name: 'Shell Waltz', bpm: 96, synth: [174.61, 220, 261.63], credit: '오션시그널 오리지널 루프 · 96 BPM' },
  reef: { name: 'Reef Runner', bpm: 124, synth: [277.18, 349.23, 415.3], credit: '오션시그널 오리지널 루프 · 124 BPM' },
  dawn: { name: 'Dawn Sail', bpm: 104, synth: [233.08, 293.66, 349.23], credit: '오션시그널 오리지널 루프 · 104 BPM' },
  drift: { name: 'Drift Glass', bpm: 112, synth: [207.65, 261.63, 311.13], credit: '오션시그널 오리지널 루프 · 112 BPM' },
  breeze: { name: 'Breeze Signal', bpm: 122, synth: [311.13, 392, 466.16], credit: '오션시그널 오리지널 루프 · 122 BPM' },
  pearl: { name: 'Pearl Beat', bpm: 110, synth: [293.66, 369.99, 440], credit: '오션시그널 오리지널 루프 · 110 BPM' },
  kelp: { name: 'Kelp Groove', bpm: 114, synth: [196, 246.94, 329.63], credit: '오션시그널 오리지널 루프 · 114 BPM' },
  lagoon: { name: 'Lagoon Lights', bpm: 102, synth: [220, 277.18, 329.63], credit: '오션시그널 오리지널 루프 · 102 BPM' },
  current: { name: 'Current Shift', bpm: 130, synth: [349.23, 440, 523.25], credit: '오션시그널 오리지널 루프 · 130 BPM' },
  starlight: { name: 'Starlight Dive', bpm: 98, synth: [246.94, 293.66, 392], credit: '오션시그널 오리지널 루프 · 98 BPM' },
  harbor: { name: 'Harbor Glow', bpm: 120, synth: [261.63, 311.13, 415.3], credit: '오션시그널 오리지널 루프 · 120 BPM' },
  finale: { name: 'Ocean Finale', bpm: 136, synth: [329.63, 392, 523.25], credit: '오션시그널 오리지널 루프 · 136 BPM' },
  maelstrom: { name: 'Maelstrom Rush · HARD', bpm: 148, synth: [369.99, 440, 554.37], credit: '오션시그널 하드 오리지널 루프 · 148 BPM' },
  typhoon: { name: 'Typhoon Signal · HARD', bpm: 156, synth: [392, 493.88, 587.33], credit: '오션시그널 하드 오리지널 루프 · 156 BPM' },
  abyss: { name: 'Abyss Breaker · HARD', bpm: 164, synth: [329.63, 415.3, 523.25], credit: '오션시그널 하드 오리지널 루프 · 164 BPM' },
};
let synthContext;
let synthTimer;
let synthStep = 0;
let game = null;

function currentTrack() { return tracks[trackSelect?.value] || tracks.tide; }
function currentDifficulty() { return difficultySelect?.value || 'normal'; }
function randomSpeedMode() { return speedModeSelect?.value === 'random'; }
function movementMode() { return movementModeSelect?.value === 'shift'; }
function makeChart(track) {
  const difficulty = currentDifficulty();
  const beat = 60000 / track.bpm;
  if (difficulty === 'easy') return pattern.slice(0, 18).map((lane, index) => ({ lane, at: index * beat * 1.2 }));
  if (difficulty === 'hard') return pattern.concat(pattern.slice(4, 24).map(lane => (lane + 1) % 4)).map((lane, index) => ({ lane, at: index * beat * .72 }));
  if (difficulty === 'veryhard') return pattern.flatMap((lane, index) => {
    const at = index * beat * .58;
    if (index % 5 === 4) return [0, 1, 2, 3].map(laneIndex => ({ lane: laneIndex, at }));
    return [{ lane, at }, ...(index % 3 === 1 ? [{ lane: (lane + 2) % 4, at }] : [])];
  });
  if (difficulty === 'storm') return pattern.concat(pattern.map((lane, index) => (lane + index + 1) % 4), pattern.slice(0, 20)).map((lane, index) => ({ lane, at: index * beat * .52 }));
  if (difficulty === 'impossible') return pattern.concat(pattern, pattern, pattern.slice(0, 24)).flatMap((lane, index) => {
    const at = index * beat * .34;
    if (index % 4 === 3) return [0, 1, 2, 3].map(laneIndex => ({ lane: laneIndex, at }));
    return [{ lane, at }, { lane: (lane + (index % 2 ? 1 : 3)) % 4, at }];
  });
  return pattern.map((lane, index) => ({ lane, at: index * beat }));
}
function setTrack() {
  const track = currentTrack();
  if (track.url) { audio.src = track.url; audio.load(); }
  else { audio.pause(); audio.removeAttribute('src'); audio.load(); }
  if (trackInfo) trackInfo.textContent = `${track.credit} · 곡 변경 후 시작하세요`;
}

function tone(frequency, when, duration, volume, type = 'sine') {
  const oscillator = synthContext.createOscillator();
  const gain = synthContext.createGain();
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, when);
  gain.gain.setValueAtTime(.0001, when); gain.gain.exponentialRampToValueAtTime(volume, when + .012); gain.gain.exponentialRampToValueAtTime(.0001, when + duration);
  oscillator.connect(gain).connect(synthContext.destination); oscillator.start(when); oscillator.stop(when + duration + .03);
}
function playHitSound(grade) {
  synthContext = synthContext || new (window.AudioContext || window.webkitAudioContext)();
  synthContext.resume();
  const now = synthContext.currentTime;
  if (grade === 'miss') { tone(140, now, .14, .055, 'sawtooth'); return; }
  tone(grade === 'perfect' ? 880 : 660, now, .12, .07, 'sine');
  tone(grade === 'perfect' ? 1320 : 990, now + .035, .13, .038, 'triangle');
}
function burst(laneIndex, grade) {
  const effect = document.createElement('span');
  effect.className = `rhythm-burst ${grade === 'good' ? 'good' : ''}`;
  lanes[laneIndex].append(effect);
  setTimeout(() => effect.remove(), 500);
}
function startSyntheticTrack(track) {
  clearInterval(synthTimer);
  synthContext = synthContext || new (window.AudioContext || window.webkitAudioContext)();
  synthContext.resume();
  const beatMs = 60000 / track.bpm;
  synthStep = 0;
  const playBeat = () => {
    const now = synthContext.currentTime;
    const note = track.synth[synthStep % track.synth.length];
    tone(62, now, .09, .16, 'sine');
    if (synthStep % 2 === 0) tone(note, now, .24, .055, 'triangle');
    if (synthStep % 4 === 2) tone(note * 2, now + .04, .13, .035, 'sine');
    synthStep++;
  };
  playBeat(); synthTimer = setInterval(playBeat, beatMs);
}
function stopTrack() { audio.pause(); clearInterval(synthTimer); }
function loadRankings() { try { return JSON.parse(localStorage.getItem(rankingKey) || '[]'); } catch { return []; } }
function saveRankings(entries) { localStorage.setItem(rankingKey, JSON.stringify(entries)); }
function escapeRankText(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
function formatScore(score) { return score < 0 ? `-${String(Math.abs(score)).padStart(5, '0')}` : String(score).padStart(6, '0'); }
function renderRankings() {
  if (!rankingList) return;
  const entries = loadRankings();
  rankingList.innerHTML = entries.length ? entries.map(entry => `<li><span>${escapeRankText(entry.name)}</span><b>${formatScore(entry.score)}</b></li>`).join('') : '<li><span>기록을 기다리고 있어요</span><b>000000</b></li>';
}
function isTopTen(score) { const entries = loadRankings(); return score > 0 && (entries.length < 10 || score > entries.at(-1).score); }
function updateRankEntry() {
  const qualifies = isTopTen(game.score);
  if (rankSaveButton) rankSaveButton.disabled = !qualifies;
  if (nicknameInput) nicknameInput.disabled = !qualifies;
  if (rankMessage) rankMessage.textContent = qualifies ? 'TOP 10 진입! 닉네임을 입력해 기록하세요.' : '이번 기록은 TOP 10 밖이에요.';
}
function recordRank() {
  if (!isTopTen(game.score)) return;
  const name = nicknameInput?.value.trim() || '파도탐험가';
  const entries = loadRankings();
  entries.push({ name: name.slice(0, 10), score: game.score });
  entries.sort((a, b) => b.score - a.score);
  saveRankings(entries.slice(0, 10)); renderRankings();
  if (rankSaveButton) rankSaveButton.disabled = true;
  if (nicknameInput) nicknameInput.disabled = true;
  if (rankMessage) rankMessage.textContent = 'TOP 10 기록을 저장했어요!';
}

function makeGame() {
  return { running: false, paused: false, pausedAt: 0, score: 0, combo: 0, best: 0, hp: 1000, hits: 0, perfects: 0, goods: 0, start: 0, notes: [], raf: 0 };
}
function updateStats() {
  scoreEl.textContent = formatScore(game.score);
  comboEl.textContent = game.combo;
  bestEl.textContent = game.best;
  hpEl.textContent = game.hp;
}
function loseHp() {
  game.hp = Math.max(0, game.hp - 50); game.combo = 0; updateStats();
  if (game.hp === 0) endGame('hp');
}
function flash(text, grade) {
  feedback.textContent = text;
  feedback.className = `rhythm-feedback ${grade}`;
  clearTimeout(flash.timer);
  flash.timer = setTimeout(() => { feedback.textContent = ''; feedback.className = 'rhythm-feedback'; }, 480);
}
function spawn(note) {
  const el = document.createElement('i');
  el.className = `rhythm-note lane-${note.lane}${note.isTrash ? ' trash-note' : ''}`;
  el.innerHTML = '<b></b>';
  lanes[note.lane].append(el);
  note.el = el;
}
function lanePosition(note, elapsed) {
  if (note.targetLane === note.lane) return note.lane;
  const travel = Math.max(0, Math.min(1, 1 - (note.at - elapsed) / note.travelMs));
  const smoothTravel = travel * travel * (3 - 2 * travel);
  return note.lane + (note.targetLane - note.lane) * smoothTravel;
}
function activeLane(note, elapsed) { return Math.round(lanePosition(note, elapsed)); }
function startGame() {
  cancelAnimationFrame(game?.raf);
  game = makeGame();
  game.running = true;
  game.start = performance.now() + 750;
  const track = currentTrack();
  const beat = 60000 / track.bpm;
  game.notes = makeChart(track).map((note, index) => {
    const direction = [1, -1, 2, -2][index % 4];
    const shiftedLane = Math.max(0, Math.min(3, note.lane + direction));
    const travelMs = randomSpeedMode() ? 980 + Math.floor(Math.random() * 1150) : 1700;
    return { ...note, targetLane: movementMode() ? shiftedLane : note.lane, travelMs, isTrash: index % 4 === 2 || index % 4 === 3, hit: false, missed: false, el: null };
  });
  startLayer.hidden = true; startLayer.style.display = 'none';
  endLayer.hidden = true; endLayer.style.display = 'none';
  if (pauseButton) { pauseButton.disabled = false; pauseButton.textContent = '일시정지'; }
  lanes.forEach(lane => lane.replaceChildren()); updateStats(); flash('GO!', 'perfect');
  audio.currentTime = 0;
  audio.volume = .48;
  if (track.url) audio.play().catch(() => { if (trackInfo) trackInfo.textContent = '음원 연결을 확인해 주세요 · 게임은 계속 진행됩니다'; });
  else startSyntheticTrack(track);
  game.raf = requestAnimationFrame(tick);
}
function endGame(reason) {
  if (!game?.running) return;
  game.running = false;
  stopTrack();
  if (pauseButton) { pauseButton.disabled = true; pauseButton.textContent = '일시정지'; }
  const totalTiles = game.notes.filter(note => !note.isTrash).length;
  const accuracy = totalTiles ? Math.round(game.hits / totalTiles * 100) : 0;
  resultEl.textContent = reason === 'hp' ? 'HP가 모두 소진됐어요!' : accuracy >= 90 ? '파도와 완벽하게 하나가 됐어요!' : accuracy >= 70 ? '파도의 리듬을 아주 잘 탔어요!' : accuracy >= 45 ? '좋은 흐름이에요. 조금만 더 도전해 봐요!' : game.hits ? '다음 파도에서는 더 많이 맞춰 봐요!' : '파도 블록을 수면선에서 눌러 보세요!';
  resultDetail.textContent = `맞춘 타일 ${game.hits}/${totalTiles} · 정확도 ${accuracy}% · 최고 콤보 ${game.best} · 남은 HP ${game.hp}`;
  updateRankEntry();
  endLayer.hidden = false;
  endLayer.style.display = 'grid';
}
function togglePause() {
  if (!game?.running) return;
  const track = currentTrack();
  if (!game.paused) {
    game.paused = true; game.pausedAt = performance.now(); cancelAnimationFrame(game.raf);
    if (track.url) audio.pause(); else clearInterval(synthTimer);
    if (pauseButton) pauseButton.textContent = '계속하기';
    flash('PAUSED', 'good');
    return;
  }
  game.start += performance.now() - game.pausedAt;
  game.paused = false;
  if (track.url) audio.play().catch(() => {}); else startSyntheticTrack(track);
  if (pauseButton) pauseButton.textContent = '일시정지';
  flash('GO!', 'perfect'); game.raf = requestAnimationFrame(tick);
}
function tick(now) {
  if (!game?.running || game.paused) return;
  const elapsed = now - game.start;
  let remaining = 0;
  game.notes.forEach(note => {
    const delta = note.at - elapsed;
    if (delta < note.travelMs && !note.el && !note.hit && !note.missed) spawn(note);
    if (!note.hit && !note.missed) remaining++;
    if (note.el && !note.hit && !note.missed) {
      const progress = 1 - Math.max(-0.12, Math.min(1.16, delta / note.travelMs));
      const laneWidth = board.querySelector('.rhythm-lanes').clientWidth / 4;
      const horizontal = (lanePosition(note, elapsed) - note.lane) * laneWidth;
      note.el.style.transform = `translate(${horizontal}px, ${progress * board.clientHeight * .83}px)`;
      if (delta < -180) { note.missed = true; note.el.remove(); if (!note.isTrash) { loseHp(); flash('MISS · HP -50', 'miss'); } }
    }
  });
  const finishAt = game.notes.at(-1)?.at || 0;
  if (elapsed > finishAt + 1900 || remaining === 0 && elapsed > finishAt) return endGame();
  game.raf = requestAnimationFrame(tick);
}
function hit(laneIndex) {
  if (!game?.running || game.paused) return;
  const now = performance.now() - game.start;
  const candidates = game.notes.filter(note => activeLane(note, now) === laneIndex && !note.hit && !note.missed);
  const note = candidates.sort((a,b) => Math.abs(a.at-now)-Math.abs(b.at-now))[0];
  const distance = note ? Math.abs(note.at - now) : Infinity;
  const grade = distance < 95 ? 'perfect' : distance < 185 ? 'good' : '';
  lanes[laneIndex].classList.add('pressed'); setTimeout(() => lanes[laneIndex].classList.remove('pressed'), 100);
  if (!grade) { loseHp(); flash('MISS · HP -50', 'miss'); playHitSound('miss'); return; }
  if (note.isTrash) {
    note.hit = true; note.el?.remove(); game.score -= 5000; loseHp();
    updateStats(); flash('TRASH -5000 · HP -50', 'miss'); playHitSound('miss'); return;
  }
  note.hit = true; note.el?.remove(); game.combo++; game.best = Math.max(game.best, game.combo);
  game.hits++; if (grade === 'perfect') game.perfects++; else game.goods++;
  game.score += grade === 'perfect' ? 220 + game.combo * 4 : 110 + game.combo * 2;
  updateStats(); flash(grade === 'perfect' ? 'PERFECT!' : 'GOOD', grade); playHitSound(grade); burst(laneIndex, grade);
}
document.querySelector('#rhythmStartButton').addEventListener('click', startGame);
document.querySelector('#rhythmRetryButton').addEventListener('click', startGame);
pauseButton?.addEventListener('click', togglePause);
restartButton?.addEventListener('click', startGame);
rankSaveButton?.addEventListener('click', recordRank);
document.querySelectorAll('[data-lane-button]').forEach(button => button.addEventListener('pointerdown', () => hit(Number(button.dataset.laneButton))));
window.addEventListener('keydown', event => { const lane = keys.indexOf(event.key.toLowerCase()); if (lane >= 0) { event.preventDefault(); hit(lane); } });
if (trackSelect) trackSelect.innerHTML = Object.entries(tracks).map(([key, track], index) => `<option value="${key}">${String(index + 1).padStart(2, '0')}. ${track.name} · ${track.bpm} BPM</option>`).join('');
trackSelect?.addEventListener('change', setTrack);
difficultySelect?.addEventListener('change', () => { const labels = { easy: '쉬움 · 노트가 넓게 내려옵니다', normal: '보통 · 기본 리듬입니다', hard: '어려움 · 빠른 물결이 이어집니다', veryhard: '매우 어려움 · 4개 레인이 함께 내려옵니다', storm: '폭풍 · 가장 촘촘한 리듬입니다', impossible: '불가능 · 연속 동시 파도를 견뎌 보세요' }; if (trackInfo) trackInfo.textContent = labels[currentDifficulty()]; });
function updateModeInfo() { if (trackInfo) trackInfo.textContent = `${randomSpeedMode() ? '랜덤 속도' : '일정 속도'} · 기본 규칙: 타일 2개 뒤 쓰레기 2개(-5000점) · ${movementMode() ? '레인 이동' : '직선 낙하'}`; }
speedModeSelect?.addEventListener('change', updateModeInfo);
movementModeSelect?.addEventListener('change', updateModeInfo);
audio.addEventListener('error', () => { if (trackInfo) trackInfo.textContent = '음원 연결을 확인해 주세요 · 게임은 계속 진행됩니다'; });
game = makeGame();
renderRankings();
endLayer.style.display = 'none';
setTrack();
updateStats();
