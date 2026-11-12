import type { AppState, Provider, Todo } from '@/types'

const STORAGE_KEY = 'changelogger_state'

const EMPTY_STATE: AppState = {
  providers: [],
  todos: [],
}

function isExtensionStorageAvailable() {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local)
}

export async function loadState(): Promise<AppState> {
  if (!isExtensionStorageAvailable()) {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY_STATE }
    try {
      return { ...EMPTY_STATE, ...(JSON.parse(raw) as AppState) }
    } catch {
      return { ...EMPTY_STATE }
    }
  }

  const result = await chrome.storage.local.get(STORAGE_KEY)
  const value = result[STORAGE_KEY] as AppState | undefined
  if (!value) return { ...EMPTY_STATE }
  return {
    providers: Array.isArray(value.providers) ? value.providers : [],
    todos: Array.isArray(value.todos) ? value.todos : [],
  }
}

export async function saveState(state: AppState): Promise<void> {
  const payload: AppState = {
    providers: state.providers.map(({ fetching: _fetching, ...provider }) => provider),
    todos: state.todos,
  }

  if (!isExtensionStorageAvailable()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: payload })
}

export async function saveProviders(providers: Provider[]): Promise<void> {
  const state = await loadState()
  await saveState({ ...state, providers })
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  const state = await loadState()
  await saveState({ ...state, todos })
}
