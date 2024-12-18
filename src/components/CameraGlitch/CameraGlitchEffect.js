import { Effect } from 'postprocessing'

import fragmentShader from './fragmentShader'

export default class CameraGlitchEffect extends Effect {
  constructor(camera, intensity) {
    super('CameraGlitchEffect', fragmentShader)

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

  update() {
    const isGlitched = this.isGlitched
    if (isGlitched && this.cameraState === 0) {
      this.cameraState = 1
      const newPosition = this.camera.position.clone()
      newPosition.x += (Math.random() - 0.5) * 10
      newPosition.y += (Math.random() - 0.5) * 10
      newPosition.z += (Math.random() - 0.5) * 10
      this.camera.position.copy(newPosition)
      this.camera.lookAt(0, 0, 0)
    } else if (isGlitched && this.cameraState === 1) {
      this.cameraState = 0
      this.camera.position.copy(this.initialPosition)
      this.camera.lookAt(0, 0, 0)
    }
  }
}
