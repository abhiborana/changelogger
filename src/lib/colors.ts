export type ThemeColorId =
  | 'coral'
  | 'amber'
  | 'lime'
  | 'mint'
  | 'teal'
  | 'sky'
  | 'indigo'
  | 'violet'
  | 'rose'
  | 'peach'
  | 'slate'

export type ThemeColor = {
  id: ThemeColorId
  label: string
  solid: string
  soft: string
  border: string
  text: string
}

export const THEME_COLORS: ThemeColor[] = [
  {
    id: 'coral',
    label: 'Coral',
    solid: '#e07a5f',
    soft: 'rgba(224, 122, 95, 0.16)',
    border: 'rgba(224, 122, 95, 0.45)',
    text: '#f0b5a4',
  },
  {
    id: 'amber',
    label: 'Amber',
    solid: '#d4a017',
    soft: 'rgba(212, 160, 23, 0.16)',
    border: 'rgba(212, 160, 23, 0.45)',
    text: '#e8c86a',
  },
  {
    id: 'lime',
    label: 'Lime',
    solid: '#8fbf5a',
    soft: 'rgba(143, 191, 90, 0.16)',
    border: 'rgba(143, 191, 90, 0.45)',
    text: '#b5d88a',
  },
  {
    id: 'mint',
    label: 'Mint',
    solid: '#5d9b78',
    soft: 'rgba(93, 155, 120, 0.16)',
    border: 'rgba(93, 155, 120, 0.45)',
    text: '#8fc4a3',
  },
  {
    id: 'teal',
    label: 'Teal',
    solid: '#3d9b94',
    soft: 'rgba(61, 155, 148, 0.16)',
    border: 'rgba(61, 155, 148, 0.45)',
    text: '#78c4be',
  },
  {
    id: 'sky',
    label: 'Sky',
    solid: '#5b9fd4',
    soft: 'rgba(91, 159, 212, 0.16)',
    border: 'rgba(91, 159, 212, 0.45)',
    text: '#9bc4e8',
  },
  {
    id: 'indigo',
    label: 'Indigo',
    solid: '#6b7fd7',
    soft: 'rgba(107, 127, 215, 0.16)',
    border: 'rgba(107, 127, 215, 0.45)',
    text: '#a0adf0',
  },
  {
    id: 'violet',
    label: 'Violet',
    solid: '#9b7ed9',
    soft: 'rgba(155, 126, 217, 0.16)',
    border: 'rgba(155, 126, 217, 0.45)',
    text: '#c2aef0',
  },
  {
    id: 'rose',
    label: 'Rose',
    solid: '#d4728a',
    soft: 'rgba(212, 114, 138, 0.16)',
    border: 'rgba(212, 114, 138, 0.45)',
    text: '#e8a4b4',
  },
  {
    id: 'peach',
    label: 'Peach',
    solid: '#d4896a',
    soft: 'rgba(212, 137, 106, 0.16)',
    border: 'rgba(212, 137, 106, 0.45)',
    text: '#e8b59a',
  },
  {
    id: 'slate',
    label: 'Slate',
    solid: '#8a8a9a',
    soft: 'rgba(138, 138, 154, 0.16)',
    border: 'rgba(138, 138, 154, 0.45)',
    text: '#b4b4c0',
  },
]

const COLOR_BY_ID = Object.fromEntries(THEME_COLORS.map((color) => [color.id, color])) as Record<
  ThemeColorId,
  ThemeColor
>

export const DEFAULT_PROVIDER_COLOR: ThemeColorId = 'sky'
export const DEFAULT_TODO_COLOR: ThemeColorId = 'teal'

export const PRESET_COLORS: Record<string, ThemeColorId> = {
  openai: 'mint',
  cursor: 'sky',
  claude: 'coral',
  github: 'slate',
  vscode: 'indigo',
  chrome: 'amber',
  notion: 'peach',
  nextjs: 'rose',
}

const FALLBACK_CYCLE: ThemeColorId[] = [
  'coral',
  'amber',
  'lime',
  'mint',
  'teal',
  'sky',
  'indigo',
  'violet',
  'rose',
  'peach',
]

export function isThemeColorId(value: unknown): value is ThemeColorId {
  return typeof value === 'string' && value in COLOR_BY_ID
}

export function getThemeColor(id: ThemeColorId | string | undefined | null): ThemeColor {
  if (id && isThemeColorId(id)) return COLOR_BY_ID[id]
  return COLOR_BY_ID[DEFAULT_PROVIDER_COLOR]
}

export function colorForPreset(presetId?: string): ThemeColorId {
  if (presetId && presetId in PRESET_COLORS) return PRESET_COLORS[presetId]
  return DEFAULT_PROVIDER_COLOR
}

export function nextColorForIndex(index: number): ThemeColorId {
  return FALLBACK_CYCLE[index % FALLBACK_CYCLE.length]
}
