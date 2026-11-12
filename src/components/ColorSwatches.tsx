import { getThemeColor, THEME_COLORS, type ThemeColorId } from '@/lib/colors'
import { cn } from '@/lib/utils'

type ColorSwatchesProps = {
  value: ThemeColorId
  onChange: (color: ThemeColorId) => void
  size?: 'sm' | 'md'
  className?: string
  label?: string
}

export function ColorSwatches({
  value,
  onChange,
  size = 'md',
  className,
  label = 'Color',
}: ColorSwatchesProps) {
  const dimension = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {THEME_COLORS.map((color) => {
          const selected = value === color.id
          return (
            <button
              key={color.id}
              type="button"
              title={color.label}
              aria-label={color.label}
              aria-pressed={selected}
              onClick={() => onChange(color.id)}
              className={cn(
                'rounded-full border-2 transition-transform',
                dimension,
                selected ? 'scale-110 border-foreground' : 'border-transparent hover:scale-105',
              )}
              style={{ backgroundColor: color.solid }}
            />
          )
        })}
      </div>
    </div>
  )
}

export function ColorDot({
  colorId,
  className,
}: {
  colorId: ThemeColorId | string | undefined
  className?: string
}) {
  const color = getThemeColor(colorId)
  return (
    <span
      className={cn('inline-block h-2 w-2 shrink-0 rounded-full', className)}
      style={{ backgroundColor: color.solid }}
      aria-hidden
    />
  )
}
