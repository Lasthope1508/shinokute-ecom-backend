import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = "http://localhost:9000"

if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}

  // Resolve publishable key dynamically based on Host header
  let publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  try {
    let host = ""
    if (typeof window !== "undefined") {
      host = window.location.host
    } else {
      const { headers: nextHeaders } = require("next/headers")
      const reqHeaders = nextHeaders()
      host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host") || ""
    }
    if (host) {
      const cleanHost = host.split(":")[0]
      const keyMap = JSON.parse(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_MAP || "{}")
      if (keyMap[cleanHost]) {
        publishableKey = keyMap[cleanHost]
      }
    }
  } catch (err) {
    // Fallback for non-request contexts (static generation)
  }

  if (publishableKey) {
    headers["x-publishable-api-key"] = publishableKey
  }

  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}

