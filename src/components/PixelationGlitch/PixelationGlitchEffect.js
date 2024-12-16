import { Uniform, Vector2, Vector4 } from 'three'

import { Effect } from 'postprocessing'

const fragmentShader = `
  uniform bool active;
  uniform vec4 d;

  void mainUv(inout vec2 uv) {
    if(active) {
      uv = d.xy * (floor(uv * d.zw) + 0.5);
    }
  }
`

export default class PixelationGlitchEffect extends Effect {
  constructor(maxGranularity = 30.0, intensity = 1, duration = 30, delay = 30, camera) {
    super('PixelationGlitchEffect', fragmentShader, {
      uniforms: new Map([
        ['active', new Uniform(false)],
        ['d', new Uniform(new Vector4())]
      ])
    })

    this.resolution = new Vector2()

    this.maxGranularity = maxGranularity
    this._granularity = 0
    this.granularity = 0

    this.intensity = intensity

    this._duration = duration
    this.duration = duration

    this._delay = delay
    this.delay = delay

    this.initialPosition = camera.position.clone()
    this.camera = camera

    this.cameraState = 0
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
    if (this.delay > 0) {
      this.delay -= 1
    } else if (this.duration > 0) {
      if (Math.random() >= 1 - this.intensity) {
        if (this.cameraState === 0) {
          this.cameraState = 1

          this.setGranularity(Math.random() * this.maxGranularity)

          const newPosition = this.camera.position.clone()
          newPosition.x += (Math.random() - 0.5) * 10
          newPosition.y += (Math.random() - 0.5) * 10
          newPosition.z += (Math.random() - 0.5) * 10

          this.camera.position.copy(newPosition)

          this.camera.lookAt(0, 0, 0)
        } else {
          this.cameraState = 0

          this.camera.position.copy(this.initialPosition)
          this.camera.lookAt(0, 0, 0)
        }
      }

      this.duration -= 1
    } else {
      this.setGranularity(0)

      this.duration = this._duration * Math.random()
      this.delay = this._delay * Math.random()
    }
  }

  setSize(width, height) {
    const resolution = this.resolution
    resolution.set(width, height)

    const d = this.granularity
    const x = d / resolution.x
    const y = d / resolution.y
    this.uniforms.get('d').value.set(x, y, 1.0 / x, 1.0 / y)
  }
}
