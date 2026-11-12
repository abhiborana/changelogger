import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Todo } from '@/types'

type TodoPanelProps = {
  todos: Todo[]
  onAdd: (title: string) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

export function TodoPanel({ todos, onAdd, onToggle, onRemove }: TodoPanelProps) {
  const [draft, setDraft] = useState('')
  const open = todos.filter((todo) => !todo.done)
  const done = todos.filter((todo) => todo.done)

  function submit() {
    const title = draft.trim()
    if (!title) return
    onAdd(title)
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
        className="flex shrink-0 gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a todo"
        />
        <Button type="submit" size="icon" aria-label="Add todo">
          <Plus />
        </Button>
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <div className="space-y-2 pb-4">
          {open.length === 0 && done.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Capture follow-ups while you skim changelogs.
            </p>
          ) : null}

          {open.map((todo) => (
            <TodoRow key={todo.id} todo={todo} onToggle={onToggle} onRemove={onRemove} />
          ))}

          {done.length > 0 ? (
            <>
              <Separator className="my-3" />
              <p className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Completed
              </p>
              {done.map((todo) => (
                <TodoRow key={todo.id} todo={todo} onToggle={onToggle} onRemove={onRemove} />
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
}: {
  todo: Todo
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card/70 px-3 py-2.5">
      <Checkbox
        checked={todo.done}
        onCheckedChange={() => onToggle(todo.id)}
        className="mt-0.5"
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
  )
}
