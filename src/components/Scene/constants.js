export const rotationCallback = ({ x, y, z }) => ({ x: x - 0.005, y: y - 0.005, z: z + 0.005 })

export const wienerProcessParameters = {
  maxPoints: 250,
  stepSize: 0.1
}

export const glitchParameters = {
  duration: 30,
  intensity: 0.5,
  randomizeDuration: false,
  pixelizationGranularity: 200,
  randomizePixelizationGranularity: true
}
