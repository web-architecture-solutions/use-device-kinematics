export default class DifferentiationFilter {
  constructor(feedforward, feedback, sampleRate) {
    this.feedforward = feedforward
    this.feedback = feedback
    this.sampleRate = sampleRate
  }

  async calculate(current, previous) {
    const offlineContext = new OfflineAudioContext(1, 2, this.sampleRate)
    const buffer = offlineContext.createBuffer(1, 2, this.sampleRate)
    const channelData = buffer.getChannelData(0)
    channelData[0] = current
    channelData[1] = previous
    const filter = offlineContext.createIIRFilter(this.feedforward, this.feedback)
    const source = offlineContext.createBufferSource()
    source.buffer = buffer
    source.connect(filter)
    filter.connect(offlineContext.destination)
    source.start()
    const renderedBuffer = await offlineContext.startRendering()
    const output = renderedBuffer.getChannelData(0)
    return output
  }
}
