import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=access_denied`)
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL
  const redirectUri = `${nextAuthUrl}/api/auth/callback`
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    })

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const data = await tokenRes.json()

    if (!data.access_token) {
      const debug = encodeURIComponent(JSON.stringify({
        spotify_error: data.error,
        description: data.error_description,
        status: tokenRes.status,
        redirect_uri: redirectUri,
        has_client_id: !!clientId,
        has_secret: !!clientSecret,
      }))
      return NextResponse.redirect(`${nextAuthUrl}/?error=token_failed&debug=${debug}`)
    }

    const params = new URLSearchParams({
      access_token: data.access_token,
      refresh_token: data.refresh_token || '',
      expires_in: String(data.expires_in || 3600),
    })

    return NextResponse.redirect(`${nextAuthUrl}/#${params.toString()}`)
  } catch (e) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=server_error&msg=${encodeURIComponent(e.message)}`)
  }
}
