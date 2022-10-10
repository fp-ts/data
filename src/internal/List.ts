/*
 * This file is ported from
 *
 * Scala (https://www.scala-lang.org)
 *
 * Copyright EPFL and Lightbend, Inc.
 *
 * Licensed under Apache License 2.0
 * (http://www.apache.org/licenses/LICENSE-2.0).
 */
import { pipe, unsafeCoerce } from "@fp-ts/core/Function"
import * as O from "@fp-ts/core/Option"
import type { Predicate } from "@fp-ts/core/Predicate"
import type { Refinement } from "@fp-ts/core/Refinement"
import * as R from "@fp-ts/core/Result"
import type * as L from "@fp-ts/data/List"

import type { Ord } from "@fp-ts/core/typeclasses/Ord"

export const ListTypeId: L.ListTypeId = Symbol.for("@fp-ts/data/List") as L.ListTypeId

export class ConsImpl<A> implements Iterable<A>, L.Cons<A> {
  readonly _tag = "Cons"
  readonly _A: (_: never) => A = (_) => _
  readonly _typeId: L.ListTypeId = ListTypeId
  constructor(readonly head: A, public tail: L.List<A>) {}
  [Symbol.iterator](): Iterator<A> {
    let done = false
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let these: L.List<A> = this
    return {
      next() {
        if (done) {
          return this.return!()
        }
        if (these._tag === "Nil") {
          done = true
          return this.return!()
        }
        const value: A = these.head
        these = these.tail
        return { done, value }
      },
      return(value?: unknown) {
        if (!done) {
          done = true
        }
        return { done: true, value }
      }
    }
  }
}

export class NilImpl<A> implements Iterable<A>, L.Nil<A> {
  readonly _tag = "Nil"
  readonly _A: (_: never) => A = (_) => _
  readonly _typeId: L.ListTypeId = ListTypeId;

  [Symbol.iterator](): Iterator<A> {
    return {
      next() {
        return { done: true, value: undefined }
      }
    }
  }
}

export const _Nil: L.Nil<never> = new NilImpl<never>()

export function nil<A = never>(): L.Nil<A> {
  return _Nil
}

export function cons<A>(head: A, tail: L.List<A>): L.Cons<A> {
  return new ConsImpl(head, tail)
}

export function isNil<A>(self: L.List<A>): self is L.Nil<A> {
  return self._tag === "Nil"
}

export function isCons<A>(self: L.List<A>): self is L.Cons<A> {
  return self._tag === "Cons"
}

export function length<A>(self: L.List<A>): number {
  let these = self
  let len = 0
  while (!isNil(these)) {
    len += 1
    these = these.tail
  }
  return len
}

export function equalsWith<A, B>(
  that: L.List<B>,
  f: (a: A, b: B) => boolean
) {
  return (self: L.List<A>): boolean => {
    if ((self as L.List<A | B>) === that) {
      return true
    } else if (length(self) !== length(that)) {
      return false
    } else {
      const i0 = self[Symbol.iterator]()
      const i1 = that[Symbol.iterator]()
      let a: IteratorResult<A>
      let b: IteratorResult<B>
      while (!(a = i0.next()).done && !(b = i1.next()).done) {
        if (!f(a.value, b.value)) {
          return false
        }
      }
      return true
    }
  }
}

export function isList<A>(u: Iterable<A>): u is L.List<A>
export function isList(u: unknown): u is L.List<unknown>
export function isList(u: unknown): u is L.List<unknown> {
  return typeof u === "object" && u != null && ListTypeId in u
}

export function reduce<A, B>(b: B, f: (b: B, a: A) => B): (self: L.List<A>) => B {
  return (self) => {
    let acc = b
    let these = self
    while (!isNil(these)) {
      acc = f(acc, these.head)
      these = these.tail
    }
    return acc
  }
}

export function unsafeHead<A>(self: L.List<A>): A {
  if (isNil(self)) {
    throw new Error("Expected List to be not empty")
  }
  return self.head
}

export function unsafeTail<A>(self: L.List<A>): L.List<A> {
  if (isNil(self)) {
    throw new Error("Expected List to be not empty")
  }
  return self.tail
}

