// app/api/auth/callback/route.js
// Spotify redirects here after user approves — exchanges code for access token

import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/?error=access_denied`
    )
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    const data = await tokenRes.json()

    if (!data.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/?error=token_failed`
      )
    }

    // Pass tokens to frontend via URL fragment (never stored server-side)
    const params = new URLSearchParams({
      access_token: data.access_token,
      refresh_token: data.refresh_token || '',
      expires_in: data.expires_in || 3600,
    })

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/#${params.toString()}`
    )
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/?error=server_error`
    )
  }
}
