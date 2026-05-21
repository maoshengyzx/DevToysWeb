import { useState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { calculateKinship } from "../extras/utils"

const RELATIONS = [
  { label: "父", aliases: ["爸爸", "爸", "父亲"] },
  { label: "母", aliases: ["妈妈", "妈", "母亲"] },
  { label: "兄", aliases: ["哥哥", "兄长"] },
  { label: "弟", aliases: ["弟弟"] },
  { label: "姐", aliases: ["姐姐"] },
  { label: "妹", aliases: ["妹妹"] },
  { label: "子", aliases: ["儿子"] },
  { label: "女", aliases: ["女儿"] },
]

export function KinshipCalculator() {
  const [chain, setChain] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState("")

  const addRelation = (rel: string) => {
    setChain([...chain, rel])
    setResult(null)
    setError("")
  }

  const removeLast = () => {
    const next = chain.slice(0, -1)
    setChain(next)
    setResult(null)
    setError("")
  }

  const reset = () => {
    setChain([])
    setResult(null)
    setError("")
  }

  const calculate = () => {
    if (chain.length === 0) return
    const input = chain.join("的")
    const res = calculateKinship(input)
    if (typeof res === "string") {
      setError(res)
      setResult(null)
    } else {
      setResult(res.result)
      setError("")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-2xl">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">选择关系链</label>
            <div className="flex flex-wrap gap-2">
              {RELATIONS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => addRelation(r.label)}
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {chain.length > 0 && (
            <div className="rounded-md border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">关系链</span>
                <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">清空</button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {chain.map((c, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-muted-foreground">→</span>}
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-sm font-medium text-foreground">
                      {c}
                    </span>
                  </span>
                ))}
                <button onClick={removeLast} className="inline-flex items-center rounded-md border border-dashed border-input px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                  ← 退一步
                </button>
              </div>
              <button
                onClick={calculate}
                className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors"
              >
                计算称谓
              </button>
            </div>
          )}

          {error && <ErrorBanner message={error} />}

          {result && (
            <div className="rounded-md border border-border p-4">
              <div className="text-sm text-muted-foreground">称谓结果</div>
              <div className="text-2xl font-bold text-foreground mt-1">{result}</div>
              <div className="text-sm text-muted-foreground mt-2">
                {chain.join("的")} = {result}
              </div>
            </div>
          )}

          <div className="rounded-md border border-border p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">常见关系速查</h3>
            <div className="grid grid-cols-2 gap-1.5 text-sm">
              {[
                ["爸爸的爸爸", "爷爷"], ["爸爸的妈妈", "奶奶"],
                ["妈妈的爸爸", "外公"], ["妈妈的妈妈", "外婆"],
                ["爸爸的哥哥", "伯父"], ["爸爸的弟弟", "叔叔"],
                ["爸爸的姐妹", "姑姑"], ["妈妈的兄弟", "舅舅"],
                ["妈妈的姐妹", "阿姨"], ["哥哥/弟弟的妻子", "嫂子/弟妹"],
                ["姐姐/妹妹的丈夫", "姐夫/妹夫"], ["儿子的妻子", "儿媳"],
                ["女儿的丈夫", "女婿"], ["哥哥的儿子", "侄子"],
                ["姐姐的儿子", "外甥"], ["儿子的儿子", "孙子"],
                ["女儿的儿子", "外孙"],
              ].map(([rel, title]) => (
                <div key={rel} className="flex items-center gap-2 py-0.5">
                  <span className="text-muted-foreground">{rel}</span>
                  <span className="text-foreground font-medium">→ {title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}