import { useState } from "react"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, ArrowDownUp } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { ErrorBanner } from "@/components/ui/error-banner"

interface EncoderDecoderProps {
  encode: (input: string) => string
  decode: (input: string) => string
  encodeLabel: string
  decodeLabel: string
  inputPlaceholder?: string
}

export function EncoderDecoder({
  encode,
  decode,
  encodeLabel,
  decodeLabel,
  inputPlaceholder = "Paste or type your input here...",
}: EncoderDecoderProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [error, setError] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()

  const convert = (value: string, fn: (input: string) => string) => {
    try {
      const result = fn(value)
      setOutput(result)
      setError("")
    } catch (e) {
      setOutput("")
      setError(e instanceof Error ? e.message : "Conversion failed")
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    if (!value.trim()) {
      setOutput("")
      setError("")
      return
    }
    convert(value, mode === "encode" ? encode : decode)
  }

  const handleModeSwitch = () => {
    const newMode = mode === "encode" ? "decode" : "encode"
    setMode(newMode)
    setInput(output)
    if (!output.trim()) {
      setOutput("")
      setError("")
      return
    }
    convert(output, newMode === "encode" ? encode : decode)
  }

  const handleModeButton = (newMode: "encode" | "decode") => {
    setMode(newMode)
    if (!input.trim()) {
      setOutput("")
      setError("")
      return
    }
    convert(input, newMode === "encode" ? encode : decode)
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant={mode === "encode" ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => handleModeButton("encode")}
          >
            {encodeLabel}
          </Button>
          <Button
            variant={mode === "decode" ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => handleModeButton("decode")}
          >
            {decodeLabel}
          </Button>
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
              placeholder={inputPlaceholder}
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
