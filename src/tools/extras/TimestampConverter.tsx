import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

function getNow(): number {
  return Math.floor(Date.now() / 1000)
}

function tsToDateStr(ts: number): string {
  const d = new Date(ts * 1000)
  return d.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC")
}

const initialTs = getNow()

export function TimestampConverter() {
  const [timestamp, setTimestamp] = useState(String(initialTs))
  const [dateStr, setDateStr] = useState(tsToDateStr(initialTs))
  const [now] = useState(initialTs)
  const [copied, handleCopy] = useCopyToClipboard()

  const tsNumber = parseInt(timestamp, 10)
  const tsDate = !isNaN(tsNumber) && timestamp.trim() ? new Date(tsNumber * 1000) : null

  const handleTimestampChange = (val: string) => {
    setTimestamp(val)
    const num = parseInt(val, 10)
    if (!isNaN(num) && val.trim()) {
      setDateStr(tsToDateStr(num))
    } else {
      setDateStr("")
    }
  }

  const handleDateChange = (val: string) => {
    setDateStr(val)
    const d = new Date(val)
    if (!isNaN(d.getTime())) {
      setTimestamp(String(Math.floor(d.getTime() / 1000)))
    }
  }

  const presets = [
    { label: "Now", ts: now },
    { label: "1 hour ago", ts: now - 3600 },
    { label: "1 day ago", ts: now - 86400 },
    { label: "1 week ago", ts: now - 604800 },
    { label: "Start of today", ts: now - (now % 86400) - 28800 },
  ]

  const handlePreset = (ts: number) => {
    setTimestamp(String(ts))
    setDateStr(tsToDateStr(ts))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Unix Timestamp (seconds)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={timestamp}
                    onChange={(e) => handleTimestampChange(e.target.value)}
                    placeholder="e.g. 1700000000"
                    className="h-9 flex-1 rounded-md border border-input bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={() => handleCopy(timestamp)}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Date & Time</label>
                <input
                  type="text"
                  value={dateStr}
                  onChange={(e) => handleDateChange(e.target.value)}
                  placeholder="e.g. 2024-01-01 00:00:00"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Quick Timestamps</label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <Button
                      key={p.label}
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => handlePreset(p.ts)}
                    >
                      {p.label}
                    </Button>
                  ))}
                  <Button className="cursor-pointer" size="sm" onClick={() => handlePreset(getNow())}>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {tsDate && !isNaN(tsDate.getTime()) ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Converted Results</label>
                  <div className="space-y-1.5">
                    {[
                      { label: "UTC", value: tsDate.toISOString() },
                      { label: "Local", value: tsDate.toLocaleString() },
                      { label: "ISO 8601", value: tsDate.toISOString() },
                      { label: "Relative", value: getRelativeTime(tsDate) },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                        <span className="w-20 shrink-0 text-xs text-muted-foreground">{item.label}</span>
                        <code className="flex-1 text-xs font-mono text-foreground break-all">{item.value}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[120px] text-sm text-muted-foreground rounded-md border border-dashed border-border">
                  Enter a timestamp to see conversions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getRelativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const abs = Math.abs(diff)
  const suffix = diff > 0 ? "ago" : "from now"

  if (abs < 60000) return `${Math.floor(abs / 1000)} seconds ${suffix}`
  if (abs < 3600000) return `${Math.floor(abs / 60000)} minutes ${suffix}`
  if (abs < 86400000) return `${Math.floor(abs / 3600000)} hours ${suffix}`
  if (abs < 2592000000) return `${Math.floor(abs / 86400000)} days ${suffix}`
  if (abs < 31536000000) return `${Math.floor(abs / 2592000000)} months ${suffix}`
  return `${Math.floor(abs / 31536000000)} years ${suffix}`
}