import Variable from './Variable'

export default class SensorData {
  #renameMap

  constructor(renameMap) {
    this._update(SensorData.initial, SensorData.initial, renameMap)
    this.#renameMap = renameMap
  }

  static get initial() {
    return {
      position: {
        latitude: null,
        longitude: null,
        altitude: null
      },
      acceleration: {
        x: null,
        y: null,
        z: null
      },
      orientation: {
        alpha: null,
        beta: null,
        gamma: null
      },
      angularVelocity: {
        alpha: null,
        beta: null,
        gamma: null
      }
    }
  }

  static isEqual(current, newValue) {
    return Object.entries(current).every(([variableName, variableValue]) => {
      return newValue[variableName] === variableValue
    })
  }

  // TODO: Can we simplify and refactor this step?
  static preprocess(rawSensorData) {
    return Object.fromEntries(
      Object.entries(SensorData.initial).map(([variableName, initialVariableData]) => {
        return [
          variableName,
          Object.fromEntries(
            Object.entries(initialVariableData).map(([componentName, initialComponentValue]) => {
              return [componentName, rawSensorData[variableName]?.[componentName] ?? initialComponentValue]
            })
          )
        ]
      })
    )
  }

  _update(rawSensorData, previousRawSensorData, renameMap) {
    Object.keys(rawSensorData).forEach((variableName) => {
      const current = rawSensorData[variableName]
      const previous = previousRawSensorData?.[variableName] ?? null
      const variable = new Variable(current, previous)
      this[variableName] = renameMap[variableName] ? variable.renameComponents(renameMap[variableName]) : variable
    })
  }

  update(rawSensorData, previousRawSensorData) {
    this._update(rawSensorData, previousRawSensorData, this.#renameMap)
  }
}
