import { hashId } from '@/lib/utils'
import type { ChangelogEntry } from '@/types'

const MAX_ENTRIES = 20

const MONTH_NAMES =
  'January|February|March|April|May|June|July|August|September|October|November|December'
const MONTH_RE = new RegExp(`^(${MONTH_NAMES}),?\\s+(\\d{4})$`, 'i')
const SHORT_MONTH_RE =
  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?$/i
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})/
const KIND_RE = /^(feature|fix|improvement|announcement|deprecation|breaking|security|update|release)$/i

type RawEntry = {
  title: string
  summary: string
  dateLabel: string
  dateMs: number | null
  link: string | null
  kind: string | null
}

function decodeXml(text: string) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function stripTags(html: string) {
  return decodeXml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function absoluteUrl(href: string | null | undefined, baseUrl: string) {
  if (!href) return null
  try {
    return new URL(href, baseUrl).href
  } catch {
    return null
  }
}

function monthIndex(name: string) {
  const months = MONTH_NAMES.split('|')
  const short = months.map((month) => month.slice(0, 3).toLowerCase())
  const lower = name.toLowerCase().replace(/\./g, '')
  const idx = months.findIndex((month) => month.toLowerCase() === lower)
  if (idx >= 0) return idx
  return short.findIndex((month) => month === lower.slice(0, 3))
}

function parseDateMs(label: string, fallbackYear?: number): number | null {
  const cleaned = cleanText(label)
  if (!cleaned) return null

  const iso = cleaned.match(ISO_DATE_RE)
  if (iso) {
    return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  }

  const monthYear = cleaned.match(MONTH_RE)
  if (monthYear) {
    const idx = monthIndex(monthYear[1])
    if (idx >= 0) return Date.UTC(Number(monthYear[2]), idx, 1)
  }

  const short = cleaned.match(SHORT_MONTH_RE)
  if (short) {
    const idx = monthIndex(short[1])
    const year = short[3] ? Number(short[3]) : fallbackYear
    if (idx >= 0 && year) return Date.UTC(year, idx, Number(short[2]))
  }

  const parsed = Date.parse(cleaned)
  return Number.isNaN(parsed) ? null : parsed
}

function looksLikeFeed(contentType: string, body: string) {
  const type = contentType.toLowerCase()
  if (type.includes('xml') || type.includes('rss') || type.includes('atom')) return true
  const trimmed = body.trim().slice(0, 400).toLowerCase()
  return (
    trimmed.startsWith('<?xml') ||
    trimmed.includes('<rss') ||
    trimmed.includes('<feed') ||
    trimmed.includes('<rdf:rdf')
  )
}

function extractTag(block: string, tag: string) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = block.match(re)
  return match ? match[1] : null
}

function extractLink(block: string) {
  const hrefMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i)
  if (hrefMatch) return hrefMatch[1]
  const textLink = extractTag(block, 'link')
  return textLink ? stripTags(textLink) : null
}

function parseFeed(body: string, baseUrl: string): RawEntry[] {
  const items = [...body.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0])
  const entries = items.length
    ? items
    : [...body.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0])

  const parsed: RawEntry[] = []
  for (const block of entries) {
    const title = cleanText(stripTags(extractTag(block, 'title') ?? ''))
    if (!title) continue
    const summarySource =
      extractTag(block, 'description') ??
      extractTag(block, 'summary') ??
      extractTag(block, 'content') ??
      ''
    const summary = cleanText(stripTags(summarySource)).slice(0, 280)
    const dateRaw =
      extractTag(block, 'pubDate') ??
      extractTag(block, 'updated') ??
      extractTag(block, 'published') ??
      ''
    const dateLabel = cleanText(stripTags(dateRaw))
    parsed.push({
      title,
      summary,
      dateLabel,
      dateMs: parseDateMs(dateLabel),
      link: absoluteUrl(extractLink(block), baseUrl),
      kind: null,
    })
  }
  return parsed
}

function findPageSpecificFeed(doc: Document, baseUrl: string) {
  const links = [...doc.querySelectorAll('link[rel="alternate"]')]
  for (const link of links) {
    const type = (link.getAttribute('type') ?? '').toLowerCase()
    const href = link.getAttribute('href')
    if (!href) continue
    const isFeed =
      type.includes('rss') ||
      type.includes('atom') ||
      type.includes('xml') ||
      /rss|atom|feed/i.test(href)
    if (!isFeed) continue

    const absolute = absoluteUrl(href, baseUrl)
    if (!absolute) continue
    const lower = absolute.toLowerCase()
    if (
      lower.includes('changelog') ||
      lower.includes('releases') ||
      lower.includes('release-notes') ||
      lower.includes('atom')
    ) {
      // Skip obvious site-wide feeds that are not changelog-scoped.
      if (/\/rss\.xml$/.test(lower) && !lower.includes('changelog')) continue
      return absolute
    }
  }
  return null
}

function removeChrome(doc: Document) {
  doc.querySelectorAll('nav, header, footer, aside, script, style, noscript').forEach((node) => {
    node.remove()
  })
}

function firstParagraph(node: Element) {
  const p = node.querySelector('p')
  if (p) return cleanText(p.textContent ?? '')
  return cleanText(node.textContent ?? '').slice(0, 280)
}

