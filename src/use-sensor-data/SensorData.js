import Variable from '../lib/variables/Variable'
import Position from '../lib/variables/Position'
import Acceleration from '../lib/variables/Acceleration'
import Orientation from '../lib/variables/Orientation'
import AngularVelocity from '../lib/variables/AngularVelocity'

export default class SensorData {
  #renameMap
  #deltaT

  constructor(rawSensorData, previousRawSensorData, deltaT, renameMap) {
    this.#deltaT = deltaT
    this.#renameMap = renameMap

    Object.entries(rawSensorData).forEach(([variableName, variableState]) => {
      const initialVariableState = SensorData.initial[variableName]
      const previousVariableState = previousRawSensorData?.[variableName]

      const currentState = { ...initialVariableState, ...variableState }
      const previousState = { ...initialVariableState, ...previousVariableState }

      const constructor = {
        position: Position,
        acceleration: Acceleration,
        orientation: Orientation,
        angularVelocity: AngularVelocity
      }[variableName]

      this[`${variableName}Test`] = variableName
      this.foo = 'FOO'

      this[variableName] = new constructor(currentState, previousState, deltaT, this.#renameMap[variableName])
    })
  }

  get deltaT() {
    return this.#deltaT
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

  static isEqual(sensorData1, sensorData2) {
    return Object.entries(sensorData1).every(([variableName, variableData]) => {
      return Variable.isEqual(variableData, sensorData2?.[variableName])
    })
  }

  isEqual(sensorData) {
    return SensorData.isEqual(this, sensorData)
  }

  get isReady() {
    return !this.isEqual(SensorData.initial)
  }
}
