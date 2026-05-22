import { useState, useCallback } from "react"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, ArrowDownUp, Upload, Code2, Download, FileText } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"

type Tab = "text" | "image" | "file"

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  }
  return btoa(binary)
}

function base64ToBytes(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function Base64Encoder() {
  const [tab, setTab] = useState<Tab>("text")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [error, setError] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()

  const encodeText = (s: string): string => bytesToBase64(new TextEncoder().encode(s))
  const decodeText = (s: string): string => new TextDecoder().decode(base64ToBytes(s))

  const handleInputChange = (value: string) => {
    setInput(value)
    setError("")
    if (!value.trim()) { setOutput(""); return }
    try {
      setOutput(mode === "encode" ? encodeText(value) : decodeText(value))
    } catch {
      setError("Conversion failed. Check your input.")
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
    } catch {
      setError("Conversion failed. Check your input.")
      setOutput("")
    }
  }

  const handleModeButton = (newMode: "encode" | "decode") => {
    setMode(newMode)
    setError("")
    if (!input.trim()) { setOutput(""); return }
    try {
      setOutput(newMode === "encode" ? encodeText(input) : decodeText(input))
    } catch {
      setError("Conversion failed. Check your input.")
      setOutput("")
    }
  }

  const processImage = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => { setOutput(reader.result as string) }
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

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }

  const handleClear = () => { setInput(""); setOutput(""); setError("") }

  const imgTag = output.startsWith("data:") ? `<img src="${output}" alt="image" />` : ""

  const tabBar = (
    <div className="flex items-center gap-2 border-b border-border px-6 py-3">
      <Button variant={tab === "text" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setTab("text"); setError(""); setInput(""); setOutput("") }}>Text</Button>
      <Button variant={tab === "image" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setTab("image"); setError(""); setInput(""); setOutput("") }}>Image</Button>
      <Button variant={tab === "file" ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => { setTab("file"); setError(""); setInput(""); setOutput("") }}>File</Button>
    </div>
  )

  if (tab === "image") {
    return (
      <div className="flex h-full flex-col">
        {tabBar}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            <div
              className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors cursor-pointer ${output ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50"}`}
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
                      Copy img Tag
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

  if (tab === "file") {
    return (
      <div className="flex h-full flex-col">
        {tabBar}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            <FileEncode onError={setError} />
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
          <Button variant={mode === "encode" && tab === "text" ? "default" : "outline"} size="sm" className="cursor-pointer">Text</Button>
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => { setTab("image"); setError(""); setInput(""); setOutput("") }}>Image</Button>
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => { setTab("file"); setError(""); setInput(""); setOutput("") }}>File</Button>
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

function FileEncode({ onError }: { onError: (err: string) => void }) {
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [file, setFile] = useState<File | null>(null)
  const [base64, setBase64] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()
  const [decodeInput, setDecodeInput] = useState("")
  const [decodeFileName, setDecodeFileName] = useState("download.bin")
  const [decodeMime, setDecodeMime] = useState("application/octet-stream")

  const processFile = useCallback((f: File) => {
    setFile(f)
    onError("")
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = bytesToBase64(new Uint8Array(reader.result as ArrayBuffer))
      setBase64(base64)
      setDecodeFileName(f.name)
      setDecodeMime(f.type || "application/octet-stream")
    }
    reader.onerror = () => onError("Failed to read file")
    reader.readAsArrayBuffer(f)
  }, [onError])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }

  const handleDownload = () => {
    if (!base64) return
    try {
      const bytes = base64ToBytes(base64)
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: decodeMime })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = decodeFileName
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      onError("Invalid Base64 string")
    }
  }

  const decodeAndDownload = () => {
    const clean = decodeInput.replace(/^data:.*?base64,/, "").trim()
    if (!clean) { onError("Paste a Base64 string first"); return }
    try {
      const bytes = base64ToBytes(clean)
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: decodeMime })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = decodeFileName
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      onError("Invalid Base64 string. Check that it is valid Base64 encoding.")
    }
  }

  if (mode === "decode") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="cursor-pointer">Decode</Button>
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setMode("encode")}>Encode</Button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Base64 String</label>
          <Textarea
            value={decodeInput}
            onChange={(e) => setDecodeInput(e.target.value)}
            placeholder="Paste Base64 string here (with or without data: URI prefix)..."
            className="min-h-[120px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">File Name</label>
            <input
              type="text"
              value={decodeFileName}
              onChange={(e) => setDecodeFileName(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">MIME Type</label>
            <input
              type="text"
              value={decodeMime}
              onChange={(e) => setDecodeMime(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        <Button className="gap-1.5 cursor-pointer" onClick={decodeAndDownload}>
          <Download className="h-3.5 w-3.5" />
          Download File
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setMode("decode")}>Decode</Button>
        <Button variant="default" size="sm" className="cursor-pointer">Encode</Button>
      </div>
      <div
        className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors cursor-pointer ${file ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50"}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("base64-file-input")?.click()}
      >
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)} — {file.type || "unknown type"}</p>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drop any file here or click to upload</p>
            <p className="text-xs text-muted-foreground">PDF, ZIP, images, documents, binaries…</p>
          </>
        )}
        <input id="base64-file-input" type="file" className="hidden" onChange={handleUpload} />
      </div>
      {base64 && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Base64 Output ({formatSize(new Blob([base64]).size)})</label>
            <ReadOnlyTextarea value={base64} className="min-h-[100px]" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(base64)}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Base64"}
            </Button>
            <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              Download Original
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
