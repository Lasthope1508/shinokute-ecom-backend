export const getBaseURL = () => {
  let host = ""
  if (typeof window !== "undefined") {
    host = window.location.host
  } else {
    try {
      const { headers } = require("next/headers")
      const reqHeaders = headers()
      host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host") || ""
    } catch (e) {
      // Fallback for static rendering
    }
  }
  if (host) {
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https"
    return `${protocol}://${host}`
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"
}

