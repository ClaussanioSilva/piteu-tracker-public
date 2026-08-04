export {}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const denoEnv = (globalThis as { Deno?: { env: { get(key: string): string | undefined }; serve: (handler: (req: Request) => Response | Promise<Response>) => void } }).Deno
const GROQ_API_KEY = denoEnv?.env.get('GROQ_API_KEY')
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

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

  if (!GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing GROQ_API_KEY' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const contentType = req.headers.get('content-type') || ''

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const modeValue = form.get('mode')
      const mode = typeof modeValue === 'string' ? modeValue : 'transcribe'
      if (mode !== 'transcribe') {
        return new Response(JSON.stringify({ error: 'Invalid mode for multipart request' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const file = form.get('file')
      if (!(file instanceof File)) {
        return new Response(JSON.stringify({ error: 'Missing audio file' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const apiForm = new FormData()
      apiForm.append('file', file)
      apiForm.append('model', 'whisper-large-v3')
      apiForm.append('language', 'pt')

      const groqRes = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: apiForm,
      })

      if (!groqRes.ok) {
        const errText = await groqRes.text()
        return new Response(JSON.stringify({ error: 'Groq Audio API error', details: errText }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const data = await groqRes.json()

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json()) as { mode?: string; messages?: ChatMessage[] }
    const mode = body.mode || 'parse'

    if (mode !== 'parse') {
      return new Response(JSON.stringify({ error: 'Invalid mode for JSON request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const groqRes = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: body.messages,
        max_tokens: 512,
        temperature: 0.2,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      return new Response(JSON.stringify({ error: 'Groq API error', details: errText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await groqRes.json()

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
