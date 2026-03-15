'use client'
import { useEffect, useState, useCallback } from 'react'

const BASS_LABELS = ['No bass','Light bass','Balanced','Punchy','Heavy','Full bass']
const ENERGY_LABELS = ['Meditative','Very low','Low','Medium','High','Peak energy']
const VOX_LABELS = ['Instrumental','Some vocals','Full vocals']
const MOOD_PRESETS = {
  Focus:     { bass:40, energy:45, bpm:100 },
  Chill:     { bass:35, energy:25, bpm:85  },
  Energize:  { bass:65, energy:80, bpm:128 },
  Melancholy:{ bass:30, energy:30, bpm:80  },
  Hype:      { bass:85, energy:95, bpm:140 },
}
const MOOD_COLORS = {
  Focus:'#185FA5', Chill:'#0F6E56', Energize:'#993C1D', Melancholy:'#534AB7', Hype:'#A32D2D'
}

function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function fmtDur(ms){const s=Math.round(ms/1000);return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
function fmtMs(ms){const m=Math.round(ms/60000);return`${Math.floor(m/60)}h ${m%60}m`}

function AlbumArt({images=[],size=40}){
  const url=images?.[0]?.url
  return(
    <div style={{width:size,height:size,borderRadius:4,background:'#f0f0ee',overflow:'hidden',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
      {url?<img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{opacity:0.2}}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
    </div>
  )
}

function TrackRow({track,index}){
  return(
    <div style={{display:'grid',gridTemplateColumns:'26px 40px 1fr 44px',gap:12,alignItems:'center',padding:'10px 16px',borderBottom:'0.5px solid rgba(0,0,0,0.05)',transition:'background 0.1s',cursor:'default'}}
      onMouseEnter={e=>e.currentTarget.style.background='#fafaf8'}
      onMouseLeave={e=>e.currentTarget.style.background=''}>
      <div style={{fontSize:11,color:'#bbb',textAlign:'center',fontFamily:'monospace'}}>{index+1}</div>
      <AlbumArt images={track.album?.images}/>
      <div style={{minWidth:0}}>
        <div style={{fontSize:13,fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{track.name}</div>
        <div style={{fontSize:11,color:'#999',marginTop:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{(track.artists||[]).map(a=>a.name).join(', ')}</div>
      </div>
      <div style={{fontSize:11,color:'#bbb',fontFamily:'monospace',textAlign:'right'}}>{track.duration_ms?fmtDur(track.duration_ms):''}</div>
    </div>
  )
}

function TrackList({tracks}){
  if(!tracks?.length) return <div style={{padding:28,textAlign:'center',fontSize:13,color:'#999'}}>No tracks found</div>
  return(
    <div style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:12,overflow:'hidden'}}>
      {tracks.map((t,i)=><TrackRow key={t.id+i} track={t} index={i}/>)}
    </div>
  )
}

function Gauge({label,value,onChange,color='#1a1a1a'}){
  const pct=value/100
  const arcLen=(259*pct).toFixed(1)
  const angle=-135+pct*270
  const rad=angle*Math.PI/180
  const nx=(80+50*Math.cos(rad)).toFixed(2)
  const ny=(80+50*Math.sin(rad)).toFixed(2)
  const ticks=Array.from({length:12},(_,i)=>{
    const a=(-225+i*(270/11))*Math.PI/180
    const r1=62,r2=i%3===0?67:65
    return{x1:(80+r1*Math.cos(a)).toFixed(2),y1:(80+r1*Math.sin(a)).toFixed(2),x2:(80+r2*Math.cos(a)).toFixed(2),y2:(80+r2*Math.sin(a)).toFixed(2),thick:i%3===0}
  })
  const sublabel=label==='Bass'?BASS_LABELS[Math.min(Math.round(value/20),5)]:ENERGY_LABELS[Math.min(Math.round(value/20),5)]
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'16px 12px',background:'#f7f7f5',borderRadius:12}}>
      <div style={{fontSize:10,fontWeight:500,color:'#aaa',letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:10,alignSelf:'flex-start'}}>{label}</div>
      <svg width="150" height="150" viewBox="0 0 160 160" style={{overflow:'visible'}}>
        <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" strokeDasharray="3 7"/>
        <circle cx="80" cy="80" r="55" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
        <circle cx="80" cy="80" r="38" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" strokeDasharray="2 9"/>
        {ticks.map((t,i)=>(
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="rgba(0,0,0,0.1)" strokeWidth={t.thick?1.5:0.7} strokeLinecap="round"/>
        ))}
        <circle cx="80" cy="80" r="55" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="9" strokeLinecap="round" strokeDasharray="259 346" strokeDashoffset="-43.5"/>
        <circle cx="80" cy="80" r="55" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${arcLen} 346`} strokeDashoffset="-43.5" style={{transition:'stroke-dasharray 0.25s'}}/>
        <line x1="80" y1="80" x2={nx} y2={ny} stroke={color} strokeWidth="1.5" strokeLinecap="round" style={{transition:'all 0.25s'}}/>
        <circle cx={nx} cy={ny} r="4.5" fill={color} style={{transition:'all 0.25s'}}/>
        <circle cx="80" cy="80" r="5.5" fill="white" stroke={color} strokeWidth="1.5"/>
        <text x="80" y="94" textAnchor="middle" fontSize="19" fontWeight="500" fill="#1a1a1a" fontFamily="-apple-system,sans-serif">{Math.round(value)}</text>
        <text x="80" y="107" textAnchor="middle" fontSize="9" fill="#aaa" fontFamily="-apple-system,sans-serif">{sublabel}</text>
      </svg>
      <input type="range" min="0" max="100" value={value} step="1" onChange={e=>onChange(+e.target.value)} style={{width:130,marginTop:8,accentColor:color}}/>
    </div>
  )
}

function EnergyArc({tracks}){
  if(!tracks?.length) return null
  const W=560,H=90,pad=20
  const n=tracks.length
  const pts=tracks.map((_,i)=>{
    const x=pad+(i/(n-1))*(W-2*pad)
    // simulate energy arc: rise, peak, comedown
    const t=i/(n-1)
    const e=t<0.6?t/0.6:1-(t-0.6)/0.4
    const y=H-pad-(e*(H-2*pad))
    return[x.toFixed(1),y.toFixed(1)]
  })
  const pathD='M'+pts.map(p=>p.join(',')).join(' L')
  const areaD=pathD+` L${pts[pts.length-1][0]},${H-pad} L${pts[0][0]},${H-pad} Z`
  const phases=[{label:'Warmup',pct:'0–30%'},{label:'Build',pct:'30–60%'},{label:'Peak',pct:'60–80%'},{label:'Comedown',pct:'80–100%'}]
  return(
    <div style={{background:'#f7f7f5',borderRadius:12,padding:'16px 20px',marginBottom:16}}>
      <div style={{fontSize:10,fontWeight:500,color:'#aaa',letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:12}}>Energy arc</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:'visible'}}>
        <path d={areaD} fill="#1DB954" fillOpacity="0.07"/>
        <path d={pathD} fill="none" stroke="#1DB954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.filter((_,i)=>i%Math.floor(n/6)===0||i===n-1).map((p,i)=>(
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#1DB954" fillOpacity="0.6"/>
        ))}
        <line x1={pad} y1={H-pad} x2={W-pad} y2={H-pad} stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
      </svg>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginTop:10}}>
        {phases.map((p,i)=>(
          <div key={i} style={{fontSize:11,color:'#999',textAlign:'center'}}>
            <div style={{fontWeight:500,color:'#666',marginBottom:2}}>{p.label}</div>
            {p.pct}
          </div>
        ))}
      </div>
    </div>
  )
}

function Loader(){
  return(
    <div style={{padding:32,textAlign:'center',color:'#999',fontSize:13}}>
      <div style={{width:20,height:20,border:'2px solid #e8e8e8',borderTopColor:'#888',borderRadius:'50%',animation:'spin 0.7s linear infinite',margin:'0 auto 10px'}}/>
      Loading...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function App(){
  const [token,setToken]=useState(null)
  const [refreshToken,setRefreshToken]=useState(null)
  const [user,setUser]=useState(null)
  const [page,setPage]=useState('connect')
  const [playlists,setPlaylists]=useState([])
  const [likedTracks,setLikedTracks]=useState([])
  const [recentTracks,setRecentTracks]=useState([])
  const [topTracks,setTopTracks]=useState([])
  const [topRange,setTopRange]=useState('short_term')
  const [openPlaylist,setOpenPlaylist]=useState(null)
  const [openPlaylistTracks,setOpenPlaylistTracks]=useState([])
  const [dailyMix,setDailyMix]=useState([])
  const [weekendMix,setWeekendMix]=useState([])
  const [loading,setLoading]=useState({})
  const [toast,setToast]=useState('')
  const [mood,setMood]=useState('Focus')
  const [bass,setBass]=useState(40)
  const [energy,setEnergy]=useState(45)
  const [bpm,setBpm]=useState(100)
  const [vox,setVox]=useState(1)

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(''),2800)}

  const spFetch=useCallback(async(url)=>{
    const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`}})
    if(r.status===401){
      if(refreshToken){
        const res=await fetch('/api/refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refreshToken})})
        const data=await res.json()
        if(data.access_token){setToken(data.access_token);return spFetch(url)}
      }
      setToken(null);setPage('connect');throw new Error('Unauthorized')
    }
    if(!r.ok)throw new Error(r.status)
    return r.json()
  },[token,refreshToken])

  useEffect(()=>{
    const hash=window.location.hash.substring(1)
    if(hash){
      const p=new URLSearchParams(hash)
      const at=p.get('access_token')
      const rt=p.get('refresh_token')
      if(at){setToken(at);if(rt)setRefreshToken(rt);window.history.replaceState({},'','/')}
    }
  },[])

  useEffect(()=>{
    if(!token)return
    spFetch('https://api.spotify.com/v1/me').then(u=>{
      setUser(u);setPage('playlists')
      loadPlaylists();loadLiked();loadRecent();loadTop('short_term')
    }).catch(()=>{})
  },[token])

  async function loadPlaylists(){
    setLoading(l=>({...l,playlists:true}))
    try{
      let items=[],url='https://api.spotify.com/v1/me/playlists?limit=50'
      while(url&&items.length<100){const d=await spFetch(url);items=items.concat(d.items||[]);url=d.next}
      setPlaylists(items)
    }finally{setLoading(l=>({...l,playlists:false}))}
  }

  async function loadLiked(){
    setLoading(l=>({...l,liked:true}))
    try{
      let items=[],url='https://api.spotify.com/v1/me/tracks?limit=50'
      while(url&&items.length<100){const d=await spFetch(url);items=items.concat((d.items||[]).map(i=>i.track).filter(Boolean));url=d.next}
      setLikedTracks(items)
    }finally{setLoading(l=>({...l,liked:false}))}
  }

  async function loadRecent(){
    setLoading(l=>({...l,recent:true}))
    try{
      const d=await spFetch('https://api.spotify.com/v1/me/player/recently-played?limit=50')
      setRecentTracks((d.items||[]).map(i=>i.track).filter(Boolean))
    }finally{setLoading(l=>({...l,recent:false}))}
  }

  async function loadTop(range){
    setLoading(l=>({...l,top:true}));setTopRange(range)
    try{
      const d=await spFetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${range}`)
      setTopTracks(d.items||[])
    }finally{setLoading(l=>({...l,top:false}))}
  }

  async function loadPlaylistTracks(pl){
    setOpenPlaylist(pl);setPage('pltracks');setOpenPlaylistTracks([])
    setLoading(l=>({...l,pltracks:true}))
    try{
      let items=[],url=`https://api.spotify.com/v1/playlists/${pl.id}/tracks?limit=50`
      while(url&&items.length<100){const d=await spFetch(url);items=items.concat((d.items||[]).filter(i=>i.track?.name).map(i=>i.track));url=d.next}
      setOpenPlaylistTracks(items)
    }finally{setLoading(l=>({...l,pltracks:false}))}
  }

  function buildDaily(){
    const pool=[...topTracks,...likedTracks].filter(Boolean)
    if(!pool.length){showToast('Still loading your library...');return}
    const seen=new Set()
    const mix=shuffle(pool.filter(t=>{if(!t||seen.has(t.id))return false;seen.add(t.id);return true})).slice(0,30)
    setDailyMix(mix);setPage('daily')
  }

  function buildWeekend(){
    const pool=[...likedTracks,...topTracks].filter(Boolean)
    if(!pool.length){showToast('Still loading your library...');return}
    const seen=new Set()
    const mix=shuffle(pool.filter(t=>{if(!t||seen.has(t.id))return false;seen.add(t.id);return true})).slice(0,24)
    setWeekendMix(mix);setPage('weekend')
  }

  async function savePlaylist(type){
    if(!user){showToast('Not connected');return}
    const tracks=type==='daily'?dailyMix:type==='weekend'?weekendMix:likedTracks.slice(0,50)
    if(!tracks.length){showToast('Generate a mix first');return}
    const names={
      daily:`wave. Daily Mix · ${new Date().toLocaleDateString()}`,
      weekend:`wave. Weekend Set · ${new Date().toLocaleDateString()}`,
      liked:'wave. Liked Export'
    }
    try{
      const pl=await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`,{
        method:'POST',
        headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
        body:JSON.stringify({name:names[type],public:false,description:`Made with wave. · Mood: ${mood}`})
      }).then(r=>r.json())
      await fetch(`https://api.spotify.com/v1/playlists/${pl.id}/tracks`,{
        method:'POST',
        headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
        body:JSON.stringify({uris:tracks.filter(t=>t?.uri).map(t=>t.uri)})
      })
      showToast('Saved to Spotify!')
      loadPlaylists()
    }catch{showToast('Save failed — please try again')}
  }

  function applyMood(m){
    setMood(m)
    const p=MOOD_PRESETS[m]
    setBass(p.bass);setEnergy(p.energy);setBpm(p.bpm)
  }

  const bpmLo=Math.max(60,bpm-24),bpmHi=Math.min(200,bpm+24)
  const profileTags=[mood,BASS_LABELS[Math.min(Math.round(bass/20),5)],`${bpmLo}–${bpmHi} bpm`,ENERGY_LABELS[Math.min(Math.round(energy/20),5)],VOX_LABELS[vox]]

  function NavItem({id,label,icon,onClick}){
    const active=page===id||(id==='pltracks'&&page==='pltracks')
    return(
      <div onClick={onClick||(() => setPage(id))} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:8,cursor:'pointer',fontSize:13,color:active?'#1a1a1a':'#777',fontWeight:active?500:400,background:active?'#f5f5f3':'',marginBottom:1,whiteSpace:'nowrap',transition:'all 0.12s'}}
        onMouseEnter={e=>{if(!active)e.currentTarget.style.background='#f9f9f7'}}
        onMouseLeave={e=>{if(!active)e.currentTarget.style.background=''}}>
        {icon}
        <span>{label}</span>
        {id==='playlists'&&playlists.length>0&&<span style={{fontSize:10,background:'#f0f0ee',color:'#aaa',padding:'1px 6px',borderRadius:8,marginLeft:'auto'}}>{playlists.length}</span>}
        {id==='liked'&&likedTracks.length>0&&<span style={{fontSize:10,background:'#f0f0ee',color:'#aaa',padding:'1px 6px',borderRadius:8,marginLeft:'auto'}}>{likedTracks.length}</span>}
      </div>
    )
  }

  const ni={width:15,height:15,flexShrink:0,opacity:0.5}

  return(
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',background:'#f5f5f3',minHeight:'100vh'}}>

      {/* TOPBAR */}
      <div style={{background:'#fff',borderBottom:'0.5px solid rgba(0,0,0,0.08)',padding:'13px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{fontSize:16,fontWeight:500,letterSpacing:-0.5}}>wave<span style={{color:'#1DB954'}}>.</span></div>
        {user&&(
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {user.images?.[0]?.url&&<img src={user.images[0].url} alt="" style={{width:26,height:26,borderRadius:'50%',objectFit:'cover'}}/>}
            <div style={{display:'flex',alignItems:'center',gap:7,padding:'5px 12px',borderRadius:20,border:'0.5px solid rgba(0,0,0,0.1)',background:'#f5f5f3',fontSize:12,color:'#666'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#1DB954'}}/>
              <span>{user.display_name||user.id}</span>
              <span style={{color:'#ccc',margin:'0 2px'}}>·</span>
              <span style={{cursor:'pointer',color:'#bbb'}} onClick={()=>{setToken(null);setUser(null);setPage('connect')}}>log out</span>
            </div>
          </div>
        )}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'200px 1fr',minHeight:'calc(100vh - 49px)'}}>

        {/* SIDEBAR */}
        <div style={{background:'#fff',borderRight:'0.5px solid rgba(0,0,0,0.07)',padding:'20px 12px',position:'sticky',top:49,height:'calc(100vh - 49px)',overflowY:'auto'}}>
          <div style={{fontSize:10,fontWeight:500,color:'#bbb',letterSpacing:'0.8px',textTransform:'uppercase',padding:'0 8px',marginBottom:8}}>Music</div>
          <NavItem id="playlists" label="Playlists" icon={<svg style={ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}/>
          <NavItem id="liked" label="Liked songs" icon={<svg style={ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>}/>
          <NavItem id="recent" label="Recently played" icon={<svg style={ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}/>
          <NavItem id="top" label="Top tracks" icon={<svg style={ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>}/>
          <div style={{fontSize:10,fontWeight:500,color:'#bbb',letterSpacing:'0.8px',textTransform:'uppercase',padding:'0 8px',marginBottom:8,marginTop:18}}>Generate</div>
          <NavItem id="daily" label="Daily mix" onClick={()=>{if(page!=='daily')buildDaily()}} icon={<svg style={ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}/>
          <NavItem id="weekend" label="Weekend set" onClick={()=>{if(page!=='weekend')buildWeekend()}} icon={<svg style={ni} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}/>
        </div>

        {/* MAIN */}
        <div style={{padding:'28px 32px',maxWidth:880}}>

          {/* CONNECT */}
          {page==='connect'&&(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:440,textAlign:'center'}}>
              <div style={{width:60,height:60,borderRadius:'50%',background:'#1DB954',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 22px'}}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </div>
              <div style={{fontSize:24,fontWeight:500,marginBottom:8,letterSpacing:-0.5}}>Welcome to wave.</div>
              <div style={{fontSize:14,color:'#888',lineHeight:1.7,marginBottom:30,maxWidth:300}}>Your daily playlists and weekend mixes, shaped by your mood.</div>
              <a href="/api/auth/login" style={{display:'inline-flex',alignItems:'center',gap:10,background:'#1DB954',color:'#fff',borderRadius:30,padding:'13px 30px',fontSize:14,fontWeight:500,textDecoration:'none'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                Log in with Spotify
              </a>
            </div>
          )}

          {/* PLAYLISTS */}
          {page==='playlists'&&(
            <div>
              <div style={{fontSize:22,fontWeight:500,letterSpacing:-0.4,marginBottom:4}}>Your playlists</div>
              <div style={{fontSize:12,color:'#999',marginBottom:20}}>{playlists.length} playlists</div>
              {loading.playlists?<Loader/>:(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
                  {playlists.map(p=>(
                    <div key={p.id} style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:12,overflow:'hidden',cursor:'pointer',transition:'border-color 0.12s'}}
                      onClick={()=>loadPlaylistTracks(p)}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,0,0,0.18)'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(0,0,0,0.08)'}>
                      <div style={{width:'100%',aspectRatio:1,background:'#f0f0ee',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {p.images?.[0]?.url?<img src={p.images[0].url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{opacity:0.2}}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
                      </div>
                      <div style={{padding:'9px 10px 12px'}}>
                        <div style={{fontSize:12,fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div>
                        <div style={{fontSize:11,color:'#aaa',marginTop:2}}>{p.tracks?.total||0} tracks</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PLAYLIST TRACKS */}
          {page==='pltracks'&&openPlaylist&&(
            <div>
              <div style={{fontSize:12,color:'#aaa',cursor:'pointer',marginBottom:16,display:'inline-flex',alignItems:'center',gap:4}} onClick={()=>setPage('playlists')}>← playlists</div>
              <div style={{fontSize:22,fontWeight:500,letterSpacing:-0.4,marginBottom:4}}>{openPlaylist.name}</div>
              <div style={{fontSize:12,color:'#999',marginBottom:20}}>{openPlaylist.tracks?.total||0} tracks</div>
              {loading.pltracks?<Loader/>:<TrackList tracks={openPlaylistTracks}/>}
            </div>
          )}

          {/* LIKED */}
          {page==='liked'&&(
            <div>
              <div style={{fontSize:22,fontWeight:500,letterSpacing:-0.4,marginBottom:4}}>Liked songs</div>
              <div style={{fontSize:12,color:'#999',marginBottom:20}}>{likedTracks.length} songs</div>
              {loading.liked?<Loader/>:<TrackList tracks={likedTracks}/>}
              <div style={{display:'flex',gap:8,marginTop:16}}>
                <button style={{padding:'8px 16px',borderRadius:8,fontSize:12,fontFamily:'inherit',cursor:'pointer',border:'none',background:'#1DB954',color:'#fff',fontWeight:500}} onClick={()=>savePlaylist('liked')}>Save as playlist</button>
              </div>
            </div>
          )}

          {/* RECENT */}
          {page==='recent'&&(
            <div>
              <div style={{fontSize:22,fontWeight:500,letterSpacing:-0.4,marginBottom:4}}>Recently played</div>
              <div style={{fontSize:12,color:'#999',marginBottom:20}}>Last 50 tracks</div>
              {loading.recent?<Loader/>:<TrackList tracks={recentTracks}/>}
            </div>
          )}

          {/* TOP */}
          {page==='top'&&(
            <div>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
                <div>
                  <div style={{fontSize:22,fontWeight:500,letterSpacing:-0.4,marginBottom:4}}>Top tracks</div>
                  <div style={{fontSize:12,color:'#999',marginBottom:20}}>{{short_term:'Last 4 weeks',medium_term:'Last 6 months',long_term:'All time'}[topRange]}</div>
                </div>
                <div style={{display:'flex',gap:6,paddingTop:4}}>
                  {[['short_term','4 weeks'],['medium_term','6 months'],['long_term','All time']].map(([r,l])=>(
                    <button key={r} style={{padding:'6px 12px',borderRadius:8,fontSize:11,fontFamily:'inherit',cursor:'pointer',border:'0.5px solid rgba(0,0,0,0.12)',background:topRange===r?'#1a1a1a':'#fff',color:topRange===r?'#fff':'#666',fontWeight:topRange===r?500:400}} onClick={()=>loadTop(r)}>{l}</button>
                  ))}
                </div>
              </div>
              {loading.top?<Loader/>:<TrackList tracks={topTracks}/>}
            </div>
          )}

          {/* DAILY MIX */}
          {page==='daily'&&(
            <div>
              <div style={{fontSize:22,fontWeight:500,letterSpacing:-0.4,marginBottom:4}}>Daily mix</div>
              <div style={{fontSize:12,color:'#999',marginBottom:20}}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>

              {/* MOOD */}
              <div style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:12,padding:'16px 18px',marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:500,color:'#bbb',letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:12}}>Mood</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
                  {Object.keys(MOOD_PRESETS).map(m=>(
                    <button key={m} style={{border:`0.5px solid ${mood===m?MOOD_COLORS[m]:'rgba(0,0,0,0.1)'}`,background:mood===m?MOOD_COLORS[m]:'#fff',borderRadius:8,padding:'9px 6px',cursor:'pointer',textAlign:'center',transition:'all 0.15s',fontFamily:'inherit'}}
                      onClick={()=>applyMood(m)}>
                      <div style={{fontSize:12,fontWeight:500,color:mood===m?'#fff':'#666'}}>{m}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* GAUGES */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                <Gauge label="Bass" value={bass} onChange={setBass} color="#1a1a1a"/>
                <Gauge label="Energy" value={energy} onChange={setEnergy} color="#1DB954"/>
              </div>

              {/* SLIDERS */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                <div style={{background:'#f7f7f5',borderRadius:8,padding:'13px 14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                    <span style={{fontSize:11,fontWeight:500,color:'#888'}}>BPM range</span>
                    <span style={{fontSize:11,fontWeight:500,color:'#1a1a1a'}}>{bpmLo}–{bpmHi}</span>
                  </div>
                  <input type="range" min="60" max="180" value={bpm} step="1" onChange={e=>setBpm(+e.target.value)} style={{width:'100%',accentColor:'#1a1a1a'}}/>
                </div>
                <div style={{background:'#f7f7f5',borderRadius:8,padding:'13px 14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                    <span style={{fontSize:11,fontWeight:500,color:'#888'}}>Vocals</span>
                    <span style={{fontSize:11,fontWeight:500,color:'#1a1a1a'}}>{VOX_LABELS[vox]}</span>
                  </div>
                  <input type="range" min="0" max="2" value={vox} step="1" onChange={e=>setVox(+e.target.value)} style={{width:'100%',accentColor:'#1a1a1a'}}/>
                </div>
              </div>

              {/* PROFILE TAGS */}
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:18}}>
                {profileTags.map(t=><span key={t} style={{fontSize:11,padding:'4px 10px',borderRadius:20,border:'0.5px solid rgba(0,0,0,0.1)',background:'#fff',color:'#777'}}>{t}</span>)}
              </div>

              {/* STATS */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:18}}>
                {[['Tracks',dailyMix.length||'—'],['From library',dailyMix.length?Math.round(dailyMix.filter(t=>likedTracks.find(l=>l.id===t.id)).length/dailyMix.length*100)+'%':'—'],['Generated',dailyMix.length?new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'—']].map(([l,v])=>(
                  <div key={l} style={{background:'#f7f7f5',borderRadius:8,padding:'11px 13px'}}>
                    <div style={{fontSize:11,color:'#aaa',marginBottom:3}}>{l}</div>
                    <div style={{fontSize:20,fontWeight:500}}>{v}</div>
                  </div>
                ))}
              </div>

              <TrackList tracks={dailyMix}/>
              <div style={{display:'flex',gap:8,marginTop:14,flexWrap:'wrap'}}>
                <button style={{padding:'9px 18px',borderRadius:8,fontSize:12,fontFamily:'inherit',cursor:'pointer',border:'none',background:'#1DB954',color:'#fff',fontWeight:500}} onClick={()=>savePlaylist('daily')}>Save to Spotify</button>
                <button style={{padding:'8px 14px',borderRadius:8,fontSize:12,fontFamily:'inherit',cursor:'pointer',border:'0.5px solid rgba(0,0,0,0.12)',background:'#fff',color:'#666'}} onClick={buildDaily}>Regenerate</button>
              </div>
            </div>
          )}

          {/* WEEKEND SET */}
          {page==='weekend'&&(
            <div>
              <div style={{fontSize:22,fontWeight:500,letterSpacing:-0.4,marginBottom:4}}>Weekend set</div>
              <div style={{fontSize:12,color:'#999',marginBottom:20}}>24-track mix · shaped for a full session</div>

              {/* STATS */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
                {[['Tracks',weekendMix.length||'—'],['Duration',weekendMix.length?fmtMs(weekendMix.reduce((s,t)=>s+(t.duration_ms||210000),0)):'—'],['Energy arc','Rise']].map(([l,v])=>(
                  <div key={l} style={{background:'#f7f7f5',borderRadius:8,padding:'11px 13px'}}>
                    <div style={{fontSize:11,color:'#aaa',marginBottom:3}}>{l}</div>
                    <div style={{fontSize:20,fontWeight:500}}>{v}</div>
                  </div>
                ))}
              </div>

              {/* ENERGY ARC VISUALIZER */}
              <EnergyArc tracks={weekendMix}/>

              <TrackList tracks={weekendMix}/>
              <div style={{display:'flex',gap:8,marginTop:14,flexWrap:'wrap'}}>
                <button style={{padding:'9px 18px',borderRadius:8,fontSize:12,fontFamily:'inherit',cursor:'pointer',border:'none',background:'#1DB954',color:'#fff',fontWeight:500}} onClick={()=>savePlaylist('weekend')}>Save to Spotify</button>
                <button style={{padding:'8px 14px',borderRadius:8,fontSize:12,fontFamily:'inherit',cursor:'pointer',border:'0.5px solid rgba(0,0,0,0.12)',background:'#fff',color:'#666'}} onClick={buildWeekend}>Rebuild set</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* TOAST */}
      {toast&&(
        <div style={{position:'fixed',bottom:22,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',padding:'9px 20px',borderRadius:22,fontSize:13,zIndex:100,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}>
          {toast}
        </div>
      )}
    </div>
  )
}
