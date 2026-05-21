import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea, ReadOnlyTextarea } from "@/components/ui/shared"
import { MORSE_MAP, REVERSE_MORSE } from "../extras/utils"

export function MorseCodeTranslator() {
  const [text, setText] = useState("")
  const [morse, setMorse] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")

  const encode = (input: string): string => {
    return input
      .toUpperCase()
      .split("")
      .map((ch) => {
        if (ch === " ") return "/"
        return MORSE_MAP[ch] || ""
      })
      .filter(Boolean)
      .join(" ")
  }

  const decode = (input: string): string => {
    return input
      .split(/\s*\/\s*/)
      .map((word) =>
        word
          .trim()
          .split(/\s+/)
          .map((code) => REVERSE_MORSE[code] || code)
          .join("")
      )
      .join(" ")
  }

  const handleTextChange = (val: string) => {
    setText(val)
    if (mode === "encode") {
      setMorse(encode(val))
    }
  }

  const handleMorseChange = (val: string) => {
    setMorse(val)
    if (mode === "decode") {
      setText(decode(val))
    }
  }

  const swap = () => {
    setMode(mode === "encode" ? "decode" : "encode")
    setText(morse)
    setMorse(text)
  }

  const labelText = mode === "encode" ? "文本" : "摩斯电码"
  const resultLabel = mode === "encode" ? "摩斯电码" : "文本"

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{labelText}</span>
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={swap}>
              ⇄ 交换
            </Button>
          </div>

          {mode === "encode" ? (
            <Textarea value={text} onChange={(e) => handleTextChange(e.target.value)} placeholder="输入文本，如 HELLO WORLD" />
          ) : (
            <Textarea value={morse} onChange={(e) => handleMorseChange(e.target.value)} placeholder="输入摩斯电码，如 .... . .-.. .-.. --- / .-- --- .-. .-.. -.." />
          )}

          <span className="text-sm font-medium text-foreground">{resultLabel}</span>

          {mode === "encode" ? (
            <ReadOnlyTextarea value={morse} className="min-h-[120px]" />
          ) : (
            <ReadOnlyTextarea value={text} className="min-h-[120px]" />
          )}

          <details className="rounded-md border border-border">
            <summary className="cursor-pointer px-3 py-2 text-sm text-muted-foreground hover:text-foreground">摩斯电码对照表</summary>
            <div className="px-3 pb-3 grid grid-cols-3 gap-1 text-xs font-mono">
              {Object.entries(MORSE_MAP)
                .filter(([k]) => /^[A-Z0-9]$/.test(k))
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between px-2 py-0.5">
                    <span className="font-semibold text-foreground">{k}</span>
                    <span className="text-muted-foreground">{v}</span>
                  </div>
                ))}
            </div>
          </details>

          <div className="rounded-md border border-border p-3 text-xs text-muted-foreground space-y-1">
            <p>• 字母之间用空格分隔，单词之间用 <code className="text-foreground">/</code> 分隔</p>
            <p>• 支持英文字母、数字和常用标点符号</p>
            <p>• 解码时自动识别空格和 / 分隔符</p>
          </div>
        </div>
      </div>
    </div>
  )
}