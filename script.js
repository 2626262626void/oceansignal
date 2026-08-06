const $ = (selector) => document.querySelector(selector);

const state = {
  oceanFile: null,
  oceanDataUrl: null,
  lastAnalysis: null,
  coords: null,
  conditionTimer: null,
};

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

async function prepareImage(file) {
  const source = await fileToDataUrl(file);
  const image = new Image();
  image.src = source;
  await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; });
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.86);
}

function showImage(selector, dataUrl, label) {
  const element = $(selector);
  if (!element || !dataUrl) return;
  element.style.backgroundImage = `linear-gradient(180deg, #0a3f4a22, #062a3b99), url(${dataUrl})`;
  element.style.backgroundSize = 'cover';
  element.style.backgroundPosition = 'center';
  const small = element.querySelector('small');
  const icon = element.querySelector('span');
  if (icon) icon.textContent = '';
  if (small) small.textContent = label || 'uploaded-image';
}

function setOceanFile(file) {
  if (!file?.type?.startsWith('image/')) return;
  state.oceanFile = file;
  $('#dropMessage').textContent = `${file.name} · 이미지를 준비했습니다.`;
  $('#scanState').textContent = 'IMAGE READY';
  prepareImage(file).then((dataUrl) => {
    state.oceanDataUrl = dataUrl;
    showImage('#previewVisual', dataUrl, file.name);
  }).catch(() => { $('#aiStatus').textContent = '이미지를 읽지 못했습니다. 다른 파일을 선택해 주세요.'; });
}

function setDemoResult() {
  $('#scanState').textContent = 'DEMO COMPLETE';
  $('#analysisBadge').textContent = 'DEMO';
  $('#detectedCount').textContent = '17';
  $('#confidence').textContent = '94.2%';
  $('#dropMessage').textContent = '샘플 분석 완료 · 실제 AI 분석은 API 키를 입력하세요.';
}

function renderAiResult(result) {
  const objects = Array.isArray(result.objects) ? result.objects : [];
  const litterCount = Number(result.litter_count);
  const risk = Math.max(0, Math.min(100, Number(result.pollution_risk ?? result.water_risk ?? 0)));
  const confidence = Math.max(0, Math.min(100, Number(result.confidence ?? 0)));
  $('#scanState').textContent = 'AI COMPLETE';
  $('#analysisBadge').textContent = 'AI ANALYZED';
  $('#detectedCount').textContent = Number.isFinite(litterCount) ? `${litterCount}` : `${objects.length}`;
  $('#confidence').textContent = `${confidence.toFixed(1)}%`;
  $('#dropMessage').textContent = `${result.summary || 'AI 분석 완료'} ${result.pollution_type ? `· ${result.pollution_type}` : ''}`;
  $('#aiStatus').textContent = `${result.safety_advice || '현장 안전수칙을 확인하세요.'} · 근거: ${result.evidence || '이미지 시각 신호'}`;
  const preview = $('#previewVisual');
  if (preview) preview.dataset.aiSummary = JSON.stringify({ ...result, objects });
  state.lastAnalysis = result;
  return risk;
}

const analysisSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    litter_count: { type: 'number' },
    objects: { type: 'array', items: { type: 'string' } },
    pollution_type: { type: 'string' },
    pollution_risk: { type: 'number' },
    water_risk: { type: 'number' },
    confidence: { type: 'number' },
    evidence: { type: 'string' },
    safety_advice: { type: 'string' },
  },
  required: ['summary', 'litter_count', 'objects', 'pollution_type', 'pollution_risk', 'water_risk', 'confidence', 'evidence', 'safety_advice'],
};

async function analyzeWithOpenAI() {
  const apiKey = $('#aiApiKey').value.trim();
  if (!state.oceanDataUrl) { $('#aiStatus').textContent = '먼저 분석할 이미지를 선택해 주세요.'; return; }
  if (!apiKey.startsWith('sk-')) { $('#aiStatus').textContent = 'OpenAI API 키를 입력해 주세요. 키는 저장되지 않습니다.'; $('#aiApiKey').focus(); return; }
  const button = $('#aiAnalyzeButton');
  button.disabled = true;
  $('#scanState').textContent = 'AI ANALYZING';
  $('#analysisBadge').textContent = 'SCANNING';
  $('#aiStatus').textContent = 'AI가 해양 쓰레기와 표면 오염 신호를 분석하고 있습니다...';
  const prompt = `당신은 해양 환경 이미지 분석 전문가입니다. 이 사진을 보수적으로 판독하세요.\n+1) 플라스틱, 스티로폼, 폐어구, 금속, 유리, 목재 등 보이는 쓰레기만 세고, 사진 밖의 개수는 추정하지 마세요.\n+2) 기름막, 적조, 변색, 거품, 탁도 등 수면 위험 신호를 구분하세요.\n+3) 이미지에 해양 장면이 없거나 불확실하면 litter_count는 0 또는 관찰 가능한 수로, confidence는 낮게 작성하세요.\n+4) 진단·법적 판단은 하지 말고, 현장 안전을 우선한 짧은 권고를 작성하세요. 모든 숫자는 0~100 범위의 정수 또는 소수로 반환하세요.`;
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: $('#aiModel').value,
        input: [{ role: 'user', content: [
          { type: 'input_text', text: prompt },
          { type: 'input_image', image_url: state.oceanDataUrl, detail: 'high' },
        ] }],
        max_output_tokens: 900,
        text: { format: { type: 'json_schema', name: 'ocean_signal_analysis', strict: true, schema: analysisSchema } },
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message || `API 오류 ${response.status}`);
    const text = payload.output_text || payload.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text;
    if (!text) throw new Error('AI가 분석 결과를 반환하지 않았습니다.');
    renderAiResult(JSON.parse(text.replace(/^```json\s*|\s*```$/g, '')));
  } catch (error) {
    $('#scanState').textContent = 'AI ERROR';
    $('#analysisBadge').textContent = 'RETRY';
    $('#aiStatus').textContent = `분석 실패 · ${error.message}`;
  } finally { button.disabled = false; }
}

