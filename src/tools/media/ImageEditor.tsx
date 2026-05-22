import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/i18n/useLocale"
import type { TranslationKey } from "@/i18n/locales"
import {
  Download, Upload, RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
  Crop, Maximize2, Sun, X, Check, Lock, Unlock,
} from "lucide-react"

interface FilterState {
  brightness: number
  contrast: number
  saturate: number
  blur: number
  hueRotate: number
  sepia: number
  grayscale: number
  invert: number
  opacity: number
}

const DEFAULTS: FilterState = {
  brightness: 100, contrast: 100, saturate: 100, blur: 0,
  hueRotate: 0, sepia: 0, grayscale: 0, invert: 0, opacity: 100,
}

const createSliders = (t: (key: TranslationKey) => string): { key: keyof FilterState; label: string; min: number; max: number; step: number; unit: string }[] => [
  { key: "brightness", label: t("tool.imageEditor.brightness"), min: 0, max: 200, step: 1, unit: "%" },
  { key: "contrast", label: t("tool.imageEditor.contrast"), min: 0, max: 200, step: 1, unit: "%" },
  { key: "saturate", label: t("tool.imageEditor.saturation"), min: 0, max: 200, step: 1, unit: "%" },
  { key: "blur", label: t("tool.imageEditor.blur"), min: 0, max: 20, step: 0.5, unit: "px" },
  { key: "hueRotate", label: t("tool.imageEditor.hueRotate"), min: 0, max: 360, step: 1, unit: "°" },
  { key: "sepia", label: t("tool.imageEditor.sepia"), min: 0, max: 100, step: 1, unit: "%" },
  { key: "grayscale", label: t("tool.imageEditor.grayscale"), min: 0, max: 100, step: 1, unit: "%" },
  { key: "invert", label: t("tool.imageEditor.invert"), min: 0, max: 100, step: 1, unit: "%" },
  { key: "opacity", label: t("tool.imageEditor.opacity"), min: 0, max: 100, step: 1, unit: "%" },
]

type Tool = "adjust" | "transform" | "crop" | "resize" | "format"
type OutputFormat = "png" | "jpeg" | "webp"

function buildFilterCSS(f: FilterState): string {
  const parts: string[] = []
  if (f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`)
  if (f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`)
  if (f.saturate !== 100) parts.push(`saturate(${f.saturate}%)`)
  if (f.blur !== 0) parts.push(`blur(${f.blur}px)`)
  if (f.hueRotate !== 0) parts.push(`hue-rotate(${f.hueRotate}deg)`)
  if (f.sepia !== 0) parts.push(`sepia(${f.sepia}%)`)
  if (f.grayscale !== 0) parts.push(`grayscale(${f.grayscale}%)`)
  if (f.invert !== 0) parts.push(`invert(${f.invert}%)`)
  if (f.opacity !== 100) parts.push(`opacity(${f.opacity}%)`)
  return parts.length ? parts.join(" ") : "none"
}

function buildTransformCSS(rotation: number, flipH: boolean, flipV: boolean): string {
  const parts: string[] = []
  if (rotation) parts.push(`rotate(${rotation}deg)`)
  if (flipH) parts.push("scaleX(-1)")
  if (flipV) parts.push("scaleY(-1)")
  return parts.length ? parts.join(" ") : "none"
}

