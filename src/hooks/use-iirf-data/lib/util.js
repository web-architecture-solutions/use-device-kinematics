export function formatNumber(number, length) {
  if (!number) return number
  return number > 0 ? `+${number.toFixed(length)}` : number === 0 ? `0${number.toFixed(length)}` : number.toFixed(length)
}

export const isNullOrUndefined = (x) => x === null || x === undefined
