import Variable from '../lib/variables/Variable'
import Position from '../lib/variables/Position'
import Acceleration from '../lib/variables/Acceleration'
import Orientation from '../lib/variables/Orientation'
import AngularVelocity from '../lib/variables/AngularVelocity'

export default class SensorData {
  #deltaT

  static variables = ['position', 'orientation', 'acceleration', 'angularVelocity']

  constructor(rawSensorData, previousSensorData, deltaT) {
    this.#deltaT = deltaT

    Object.entries(rawSensorData).forEach(([variableName, variableState]) => {
      const constructor = {
        position: Position,
        acceleration: Acceleration,
        orientation: Orientation,
        angularVelocity: AngularVelocity
      }[variableName]

      const initialVariableState = constructor.initial
      const previousVariableState = previousSensorData?.[variableName]

      const currentState = { ...initialVariableState, ...variableState }
      const previousState = { ...initialVariableState, ...previousVariableState }

      this[variableName] = new constructor(currentState, previousState, deltaT, constructor.name, constructor)
    })
  }

  get deltaT() {
    return this.#deltaT
  }

  static get initial() {
    return {
      position: Position.initial,
      acceleration: Acceleration.initial,
      orientation: Orientation.initial,
      angularVelocity: AngularVelocity.initial
    }
  }

  get derivativesWrtT() {
    return Object.fromEntries(
      Object.values(this).map((variable) => [variable.name, { [variable.derivativeName]: variable.derivativesWrtT }])
    )
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
