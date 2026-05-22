import { useContext } from "react"
import { LocaleContext } from "./LocaleContext"

export function useLocale() {
  return useContext(LocaleContext)
}
