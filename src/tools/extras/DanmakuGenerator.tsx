import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function DanmakuGenerator() {
  const [text, setText] = useState("")
  const [fontSize, setFontSize] = useState(48)
  const [color, setColor] = useState("#ffffff")
  const [speed, setSpeed] = useState(5)
  const [running, setRunning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!running) return
    const items: string[] = [text || "弹幕示例文字"]
    const interval = setInterval(() => {
      if (!containerRef.current) return
      const el = document.createElement("div")
      el.textContent = items[Math.floor(Math.random() * items.length)]
      el.style.position = "absolute"
      el.style.right = "0"
      el.style.whiteSpace = "nowrap"
      el.style.fontSize = `${fontSize}px`
      el.style.color = color
      el.style.fontWeight = "bold"
      el.style.textShadow = "1px 1px 2px rgba(0,0,0,0.8)"
      el.style.top = `${Math.random() * 80}%`
      el.style.animationName = "danmaku-scroll"
      el.style.animationDuration = `${12 - speed}s`
      el.style.animationTimingFunction = "linear"
      el.style.animationFillMode = "forwards"
      containerRef.current.appendChild(el)
      el.addEventListener("animationend", () => el.remove())
    }, 800)
    return () => clearInterval(interval)
  }, [running, text, fontSize, color, speed])

  const start = () => { if (!text.trim()) return; setRunning(true) }
  const stop = () => { setRunning(false) }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-5 max-w-2xl">
          <div
            ref={containerRef}
            className="relative w-full h-64 rounded-lg bg-black overflow-hidden"
            style={{ contain: "layout" }}
          >
            {!running && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                点击下方"开始"按钮发送弹幕
              </div>
            )}
          </div>

          <style>{`
            @keyframes danmaku-scroll {
              from { transform: translateX(100%); }
              to { transform: translateX(-2000px); }
            }
          `}</style>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">弹幕文字</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入弹幕内容"
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">字号 ({fontSize}px)</label>
                <input
                  type="range"
                  min={16}
                  max={96}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">颜色</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">速度 ({speed})</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {!running ? (
                <Button className="flex-1 cursor-pointer" onClick={start}>开始</Button>
              ) : (
                <Button variant="destructive" className="flex-1 cursor-pointer" onClick={stop}>停止</Button>
              )}
            </div>
          </div>

          <div className="rounded-md border border-border p-3 text-sm text-muted-foreground space-y-1">
            <p>• 在黑色区域模拟手机屏幕弹幕效果</p>
            <p>• 调节字号、颜色和速度来定制弹幕样式</p>
            <p>• 停止后可修改文字重新开始</p>
          </div>
        </div>
      </div>
    </div>
  )
}