import { useState } from "react"
import { Textarea, Select } from "@/components/ui/shared"

const bases = [
  { value: 2, label: "Binary (2)" },
  { value: 8, label: "Octal (8)" },
  { value: 10, label: "Decimal (10)" },
  { value: 16, label: "Hexadecimal (16)" },
]

export function NumberBaseConverter() {
  const [input, setInput] = useState("")
  const [fromBase, setFromBase] = useState(10)
  const [toBase, setToBase] = useState(16)
  const [error, setError] = useState("")

  let output = ""
  if (input.trim()) {
    try {
      const num = parseInt(input.trim(), fromBase)
      if (isNaN(num)) throw new Error("Invalid number for the selected base")
      output = num.toString(toBase).toUpperCase()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion error")
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    setError("")
    if (!value.trim()) return
    try {
      const num = parseInt(value.trim(), fromBase)
      if (isNaN(num)) throw new Error("Invalid number for the selected base")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <span className="text-sm text-muted-foreground">From:</span>
        <Select value={String(fromBase)} onChange={(e) => setFromBase(Number(e.target.value))}>
          {bases.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </Select>
        <span className="text-sm text-muted-foreground">To:</span>
        <Select value={String(toBase)} onChange={(e) => setToBase(Number(e.target.value))}>
          {bases.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </Select>
        {error && <span className="ml-auto text-xs text-destructive">{error}</span>}
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Input</label>
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter a number..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            <Textarea
              value={error ? "" : output}
              readOnly
              className="bg-muted"
              placeholder="Converted number will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}