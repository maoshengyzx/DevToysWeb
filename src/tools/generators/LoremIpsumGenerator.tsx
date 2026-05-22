import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ReadOnlyTextarea } from "@/components/ui/shared"
import { Copy, Check, RefreshCw, Minus, Plus } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

const LOREM_EN = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

const LOREM_ZH = "天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。寒来暑往，秋收冬藏。闰余成岁，律吕调阳。云腾致雨，露结为霜。金生丽水，玉出昆冈。剑号巨阙，珠称夜光。果珍李柰，菜重芥姜。海咸河淡，鳞潜羽翔。龙师火帝，鸟官人皇。始制文字，乃服衣裳。推位让国，有虞陶唐。吊民伐罪，周发殷汤。坐朝问道，垂拱平章。"

const ZH_SENTENCES = LOREM_ZH.split("。").filter(Boolean)
const ZH_WORDS = LOREM_ZH.replace(/[，。、；：？！""''（）《》【】]/g, "").split("")
const EN_SENTENCES = LOREM_EN.split(". ").filter(Boolean)
const EN_WORDS = LOREM_EN.split(" ")

type GenType = "paragraphs" | "sentences" | "words"
type GenLang = "en" | "zh"

function generate(type: GenType, count: number, lang: GenLang, seed: number): string {
  const sentences = lang === "zh" ? ZH_SENTENCES : EN_SENTENCES
  const words = lang === "zh" ? ZH_WORDS : EN_WORDS
  const paragraph = lang === "zh" ? LOREM_ZH : LOREM_EN
  const sep = lang === "zh" ? "。" : ". "
  const endSep = lang === "zh" ? "" : "."
  const wordSep = lang === "zh" ? "" : " "
  const paraSep = "\n\n"
  const offset = seed % Math.max(sentences.length, words.length)

  switch (type) {
    case "paragraphs":
      return Array.from({ length: count }, () => paragraph).join(paraSep)
    case "sentences":
      return Array.from({ length: count }, (_, i) => sentences[(i + offset) % sentences.length]).join(sep) + endSep
    case "words":
      return Array.from({ length: count }, (_, i) => words[(i + offset) % words.length]).join(wordSep)
  }
}

const TYPE_OPTIONS: { value: GenType; label: string }[] = [
  { value: "paragraphs", label: "Paragraphs" },
  { value: "sentences", label: "Sentences" },
  { value: "words", label: "Words" },
]

const COUNT_LABELS: Record<GenType, string> = {
  paragraphs: "Paragraph Count",
  sentences: "Sentence Count",
  words: "Word Count",
}

export function LoremIpsumGenerator() {
  const [type, setType] = useState<GenType>("paragraphs")
  const [count, setCount] = useState(3)
  const [lang, setLang] = useState<GenLang>("en")
  const [seed, setSeed] = useState(0)
  const [copied, handleCopy] = useCopyToClipboard()

  const output = useMemo(() => generate(type, count, lang, seed), [type, count, lang, seed])

  const doGenerate = () => setSeed((s) => s + Math.floor(Math.random() * 100) + 1)

  const adjustCount = (delta: number) => {
    setCount((prev) => Math.max(1, prev + delta))
  }

  return (
    <div className="flex h-full">
      <div className="w-64 shrink-0 border-r border-border p-5 flex flex-col gap-5 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</span>
          <div className="flex rounded-md border border-input overflow-hidden">
            {TYPE_OPTIONS.map((opt) => (
              <span
                key={opt.value}
                role="button"
                tabIndex={0}
                onClick={() => setType(opt.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setType(opt.value) }}
                className={`flex-1 px-2 py-1.5 text-center text-xs font-medium cursor-pointer transition-colors ${
                  type === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-accent"
                }`}
              >
                {opt.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{COUNT_LABELS[type]}</span>
          <div className="flex items-center gap-0">
            <span
              role="button"
              tabIndex={0}
              onClick={() => adjustCount(-1)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") adjustCount(-1) }}
              className="flex h-9 w-9 items-center justify-center rounded-l-md border border-input bg-background hover:bg-accent cursor-pointer transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={count}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                if (!isNaN(n) && n >= 1) setCount(n)
              }}
              className="h-9 w-full border-y border-input bg-background px-2 text-center text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <span
              role="button"
              tabIndex={0}
              onClick={() => adjustCount(1)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") adjustCount(1) }}
              className="flex h-9 w-9 items-center justify-center rounded-r-md border border-input bg-background hover:bg-accent cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Language</span>
          <div className="flex rounded-md border border-input overflow-hidden">
            <span
              role="button"
              tabIndex={0}
              onClick={() => setLang("en")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLang("en") }}
              className={`flex-1 px-2 py-1.5 text-center text-xs font-medium cursor-pointer transition-colors ${
                lang === "en"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-accent"
              }`}
            >
              English
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={() => setLang("zh")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLang("zh") }}
              className={`flex-1 px-2 py-1.5 text-center text-xs font-medium cursor-pointer transition-colors ${
                lang === "zh"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-accent"
              }`}
            >
              中文
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <Button className="gap-1.5 cursor-pointer w-full" onClick={doGenerate}>
            <RefreshCw className="h-3.5 w-3.5" />
            Generate
          </Button>
          <Button variant="outline" className="gap-1.5 cursor-pointer w-full" onClick={() => handleCopy(output)}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 relative">
        {output ? (
          <>
            <span
              role="button"
              tabIndex={0}
              onClick={() => handleCopy(output)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCopy(output) }}
              className="absolute top-3 right-8 z-10 inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent cursor-pointer transition-colors shadow-sm"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy"}
            </span>
            <ReadOnlyTextarea value={output} className="min-h-full" />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Configure options on the left, then click Generate
          </div>
        )}
      </div>
    </div>
  )
}
