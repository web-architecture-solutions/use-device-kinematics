export const rotationCallback = ({ x, y, z }) => ({ x: x - 0.005, y: y - 0.005, z: z + 0.005 })

export const randomWalkParameters = {
  maxPoints: 1000,
  stepSize: 2
}

export const glitchParameters = {
  duration: 30,
  intensity: 1,
  randomizeDuration: false,
  pixelizationGranularity: 200,
  randomizePixelizationGranularity: true
}
