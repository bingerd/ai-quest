import Phaser from 'phaser'
import type { HeistBlock, HeistSceneApi, HeistSceneConfig } from './types'

export const SCENE_WIDTH = 880
export const SCENE_HEIGHT = 520

const VAULT = { x: 40, y: 60, w: 300, h: 420 }
const SHELF = { x: 380, y: 60, w: 460, h: 420 }
const BLOCK_W = 200
const GAP = 10

interface BlockView {
  data: HeistBlock
  container: Phaser.GameObjects.Container
  rect: Phaser.GameObjects.Rectangle
  label: Phaser.GameObjects.Text
  badge: Phaser.GameObjects.Text
  height: number
  selected: boolean
}

/**
 * Token Heist: drag document blocks from the shelf into the vault (context window).
 * Block height is proportional to token count. Click or tap toggles too, so the
 * game never requires dragging.
 */
export class TokenHeistScene extends Phaser.Scene implements HeistSceneApi {
  private cfg!: HeistSceneConfig
  private blocks: BlockView[] = []
  private vaultFill!: Phaser.GameObjects.Rectangle
  private vaultText!: Phaser.GameObjects.Text
  private colors!: ReturnType<typeof palette>
  private dragMoved = false

  constructor() {
    super('token-heist')
  }

  init(cfg: HeistSceneConfig) {
    this.cfg = cfg
    this.colors = palette(cfg.dark)
  }

