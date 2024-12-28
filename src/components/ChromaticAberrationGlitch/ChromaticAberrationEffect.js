import { Uniform, Vector2 } from 'three'

import { EffectAttribute } from 'postprocessing'

import fragmentShader from './fragmentShader'
import vertexShader from './vertexShader'

import GlitchEffect from '../../lib/GlitchEffect'

export default class ChromaticAberrationEffect extends GlitchEffect {
  constructor({ offset = new Vector2(1e-3, 5e-4), radialModulation = false, modulationOffset = 0.15, intensity = 1 } = {}) {
    super('ChromaticAberrationEffect', fragmentShader, {
      vertexShader,
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map([
        ['offset', new Uniform(offset)],
        ['modulationOffset', new Uniform(modulationOffset)]
      ])
    })
    this.radialModulation = radialModulation
    this.intensity = intensity
  }

  get offset() {
    return this.uniforms.get('offset').value
  }

  set offset(value) {
    this.uniforms.get('offset').value = value
  }

  get radialModulation() {
    return this.defines.has('RADIAL_MODULATION')
  }

  set radialModulation(value) {
    value ? this.defines.set('RADIAL_MODULATION', '1') : this.defines.delete('RADIAL_MODULATION')
    this.setChanged()
  }

  get modulationOffset() {
    return this.uniforms.get('modulationOffset').value
  }

  set modulationOffset(value) {
    this.uniforms.get('modulationOffset').value = value
  }

  getOffset() {
    return this.offset
  }

  setOffset(value) {
    this.offset = value
  }

  update() {
    this.isGlitched ? this.setOffset([2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5)]) : this.setOffset([0, 0])
  }
}
