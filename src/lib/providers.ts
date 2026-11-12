import { fetchPage } from '@/lib/fetch-page'
import { discoverFeedUrl, parseChangelog } from '@/lib/parse-changelog'
import { createId, normalizeUrl } from '@/lib/utils'
import type { Provider } from '@/types'

export function createProvider(input: {
  name: string
  url: string
  presetId?: string
}): Provider {
  return {
    id: createId('provider'),
    name: input.name.trim(),
    url: normalizeUrl(input.url),
    presetId: input.presetId,
    lastFetchedAt: null,
    lastError: null,
    entries: [],
  }
}

export async function refreshProvider(provider: Provider): Promise<Provider> {
  const previousIds = provider.entries.map((entry) => entry.id)
  const page = await fetchPage(provider.url)

  if (!page.ok || !page.body) {
    return {
      ...provider,
      lastFetchedAt: Date.now(),
      lastError: page.error ?? 'Unable to fetch changelog',
      fetching: false,
    }
  }

  let body = page.body
  let contentType = page.contentType
  let baseUrl = page.finalUrl || provider.url

  const feedUrl = discoverFeedUrl(page.body, baseUrl)
  if (feedUrl) {
    const feed = await fetchPage(feedUrl)
    if (feed.ok && feed.body) {
      body = feed.body
      contentType = feed.contentType || 'application/xml'
      baseUrl = feed.finalUrl || feedUrl
    }
  }

  const entries = parseChangelog({
    body,
    contentType,
    baseUrl,
    previousEntryIds: previousIds,
  })

  if (entries.length === 0) {
    return {
      ...provider,
      lastFetchedAt: Date.now(),
      lastError:
        'No changelog entries found in the page HTML. This source may require JavaScript or a different URL.',
      entries: provider.entries,
      fetching: false,
    }
  }

  return {
    ...provider,
    lastFetchedAt: Date.now(),
    lastError: null,
    entries,
    fetching: false,
  }
}
