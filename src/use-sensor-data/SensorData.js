import Variable from '../lib/Variable'

export default class SensorData {
  #renameMap

  constructor(renameMap) {
    this.#renameMap = renameMap
    this.update(SensorData.initial)
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

  isEqual(sensorData) {
    return Object.entries(this).every(([variableName, variable]) => {
      return variable.isEqual(sensorData[variableName])
    })
  }

  get isReady() {
    return !this.isEqual(SensorData.initial)
  }

  update(rawSensorData) {
    Object.entries(rawSensorData).forEach(([variableName, variableData]) => {
      const initialVariableState = SensorData.initial[variableName]
      const currentState = { ...initialVariableState, ...variableData }
      const previousState = this[variableName] || initialVariableState
      if (this[variableName]) {
        this[variableName].update(currentState, previousState)
      } else {
        this[variableName] = new Variable(currentState, previousState, this.#renameMap[variableName])
      }
    })
  }
}
