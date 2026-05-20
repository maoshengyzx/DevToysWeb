import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, RefreshCw } from "lucide-react"

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const NUMBERS = "0123456789"
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"

export function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)

  const generate = () => {
    let charset = ""
    const required: string[] = []
    if (useLowercase) { charset += LOWERCASE; required.push(LOWERCASE) }
    if (useUppercase) { charset += UPPERCASE; required.push(UPPERCASE) }
    if (useNumbers) { charset += NUMBERS; required.push(NUMBERS) }
    if (useSymbols) { charset += SYMBOLS; required.push(SYMBOLS) }
    if (!charset) { setPassword(""); return }

    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    let result = ""

    for (let i = 0; i < required.length && i < length; i++) {
      result += required[i][array[i] % required[i].length]
    }
    for (let i = required.length; i < length; i++) {
      result += charset[array[i] % charset.length]
    }

    const arr = result.split("")
    for (let i = arr.length - 1; i > 0; i--) {
      const j = array[i] % (i + 1)
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setPassword(arr.join(""))
    setCopied(false)
  }

  const handleCopy = useCallback(async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [password])

  const strength = (() => {
    if (!password) return { label: "", color: "" }
    let bits = 0
    if (useLowercase) bits += 26
    if (useUppercase) bits += 26
    if (useNumbers) bits += 10
    if (useSymbols) bits += 24
    const entropy = length * Math.log2(bits || 1)
    if (entropy < 40) return { label: "Weak", color: "text-red-500" }
    if (entropy < 60) return { label: "Fair", color: "text-yellow-500" }
    if (entropy < 80) return { label: "Good", color: "text-green-500" }
    return { label: "Strong", color: "text-green-600" }
  })()

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4 max-w-md">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Length: {length}
            </label>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full cursor-pointer accent-primary"
            />
          </div>
          <div className="space-y-2">
            {[
              { label: "Lowercase (a-z)", value: useLowercase, setter: setUseLowercase },
              { label: "Uppercase (A-Z)", value: useUppercase, setter: setUseUppercase },
              { label: "Numbers (0-9)", value: useNumbers, setter: setUseNumbers },
              { label: "Symbols (!@#$...)", value: useSymbols, setter: setUseSymbols },
            ].map((opt) => (
              <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opt.value}
                  onChange={(e) => opt.setter(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                />
                <span className="text-sm text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
          {password && (
            <div className="rounded-md border border-border bg-muted px-4 py-3 font-mono text-sm break-all">
              {password}
              {strength.label && (
                <span className={`ml-2 text-xs ${strength.color}`}>{strength.label}</span>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button className="gap-1.5 cursor-pointer" onClick={generate}>
              <RefreshCw className="h-3.5 w-3.5" />
              Generate
            </Button>
            <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={handleCopy} disabled={!password}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}