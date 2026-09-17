export interface HeistBlock {
  id: string
  label: string
  tokens: number
}

export interface HeistSceneConfig {
  blocks: HeistBlock[]
  tokenLimit: number
  initialSelectedIds: string[]
  dark: boolean
  onToggle: (id: string) => void
}

/** Messages React sends into the scene. */
export interface HeistSceneApi {
  setSelection(ids: string[]): void
  reveal(relevance: Record<string, number>): void
  clearReveal(): void
}
