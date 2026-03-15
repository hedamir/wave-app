// app/api/auth/login/route.js
// Redirects user to Spotify authorization page

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`

  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-top-read',
    'user-read-recently-played',
    'playlist-modify-public',
    'playlist-modify-private',
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes,
    show_dialog: 'true',
  })

  return Response.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  )
}
