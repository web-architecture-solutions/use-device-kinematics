import GlitchEffect from '../../GlitchEffect'

import fragmentShader from './fragmentShader'

export default class CameraGlitchEffect extends GlitchEffect {
  constructor({ camera, intensity }) {
    super('CameraGlitchEffect', fragmentShader)

    this.camera = camera
    this.initialPosition = camera.position.clone()
    this.intensity = intensity
    this.cameraState = 0
  }

  glitchCamera() {
    const newPosition = this.camera.position.clone()
    newPosition.x = newPosition.x + 2 * (Math.random() - 0.5) * 5
    newPosition.y = newPosition.y + 2 * (Math.random() - 0.5) * 5
    newPosition.z = newPosition.z + 2 * (Math.random() - 0.5) * 5
    this.camera.position.copy(newPosition)
  }

  resetCamera() {
    this.camera.position.copy(this.initialPosition)
  }

  update() {
    if (this.isGlitched && this.cameraState === 0) {
      this.cameraState = 1
      this.glitchCamera()
    } else if (this.isGlitched) {
      this.cameraState = 0
      this.resetCamera()
    }

    this.camera.lookAt(0, 0, 0)
  }
}
