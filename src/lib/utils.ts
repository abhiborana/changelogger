import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createId(prefix = 'id') {
  return `${prefix}_${crypto.randomUUID()}`
}

export function normalizeUrl(url: string) {
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    parsed.hash = ''
    let href = parsed.href
    if (href.endsWith('/') && parsed.pathname !== '/') {
      href = href.slice(0, -1)
    }
    return href
  } catch {
    return trimmed.replace(/\/$/, '')
  }
}

export function hashId(...parts: Array<string | null | undefined>) {
  const input = parts.map((part) => (part ?? '').trim().toLowerCase()).join('|')
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return `e_${(hash >>> 0).toString(16)}`
}
