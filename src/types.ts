export type ChangelogEntry = {
  id: string
  title: string
  summary: string
  dateLabel: string
  dateMs: number | null
  link: string | null
  kind: string | null
  isNew: boolean
}

export type Provider = {
  id: string
  name: string
  url: string
  presetId?: string
  lastFetchedAt: number | null
  lastError: string | null
  entries: ChangelogEntry[]
  fetching?: boolean
}

export type Todo = {
  id: string
  title: string
  done: boolean
  createdAt: number
}

export type AppState = {
  providers: Provider[]
  todos: Todo[]
}

export type FetchPageRequest = {
  type: 'FETCH_PAGE'
  url: string
}

export type FetchPageResponse = {
  ok: boolean
  status: number
  finalUrl: string
  contentType: string
  body: string
  error?: string
}
