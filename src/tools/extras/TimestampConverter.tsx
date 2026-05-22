import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(utc)
dayjs.extend(relativeTime)

function getNow(): number {
  return Math.floor(Date.now() / 1000)
}

const initialTs = getNow()

export function TimestampConverter() {
  const [timestamp, setTimestamp] = useState(String(initialTs))
  const [dateStr, setDateStr] = useState(dayjs.unix(initialTs).format("YYYY-MM-DD HH:mm:ss"))
  const [copied, handleCopy] = useCopyToClipboard()

  const tsNumber = parseInt(timestamp, 10)
  const tsDate = !isNaN(tsNumber) && timestamp.trim() ? dayjs.unix(tsNumber) : null

  const handleTimestampChange = (val: string) => {
    setTimestamp(val)
    const num = parseInt(val, 10)
    if (!isNaN(num) && val.trim()) {
      setDateStr(dayjs.unix(num).format("YYYY-MM-DD HH:mm:ss"))
    } else {
      setDateStr("")
    }
  }

  const handleDateChange = (val: string) => {
    setDateStr(val)
    const d = dayjs(val)
    if (d.isValid()) {
      setTimestamp(String(Math.floor(d.valueOf() / 1000)))
    }
  }

  const startOfToday = Math.floor(dayjs().startOf("day").valueOf() / 1000)

  const presets = [
    { label: "Now", ts: getNow() },
    { label: "1 hour ago", ts: getNow() - 3600 },
    { label: "1 day ago", ts: getNow() - 86400 },
    { label: "1 week ago", ts: getNow() - 604800 },
    { label: "Start of today", ts: startOfToday },
  ]

  const handlePreset = (ts: number) => {
    setTimestamp(String(ts))
    setDateStr(dayjs.unix(ts).format("YYYY-MM-DD HH:mm:ss"))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
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
              {tsDate && tsDate.isValid() ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Converted Results</label>
                  <div className="space-y-1.5">
                    {[
                      { label: "UTC", value: tsDate.utc().format("YYYY-MM-DD HH:mm:ss [UTC]") },
                      { label: "Local", value: tsDate.format("YYYY-MM-DD HH:mm:ss") },
                      { label: "ISO 8601", value: tsDate.utc().format() },
                      { label: "Relative", value: tsDate.fromNow() },
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
  )
}