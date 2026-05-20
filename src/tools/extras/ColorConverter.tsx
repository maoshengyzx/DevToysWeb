import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
    case g: h = ((b - r) / d + 2) / 6; break
    case b: h = ((r - g) / d + 4) / 6; break
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function ColorConverter() {
  const [hex, setHex] = useState("#6366f1")
  const [rgb, setRgb] = useState("99, 102, 241")
  const [hsl, setHsl] = useState("239, 84%, 67%")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [, handleCopyBase] = useCopyToClipboard()

  const [previewColor, setPreviewColor] = useState("#6366f1")

  const handleCopy = async (value: string, label: string) => {
    await handleCopyBase(value)
    setCopiedKey(label)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleHexChange = (value: string) => {
    setHex(value)
    const result = hexToRgb(value)
    if (result) {
      setRgb(`${result.r}, ${result.g}, ${result.b}`)
      const hslVal = rgbToHsl(result.r, result.g, result.b)
      setHsl(`${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%`)
      setPreviewColor(value.startsWith("#") ? value : `#${value}`)
    }
  }

  const handleRgbChange = (value: string) => {
    setRgb(value)
    const match = value.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    if (match) {
      const [, r, g, b] = match
      const ri = parseInt(r), gi = parseInt(g), bi = parseInt(b)
      if (ri <= 255 && gi <= 255 && bi <= 255) {
        const h = rgbToHsl(ri, gi, bi)
        setHex(rgbToHex(ri, gi, bi))
        setHsl(`${h.h}, ${h.s}%, ${h.l}%`)
        setPreviewColor(rgbToHex(ri, gi, bi))
      }
    }
  }

  const handleHslChange = (value: string) => {
    setHsl(value)
    const match = value.match(/(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/)
    if (match) {
      const [, hStr, sStr, lStr] = match
      const h = parseInt(hStr) / 360
      const s = parseInt(sStr) / 100
      const l = parseInt(lStr) / 100
      let r, g, b
      if (s === 0) {
        r = g = b = l
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1/6) return p + (q - p) * 6 * t
          if (t < 1/2) return q
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
          return p
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
      }
      const ri = Math.round(r * 255), gi = Math.round(g * 255), bi = Math.round(b * 255)
      setHex(rgbToHex(ri, gi, bi))
      setRgb(`${ri}, ${gi}, ${bi}`)
      setPreviewColor(rgbToHex(ri, gi, bi))
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-md">
          <div className="flex flex-col gap-4">
            <div
              className="h-24 rounded-lg border border-border"
              style={{ backgroundColor: previewColor }}
            />
            <input
              type="color"
              value={previewColor}
              onChange={(e) => handleHexChange(e.target.value)}
              className="h-9 w-full cursor-pointer rounded-md border border-input"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">HEX</label>
              <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(hex, "hex")}>
                {copiedKey === "hex" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <Input value={hex} onChange={(e) => handleHexChange(e.target.value)} placeholder="#6366f1" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">RGB</label>
              <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(`rgb(${rgb})`, "rgb")}>
                {copiedKey === "rgb" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <Input value={rgb} onChange={(e) => handleRgbChange(e.target.value)} placeholder="99, 102, 241" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">HSL</label>
              <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(`hsl(${hsl})`, "hsl")}>
                {copiedKey === "hsl" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <Input value={hsl} onChange={(e) => handleHslChange(e.target.value)} placeholder="239, 84%, 67%" />
          </div>
        </div>
      </div>
    </div>
  )
}