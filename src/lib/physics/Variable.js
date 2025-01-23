import { Vector3, big } from '../math'

class DifferentiationFilter {
  constructor(feedforward, feedback, sampleRate) {
    this.feedforward = feedforward
    this.feedback = feedback
    this.sampleRate = sampleRate
  }

  async calculate(current, previous) {
    const offlineContext = new OfflineAudioContext(1, 2, this.sampleRate)
    const buffer = offlineContext.createBuffer(1, 2, this.sampleRate)
    const channelData = buffer.getChannelData(0)
    channelData[0] = current
    channelData[1] = previous
    const filter = offlineContext.createIIRFilter(this.feedforward, this.feedback)
    const source = offlineContext.createBufferSource()
    source.buffer = buffer
    source.connect(filter)
    filter.connect(offlineContext.destination)
    source.start()
    const renderedBuffer = await offlineContext.startRendering()
    const output = renderedBuffer.getChannelData(0)
    return output
  }
}

export default class Variable extends Vector3 {
  #previous
  #timestamp
  #subclassConstructor
  #derivativeWrtT
  #derivativeConstructor
  #derivativeName

  static initialData = { x: null, y: null, z: null }

  static preprocess = ({ x, y, z } = { x: null, y: null, z: null }) => new Vector3(x, y, z)

  static calculateDerivativeWrtT(variable) {
    const feedforward = [1, -1]
    const feedback = [1, -1]
    const sampleRate = 44100
    const differentiationFilter = new DifferentiationFilter(feedforward, feedback, sampleRate)

    const initializeComponentDerivative = (componentValue, index) => {
      return differentiationFilter.calculate(componentValue, variable.previous[index])

      //const delta = big * componentValue - big * variable.previous[index]
      //const deltaT = big * variable.timestamp - big * variable.previous.timestamp
      //return delta / deltaT
    }
    return variable.map(initializeComponentDerivative)
  }

  static isEqual(variableData1, variableData2) {
    return variableData1.every((componentValue, index) => {
      return variableData2[index] === componentValue
    })
  }

  constructor(rawVariableData, previousVariable, subclassConstructor, timestamp) {
    super()

    this.#previous = previousVariable
    this.#subclassConstructor = subclassConstructor
    this.#derivativeConstructor = subclassConstructor?.derivative ?? null
    this.#derivativeName = this.#derivativeConstructor?.name ?? null
    this.#timestamp = timestamp ?? null

    this[0] = rawVariableData[0] ?? null
    this[1] = rawVariableData[1] ?? null
    this[2] = rawVariableData[2] ?? null

    if (previousVariable) {
      this.#previous = new this.#subclassConstructor(
        previousVariable,
        Variable.initial,
        this.#subclassConstructor,
        previousVariable?.timestamp ?? null
      )

      this.#derivativeWrtT = this.#derivativeConstructor
        ? new this.#derivativeConstructor(
            this.#subclassConstructor.calculateDerivativeWrtT(this),
            this.#previous.derivativesWrtT,
            Variable.initial,
            this.#derivativeConstructor,
            this.timestamp
          )
        : null
    }
  }

  get previous() {
    return this.#previous
  }

  get hasDerivative() {
    return this.#derivativeConstructor ? true : false
  }

  get derivativeName() {
    return this.#derivativeName
  }

  get derivativeWrtT() {
    return this.#derivativeWrtT
  }

  get timestamp() {
    return this.#timestamp
  }

  isEqual(variable) {
    return Variable.isEqual(this, variable)
  }
}