  create() {
    const c = this.colors
    this.cameras.main.setBackgroundColor(c.bg)

    // Vault
    this.add.rectangle(VAULT.x, VAULT.y, VAULT.w, VAULT.h, c.vault).setOrigin(0).setStrokeStyle(2, c.vaultStroke)
    this.vaultFill = this.add.rectangle(VAULT.x + 4, VAULT.y + VAULT.h - 4, VAULT.w - 8, VAULT.h - 8, c.fill, 0.18).setOrigin(0, 1).setScale(1, 0)
    this.add.text(VAULT.x, VAULT.y - 34, 'CONTEXT WINDOW', { fontFamily: 'sans-serif', fontSize: '14px', color: c.muted, fontStyle: 'bold' })
    this.vaultText = this.add.text(VAULT.x + VAULT.w, VAULT.y - 34, '', { fontFamily: 'sans-serif', fontSize: '14px', color: c.text }).setOrigin(1, 0)

    // Shelf
    this.add.rectangle(SHELF.x, SHELF.y, SHELF.w, SHELF.h, c.shelf).setOrigin(0).setStrokeStyle(2, c.shelfStroke)
    this.add.text(SHELF.x, SHELF.y - 34, 'AVAILABLE DOCUMENTS', { fontFamily: 'sans-serif', fontSize: '14px', color: c.muted, fontStyle: 'bold' })
    this.add.text(SHELF.x + SHELF.w, SHELF.y - 34, 'drag or click', { fontFamily: 'sans-serif', fontSize: '12px', color: c.muted }).setOrigin(1, 0)

    const maxTokens = Math.max(...this.cfg.blocks.map((b) => b.tokens), 1)
    const selected = new Set(this.cfg.initialSelectedIds)
    this.blocks = this.cfg.blocks.map((data) => this.makeBlock(data, maxTokens, selected.has(data.id)))

    this.input.on('dragstart', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) => {
      this.dragMoved = false
      obj.setDepth(10)
    })
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, x: number, y: number) => {
      this.dragMoved = true
      obj.setPosition(x, y)
    })
    this.input.on('dragend', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) => {
      obj.setDepth(0)
      const view = this.blocks.find((b) => b.container === obj)
      if (!view) return
      const inVault = obj.x + BLOCK_W / 2 < VAULT.x + VAULT.w + 40
      if (this.dragMoved && inVault !== view.selected) {
        this.cfg.onToggle(view.data.id)
      } else {
        this.layout()
      }
    })

    this.layout(false)
  }

  private makeBlock(data: HeistBlock, maxTokens: number, selected: boolean): BlockView {
    const c = this.colors
    const height = Math.max(34, Math.round((data.tokens / maxTokens) * 150))
    const rect = this.add.rectangle(0, 0, BLOCK_W, height, c.block).setOrigin(0).setStrokeStyle(2, c.blockStroke)
    const label = this.add.text(10, 8, data.label, { fontFamily: 'sans-serif', fontSize: '14px', color: c.text, fontStyle: 'bold', wordWrap: { width: BLOCK_W - 20 } })
    const badge = this.add.text(BLOCK_W - 10, height - 8, `${data.tokens.toLocaleString('en-US')} tok`, { fontFamily: 'sans-serif', fontSize: '12px', color: c.muted }).setOrigin(1, 1)
    const container = this.add.container(0, 0, [rect, label, badge])
    container.setSize(BLOCK_W, height)
    container.setInteractive(new Phaser.Geom.Rectangle(BLOCK_W / 2, height / 2, BLOCK_W, height), Phaser.Geom.Rectangle.Contains)
    this.input.setDraggable(container)
    const view: BlockView = { data, container, rect, label, badge, height, selected }
    container.on('pointerup', () => {
      if (!this.dragMoved) this.cfg.onToggle(data.id)
    })
    container.on('pointerover', () => rect.setStrokeStyle(2, c.hover))
    container.on('pointerout', () => rect.setStrokeStyle(2, view.selected ? c.selectedStroke : c.blockStroke))
    return view
  }

  /** Position blocks in two columns per area (vault / shelf), animated. */
  private layout(animate = true) {
    const c = this.colors
    const place = (views: BlockView[], area: { x: number; y: number; w: number }) => {
      const cols = Math.max(1, Math.floor((area.w - GAP) / (BLOCK_W + GAP)))
      const colY = new Array<number>(cols).fill(area.y + GAP)
      for (const v of views) {
        const col = colY.indexOf(Math.min(...colY))
        const x = area.x + GAP + col * (BLOCK_W + GAP)
        const y = colY[col] ?? area.y + GAP
        colY[col] = y + v.height + GAP
        if (animate) this.tweens.add({ targets: v.container, x, y, duration: 220, ease: 'Cubic.easeOut' })
        else v.container.setPosition(x, y)
      }
    }
    place(this.blocks.filter((b) => b.selected), VAULT)
    place(this.blocks.filter((b) => !b.selected), SHELF)

    for (const v of this.blocks) {
      v.rect.setFillStyle(v.selected ? c.selected : c.block)
      v.rect.setStrokeStyle(2, v.selected ? c.selectedStroke : c.blockStroke)
    }

    const used = this.blocks.filter((b) => b.selected).reduce((s, b) => s + b.data.tokens, 0)
    const ratio = Math.min(1, used / this.cfg.tokenLimit)
    const over = used > this.cfg.tokenLimit
    this.tweens.add({ targets: this.vaultFill, scaleY: ratio, duration: 220 })
    this.vaultFill.setFillStyle(over ? c.over : c.fill, 0.18)
    this.vaultText.setText(`${used.toLocaleString('en-US')} / ${this.cfg.tokenLimit.toLocaleString('en-US')}`)
    this.vaultText.setColor(over ? c.overText : c.text)
  }

  setSelection(ids: string[]) {
    const set = new Set(ids)
    let changed = false
    for (const v of this.blocks) {
      const next = set.has(v.data.id)
      if (next !== v.selected) {
        v.selected = next
        changed = true
      }
    }
    if (changed || this.blocks.length > 0) this.layout()
  }

  reveal(relevance: Record<string, number>) {
    const c = this.colors
    for (const v of this.blocks) {
      const r = relevance[v.data.id] ?? 0
      const color = r >= 0.7 ? c.good : r >= 0.4 ? c.warn : c.bad
      v.rect.setStrokeStyle(3, color)
      v.badge.setText(r >= 0.7 ? 'essential' : r >= 0.4 ? 'useful' : 'irrelevant').setColor(`#${color.toString(16).padStart(6, '0')}`)
      v.container.disableInteractive()
    }
  }

  clearReveal() {
    for (const v of this.blocks) {
      v.badge.setText(`${v.data.tokens.toLocaleString('en-US')} tok`).setColor(this.colors.muted)
      v.container.setInteractive()
    }
    this.layout()
  }
}

function palette(dark: boolean) {
  return dark
    ? {
        bg: 0x121a2e,
        vault: 0x1a2440,
        vaultStroke: 0x6366f1,
        shelf: 0x0f1628,
        shelfStroke: 0x34436b,
        block: 0x243052,
        blockStroke: 0x34436b,
        selected: 0x312e81,
        selectedStroke: 0x818cf8,
        hover: 0xa5b4fc,
        fill: 0x6366f1,
        over: 0xdc2626,
        text: '#f1f5f9',
        muted: '#94a3b8',
        overText: '#f87171',
        good: 0x22c55e,
        warn: 0xf59e0b,
        bad: 0xef4444,
      }
    : {
        bg: 0xffffff,
        vault: 0xeef2ff,
        vaultStroke: 0x6366f1,
        shelf: 0xf8fafc,
        shelfStroke: 0xcbd5e1,
        block: 0xffffff,
        blockStroke: 0xcbd5e1,
        selected: 0xe0e7ff,
        selectedStroke: 0x6366f1,
        hover: 0x4f46e5,
        fill: 0x6366f1,
        over: 0xdc2626,
        text: '#0f172a',
        muted: '#64748b',
        overText: '#dc2626',
        good: 0x16a34a,
        warn: 0xd97706,
        bad: 0xdc2626,
      }
}
