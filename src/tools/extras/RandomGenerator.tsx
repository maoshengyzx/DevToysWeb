import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

function SpinWheel({ items, spinning, onSpinEnd }: { items: string[]; spinning: boolean; onSpinEnd: (index: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleRef = useRef(0)
  const animRef = useRef(0)

  const draw = useCallback((angle: number) => {
    const canvas = canvasRef.current
    if (!canvas || items.length === 0) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = center - 4
    const sliceAngle = (2 * Math.PI) / items.length

    const COLORS = [
      "#6366f1", "#818cf8", "#a78bfa", "#c084fc", "#e879f9",
      "#f472b6", "#fb7185", "#f87171", "#fb923c", "#fbbf24",
      "#a3e635", "#34d399", "#22d3ee", "#38bdf8", "#60a5fa",
    ]

    ctx.clearRect(0, 0, size, size)

    items.forEach((item, i) => {
      const startAngle = angle + i * sliceAngle
      const endAngle = startAngle + sliceAngle

      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.15)"
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = "right"
      ctx.fillStyle = "#fff"
      ctx.font = `bold ${Math.max(10, Math.min(14, 200 / items.length))}px sans-serif`
      ctx.shadowColor = "rgba(0,0,0,0.5)"
      ctx.shadowBlur = 2
      const text = item.length > 8 ? item.slice(0, 7) + "…" : item
      ctx.fillText(text, radius - 10, 4)
      ctx.restore()
    })

    ctx.beginPath()
    ctx.arc(center, center, 12, 0, 2 * Math.PI)
    ctx.fillStyle = "#1e1e2e"
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(center, 4)
    ctx.lineTo(center - 8, 0)
    ctx.lineTo(center + 8, 0)
    ctx.closePath()
    ctx.fillStyle = "#ef4444"
    ctx.fill()
  }, [items])

  useEffect(() => {
    if (spinning) {
      const startAngle = angleRef.current
      const totalRotation = Math.PI * 4 + Math.random() * Math.PI * 4
      const duration = 3000
      const startTime = performance.now()

      const animate = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const currentAngle = startAngle + totalRotation * eased
        angleRef.current = currentAngle
        draw(currentAngle)

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate)
        } else {
          const sliceAngle = (2 * Math.PI) / items.length
          const normalized = ((2 * Math.PI - (currentAngle % (2 * Math.PI))) + Math.PI / 2) % (2 * Math.PI)
          const winIndex = Math.floor(normalized / sliceAngle) % items.length
          onSpinEnd(winIndex)
        }
      }

      animRef.current = requestAnimationFrame(animate)
    } else {
      draw(angleRef.current)
    }

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [spinning, draw, items.length, onSpinEnd])

  return <canvas ref={canvasRef} width={280} height={280} className="mx-auto" />
}

export function RandomGenerator() {
  const [tab, setTab] = useState<"number" | "dice" | "wheel">("number")
  const [min, setMin] = useState("1")
  const [max, setMax] = useState("100")
  const [count, setCount] = useState("1")
  const [results, setResults] = useState<number[]>([])
  const [diceCount, setDiceCount] = useState(1)
  const [diceResults, setDiceResults] = useState<number[]>([])
  const [wheelItems, setWheelItems] = useState("选项A,选项B,选项C,选项D")
  const [spinning, setSpinning] = useState(false)
  const [wheelResult, setWheelResult] = useState("")
  const [history, setHistory] = useState<string[]>([])

  const generateNumbers = () => {
    const lo = parseInt(min) || 0
    const hi = parseInt(max) || 100
    const n = Math.min(parseInt(count) || 1, 100)
    const arr: number[] = []
    for (let i = 0; i < n; i++) {
      arr.push(Math.floor(Math.random() * (hi - lo + 1)) + lo)
    }
    setResults(arr)
    setHistory((prev) => [`${arr.join(", ")} (${lo}-${hi})`, ...prev].slice(0, 10))
  }

  const rollDice = () => {
    const arr: number[] = []
    for (let i = 0; i < diceCount; i++) {
      arr.push(Math.floor(Math.random() * 6) + 1)
    }
    setDiceResults(arr)
    setHistory((prev) => [`${arr.join(" + ")} = ${arr.reduce((a, b) => a + b, 0)} (${diceCount}d6)`, ...prev].slice(0, 10))
  }

  const handleSpinEnd = useCallback((index: number) => {
    setSpinning(false)
    const items = wheelItems.split(",").map((s) => s.trim()).filter(Boolean)
    if (items[index]) {
      setWheelResult(items[index])
      setHistory((prev) => [`🎲 ${items[index]}`, ...prev].slice(0, 10))
    }
  }, [wheelItems])

  const startSpin = () => {
    setWheelResult("")
    setSpinning(true)
  }

  const DICE_FACES: Record<number, string> = { 1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅" }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-5 max-w-2xl">
          <div className="flex gap-1 rounded-md bg-muted p-1">
            {(["number", "dice", "wheel"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-sm px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                  tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "number" ? "随机数" : t === "dice" ? "骰子" : "转盘"}
              </button>
            ))}
          </div>

          {tab === "number" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">最小值</label>
                  <input
                    type="number"
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">最大值</label>
                  <input
                    type="number"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">数量</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <Button className="w-full cursor-pointer" onClick={generateNumbers}>生成随机数</Button>
              {results.length > 0 && (
                <div className="rounded-md border border-border p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">{results.join(", ")}</div>
                </div>
              )}
            </div>
          )}

          {tab === "dice" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">骰子数量</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setDiceCount(Math.max(1, diceCount - 1))} className="h-8 w-8 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-accent">-</button>
                  <span className="w-8 text-center text-sm font-medium text-foreground">{diceCount}</span>
                  <button onClick={() => setDiceCount(Math.min(10, diceCount + 1))} className="h-8 w-8 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-accent">+</button>
                </div>
              </div>
              <Button className="w-full cursor-pointer" onClick={rollDice}>掷骰子</Button>
              {diceResults.length > 0 && (
                <div className="rounded-md border border-border p-4">
                  <div className="flex justify-center gap-3 text-4xl">
                    {diceResults.map((d, i) => <span key={i}>{DICE_FACES[d]}</span>)}
                  </div>
                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    总和: <span className="font-semibold text-foreground">{diceResults.reduce((a, b) => a + b, 0)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "wheel" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">选项（逗号分隔）</label>
                <textarea
                  value={wheelItems}
                  onChange={(e) => setWheelItems(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[60px]"
                  rows={2}
                />
              </div>
              <Button className="w-full cursor-pointer" onClick={startSpin} disabled={spinning}>
                {spinning ? "转动中..." : "开始转盘"}
              </Button>
              <SpinWheel items={wheelItems.split(",").map((s) => s.trim()).filter(Boolean)} spinning={spinning} onSpinEnd={handleSpinEnd} />
              {wheelResult && (
                <div className="rounded-md border border-border p-4 text-center">
                  <div className="text-sm text-muted-foreground">结果</div>
                  <div className="text-2xl font-bold text-foreground">{wheelResult}</div>
                </div>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div className="rounded-md border border-border p-3 space-y-1">
              <div className="text-xs font-medium text-muted-foreground">历史记录</div>
              {history.map((h, i) => (
                <div key={i} className="text-sm text-foreground">{h}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}