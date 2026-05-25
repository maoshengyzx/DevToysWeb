import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/i18n/useLocale"
import { Download, Upload, X } from "lucide-react"
import { ErrorBanner } from "@/components/ui/error-banner"

const ICO_SIZES = [16, 32, 48, 64, 128, 256]

interface SizePreview {
  size: number
  dataUrl: string
  pngData: Uint8Array
}

function generateIco(img: HTMLImageElement, sizes?: number[]): { blob: Blob; previews: SizePreview[] } {
  const targetSizes = sizes ?? ICO_SIZES
  const iconData: { data: Uint8Array; size: number }[] = []
  const previews: SizePreview[] = []

  for (const size of targetSizes) {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")!
    if (size >= 32) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
    }
    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(img, 0, 0, size, size)
    const dataUrl = canvas.toDataURL("image/png")
    const binaryStr = atob(dataUrl.split(",")[1])
    const data = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) data[i] = binaryStr.charCodeAt(i)
    previews.push({ size, dataUrl, pngData: data })
    iconData.push({ data, size })
  }

  const headerSize = 6
  const dirEntrySize = 16
  const dirSize = dirEntrySize * iconData.length
  let offset = headerSize + dirSize
  const totalSize = headerSize + dirSize + iconData.reduce((s, ic) => s + ic.data.length, 0)
  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)

  view.setUint16(0, 0, true)
  view.setUint16(2, 1, true)
  view.setUint16(4, iconData.length, true)

  iconData.forEach((icon, i) => {
    const dirOffset = headerSize + i * dirEntrySize
    view.setUint8(dirOffset, icon.size === 256 ? 0 : icon.size)
    view.setUint8(dirOffset + 1, icon.size === 256 ? 0 : icon.size)
    view.setUint8(dirOffset + 2, 0)
    view.setUint8(dirOffset + 3, 0)
    view.setUint16(dirOffset + 4, 1, true)
    view.setUint16(dirOffset + 6, 32, true)
    view.setUint32(dirOffset + 8, icon.data.length, true)
    view.setUint32(dirOffset + 12, offset, true)
    const pngBuffer = new Uint8Array(buffer, offset, icon.data.length)
    pngBuffer.set(icon.data)
    offset += icon.data.length
  })

  return { blob: new Blob([buffer], { type: "image/x-icon" }), previews }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadPng(pngData: Uint8Array, size: number) {
  const blob = new Blob([pngData.buffer as ArrayBuffer], { type: "image/png" })
  downloadBlob(blob, `icon-${size}x${size}.png`)
}

