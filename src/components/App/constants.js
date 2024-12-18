export const camera = { position: [3, 3, 3], fov: 50 }

export const rotationCallback = ({ x, y, z }) => ({ x: x - 0.01, y: y - 0.01, z: z + 0.01 })

export const wienerProcessParameters = {
  maxPoints: 500,
  stepSize: 0.2
}

export const glitchParameters = {
  delay: 240,
  randomizeDelay: true,
  duration: 30,
  randomizeDuration: true,
  pixelizationGranularity: 100,
  randomizePixelizationGranularity: true,
  pixelizationIntensity: 0.2
}
