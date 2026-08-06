const fileInput = document.querySelector('#fileInput');
const dropZone = document.querySelector('#dropZone');
const previewVisual = document.querySelector('#previewVisual');
const scanState = document.querySelector('#scanState');
const dropMessage = document.querySelector('#dropMessage');
const sampleButton = document.querySelector('#sampleButton');
const detectedCount = document.querySelector('#detectedCount');
const confidence = document.querySelector('#confidence');
const analysisBadge = document.querySelector('#analysisBadge');

function analyze(file) {
  scanState.textContent = 'ANALYZING';
  analysisBadge.textContent = 'SCANNING';
  dropMessage.textContent = `${file.name || '샘플 이미지'} 분석 중...`;
  setTimeout(() => {
    scanState.textContent = 'COMPLETE';
    analysisBadge.textContent = 'ANALYZED';
    detectedCount.textContent = '17';
    confidence.textContent = '94.2%';
    dropMessage.textContent = '분석 완료 · 오염 유형과 규모를 확인하세요.';
  }, 900);
  if (file?.type?.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      previewVisual.style.backgroundImage = `linear-gradient(180deg, #0a3f4a55, #062a3b99), url(${event.target.result})`;
      previewVisual.style.backgroundSize = 'cover';
      previewVisual.style.backgroundPosition = 'center';
    };
    reader.readAsDataURL(file);
  }
}

