import { ExternalLink, RefreshCw, Trash2 } from 'lucide-react'
import { ColorDot, ColorSwatches } from '@/components/ColorSwatches'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getThemeColor, type ThemeColorId } from '@/lib/colors'
import { cn } from '@/lib/utils'
import type { ChangelogEntry, Provider } from '@/types'

type LatestItem = {
  provider: Provider
  entry: ChangelogEntry
}

type ChangelogPanelProps = {
  providers: Provider[]
  selectedProviderId: string | null
  onSelectProvider: (id: string | null) => void
  onRefreshProvider: (id: string) => void
  onRemoveProvider: (id: string) => void
  onChangeProviderColor: (id: string, color: ThemeColorId) => void
  onAdd: () => void
}

function formatFetchedAt(value: number | null) {
  if (!value) return 'Never fetched'
  return `Updated ${new Date(value).toLocaleString()}`
}

function EntryCard({
  providerName,
  providerColor,
  entry,
  showProvider,
}: {
  providerName: string
  providerColor: ThemeColorId
  entry: ChangelogEntry
  showProvider: boolean
}) {
  const color = getThemeColor(providerColor)
  const content = (
    <Card
      className="overflow-hidden border-border/80 bg-card/80"
      style={{
        borderLeftWidth: 3,
        borderLeftColor: color.solid,
        background: `linear-gradient(90deg, ${color.soft} 0%, rgba(20,20,24,0.85) 42%)`,
      }}
    >
      <CardContent className="space-y-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {showProvider ? (
            <Badge
              variant="outline"
              className="gap-1.5 border-transparent"
              style={{ backgroundColor: color.soft, color: color.text }}
            >
              <ColorDot colorId={providerColor} />
              {providerName}
            </Badge>
          ) : null}
          {entry.dateLabel ? <Badge variant="outline">{entry.dateLabel}</Badge> : null}
          {entry.kind ? <Badge variant="success">{entry.kind}</Badge> : null}
          {entry.isNew ? <Badge variant="new">New</Badge> : null}
        </div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold leading-snug">{entry.title}</h3>
          {entry.link ? <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /> : null}
        </div>
        {entry.summary ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>
        ) : null}
      </CardContent>
    </Card>
  )

  if (!entry.link) return content

  return (
    <a href={entry.link} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  )
}

export function ChangelogPanel({
  providers,
  selectedProviderId,
  onSelectProvider,
  onRefreshProvider,
  onRemoveProvider,
  onChangeProviderColor,
  onAdd,
}: ChangelogPanelProps) {
  const selected = providers.find((provider) => provider.id === selectedProviderId) ?? null

  const latestItems: LatestItem[] = providers
    .map((provider) => {
      const entry = [...provider.entries].sort((a, b) => {
        const aMs = a.dateMs ?? 0
        const bMs = b.dateMs ?? 0
        if (aMs !== bMs) return bMs - aMs
        return 0
      })[0]
      if (!entry) return null
      return { provider, entry }
    })
    .filter((item): item is LatestItem => Boolean(item))
    .sort((a, b) => {
      const aMs = a.entry.dateMs ?? a.provider.lastFetchedAt ?? 0
      const bMs = b.entry.dateMs ?? b.provider.lastFetchedAt ?? 0
      return bMs - aMs
    })

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectProvider(null)}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium',
            selectedProviderId === null
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-muted text-muted-foreground hover:bg-accent',
          )}
        >
          Latest
        </button>
        {providers.map((provider) => {
          const color = getThemeColor(provider.color)
          const active = selectedProviderId === provider.id
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => onSelectProvider(provider.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              style={{
                borderColor: active ? color.solid : color.border,
                backgroundColor: active ? color.soft : 'transparent',
                color: active ? color.text : undefined,
              }}
            >
              <ColorDot colorId={provider.color} />
              {provider.name}
            </button>
          )
        })}
      </div>

      {providers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <div>
              <h2 className="text-base font-semibold">No sources yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add OpenAI, Cursor, GitHub, or any changelog URL to start tracking.
              </p>
            </div>
            <Button onClick={onAdd}>Add your first source</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          <div className="space-y-3 pb-4">
            {selected ? (
              <>
                <div
                  className="flex flex-col gap-3 rounded-lg border p-3"
                  style={{
                    borderColor: getThemeColor(selected.color).border,
                    backgroundColor: getThemeColor(selected.color).soft,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="flex items-center gap-2 truncate text-sm font-semibold">
                        <ColorDot colorId={selected.color} className="h-2.5 w-2.5" />
                        {selected.name}
                      </h2>
                      <p className="truncate text-xs text-muted-foreground">{selected.url}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatFetchedAt(selected.lastFetchedAt)}
                      </p>
                      {selected.lastError ? (
                        <p className="mt-2 text-xs text-destructive">{selected.lastError}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRefreshProvider(selected.id)}
                            disabled={selected.fetching}
                            aria-label={`Refresh ${selected.name}`}
                          >
                            <RefreshCw className={selected.fetching ? 'animate-spin' : undefined} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refresh source</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            aria-label={`Open ${selected.name}`}
                          >
                            <a href={selected.url} target="_blank" rel="noreferrer">
                              <ExternalLink />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Open source</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveProvider(selected.id)}
                            aria-label={`Remove ${selected.name}`}
                          >
                            <Trash2 />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove source</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <ColorSwatches
                    label="Theme color"
                    size="sm"
                    value={selected.color}
                    onChange={(color) => onChangeProviderColor(selected.id, color)}
                  />
                </div>
                <Separator />
                {selected.entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No entries stored yet. Refresh this source to fetch updates.
                  </p>
                ) : (
                  selected.entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      providerName={selected.name}
                      providerColor={selected.color}
                      entry={entry}
                      showProvider={false}
                    />
                  ))
                )}
              </>
            ) : (
              latestItems.map(({ provider, entry }) => (
                <div key={provider.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-left text-xs font-medium hover:opacity-90"
                      style={{ color: getThemeColor(provider.color).text }}
                      onClick={() => onSelectProvider(provider.id)}
                    >
                      <ColorDot colorId={provider.color} />
                      {provider.name}
                    </button>
                    <div className="flex items-center gap-1">
                      {provider.lastError ? (
                        <span className="text-[11px] text-destructive">Fetch issue</span>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onRefreshProvider(provider.id)}
                        disabled={provider.fetching}
                        aria-label={`Refresh ${provider.name}`}
                      >
                        <RefreshCw className={cn('size-3.5', provider.fetching && 'animate-spin')} />
                      </Button>
                    </div>
                  </div>
                  <EntryCard
                    providerName={provider.name}
                    providerColor={provider.color}
                    entry={entry}
                    showProvider
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  )
}
