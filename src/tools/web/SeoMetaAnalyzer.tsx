import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ErrorBanner } from "@/components/ui/error-banner"
import { Download, Copy, Check, LoaderCircle, Square } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { useLocale } from "@/i18n/useLocale"

const PROXIES = [
  (u: string) => ({ url: `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`, parse: (d: string) => { const j = JSON.parse(d); return j.contents as string } }),
  (u: string) => ({ url: `https://corsproxy.io/?${encodeURIComponent(u)}`, parse: (d: string) => d }),
]

interface SeoData {
  url: string
  title: string
  description: string
  canonical: string
  robots: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  h1: string[]
  h2: string[]
  images: { src: string; alt: string }[]
  links: number
  canonicalOk: boolean
  hasDescription: boolean
  score: number
}

function extractSeo(html: string, url: string): SeoData {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  const getMeta = (name: string) => {
    const el = doc.querySelector(`meta[name="${name}"]`) || doc.querySelector(`meta[property="${name}"]`)
    return el?.getAttribute("content") || ""
  }

  const title = doc.querySelector("title")?.textContent?.trim() || ""
  const description = getMeta("description")
  const canonical = doc.querySelector("link[rel='canonical']")?.getAttribute("href") || ""
  const robots = getMeta("robots")
  const ogTitle = getMeta("og:title")
  const ogDescription = getMeta("og:description")
  const ogImage = getMeta("og:image")
  const ogType = getMeta("og:type")
  const twitterCard = getMeta("twitter:card")
  const twitterTitle = getMeta("twitter:title")
  const twitterDescription = getMeta("twitter:description")
  const h1 = Array.from(doc.querySelectorAll("h1")).map((el) => el.textContent?.trim() || "")
  const h2 = Array.from(doc.querySelectorAll("h2")).map((el) => el.textContent?.trim() || "")
  const images = Array.from(doc.querySelectorAll("img")).slice(0, 50).map((el) => ({
    src: el.getAttribute("src") || "",
    alt: el.getAttribute("alt") || "",
  }))
  const links = doc.querySelectorAll("a[href]").length

  const canonicalOk = !canonical || canonical.startsWith("http")
  const hasDescription = description.length > 0
  let score = 0
  if (title) score += 20
  if (title.length >= 10 && title.length <= 60) score += 10; else if (title) score += 5
  if (hasDescription) score += 15
  if (description.length >= 50 && description.length <= 160) score += 10; else if (description) score += 5
  if (canonicalOk && canonical) score += 10
  if (ogTitle) score += 5
  if (ogDescription) score += 5
  if (ogImage) score += 5
  if (h1.length === 1) score += 10
  if (h1.length >= 1) score += 5
  const imagesWithAlt = images.filter((img) => img.alt)
  if (images.length > 0 && imagesWithAlt.length === images.length) score += 5

  return {
    url, title, description, canonical, robots,
    ogTitle, ogDescription, ogImage, ogType,
    twitterCard, twitterTitle, twitterDescription,
    h1, h2, images, links, canonicalOk, hasDescription,
    score: Math.min(score, 100),
  }
}