export function drop(n: number) {
  return <A>(self: L.List<A>): L.List<A> => {
    if (n <= 0) {
      return self
    }

    if (n >= length(self)) {
      return nil<A>()
    }

    let these = self

    let i = 0
    while (!isNil(these) && i < n) {
      these = these.tail

      i += 1
    }

    return these
  }
}

export function take(n: number) {
  return <A>(self: L.List<A>): L.List<A> => {
    if (n <= 0) {
      return self
    }

    if (n >= length(self)) {
      return self
    }

    let these = make(unsafeHead(self))

    let i = 0
    while (!isNil(these) && i < n) {
      these = pipe(these, prependAll(make(unsafeHead(self))))

      i += 1
    }

    return these
  }
}

export function prependAll<B>(prefix: L.List<B>) {
  return <A>(self: L.List<A>): L.List<A | B> => {
    if (isNil(self)) {
      return prefix
    } else if (isNil(prefix)) {
      return self
    } else {
      const result = new ConsImpl<A | B>(prefix.head, self)
      let curr = result
      let that = prefix.tail
      while (!isNil(that)) {
        const temp = new ConsImpl<A | B>(that.head, self)
        curr.tail = temp
        curr = temp
        that = that.tail
      }
      return result
    }
  }
}

export function concat<B>(that: L.List<B>) {
  return <A>(self: L.List<A>): L.List<A | B> => pipe(that, prependAll(self))
}

export function empty<A = never>(): L.List<A> {
  return nil()
}

export function any<A>(p: Predicate<A>) {
  return (self: L.List<A>): boolean => {
    let these = self
    while (!isNil(these)) {
      if (p(these.head)) {
        return true
      }
      these = these.tail
    }
    return false
  }
}

export function filter<A, B extends A>(p: Refinement<A, B>): (self: L.List<A>) => L.List<B>
export function filter<A>(p: Predicate<A>): (self: L.List<A>) => L.List<A>
export function filter<A>(p: Predicate<A>) {
  return (self: L.List<A>): L.List<A> => filterCommon_(self, p, false)
}

function noneIn<A>(l: L.List<A>, p: Predicate<A>, isFlipped: boolean): L.List<A> {
  /* eslint-disable no-constant-condition */
  while (true) {
    if (isNil(l)) {
      return nil()
    } else {
      if (p(l.head) !== isFlipped) {
        return allIn(l, l.tail, p, isFlipped)
      } else {
        l = l.tail
      }
    }
  }
}

function allIn<A>(
  start: L.List<A>,
  remaining: L.List<A>,
  p: Predicate<A>,
  isFlipped: boolean
): L.List<A> {
  /* eslint-disable no-constant-condition */
  while (true) {
    if (isNil(remaining)) {
      return start
    } else {
      if (p(remaining.head) !== isFlipped) {
        remaining = remaining.tail
      } else {
        return partialFill(start, remaining, p, isFlipped)
      }
    }
  }
}

function partialFill<A>(
  origStart: L.List<A>,
  firstMiss: L.List<A>,
  p: Predicate<A>,
  isFlipped: boolean
): L.List<A> {
  const newHead = new ConsImpl<A>(unsafeHead(origStart)!, nil())
  let toProcess = unsafeTail(origStart)! as L.Cons<A>
  let currentLast = newHead

  while (!(toProcess === firstMiss)) {
    const newElem = new ConsImpl(unsafeHead(toProcess)!, nil())
    currentLast.tail = newElem
    currentLast = unsafeCoerce(newElem)
    toProcess = unsafeCoerce(toProcess.tail)
  }

  let next = firstMiss.tail
  let nextToCopy: L.Cons<A> = unsafeCoerce(next)
  while (!isNil(next)) {
    const head = unsafeHead(next)!
    if (p(head) !== isFlipped) {
      next = next.tail
    } else {
      while (!(nextToCopy === next)) {
        const newElem = cons(unsafeHead(nextToCopy)!, nil())
        currentLast.tail = newElem
        currentLast = newElem
        nextToCopy = unsafeCoerce(nextToCopy.tail)
      }
      nextToCopy = unsafeCoerce(next.tail)
      next = next.tail
    }
  }

  if (!isNil(nextToCopy)) {
    currentLast.tail = nextToCopy
  }

  return newHead
}

