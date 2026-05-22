import { useState, useCallback } from "react"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, ArrowDownUp, Upload, Code2 } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"

type Tab = "text" | "image"

export function Base64Encoder() {
  const [tab, setTab] = useState<Tab>("text")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [error, setError] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()

  const encodeText = (s: string): string => {
    const bytes = new TextEncoder().encode(s)
    let binary = ""
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
    }
    return btoa(binary)
  }

  const decodeText = (s: string): string => {
    const bytes = Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    setError("")
    if (!value.trim()) { setOutput(""); return }
    try {
      setOutput(mode === "encode" ? encodeText(value) : decodeText(value))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed")
      setOutput("")
    }
  }

  const handleModeSwitch = () => {
    const newMode = mode === "encode" ? "decode" : "encode"
    setMode(newMode)
    setInput(output)
    setError("")
    if (!output.trim()) { setOutput(""); return }
    try {
      setOutput(newMode === "encode" ? encodeText(output) : decodeText(output))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed")
      setOutput("")
    }
  }

  const handleModeButton = (newMode: "encode" | "decode") => {
    setMode(newMode)
    setError("")
    if (!input.trim()) { setOutput(""); return }
    try {
      setOutput(newMode === "encode" ? encodeText(input) : decodeText(input))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed")
      setOutput("")
    }
  }

  const processImage = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setOutput(result)
    }
    reader.onerror = () => setError("Failed to read file")
    reader.readAsDataURL(file)
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    processImage(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      setError("")
      processImage(file)
    } else {
      setError("Please drop an image file (PNG, JPG, GIF, SVG, WebP)")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  const imgTag = output.startsWith("data:") ? `<img src="${output}" alt="image" />` : ""

  if (tab === "image") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-border px-6 py-3">
          <span className="text-sm text-muted-foreground">Mode:</span>
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => { setTab("text"); setOutput(""); setError(""); setInput(""); }}>Text</Button>
          <Button variant="default" size="sm" className="cursor-pointer">Image</Button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div
              className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors duration-150 cursor-pointer ${output ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50"}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("base64-image-input")?.click()}
            >
              {output ? (
                <img src={output} alt="Preview" className="max-h-48 rounded-md object-contain" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drop an image here or click to upload</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF, SVG, WebP</p>
                </>
              )}
              <input id="base64-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {output && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Base64 Data URL</label>
                  <ReadOnlyTextarea value={output} className="min-h-[100px]" />
                </div>
                {imgTag && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">HTML img Tag</label>
                    <ReadOnlyTextarea value={imgTag} className="min-h-[60px]" />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(output)}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy Base64
                  </Button>
                  {imgTag && (
                    <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(imgTag)}>
                      <Code2 className="h-3.5 w-3.5" />
                      Copy as img Tag
                    </Button>
                  )}
                  <Button variant="ghost" className="gap-1.5 cursor-pointer" onClick={handleClear}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </Button>
                </div>
              </>
            )}
            {error && <ErrorBanner message={error} />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant={mode === "encode" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => handleModeButton("encode")}>Encode</Button>
          <Button variant={mode === "decode" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => handleModeButton("decode")}>Decode</Button>
          <div className="w-px h-4 bg-border" />
          <Button variant="default" size="sm" className="cursor-pointer">Text</Button>
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => { setTab("image"); setError(""); setInput(""); setOutput(""); }}>Image</Button>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={handleModeSwitch}>
          <ArrowDownUp className="h-3.5 w-3.5" />
          Swap
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Input</label>
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste text or Base64 to encode/decode..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            <ReadOnlyTextarea value={output} placeholder="Result will appear here..." />
          </div>
        </div>
        {error && <div className="mt-3"><ErrorBanner message={error} /></div>}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(output)}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Output"}
          </Button>
          <Button variant="ghost" className="gap-1.5 cursor-pointer" onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}