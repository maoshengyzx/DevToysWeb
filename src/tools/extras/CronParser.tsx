import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const PRESETS = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every day at midnight", cron: "0 0 * * *" },
  { label: "Every Monday at 9am", cron: "0 9 * * 1" },
  { label: "Every month on the 1st", cron: "0 0 1 * *" },
]

function parseCronField(field: string, min: number, max: number): number[] {
  const values: number[] = []
  const parts = field.split(",")

  for (const part of parts) {
    if (part === "*") {
      for (let i = min; i <= max; i++) values.push(i)
    } else if (part.includes("/")) {
      const [startStr, stepStr] = part.split("/")
      const start = startStr === "*" ? min : parseInt(startStr)
      const step = parseInt(stepStr)
      for (let i = start; i <= max; i += step) values.push(i)
    } else if (part.includes("-")) {
      const [startStr, endStr] = part.split("-")
      const start = parseInt(startStr)
      const end = parseInt(endStr)
      for (let i = start; i <= end; i++) values.push(i)
    } else {
      values.push(parseInt(part))
    }
  }
  return [...new Set(values)].sort((a, b) => a - b)
}

function describeCron(cron: string): string {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return "Invalid cron expression"

  const minutes = parseCronField(parts[0], 0, 59)
  const hours = parseCronField(parts[1], 0, 23)
  const doms = parseCronField(parts[2], 1, 31)
  const months = parseCronField(parts[3], 1, 12)
  const dows = parseCronField(parts[4], 0, 6)

  const desc: string[] = []

  if (parts[4] !== "*") {
    desc.push(`on ${dows.map((d) => DAY_NAMES[d]).join(", ")}`)
  }
  if (parts[3] !== "*") {
    desc.push(`in ${months.map((m) => MONTH_NAMES[m - 1]).join(", ")}`)
  }
  if (parts[2] !== "*") {
    desc.push(`on day(s) ${doms.join(", ")} of the month`)
  }

  if (parts[1] === "*" && parts[0] === "*") {
    desc.unshift("Every minute")
  } else if (parts[1] === "*") {
    desc.unshift(`At minute(s) ${minutes.join(", ")}`)
  } else if (parts[0] === "*" || parts[0].startsWith("*/")) {
    desc.unshift(`At ${hours.map((h) => `${h}:00`).join(", ")}`)
  } else {
    desc.unshift(`At ${hours.map((h) => `${String(h).padStart(2, "0")}:${String(minutes[0] ?? 0).padStart(2, "0")}`).join(", ")}`)
  }

  return desc.join(" ")
}

export function CronParser() {
  const [cron, setCron] = useState("0 9 * * 1")

  let description = ""
  let error = ""
  try {
    description = describeCron(cron)
  } catch (e) {
    error = e instanceof Error ? e.message : "Invalid cron"
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-lg">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Cron Expression</label>
            <input
              type="text"
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              placeholder="* * * * *"
              className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {error && <span className="text-xs text-destructive">{error}</span>}
          </div>

          {description && !error && (
            <div className="rounded-md border border-border bg-muted px-4 py-3">
              <p className="text-sm text-foreground">{description}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Field Reference</label>
            <div className="space-y-1 text-xs font-mono text-muted-foreground">
              <p>┌───────────── minute (0-59)</p>
              <p>│ ┌───────────── hour (0-23)</p>
              <p>│ │ ┌───────────── day of month (1-31)</p>
              <p>│ │ │ ┌───────────── month (1-12)</p>
              <p>│ │ │ │ ┌───────────── day of week (0-6, Sun=0)</p>
              <p>│ │ │ │ │</p>
              <p className="text-foreground">{cron.split(/\s+/).join(" ") || "* * * * *"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Common Presets</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.cron}
                  variant={cron === preset.cron ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setCron(preset.cron)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Next 5 Occurrences</label>
            <NextOccurrences cron={cron} />
          </div>
        </div>
      </div>
    </div>
  )
}

function NextOccurrences({ cron }: { cron: string }) {
  const times = useMemo(() => {
    try {
      const parts = cron.trim().split(/\s+/)
      if (parts.length !== 5) return []
      const now = new Date()
      const results: Date[] = []
      const current = new Date(now.getTime() + 60000)
      current.setSeconds(0, 0)

      const minutes = parseCronField(parts[0], 0, 59)
      const hours = parseCronField(parts[1], 0, 23)
      const doms = parseCronField(parts[2], 1, 31)
      const months = parseCronField(parts[3], 1, 12)
      const dows = parseCronField(parts[4], 0, 6)

      const maxIter = 525600
      for (let i = 0; i < maxIter && results.length < 5; i++) {
        const d = new Date(current.getTime() + i * 60000)
        if (
          minutes.includes(d.getMinutes()) &&
          hours.includes(d.getHours()) &&
          (parts[2] === "*" || doms.includes(d.getDate())) &&
          (parts[3] === "*" || months.includes(d.getMonth() + 1)) &&
          (parts[4] === "*" || dows.includes(d.getDay()))
        ) {
          results.push(new Date(d))
        }
      }
      return results
    } catch {
      return []
    }
  }, [cron])

  if (times.length === 0) return <span className="text-xs text-muted-foreground">No upcoming occurrences found</span>

  return (
    <div className="space-y-1">
      {times.map((t: Date, i: number) => (
        <div key={i} className="text-sm font-mono text-foreground">
          {t.toLocaleString()}
        </div>
      ))}
    </div>
  )
}