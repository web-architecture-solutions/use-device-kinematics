import Variable from '../lib/variables/Variable'
import Position from '../lib/variables/Position'
import Acceleration from '../lib/variables/Acceleration'
import Orientation from '../lib/variables/Orientation'
import AngularVelocity from '../lib/variables/AngularVelocity'

export default class SensorData {
  #timestamp
  #previousTimestamp

  constructor(rawSensorData, previousRawSensorData, previousDerivativesWrtT, timestamp, previousTimestamp) {
    this.#timestamp = timestamp
    this.#previousTimestamp = previousTimestamp

    Object.entries(rawSensorData).forEach(([variableName, rawVariableState]) => {
      const previousRawVariableState = previousRawSensorData?.[variableName] ?? {}
      this[variableName] = this.variableFactory(
        variableName,
        rawVariableState,
        previousRawVariableState,
        Object.entries(previousDerivativesWrtT?.[variableName] ?? {})[1],
        timestamp,
        previousTimestamp
      )
    })
  }

  get timestamp() {
    return this.#timestamp
  }

  get previousTimestamp() {
    return this.#previousTimestamp
  }

  static getVariableConstructorByName(variableName) {
    return {
      position: Position,
      acceleration: Acceleration,
      orientation: Orientation,
      angularVelocity: AngularVelocity
    }[variableName]
  }

  variableFactory(variableName, rawVariableState, previousRawVariableState, previousDerivativesWrtT, timestamp, previousTimestamp) {
    const constructor = SensorData.getVariableConstructorByName(variableName)
    const initialVariableState = constructor.initial
    const currentState = { ...initialVariableState, ...rawVariableState }
    const previousState = { ...initialVariableState, ...previousRawVariableState }
    return new constructor(currentState, previousState, previousDerivativesWrtT, constructor.name, constructor, this)
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