const fileInput = $('#fileInput');
fileInput.addEventListener('change', () => setOceanFile(fileInput.files[0]));
$('#sampleButton').addEventListener('click', setDemoResult);
$('#aiAnalyzeButton').addEventListener('click', analyzeWithOpenAI);
const dropZone = $('#dropZone');
['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add('dragover'); }));
['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove('dragover'); }));
dropZone.addEventListener('drop', (event) => setOceanFile(event.dataTransfer.files[0]));

function setupLocalImageFlow(inputSelector, previewSelector, stateSelector, sampleSelector, sampleName, doneLabel) {
  const input = $(inputSelector);
  const preview = $(previewSelector);
  const status = $(stateSelector);
  const setFile = (file) => {
    if (!file?.type?.startsWith('image/')) return;
    status.textContent = 'IMAGE READY';
    prepareImage(file).then((dataUrl) => showImage(previewSelector, dataUrl, file.name));
  };
  input?.addEventListener('change', () => setFile(input.files[0]));
  $(sampleSelector)?.addEventListener('click', () => { status.textContent = doneLabel; });
  return setFile;
}

setupLocalImageFlow('#careFileInput', '#carePreview', '#careState', '#careSampleButton', 'rock-scratch-sample.jpg', 'GUIDE READY');
setupLocalImageFlow('#reportFileInput', '#reportPreview', '#reportState', '#reportSampleButton', 'ocean-condition-sample.jpg', 'LIVE SNAPSHOT');

const compass = (degrees) => {
  const value = Number(degrees);
  if (!Number.isFinite(value) || value < 0) return '--';
  return ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round(value / 22.5) % 16];
};

const kstTimestamp = () => {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 12);
};

const validNumber = (value) => {
  const number = Number(String(value ?? '').replace(/[,*]/g, ''));
  return Number.isFinite(number) && number > -90 ? number : null;
};

