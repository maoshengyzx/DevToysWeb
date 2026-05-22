import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Download, Upload } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import QRCode from "qrcode"
import jsQR from "jsqr"

type Tab = "generate" | "decode"

export function QrCodeTool() {
  const [tab, setTab] = useState<Tab>("generate")
  const [text, setText] = useState("https://devtoysweb.app")
  const [size, setSize] = useState(256)
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [decodedText, setDecodedText] = useState("")
  const [decodeError, setDecodeError] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()
  const decodeCanvasRef = useRef<HTMLCanvasElement>(null)

  const generateQr = useCallback(() => {
    if (!text.trim()) { setQrDataUrl(""); return }
    QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: "M",
    }).then((url) => setQrDataUrl(url)).catch(() => setQrDataUrl(""))
  }, [text, size, fgColor, bgColor])

  const handleDownload = () => {
    if (!qrDataUrl) return
    const a = document.createElement("a")
    a.href = qrDataUrl
    a.download = "qrcode.png"
    a.click()
  }

  const handleDecodeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setDecodedText("")
    setDecodeError("")

    const img = new Image()
    img.onload = () => {
      const canvas = decodeCanvasRef.current
      if (!canvas) return
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code) {
        setDecodedText(code.data)
      } else {
        setDecodeError("No QR code found in the image")
      }
    }
    img.src = URL.createObjectURL(file)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3">
        <Button variant={tab === "generate" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => setTab("generate")}>Generate</Button>
        <Button variant={tab === "decode" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => setTab("decode")}>Decode</Button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {tab === "generate" ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Content</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text or URL..."
                  className="min-h-[100px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">Size</label>
                  <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground cursor-pointer">
                    {[128, 192, 256, 320, 384, 512].map((s) => <option key={s} value={s}>{s}px</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">Foreground</label>
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-9 w-full cursor-pointer rounded-md border border-input" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">Background</label>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-full cursor-pointer rounded-md border border-input" />
                </div>
              </div>
              <Button className="cursor-pointer" onClick={generateQr}>Generate QR Code</Button>
            </div>

            <div className="flex flex-col items-center gap-4">
              {qrDataUrl ? (
                <>
                  <img src={qrDataUrl} alt="QR Code" className="border border-border rounded-md max-h-[300px]" />
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={handleDownload}>
                      <Download className="h-3.5 w-3.5" />
                      Download PNG
                    </Button>
                    <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(qrDataUrl)}>
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy Data URL"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[300px] w-full rounded-md border border-dashed border-border text-sm text-muted-foreground">
                  Click Generate to create QR code
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Upload QR Code Image</label>
              <label className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-4 py-8 cursor-pointer hover:border-primary transition-colors duration-150">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleDecodeImage} />
              </label>
            </div>
            <div className="flex flex-col gap-2">
              {decodeError && <p className="text-sm text-destructive">{decodeError}</p>}
              {decodedText ? (
                <>
                  <label className="text-sm font-medium text-foreground">Decoded Content</label>
                  <textarea
                    value={decodedText}
                    readOnly
                    className="min-h-[100px] w-full resize-y rounded-md border border-input bg-muted px-3 py-2 font-mono text-sm text-foreground"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(decodedText)}>
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    {decodedText.startsWith("http") && (
                      <Button variant="outline" className="cursor-pointer" onClick={() => window.open(decodedText, "_blank")}>
                        Open URL
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[200px] rounded-md border border-dashed border-border text-sm text-muted-foreground">
                  Decoded content will appear here
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <canvas ref={decodeCanvasRef} className="hidden" />
    </div>
  )
}