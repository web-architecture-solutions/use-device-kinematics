export default class Random {
  static inverseNormalCDF(u) {
    if (u <= 0.0 || u >= 1.0) {
      throw new Error('Input must be in the range (0, 1)')
    }
    const a1 = -39.6968302866538,
      a2 = 220.946098424521,
      a3 = -275.928510446969
    const a4 = 138.357751867269,
      a5 = -30.6647980661472,
      a6 = 2.50662827745924
    const b1 = -54.4760987982241,
      b2 = 161.585836858041,
      b3 = -155.698979859887
    const b4 = 66.8013118877197,
      b5 = -13.2806815528857
    const c1 = -0.00778489400243029,
      c2 = -0.322396458041136,
      c3 = -2.40075827716184
    const c4 = -2.54973253934373,
      c5 = 4.37466414146497,
      c6 = 2.93816398269878
    const d1 = 0.00778469570904146,
      d2 = 0.32246712907004,
      d3 = 2.445134137143
    const d4 = 3.75440866190742

    const pLow = 0.02425
    const pHigh = 1 - pLow

    let q, r
    if (u < pLow) {
      q = Math.sqrt(-2 * Math.log(u))
      return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    } else if (u <= pHigh) {
      q = u - 0.5
      r = q * q
      return ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
    } else {
      q = Math.sqrt(-2 * Math.log(1 - u))
      return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    }
  }

  static truncatedGaussian(min, max, mean = 0, stdDev = 1) {
    if (min >= max) throw new Error('Min must be less than max.')
    let u = Random.uniform()
    let p = u * (Random.cdf(max, mean, stdDev) - Random.cdf(min, mean, stdDev)) + Random.cdf(min, mean, stdDev)
    let truncatedValue = Random.inverseNormalCDF(p) * stdDev + mean
    return truncatedValue
  }

  static cdf(x, mean, stdDev) {
    return 0.5 * (1 + Random.erf((x - mean) / (stdDev * Math.sqrt(2))))
  }

  static erf(x) {
    var sign = x >= 0 ? 1 : -1
    x = Math.abs(x)

    var a1 = 0.254829592
    var a2 = -0.284496736
    var a3 = 1.421413741
    var a4 = -1.453152027
    var a5 = 1.061405429
    var p = 0.3275911

    var t = 1.0 / (1.0 + p * x)
    var y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
    return sign * y
  }

  static uniform() {
    return Math.random()
  }

  static uniformOnInterval(min, max) {
    return Math.random() * (max - min) + min
  }

  static boxMuller() {
    let u = 1 - Random.uniform()
    let v = Random.uniform()
    let z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    let z1 = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v)
    return [z0, z1]
  }

  static gaussian(mean = 0, stdev = 1) {
    const z = Random.boxMuller()[0]
    return z * stdev + mean
  }

  static mixture(mixtureProbability, min, max, truncatedMean = 0, truncatedStdDev = 1) {
    if (mixtureProbability < 0 || mixtureProbability > 1) {
      throw new Error('Mixture probability must be between 0 and 1.')
    }

    return Random.uniform() < mixtureProbability
      ? Random.truncatedGaussian(min, max, truncatedMean, truncatedStdDev)
      : Random.uniformOnInterval(min, max)
  }
}