function parseOpenAiStyle(doc: Document, baseUrl: string): RawEntry[] {
  const monthHeadings = [...doc.querySelectorAll('h2, h3')].filter((heading) =>
    MONTH_RE.test(cleanText(heading.textContent ?? '')),
  )
  if (monthHeadings.length === 0) return []

  const entries: RawEntry[] = []

  for (const heading of monthHeadings) {
    const monthLabel = cleanText(heading.textContent ?? '')
    const monthMatch = monthLabel.match(MONTH_RE)
    const year = monthMatch ? Number(monthMatch[2]) : undefined
    let sibling = heading.nextElementSibling

    while (sibling && !/H[23]/.test(sibling.tagName)) {
      const grids = sibling.matches('.grid')
        ? [sibling]
        : [...sibling.querySelectorAll('.grid')].filter((grid) =>
            SHORT_MONTH_RE.test(cleanText(grid.querySelector('div')?.textContent ?? '')),
          )

      for (const grid of grids) {
        const dateBadge = cleanText(grid.children[0]?.textContent ?? '')
        const body = grid.children[1] as Element | undefined
        if (!body) continue

        const badgeRow = body.querySelector('.flex.flex-wrap, [class*="flex-wrap"]') ?? body
        const badgeNodes = [...badgeRow.querySelectorAll('[class*="Badge"]')]
        const badgeTexts = badgeNodes
          .map((el) => cleanText(el.textContent ?? ''))
          .filter((text, index, all) => text && all.indexOf(text) === index)

        const kind = badgeTexts.find((badge) => KIND_RE.test(badge)) ?? null
        const modelTags = badgeTexts.filter(
          (badge) =>
            !KIND_RE.test(badge) &&
            !SHORT_MONTH_RE.test(badge) &&
            badge.length < 64 &&
            !badge.includes(' '),
        )

        const summary = firstParagraph(body)
        const linkEl = body.querySelector('a[href]')
        const link = absoluteUrl(linkEl?.getAttribute('href'), baseUrl)
        const linkedTitle = cleanText(linkEl?.textContent ?? '')
        const title =
          modelTags[0] ||
          (linkedTitle && linkedTitle.length < 80 ? linkedTitle : '') ||
          summary.split(/[.!?]/)[0]?.slice(0, 90) ||
          `${monthLabel} update`

        if (!summary && !title) continue

        entries.push({
          title: cleanText(title),
          summary,
          dateLabel: dateBadge || monthLabel,
          dateMs: parseDateMs(dateBadge, year) ?? parseDateMs(monthLabel),
          link,
          kind: kind ? kind.toLowerCase() : null,
        })
      }

      sibling = sibling.nextElementSibling
    }
  }

  return entries
}

function parseHeadingEntries(doc: Document, baseUrl: string): RawEntry[] {
  const headings = [...doc.querySelectorAll('h1, h2, h3')].filter((heading) => {
    const text = cleanText(heading.textContent ?? '')
    if (!text || text.length > 160) return false
    if (/^(changelog|release notes|releases|what's new|blog|updates)$/i.test(text)) return false
    if (MONTH_RE.test(text)) return false
    return true
  })

  const entries: RawEntry[] = []

  for (const heading of headings) {
    const title = cleanText(heading.textContent ?? '')
    const linkEl = heading.querySelector('a[href]') ?? heading.closest('a[href]')
    const link = absoluteUrl(linkEl?.getAttribute('href'), baseUrl)

    const chunks: string[] = []
    let sibling = heading.nextElementSibling
    let dateLabel = ''
    let kind: string | null = null

    while (sibling && !/^H[1-3]$/.test(sibling.tagName) && chunks.join(' ').length < 320) {
      const text = cleanText(sibling.textContent ?? '')
      if (!text) {
        sibling = sibling.nextElementSibling
        continue
      }

      if (!dateLabel) {
        const time = sibling.querySelector('time')
        const timeText = cleanText(time?.getAttribute('datetime') ?? time?.textContent ?? '')
        if (timeText) dateLabel = timeText
        else if (parseDateMs(text) && text.length < 40) dateLabel = text
      }

      if (!kind && KIND_RE.test(text)) kind = text.toLowerCase()

      if (!/^H[1-6]$/.test(sibling.tagName) && text !== dateLabel) {
        chunks.push(text)
      }
      sibling = sibling.nextElementSibling
    }

    const summary = cleanText(chunks.join(' ')).slice(0, 280)
    if (!title) continue

    entries.push({
      title,
      summary,
      dateLabel,
      dateMs: parseDateMs(dateLabel),
      link,
      kind,
    })
  }

  return entries
}

function toEntries(raw: RawEntry[], previousIds: Set<string>): ChangelogEntry[] {
  const seen = new Set<string>()
  const entries: ChangelogEntry[] = []

  for (const item of raw) {
    const id = hashId(item.title, item.dateLabel, item.link)
    if (seen.has(id)) continue
    seen.add(id)
    entries.push({
      id,
      title: item.title,
      summary: item.summary,
      dateLabel: item.dateLabel,
      dateMs: item.dateMs,
      link: item.link,
      kind: item.kind,
      isNew: previousIds.size > 0 && !previousIds.has(id),
    })
    if (entries.length >= MAX_ENTRIES) break
  }

  return entries
}

export function discoverFeedUrl(html: string, baseUrl: string) {
  if (!html.trim()) return null
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return findPageSpecificFeed(doc, baseUrl)
}

export function parseChangelog(options: {
  body: string
  contentType: string
  baseUrl: string
  previousEntryIds?: string[]
}): ChangelogEntry[] {
  const previousIds = new Set(options.previousEntryIds ?? [])

  if (looksLikeFeed(options.contentType, options.body)) {
    return toEntries(parseFeed(options.body, options.baseUrl), previousIds)
  }

  const doc = new DOMParser().parseFromString(options.body, 'text/html')
  removeChrome(doc)

  const openaiEntries = parseOpenAiStyle(doc, options.baseUrl)
  if (openaiEntries.length > 0) {
    return toEntries(openaiEntries, previousIds)
  }

  const headingEntries = parseHeadingEntries(doc, options.baseUrl)
  return toEntries(headingEntries, previousIds)
}
