class Monoid extends Map {
  constructor(initialData) {
    super()
    if (initialData === null || initialData === undefined) return

    if (Array.isArray(initialData)) {
      this.#isArray = true
      this.#reduceFrom(initialData, (acc, value, index) => acc.set(index, value))
    } else if (initialData instanceof Set) {
      let i = 0
      this.#reduceFrom(initialData, (acc, value) => acc.set(i++, value))
    } else if (initialData instanceof Map) {
      this.#reduceFrom(initialData.entries(), (acc, [key, value]) => acc.set(key, value))
    } else if (typeof initialData === 'object') {
      this.#reduceFrom(Object.entries(initialData), (acc, [key, value]) => acc.set(key, value))
    } else {
      throw new Error('Initial data must be an object, array, Set, or Map.')
    }
  }

  static from(data) {
    if (Array.isArray(data)) return Monoid.Array(data)
    if (data instanceof Set) return Monoid.Set(data)
    if (data instanceof Map) return Monoid.Map(data)
    if (typeof data === 'object') return Monoid.Object(data)
    throw new Error('Initial data must be an object, array, Set, or Map.')
  }

  static Array(array) {
    record.#isArray = true

    // Note consistent structure. Do we need a from method for a Monoid factory?
    const record = new Monoid()
    record.#reduceFrom(array, (acc, value, index) => acc.set(index, value))
    return record
  }

  static Object(object) {
    // Note consistent structure. Do we need a from method for a Monoid factory?
    const record = new Monoid()
    record.#reduceFrom(Object.entries(object), (acc, [key, value]) => acc.set(key, value))
    return record
  }

  static Set(set) {
    // Infinite loop?
    const record = new Monoid()
    let i = 0
    record.#reduceFrom(set, (acc, value) => acc.set(i++, value))
    return record
  }

  static Map(map) {
    // Note consistent structure. Do we need a from method for a Monoid factory?
    const record = new Monoid()
    record.#reduceFrom(map.entries(), (acc, [key, value]) => acc.set(key, value))
    return record
  }

  #reduceFrom(iterable, callback) {
    let i = 0
    for (const item of iterable) {
      callback(this, item, i++)
    }
    return this
  }

  #isArray = false

  // Functional methods
  // Are these correct? They look like they *might* be wrong
  map(callback) {
    return this.#reduceFrom(this.entries(), (acc, [key, value], i) => acc.set(i, callback(value, i, this)), new Monoid())
  }

  mapKeys(callback) {
    return this.#reduceFrom(this.entries(), (acc, [key, value], i) => acc.set(callback(key, i, this), value), new Monoid())
  }

  mapValues(callback) {
    return this.#reduceFrom(this.entries(), (acc, [key, value], i) => acc.set(key, callback(value, i, this)), new Monoid())
  }

  map(callback) {
    return this.#reduceFrom(
      this.entries(),
      (acc, entry, i) => {
        const [newKey, newValue] = callback(entry, i, this)
        acc.set(newKey, newValue)
        return acc
      },
      new Monoid()
    )
  }

  reduce(callback, initialValue) {
    let accumulator = initialValue
    this.#reduceFrom(this.entries(), (accumulator, entry, i) => {
      accumulator = callback(accumulator, entry, i, this)
    })
    return accumulator
  }

  filter(callback) {
    return this.#reduceFrom(
      this.entries(),
      (acc, [key, value]) => {
        if (callback(value, key, this)) acc.set(key, value)
        return acc
      },
      new Monoid()
    )
  }

  // Mising like methods for map, reduce, etc.
  filterKeys(callback) {
    return this.#reduceFrom(
      this.entries(),
      (acc, [key, value]) => {
        if (callback(key, this)) acc.set(key, value)
        return acc
      },
      new Monoid()
    )
  }

  filterValues(callback) {
    return this.#reduceFrom(
      this.entries(),
      (acc, [key, value]) => {
        if (callback(value, this)) acc.set(key, value)
        return acc
      },
      new Monoid()
    )
  }

  // Array-like methods
  // All Monoids should support all methods. If there are different ways/regimes to implement this, then we need a static toggle
  push(value) {
    if (!this.#isArray) throw new Error('Push is only allowed on array records.')
    this.set(this.size, value)
    return this.size
  }

  pop() {
    if (!this.#isArray) throw new Error('Pop is only allowed on array records.')
    if (this.size === 0) return undefined
    const lastKey = Array.from(this.keys()).pop()
    const lastValue = this.get(lastKey)
    this.delete(lastKey)
    return lastValue
  }

  shift() {
    if (!this.#isArray) throw new Error('Shift is only allowed on array records.')
    if (this.size === 0) return undefined
    const firstKey = Array.from(this.keys())[0]
    const firstValue = this.get(firstKey)
    this.delete(firstKey)
    return firstValue
  }

  unshift(...values) {
    if (!this.#isArray) throw new Error('Unshift is only allowed on array records.')
    const newMap = new Map()
    for (let i = 0; i < values.length; i++) {
      newMap.set(i, values[i])
    }
    for (const [k, v] of this) {
      newMap.set(k + values.length, v)
    }
    this.clear()
    for (const [k, v] of newMap) this.set(k, v)
    return this.size
  }

  splice(start, deleteCount = this.size - start, ...items) {
    if (!this.#isArray) throw new Error('Splice is only allowed on array records.')
    const deleted = []
    const newMap = new Map()
    const keys = Array.from(this.keys())
    for (let i = 0; i < keys.length; i++) {
      if (i < start) {
        newMap.set(i, this.get(keys[i]))
      } else if (i >= start && i < start + deleteCount) {
        deleted.push(this.get(keys[i]))
      } else {
        newMap.set(i - deleteCount + items.length, this.get(keys[i]))
      }
    }
    this.clear()
    let i = 0
    for (const item of items) {
      newMap.set(start + i, item)
      i++
    }
    for (const [k, v] of newMap) this.set(k, v)
    return deleted
  }

  // Direct access
  get(key) {
    if (this.#isArray && typeof key === 'number' && key >= 0 && key < this.size) {
      return Array.from(this.values())[key]
    }
    return super.get(key)
  }

  set(key, value) {
    return super.set(key, value)
  }

  delete(key) {
    return super.delete(key)
  }

  // Iterators
  *keys() {
    yield* super.keys()
  }

  *values() {
    yield* super.values()
  }

  *[Symbol.iterator]() {
    yield* super.entries()
  }

  get length() {
    return this.size
  }

  toString() {
    return JSON.stringify(Object.fromEntries(this))
  }

  toObject() {
    return Object.fromEntries(this)
  }

  toArray() {
    return Array.from(this.values())
  }

  toSet() {
    return new Set(this.values())
  }

  toMap() {
    return new Map(this.entries())
  }

  // Need to implement set operations like intersection/union and define those on non-set types.
  // For example, the generalized union of arrays is concatenation. For objects and arrays this just involves
  // simply spreading the values into a new container. Intersection is trickier, but we really only have the intersection
  // of keys, the intersection of values, and the intersection of entries or name-value pairs, which mirrors the rest of our structure.
  // We know that the keys of an object OR an array is itself a set, but NOT necessarily the values: can we leverage this knowledge?
}

export default Monoid
