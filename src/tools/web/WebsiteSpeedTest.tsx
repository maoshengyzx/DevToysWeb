import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ErrorBanner } from "@/components/ui/error-banner"

interface SpeedResult {
  url: string
  statusCode: number
  contentType: string
  server: string
  totalTime: number
  size: number
  responseHeaders: Record<string, string>
}

const PROXIES = [
  (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
]

export function WebsiteSpeedTest() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SpeedResult | null>(null)
  const [error, setError] = useState("")

  const handleTest = async () => {
    let testUrl = url.trim()
    if (!testUrl) return
    if (!testUrl.startsWith("http://") && !testUrl.startsWith("https://")) {
      testUrl = "https://" + testUrl
    }
    setUrl(testUrl)
    setLoading(true)
    setError("")
    setResult(null)

    for (const buildProxy of PROXIES) {
      try {
        const proxyUrl = buildProxy(testUrl)
        const startTime = performance.now()
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(20000) })
        if (!res.ok) throw new Error(`Proxy responded with ${res.status}`)
        const body = await res.json()

        const totalTime = Math.round(performance.now() - startTime)
        let statusCode = 0
        let contentType = ""
        let server = ""
        let size = 0
        const responseHeaders: Record<string, string> = {}

        if (body.status) {
          statusCode = body.status.http_code || res.status
          contentType = body.status.content_type || ""
          size = body.contents ? new Blob([body.contents]).size : 0
        } else if (body.contents) {
            statusCode = res.status
            size = new Blob([body.contents]).size
        }
        res.headers.forEach((v, k) => { responseHeaders[k] = v })
        server = responseHeaders["x-cache-hits"] || responseHeaders["via"] || ""

        setResult({ url: testUrl, statusCode, contentType, server, totalTime, size, responseHeaders })
        return
      } catch {
        continue
      }
    }

    setError("Unable to reach the target URL through any proxy. The site may be unreachable or all proxies are unavailable.")
    setLoading(false)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const getRating = (ms: number) => {
    if (ms < 500) return { label: "Fast", color: "text-green-500" }
    if (ms < 2000) return { label: "Moderate", color: "text-yellow-500" }
    return { label: "Slow", color: "text-red-500" }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleTest()}
            />
            <Button className="cursor-pointer" onClick={handleTest} disabled={loading}>
              {loading ? "Testing..." : "Test"}
            </Button>
          </div>

          <div className="rounded-md border border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            ⚡ Tests are performed via CORS proxy. Results include proxy overhead and may vary from real-world performance.
          </div>

          {error && <ErrorBanner message={error} />}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-md border border-border px-4 py-3">
                <span className={`text-2xl font-bold ${getRating(result.totalTime).color}`}>
                  {result.totalTime}ms
                </span>
                <div>
                  <div className={`text-sm font-medium ${getRating(result.totalTime).color}`}>
                    {getRating(result.totalTime).label}
                  </div>
                  <div className="text-xs text-muted-foreground">Response Time (via proxy)</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Status", value: result.statusCode > 0 ? `${result.statusCode}` : "N/A" },
                  { label: "Size", value: formatSize(result.size) },
                  { label: "Content-Type", value: result.contentType || "N/A" },
                  { label: "Server", value: result.server || "N/A" },
                  { label: "URL", value: result.url },
                ].map((item) => (
                  <div key={item.label} className="rounded-md border border-border px-3 py-2">
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="text-sm font-mono text-foreground truncate">{item.value}</div>
                  </div>
                ))}
              </div>

              <details className="rounded-md border border-border">
                <summary className="cursor-pointer px-3 py-2 text-xs text-muted-foreground hover:text-foreground">Proxy Response Headers</summary>
                <div className="px-3 pb-2 space-y-1">
                  {Object.entries(result.responseHeaders).map(([key, val]) => (
                    <div key={key} className="text-xs font-mono">
                      <span className="text-muted-foreground">{key}:</span> <span className="text-foreground">{val}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              Enter a URL and click Test to measure response time
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