function filterCommon_<A>(list: L.List<A>, p: Predicate<A>, isFlipped: boolean): L.List<A> {
  return noneIn(list, p, isFlipped)
}

export function find<A, B extends A>(p: Refinement<A, B>): (self: L.List<A>) => O.Option<B>
export function find<A>(p: Predicate<A>): (self: L.List<A>) => O.Option<A>
export function find<A>(p: Predicate<A>) {
  return (self: L.List<A>): O.Option<A> => {
    let these = self
    while (!isNil(these)) {
      if (p(these.head)) {
        return O.some(these.head)
      }
      these = these.tail
    }
    return O.none
  }
}

export function flatMap<A, B>(f: (a: A) => L.List<B>) {
  return (self: L.List<A>): L.List<B> => {
    let rest = self
    let h: ConsImpl<B> | undefined = undefined
    let t: ConsImpl<B> | undefined = undefined
    while (!isNil(rest)) {
      let bs = f(rest.head)
      while (!isNil(bs)) {
        const nx = new ConsImpl(bs.head, nil())
        if (t === undefined) {
          h = nx
        } else {
          t.tail = nx
        }
        t = nx
        bs = bs.tail
      }
      rest = rest.tail
    }
    if (h === undefined) return nil()
    else return h
  }
}

export function all<A>(f: Predicate<A>) {
  return (self: L.List<A>): boolean => {
    for (const a of self) {
      if (!f(a)) {
        return false
      }
    }
    return true
  }
}

export function forEach<A, U>(f: (a: A) => U) {
  return (self: L.List<A>): void => {
    let these = self
    while (!isNil(these)) {
      f(these.head)
      these = these.tail
    }
  }
}

export function from<A>(prefix: Iterable<A>): L.List<A> {
  const iter = prefix[Symbol.iterator]()
  let a: IteratorResult<A>
  if (!(a = iter.next()).done) {
    const result = new ConsImpl(a.value, nil())
    let curr = result
    while (!(a = iter.next()).done) {
      const temp = new ConsImpl(a.value, nil())
      curr.tail = temp
      curr = temp
    }
    return result
  } else {
    return nil()
  }
}

export function make<As extends ReadonlyArray<any>>(...prefix: As): L.List<As[number]> {
  return from(prefix)
}

export function head<A>(self: L.List<A>): O.Option<A> {
  return isNil(self) ? O.none : O.some(self.head)
}

export function last<A>(self: L.List<A>): O.Option<A> {
  return isNil(self) ? O.none : O.some(unsafeLast(self)!)
}

export function unsafeLast<A>(self: L.List<A>): A {
  if (isNil(self)) {
    throw new Error("Expected List to be not empty")
  }
  let these = self
  let scout = self.tail
  while (!isNil(scout)) {
    these = scout
    scout = scout.tail
  }
  return these.head
}

export function map<A, B>(f: (a: A) => B) {
  return (self: L.List<A>): L.List<B> => {
    if (isNil(self)) {
      return self as unknown as L.List<B>
    } else {
      const h = new ConsImpl(f(self.head), nil())
      let t = h
      let rest = self.tail
      while (!isNil(rest)) {
        const nx = new ConsImpl(f(rest.head), nil())
        t.tail = nx
        t = nx
        rest = rest.tail
      }
      return h
    }
  }
}

export function partition<A>(f: Predicate<A>) {
  return (self: L.List<A>): readonly [L.List<A>, L.List<A>] => {
    const left: Array<A> = []
    const right: Array<A> = []
    for (const a of self) {
      if (f(a)) {
        right.push(a)
      } else {
        left.push(a)
      }
    }
    return [from(left), from(right)]
  }
}

export function partitionMap<A, B, C>(f: (a: A) => R.Result<B, C>) {
  return (self: L.List<A>): readonly [L.List<B>, L.List<C>] => {
    const left: Array<B> = []
    const right: Array<C> = []
    for (const a of self) {
      const e = f(a)
      if (R.isFailure(e)) {
        left.push(e.failure)
      } else {
        right.push(e.success)
      }
    }
    return [from(left), from(right)]
  }
}

