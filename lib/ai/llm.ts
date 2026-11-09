import 'server-only'

/**
 * One small function that asks a language model for text. Returns null when no key is set or anything
 * goes wrong, so every caller has a non-AI fallback and the inbox never breaks because of the AI.
 *
 * Providers (set ONE key; AI_PROVIDER forces a choice if you set both):
 *   GEMINI_API_KEY  Google Gemini. Free key from https://aistudio.google.com (no card).   [default]
 *   XAI_API_KEY     Grok from xAI, or any OpenAI-compatible service via AI_BASE_URL.
 * AI_MODEL overrides the model name. Model names change often, so check the provider's list if a call fails.
 *
 * Only the enquiry text is ever sent. Never the traveller's name, phone or anything else.
 * Note: on Google's free tier, Google may use submitted content to improve its products.
 */
type Provider = 'gemini' | 'grok'

function pick(): { provider: Provider; key: string } | null {
  const forced = process.env.AI_PROVIDER?.toLowerCase()
  const gemini = process.env.GEMINI_API_KEY
  const xai = process.env.XAI_API_KEY
  if (forced === 'grok' && xai) return { provider: 'grok', key: xai }
  if (forced === 'gemini' && gemini) return { provider: 'gemini', key: gemini }
  if (gemini) return { provider: 'gemini', key: gemini }
  if (xai) return { provider: 'grok', key: xai }
  return null
}

export const aiEnabled = () => pick() !== null

export async function askLLM(system: string, user: string, opts: { json?: boolean; maxTokens?: number } = {}): Promise<string | null> {
  const p = pick()
  if (!p) return null
  const maxTokens = opts.maxTokens ?? 600
  try {
    let res: Response
    if (p.provider === 'gemini') {
      const model = process.env.AI_MODEL || 'gemini-flash-latest'
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': p.key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          // Headroom above maxTokens: some Gemini models spend part of the budget on thinking.
          generationConfig: { temperature: 0.2, maxOutputTokens: maxTokens + 1024, ...(opts.json ? { responseMimeType: 'application/json' } : {}) },
        }),
        signal: AbortSignal.timeout(25_000),
      })
    } else {
      const base = (process.env.AI_BASE_URL || 'https://api.x.ai/v1').replace(/\/$/, '')
      res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${p.key}` },
        body: JSON.stringify({
          model: process.env.AI_MODEL || 'grok-4.3',
          temperature: 0.2,
          max_tokens: maxTokens,
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        }),
        signal: AbortSignal.timeout(25_000),
      })
    }
    if (!res.ok) {
      console.error(`AI request failed (${p.provider}) with status`, res.status)
      return null
    }
    const data = await res.json()
    const text: string =
      p.provider === 'gemini'
        ? ((data?.candidates?.[0]?.content?.parts ?? []) as { text?: string }[]).map((x) => x.text ?? '').join('')
        : data?.choices?.[0]?.message?.content ?? ''
    return text.trim() || null
  } catch (e) {
    console.error('AI request error:', e instanceof Error ? e.message : 'unknown')
    return null
  }
}
