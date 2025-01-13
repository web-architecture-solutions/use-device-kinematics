import Component from './Component'

export default class VariableRecord extends Array {
  constructor(variable) {
    super()
    VariableRecord.initialize(this, variable)
  }

  static initialize(variableRecord, variable) {
    Object.entries(variable).forEach(VariableRecord.initializeComponent(variableRecord))
  }

  static initializeComponent(variableRecord) {
    return (component, index) => {
      variableRecord[index] = new Component(component /* TODO: , previousComponent */)
    }
  }

  update(variable) {
    this.forEach((component) => component.update(variable[component.name]))
  }

  isEqual(variableRecord) {
    return variableRecord.every((component, index) => {
      return component.isEqual(variableRecord[index])
    })
  }
}
