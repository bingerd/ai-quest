import { useEffect, useRef } from 'react'
import type Phaser from 'phaser'
import type { HeistBlock, HeistSceneApi } from './types'

export interface TokenHeistGameProps {
  blocks: HeistBlock[]
  tokenLimit: number
  selectedIds: string[]
  onToggle: (id: string) => void
  reveal: Record<string, number> | null
  dark: boolean
}

/**
 * React ↔ Phaser bridge. React owns the selection; the scene only renders it
 * and reports toggle intents. Phaser is imported dynamically so it lives in
 * its own chunk and never loads unless this component mounts.
 */
export default function TokenHeistGame({ blocks, tokenLimit, selectedIds, onToggle, reveal, dark }: TokenHeistGameProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const sceneRef = useRef<HeistSceneApi | null>(null)
  const onToggleRef = useRef(onToggle)
  onToggleRef.current = onToggle
  const initialSelected = useRef(selectedIds)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let cancelled = false
    const host = hostRef.current
    if (!host) return
    ;(async () => {
      const [{ default: PhaserLib }, { TokenHeistScene, SCENE_WIDTH, SCENE_HEIGHT }] = await Promise.all([
        import('phaser'),
        import('./TokenHeistScene'),
      ])
      if (cancelled) return
      const scene = new TokenHeistScene()
      const game = new PhaserLib.Game({
        type: PhaserLib.AUTO,
        parent: host,
        width: SCENE_WIDTH,
        height: SCENE_HEIGHT,
        transparent: true,
        scale: { mode: PhaserLib.Scale.FIT, autoCenter: PhaserLib.Scale.CENTER_HORIZONTALLY, width: SCENE_WIDTH, height: SCENE_HEIGHT },
        scene: [],
        audio: { noAudio: true },
        banner: false,
      })
      game.scene.add('token-heist', scene, true, {
        blocks,
        tokenLimit,
        initialSelectedIds: initialSelected.current,
        dark,
        onToggle: (id: string) => onToggleRef.current(id),
      })
      gameRef.current = game
      sceneRef.current = scene

      // Phaser caches the canvas bounds for pointer maths and only refreshes
      // them on window resize. Layout shifts (lazy chunk, fonts, scrolling)
      // would otherwise skew clicks, so refresh eagerly.
      const refresh = () => game.scale.updateBounds()
      host.addEventListener('pointerdown', refresh, { capture: true, passive: true })
      window.addEventListener('scroll', refresh, { passive: true })
      const ro = new ResizeObserver(() => {
        game.scale.refresh()
        refresh()
      })
      ro.observe(host)
      requestAnimationFrame(refresh)
      cleanupRef.current = () => {
        host.removeEventListener('pointerdown', refresh, { capture: true })
        window.removeEventListener('scroll', refresh)
        ro.disconnect()
      }
    })()
    return () => {
      cancelled = true
      cleanupRef.current?.()
      cleanupRef.current = null
      gameRef.current?.destroy(true)
      gameRef.current = null
      sceneRef.current = null
    }
    // The scene is created once per mount; theme/blocks changes remount via `key` in the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark])

  useEffect(() => {
    sceneRef.current?.setSelection(selectedIds)
  }, [selectedIds])

  useEffect(() => {
    if (reveal) sceneRef.current?.reveal(reveal)
    else sceneRef.current?.clearReveal()
  }, [reveal])

  return (
    <div
      ref={hostRef}
      className="w-full overflow-hidden rounded-xl border line [&_canvas]:mx-auto [&_canvas]:block [&_canvas]:max-w-full"
      style={{ aspectRatio: '880 / 520' }}
      role="img"
      aria-label="Token Heist game board. Use the list view for keyboard access."
    />
  )
}
