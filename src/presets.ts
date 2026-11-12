export type Preset = {
  id: string
  name: string
  url: string
}

export const PRESETS: Preset[] = [
  {
    id: 'openai',
    name: 'OpenAI API',
    url: 'https://developers.openai.com/api/docs/changelog',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    url: 'https://cursor.com/changelog',
  },
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://platform.claude.com/docs/en/release-notes/overview',
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.blog/changelog/',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    url: 'https://code.visualstudio.com/updates',
  },
  {
    id: 'chrome',
    name: 'Chrome',
    url: 'https://developer.chrome.com/release-notes',
  },
  {
    id: 'notion',
    name: 'Notion',
    url: 'https://www.notion.com/releases',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    url: 'https://nextjs.org/blog',
  },
]
