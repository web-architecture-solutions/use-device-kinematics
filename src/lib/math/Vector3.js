export default class Vector3 extends Array {
  constructor(x, y, z) {
    super()

    this[0] = x
    this[1] = y
    this[2] = z
  }

  get x() {
    return this[0]
  }

  get y() {
    return this[1]
  }

  get z() {
    return this[2]
  }

  cross(v) {
    return new Vector3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x)
  }

  scale(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar)
  }

  add(v) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
  }

  subtract(v) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2)
  }

  normalize() {
    const magnitude = this.magnitude()
    return magnitude === 0 ? new Vector3(0, 0, 0) : this.scale(1 / mag)
  }

  toArray() {
    return [this.x, this.y, this.z]
  }
}
