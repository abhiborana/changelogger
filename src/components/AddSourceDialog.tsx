import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PRESETS } from '@/presets'
import { normalizeUrl } from '@/lib/utils'
import type { Provider } from '@/types'

type AddSourceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  providers: Provider[]
  onAdd: (input: { name: string; url: string; presetId?: string }) => void
}

export function AddSourceDialog({ open, onOpenChange, providers, onAdd }: AddSourceDialogProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const usedUrls = useMemo(
    () => new Set(providers.map((provider) => normalizeUrl(provider.url))),
    [providers],
  )
  const usedPresetIds = useMemo(
    () => new Set(providers.map((provider) => provider.presetId).filter(Boolean)),
    [providers],
  )

  function reset() {
    setName('')
    setUrl('')
    setError(null)
  }

  function handleAddCustom() {
    const trimmedName = name.trim()
    const trimmedUrl = url.trim()
    if (!trimmedName || !trimmedUrl) {
      setError('Name and URL are required.')
      return
    }
    try {
      // Validate URL shape.
      new URL(trimmedUrl)
    } catch {
      setError('Enter a valid URL including https://')
      return
    }
    if (usedUrls.has(normalizeUrl(trimmedUrl))) {
      setError('That URL is already tracked.')
      return
    }
    onAdd({ name: trimmedName, url: trimmedUrl })
    reset()
    onOpenChange(false)
  }

  function handleAddPreset(presetId: string) {
    const preset = PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    if (usedUrls.has(normalizeUrl(preset.url)) || usedPresetIds.has(preset.id)) return
    onAdd({ name: preset.name, url: preset.url, presetId: preset.id })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add changelog source</DialogTitle>
          <DialogDescription>
            Pick a preset or paste any product changelog URL. Sources stay local in this browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Presets
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PRESETS.map((preset) => {
              const added =
                usedPresetIds.has(preset.id) || usedUrls.has(normalizeUrl(preset.url))
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={added}
                  onClick={() => handleAddPreset(preset.id)}
                  className="rounded-md border border-border bg-muted/40 px-3 py-2 text-left hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <div className="text-sm font-medium">{preset.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{preset.url}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Custom URL
          </p>
          <Input
            placeholder="Source name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            placeholder="https://example.com/changelog"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleAddCustom}>Add custom</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