function parseKmaRows(rawText) {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const headerIndex = lines.findLastIndex((line) => /STN_ID/.test(line) && /WH/.test(line));
  if (headerIndex < 0) throw new Error('기상청 응답의 필드 형식을 확인할 수 없습니다.');
  const headers = lines[headerIndex].replace(/^#\s*/, '').split(/\s+/);
  return lines.slice(headerIndex + 1).filter((line) => !line.startsWith('#') && !/^[-=]+$/.test(line)).map((line) => {
    const values = line.split(/\s+/);
    return headers.reduce((row, key, index) => { row[key] = values[index]; return row; }, {});
  }).filter((row) => row.STN_ID || row.STN);
}

function applyConditions({ station = '현장 위치', time = '--', windDirection, windSpeed, waveHeight, temperature, source = 'LIVE' }) {
  const wind = validNumber(windSpeed);
  const wave = validNumber(waveHeight);
  const direction = validNumber(windDirection);
  $('#windValue').textContent = wind === null ? '--' : `${compass(direction)} ${wind.toFixed(1)} m/s`;
  $('#waveValue').textContent = wave === null ? '--' : `${wave.toFixed(1)} m`;
  const climate = $('.climate-line strong');
  if (climate) climate.textContent = temperature === null || temperature === undefined ? `${station} · 해양 관측` : `${station} · 수온/기온 ${Number(temperature).toFixed(1)}°C`;
  const risk = Math.min(100, Math.round((wave || 0) * 22 + (wind || 0) * 3));
  const goCard = $('#goCard');
  const goValue = $('#goValue');
  const goReason = $('#goReason');
  if (goCard && goValue && goReason) {
    goCard.classList.toggle('danger', risk >= 65);
    goCard.classList.toggle('caution', risk >= 35 && risk < 65);
    goValue.textContent = risk >= 65 ? '활동 자제' : risk >= 35 ? '주의해서 활동' : '활동 가능성 양호';
    goReason.textContent = `${source} · ${station} · ${time} 기준 / 풍속·유의파고 조합 ${risk}/100`;
  }
  return { risk, station, time };
}

async function fetchOpenMeteoConditions() {
  if (!state.coords) throw new Error('먼저 GPS 위치를 확인해 주세요.');
  const marineParams = new URLSearchParams({ latitude: state.coords.latitude.toFixed(4), longitude: state.coords.longitude.toFixed(4), hourly: 'wave_height,wind_wave_height,swell_wave_height', forecast_days: '1', timezone: 'Asia/Seoul' });
  const weatherParams = new URLSearchParams({ latitude: state.coords.latitude.toFixed(4), longitude: state.coords.longitude.toFixed(4), current: 'temperature_2m,wind_speed_10m,wind_direction_10m', wind_speed_unit: 'ms', timezone: 'Asia/Seoul' });
  const [marineResponse, weatherResponse] = await Promise.all([fetch(`https://marine-api.open-meteo.com/v1/marine?${marineParams}`), fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams}`)]);
  const [marine, weather] = await Promise.all([marineResponse.json(), weatherResponse.json()]);
  const response = marineResponse;
  const payload = { current: weather.current, reason: marine.reason || weather.reason };
  if (!response.ok || !payload.current) throw new Error(payload.reason || `해양 모델 API 오류 ${response.status}`);
  const applied = applyConditions({ station: `GPS ${state.coords.latitude.toFixed(2)}, ${state.coords.longitude.toFixed(2)}`, time: weather.current.time || '--', windDirection: weather.current.wind_direction_10m, windSpeed: weather.current.wind_speed_10m, waveHeight: marine.hourly?.wave_height?.[0], temperature: weather.current.temperature_2m, source: 'OPEN-METEO MODEL' });
  $('#surfaceValue').textContent = '--';
  $('#kmaStatus').textContent = `위치 기반 실시간 모델 · ${payload.current.time || '--'} · KMA 키 입력 시 공식 관측으로 전환`;
  return applied;
}

async function fetchKmaConditions() {
  const apiKey = $('#kmaApiKey')?.value.trim();
  if (!apiKey) { await fetchOpenMeteoConditions(); return; }
  const params = new URLSearchParams({ tm: kstTimestamp(), stn: '0', help: '0', authKey: apiKey });
  const response = await fetch(`https://apihub.kma.go.kr/api/typ01/url/sea_obs.php?${params}`);
  const rawText = await response.text();
  if (!response.ok || /ERROR|FAIL|인증키|authKey/i.test(rawText.slice(0, 500))) throw new Error('기상청 API 인증 또는 호출에 실패했습니다. 인증키와 API 사용 권한을 확인해 주세요.');
  const rows = parseKmaRows(rawText);
  if (!rows.length) throw new Error('현재 시각에 사용할 수 있는 해양 관측값이 없습니다.');
  const row = rows[0];
  const applied = applyConditions({ station: row.STN_KO || row.STN_ID || 'KMA 해양관측', time: row.TM || '--', windDirection: row.WD, windSpeed: row.WS, waveHeight: row.WH, temperature: row.TW ?? row.TA, source: 'KMA OBSERVATION' });
  $('#surfaceValue').textContent = row.HM ? `${validNumber(row.HM)?.toFixed(0)}%` : '--';
  $('#kmaStatus').textContent = `기상청 공식 관측 · ${row.TM || '--'} · ${row.STN_KO || row.STN_ID || '최신 관측값'}`;
  return applied;
}

$('#kmaFetchButton')?.addEventListener('click', async () => {
  const button = $('#kmaFetchButton');
  button.disabled = true;
  $('#kmaStatus').textContent = '실시간 해양 데이터를 불러오는 중...';
  try {
    await fetchKmaConditions();
    if ($('#kmaApiKey').value.trim() && !state.conditionTimer) state.conditionTimer = window.setInterval(() => fetchKmaConditions().catch(() => {}), 10 * 60 * 1000);
  } catch (error) {
    $('#kmaStatus').textContent = `실시간 데이터 실패 · ${error.message}`;
  } finally { button.disabled = false; }
});

$('#gpsButton')?.addEventListener('click', () => {
  $('#gpsValue').textContent = '위치 확인 중...';
  if (!navigator.geolocation) { $('#gpsValue').textContent = '브라우저 위치 기능을 사용할 수 없습니다.'; return; }
  navigator.geolocation.getCurrentPosition((position) => {
    state.coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    if (!$('#kmaApiKey')?.value.trim()) fetchOpenMeteoConditions().catch((error) => { $('#kmaStatus').textContent = `위치 기반 데이터 실패 · ${error.message}`; });
    $('#gpsValue').textContent = `${position.coords.latitude.toFixed(4)}° N, ${position.coords.longitude.toFixed(4)}° E`;
  }, () => { $('#gpsValue').textContent = '위치 권한을 허용해 주세요.'; }, { enableHighAccuracy: true, timeout: 7000 });
});

$('#reportButton')?.addEventListener('click', () => {
  $('#reportMessage').textContent = '신고 데이터 초안이 생성되었습니다. 실제 신고는 119·해양경찰 122·관할 지자체 공식 채널을 이용하세요.';
  $('#reportButton').classList.add('sent');
});
