'use client'
// app/page.js — full wave. app

import { useEffect, useState, useCallback } from 'react'

const BASS_LABELS = ['No bass', 'Light bass', 'Balanced', 'Punchy', 'Heavy', 'Full bass']
const ENERGY_LABELS = ['Meditative', 'Very low', 'Low', 'Medium', 'High', 'Peak energy']
const VOX_LABELS = ['Instrumental', 'Some vocals', 'Full vocals']
const MOOD_PRESETS = {
  Focus:     { bass: 40, energy: 45, bpm: 100 },
  Chill:     { bass: 35, energy: 25, bpm: 85  },
  Energize:  { bass: 65, energy: 80, bpm: 128 },
  Melancholy:{ bass: 30, energy: 30, bpm: 80  },
  Hype:      { bass: 85, energy: 95, bpm: 140 },
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function fmtDur(ms) {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function ArtistNames({ artists = [] }) {
  return <span>{artists.map(a => a.name).join(', ')}</span>
}

function AlbumArt({ images = [], size = 40 }) {
  const url = images?.[0]?.url
  return (
    <div style={{ width: size, height: size, borderRadius: 4, background: '#f0f0ee', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.2 }}>
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
      )}
    </div>
  )
}

function TrackList({ tracks }) {
  if (!tracks.length) return <div style={s.empty}>No tracks found</div>
  return (
    <div style={s.tlist}>
      {tracks.map((t, i) => (
        <div key={t.id + i} style={s.trow} onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'} onMouseLeave={e => e.currentTarget.style.background = ''}>
          <div style={s.tnum}>{i + 1}</div>
          <AlbumArt images={t.album?.images} />
          <div style={{ minWidth: 0 }}>
            <div style={s.tname}>{t.name}</div>
            <div style={s.tartist}><ArtistNames artists={t.artists} /></div>
          </div>
          <div style={s.tdur}>{t.duration_ms ? fmtDur(t.duration_ms) : ''}</div>
        </div>
      ))}
    </div>
  )
}

