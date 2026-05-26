import { useState } from "react"
import { ChevronDown, HelpCircle, Lightbulb, BookOpen } from "lucide-react"
import { useLocale } from "@/i18n/useLocale"
import { getToolContent } from "@/lib/tool-content"

interface ToolInfoPanelProps {
  toolId: string
  toolLabel: string
  toolDesc: string
}

export function ToolInfoPanel({ toolId, toolLabel, toolDesc }: ToolInfoPanelProps) {
  const { locale } = useLocale()
  const isZh = locale === "zh"
  const content = getToolContent(toolId, toolLabel, toolDesc)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const Section = ({
    id,
    icon: Icon,
    title,
    children,
  }: {
    id: string
    icon: React.ElementType
    title: string
    children: React.ReactNode
  }) => {
    const isOpen = expandedSections.has(id)
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
          onClick={() => toggleSection(id)}
        >
          <Icon className="h-4 w-4 text-primary shrink-0" />
          <span className="flex-1">{title}</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border">
            <div className="pt-3">{children}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="border-t border-border bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 space-y-3">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          {isZh ? "关于此工具" : "About This Tool"}
        </h2>

        <Section id="intro" icon={BookOpen} title={isZh ? "工具简介" : "Introduction"}>
          <p className="leading-relaxed">{isZh ? content.intro.zh : content.intro.en}</p>
        </Section>

        <Section id="useCases" icon={Lightbulb} title={isZh ? "使用场景" : "Use Cases"}>
          <ul className="space-y-2">
            {(isZh ? content.useCases.map((u) => u.zh) : content.useCases.map((u) => u.en)).map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="faq" icon={HelpCircle} title={isZh ? "常见问题" : "FAQ"}>
          <div className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
            {content.faq.map((item, i) => {
              const q = isZh ? item.q.zh : item.q.en
              const a = isZh ? item.a.zh : item.a.en
              return (
                <div key={i} className="space-y-1" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <p className="font-medium text-foreground" itemProp="name">{q}</p>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p className="leading-relaxed" itemProp="text">{a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      </div>
    </div>
  )
}
