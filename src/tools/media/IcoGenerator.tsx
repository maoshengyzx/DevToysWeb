import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"
import { ErrorBanner } from "@/components/ui/error-banner"

function svgToIco(svgDataUrl: string, sizes: number[]): Promise<Blob> {
  const promises = sizes.map((size) => {
    return new Promise<{ data: Uint8Array; size: number }>((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, size, size)
        const dataUrl = canvas.toDataURL("image/png")
        const binaryStr = atob(dataUrl.split(",")[1])
        const data = new Uint8Array(binaryStr.length)
        for (let i = 0; i < binaryStr.length; i++) data[i] = binaryStr.charCodeAt(i)
        resolve({ data, size })
      }
      img.src = svgDataUrl
    })
  })

  return Promise.all(promises).then((icons) => {
    const headerSize = 6
    const dirEntrySize = 16
    const dirSize = dirEntrySize * icons.length
    let offset = headerSize + dirSize

    const totalSize = headerSize + dirSize + icons.reduce((s, ic) => s + ic.data.length, 0)
    const buffer = new ArrayBuffer(totalSize)
    const view = new DataView(buffer)

    view.setUint16(0, 0, true)
    view.setUint16(2, icons.length, true)

    icons.forEach((icon, i) => {
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
  })
}

export function IcoGenerator() {
  const [sourceUrl, setSourceUrl] = useState("")
  const [sourceName, setSourceName] = useState("")
  const [icoUrl, setIcoUrl] = useState("")
  const [error, setError] = useState("")
  const [generating, setGenerating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setIcoUrl("")
    setSourceName(file.name)

    const url = URL.createObjectURL(file)
    setSourceUrl(url)
  }

  const handleGenerate = async () => {
    if (!sourceUrl) return
    setGenerating(true)
    setError("")

    try {
      if (sourceUrl.endsWith(".svg")) {
        const blob = await svgToIco(sourceUrl, [16, 32, 48])
        const url = URL.createObjectURL(blob)
        setIcoUrl(url)
      } else {
        const img = new Image()
        img.crossOrigin = "anonymous"
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error("Failed to load image"))
          img.src = sourceUrl
        })

        const sizes = [16, 32, 48]
        const canvas = document.createElement("canvas")
        const blobs: { data: Uint8Array; size: number }[] = []

        for (const size of sizes) {
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext("2d")!
          ctx.clearRect(0, 0, size, size)
          ctx.drawImage(img, 0, 0, size, size)
          const dataUrl = canvas.toDataURL("image/png")
          const binaryStr = atob(dataUrl.split(",")[1])
          const data = new Uint8Array(binaryStr.length)
          for (let i = 0; i < binaryStr.length; i++) data[i] = binaryStr.charCodeAt(i)
          blobs.push({ data, size })
        }

        const headerSize = 6
        const dirEntrySize = 16
        const dirSize = dirEntrySize * blobs.length
        let offset = headerSize + dirSize
        const totalSize = headerSize + dirSize + blobs.reduce((s, ic) => s + ic.data.length, 0)
        const buffer = new ArrayBuffer(totalSize)
        const view = new DataView(buffer)

        view.setUint16(0, 0, true)
        view.setUint16(2, blobs.length, true)

        blobs.forEach((icon, i) => {
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

        const blob = new Blob([buffer], { type: "image/x-icon" })
        const url = URL.createObjectURL(blob)
        setIcoUrl(url)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate ICO")
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!icoUrl) return
    const a = document.createElement("a")
    a.href = icoUrl
    a.download = (sourceName.replace(/\.[^.]+$/, "") || "favicon") + ".ico"
    a.click()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-lg">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Upload Image</label>
            <label className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-4 py-8 cursor-pointer hover:border-primary transition-colors duration-150">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload PNG, JPG, SVG, or WebP</span>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>

          {sourceUrl && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Source Image</label>
              <img src={sourceUrl} alt="Source" className="h-32 rounded-md border border-border object-contain" />
              <p className="text-xs text-muted-foreground">{sourceName}</p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Generates a favicon.ico with 16×16, 32×32, and 48×48 sizes.
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="flex gap-2">
            <Button className="cursor-pointer" onClick={handleGenerate} disabled={generating || !sourceUrl}>
              {generating ? "Generating..." : "Generate ICO"}
            </Button>
            {icoUrl && (
              <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5" />
                Download ICO
              </Button>
            )}
          </div>

          {icoUrl && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Preview (32×32)</label>
              <img src={icoUrl} alt="ICO Preview" className="h-16 w-16 rounded-md border border-border" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}