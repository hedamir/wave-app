// app/layout.js
export const metadata = {
  title: 'wave. — your music',
  description: 'Daily playlists and weekend mixes from your Spotify',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
