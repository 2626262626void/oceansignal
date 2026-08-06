function send(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

const kstTimestamp = () => {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 12);
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method !== 'GET') return send(res, 405, { error: 'GET 요청만 지원합니다.' });
  const authKey = process.env.KMA_MARINE_API_KEY;
  if (!authKey) return send(res, 503, { error: '기상청 해양 API 키가 서버에 설정되지 않았습니다.' });
  try {
    const params = new URLSearchParams({ tm: kstTimestamp(), stn: '0', help: '0', authKey });
    const response = await fetch(`https://apihub.kma.go.kr/api/typ01/url/sea_obs.php?${params}`);
    const rawText = await response.text();
    if (!response.ok || !rawText.trim()) return send(res, 502, { error: '기상청 해양 관측 API 응답을 확인할 수 없습니다.' });
    return send(res, 200, { rawText });
  } catch (error) {
    return send(res, 500, { error: error.message || '기상청 해양 데이터 요청 중 오류가 발생했습니다.' });
  }
}
