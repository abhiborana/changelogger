import { PRESET_COLORS, type ThemeColorId } from '@/lib/colors'

export type Preset = {
  id: string
  name: string
  url: string
  color: ThemeColorId
}

export const PRESETS: Preset[] = [
  {
    id: 'openai',
    name: 'OpenAI API',
    url: 'https://developers.openai.com/api/docs/changelog',
    color: PRESET_COLORS.openai,
  },
  {
    id: 'cursor',
    name: 'Cursor',
    url: 'https://cursor.com/changelog',
    color: PRESET_COLORS.cursor,
  },
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://platform.claude.com/docs/en/release-notes/overview',
    color: PRESET_COLORS.claude,
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.blog/changelog/',
    color: PRESET_COLORS.github,
  },
  {
    id: 'vscode',
    name: 'VS Code',
    url: 'https://code.visualstudio.com/updates',
    color: PRESET_COLORS.vscode,
  },
  {
    id: 'chrome',
    name: 'Chrome',
    url: 'https://developer.chrome.com/release-notes',
    color: PRESET_COLORS.chrome,
  },
  {
    id: 'notion',
    name: 'Notion',
    url: 'https://www.notion.com/releases',
    color: PRESET_COLORS.notion,
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    url: 'https://nextjs.org/blog',
    color: PRESET_COLORS.nextjs,
  },
]