function Gauge({ label, value, onChange, color = '#1a1a1a' }) {
  const pct = value / 100
  const arcLen = (259 * pct).toFixed(1)
  const angle = -135 + pct * 270
  const rad = angle * Math.PI / 180
  const nx = (80 + 50 * Math.cos(rad)).toFixed(2)
  const ny = (80 + 50 * Math.sin(rad)).toFixed(2)
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (-225 + i * (270 / 11)) * Math.PI / 180
    const r1 = 62, r2 = i % 3 === 0 ? 67 : 65
    return { x1: (80 + r1 * Math.cos(a)).toFixed(2), y1: (80 + r1 * Math.sin(a)).toFixed(2), x2: (80 + r2 * Math.cos(a)).toFixed(2), y2: (80 + r2 * Math.sin(a)).toFixed(2), thick: i % 3 === 0 }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12, alignSelf: 'flex-start' }}>{label}</div>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ overflow: 'visible' }}>
        <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" strokeDasharray="3 6" />
        <circle cx="80" cy="80" r="55" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
        <circle cx="80" cy="80" r="40" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" strokeDasharray="2 8" />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="rgba(0,0,0,0.12)" strokeWidth={t.thick ? 1.5 : 0.8} strokeLinecap="round" />
        ))}
        <circle cx="80" cy="80" r="55" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="8" strokeLinecap="round" strokeDasharray="259 346" strokeDashoffset="-43.5" />
        <circle cx="80" cy="80" r="55" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${arcLen} 346`} strokeDashoffset="-43.5" style={{ transition: 'stroke-dasharray 0.25s' }} />
        <line x1="80" y1="80" x2={nx} y2={ny} stroke={color} strokeWidth="1.5" strokeLinecap="round" style={{ transition: 'all 0.25s', transformOrigin: '80px 80px' }} />
        <circle cx={nx} cy={ny} r="4" fill={color} style={{ transition: 'all 0.25s', transformOrigin: '80px 80px' }} />
        <circle cx="80" cy="80" r="5" fill="white" stroke={color} strokeWidth="1.5" />
        <text x="80" y="96" textAnchor="middle" fontSize="20" fontWeight="500" fill="#1a1a1a" fontFamily="-apple-system,sans-serif">{Math.round(value)}</text>
        <text x="80" y="109" textAnchor="middle" fontSize="9" fill="#999" fontFamily="-apple-system,sans-serif">
          {label === 'Bass' ? BASS_LABELS[Math.min(Math.round(value / 20), 5)] : ENERGY_LABELS[Math.min(Math.round(value / 20), 5)]}
        </text>
      </svg>
      <input type="range" min="0" max="100" value={value} step="1" onChange={e => onChange(+e.target.value)} style={{ width: 130, marginTop: 10, accentColor: color }} />
    </div>
  )
}

export default function App() {
  const [token, setToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('connect')
  const [playlists, setPlaylists] = useState([])
  const [likedTracks, setLikedTracks] = useState([])
  const [recentTracks, setRecentTracks] = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [topRange, setTopRange] = useState('short_term')
  const [openPlaylist, setOpenPlaylist] = useState(null)
  const [openPlaylistTracks, setOpenPlaylistTracks] = useState([])
  const [dailyMix, setDailyMix] = useState([])
  const [weekendMix, setWeekendMix] = useState([])
  const [loading, setLoading] = useState({})
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  // Mood & sound state
  const [mood, setMood] = useState('Focus')
  const [bass, setBass] = useState(40)
  const [energy, setEnergy] = useState(45)
  const [bpm, setBpm] = useState(100)
  const [vox, setVox] = useState(1)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600) }

  const spFetch = useCallback(async (url) => {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (r.status === 401) {
      if (refreshToken) {
        const res = await fetch('/api/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refreshToken }) })
        const data = await res.json()
        if (data.access_token) { setToken(data.access_token); return spFetch(url) }
      }
      setToken(null); setPage('connect')
      throw new Error('Unauthorized')
    }
    if (!r.ok) throw new Error(r.status)
    return r.json()
  }, [token, refreshToken])

  // Parse tokens from URL hash on load
  useEffect(() => {
    const hash = window.location.hash.substring(1)
    if (hash) {
      const params = new URLSearchParams(hash)
      const at = params.get('access_token')
      const rt = params.get('refresh_token')
      if (at) {
        setToken(at)
        if (rt) setRefreshToken(rt)
        window.history.replaceState({}, '', '/')
      }
    }
    const urlParams = new URLSearchParams(window.location.search)
    const err = urlParams.get('error')
    if (err) setError('Spotify login failed. Please try again.')
  }, [])

  useEffect(() => {
    if (!token) return
    spFetch('https://api.spotify.com/v1/me').then(u => { setUser(u); setPage('playlists'); loadAll() }).catch(() => {})
  }, [token])

  async function loadAll() {
    loadPlaylists(); loadLiked(); loadRecent(); loadTop('short_term')
  }

  async function loadPlaylists() {
    setLoading(l => ({ ...l, playlists: true }))
    try {
      let items = [], url = 'https://api.spotify.com/v1/me/playlists?limit=50'
      while (url && items.length < 100) { const d = await spFetch(url); items = items.concat(d.items || []); url = d.next }
      setPlaylists(items)
    } finally { setLoading(l => ({ ...l, playlists: false })) }
  }

  async function loadLiked() {
    setLoading(l => ({ ...l, liked: true }))
    try {
      let items = [], url = 'https://api.spotify.com/v1/me/tracks?limit=50'
      while (url && items.length < 100) { const d = await spFetch(url); items = items.concat((d.items || []).map(i => i.track).filter(Boolean)); url = d.next }
      setLikedTracks(items)
    } finally { setLoading(l => ({ ...l, liked: false })) }
  }

  async function loadRecent() {
    setLoading(l => ({ ...l, recent: true }))
    try {
      const d = await spFetch('https://api.spotify.com/v1/me/player/recently-played?limit=50')
      setRecentTracks((d.items || []).map(i => i.track).filter(Boolean))
    } finally { setLoading(l => ({ ...l, recent: false })) }
  }

  async function loadTop(range) {
    setLoading(l => ({ ...l, top: true })); setTopRange(range)
    try {
      const d = await spFetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${range}`)
      setTopTracks(d.items || [])
    } finally { setLoading(l => ({ ...l, top: false })) }
  }

  async function loadPlaylistTracks(pl) {
    setOpenPlaylist(pl); setPage('pltracks'); setOpenPlaylistTracks([])
    setLoading(l => ({ ...l, pltracks: true }))
    try {
      let items = [], url = `https://api.spotify.com/v1/playlists/${pl.id}/tracks?limit=50`
      while (url && items.length < 100) { const d = await spFetch(url); items = items.concat((d.items || []).filter(i => i.track?.name).map(i => i.track)); url = d.next }
      setOpenPlaylistTracks(items)
    } finally { setLoading(l => ({ ...l, pltracks: false })) }
  }

  function buildDaily() {
    const pool = [...topTracks, ...likedTracks].filter(Boolean)
    if (!pool.length) { showToast('Still loading your library...'); return }
    const seen = new Set()
    const mix = shuffle(pool.filter(t => { if (!t || seen.has(t.id)) return false; seen.add(t.id); return true })).slice(0, 30)
    setDailyMix(mix); setPage('daily')
  }

  function buildWeekend() {
    const pool = [...likedTracks, ...topTracks].filter(Boolean)
    if (!pool.length) { showToast('Still loading your library...'); return }
    const seen = new Set()
    const mix = shuffle(pool.filter(t => { if (!t || seen.has(t.id)) return false; seen.add(t.id); return true })).slice(0, 24)
    setWeekendMix(mix); setPage('weekend')
  }

  async function savePlaylist(type) {
    if (!user) { showToast('Not connected'); return }
    const tracks = type === 'daily' ? dailyMix : type === 'weekend' ? weekendMix : likedTracks.slice(0, 50)
    if (!tracks.length) { showToast('Generate a mix first'); return }
    const names = { daily: `wave. Daily Mix · ${new Date().toLocaleDateString()}`, weekend: `wave. Weekend Set · ${new Date().toLocaleDateString()}`, liked: 'wave. Liked Export' }
    try {
      const pl = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: names[type], public: false, description: `Made with wave. · Mood: ${mood}` }) }).then(r => r.json())
      await fetch(`https://api.spotify.com/v1/playlists/${pl.id}/tracks`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ uris: tracks.filter(t => t?.uri).map(t => t.uri) }) })
      showToast('Saved to Spotify!')
      loadPlaylists()
    } catch { showToast('Save failed — please try again') }
  }

  function applyMoodPreset(m) {
    setMood(m)
    const p = MOOD_PRESETS[m]
    setBass(p.bass); setEnergy(p.energy); setBpm(p.bpm)
  }

  const bpmLo = Math.max(60, bpm - 24), bpmHi = Math.min(200, bpm + 24)
  const profileTags = [mood, BASS_LABELS[Math.min(Math.round(bass / 20), 5)], `${bpmLo}–${bpmHi} bpm`, ENERGY_LABELS[Math.min(Math.round(energy / 20), 5)], VOX_LABELS[vox]]

  const navItem = (id, label, icon) => (
    <div onClick={() => { if (id === 'daily') buildDaily(); else if (id === 'weekend') buildWeekend(); else setPage(id) }}
      style={{ ...s.navItem, ...(page === id ? s.navActive : {}) }}>
      {icon}
      <span>{label}</span>
      {id === 'playlists' && playlists.length > 0 && <span style={s.badge}>{playlists.length}</span>}
      {id === 'liked' && likedTracks.length > 0 && <span style={s.badge}>{likedTracks.length}</span>}
    </div>
  )

  return (
    <div style={s.app}>
      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={s.logo}>wave<span style={{ color: '#1DB954' }}>.</span></div>
        {user ? (
          <div style={s.userPill}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1DB954' }} />
            <span>{user.display_name || user.id}</span>
            <span style={{ color: '#ccc', margin: '0 4px' }}>·</span>
            <span style={{ cursor: 'pointer', color: '#999' }} onClick={() => { setToken(null); setUser(null); setPage('connect') }}>log out</span>
          </div>
        ) : null}
      </div>

      <div style={s.layout}>
        {/* SIDEBAR */}
        <div style={s.sidebar}>
          <div style={s.navLabel}>Music</div>
          {navItem('playlists', 'Playlists', <svg style={s.ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>)}
          {navItem('liked', 'Liked songs', <svg style={s.ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>)}
          {navItem('recent', 'Recently played', <svg style={s.ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>)}
          {navItem('top', 'Top tracks', <svg style={s.ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>)}
          <div style={s.navLabel}>Generate</div>
          {navItem('daily', 'Daily mix', <svg style={s.ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>)}
          {navItem('weekend', 'Weekend set', <svg style={s.ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
        </div>

        {/* MAIN */}
        <div style={s.main}>

          {/* CONNECT */}
          {page === 'connect' && (
            <div style={s.connectScreen}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 8, letterSpacing: -0.4 }}>Welcome to wave.</div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 28, maxWidth: 320, textAlign: 'center' }}>Your daily playlists and weekend mixes, built from your Spotify library.</div>
              {error && <div style={{ background: '#fdf0ee', color: '#c0392b', borderRadius: 8, padding: '10px 16px', fontSize: 13, marginBottom: 16 }}>{error}</div>}
              <a href="/api/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#1DB954', color: '#fff', borderRadius: 28, padding: '12px 28px', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                Log in with Spotify
              </a>
            </div>
          )}

          {/* PLAYLISTS */}
          {page === 'playlists' && (
            <div>
              <div style={s.ptitle}>Your playlists</div>
              <div style={s.psub}>{playlists.length} playlists</div>
              {loading.playlists ? <Loader /> : (
                <div style={s.pgrid}>
                  {playlists.map(p => (
                    <div key={p.id} style={s.pcard} onClick={() => loadPlaylistTracks(p)} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'}>
                      <div style={s.pcimg}><AlbumArt images={p.images} size="100%" /></div>
                      <div style={s.pcbody}>
                        <div style={s.pcname}>{p.name}</div>
                        <div style={s.pcmeta}>{p.tracks?.total || 0} tracks</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PLAYLIST TRACKS */}
          {page === 'pltracks' && openPlaylist && (
            <div>
              <div style={s.back} onClick={() => setPage('playlists')}>← playlists</div>
              <div style={s.ptitle}>{openPlaylist.name}</div>
              <div style={s.psub}>{openPlaylist.tracks?.total || 0} tracks</div>
              {loading.pltracks ? <Loader /> : <TrackList tracks={openPlaylistTracks} />}
            </div>
          )}

          {/* LIKED */}
          {page === 'liked' && (
            <div>
              <div style={s.ptitle}>Liked songs</div>
              <div style={s.psub}>{likedTracks.length} liked songs</div>
              {loading.liked ? <Loader /> : <TrackList tracks={likedTracks} />}
              <div style={s.btnRow}><button style={s.btnP} onClick={() => savePlaylist('liked')}>Save as playlist in Spotify</button></div>
            </div>
          )}

          {/* RECENT */}
          {page === 'recent' && (
            <div>
              <div style={s.ptitle}>Recently played</div>
              <div style={s.psub}>Last 50 tracks</div>
              {loading.recent ? <Loader /> : <TrackList tracks={recentTracks} />}
            </div>
          )}

          {/* TOP */}
          {page === 'top' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <div style={s.ptitle}>Top tracks</div>
                  <div style={s.psub}>{{ short_term: 'Last 4 weeks', medium_term: 'Last 6 months', long_term: 'All time' }[topRange]}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, paddingTop: 4 }}>
                  {[['short_term','4 weeks'],['medium_term','6 months'],['long_term','All time']].map(([r,l]) => (
                    <button key={r} style={{ ...s.btn, fontWeight: topRange === r ? 500 : 400 }} onClick={() => loadTop(r)}>{l}</button>
                  ))}
                </div>
              </div>
              {loading.top ? <Loader /> : <TrackList tracks={topTracks} />}
            </div>
          )}

          {/* DAILY MIX */}
          {page === 'daily' && (
            <div>
              <div style={s.ptitle}>Daily mix</div>
              <div style={s.psub}>Built from your taste · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>

              {/* MOOD CONTROLS */}
              <div style={s.moodCard}>
                <div style={s.sectionLabel}>Mood</div>
                <div style={s.moodGrid}>
                  {Object.keys(MOOD_PRESETS).map(m => (
                    <button key={m} style={{ ...s.moodBtn, ...(mood === m ? s.moodBtnActive : {}) }} onClick={() => applyMoodPreset(m)}>
                      <div style={s.moodLabel}>{m}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={s.gaugeCard}>
                  <Gauge label="Bass" value={bass} onChange={setBass} color="#1a1a1a" />
                </div>
                <div style={s.gaugeCard}>
                  <Gauge label="Energy" value={energy} onChange={setEnergy} color="#1DB954" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={s.slCard}>
                  <div style={s.slHead}><span style={s.slName}>BPM range</span><span style={s.slVal}>{bpmLo}–{bpmHi}</span></div>
                  <input type="range" min="60" max="180" value={bpm} step="1" onChange={e => setBpm(+e.target.value)} style={{ width: '100%', accentColor: '#1a1a1a' }} />
                </div>
                <div style={s.slCard}>
                  <div style={s.slHead}><span style={s.slName}>Vocals</span><span style={s.slVal}>{VOX_LABELS[vox]}</span></div>
                  <input type="range" min="0" max="2" value={vox} step="1" onChange={e => setVox(+e.target.value)} style={{ width: '100%', accentColor: '#1a1a1a' }} />
                </div>
              </div>

              <div style={s.profileStrip}>
                {profileTags.map(t => <span key={t} style={s.ptag}>{t}</span>)}
              </div>

              <div style={s.statRow}>
                <div style={s.stat}><div style={s.slabel}>Tracks</div><div style={s.sval}>{dailyMix.length || '—'}</div></div>
                <div style={s.stat}><div style={s.slabel}>From library</div><div style={s.sval}>{dailyMix.length ? Math.round(dailyMix.filter(t => likedTracks.find(l => l.id === t.id)).length / dailyMix.length * 100) + '%' : '—'}</div></div>
                <div style={s.stat}><div style={s.slabel}>Generated</div><div style={s.sval}>{dailyMix.length ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div></div>
              </div>

              <TrackList tracks={dailyMix} />
              <div style={s.btnRow}>
                <button style={s.btnP} onClick={() => savePlaylist('daily')}>Save to Spotify</button>
                <button style={s.btn} onClick={buildDaily}>Regenerate</button>
              </div>
            </div>
          )}

          {/* WEEKEND SET */}
          {page === 'weekend' && (
            <div>
              <div style={s.ptitle}>Weekend set</div>
              <div style={s.psub}>24-track mix from your library</div>
              <div style={s.statRow}>
                <div style={s.stat}><div style={s.slabel}>Tracks</div><div style={s.sval}>{weekendMix.length || '—'}</div></div>
                <div style={s.stat}><div style={s.slabel}>Duration</div><div style={s.sval}>{weekendMix.length ? `${Math.floor(weekendMix.reduce((s, t) => s + (t.duration_ms || 210000), 0) / 60000 / 60)}h ${Math.round(weekendMix.reduce((s, t) => s + (t.duration_ms || 210000), 0) / 60000 % 60)}m` : '—'}</div></div>
                <div style={s.stat}><div style={s.slabel}>Energy arc</div><div style={s.sval}>Rise</div></div>
              </div>
              <TrackList tracks={weekendMix} />
              <div style={s.btnRow}>
                <button style={s.btnP} onClick={() => savePlaylist('weekend')}>Save to Spotify</button>
                <button style={s.btn} onClick={buildWeekend}>Rebuild set</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: '#fff', padding: '8px 18px', borderRadius: 20, fontSize: 13, zIndex: 100, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

function Loader() {
  return (
    <div style={{ padding: 32, textAlign: 'center', color: '#999', fontSize: 13 }}>
      <div style={{ width: 20, height: 20, border: '2px solid #e0e0e0', borderTopColor: '#666', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 10px' }} />
      Loading...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const s = {
  app: { fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', background: '#f5f5f3', minHeight: '100vh' },
  topbar: { background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.1)', padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: 15, fontWeight: 500, letterSpacing: -0.3 },
  userPill: { display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 20, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f3', fontSize: 12, color: '#666' },
  layout: { display: 'grid', gridTemplateColumns: '196px 1fr', minHeight: 'calc(100vh - 49px)' },
  sidebar: { background: '#fff', borderRight: '0.5px solid rgba(0,0,0,0.08)', padding: '18px 12px', position: 'sticky', top: 49, height: 'calc(100vh - 49px)', overflowY: 'auto' },
  navLabel: { fontSize: 10, fontWeight: 500, color: '#999', letterSpacing: '0.8px', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8, marginTop: 14 },
  navItem: { display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#666', marginBottom: 1, transition: 'all 0.12s', whiteSpace: 'nowrap' },
  navActive: { background: '#f5f5f3', color: '#1a1a1a', fontWeight: 500 },
  ni: { width: 15, height: 15, flexShrink: 0, opacity: 0.55 },
  badge: { fontSize: 10, background: '#f5f5f3', color: '#999', padding: '1px 6px', borderRadius: 8, marginLeft: 'auto' },
  main: { padding: '28px 32px', maxWidth: 860 },
  connectScreen: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' },
  ptitle: { fontSize: 22, fontWeight: 500, letterSpacing: -0.4, marginBottom: 4 },
  psub: { fontSize: 12, color: '#999', marginBottom: 20 },
  back: { fontSize: 12, color: '#999', cursor: 'pointer', marginBottom: 14, display: 'inline-flex', alignItems: 'center', gap: 4 },
  tlist: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, overflow: 'hidden' },
  trow: { display: 'grid', gridTemplateColumns: '26px 40px 1fr 44px', gap: 12, alignItems: 'center', padding: '10px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', transition: 'background 0.1s' },
  tnum: { fontSize: 11, color: '#bbb', textAlign: 'center', fontFamily: 'monospace' },
  tname: { fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tartist: { fontSize: 11, color: '#999', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tdur: { fontSize: 11, color: '#bbb', fontFamily: 'monospace', textAlign: 'right' },
  empty: { padding: 28, textAlign: 'center', fontSize: 13, color: '#999' },
  pgrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12, marginBottom: 18 },
  pcard: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.12s' },
  pcimg: { width: '100%', aspectRatio: 1, background: '#f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pcbody: { padding: '9px 10px 11px' },
  pcname: { fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  pcmeta: { fontSize: 11, color: '#999', marginTop: 2 },
  btnRow: { display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  btn: { padding: '7px 14px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', border: '0.5px solid rgba(0,0,0,0.12)', background: '#fff', color: '#666' },
  btnP: { padding: '8px 16px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: '#1DB954', color: '#fff', fontWeight: 500 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18, marginTop: 16 },
  stat: { background: '#f5f5f3', borderRadius: 8, padding: '11px 13px' },
  slabel: { fontSize: 11, color: '#999', marginBottom: 3 },
  sval: { fontSize: 20, fontWeight: 500 },
  moodCard: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '16px 18px', marginBottom: 14 },
  sectionLabel: { fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 },
  moodGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 },
  moodBtn: { border: '0.5px solid rgba(0,0,0,0.12)', background: '#fff', borderRadius: 8, padding: '9px 6px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', fontFamily: 'inherit' },
  moodBtnActive: { border: '0.5px solid #1a1a1a', background: '#1a1a1a' },
  moodLabel: { fontSize: 12, color: '#666', fontWeight: 500 },
  gaugeCard: { background: '#f5f5f3', borderRadius: 12, padding: '16px', display: 'flex', justifyContent: 'center' },
  slCard: { background: '#f5f5f3', borderRadius: 8, padding: '13px 14px' },
  slHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  slName: { fontSize: 12, fontWeight: 500, color: '#666' },
  slVal: { fontSize: 12, fontWeight: 500, color: '#1a1a1a' },
  profileStrip: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  ptag: { fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '0.5px solid rgba(0,0,0,0.1)', background: '#fff', color: '#666' },
}
