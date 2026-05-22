import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { colord, extend } from "colord"
import namesPlugin from "colord/plugins/names"

extend([namesPlugin])

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
    const c = colord(value)
    if (c.isValid()) {
      const rgbObj = c.toRgb()
      setRgb(`${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}`)
      const hslObj = c.toHsl()
      setHsl(`${Math.round(hslObj.h)}, ${Math.round(hslObj.s)}%, ${Math.round(hslObj.l)}%`)
      setPreviewColor(c.toHex())
    }
  }

  const handleRgbChange = (value: string) => {
    setRgb(value)
    const match = value.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    if (match) {
      const [, r, g, b] = match
      const ri = parseInt(r), gi = parseInt(g), bi = parseInt(b)
      if (ri <= 255 && gi <= 255 && bi <= 255) {
        const c = colord({ r: ri, g: gi, b: bi })
        const hslObj = c.toHsl()
        setHex(c.toHex())
        setHsl(`${Math.round(hslObj.h)}, ${Math.round(hslObj.s)}%, ${Math.round(hslObj.l)}%`)
        setPreviewColor(c.toHex())
      }
    }
  }

  const handleHslChange = (value: string) => {
    setHsl(value)
    const match = value.match(/(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/)
    if (match) {
      const [, h, s, l] = match
      const c = colord({ h: parseInt(h), s: parseInt(s), l: parseInt(l) })
      if (c.isValid()) {
        const rgbObj = c.toRgb()
        setHex(c.toHex())
        setRgb(`${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}`)
        setPreviewColor(c.toHex())
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <div
                  className="h-32 rounded-lg border border-border"
                  style={{ backgroundColor: previewColor }}
                />
                <input
                  type="color"
                  value={colord(previewColor).isValid() ? colord(previewColor).toHex() : "#000000"}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-md border border-input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
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
    </div>
  )
}