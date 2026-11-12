import type { FetchPageRequest, FetchPageResponse } from '@/types'

chrome.runtime.onMessage.addListener((message: FetchPageRequest, _sender, sendResponse) => {
  if (message?.type !== 'FETCH_PAGE' || typeof message.url !== 'string') {
    return false
  }

  void (async () => {
    try {
      const response = await fetch(message.url, {
        method: 'GET',
        redirect: 'follow',
        credentials: 'omit',
        cache: 'no-cache',
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml,application/rss+xml,application/atom+xml,*/*',
        },
      })

      const contentType = response.headers.get('content-type') ?? ''
      const body = await response.text()
      const payload: FetchPageResponse = {
        ok: response.ok,
        status: response.status,
        finalUrl: response.url,
        contentType,
        body,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      }
      sendResponse(payload)
    } catch (error) {
      const payload: FetchPageResponse = {
        ok: false,
        status: 0,
        finalUrl: message.url,
        contentType: '',
        body: '',
        error: error instanceof Error ? error.message : 'Fetch failed',
      }
      sendResponse(payload)
    }
  })()

  return true
})
