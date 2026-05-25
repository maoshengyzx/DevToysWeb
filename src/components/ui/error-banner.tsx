import { AlertCircle } from "lucide-react"

interface ErrorBannerProps {
  message: string
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive break-words">
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}