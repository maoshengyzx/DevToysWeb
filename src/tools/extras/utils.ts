

const MORSE_MAP: Record<string, string> = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.",
  "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..",
  "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.",
  "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-",
  "Y": "-.--", "Z": "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...",
  ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.",
  "-": "-....-", "_": "..--.-", "\"": ".-..-.", "'": ".----.",
  "@": ".--.-.",
}

const REVERSE_MORSE: Record<string, string> = {}
for (const [k, v] of Object.entries(MORSE_MAP)) {
  REVERSE_MORSE[v] = k
}

const CHINESE_NUM: Record<string, string> = {
  "0": "零", "1": "壹", "2": "贰", "3": "叁", "4": "肆",
  "5": "伍", "6": "陆", "7": "柒", "8": "捌", "9": "玖",
}

function numberToChineseAmount(num: number): string {
  if (num === 0) return "零元整"
  if (num >= 1e12 || num < 0) return "超出范围"

  const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]
  const units = ["", "拾", "佰", "仟"]
  const bigUnits = ["", "万", "亿"]

  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)

  let result: string

  if (intPart === 0) {
    result = ""
  } else {
    const intStr = intPart.toString()
    const groups: string[] = []
    for (let i = intStr.length; i > 0; i -= 4) {
      groups.unshift(intStr.substring(Math.max(0, i - 4), i))
    }

    const parts: string[] = []
    for (let gi = 0; gi < groups.length; gi++) {
      const g = groups[gi]
      const bigUnitIdx = groups.length - 1 - gi
      let part = ""
      let lastWasZero = false
      for (let i = 0; i < g.length; i++) {
        const d = parseInt(g[i])
        const unitIdx = g.length - 1 - i
        if (d === 0) {
          if (!lastWasZero && unitIdx > 0) part += "零"
          lastWasZero = true
        } else {
          part += digits[d] + units[unitIdx]
          lastWasZero = false
        }
      }
      if (part && part !== "零") {
        parts.push(part + bigUnits[bigUnitIdx])
      } else if (part === "零" && parts.length > 0 && !parts[parts.length - 1].endsWith("零")) {
        parts.push("零")
      }
    }
    result = parts.join("").replace(/零+$/, "") + "元"
  }

  if (decPart === 0) {
    return (result || "") + "整"
  }

  const jiao = Math.floor(decPart / 10)
  const fen = decPart % 10

  if (!result && jiao > 0) result = "零"
  if (jiao > 0) result += digits[jiao] + "角"
  else if (intPart > 0) result += "零"
  if (fen > 0) result += digits[fen] + "分"

  return result
}

const FAMILY_TREE: Record<string, Record<string, string>> = {
  "父": { "父": "爷爷", "母": "奶奶", "兄": "伯父", "弟": "叔叔", "姐": "姑妈(姐)", "妹": "姑姑(妹)", "子": "自己(堂兄弟)", "女": "堂姐妹" },
  "母": { "父": "外公", "母": "外婆", "兄": "大舅", "弟": "舅舅", "姐": "大姨", "妹": "小姨" },
  "兄": { "子": "侄子", "女": "侄女" },
  "弟": { "子": "侄子", "女": "侄女", "妻": "弟妹" },
  "姐": { "子": "外甥", "女": "外甥女" },
  "妹": { "子": "外甥", "女": "外甥女", "夫": "妹夫" },
  "子": { "子": "孙子", "女": "孙女" },
  "女": { "子": "外孙", "女": "外孙女", "夫": "女婿" },
}

const DIRECT: Record<string, string> = {
  "爸": "父", "妈妈": "母", "妈": "母", "父亲": "父", "母亲": "母",
  "哥哥": "兄", "弟弟": "弟", "姐姐": "姐", "妹妹": "妹",
  "儿子": "子", "女儿": "女", "老婆": "妻", "丈夫": "夫",
}

interface KinshipStep {
  relation: string
  title: string
}

function calculateKinship(input: string): { steps: KinshipStep[]; result: string } | string {
  const parts = input.trim().split(/[的\-—\s]+/).filter(Boolean)
  if (parts.length === 0) return "请输入关系链，如：爸爸的哥哥的儿子"

  const canonical = parts.map(p => DIRECT[p] || p)
  let current = "我"
  const steps: KinshipStep[] = []

  for (const part of canonical) {
    const nextMap = FAMILY_TREE[current]
    if (!nextMap || !nextMap[part]) {
      return `未知关系：${current} → ${part}`
    }
    current = nextMap[part]
    steps.push({ relation: part, title: current })
  }

  const RESULT_NAMES: Record<string, string> = {
    "自己(堂兄弟)": "堂兄弟",
    "堂姐妹": "堂姐妹",
  }

  return { steps, result: RESULT_NAMES[current] || current }
}

export { MORSE_MAP, REVERSE_MORSE, CHINESE_NUM, numberToChineseAmount, calculateKinship }
export type { KinshipStep }