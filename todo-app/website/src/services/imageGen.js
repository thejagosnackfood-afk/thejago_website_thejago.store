const OpenAI = require('openai');
const { VertexAI } = require('@google-cloud/vertexai');

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('openai_not_configured');
  return new OpenAI({ apiKey });
}

function getVertexModel() {
  const project = process.env.VERTEX_PROJECT_ID;
  const location = process.env.VERTEX_LOCATION || 'us-central1';
  if (!project) throw new Error('vertex_not_configured');

  const vertex = new VertexAI({ project, location });
  const modelName = process.env.VERTEX_IMAGEN_MODEL || 'imagen-3.0-fast';
  return vertex.getGenerativeModel({ model: modelName });
}

async function generateWithOpenAI(prompt) {
  const client = getOpenAI();
  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  const out = await client.images.generate({ model, prompt, size: '1024x1024' });
  const url = out.data?.[0]?.url;
  if (!url) throw new Error('openai_no_url');
  return { provider: 'openai', url };
}

async function generateWithVertex(prompt) {
  const model = getVertexModel();
  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }]}],
  });

  const candidates = response?.response?.candidates || [];
  const part = candidates[0]?.content?.parts?.find((p) => p.inlineData?.data);
  const b64 = part?.inlineData?.data;
  if (!b64) throw new Error('vertex_no_image');
  const mime = part?.inlineData?.mimeType || 'image/png';
  return { provider: 'vertex', base64: b64, mime };
}

async function generateImage({ prompt, provider = 'openai' }) {
  const text = String(prompt || '').trim();
  if (!text) throw new Error('prompt_required');

  if (provider === 'vertex') return generateWithVertex(text);
  return generateWithOpenAI(text);
}

module.exports = { generateImage };
