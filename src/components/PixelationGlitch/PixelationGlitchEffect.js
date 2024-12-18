import { Uniform, Vector2, Vector4 } from 'three'

import fragmentShader from './fragmentShader'

import GlitchEffect from '../../GlitchEffect'

export default class PixelationGlitchEffect extends GlitchEffect {
  constructor({ granularity = 30.0, randomizeGranularity, intensity = 1 }) {
    super('PixelationGlitchEffect', fragmentShader, {
      uniforms: new Map([
        ['active', new Uniform(false)],
        ['d', new Uniform(new Vector4())]
      ])
    })

    this.resolution = new Vector2()

    this.randomizeGranularity = randomizeGranularity

    this.maxGranularity = granularity
    this._granularity = 0
    this.granularity = 0

    this.intensity = intensity
  }

  get granularity() {
    return this._granularity
  }

  set granularity(value) {
    let d = Math.floor(value)

    if (d % 2 > 0) {
      d += 1
    }

    this._granularity = d
    this.uniforms.get('active').value = d > 0
    this.setSize(this.resolution.width, this.resolution.height)
  }

  getGranularity() {
    return this.granularity
  }

  setGranularity(value) {
    this.granularity = value
  }

  update() {
    if (this.isGlitched) {
      this.setGranularity(this.randomizeGranularity ? Math.random() * this.maxGranularity : this.maxGranularity)
    } else {
      this.setGranularity(0)
    }
  }

  setSize(width, height) {
    const resolution = this.resolution
    resolution.set(width, height)

    const x = this.granularity / resolution.x
    const y = this.granularity / resolution.y
    this.uniforms.get('d').value.set(x, y, 1.0 / x, 1.0 / y)
  }
}
