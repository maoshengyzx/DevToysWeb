import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, RefreshCw } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const NUMBERS = "0123456789"
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"

function secureRandomIndex(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max
  const arr = new Uint32Array(1)
  let v: number
  do {
    crypto.getRandomValues(arr)
    v = arr[0]
  } while (v >= limit)
  return v % max
}

function generatePassword(length: number, useLower: boolean, useUpper: boolean, useNum: boolean, useSym: boolean): string {
  let charset = ""
  const required: string[] = []
  if (useLower) { charset += LOWERCASE; required.push(LOWERCASE) }
  if (useUpper) { charset += UPPERCASE; required.push(UPPERCASE) }
  if (useNum) { charset += NUMBERS; required.push(NUMBERS) }
  if (useSym) { charset += SYMBOLS; required.push(SYMBOLS) }
  if (!charset) return ""

  const chars: string[] = []

  for (let i = 0; i < required.length && i < length; i++) {
    chars.push(required[i][secureRandomIndex(required[i].length)])
  }
  for (let i = required.length; i < length; i++) {
    chars.push(charset[secureRandomIndex(charset.length)])
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join("")
}

export function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [password, setPassword] = useState(() => generatePassword(16, true, true, true, true))
  const [copied, handleCopy] = useCopyToClipboard()

  const generate = () => {
    setPassword(generatePassword(length, useLowercase, useUppercase, useNumbers, useSymbols))
  }

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
        <div className="max-w-3xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
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
              <div className="flex gap-2">
                <Button className="gap-1.5 cursor-pointer" onClick={generate}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Generate
                </Button>
                <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(password)} disabled={!password}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {password ? (
                <div className="rounded-md border border-border bg-muted px-4 py-3 font-mono text-sm break-all min-h-[80px]">
                  {password}
                  {strength.label && (
                    <span className={`ml-2 text-xs ${strength.color}`}>{strength.label}</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-[80px] rounded-md border border-dashed border-border text-sm text-muted-foreground">
                  Click Generate to create a password
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}