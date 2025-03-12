// ColorEmbedding.js
export function defaultColorMapping(x, y, z) {
  // Map spatial coordinates from [-1, 1] to RGB values in [0, 1]
  return [(x + 1) / 2, (y + 1) / 2, (z + 1) / 2]
}

export function embedColors(positions, mapping = defaultColorMapping) {
  const colors = []
  for (let i = 0; i < positions.length; i += 3) {
    const [r, g, b] = mapping(positions[i], positions[i + 1], positions[i + 2])
    colors.push(r, g, b)
  }
  return colors
}
