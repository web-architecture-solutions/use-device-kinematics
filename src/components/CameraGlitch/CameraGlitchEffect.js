import GlitchEffect from '../../GlitchEffect'

import fragmentShader from './fragmentShader'

export default class CameraGlitchEffect extends GlitchEffect {
  constructor({ camera, intensity }) {
    super('CameraGlitchEffect', fragmentShader)

    this.camera = camera
    this.initialPosition = camera.position.clone()
    this.intensity = intensity
  }

  glitchCamera() {
    const newPosition = this.camera.position.clone()
    newPosition.x = Math.random() > 0.5 ? newPosition.x + (Math.random() - 0.5) * 2 : newPosition.x - (Math.random() - 0.5) * 2
    newPosition.y = Math.random() > 0.5 ? newPosition.y + (Math.random() - 0.5) * 2 : newPosition.y - (Math.random() - 0.5) * 2
    newPosition.z = Math.random() > 0.5 ? newPosition.z + (Math.random() - 0.5) * 2 : newPosition.z - (Math.random() - 0.5) * 2
    this.camera.position.copy(newPosition)
  }

  resetCamera() {
    this.camera.position.copy(this.initialPosition)
  }

  update() {
    this.isGlitched ? this.glitchCamera() : this.resetCamera()
    this.camera.lookAt(0, 0, 0)
  }
}