export function IcoGenerator() {
  const { t } = useLocale()
  const [previewUrl, setPreviewUrl] = useState("")
  const [icoUrl, setIcoUrl] = useState("")
  const [sizePreviews, setSizePreviews] = useState<SizePreview[]>([])
  const [error, setError] = useState("")
  const [generating, setGenerating] = useState(false)
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const prevUrlRef = useRef<string>("")
  const icoUrlRef = useRef<string>("")
  const sourceImgRef = useRef<HTMLImageElement | null>(null)

  const processFile = useCallback((file: File) => {
    setError("")
    setIcoUrl("")
    setSizePreviews([])
    setPreviewUrl("")
    setSelectedSize(null)
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = ""
    }
    if (icoUrlRef.current) {
      URL.revokeObjectURL(icoUrlRef.current)
      icoUrlRef.current = ""
    }

    const url = URL.createObjectURL(file)
    prevUrlRef.current = url
    setPreviewUrl(url)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      sourceImgRef.current = img
      setGenerating(true)
      setTimeout(() => {
        try {
          const { blob, previews } = generateIco(img)
          const icoObjUrl = URL.createObjectURL(blob)
          icoUrlRef.current = icoObjUrl
          setIcoUrl(icoObjUrl)
          setSizePreviews(previews)
          setSelectedSize(64)
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to generate ICO")
        } finally {
          setGenerating(false)
        }
      }, 0)
    }
    img.onerror = () => {
      setError("Failed to load image")
      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      processFile(file)
    } else {
      setError("Please drop an image file")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDownload = () => {
    if (!icoUrl) return
    const a = document.createElement("a")
    a.href = icoUrl
    a.download = "favicon.ico"
    a.click()
  }

  const handleDownloadSingleSize = (preview: SizePreview) => {
    const img = sourceImgRef.current
    if (!img) return
    const { blob } = generateIco(img, [preview.size])
    downloadBlob(blob, `icon-${preview.size}x${preview.size}.ico`)
  }

  const handleDownloadPng = (preview: SizePreview) => {
    downloadPng(preview.pngData, preview.size)
  }

  const clearAll = () => {
    setPreviewUrl("")
    setIcoUrl("")
    setSizePreviews([])
    setError("")
    setGenerating(false)
    setSelectedSize(null)
    sourceImgRef.current = null
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = ""
    }
    if (icoUrlRef.current) {
      URL.revokeObjectURL(icoUrlRef.current)
      icoUrlRef.current = ""
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between min-h-[36px]">
              <label className="text-sm font-medium text-foreground">{t("tool.icoGenerator.sourceImage")}</label>
              <div />
            </div>
            <div
              className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors duration-150 cursor-pointer min-h-[320px] ${previewUrl ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50"}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("ico-file-input")?.click()}
            >
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Source" className="max-h-64 rounded-md object-contain" />
                  <button
                    className="absolute -right-2 -top-2 rounded-full bg-destructive text-white p-0.5 hover:bg-destructive/80"
                    onClick={(e) => { e.stopPropagation(); clearAll(); }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t("tool.icoGenerator.dropHint")}</p>
                  <p className="text-xs text-muted-foreground">{t("tool.icoGenerator.supportedFormats")}</p>
                </>
              )}
              <input id="ico-file-input" type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("tool.icoGenerator.description")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between min-h-[36px]">
              <label className={`text-sm font-medium text-foreground ${icoUrl ? "" : "invisible"}`}>
                {t("tool.icoGenerator.result")}
              </label>
              <div />
            </div>
            {error && <ErrorBanner message={error} />}
            {icoUrl ? (
              <div className="flex flex-col gap-4 min-h-[320px]">
                <div className="flex items-center gap-4 flex-wrap">
                  {sizePreviews.map((p) => (
                    <button
                      key={p.size}
                      className={`flex flex-col items-center gap-1 rounded-md p-1.5 cursor-pointer transition-colors border ${selectedSize === p.size ? "border-primary bg-primary/10" : "border-transparent hover:border-border hover:bg-muted/50"}`}
                      onClick={() => setSelectedSize(selectedSize === p.size ? null : p.size)}
                    >
                      <img
                        src={p.dataUrl}
                        alt={`${p.size}px`}
                        className="rounded border border-border"
                        style={{ width: Math.min(p.size, 64), height: Math.min(p.size, 64), imageRendering: "pixelated" }}
                      />
                      <span className="text-xs text-muted-foreground">{p.size}×{p.size}</span>
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Download {selectedSize}×{selectedSize} as:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 cursor-pointer"
                      onClick={() => {
                        const p = sizePreviews.find((s) => s.size === selectedSize)
                        if (p) handleDownloadSingleSize(p)
                      }}
                    >
                      <Download className="h-3 w-3" />
                      ICO
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 cursor-pointer"
                      onClick={() => {
                        const p = sizePreviews.find((s) => s.size === selectedSize)
                        if (p) handleDownloadPng(p)
                      }}
                    >
                      <Download className="h-3 w-3" />
                      PNG
                    </Button>
                  </div>
                )}
                <Button variant="default" className="gap-1.5 cursor-pointer w-fit" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  {t("tool.icoGenerator.downloadIco")}
                </Button>
              </div>
            ) : generating ? (
              <div className="flex items-center justify-center min-h-[320px] text-sm text-muted-foreground">
                {t("tool.icoGenerator.generating")}
              </div>
            ) : !error && (
              <div className="flex items-center justify-center min-h-[320px] rounded-md border border-dashed border-border text-sm text-muted-foreground">
                {t("tool.icoGenerator.emptyHint")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
