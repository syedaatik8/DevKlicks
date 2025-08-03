import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const apiKey = Deno.env.get('CLIPDROP_API_KEY')
    
    if (!apiKey) {
      throw new Error('Clipdrop API key not configured')
    }

    // Get the form data from the request
    const formData = await req.formData()
    const imageFile = formData.get('image_file') as File

    if (!imageFile) {
      throw new Error('No image file provided')
    }

    // Forward the request to Clipdrop API
    const clipdropFormData = new FormData()
    clipdropFormData.append('image_file', imageFile)

    const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: clipdropFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Clipdrop API error:', errorText)
      
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.')
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Please check configuration.')
      } else if (response.status === 400) {
        throw new Error('Invalid image format. Please use JPEG, PNG, or WebP.')
      } else {
        throw new Error(`API error: ${response.status}. Please try again.`)
      }
    }

    const blob = await response.blob()
    
    return new Response(blob, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
      },
    })
  } catch (error) {
    console.error('Background removal error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})