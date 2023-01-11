/**
 * @since 1.0.0
 */

import { pipe } from "@fp-ts/data/Function"
import { PCGRandom } from "@fp-ts/data/Random"

/**
 * @since 1.0.0
 * @category models
 */
export interface Equivalence<A> {
  readonly hash: (self: A) => number
  readonly equals: (that: A) => (self: A) => boolean
}

/**
 * @since 1.0.0
 * @category constructor
 */
export const simple = <A>(equals: (that: A) => (self: A) => boolean): Equivalence<A> => ({
  hash: () => 0,
  equals
})

/**
 * @since 1.0.0
 * @category constructor
 */
export const make = <A>(
  equals: (that: A) => (self: A) => boolean,
  hash: (self: A) => number
): Equivalence<A> => ({
  hash,
  equals
})

/**
 * @since 1.0.0
 * @category hashing
 */
export const hash = {
  optimize: (n: number): number => (n & 0xbfffffff) | ((n >>> 1) & 0x40000000),
  combine: (that: number) => (self: number) => (self * 53) ^ that
}

/** @internal */
const pcgr = new PCGRandom()

const hashCache = new WeakMap<object, number>()

/**
 * @since 1.0.0
 * @category instances
 */
export const strict: <A>() => Equivalence<A> = () => ({
  hash: (self) => {
    switch (typeof self) {
      case "string": {
        return string.hash(self)
      }
      case "undefined": {
        return string.hash("undefined")
      }
      case "bigint": {
        return string.hash(self.toString(10))
      }
      case "symbol":
      case "boolean": {
        return string.hash(String(self))
      }
      case "function":
      case "object": {
        if (self === null) {
          return string.hash("null")
        }
        if (!hashCache.has(self)) {
          const h = number.hash(pcgr.integer(Number.MAX_SAFE_INTEGER))
          hashCache.set(self, h)
        }
        return hashCache.get(self)!
      }
      case "number": {
        return number.hash(self)
      }
      default: {
        return 0
      }
    }
  },
  equals: (that) => (self) => self === that
})

/**
 * @since 1.0.0
 * @category instances
 */
export const string: Equivalence<string> = {
  hash: (self) => {
    let h = 5381,
      i = self.length
    while (i) h = (h * 33) ^ self.charCodeAt(--i)
    return hash.optimize(h)
  },
  equals: (that) => (self) => self === that
}

/**
 * @since 1.0.0
 * @category instances
 */
export const number: Equivalence<number> = {
  hash: (self) => {
    if (self !== self || self === Infinity) return 0
    let h = self | 0
    if (h !== self) h ^= self * 0xffffffff
    while (self > 0xffffffff) h ^= self /= 0xffffffff
    return hash.optimize(self)
  },
  equals: (that) => (self) => self === that
}

/**
 * @since 1.0.0
 * @category instances
 */
export const bigint: Equivalence<bigint> = {
  hash: (self) => string.hash(self.toString(10)),
  equals: (that) => (self) => self === that
}

/**
 * @since 1.0.0
 * @category instances
 */
export const symbol: Equivalence<symbol> = {
  hash: (self) => string.hash(String(self)),
  equals: (that) => (self) => self === that
}

/**
 * @since 1.0.0
 * @category instances
 */
export const contramap = <A, B>(f: (self: B) => A) =>
  (self: Equivalence<A>): Equivalence<B> => ({
    hash: (_self) => self.hash(f(_self)),
    equals: (_that) => (_self) => self.equals(f(_that))(f(_self))
  })

/**
 * @since 1.0.0
 * @category instances
 */
export const tuple = <As extends ReadonlyArray<Equivalence<any>>>(
  ...as: As
): Equivalence<{ readonly [k in keyof As]: As[k] extends Equivalence<infer A> ? A : never }> => ({
  hash: (self) => {
    let h = 6151
    for (let i = 0; i < as.length; i++) {
      h = pipe(h, hash.combine(as[i].hash(self[i])))
    }
    return hash.optimize(h)
  },
  equals: (that) => (self) => as.every((eq, i) => eq.equals(that[i])(self[i]))
})

/**
 * @since 1.0.0
 * @category instances
 */
export const struct = <As extends Readonly<Record<string, Equivalence<any>>>>(
  as: As
): Equivalence<{ readonly [k in keyof As]: As[k] extends Equivalence<infer A> ? A : never }> => ({
  hash: (self) => {
    let h = 12289
    const keys = Object.keys(as)
    for (let i = 0; i < keys.length; i++) {
      h ^= pipe(string.hash(keys[i]!), hash.combine(as[keys[i]].hash(self[keys[i]])))
    }
    return hash.optimize(h)
  },
  equals: (that) => (self) => Object.keys(as).every((key) => as[key].equals(that[key])(self[key]))
})
