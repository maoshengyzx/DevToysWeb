import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ErrorBanner } from "@/components/ui/error-banner"

interface TimingResult {
  url: string
  statusCode: number
  statusText: string
  contentType: string
  server: string
  dnsTime: number
  tcpTime: number
  tlsTime: number
  ttfb: number
  total: number
  size: number
  headers: Record<string, string>
}

export function WebsiteSpeedTest() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TimingResult | null>(null)
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

    const headers: Record<string, string> = {}
    const startMark = `start-${Date.now()}`
    try {
      performance.mark(startMark)

      const startTime = performance.now()
      const response = await fetch(testUrl, {
        method: "GET",
        mode: "cors",
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      })

      const endTime = performance.now()
      const body = await response.text()
      const size = new Blob([body]).size
      const statusCode = response.status
      const statusText = response.statusText
      response.headers.forEach((value, key) => { headers[key] = value })

      const timing = performance.getEntriesByName(testUrl, "resource") as PerformanceResourceTiming[]
      const t = timing[timing.length - 1]

      setResult({
        url: testUrl,
        statusCode,
        statusText,
        contentType: headers["content-type"] || "",
        server: headers["server"] || "",
        dnsTime: t ? Math.round(t.domainLookupEnd - t.domainLookupStart) : 0,
        tcpTime: t ? Math.round(t.connectEnd - t.connectStart) : 0,
        tlsTime: t ? Math.round((t.secureConnectionStart > 0 ? t.connectEnd - t.secureConnectionStart : 0)) : 0,
        ttfb: t ? Math.round(t.responseStart - t.requestStart) : Math.round(endTime - startTime),
        total: Math.round(endTime - startTime),
        size,
        headers,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed. This may be due to CORS policy.")
    } finally {
      setLoading(false)
      performance.clearMarks(startMark)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const getRating = (ms: number) => {
    if (ms < 200) return { label: "Fast", color: "text-green-500" }
    if (ms < 1000) return { label: "Moderate", color: "text-yellow-500" }
    return { label: "Slow", color: "text-red-500" }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="url"
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

          {error && <ErrorBanner message={error} />}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-md border border-border px-4 py-3">
                <span className={`text-2xl font-bold ${getRating(result.total).color}`}>
                  {result.total}ms
                </span>
                <div>
                  <div className={`text-sm font-medium ${getRating(result.total).color}`}>
                    {getRating(result.total).label}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Response Time</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Status", value: `${result.statusCode} ${result.statusText}` },
                  { label: "Size", value: formatSize(result.size) },
                  { label: "Content-Type", value: result.contentType || "N/A" },
                  { label: "Server", value: result.server || "N/A" },
                ].map((item) => (
                  <div key={item.label} className="rounded-md border border-border px-3 py-2">
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="text-sm font-mono text-foreground truncate">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Timing Breakdown</label>
                {[
                  { label: "DNS Lookup", value: result.dnsTime, color: "bg-blue-500" },
                  { label: "TCP Connect", value: result.tcpTime, color: "bg-green-500" },
                  { label: "TLS Handshake", value: result.tlsTime, color: "bg-purple-500" },
                  { label: "Time to First Byte", value: result.ttfb, color: "bg-yellow-500" },
                  { label: "Total", value: result.total, color: "bg-primary" },
                ].map((item) => {
                  const pct = result.total > 0 ? Math.min((item.value / result.total) * 100, 100) : 0
                  return (
                    <div key={item.label} className="flex items-center gap-3 text-sm">
                      <span className="w-36 shrink-0 text-muted-foreground">{item.label}</span>
                      <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                        <div className={`h-full ${item.color} rounded`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-16 text-right font-mono text-foreground">{item.value}ms</span>
                    </div>
                  )
                })}
              </div>

              <details className="rounded-md border border-border">
                <summary className="cursor-pointer px-3 py-2 text-xs text-muted-foreground hover:text-foreground">Response Headers</summary>
                <div className="px-3 pb-2 space-y-1">
                  {Object.entries(result.headers).map(([key, val]) => (
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