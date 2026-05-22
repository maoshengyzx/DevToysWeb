import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ErrorBanner } from "@/components/ui/error-banner"
import { LoaderCircle, Square } from "lucide-react"
import { useLocale } from "@/i18n/useLocale"

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
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.org/?${encodeURIComponent(u)}`,
  (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
]

export function WebsiteSpeedTest() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SpeedResult | null>(null)
  const [error, setError] = useState("")
  const abortRef = useRef<AbortController | null>(null)
  const { t } = useLocale()

  const handleStop = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setLoading(false)
  }

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

    const abortController = new AbortController()
    abortRef.current = abortController

    for (const buildProxy of PROXIES) {
      try {
        const proxyUrl = buildProxy(testUrl)
        const startTime = performance.now()
        const res = await fetch(proxyUrl, { signal: abortController.signal })
        if (!res.ok) throw new Error(`Proxy responded with ${res.status}`)

        const contentType = res.headers.get("content-type") || ""
        const isJson = contentType.includes("json")
        const bodyText = await res.text()

        const totalTime = Math.round(performance.now() - startTime)
        let statusCode = 0
        let bodySize = 0
        let server = ""
        const responseHeaders: Record<string, string> = {}

        if (isJson) {
          try {
            const parsed = JSON.parse(bodyText)
            if (parsed.contents) {
              bodySize = new Blob([parsed.contents]).size
              statusCode = parsed.status?.http_code || res.status
            }
          } catch {
            /* not parseable as JSON, treat as raw */
          }
        }

        if (!statusCode) {
          statusCode = res.status
          bodySize = new Blob([bodyText]).size
        }

        res.headers.forEach((v, k) => { responseHeaders[k] = v })
        server = responseHeaders["x-cache-hits"] || responseHeaders["via"] || ""

        setResult({ url: testUrl, statusCode, contentType, server, totalTime, size: bodySize, responseHeaders })
        setLoading(false)
        return
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          setLoading(false)
          return
        }
        continue
      }
    }

    abortRef.current = null
    setError("Unable to reach the target URL through any proxy. The site may be unreachable or all proxies are unavailable.")
    setLoading(false)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const getRating = (ms: number) => {
    if (ms < 500) return { label: t("tool.siteSpeed.fast"), color: "text-green-500" }
    if (ms < 2000) return { label: t("tool.siteSpeed.moderate"), color: "text-yellow-500" }
    return { label: t("tool.siteSpeed.slow"), color: "text-red-500" }
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
              placeholder={t("tool.siteSpeed.urlPlaceholder")}
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleTest()}
            />
            {loading ? (
              <Button variant="destructive" className="gap-1.5 cursor-pointer" onClick={handleStop}>
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop
              </Button>
            ) : (
              <Button className="cursor-pointer" onClick={handleTest}>
                {t("tool.siteSpeed.test")}
              </Button>
            )}
          </div>

          <div className="rounded-md border border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            ⚡ {t("tool.siteSpeed.proxyNotice")}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

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
                  <div className="text-xs text-muted-foreground">{t("tool.siteSpeed.responseTime")}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t("tool.siteSpeed.status"), value: result.statusCode > 0 ? `${result.statusCode}` : "N/A" },
                  { label: t("tool.siteSpeed.size"), value: formatSize(result.size) },
                  { label: t("tool.siteSpeed.contentType"), value: result.contentType || "N/A" },
                  { label: t("tool.siteSpeed.server"), value: result.server || "N/A" },
                  { label: t("tool.siteSpeed.url"), value: result.url },
                ].map((item) => (
                  <div key={item.label} className="rounded-md border border-border px-3 py-2">
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="text-sm font-mono text-foreground truncate">{item.value}</div>
                  </div>
                ))}
              </div>

              <details className="rounded-md border border-border">
                <summary className="cursor-pointer px-3 py-2 text-xs text-muted-foreground hover:text-foreground">{t("tool.siteSpeed.proxyHeaders")}</summary>
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
              {t("tool.siteSpeed.emptyHint")}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
