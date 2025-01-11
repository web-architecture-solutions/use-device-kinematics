export class Matrix extends Array {
  constructor(m) {
    if (Matrix.isMatrix(m)) {
      super()
      for (let i = 0; i < m.length; i++) {
        this.push([...m[i]])
      }
    } else {
      throw new Error('Data provided is not a valid matrix')
    }
  }

  static isMatrix(m) {
    if (!Array.isArray(m) || m.length === 0) return false
    const numCols = m[0].length
    return m.every((row) => Array.isArray(row) && row.length === numCols)
  }

  static constant(dimension, value) {
    return Array.from({ length: dimension }, () => Array(dimension).fill(value))
  }

  static diagonal(dimension, value) {
    return Array.from({ length: dimension }, (_, i) => Array.from({ length: dimension }, (_, j) => (i === j ? value : 0)))
  }

  static zero(dimension) {
    return Matrix.constant(dimension, 0)
  }

  static identity(dimension) {
    return Matrix.diagonal(dimension, 1)
  }

  add(matrix) {
    return this.map((row, i) => row.map((value, j) => value + matrix[i][j]))
  }

  pad(padding) {
    const sourceRows = this.length
    const sourceCols = this[0].length
    const topPad = padding.top || 0
    const bottomPad = padding.bottom || 0
    const leftPad = padding.left || 0
    const rightPad = padding.right || 0
    const targetRows = sourceRows + topPad + bottomPad
    const targetCols = sourceCols + leftPad + rightPad
    const paddedMatrix = Array.from({ length: targetRows }, (_, i) =>
      Array.from({ length: targetCols }, (_, j) => {
        return i >= topPad && i < topPad + sourceRows && j >= leftPad && j < leftPad + sourceCols ? this[i - topPad][j - leftPad] : 0
      })
    )
    return paddedMatrix
  }
}
