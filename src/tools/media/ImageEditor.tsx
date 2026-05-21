import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload, RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react"

type Filter = "none" | "grayscale" | "sepia" | "invert" | "blur" | "brightness" | "contrast" | "saturate"

const FILTERS: { label: string; value: Filter; css: string }[] = [
  { label: "None", value: "none", css: "none" },
  { label: "Grayscale", value: "grayscale", css: "grayscale(100%)" },
  { label: "Sepia", value: "sepia", css: "sepia(100%)" },
  { label: "Invert", value: "invert", css: "invert(100%)" },
  { label: "Blur", value: "blur", css: "blur(2px)" },
  { label: "Bright", value: "brightness", css: "brightness(1.5)" },
  { label: "Contrast", value: "contrast", css: "contrast(1.5)" },
  { label: "Saturate", value: "saturate", css: "saturate(2)" },
]

const ROTATION_ICONS = [
  { icon: RotateCw, label: "Rotate CW", action: "cw" as const },
  { icon: RotateCcw, label: "Rotate CCW", action: "ccw" as const },
  { icon: FlipHorizontal, label: "Flip H", action: "fh" as const },
  { icon: FlipVertical, label: "Flip V", action: "fv" as const },
]

export function ImageEditor() {
  const [sourceUrl, setSourceUrl] = useState("")
  const [filter, setFilter] = useState<Filter>("none")
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [resultUrl, setResultUrl] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setSourceUrl(url)
    const img = new Image()
    img.onload = () => { imgRef.current = img }
    img.src = url
  }, [])

  const applyTransform = useCallback(() => {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    const rad = (rotation * Math.PI) / 180
    const sin = Math.abs(Math.sin(rad))
    const cos = Math.abs(Math.cos(rad))
    const w = img.width * cos + img.height * sin
    const h = img.width * sin + img.height * cos

    canvas.width = Math.round(w)
    canvas.height = Math.round(h)
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const filterCss = FILTERS.find((f) => f.value === filter)?.css || "none"
    ctx.filter = filterCss

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(rad)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.drawImage(img, -img.width / 2, -img.height / 2)
    ctx.restore()

    setResultUrl(canvas.toDataURL("image/png"))
  }, [filter, rotation, flipH, flipV])

  const handleTransform = (action: "cw" | "ccw" | "fh" | "fv") => {
    switch (action) {
      case "cw": setRotation((r) => (r + 90) % 360); break
      case "ccw": setRotation((r) => (r - 90 + 360) % 360); break
      case "fh": setFlipH((v) => !v); break
      case "fv": setFlipV((v) => !v); break
    }
  }

  const handleDownload = () => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = "edited.png"
    a.click()
  }

  const handleReset = () => {
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setFilter("none")
    setResultUrl("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Filter:</span>
        {FILTERS.map((f) => (
          <Button key={f.value} variant={filter === f.value ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => setFilter(f.value)}>
            {f.label}
          </Button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-2xl">
          {!sourceUrl ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Upload Image</label>
              <label className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-4 py-12 cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload PNG, JPG, WebP, GIF</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Transform:</span>
                {ROTATION_ICONS.map(({ icon: Icon, label, action }) => (
                  <Button key={action} variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleTransform(action)} title={label}>
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="cursor-pointer" onClick={applyTransform}>Apply Filters & Transform</Button>
                <Button variant="outline" className="cursor-pointer" onClick={handleReset}>Reset</Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Original</label>
                  <div className="flex items-center justify-center rounded-md border border-border bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-2 min-h-[200px]">
                    <img src={sourceUrl} alt="Original" className="max-h-[300px] object-contain rounded" />
                  </div>
                </div>
                {resultUrl && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Result</label>
                      <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={handleDownload}>
                        <Download className="h-3.5 w-3.5" />
                        Download PNG
                      </Button>
                    </div>
                    <div className="flex items-center justify-center rounded-md border border-border bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-2 min-h-[200px]">
                      <img src={resultUrl} alt="Result" className="max-h-[300px] object-contain rounded" />
                    </div>
                  </div>
                )}
              </div>
              {(rotation !== 0 || flipH || flipV) && (
                <p className="text-xs text-muted-foreground">
                  Rotation: {rotation}°{flipH ? " | Flipped H" : ""}{flipV ? " | Flipped V" : ""}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}