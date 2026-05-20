import { useState, useCallback } from "react"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, ArrowDownUp } from "lucide-react"

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
  const [copied, setCopied] = useState(false)

  const handleInputChange = (value: string) => {
    setInput(value)
    try {
      setOutput(mode === "encode" ? encode(value) : decode(value))
    } catch {
      setOutput("")
    }
  }

  const handleModeSwitch = () => {
    const newMode = mode === "encode" ? "decode" : "encode"
    setMode(newMode)
    setInput(output)
    try {
      setOutput(newMode === "encode" ? encode(output) : decode(output))
    } catch {
      setOutput("")
    }
  }

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const handleClear = () => {
    setInput("")
    setOutput("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant={mode === "encode" ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => {
              setMode("encode")
              try {
                setOutput(encode(input))
              } catch {
                setOutput("")
              }
            }}
          >
            {encodeLabel}
          </Button>
          <Button
            variant={mode === "decode" ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => {
              setMode("decode")
              try {
                setOutput(decode(input))
              } catch {
                setOutput("")
              }
            }}
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
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={handleCopy}>
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