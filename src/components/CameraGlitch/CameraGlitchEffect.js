import { Effect } from 'postprocessing'

import { Uniform, Vector2, Vector4 } from 'three'

import fragmentShader from './fragmentShader'

export default class CameraGlitchEffect extends Effect {
  constructor(camera, intensity) {
    super('CameraGlitchEffect', fragmentShader, {
      uniforms: new Map([
        ['active', new Uniform()],
        ['d', new Uniform()]
      ])
    })

    this.resolution = new Vector2()

    this.camera = camera
    this.initialPosition = camera.position.clone()
    this.cameraState = 0
    this.intensity = intensity
    this._isGlitched = false
  }

  set isGlitched(value) {
    this._isGlitched = value
  }

  get isGlitched() {
    return this._isGlitched && Math.random() >= 1 - this.intensity
  }

  setSize(width, height) {
    const resolution = this.resolution
    resolution.set(width, height)
  }

  update() {
    const isGlitched = this.isGlitched
    if (isGlitched && this.cameraState === 0) {
      const newPosition = this.camera.position.clone()
      newPosition.x += (Math.random() - 0.5) * 10
      newPosition.y += (Math.random() - 0.5) * 10
      newPosition.z += (Math.random() - 0.5) * 10
      this.camera.position.copy(newPosition)
      this.camera.lookAt(0, 0, 0)
      this.cameraState = 1
    } else if (isGlitched && this.cameraState === 1) {
      this.camera.position.copy(this.initialPosition)
      this.camera.lookAt(0, 0, 0)
      this.cameraState = 0
    }
  }
}