fileInput.addEventListener('change', () => fileInput.files[0] && analyze(fileInput.files[0]));
['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add('dragover'); }));
['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove('dragover'); }));
dropZone.addEventListener('drop', (event) => event.dataTransfer.files[0] && analyze(event.dataTransfer.files[0]));
sampleButton.addEventListener('click', () => analyze({ name: 'ocean-sample-beach.jpg', type: 'image/jpeg' }));

const careFileInput = document.querySelector('#careFileInput');
const careSampleButton = document.querySelector('#careSampleButton');
const careState = document.querySelector('#careState');
const careSignal = document.querySelector('#careSignal');
const careRisk = document.querySelector('#careRisk');
const carePreview = document.querySelector('#carePreview');
const careDropZone = document.querySelector('#careDropZone');

function analyzeCare(file) {
  careState.textContent = 'ANALYZING';
  careSignal.textContent = '위험 신호 확인 중…';
  careRisk.textContent = 'CHECKING · 전문가 확인 권장';
  careRisk.className = 'care-risk';
  window.setTimeout(() => {
    careState.textContent = 'GUIDE READY';
    careSignal.textContent = '표면성 찰과상 의심';
    careRisk.textContent = 'LOW · 초기 처치 확인';
    careRisk.className = 'care-risk low';
  }, 800);
  if (file?.type?.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      carePreview.style.backgroundImage = `linear-gradient(180deg, #062a3b33, #062a3b99), url(${event.target.result})`;
      carePreview.style.backgroundSize = 'cover';
      carePreview.style.backgroundPosition = 'center';
      carePreview.querySelector('span').textContent = '';
      carePreview.querySelector('small').textContent = file.name || 'uploaded-image';
    };
    reader.readAsDataURL(file);
  }
}

careFileInput.addEventListener('change', () => careFileInput.files[0] && analyzeCare(careFileInput.files[0]));
careSampleButton.addEventListener('click', () => analyzeCare({ name: 'rock-scratch-sample.jpg', type: 'image/jpeg' }));
['dragenter', 'dragover'].forEach((name) => careDropZone.addEventListener(name, (event) => { event.preventDefault(); careDropZone.classList.add('dragover'); }));
['dragleave', 'drop'].forEach((name) => careDropZone.addEventListener(name, (event) => { event.preventDefault(); careDropZone.classList.remove('dragover'); }));
careDropZone.addEventListener('drop', (event) => event.dataTransfer.files[0] && analyzeCare(event.dataTransfer.files[0]));

const reportFileInput = document.querySelector('#reportFileInput');
const reportSampleButton = document.querySelector('#reportSampleButton');
const reportPreview = document.querySelector('#reportPreview');
const reportState = document.querySelector('#reportState');
const gpsButton = document.querySelector('#gpsButton');
const gpsValue = document.querySelector('#gpsValue');
const reportButton = document.querySelector('#reportButton');
const reportMessage = document.querySelector('#reportMessage');

function updateReport(file) {
  reportState.textContent = 'ANALYZING';
  reportMessage.textContent = `${file.name || '현장 이미지'} 분석 중…`;
  if (file?.type?.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      reportPreview.style.backgroundImage = `linear-gradient(180deg, #062a3b22, #062a3b99), url(${event.target.result})`;
      reportPreview.style.backgroundSize = 'cover';
      reportPreview.style.backgroundPosition = 'center';
      reportPreview.querySelector('span').textContent = '';
      reportPreview.querySelector('small').textContent = file.name || 'field-image';
    };
    reader.readAsDataURL(file);
  }
  window.setTimeout(() => {
    reportState.textContent = 'LIVE SNAPSHOT';
    document.querySelector('#litterValue').textContent = '32';
    document.querySelector('#surfaceValue').textContent = '24';
    document.querySelector('#windValue').textContent = 'NE 4.8 m/s';
    document.querySelector('#waveValue').textContent = '0.7 m';
    document.querySelector('#climateValue').textContent = '맑음 · 해상 양호';
    document.querySelector('#updatedValue').textContent = `마지막 분석 ${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    document.querySelector('#goValue').textContent = '주의해서 가능';
    document.querySelector('#goReason').textContent = '파고는 양호하지만 오염 지수가 확인되었습니다.';
    document.querySelector('#goCard').className = 'go-card caution';
    reportMessage.textContent = '오염 수치와 환경 데이터가 준비되었습니다. 좌표를 확인하세요.';
  }, 900);
}

reportFileInput.addEventListener('change', () => reportFileInput.files[0] && updateReport(reportFileInput.files[0]));
reportSampleButton.addEventListener('click', () => updateReport({ name: 'ocean-condition-sample.jpg', type: 'image/jpeg' }));
gpsButton.addEventListener('click', () => {
  gpsValue.textContent = '좌표 확인 중…';
  if (!navigator.geolocation) {
    gpsValue.textContent = '브라우저 위치 기능 미지원';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => { gpsValue.textContent = `${position.coords.latitude.toFixed(4)}° N, ${position.coords.longitude.toFixed(4)}° E`; reportMessage.textContent = 'GPS 좌표가 기록되었습니다. 신고 데이터를 만들 수 있습니다.'; },
    () => { gpsValue.textContent = '위치 권한을 허용해 주세요'; },
    { enableHighAccuracy: true, timeout: 7000 }
  );
});
reportButton.addEventListener('click', () => {
  reportMessage.textContent = '신고용 데이터가 생성되었습니다 · 사진·좌표·환경 수치 확인 완료';
  reportButton.classList.add('sent');
  reportButton.querySelector('span').textContent = '✓';
});

const kmaApiKey = document.querySelector('#kmaApiKey');
const kmaFetchButton = document.querySelector('#kmaFetchButton');
const kmaStatus = document.querySelector('#kmaStatus');
const kmaEndpoint = 'https://apihub.kma.go.kr/api/typ01/url/kma_buoy.php';

function directionLabel(degree) {
  const labels = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  return `${labels[Math.round(Number(degree) / 45) % 8]} ${Math.round(Number(degree))}°`;
}

function applyKmaObservation(data) {
  const windDirection = data.WD1 || data.WD2 || data.WD || '--';
  const windSpeed = data.WS1 || data.WS2 || data.WS || '--';
  const waveHeight = data.WH_SIG || data.WH || '--';
  document.querySelector('#windValue').textContent = windDirection === '--' ? '--' : `${directionLabel(windDirection)} · ${windSpeed} m/s`;
  document.querySelector('#waveValue').textContent = waveHeight === '--' ? '--' : `${waveHeight} m`;
  if (data.TW) document.querySelector('#climateValue').textContent = `해수면 ${data.TW}°C · 해양관측`;
  document.querySelector('#updatedValue').textContent = data.TM ? `기상청 관측 ${data.TM}` : '기상청 최신 관측';
  document.querySelector('#goValue').textContent = Number(waveHeight) > 1.5 || Number(windSpeed) > 10 ? '바다 활동 자제' : '주의해서 가능';
  document.querySelector('#goReason').textContent = Number(waveHeight) > 1.5 ? '유의파고가 높아 출항 전 추가 확인이 필요합니다.' : '기상청 해양관측값 기준으로 추가 안전 확인 후 이용하세요.';
  document.querySelector('#goCard').className = Number(waveHeight) > 1.5 ? 'go-card danger' : 'go-card caution';
}

function parseKmaBuoy(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const headerIndex = lines.findIndex((line) => line.replace(/^#+\s*/, '').split(/\s+/).includes('WH_SIG'));
  if (headerIndex < 0) throw new Error('기상청 응답 형식을 확인할 수 없습니다.');
  const headers = lines[headerIndex].replace(/^#+\s*/, '').split(/\s+/);
  const row = lines.slice(headerIndex + 1).find((line) => !line.startsWith('#') && /\d{8}/.test(line));
  if (!row) throw new Error('현재 관측값이 없습니다.');
  const values = row.split(/\s+/);
  return headers.reduce((result, key, index) => ({ ...result, [key]: values[index] }), {});
}

async function loadKmaObservation() {
  const authKey = kmaApiKey.value.trim();
  if (!authKey) {
    kmaStatus.textContent = 'API 키 미입력 · 샘플 값 표시 중';
    return;
  }
  kmaStatus.textContent = '기상청 API 요청 중…';
  reportState.textContent = 'KMA API';
  const params = new URLSearchParams({ tm: '', stn: '0', help: '1', authKey });
  try {
    const response = await fetch(`${kmaEndpoint}?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = parseKmaBuoy(await response.text());
    applyKmaObservation(data);
    reportState.textContent = 'KMA LIVE';
    kmaStatus.textContent = '기상청 해양기상부이 관측값 반영 완료';
  } catch (error) {
    reportState.textContent = 'API ERROR';
    kmaStatus.textContent = `연결 실패 · ${error.message}`;
  }
}

kmaFetchButton.addEventListener('click', loadKmaObservation);