export function SeoMetaAnalyzer() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SeoData | null>(null)
  const [error, setError] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()
  const abortRef = useRef<AbortController | null>(null)
  const { t } = useLocale()

  const handleStop = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setLoading(false)
  }

  const handleAnalyze = async () => {
    let analyzeUrl = url.trim()
    if (!analyzeUrl) return
    if (!analyzeUrl.startsWith("http://") && !analyzeUrl.startsWith("https://")) {
      analyzeUrl = "https://" + analyzeUrl
    }
    setUrl(analyzeUrl)
    setLoading(true)
    setError("")
    setResult(null)

    const abortController = new AbortController()
    abortRef.current = abortController

    for (const buildProxy of PROXIES) {
      try {
        const { url: proxyUrl, parse } = buildProxy(analyzeUrl)
        const res = await fetch(proxyUrl, { signal: abortController.signal })
        if (!res.ok) throw new Error(`Proxy responded with ${res.status}`)
        const raw = await res.text()
        const html = parse(raw)
        setResult(extractSeo(html, analyzeUrl))
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
    setError("Unable to fetch the URL through any available proxy. The site may be unreachable or blocking proxies.")
    setLoading(false)
  }

  const scoreColor = (s: number) => (s >= 70 ? "text-green-500" : s >= 40 ? "text-yellow-500" : "text-red-500")
  const scoreBg = (s: number) => (s >= 70 ? "bg-green-500" : s >= 40 ? "bg-yellow-500" : "bg-red-500")

  const handleDownload = () => {
    if (!result) return
    const report = `SEO Report — ${result.url}\n${"=".repeat(40)}\n\nTitle: ${result.title}\nDescription: ${result.description}\nCanonical: ${result.canonical}\nRobots: ${result.robots}\n\nOG Title: ${result.ogTitle}\nOG Description: ${result.ogDescription}\nOG Image: ${result.ogImage}\nOG Type: ${result.ogType}\n\nH1: ${result.h1.join(", ") || "None"}\nH2: ${result.h2.join(", ") || "None"}\n\nImages: ${result.images.length} (${result.images.filter((i) => i.alt).length} with alt)\nLinks: ${result.links}\n\nScore: ${result.score}/100`
    const blob = new Blob([report], { type: "text/plain" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "seo-report.txt"
    a.click()
  }

  const copyReport = () => {
    if (!result) return
    handleCopy(`SEO Score: ${result.score}/100\nTitle: ${result.title}\nDescription: ${result.description}\nCanonical: ${result.canonical}\nH1: ${result.h1.join(", ") || "None"}\nImages: ${result.images.length}\nLinks: ${result.links}`)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("tool.seoMeta.urlPlaceholder")}
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            {loading ? (
              <Button variant="destructive" className="gap-1.5 cursor-pointer" onClick={handleStop}>
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop
              </Button>
            ) : (
              <Button className="cursor-pointer" onClick={handleAnalyze}>
                {t("tool.seoMeta.analyze")}
              </Button>
            )}
          </div>

          {error && <ErrorBanner message={error} />}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-md border border-border px-4 py-3">
                <div className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}</div>
                <div>
                  <div className={`text-sm font-medium ${scoreColor(result.score)}`}>
                    {result.score >= 70 ? t("tool.seoMeta.good") : result.score >= 40 ? t("tool.seoMeta.needsImprovement") : t("tool.seoMeta.poor")} SEO Score
                  </div>
                  <div className="text-xs text-muted-foreground">{result.url}</div>
                </div>
                <div className="flex-1" />
                <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={copyReport}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {t("tool.seoMeta.copy")}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  {t("tool.seoMeta.export")}
                </Button>
              </div>

              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${scoreBg(result.score)} transition-all`} style={{ width: `${result.score}%` }} />
              </div>

              <div className="rounded-md border border-border p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{t("tool.seoMeta.basicMeta")}</h3>
                {[
                  { label: t("tool.seoMeta.title"), value: result.title, ok: !!result.title },
                  { label: t("tool.seoMeta.length"), value: result.title ? `${result.title.length} chars` : "N/A", ok: result.title.length >= 10 && result.title.length <= 60 },
                  { label: t("tool.seoMeta.description"), value: result.description || t("tool.seoMeta.missing"), ok: result.hasDescription },
                  { label: t("tool.seoMeta.descLength"), value: result.description ? `${result.description.length} chars` : "N/A", ok: result.description.length >= 50 && result.description.length <= 160 },
                  { label: t("tool.seoMeta.canonical"), value: result.canonical || t("tool.seoMeta.missing"), ok: result.canonicalOk },
                  { label: t("tool.seoMeta.robots"), value: result.robots || "Not set (default: index, follow)", ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2 text-sm">
                    <span className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${item.ok ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-muted-foreground w-24 shrink-0">{item.label}:</span>
                    <span className="text-foreground break-all">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-md border border-border p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{t("tool.seoMeta.openGraph")}</h3>
                {[
                  { label: "og:title", value: result.ogTitle },
                  { label: "og:description", value: result.ogDescription },
                  { label: "og:image", value: result.ogImage },
                  { label: "og:type", value: result.ogType },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2 text-sm">
                    <span className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${item.value ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-muted-foreground w-28 shrink-0">{item.label}:</span>
                    <span className="text-foreground break-all">{item.value || t("tool.seoMeta.missing")}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-md border border-border p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{t("tool.seoMeta.twitterCard")}</h3>
                {[
                  { label: "twitter:card", value: result.twitterCard },
                  { label: "twitter:title", value: result.twitterTitle },
                  { label: "twitter:description", value: result.twitterDescription },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2 text-sm">
                    <span className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${item.value ? "bg-green-500" : "bg-yellow-500"}`} />
                    <span className="text-muted-foreground w-28 shrink-0">{item.label}:</span>
                    <span className="text-foreground break-all">{item.value || t("tool.seoMeta.missing")}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-md border border-border p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{t("tool.seoMeta.headings")}</h3>
                <div>
                  <span className="text-sm text-muted-foreground">H1 ({result.h1.length}):</span>
                  {result.h1.length === 0 && <span className="text-sm text-red-500 ml-1">{t("tool.seoMeta.missing")}</span>}
                  {result.h1.length > 1 && <span className="text-sm text-yellow-500 ml-1">Multiple H1s detected</span>}
                  {result.h1.map((h, i) => (
                    <div key={i} className="text-sm text-foreground ml-4">{h}</div>
                  ))}
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">H2 ({result.h2.length}):</span>
                  {result.h2.slice(0, 10).map((h, i) => (
                    <div key={i} className="text-sm text-foreground ml-4">{h}</div>
                  ))}
                  {result.h2.length > 10 && <div className="text-sm text-muted-foreground ml-4">...and {result.h2.length - 10} more</div>}
                </div>
              </div>

              <div className="rounded-md border border-border p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{t("tool.seoMeta.images")} ({result.images.length})</h3>
                <div className="text-sm text-muted-foreground">
                  {result.images.length} images found, {result.images.filter((i) => i.alt).length} with alt text
                </div>
                {result.images.filter((i) => !i.alt).length > 0 && (
                  <div className="text-sm text-yellow-500">
                    {result.images.filter((i) => !i.alt).length} images missing alt text
                  </div>
                )}
              </div>

              <div className="rounded-md border border-border p-4 text-sm">
                <span className="text-muted-foreground">{t("tool.seoMeta.links")}: </span>
                <span className="text-foreground">{result.links} links found</span>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              {t("tool.seoMeta.emptyHint")}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
