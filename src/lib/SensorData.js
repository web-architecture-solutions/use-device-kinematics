import Variable from './Variable'

export default class SensorData {
  constructor(rawSensorData, previousRawSensorData, renameMap) {
    Object.keys(rawSensorData).forEach((variableName) => {
      const current = rawSensorData[variableName]
      const previous = previousRawSensorData?.[variableName] ?? null
      const variable = new Variable({ ...current, previous })
      this[variableName] = renameMap[variableName] ? variable.renameComponents(renameMap[variableName]) : variable
    })
  }
}
