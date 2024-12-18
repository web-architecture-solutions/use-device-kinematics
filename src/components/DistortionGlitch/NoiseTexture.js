import { DataTexture, LuminanceFormat, RedFormat, RGFormat, RGBAFormat, UnsignedByteType } from 'three'

function getNoise(size, format, type) {
  const channels = new Map([
    [LuminanceFormat, 1],
    [RedFormat, 1],
    [RGFormat, 2],
    [RGBAFormat, 4]
  ])

  let data

  if (!channels.has(format)) {
    console.error('Invalid noise texture format')
  }

  if (type === UnsignedByteType) {
    data = new Uint8Array(size * channels.get(format))

    for (let i = 0, l = data.length; i < l; ++i) {
      data[i] = Math.random() * 255 + 0.5
    }
  } else {
    data = new Float32Array(size * channels.get(format))

    for (let i = 0, l = data.length; i < l; ++i) {
      data[i] = Math.random()
    }
  }

  return data
}

export default class NoiseTexture extends DataTexture {
  constructor(width, height, format = LuminanceFormat, type = UnsignedByteType) {
    super(getNoise(width * height, format, type), width, height, format, type)
    this.needsUpdate = true
  }
}
