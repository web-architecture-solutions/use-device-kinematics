import { NearestFilter, RepeatWrapping, RGBAFormat, Uniform, Vector2 } from 'three'

import { GlitchMode } from 'postprocessing'

import NoiseTexture from './NoiseTexture.js'

import GlitchEffect from '../../GlitchEffect.js'

import fragmentShader from './fragmentShader.js'

const textureTag = 'Glitch.Generated'

function randomFloat(low, high) {
  return low + Math.random() * (high - low)
}

export default class DistortionGlitchEffect extends GlitchEffect {
  constructor({
    chromaticAberrationOffset = null,
    delay = new Vector2(1.5, 3.5),
    duration = new Vector2(0.6, 1.0),
    strength = new Vector2(0.3, 1.0),
    columns = 0.05,
    ratio = 0.85,
    perturbationMap = null,
    dtSize = 64
  } = {}) {
    super('GlitchEffect', fragmentShader, {
      uniforms: new Map([
        ['perturbationMap', new Uniform(null)],
        ['columns', new Uniform(columns)],
        ['active', new Uniform(false)],
        ['random', new Uniform(1.0)],
        ['seeds', new Uniform(new Vector2())],
        ['distortion', new Uniform(new Vector2())]
      ])
    })

    if (perturbationMap === null) {
      const map = new NoiseTexture(dtSize, dtSize, RGBAFormat)
      map.name = textureTag
      this.perturbationMap = map
    } else {
      this.perturbationMap = perturbationMap
    }

    this.time = 0
    this.distortion = this.uniforms.get('distortion').value
    this.delay = delay
    this.duration = duration
    this.breakPoint = new Vector2(randomFloat(this.delay.x, this.delay.y), randomFloat(this.duration.x, this.duration.y))
    this.strength = strength
    this.mode = GlitchMode.SPORADIC
    this.ratio = ratio
    this.chromaticAberrationOffset = chromaticAberrationOffset
  }

  get seeds() {
    return this.uniforms.get('seeds').value
  }

  get active() {
    return this.uniforms.get('active').value
  }

  isActive() {
    return this.active
  }

  get minDelay() {
    return this.delay.x
  }

  set minDelay(value) {
    this.delay.x = value
  }

  getMinDelay() {
    return this.delay.x
  }

  setMinDelay(value) {
    this.delay.x = value
  }

  get maxDelay() {
    return this.delay.y
  }

  set maxDelay(value) {
    this.delay.y = value
  }

  getMaxDelay() {
    return this.delay.y
  }

  setMaxDelay(value) {
    this.delay.y = value
  }

  get minDuration() {
    return this.duration.x
  }

  set minDuration(value) {
    this.duration.x = value
  }

  getMinDuration() {
    return this.duration.x
  }

  setMinDuration(value) {
    this.duration.x = value
  }

  get maxDuration() {
    return this.duration.y
  }

  set maxDuration(value) {
    this.duration.y = value
  }

  getMaxDuration() {
    return this.duration.y
  }

  setMaxDuration(value) {
    this.duration.y = value
  }

  get minStrength() {
    return this.strength.x
  }

  set minStrength(value) {
    this.strength.x = value
  }

  getMinStrength() {
    return this.strength.x
  }

  setMinStrength(value) {
    this.strength.x = value
  }

  get maxStrength() {
    return this.strength.y
  }

  set maxStrength(value) {
    this.strength.y = value
  }

  getMaxStrength() {
    return this.strength.y
  }

  setMaxStrength(value) {
    this.strength.y = value
  }

  getMode() {
    return this.mode
  }

  setMode(value) {
    this.mode = value
  }

  getGlitchRatio() {
    return 1.0 - this.ratio
  }

  setGlitchRatio(value) {
    this.ratio = Math.min(Math.max(1.0 - value, 0.0), 1.0)
  }

  get columns() {
    return this.uniforms.get('columns').value
  }

  set columns(value) {
    this.uniforms.get('columns').value = value
  }

  getGlitchColumns() {
    return this.columns
  }

  setGlitchColumns(value) {
    this.columns = value
  }

  getChromaticAberrationOffset() {
    return this.chromaticAberrationOffset
  }

  setChromaticAberrationOffset(value) {
    this.chromaticAberrationOffset = value
  }

  get perturbationMap() {
    return this.uniforms.get('perturbationMap').value
  }

  set perturbationMap(value) {
    const currentMap = this.perturbationMap

    if (currentMap !== null && currentMap.name === textureTag) {
      currentMap.dispose()
    }

    value.minFilter = value.magFilter = NearestFilter
    value.wrapS = value.wrapT = RepeatWrapping
    value.generateMipmaps = false

    this.uniforms.get('perturbationMap').value = value
  }

  getPerturbationMap() {
    return this.perturbationMap
  }

  setPerturbationMap(value) {
    this.perturbationMap = value
  }

  generatePerturbationMap(value = 64) {
    const map = new NoiseTexture(value, value, RGBAFormat)
    map.name = textureTag
    return map
  }

  update(_, __, deltaTime) {
    if (!this.isGlitched) return null
    const mode = this.mode
    const breakPoint = this.breakPoint
    const offset = this.chromaticAberrationOffset
    const s = this.strength

    let time = this.time
    let active = false
    let r = 0.0,
      a = 0.0
    let trigger

    if (mode !== GlitchMode.DISABLED) {
      if (mode === GlitchMode.SPORADIC) {
        time += deltaTime
        trigger = time > breakPoint.x

        if (time >= breakPoint.x + breakPoint.y) {
          breakPoint.set(randomFloat(this.delay.x, this.delay.y), randomFloat(this.duration.x, this.duration.y))

          time = 0
        }
      }

      r = Math.random()
      this.uniforms.get('random').value = r

      if ((trigger && r > this.ratio) || mode === GlitchMode.CONSTANT_WILD) {
        active = true

        r *= s.y * 0.03
        a = randomFloat(-Math.PI, Math.PI)

        this.seeds.set(randomFloat(-s.y, s.y), randomFloat(-s.y, s.y))
        this.distortion.set(randomFloat(0.0, 1.0), randomFloat(0.0, 1.0))
      } else if (trigger || mode === GlitchMode.CONSTANT_MILD) {
        active = true

        r *= s.x * 0.03
        a = randomFloat(-Math.PI, Math.PI)

        this.seeds.set(randomFloat(-s.x, s.x), randomFloat(-s.x, s.x))
        this.distortion.set(randomFloat(0.0, 1.0), randomFloat(0.0, 1.0))
      }

      this.time = time
    }

    if (offset !== null) {
      if (active) {
        offset.set(Math.cos(a), Math.sin(a)).multiplyScalar(r)
      } else {
        offset.set(0.0, 0.0)
      }
    }

    this.uniforms.get('active').value = active
  }

  dispose() {
    const map = this.perturbationMap

    if (map !== null && map.name === textureTag) {
      map.dispose()
    }
  }
}
