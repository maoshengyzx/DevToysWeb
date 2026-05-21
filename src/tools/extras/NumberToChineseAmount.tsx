import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { numberToChineseAmount, CHINESE_NUM } from "../extras/utils"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

export function NumberToChineseAmount() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [copied, handleCopy] = useCopyToClipboard()

  const handleInputChange = (val: string) => {
    setInput(val)
    if (!val.trim()) { setResult(""); setError(""); return }
    const num = parseFloat(val.trim())
    if (isNaN(num) || num < 0 || num >= 1e12) {
      setError("请输入 0 ~ 999999999999 之间的数字")
      setResult("")
      return
    }
    setError("")
    setResult(numberToChineseAmount(num))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="text-sm font-medium text-foreground">阿拉伯数字金额</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="如 1234.56"
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
          </div>

          {result && (
            <div className="rounded-md border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">中文大写金额</span>
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 cursor-pointer" onClick={() => handleCopy(result)}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "已复制" : "复制"}
                </Button>
              </div>
              <div className="text-2xl font-bold text-foreground">{result}</div>
            </div>
          )}

          <details className="rounded-md border border-border">
            <summary className="cursor-pointer px-3 py-2 text-sm text-muted-foreground hover:text-foreground">数字对照表</summary>
            <div className="px-3 pb-3 grid grid-cols-2 gap-1 text-sm font-mono">
              {Object.entries(CHINESE_NUM).map(([k, v]) => (
                <div key={k} className="flex justify-between px-2 py-0.5">
                  <span className="text-foreground">{k}</span>
                  <span className="text-muted-foreground">{v}</span>
                </div>
              ))}
            </div>
          </details>

          <div className="rounded-md border border-border p-3 text-xs text-muted-foreground space-y-1">
            <p>• 支持 0 ~ 9999 亿范围内的小数（精确到分）</p>
            <p>• 自动处理"零"的读写规则</p>
            <p>• 输入实时转换，无需点击按钮</p>
          </div>
        </div>
      </div>
    </div>
  )
}