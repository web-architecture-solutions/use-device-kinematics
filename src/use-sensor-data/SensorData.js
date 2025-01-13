import Variable from '../lib/Variable'

export default class SensorData {
  #renameMap

  constructor(renameMap) {
    this._update(SensorData.initial, renameMap)
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

  isEqual(sensorData) {
    return Object.entries(this).every(([variableName, variable]) => {
      return variable.isEqual(sensorData[variableName])
    })
  }

  get isReady() {
    return !this.isEqual(SensorData.initial)
  }

  _update(rawSensorData, renameMap) {
    Object.entries(rawSensorData).forEach(([variableName, variableData]) => {
      const initialVariableState = SensorData.initial[variableName]
      const currentState = { ...initialVariableState, ...variableData }
      const previousState = this[variableName] || initialVariableState
      const variable = new Variable(currentState, previousState)
      this[variableName] = renameMap[variableName] ? variable.renameComponents(renameMap[variableName]) : variable
    })
  }

  update(rawSensorData) {
    this._update(rawSensorData, this.#renameMap)
  }
}
