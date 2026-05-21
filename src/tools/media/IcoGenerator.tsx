import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload, X } from "lucide-react"
import { ErrorBanner } from "@/components/ui/error-banner"

function createIcoFromImage(img: HTMLImageElement): Blob {
  const sizes = [16, 32]
  const iconData: { data: Uint8Array; size: number }[] = []

  for (const size of sizes) {
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
    view.setUint8(dirOffset, icon.size)
    view.setUint8(dirOffset + 1, icon.size)
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
  const [previewUrl, setPreviewUrl] = useState("")
  const [icoUrl, setIcoUrl] = useState("")
  const [error, setError] = useState("")
  const [generating, setGenerating] = useState(false)

  const processFile = useCallback((file: File) => {
    setError("")
    setIcoUrl("")
    setPreviewUrl("")

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setGenerating(true)
      try {
        const blob = createIcoFromImage(img)
        const icoObjUrl = URL.createObjectURL(blob)
        setIcoUrl(icoObjUrl)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to generate ICO")
      } finally {
        setGenerating(false)
      }
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
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-lg mx-auto space-y-4">
          <div
            className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors duration-150 cursor-pointer ${previewUrl ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50"}`}
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
                <p className="text-sm text-muted-foreground">Drop a square image here or click to upload</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, SVG, or WebP — 1:1 aspect ratio recommended</p>
              </>
            )}
            <input id="ico-file-input" type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
          </div>

          <p className="text-sm text-muted-foreground">
            Generates favicon.ico with 16×16 and 32×32 sizes.
          </p>

          {error && <ErrorBanner message={error} />}

          {icoUrl && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <img src={icoUrl} alt="16px" className="h-4 w-4 rounded border border-border" style={{ imageRendering: "pixelated" }} />
                  <span className="text-xs text-muted-foreground">16×16</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <img src={icoUrl} alt="32px" className="h-8 w-8 rounded border border-border" />
                  <span className="text-xs text-muted-foreground">32×32</span>
                </div>
              </div>
              <Button variant="outline" className="gap-1.5 cursor-pointer w-fit" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5" />
                Download favicon.ico
              </Button>
            </div>
          )}

          {generating && !icoUrl && (
            <p className="text-sm text-muted-foreground">Generating...</p>
          )}
        </div>
      </div>
    </div>
  )
}