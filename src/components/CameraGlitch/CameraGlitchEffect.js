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
    newPosition.x = newPosition.x + (Math.random() - 0.5) * 10
    newPosition.y = newPosition.y + (Math.random() - 0.5) * 10
    newPosition.z = newPosition.z + (Math.random() - 0.5) * 10
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
