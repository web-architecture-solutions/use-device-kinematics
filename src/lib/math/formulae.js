export const toRadians = (degrees) => degrees * (Math.PI / 180)

export const sumSquares = (accumulator, component) => accumulator + Math.pow(component, 2)

export const euclideanNorm = (...components) => Math.sqrt(components.reduce(sumSquares, 0))
