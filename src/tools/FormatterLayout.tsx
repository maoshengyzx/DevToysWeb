import { useState, useCallback } from "react"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2 } from "lucide-react"

interface FormatterProps {
  format: (input: string, indent?: number) => string
  minify?: (input: string) => string
  inputPlaceholder?: string
  indentOptions?: { label: string; value: number }[]
}

export function Formatter({
  format,
  minify,
  inputPlaceholder = "Paste your code here...",
  indentOptions,
}: FormatterProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [indent, setIndent] = useState(indentOptions?.[0]?.value ?? 2)

  const handleInputChange = (value: string) => {
    setInput(value)
    if (!value.trim()) {
      setOutput("")
      setError("")
      return
    }
    try {
      setOutput(format(value, indent))
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input")
      setOutput("")
    }
  }

  const handleFormat = () => {
    if (!input.trim()) return
    try {
      setOutput(format(input, indent))
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Format failed")
    }
  }

  const handleMinify = () => {
    if (!input.trim() || !minify) return
    try {
      setOutput(minify(input))
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Minify failed")
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
    setError("")
  }

  return (
    <div className="flex h-full flex-col">
      {indentOptions && (
        <div className="flex items-center gap-2 border-b border-border px-6 py-3">
          <span className="text-sm text-muted-foreground">Indent:</span>
          <div className="flex gap-1">
            {indentOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={indent === opt.value ? "default" : "outline"}
                size="sm"
                className="cursor-pointer"
                onClick={() => {
                  setIndent(opt.value)
                  if (input.trim()) {
                    try {
                      setOutput(format(input, opt.value))
                      setError("")
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Format failed")
                    }
                  }
                }}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          {error && <span className="ml-auto text-xs text-destructive">{error}</span>}
        </div>
      )}
      {!indentOptions && error && (
        <div className="border-b border-border px-6 py-2">
          <span className="text-xs text-destructive">{error}</span>
        </div>
      )}
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
            <ReadOnlyTextarea value={output} placeholder="Formatted result will appear here..." />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="cursor-pointer" onClick={handleFormat}>Format</Button>
          {minify && (
            <Button variant="outline" className="cursor-pointer" onClick={handleMinify}>Minify</Button>
          )}
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