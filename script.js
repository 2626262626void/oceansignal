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
