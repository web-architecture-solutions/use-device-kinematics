export default class Matrix extends Array {
  static get empty() {
    return new Matrix([[]])
  }

  constructor(m) {
    super()
    for (let i = 0; i < m.length; i++) {
      this.push([...m[i]])
    }
  }

  static hasEqualRowLengths(m) {
    const columnLength = m[0].length
    return m.every((row) => Array.isArray(row) && row.length === columnLength)
  }

  static isMatrix(m) {
    if (!Array.isArray(m)) {
      throw new Error('Matrix: Object provided is not an array')
    } else if (m.length === 0) {
      throw new Error('Matrix: Array provided is not a valid matrix')
    } else if (!Matrix.hasEqualRowLengths(m)) {
      throw new Error('Matrix: Array provided has unequal row lengths')
    }
    return true
  }

  get rows() {
    return this.length
  }

  get cols() {
    this[0].length
  }

  hasSameDimension(m) {
    return this.rows === m.rows && this.cols === m.cols
  }

  static constant(dimension, value) {
    return Array.from({ length: dimension }, () => Array(dimension).fill(value))
  }

  static zero(dimension) {
    return Matrix.constant(dimension, 0)
  }

  static identity(dimension) {
    return Matrix.diagonal(1, dimension)
  }

  static diagonal(element, dimension) {
    const data = Array.from({ length: dimension }, (_, i) => Array.from({ length: dimension }, (_, j) => (i === j ? element : 0)))
    return new Matrix(data)
  }

  static block(m, rowMapper = null) {
    const blocks = m.map((blockRow) => blockRow.map((block) => (rowMapper ? rowMapper(block) : block)))
    if (blocks.length === 0) return new Matrix([[]])
    const flattenedRows = []
    for (let blockRow of blocks) {
      if (blockRow.length === 0) continue
      const subRows = blockRow[0].length
      for (let i = 0; i < subRows; i++) {
        let newRow = []
        for (let block of blockRow) {
          if (!Array.isArray(block) || block.length < subRows) {
            throw new Error('Each block must be a 2D array with consistent row sizes')
          }
          newRow = newRow.concat(block[i])
        }
        flattenedRows.push(newRow)
      }
    }
    return new Matrix(flattenedRows)
  }

  static blockDiagonal(m, dimension) {
    const elementToDiagonalMatrix = (element) => Matrix.diagonal(element, dimension)
    return Matrix.block(m, elementToDiagonalMatrix)
  }

  add(matrix) {
    if (!this.hasSameDimension(matrix)) {
      throw new Error('Matrix: Cannot add matrices with different dimensions')
    }
    return new Matrix(this.map((row, i) => row.map((value, j) => value + matrix[i][j])))
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
    return new Matrix(paddedMatrix)
  }
}
