import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface YouTubePlayer {
  loadVideoById: (id: string) => void
  playVideo: () => void
  pauseVideo: () => void
  setVolume: (v: number) => void
  getVideoData: () => { video_id: string; title: string; author: string }
  destroy: () => void
}

export function useYouTubeAudioPlayer(
  onVideoInfo: (info: { video_id: string; title: string; author: string }) => void,
  onPlayerEnd?: () => void
) {
  const playerRef = useRef<YouTubePlayer|null>(null)
  const pendingVideoRef = useRef<string|null>(null)
  // on va garder la <div> YouTube hors de React
  const containerElRef = useRef<HTMLDivElement|null>(null)

  useEffect(() => {
    // 1) créer le container imperativement
    const container = document.createElement('div')
    container.style.cssText = 'width:0;height:0;overflow:hidden;position:absolute;'
    document.body.appendChild(container)
    containerElRef.current = container

    // 2) loader l’API si besoin, puis instancier le player
    function createPlayer() {
      if (!window.YT || !containerElRef.current) return
      playerRef.current = new window.YT.Player(containerElRef.current, {
        height: '0',
        width: '0',
        videoId: '',
        playerVars: {
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          origin: window.location.origin,
          host: 'https://www.youtube.com',
        },
        events: {
          onReady: (e: any) => {
            if (pendingVideoRef.current) {
              playerRef.current!.loadVideoById(pendingVideoRef.current)
              playerRef.current!.playVideo()
              pendingVideoRef.current = null
            }
          },
          onStateChange: (evt: any) => {
            const state = evt.data
            if (state === window.YT.PlayerState.PLAYING) {
              onVideoInfo(evt.target.getVideoData())
            }
            if (state === window.YT.PlayerState.ENDED) {
              onPlayerEnd?.()
            }
          },
          onError: (err: any) => console.error('YT Player error', err),
        },
      })
    }

    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
      window.onYouTubeIframeAPIReady = createPlayer
    } else {
      createPlayer()
    }

    return () => {
      // destruction propre
      playerRef.current?.destroy()
      playerRef.current = null
      // retirer le container imperativement
      if (containerElRef.current && containerElRef.current.parentNode) {
        containerElRef.current.parentNode.removeChild(containerElRef.current)
      }
      window.onYouTubeIframeAPIReady = () => {}
    }
  }, [onVideoInfo, onPlayerEnd])

  const loadAndPlay = (videoId: string) => {
    if (playerRef.current) {
      playerRef.current.loadVideoById(videoId)
      playerRef.current.playVideo()
    } else {
      pendingVideoRef.current = videoId
    }
  }
  const playVideo = () => playerRef.current?.playVideo()
  const pause     = () => playerRef.current?.pauseVideo()
  const setVolume = (v: number) =>
    playerRef.current?.setVolume(Math.round(v * 100))

  return { loadAndPlay, playVideo, pause, setVolume }
}
