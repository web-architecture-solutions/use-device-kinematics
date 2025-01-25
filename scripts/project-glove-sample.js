const fs = require('fs')

class GloVeProjection3D {
  static normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return magnitude === 0 ? [0, 0, 0] : vector.map((val) => val / magnitude)
  }

  static merge(projection1, projection2) {
    const mergedProjection = { ...projection1 }
    for (const coordinate in projection2) {
      if (mergedProjection[coordinate]) {
        const union = new Set([...mergedProjection[coordinate], ...projection2[coordinate]])
        mergedProjection[coordinate] = Array.from(union)
      } else {
        mergedProjection[coordinate] = projection2[coordinate]
      }
    }
    return mergedProjection
  }

  constructor(resolution, filePath, outputFile) {
    this.filePath = filePath
    this.resolution = resolution
    this.outputFile = outputFile
  }

  readEmbeddings() {
    const data = fs.readFileSync(this.filePath, 'utf8')
    const embeddings = {}
    data.split('\n').forEach((line) => {
      const parts = line.trim().split(' ')
      if (parts.length <= 1) return
      const word = parts[0]
      const vector = parts.slice(1).map((val) => parseFloat(val))
      if (vector.some(isNaN)) return
      embeddings[word] = vector
    })
    return embeddings
  }

  uniformProjection(vector) {
    const maxVal = Math.max(...vector.map(Math.abs))
    const scaleFactor = (this.resolution - 1) / maxVal
    const scaled = vector.map((val) => Math.floor(val * scaleFactor))
    return {
      x: Math.min(Math.max(scaled[0], 0), this.resolution - 1),
      y: Math.min(Math.max(scaled[1], 0), this.resolution - 1),
      z: Math.min(Math.max(scaled[2], 0), this.resolution - 1)
    }
  }

  centralProjection(vector) {
    return {
      x: Math.floor(((vector[0] + 1) * (this.resolution - 1)) / 2),
      y: Math.floor(((vector[1] + 1) * (this.resolution - 1)) / 2),
      z: Math.floor(((vector[2] + 1) * (this.resolution - 1)) / 2)
    }
  }

  process() {
    const embeddings = this.readEmbeddings()
    const uniformProjection = {}
    const centralProjection = {}
    for (const word in embeddings) {
      const vector = GloVeProjection3D.normalizeVector(embeddings[word])
      const { x: ux, y: uy, z: uz } = this.uniformProjection(vector)
      const uniformProjectionCoordinates = `${ux},${uy},${uz}`
      if (!uniformProjection[uniformProjectionCoordinates]) uniformProjection[uniformProjectionCoordinates] = []
      uniformProjection[uniformProjectionCoordinates].push(word)
      const { x: cx, y: cy, z: cz } = this.centralProjection(vector)
      const centralProjectionCoordinates = `${cx},${cy},${cz}`
      if (!centralProjection[centralProjectionCoordinates]) centralProjection[centralProjectionCoordinates] = []
      centralProjection[centralProjectionCoordinates].push(word)
    }
    const mergedProjection = GloVeProjection3D.merge(uniformProjection, centralProjection)
    fs.writeFileSync(this.outputFile, JSON.stringify(mergedProjection, null, 2), 'utf8')
    console.log(`Merged projection saved to ${this.outputFile}`)
  }
}

const gloVeProjection3D = new GloVeProjection3D(10, '../embeddings/glove-sample.txt', '../src/words.json')
gloVeProjection3D.process()
