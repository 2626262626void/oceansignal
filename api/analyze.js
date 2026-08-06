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

const prompt = `당신은 해양 환경 이미지 분석 전문가입니다. 제공된 사진만 근거로 분석하세요.
쓰레기 종류와 개수, 플라스틱·스티로폼·폐어구 여부, 기름 유출·적조·변색·거품 등 표면 오염 신호를 식별하세요.
확실하지 않은 내용은 추정하지 말고 confidence를 낮추세요. 의료·법적 판정은 하지 말고 현장 안전 권고를 작성하세요.
모든 위험도와 신뢰도 숫자는 0~100 사이로 반환하세요.`;

function send(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', 'https://2626262626void.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method !== 'POST') return send(res, 405, { error: 'POST 요청만 지원합니다.' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return send(res, 503, { error: '서버에 OpenAI API 키가 설정되지 않았습니다.' });

  const { imageDataUrl, model = 'gpt-5.4-mini' } = req.body || {};
  if (typeof imageDataUrl !== 'string' || !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(imageDataUrl)) return send(res, 400, { error: 'JPEG, PNG, WEBP 이미지 데이터가 필요합니다.' });
  if (imageDataUrl.length > 12_000_000) return send(res, 413, { error: '이미지가 너무 큽니다. 8MB 이하로 업로드해 주세요.' });

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }, { type: 'input_image', image_url: imageDataUrl, detail: 'high' }] }],
        max_output_tokens: 900,
        text: { format: { type: 'json_schema', name: 'ocean_signal_analysis', strict: true, schema: analysisSchema } },
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      if (response.status === 401) return send(res, 503, { error: 'Vercel에 저장된 OpenAI API 키가 유효하지 않습니다. 키 값에 따옴표·공백·Bearer를 포함하지 않았는지 확인해 주세요.' });
      if (response.status === 429) return send(res, 429, { error: 'OpenAI 사용 한도 또는 결제 상태를 확인해 주세요.' });
      return send(res, response.status, { error: payload.error?.message || 'OpenAI 분석 요청에 실패했습니다.' });
    }
    const outputText = payload.output_text || payload.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text;
    if (!outputText) return send(res, 502, { error: 'OpenAI가 분석 결과를 반환하지 않았습니다.' });
    return send(res, 200, JSON.parse(outputText.replace(/^```json\s*|\s*```$/g, '')));
  } catch (error) {
    return send(res, 500, { error: error.message || '서버 분석 중 오류가 발생했습니다.' });
  }
}
