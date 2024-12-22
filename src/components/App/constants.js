export const camera = { position: [3, 3, 3], fov: 50 }

export const rotationCallback = ({ x, y, z }) => ({ x: x - 0.01, y: y - 0.01, z: z + 0.01 })

export const wienerProcessParameters = {
  maxPoints: 500,
  stepSize: 0.1
}

export const glitchParameters = {
  duration: 60,
  intensity: 0.5,
  randomizeDuration: true,
  pixelizationGranularity: 100,
  randomizePixelizationGranularity: true
}
