
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const denoEnv = (globalThis as { Deno?: { env: { get(key: string): string | undefined }; serve: (handler: (req: Request) => Response | Promise<Response>) => void } }).Deno
const OPENAI_API_KEY = denoEnv?.env.get('OPENAI_API_KEY')
const OPENAI_BASE_URL = 'https://api.openai.com/v1'

type VisionContentText = { type: 'text'; text: string }
type VisionContentImage = { type: 'image_url'; image_url: { url: string } | string }
type VisionMessage = { role: 'system' | 'user'; content: Array<VisionContentText | VisionContentImage> | string }

denoEnv?.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = (await req.json()) as { messages?: VisionMessage[] }
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Normalize messages for OpenAI format if necessary
    // OpenAI expects image_url to be an object { url: string }
    const normalizedMessages = body.messages.map(msg => {
      if (Array.isArray(msg.content)) {
        return {
          ...msg,
          content: msg.content.map(c => {
            if (c.type === 'image_url' && typeof c.image_url === 'string') {
              return { type: 'image_url', image_url: { url: c.image_url } }
            }
            return c
          })
        }
      }
      return msg
    })

    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: normalizedMessages,
        max_tokens: 2000,
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as Record<string, unknown>)) as Record<string, unknown>
      const errMsg = (errorData as { error?: { message?: string } }).error?.message || 'Unknown error'
      return new Response(JSON.stringify({ error: 'OpenAI API error', details: errMsg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: 'Unexpected error', details: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
