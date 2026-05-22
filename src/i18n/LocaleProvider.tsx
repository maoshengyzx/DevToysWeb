import { useState, useCallback, type ReactNode } from "react"
import type { Locale, TranslationKey } from "./locales"
import { t as translate } from "./locales"
import { LocaleContext } from "./LocaleContext"

const LOCALE_KEY = "devtoysweb-locale"

function getInitialLocale(): Locale {
  const saved = localStorage.getItem(LOCALE_KEY)
  if (saved === "zh" || saved === "en") return saved
  const navLang = navigator.language.toLowerCase()
  return navLang.startsWith("zh") ? "zh" : "en"
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(LOCALE_KEY, next)
  }, [])

  const t = useCallback(
    (key: TranslationKey) => translate(key, locale),
    [locale],
  )

  return (
    <LocaleContext value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext>
  )
}
