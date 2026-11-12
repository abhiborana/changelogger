import { useMemo, useState } from 'react'
import { ColorDot, ColorSwatches } from '@/components/ColorSwatches'
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
import { DEFAULT_PROVIDER_COLOR, getThemeColor, type ThemeColorId } from '@/lib/colors'
import { normalizeUrl } from '@/lib/utils'
import { PRESETS } from '@/presets'
import type { Provider } from '@/types'

type AddSourceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  providers: Provider[]
  onAdd: (input: { name: string; url: string; presetId?: string; color: ThemeColorId }) => void
}

export function AddSourceDialog({ open, onOpenChange, providers, onAdd }: AddSourceDialogProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [color, setColor] = useState<ThemeColorId>(DEFAULT_PROVIDER_COLOR)
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
    setColor(DEFAULT_PROVIDER_COLOR)
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
      new URL(trimmedUrl)
    } catch {
      setError('Enter a valid URL including https://')
      return
    }
    if (usedUrls.has(normalizeUrl(trimmedUrl))) {
      setError('That URL is already tracked.')
      return
    }
    onAdd({ name: trimmedName, url: trimmedUrl, color })
    reset()
    onOpenChange(false)
  }

  function handleAddPreset(presetId: string) {
    const preset = PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    if (usedUrls.has(normalizeUrl(preset.url)) || usedPresetIds.has(preset.id)) return
    onAdd({
      name: preset.name,
      url: preset.url,
      presetId: preset.id,
      color: preset.color,
    })
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
            Pick a preset or paste any product changelog URL. Each source gets its own color theme.
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
              const theme = getThemeColor(preset.color)
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={added}
                  onClick={() => handleAddPreset(preset.id)}
                  className="rounded-md border px-3 py-2 text-left hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.soft,
                    boxShadow: `inset 3px 0 0 ${theme.solid}`,
                  }}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ColorDot colorId={preset.color} className="h-2.5 w-2.5" />
                    {preset.name}
                  </div>
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
          <ColorSwatches value={color} onChange={setColor} label="Theme color" />
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
