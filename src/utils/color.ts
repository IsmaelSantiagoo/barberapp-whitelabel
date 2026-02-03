function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')

  const bigint = parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return { r, g, b }
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }

  const R = toLinear(r)
  const G = toLinear(g)
  const B = toLinear(b)

  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

export function getContrastRatio(hex1: string, hex2: string) {
  const L1 = relativeLuminance(hexToRgb(hex1))
  const L2 = relativeLuminance(hexToRgb(hex2))

  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)

  return (lighter + 0.05) / (darker + 0.05)
}

export function getReadableTextColor(bgColor: string) {
  const whiteContrast = getContrastRatio(bgColor, '#FFFFFF')
  const blackContrast = getContrastRatio(bgColor, '#1A1A1A')

  return whiteContrast >= blackContrast ? '#FFFFFF' : '#1A1A1A'
}

export function adjustColor(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)

  const clamp = (v: number) => Math.max(0, Math.min(255, v))

  const newR = clamp(r + amount)
  const newG = clamp(g + amount)
  const newB = clamp(b + amount)

  return '#' + [newR, newG, newB].map((v) => v.toString(16).padStart(2, '0')).join('')
}
