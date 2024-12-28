import { Effect } from 'postprocessing'

export default class GlitchEffect extends Effect {
  constructor(name, fragmentShader, options, intensity) {
    super(name, fragmentShader, options)

    this.intensity = intensity
  }

  get isGlitched() {
    return this._isGlitched && Math.random() <= this.intensity
  }

  set isGlitched(value) {
    this._isGlitched = value
  }
}
