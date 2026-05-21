import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"
import { ErrorBanner } from "@/components/ui/error-banner"

type Format = "png" | "jpeg" | "webp"

export function ImageCompressor() {
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<Format>("jpeg")
  const [maxWidth, setMaxWidth] = useState(1920)
  const [maxHeight, setMaxHeight] = useState(1080)
  const [sourceUrl, setSourceUrl] = useState("")
  const [resultUrl, setResultUrl] = useState("")
  const [sourceInfo, setSourceInfo] = useState({ name: "", size: 0, width: 0, height: 0 })
  const [resultInfo, setResultInfo] = useState({ size: 0, width: 0, height: 0 })
  const [error, setError] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const processImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return

    let width = img.width
    let height = img.height
    if (width > maxWidth) { height = (maxWidth / width) * height; width = maxWidth }
    if (height > maxHeight) { width = (maxHeight / height) * width; height = maxHeight }
    width = Math.round(width)
    height = Math.round(height)

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(img, 0, 0, width, height)

    const mimeType = `image/${format}`
    const q = format === "png" ? undefined : quality / 100
    const dataUrl = canvas.toDataURL(mimeType, q)

    setResultUrl(dataUrl)
    const byteLength = Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 3 / 4)
    setResultInfo({ size: byteLength, width, height })
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setResultUrl("")
    setResultInfo({ size: 0, width: 0, height: 0 })

    const url = URL.createObjectURL(file)
    setSourceUrl(url)
    setSourceInfo({ name: file.name, size: file.size, width: 0, height: 0 })

    const img = new Image()
    img.onload = () => {
      setSourceInfo((prev) => ({ ...prev, width: img.width, height: img.height }))
      processImage(img)
    }
    img.onerror = () => setError("Failed to load image")
    img.src = url
  }

  const handleReprocess = () => {
    if (!sourceUrl) return
    setError("")
    const img = new Image()
    img.onload = () => processImage(img)
    img.src = sourceUrl
  }

  const handleDownload = () => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = sourceInfo.name.replace(/\.[^.]+$/, "") + "." + (format === "jpeg" ? "jpg" : format)
    a.click()
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const savings = sourceInfo.size > 0 && resultInfo.size > 0
    ? Math.round((1 - resultInfo.size / sourceInfo.size) * 100)
    : 0

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Format:</span>
        {(["jpeg", "png", "webp"] as Format[]).map((f) => (
          <Button key={f} variant={format === f ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => setFormat(f)}>
            {f.toUpperCase()}
          </Button>
        ))}
        {format !== "png" && (
          <>
            <div className="w-px h-4 bg-border" />
            <span className="text-sm text-muted-foreground">Quality: {quality}%</span>
            <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-24 accent-primary cursor-pointer" />
          </>
        )}
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-2xl">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Upload Image</label>
            <label className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-4 py-8 cursor-pointer hover:border-primary transition-colors duration-150">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload PNG, JPG, WebP, GIF, BMP</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">Original</label>
              {sourceInfo.size > 0 && (
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{sourceInfo.width} × {sourceInfo.height} px</p>
                  <p>{formatSize(sourceInfo.size)}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">Result</label>
              {resultInfo.size > 0 && (
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{resultInfo.width} × {resultInfo.height} px</p>
                  <p>{formatSize(resultInfo.size)}</p>
                  {savings > 0 && <p className="text-green-500">Saved {savings}%</p>}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Max Width</label>
              <input type="number" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Max Height</label>
              <input type="number" value={maxHeight} onChange={(e) => setMaxHeight(Number(e.target.value))} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </div>
          {error && <ErrorBanner message={error} />}
          {sourceUrl && (
            <div className="flex gap-2">
              <Button className="cursor-pointer" onClick={handleReprocess}>Re-process</Button>
              {resultUrl && (
                <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              )}
            </div>
          )}
          {sourceUrl && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Original</label>
                <img src={sourceUrl} alt="Original" className="max-h-[300px] rounded-md border border-border object-contain" />
              </div>
              {resultUrl && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Result</label>
                  <img src={resultUrl} alt="Result" className="max-h-[300px] rounded-md border border-border object-contain" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}