export function ImageEditor() {
  const { t } = useLocale()
  const [sourceUrl, setSourceUrl] = useState("")
  const [originalUrl, setOriginalUrl] = useState("")
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULTS })
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [tool, setTool] = useState<Tool>("adjust")
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png")
  const [jpegQuality, setJpegQuality] = useState(92)
  const [resizeW, setResizeW] = useState(0)
  const [resizeH, setResizeH] = useState(0)
  const [lockAspect, setLockAspect] = useState(true)
  const [naturalW, setNaturalW] = useState(0)
  const [naturalH, setNaturalH] = useState(0)
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [displayScale, setDisplayScale] = useState({ x: 1, y: 1 })

  const previewRef = useRef<HTMLImageElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const loadImage = useCallback((url: string) => {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setNaturalW(img.naturalWidth)
      setNaturalH(img.naturalHeight)
      setResizeW(img.naturalWidth)
      setResizeH(img.naturalHeight)
    }
    img.src = url
  }, [])

  const handleUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    setSourceUrl(url)
    setOriginalUrl(url)
    loadImage(url)
    setCropRect(null)
    setFilters({ ...DEFAULTS })
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
  }, [loadImage])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) handleUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    imgRef.current = img
    setNaturalW(img.naturalWidth)
    setNaturalH(img.naturalHeight)
    if (resizeW === 0 && resizeH === 0) {
      setResizeW(img.naturalWidth)
      setResizeH(img.naturalHeight)
    }
    const rect = img.getBoundingClientRect()
    setDisplayScale({ x: rect.width / img.naturalWidth, y: rect.height / img.naturalHeight })
  }

  const filterCSS = buildFilterCSS(filters)
  const transformCSS = buildTransformCSS(rotation, flipH, flipV)
  const showTransform = tool !== "crop"

  const toNaturalX = (clientX: number): number => {
    const img = previewRef.current
    if (!img) return 0
    const rect = img.getBoundingClientRect()
    return Math.round(Math.max(0, Math.min((clientX - rect.left) * naturalW / rect.width, naturalW)))
  }

  const toNaturalY = (clientY: number): number => {
    const img = previewRef.current
    if (!img) return 0
    const rect = img.getBoundingClientRect()
    return Math.round(Math.max(0, Math.min((clientY - rect.top) * naturalH / rect.height, naturalH)))
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tool !== "crop") return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    const img = previewRef.current
    if (img) {
      const rect = img.getBoundingClientRect()
      setDisplayScale({ x: rect.width / naturalW, y: rect.height / naturalH })
    }
    const x = toNaturalX(e.clientX)
    const y = toNaturalY(e.clientY)
    setDragStart({ x, y })
    setIsDragging(true)
    setCropRect(null)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart) return
    const x = toNaturalX(e.clientX)
    const y = toNaturalY(e.clientY)
    setCropRect({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      w: Math.abs(x - dragStart.x),
      h: Math.abs(y - dragStart.y),
    })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const applyCrop = useCallback(() => {
    if (!cropRect || !imgRef.current) return
    const { x, y, w, h } = cropRect
    if (w < 1 || h < 1) return
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(imgRef.current, x, y, w, h, 0, 0, w, h)
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      setSourceUrl(url)
      setCropRect(null)
      setRotation(0)
      setFlipH(false)
      setFlipV(false)
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        setNaturalW(img.naturalWidth)
        setNaturalH(img.naturalHeight)
        setResizeW(img.naturalWidth)
        setResizeH(img.naturalHeight)
      }
      img.src = url
    }, "image/png")
  }, [cropRect])

  const handleResizeWChange = (val: number) => {
    setResizeW(val)
    if (lockAspect && naturalW > 0 && val > 0) {
      const visualW = rotation === 90 || rotation === 270 ? naturalH : naturalW
      const visualH = rotation === 90 || rotation === 270 ? naturalW : naturalH
      setResizeH(Math.round(val * visualH / visualW))
    }
  }

  const handleResizeHChange = (val: number) => {
    setResizeH(val)
    if (lockAspect && naturalH > 0 && val > 0) {
      const visualW = rotation === 90 || rotation === 270 ? naturalH : naturalW
      const visualH = rotation === 90 || rotation === 270 ? naturalW : naturalH
      setResizeW(Math.round(val * visualW / visualH))
    }
  }

  const handleDownload = useCallback(() => {
    const img = imgRef.current
    if (!img) return

    const sx = cropRect ? cropRect.x : 0
    const sy = cropRect ? cropRect.y : 0
    const sw = cropRect ? cropRect.w : naturalW
    const sh = cropRect ? cropRect.h : naturalH

    const rad = (rotation * Math.PI) / 180
    const absSin = Math.abs(Math.sin(rad))
    const absCos = Math.abs(Math.cos(rad))
    const rotW = Math.round(sw * absCos + sh * absSin)
    const rotH = Math.round(sw * absSin + sh * absCos)

    const finalW = (resizeW > 0 && resizeH > 0) ? resizeW : rotW
    const finalH = (resizeW > 0 && resizeH > 0) ? resizeH : rotH

    const canvas = document.createElement("canvas")
    canvas.width = Math.round(finalW)
    canvas.height = Math.round(finalH)
    const ctx = canvas.getContext("2d")!

    if (outputFormat === "jpeg") {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    ctx.filter = buildFilterCSS(filters)
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(rad)
    if (flipH) ctx.scale(-1, 1)
    if (flipV) ctx.scale(1, -1)

    const scale = (resizeW > 0 && resizeH > 0)
      ? Math.min(finalW / rotW || 1, finalH / rotH || 1)
      : 1
    ctx.drawImage(img, sx, sy, sw, sh, -sw * scale / 2, -sh * scale / 2, sw * scale, sh * scale)
    ctx.restore()

    const mimeType = outputFormat === "jpeg" ? "image/jpeg" : `image/${outputFormat}`
    const quality = outputFormat === "png" ? undefined : jpegQuality / 100
    const dataUrl = canvas.toDataURL(mimeType, quality)
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `edited.${outputFormat === "jpeg" ? "jpg" : outputFormat}`
    a.click()
  }, [cropRect, naturalW, naturalH, rotation, flipH, flipV, filters, outputFormat, jpegQuality, resizeW, resizeH])

  const resetAll = () => {
    if (originalUrl) {
      setSourceUrl(originalUrl)
      loadImage(originalUrl)
    }
    setFilters({ ...DEFAULTS })
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setCropRect(null)
    setTool("adjust")
  }

  const resetFilters = () => setFilters({ ...DEFAULTS })

  const hasChanges = filters !== DEFAULTS || rotation !== 0 || flipH || flipV || cropRect

  if (!sourceUrl) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div
          className="flex max-w-md flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-12 transition-colors duration-150 cursor-pointer hover:border-primary/50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById("editor-file-input")?.click()}
        >
          <Upload className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">{t("tool.imageEditor.dropHint")}</p>
          <p className="text-sm text-muted-foreground">{t("tool.imageEditor.supportedFormats")}</p>
          <input id="editor-file-input" type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        </div>
      </div>
    )
  }

  const cropDisplayStyle = cropRect ? {
    left: cropRect.x * displayScale.x,
    top: cropRect.y * displayScale.y,
    width: cropRect.w * displayScale.x,
    height: cropRect.h * displayScale.y,
  } : null

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              {t("tool.imageEditor.upload")}
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
          </label>
          {hasChanges && (
            <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={resetAll}>
              <RotateCcw className="h-3.5 w-3.5" />
              {t("tool.imageEditor.resetAll")}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{naturalW} × {naturalH}</span>
          <Button size="sm" className="gap-1.5 cursor-pointer" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
            {t("tool.imageEditor.download")}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border px-4 py-1.5">
        {([
          { key: "adjust" as Tool, icon: Sun, label: t("tool.imageEditor.adjust") },
          { key: "transform" as Tool, icon: RotateCw, label: t("tool.imageEditor.transform") },
          { key: "crop" as Tool, icon: Crop, label: t("tool.imageEditor.crop") },
          { key: "resize" as Tool, icon: Maximize2, label: t("tool.imageEditor.resize") },
          { key: "format" as Tool, icon: Download, label: t("tool.imageEditor.format") },
        ]).map(({ key, icon: Icon, label }) => (
          <Button
            key={key}
            variant={tool === key ? "default" : "ghost"}
            size="sm"
            className="gap-1.5 cursor-pointer"
            onClick={() => setTool(key)}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>

      {tool === "adjust" && (
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">{t("tool.imageEditor.adjustments")}</span>
            <Button variant="ghost" size="sm" className="cursor-pointer text-xs" onClick={resetFilters}>{t("tool.imageEditor.resetFilters")}</Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {createSliders(t).map(({ key, label, min, max, step, unit }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={filters[key]}
                  onChange={(e) => setFilters({ ...filters, [key]: Number(e.target.value) })}
                  className="flex-1 h-1.5 accent-indigo-500 cursor-pointer"
                />
                <span className="text-xs tabular-nums w-12 text-right text-muted-foreground">
                  {key === "blur" ? filters[key].toFixed(1) : Math.round(filters[key])}{unit}
                </span>
                {filters[key] !== DEFAULTS[key] && (
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => setFilters({ ...filters, [key]: DEFAULTS[key] })}
                    title="Reset"
                  >
                    ↺
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tool === "transform" && (
        <div className="border-b border-border px-4 py-3">
          <span className="text-sm font-medium text-foreground mb-2 block">{t("tool.imageEditor.transform")}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={() => setRotation((r) => (r + 90) % 360)}>
              <RotateCw className="h-3.5 w-3.5" /> {t("tool.imageEditor.rotateCw")}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>
              <RotateCcw className="h-3.5 w-3.5" /> {t("tool.imageEditor.rotateCcw")}
            </Button>
            <Button
              variant={flipH ? "default" : "outline"}
              size="sm"
              className="gap-1.5 cursor-pointer"
              onClick={() => setFlipH((v) => !v)}
            >
              <FlipHorizontal className="h-3.5 w-3.5" /> {t("tool.imageEditor.flipH")}
            </Button>
            <Button
              variant={flipV ? "default" : "outline"}
              size="sm"
              className="gap-1.5 cursor-pointer"
              onClick={() => setFlipV((v) => !v)}
            >
              <FlipVertical className="h-3.5 w-3.5" /> {t("tool.imageEditor.flipV")}
            </Button>
          </div>
          {(rotation !== 0 || flipH || flipV) && (
            <p className="mt-2 text-xs text-muted-foreground">
              {rotation !== 0 && t("tool.imageEditor.rotation").replace("{degree}", String(rotation))}
              {rotation !== 0 && flipH && " · "}
              {flipH && "Flipped H"}
              {flipH && flipV && " · "}
              {flipV && "Flipped V"}
            </p>
          )}
        </div>
      )}

      {tool === "crop" && (
        <div className="border-b border-border px-4 py-3">
          <span className="text-sm font-medium text-foreground mb-2 block">{t("tool.imageEditor.cropTool")}</span>
          <p className="text-xs text-muted-foreground mb-2">
              {cropRect
                ? t("tool.imageEditor.selection").replace("{w}", String(cropRect.w)).replace("{h}", String(cropRect.h))
                : t("tool.imageEditor.cropHint")}
          </p>
          {cropRect && cropRect.w > 0 && cropRect.h > 0 && (
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1.5 cursor-pointer" onClick={applyCrop}>
                <Check className="h-3.5 w-3.5" /> {t("tool.imageEditor.applyCrop")}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={() => setCropRect(null)}>
                <X className="h-3.5 w-3.5" /> {t("tool.imageEditor.cancel")}
              </Button>
            </div>
          )}
        </div>
      )}

      {tool === "resize" && (
        <div className="border-b border-border px-4 py-3">
          <span className="text-sm font-medium text-foreground mb-2 block">{t("tool.imageEditor.resizeTool")}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">W</span>
              <input
                type="text"
                inputMode="numeric"
                value={resizeW}
                onChange={(e) => { const n = parseInt(e.target.value, 10); if (!isNaN(n) && n > 0) handleResizeWChange(n) }}
                className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm text-foreground"
              />
            </div>
            <span className="text-muted-foreground">×</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">H</span>
              <input
                type="text"
                inputMode="numeric"
                value={resizeH}
                onChange={(e) => { const n = parseInt(e.target.value, 10); if (!isNaN(n) && n > 0) handleResizeHChange(n) }}
                className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm text-foreground"
              />
            </div>
            <button
              className="p-1.5 rounded-md hover:bg-accent cursor-pointer"
              onClick={() => setLockAspect(!lockAspect)}
              title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
            >
              {lockAspect ? <Lock className="h-4 w-4 text-indigo-500" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}
            </button>
            <span className="text-xs text-muted-foreground">px</span>
          </div>
        </div>
      )}

      {tool === "format" && (
        <div className="border-b border-border px-4 py-3">
          <span className="text-sm font-medium text-foreground mb-2 block">{t("tool.imageEditor.outputFormat")}</span>
          <div className="flex items-center gap-2 mb-3">
            {(["png", "jpeg", "webp"] as OutputFormat[]).map((f) => (
              <Button
                key={f}
                variant={outputFormat === f ? "default" : "outline"}
                size="sm"
                className="cursor-pointer"
                onClick={() => setOutputFormat(f)}
              >
                {f.toUpperCase()}
              </Button>
            ))}
          </div>
          {(outputFormat === "jpeg" || outputFormat === "webp") && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-14">{t("tool.imageEditor.quality")}</span>
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={jpegQuality}
                onChange={(e) => setJpegQuality(Number(e.target.value))}
                className="flex-1 h-1.5 accent-indigo-500 cursor-pointer"
              />
              <span className="text-xs tabular-nums w-10 text-right text-muted-foreground">{jpegQuality}%</span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-auto p-4">
        <div
          className="flex items-center justify-center min-h-full"
          style={{ cursor: tool === "crop" ? "crosshair" : "default" }}
        >
          <div
            className="relative inline-block"
            onPointerDown={tool === "crop" ? handlePointerDown : undefined}
            onPointerMove={tool === "crop" ? handlePointerMove : undefined}
            onPointerUp={tool === "crop" ? handlePointerUp : undefined}
          >
            <img
              ref={previewRef}
              src={sourceUrl}
              alt="Preview"
              className="max-h-[50vh] rounded border border-border"
              style={{
                filter: filterCSS,
                transform: showTransform ? transformCSS : "none",
              }}
              onLoad={handleImageLoad}
              draggable={false}
            />
            {tool === "crop" && cropDisplayStyle && (
              <div
                className="absolute border-2 border-dashed border-white pointer-events-none"
                style={{
                  left: cropDisplayStyle.left,
                  top: cropDisplayStyle.top,
                  width: cropDisplayStyle.width,
                  height: cropDisplayStyle.height,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}