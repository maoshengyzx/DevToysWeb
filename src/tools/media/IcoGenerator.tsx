import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/i18n/useLocale"
import { Download, Upload, X } from "lucide-react"
import { ErrorBanner } from "@/components/ui/error-banner"

const ICO_SIZES = [16, 32, 48, 64, 128, 256]

function createIcoFromImage(img: HTMLImageElement): Blob {
  const iconData: { data: Uint8Array; size: number }[] = []

  for (const size of ICO_SIZES) {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(img, 0, 0, size, size)
    const dataUrl = canvas.toDataURL("image/png")
    const binaryStr = atob(dataUrl.split(",")[1])
    const data = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) data[i] = binaryStr.charCodeAt(i)
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
  view.setUint16(2, iconData.length, true)

  iconData.forEach((icon, i) => {
    const dirOffset = headerSize + i * dirEntrySize
    view.setUint8(dirOffset, icon.size === 256 ? 0 : icon.size)
    view.setUint8(dirOffset + 1, icon.size === 256 ? 0 : icon.size)
    view.setUint8(dirOffset + 2, 0)
    view.setUint8(dirOffset + 3, 0)
    view.setUint16(dirOffset + 4, 1, true)
    view.setUint16(dirOffset + 6, icon.data.length, true)
    view.setUint32(dirOffset + 8, offset, true)
    const pngBuffer = new Uint8Array(buffer, offset, icon.data.length)
    pngBuffer.set(icon.data)
    offset += icon.data.length
  })

  return new Blob([buffer], { type: "image/x-icon" })
}

export function IcoGenerator() {
  const { t } = useLocale()
  const [previewUrl, setPreviewUrl] = useState("")
  const [icoUrl, setIcoUrl] = useState("")
  const [error, setError] = useState("")
  const [generating, setGenerating] = useState(false)
  const prevUrlRef = useRef<string>("")

  const processFile = useCallback((file: File) => {
    setError("")
    setIcoUrl("")
    setPreviewUrl("")
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = ""
    }

    const url = URL.createObjectURL(file)
    prevUrlRef.current = url
    setPreviewUrl(url)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setGenerating(true)
      setTimeout(() => {
        try {
          const blob = createIcoFromImage(img)
          const icoObjUrl = URL.createObjectURL(blob)
          setIcoUrl(icoObjUrl)
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

  const clearAll = () => {
    setPreviewUrl("")
    setIcoUrl("")
    setError("")
    setGenerating(false)
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = ""
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">{t("tool.icoGenerator.sourceImage")}</label>
            <div
              className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors duration-150 cursor-pointer min-h-[240px] ${previewUrl ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50"}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("ico-file-input")?.click()}
            >
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Source" className="max-h-48 rounded-md object-contain" />
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

          <div className="flex flex-col gap-4">
            {error && <ErrorBanner message={error} />}
            {icoUrl ? (
              <div className="flex flex-col gap-4">
                <label className="text-sm font-medium text-foreground">{t("tool.icoGenerator.result")}</label>
                <div className="flex items-center gap-6 flex-wrap">
                  {ICO_SIZES.map((sz) => (
                    <div key={sz} className="flex flex-col items-center gap-1">
                      <img
                        src={icoUrl}
                        alt={`${sz}px`}
                        className="rounded border border-border"
                        style={{ width: Math.min(sz, 64), height: Math.min(sz, 64), imageRendering: "pixelated" }}
                      />
                      <span className="text-xs text-muted-foreground">{sz}×{sz}</span>
                    </div>
                  ))}
                </div>
                {previewUrl && (
                  <div className="flex flex-col items-start gap-2">
                    <span className="text-xs text-muted-foreground">{t("tool.icoGenerator.previewAtSize")}</span>
                    <div className="rounded-md border border-border p-4 bg-muted/50 flex items-center justify-center">
                      <img src={previewUrl} alt="Preview" className="h-16 w-16 object-contain" />
                    </div>
                  </div>
                )}
                <Button variant="outline" className="gap-1.5 cursor-pointer w-fit" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  {t("tool.icoGenerator.downloadIco")}
                </Button>
              </div>
            ) : generating ? (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                {t("tool.icoGenerator.generating")}
              </div>
            ) : !error && (
              <div className="flex items-center justify-center h-[200px] rounded-md border border-dashed border-border text-sm text-muted-foreground">
                {t("tool.icoGenerator.emptyHint")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}