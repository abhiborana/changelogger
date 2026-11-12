import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type AppHeaderProps = {
  refreshing: boolean
  providerCount: number
  onAdd: () => void
  onRefreshAll: () => void
}

export function AppHeader({ refreshing, providerCount, onAdd, onRefreshAll }: AppHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-border pb-4">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Local new tab
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Changelogger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest product changes at a glance, plus a private todo list.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onRefreshAll}
              disabled={refreshing || providerCount === 0}
              aria-label="Refresh all changelogs"
            >
              <RefreshCw className={refreshing ? 'animate-spin' : undefined} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh all sources</TooltipContent>
        </Tooltip>
        <Button onClick={onAdd}>
          <Plus />
          Add
        </Button>
      </div>
    </header>
  )
}
