import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Download, Upload } from "lucide-react"
import { ErrorBanner } from "@/components/ui/error-banner"

type OutputFormat = "png" | "jpeg" | "webp"

export function SvgConverter() {
  const [mode, setMode] = useState<"codeToImage" | "imageToCode">("codeToImage")
  const [svgCode, setSvgCode] = useState("")
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png")
  const [scale, setScale] = useState(2)
  const [resultUrl, setResultUrl] = useState("")
  const [error, setError] = useState("")
  const [decodedCode, setDecodedCode] = useState("")
  const imageCanvasRef = useRef<HTMLCanvasElement>(null)
  const decodeCanvasRef = useRef<HTMLCanvasElement>(null)

  const handleCodeToImage = () => {
    if (!svgCode.trim()) return
    setError("")
    setResultUrl("")

    const blob = new Blob([svgCode], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = imageCanvasRef.current
      if (!canvas) return
      const w = img.width * scale || 400 * scale
      const h = img.height * scale || 400 * scale
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")!
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      const mimeType = `image/${outputFormat === "jpeg" ? "jpeg" : outputFormat}`
      const quality = outputFormat === "png" ? undefined : 0.92
      const dataUrl = canvas.toDataURL(mimeType, quality)
      setResultUrl(dataUrl)
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      setError("Invalid SVG code")
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setDecodedCode("")

    const img = new Image()
    const canvas = decodeCanvasRef.current
    if (!canvas) return
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0)
      const dataUrl = canvas.toDataURL("image/png")
      setDecodedCode(dataUrl)
    }
    img.src = URL.createObjectURL(file)
  }

  const handleDownloadSvg = () => {
    if (!decodedCode) return
    if (decodedCode.startsWith("data:image/svg+xml")) {
      const svg = decodeURIComponent(decodedCode.split(",")[1])
      const blob = new Blob([svg], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "image.svg"
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const svgWrap = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><image href="${decodedCode}" width="100%" height="100%"/></svg>`
      const blob = new Blob([svgWrap], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "wrapped-image.svg"
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3">
        <Button variant={mode === "codeToImage" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setMode("codeToImage"); setError(""); setResultUrl(""); }}>
          SVG Code → Image
        </Button>
        <Button variant={mode === "imageToCode" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setMode("imageToCode"); setError(""); setDecodedCode(""); }}>
          Image → SVG Code
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {mode === "codeToImage" ? (
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">SVG Code</label>
              <Textarea value={svgCode} onChange={(e) => setSvgCode(e.target.value)} placeholder='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">...</svg>' className="min-h-[200px]" />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Format:</span>
                {(["png", "jpeg", "webp"] as OutputFormat[]).map((f) => (
                  <Button key={f} variant={outputFormat === f ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => setOutputFormat(f)}>
                    {f.toUpperCase()}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Scale:</span>
                <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground cursor-pointer">
                  <option value={1}>1×</option>
                  <option value={2}>2×</option>
                  <option value={3}>3×</option>
                  <option value={4}>4×</option>
                </select>
              </div>
            </div>
            <Button className="cursor-pointer" onClick={handleCodeToImage}>Convert to Image</Button>
            {error && <ErrorBanner message={error} />}
            {resultUrl && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Result</label>
                <img src={resultUrl} alt="Converted" className="max-h-[300px] rounded-md border border-border object-contain" />
                <Button variant="outline" className="gap-1.5 cursor-pointer w-fit" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  Download {outputFormat.toUpperCase()}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Upload Image</label>
              <label className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-4 py-8 cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload PNG, JPG, or WebP</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            {decodedCode && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Result (Base64 Data URL)</label>
                <ReadOnlyTextarea value={decodedCode} className="min-h-[150px]" />
                <Button variant="outline" className="gap-1.5 cursor-pointer w-fit" onClick={handleDownloadSvg}>
                  <Download className="h-3.5 w-3.5" />
                  Download SVG Wrapper
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <canvas ref={imageCanvasRef} className="hidden" />
      <canvas ref={decodeCanvasRef} className="hidden" />
    </div>
  )
}