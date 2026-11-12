import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ColorDot, ColorSwatches } from '@/components/ColorSwatches'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { DEFAULT_TODO_COLOR, getThemeColor, type ThemeColorId } from '@/lib/colors'
import { cn } from '@/lib/utils'
import type { Todo } from '@/types'

type TodoPanelProps = {
  todos: Todo[]
  onAdd: (title: string, color: ThemeColorId) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onChangeColor: (id: string, color: ThemeColorId) => void
}

export function TodoPanel({ todos, onAdd, onToggle, onRemove, onChangeColor }: TodoPanelProps) {
  const [draft, setDraft] = useState('')
  const [draftColor, setDraftColor] = useState<ThemeColorId>(DEFAULT_TODO_COLOR)
  const open = todos.filter((todo) => !todo.done)
  const done = todos.filter((todo) => todo.done)

  function submit() {
    const title = draft.trim()
    if (!title) return
    onAdd(title, draftColor)
    setDraft('')
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Todos</h2>
          <p className="text-xs text-muted-foreground">Private list stored in this browser.</p>
        </div>
        <Badge variant="outline">{open.length} open</Badge>
      </div>

      <form
        className="flex shrink-0 flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a todo"
          />
          <Button type="submit" size="icon" aria-label="Add todo">
            <Plus />
          </Button>
        </div>
        <ColorSwatches
          label="Todo color"
          size="sm"
          value={draftColor}
          onChange={setDraftColor}
        />
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <div className="space-y-2 pb-4">
          {open.length === 0 && done.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Capture follow-ups while you skim changelogs.
            </p>
          ) : null}

          {open.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onRemove={onRemove}
              onChangeColor={onChangeColor}
            />
          ))}

          {done.length > 0 ? (
            <>
              <Separator className="my-3" />
              <p className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Completed
              </p>
              {done.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggle}
                  onRemove={onRemove}
                  onChangeColor={onChangeColor}
                />
              ))}
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function TodoRow({
  todo,
  onToggle,
  onRemove,
  onChangeColor,
}: {
  todo: Todo
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onChangeColor: (id: string, color: ThemeColorId) => void
}) {
  const color = getThemeColor(todo.color)
  const [showColors, setShowColors] = useState(false)

  return (
    <div
      className="rounded-lg border px-3 py-2.5"
      style={{
        borderColor: color.border,
        background: `linear-gradient(90deg, ${color.soft} 0%, rgba(20,20,24,0.72) 55%)`,
        borderLeftWidth: 3,
        borderLeftColor: color.solid,
      }}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={todo.done}
          onCheckedChange={() => onToggle(todo.id)}
          className="mt-0.5 data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-white"
          aria-label={todo.done ? 'Mark incomplete' : 'Mark complete'}
        />
        <p
          className={cn(
            'min-w-0 flex-1 text-sm leading-snug',
            todo.done && 'text-muted-foreground line-through',
          )}
        >
          {todo.title}
        </p>
        <button
          type="button"
          className="mt-0.5 rounded-full p-0.5"
          title="Change color"
          aria-label="Change todo color"
          onClick={() => setShowColors((open) => !open)}
        >
          <ColorDot colorId={todo.color} className="h-3 w-3" />
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => onRemove(todo.id)}
          aria-label="Delete todo"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      {showColors ? (
        <div className="mt-2 pl-7">
          <ColorSwatches
            label=""
            size="sm"
            value={todo.color}
            onChange={(next) => {
              onChangeColor(todo.id, next)
              setShowColors(false)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
