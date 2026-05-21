import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { CronExpressionParser } from "cron-parser"
import cronstrue from "cronstrue"
import { ErrorBanner } from "@/components/ui/error-banner"

const PRESETS = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every day at midnight", cron: "0 0 * * *" },
  { label: "Every Monday at 9am", cron: "0 9 * * 1" },
  { label: "Every month on the 1st", cron: "0 0 1 * *" },
]

export function CronParser() {
  const [cron, setCron] = useState("0 9 * * 1")

  const description = useMemo(() => {
    try {
      return cronstrue.toString(cron)
    } catch {
      return ""
    }
  }, [cron])

  const error = useMemo(() => {
    if (!cron.trim()) return ""
    try {
CronExpressionParser.parse(cron)
      return ""
    } catch (e) {
      return e instanceof Error ? e.message : "Invalid cron expression"
    }
  }, [cron])

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
            {error && <ErrorBanner message={error} />}
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
            <NextOccurrences cron={cron} error={error} />
          </div>
        </div>
      </div>
    </div>
  )
}

function NextOccurrences({ cron, error }: { cron: string; error: string }) {
  const times = useMemo(() => {
    if (error || !cron.trim()) return []
    try {
      const interval = CronExpressionParser.parse(cron)
      const results: Date[] = []
      for (let i = 0; i < 5; i++) {
        const next = interval.next()
        if (next) results.push(next.toDate())
      }
      return results
    } catch {
      return []
    }
  }, [cron, error])

  if (error) return <span className="text-xs text-muted-foreground">Fix errors to see upcoming occurrences</span>
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