export function prepend<B>(elem: B) {
  return <A>(self: L.List<A>): L.Cons<A | B> => cons<A | B>(elem, self)
}

export function reverse<A>(self: L.List<A>): L.List<A> {
  let result = empty<A>()
  let these = self
  while (!isNil(these)) {
    result = pipe(result, prepend(these.head))
    these = these.tail
  }
  return result
}

export function splitAt(n: number) {
  return <A>(self: L.List<A>): readonly [L.List<A>, L.List<A>] => [take(n)(self), drop(n)(self)]
}

export function tail<A>(self: L.List<A>): O.Option<L.List<A>> {
  return isNil(self) ? O.none : O.some(self.tail)
}

export function sortWith<A>(ord: Ord<A>) {
  return (self: L.List<A>): L.List<A> => {
    const len = length(self)
    const b = new ListBuilder<A>()
    if (len === 1) {
      b.append(unsafeHead(self)!)
    } else if (len > 1) {
      const arr = new Array<[number, A]>(len)
      copyToArrayWithIndex(self, arr)
      arr.sort(([i, x], [j, y]) => {
        const c = ord.compare(y)(x)
        return c !== 0 ? c : i < j ? -1 : 1
      })
      for (let i = 0; i < len; i++) {
        b.append(arr[i]![1])
      }
    }
    return b.build()
  }
}

function copyToArrayWithIndex<A>(list: L.List<A>, arr: Array<[number, A]>): void {
  let these = list
  let i = 0
  while (!isNil(these)) {
    arr[i] = [i, these.head]
    these = these.tail
    i++
  }
}

export class ListBuilder<A> implements L.ListBuilder<A> {
  private first: L.List<A> = nil()
  private last0: ConsImpl<A> | undefined = undefined
  private len = 0;

  [Symbol.iterator](): Iterator<A> {
    return this.first[Symbol.iterator]()
  }

  get length(): number {
    return this.len
  }

  isEmpty = (): boolean => {
    return this.len === 0
  }

  unsafeHead = (): A => {
    if (this.isEmpty()) {
      throw new Error("Expected ListBuilder to be not empty")
    }
    return (this.first as L.Cons<A>).head
  }

  unsafeTail = (): L.List<A> => {
    if (this.isEmpty()) {
      throw new Error("Expected ListBuilder to be not empty")
    }
    return (this.first as L.Cons<A>).tail
  }

  append = (elem: A): ListBuilder<A> => {
    const last1 = new ConsImpl(elem, nil())
    if (this.len === 0) {
      this.first = last1
    } else {
      this.last0!.tail = last1
    }
    this.last0 = last1
    this.len += 1
    return this
  }

  prepend = (elem: A): ListBuilder<A> => {
    this.insert(0, elem)
    return this
  }

  unprepend = (): A => {
    if (this.isEmpty()) {
      throw new Error("no such element")
    }
    const h = (this.first as L.Cons<A>).head
    this.first = (this.first as L.Cons<A>).tail
    this.len -= 1
    return h
  }

  build = (): L.List<A> => {
    return this.first
  }

  insert = (idx: number, elem: A): ListBuilder<A> => {
    if (idx < 0 || idx > this.len) {
      throw new Error(`Index ${idx} out of bounds ${0} ${this.len - 1}`)
    }
    if (idx === this.len) {
      this.append(elem)
    } else {
      const p = this.locate(idx)
      const nx = cons(elem, this.getNext(p))
      if (p === undefined) {
        this.first = nx
      } else {
        ;(p as ConsImpl<A>).tail = nx
      }
      this.len += 1
    }
    return this
  }

  reduce = <B>(b: B, f: (b: B, a: A) => B): B => {
    return reduce(b, f)(this.first)
  }

  private getNext(p: L.List<A> | undefined): L.List<A> {
    if (p === undefined) {
      return this.first
    } else {
      return unsafeTail(p)!
    }
  }

  private locate(i: number): L.List<A> | undefined {
    if (i === 0) {
      return undefined
    } else if (i === this.len) {
      return this.last0
    } else {
      let p = this.first
      for (let j = i - 1; j > 0; j--) {
        p = unsafeTail(p)!
      }
      return p
    }
  }
}

export function builder<A>(): ListBuilder<A> {
  return new ListBuilder()
}
