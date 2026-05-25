import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/i18n/useLocale"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Copy, Check, Download, Upload, X, LoaderCircle } from "lucide-react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

type OutputFormat = "png" | "jpeg" | "webp"

const MAX_CANVAS_SIZE = 8192
const MAX_INPUT_SIZE = 1024 * 1024

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function truncateDataUrl(svg: string): string {
  return svg.replace(
    /(href=")data:[^"]*(")/g,
    (_, prefix, suffix) => `${prefix}[base64 data]${suffix}`,
  )
}

function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "")
}

function clampSize(w: number, h: number, max: number): { w: number; h: number } {
  if (w <= max && h <= max) return { w, h }
  const ratio = Math.min(max / w, max / h)
  return { w: Math.round(w * ratio), h: Math.round(h * ratio) }
}

export function SvgConverter() {
  const { t } = useLocale()
  const [mode, setMode] = useState<"codeToImage" | "imageToCode">("codeToImage")
  const [svgCode, setSvgCode] = useState("")
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png")
  const [scale, setScale] = useState(2)
  const [resultUrl, setResultUrl] = useState("")
  const [error, setError] = useState("")
  const [decodedCode, setDecodedCode] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()
  const [processing, setProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevObjectUrlRef = useRef<string>("")

  const revokePrev = () => {
    if (prevObjectUrlRef.current) {
      URL.revokeObjectURL(prevObjectUrlRef.current)
      prevObjectUrlRef.current = ""
    }
  }

  const handleCodeToImage = () => {
    if (!svgCode.trim()) return
    setError("")
    setResultUrl("")
    setProcessing(true)

    const cleanSvg = sanitizeSvg(svgCode)
    const blob = new Blob([cleanSvg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      requestAnimationFrame(() => {
        try {
          const canvas = canvasRef.current
          if (!canvas) return
          const rawW = img.width * scale || 400 * scale
          const rawH = img.height * scale || 400 * scale
          const { w, h } = clampSize(rawW, rawH, MAX_CANVAS_SIZE)
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext("2d")!
          ctx.clearRect(0, 0, w, h)
          ctx.drawImage(img, 0, 0, w, h)
          const mimeType = `image/${outputFormat === "jpeg" ? "jpeg" : outputFormat}`
          const quality = outputFormat === "png" ? undefined : 0.92
          const dataUrl = canvas.toDataURL(mimeType, quality)
          setResultUrl(dataUrl)
        } catch {
          setError("Failed to convert SVG to image")
        } finally {
          setProcessing(false)
          URL.revokeObjectURL(url)
        }
      })
    }
    img.onerror = () => {
      setError(t("tool.svgConverter.invalidSvg"))
      setProcessing(false)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const handleDownload = () => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = `converted.${outputFormat === "jpeg" ? "jpg" : outputFormat}`
    a.click()
  }

  const processImageFile = useCallback((file: File) => {
    setError("")
    setDecodedCode("")
    setPreviewUrl("")
    revokePrev()

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setPreviewUrl(dataUrl)

      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0)

        if (file.type === "image/svg+xml") {
          const text = atob(dataUrl.split(",")[1])
          setDecodedCode(text)
        } else {
          const svgWrap = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}"><image href="${dataUrl}" width="${img.width}" height="${img.height}"/></svg>`
          setDecodedCode(svgWrap)
        }
      }
      img.onerror = () => setError("Failed to load image")
      img.src = dataUrl
    }
    reader.onerror = () => setError("Failed to read file")
    reader.readAsDataURL(file)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processImageFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      processImageFile(file)
    } else {
      setError("Please drop an image file")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDownloadSvg = () => {
    if (!decodedCode) return
    const blob = new Blob([decodedCode], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "converted.svg"
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearImageMode = () => {
    setDecodedCode("")
    setPreviewUrl("")
    setError("")
    revokePrev()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3">
        <Button variant={mode === "codeToImage" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setMode("codeToImage"); setError(""); setResultUrl(""); }}>
          {t("tool.svgConverter.svgToImage")}
        </Button>
        <Button variant={mode === "imageToCode" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setMode("imageToCode"); setError(""); setDecodedCode(""); setPreviewUrl(""); }}>
          {t("tool.svgConverter.imageToSvg")}
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {mode === "codeToImage" ? (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">{t("tool.svgConverter.svgCode")}</label>
              <Textarea
                value={svgCode}
                onChange={(e) => {
                  const val = e.target.value
                  if (val.length > MAX_INPUT_SIZE) {
                    setError(`SVG code is too large (${formatSize(val.length)}). Max allowed: ${formatSize(MAX_INPUT_SIZE)}.`)
                    return
                  }
                  setError("")
                  setSvgCode(val)
                }}
                placeholder={t("tool.svgConverter.svgPlaceholder")}
                className="min-h-[200px]"
              />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("tool.svgConverter.format")}</span>
                {(["png", "jpeg", "webp"] as OutputFormat[]).map((f) => (
                  <Button key={f} variant={outputFormat === f ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => setOutputFormat(f)}>
                    {f.toUpperCase()}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("tool.svgConverter.scale")}</span>
                <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground cursor-pointer">
                  <option value={1}>1×</option>
                  <option value={2}>2×</option>
                  <option value={3}>3×</option>
                  <option value={4}>4×</option>
                </select>
              </div>
            </div>
            <Button className="cursor-pointer" disabled={processing} onClick={handleCodeToImage}>
              {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-1" />}
              {t("tool.svgConverter.convertToImage")}
            </Button>
            {error && <ErrorBanner message={error} />}
            {resultUrl && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">{t("tool.svgConverter.convertResult")}</label>
                <img src={resultUrl} alt="Converted" className="max-h-[300px] rounded-md border border-border object-contain" />
                <Button variant="outline" className="gap-1.5 cursor-pointer w-fit" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  {t("shared.download")}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            <div
              className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors duration-150 cursor-pointer ${previewUrl ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50"}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("svg-image-input")?.click()}
            >
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="max-h-48 rounded-md object-contain" />
                  <button
                    className="absolute -right-2 -top-2 rounded-full bg-destructive text-white p-0.5 hover:bg-destructive/80"
                    onClick={(e) => { e.stopPropagation(); clearImageMode(); }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t("tool.svgConverter.dropImage")}</p>
                  <p className="text-xs text-muted-foreground">{t("tool.svgConverter.supportedFormats")}</p>
                </>
              )}
              <input id="svg-image-input" type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            </div>

            {error && <ErrorBanner message={error} />}

            {decodedCode && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">SVG Output</label>
                  <span className="text-xs text-muted-foreground">{formatSize(new Blob([decodedCode]).size)}</span>
                </div>
                <ReadOnlyTextarea value={truncateDataUrl(decodedCode)} className="min-h-[150px]" />
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(decodedCode)}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? t("shared.copied") : t("shared.copyOutput")}
                  </Button>
                  <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={handleDownloadSvg}>
                    <Download className="h-3.5 w-3.5" />
                    {t("tool.svgConverter.downloadSvg")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
