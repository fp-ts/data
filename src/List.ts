/**
 * @since 1.0.0
 */

import type { Option } from "@fp-ts/core/Option"
import type { Predicate } from "@fp-ts/core/Predicate"
import type { Refinement } from "@fp-ts/core/Refinement"
import type { Result } from "@fp-ts/core/Result"
import * as LI from "@fp-ts/data/internal/List"
import type * as L from "@fp-ts/data/List"

/**
 * @since 1.0.0
 */
export declare namespace List {
  export type Cons<A> = L.Cons<A>
  export type Nil<A> = L.Nil<A>
}

/**
 * @since 1.0.0
 *
 * @category model
 */
export interface ListBuilder<A> extends Iterable<A> {
  readonly length: number

  readonly isEmpty: () => boolean

  readonly unsafeHead: () => A

  readonly unsafeTail: () => List<A>

  readonly append: (elem: A) => ListBuilder<A>

  readonly prepend: (elem: A) => ListBuilder<A>

  readonly unprepend: (this: this) => A

  readonly build: () => List<A>

  readonly insert: (idx: number, elem: A) => ListBuilder<A>

  readonly reduce: <B>(b: B, f: (b: B, a: A) => B) => B
}

/**
 * @since 1.0.0
 * @category symbol
 */
export const ListTypeId: unique symbol = LI.ListTypeId as L.ListTypeId

/**
 * @since 1.0.0
 * @category symbol
 */
export type ListTypeId = typeof ListTypeId

/**
 * @since 1.0.0
 * @category model
 */
export interface Cons<A> extends Iterable<A> {
  readonly _typeId: ListTypeId
  readonly _tag: "Cons"
  readonly _A: (_: never) => A
  readonly head: A
  readonly tail: List<A>
}

/**
 * @since 1.0.0
 * @category model
 */
export interface Nil<A> extends Iterable<A> {
  readonly _typeId: ListTypeId
  readonly _tag: "Nil"
  readonly _A: (_: never) => A
}

/**
 * @since 1.0.0
 * @category model
 */
export type List<A> = Cons<A> | Nil<A>

/**
 * @since 1.0.0
 * @category constructors
 */
export const builder: <A>() => ListBuilder<A> = LI.builder

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: <As extends ReadonlyArray<any>>(...prefix: As) => List<As[number]> = LI.make

/**
 * @since 1.0.0
 * @category constructors
 */
export const cons: <A>(head: A, tail: List<A>) => Cons<A> = LI.cons

/**
 * @since 1.0.0
 * @category constructors
 */
export const nil: <A = never>() => Nil<A> = LI.nil

/**
 * @since 1.0.0
 * @category filtering
 */
export const drop: (n: number) => <A>(self: List<A>) => List<A> = LI.drop

/**
 * @since 1.0.0
 * @category filtering
 */
export const take: (n: number) => <A>(self: List<A>) => List<A> = LI.take

/**
 * @since 1.0.0
 * @category filtering
 */
export const filter: {
  <A, B extends A>(p: Refinement<A, B>): (self: List<A>) => List<B>
  <A>(p: Predicate<A>): (self: List<A>) => List<A>
} = LI.filter

/**
 * @since 1.0.0
 * @category refinements
 */
export const isList: {
  <A>(u: Iterable<A>): u is List<A>
  (u: unknown): u is List<unknown>
} = LI.isList

/**
 * @since 1.0.0
 * @category refinements
 */
export const isCons: <A>(self: List<A>) => self is Cons<A> = LI.isCons

/**
 * @since 1.0.0
 * @category refinements
 */
export const isNil: <A>(self: List<A>) => self is Nil<A> = LI.isNil

/**
 * @since 1.0.0
 * @category mutations
 */
export const prepend: <B>(elem: B) => <A>(self: List<A>) => Cons<A | B> = LI.prepend

/**
 * @since 1.0.0
 * @category mutations
 */
export const prependAll: <B>(prefix: List<B>) => <A>(self: List<A>) => List<A | B> = LI.prependAll

/**
 * @since 1.0.0
 * @category mutations
 */
export const concat: <B>(prefix: List<B>) => <A>(self: List<A>) => List<A | B> = LI.concat

/**
 * @since 1.0.0
 * @category mutations
 */
export const reverse: <A>(self: List<A>) => List<A> = LI.reverse

/**
 * @since 1.0.0
 * @category partitioning
 */
export const partition: <A>(
  f: Predicate<A>
) => (self: List<A>) => readonly [List<A>, List<A>] = LI.partition

/**
 * @since 1.0.0
 * @category partitioning
 */
export const partitionMap: <A, B, C>(
  f: (a: A) => Result<B, C>
) => (self: List<A>) => readonly [List<B>, List<C>] = LI.partitionMap

/**
 * @since 1.0.0
 * @category partitioning
 */
export const splitAt: (n: number) => <A>(self: List<A>) => readonly [List<A>, List<A>] = LI.splitAt

/**
 * @since 1.0.0
 * @category getters
 */
export const head: <A>(self: List<A>) => Option<A> = LI.head

/**
 * @since 1.0.0
 * @category getters
 */
export const tail: <A>(self: List<A>) => Option<List<A>> = LI.tail

/**
 * @since 1.0.0
 * @category constructors
 */
export const empty: <A = never>() => List<A> = LI.empty

/**
 * @since 1.0.0
 * @category predicates
 */
export const any: <A>(p: Predicate<A>) => (self: List<A>) => boolean = LI.any

/**
 * @since 1.0.0
 * @category predicates
 */
export const all: <A>(p: Predicate<A>) => (self: List<A>) => boolean = LI.all

/**
 * @since 1.0.0
 * @category finding
 */
export const find: {
  <A, B extends A>(p: Refinement<A, B>): (self: List<A>) => Option<B>
  <A>(p: Predicate<A>): (self: List<A>) => Option<A>
} = LI.find

/**
 * @since 1.0.0
 * @category traversing
 */
export const forEach: <A, U>(f: (a: A) => U) => (self: List<A>) => void = LI.forEach

/**
 * @since 1.0.0
 * @category sequencing
 */
export const flatMap: <A, B>(f: (a: A) => List<B>) => (self: List<A>) => List<B> = LI.flatMap

/**
 * @since 1.0.0
 * @category mapping
 */
export const map: <A, B>(f: (a: A) => B) => (self: List<A>) => List<B> = LI.map

/**
 * @since 1.0.0
 * @category conversions
 */
export const fromIterable: <A>(prefix: Iterable<A>) => List<A> = LI.from

/**
 * @since 1.0.0
 * @category folding
 */
export const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => (self: List<A>) => B = LI.reduce

/**
 * @since 1.0.0
 * @category unsafe
 */
export const headUnsafe: <A>(self: List<A>) => A = LI.unsafeHead

/**
 * @since 1.0.0
 * @category unsafe
 */
export const tailUnsafe: <A>(self: List<A>) => List<A> = LI.unsafeTail

/**
 * @since 1.0.0
 * @category unsafe
 */
export const lastUnsafe: <A>(self: List<A>) => A = LI.unsafeLast
