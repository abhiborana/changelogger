import { useCallback, useEffect, useMemo, useState } from 'react'
import { AddSourceDialog } from '@/components/AddSourceDialog'
import { AppHeader } from '@/components/AppHeader'
import { ChangelogPanel } from '@/components/ChangelogPanel'
import { TodoPanel } from '@/components/TodoPanel'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { createProvider, refreshProvider } from '@/lib/providers'
import { createId, normalizeUrl } from '@/lib/utils'
import { loadState, saveProviders, saveTodos } from '@/storage'
import type { Provider, Todo } from '@/types'

export default function App() {
  const [ready, setReady] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [refreshingAll, setRefreshingAll] = useState(false)
  const isWide = useMediaQuery('(min-width: 860px)')
  const isPopup = document.documentElement.dataset.surface === 'popup'
  const useTabs = isPopup || !isWide

  useEffect(() => {
    void loadState().then((state) => {
      setProviders(state.providers)
      setTodos(state.todos)
      setReady(true)
    })
  }, [])

  const persistProviders = useCallback(async (next: Provider[]) => {
    setProviders(next)
    await saveProviders(next)
  }, [])

  const persistTodos = useCallback(async (next: Todo[]) => {
    setTodos(next)
    await saveTodos(next)
  }, [])

  const openTodoCount = useMemo(() => todos.filter((todo) => !todo.done).length, [todos])

  async function handleAddSource(input: { name: string; url: string; presetId?: string }) {
    const normalized = normalizeUrl(input.url)
    if (providers.some((provider) => normalizeUrl(provider.url) === normalized)) return

    const provider = createProvider(input)
    const pending = { ...provider, fetching: true }
    setSelectedProviderId(provider.id)
    setProviders((prev) => [...prev, pending])

    const refreshed = await refreshProvider(provider)
    const next = [...providers.filter((item) => item.id !== provider.id), refreshed]
    await persistProviders(next)
  }

  async function handleRefreshProvider(id: string) {
    const current = providers.find((provider) => provider.id === id)
    if (!current) return

    setProviders((prev) =>
      prev.map((provider) =>
        provider.id === id ? { ...provider, fetching: true } : provider,
      ),
    )

    const refreshed = await refreshProvider(current)
    const next = providers.map((provider) => (provider.id === id ? refreshed : provider))
    await persistProviders(next)
  }

  async function handleRefreshAll() {
    if (providers.length === 0) return
    setRefreshingAll(true)
    const snapshot = providers
    setProviders((prev) => prev.map((provider) => ({ ...provider, fetching: true })))

    const refreshed = await Promise.all(snapshot.map((provider) => refreshProvider(provider)))
    const byId = new Map(refreshed.map((provider) => [provider.id, provider]))
    const next = snapshot.map((provider) => byId.get(provider.id) ?? { ...provider, fetching: false })
    await persistProviders(next)
    setRefreshingAll(false)
  }

  async function handleRemoveProvider(id: string) {
    const next = providers.filter((provider) => provider.id !== id)
    if (selectedProviderId === id) setSelectedProviderId(null)
    await persistProviders(next)
  }

  async function handleAddTodo(title: string) {
    const next: Todo[] = [
      {
        id: createId('todo'),
        title,
        done: false,
        createdAt: Date.now(),
      },
      ...todos,
    ]
    await persistTodos(next)
  }

  async function handleToggleTodo(id: string) {
    const next = todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo,
    )
    await persistTodos(next)
  }

  async function handleRemoveTodo(id: string) {
    await persistTodos(todos.filter((todo) => todo.id !== id))
  }

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-sm text-muted-foreground">
        Loading Changelogger…
      </div>
    )
  }

  const changelog = (
    <ChangelogPanel
      providers={providers}
      selectedProviderId={selectedProviderId}
      onSelectProvider={setSelectedProviderId}
      onRefreshProvider={(id) => void handleRefreshProvider(id)}
      onRemoveProvider={(id) => void handleRemoveProvider(id)}
      onAdd={() => setAddOpen(true)}
    />
  )

  const todoPanel = (
    <TodoPanel
      todos={todos}
      onAdd={(title) => void handleAddTodo(title)}
      onToggle={(id) => void handleToggleTodo(id)}
      onRemove={(id) => void handleRemoveTodo(id)}
    />
  )

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="shrink-0">
          <AppHeader
            refreshing={refreshingAll}
            providerCount={providers.length}
            onAdd={() => setAddOpen(true)}
            onRefreshAll={() => void handleRefreshAll()}
          />
        </div>

        {useTabs ? (
          <Tabs defaultValue="changelog" className="flex min-h-0 flex-1 flex-col gap-3">
            <TabsList className="shrink-0">
              <TabsTrigger value="changelog">Changelog</TabsTrigger>
              <TabsTrigger value="todos" className="gap-2">
                Todos
                <Badge variant="outline">{openTodoCount}</Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="changelog"
              className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
            >
              {changelog}
            </TabsContent>
            <TabsContent
              value="todos"
              className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
            >
              {todoPanel}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-h-0 flex-col">{changelog}</div>
            <aside className="flex min-h-0 flex-col rounded-xl border border-border bg-muted/20 p-4">
              {todoPanel}
            </aside>
          </div>
        )}

        <AddSourceDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          providers={providers}
          onAdd={(input) => void handleAddSource(input)}
        />
      </div>
    </TooltipProvider>
  )
}
