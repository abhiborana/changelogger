import type { FetchPageResponse } from '@/types'

export async function fetchPage(url: string): Promise<FetchPageResponse> {
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    return chrome.runtime.sendMessage({ type: 'FETCH_PAGE', url }) as Promise<FetchPageResponse>
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      credentials: 'omit',
      cache: 'no-cache',
    })
    const contentType = response.headers.get('content-type') ?? ''
    const body = await response.text()
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      contentType,
      body,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      contentType: '',
      body: '',
      error: error instanceof Error ? error.message : 'Fetch failed',
    }
  }
}
