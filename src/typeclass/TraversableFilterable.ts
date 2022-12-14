/**
 * `TraversableFilterable` represents data structures which can be _partitioned_ with effects in some `Applicative` functor.
 *
 * @since 1.0.0
 */
import type { Kind, TypeClass, TypeLambda } from "@fp-ts/core/HKT"
import type { Applicative } from "@fp-ts/core/typeclass/Applicative"
import type { Covariant } from "@fp-ts/core/typeclass/Covariant"
import type { Traversable } from "@fp-ts/core/typeclass/Traversable"
import type { Either } from "@fp-ts/data/Either"
import * as E from "@fp-ts/data/Either"
import { pipe } from "@fp-ts/data/Function"
import type { Option } from "@fp-ts/data/Option"
import * as O from "@fp-ts/data/Option"
import * as compactable from "@fp-ts/data/typeclass/Compactable"
import type { Compactable } from "@fp-ts/data/typeclass/Compactable"

/**
 * @category models
 * @since 1.0.0
 */
export interface TraversableFilterable<T extends TypeLambda> extends TypeClass<T> {
  readonly traversePartitionMap: <F extends TypeLambda>(
    F: Applicative<F>
  ) => <A, R, O, E, B, C>(
    f: (a: A) => Kind<F, R, O, E, Either<B, C>>
  ) => <TR, TO, TE>(
    self: Kind<T, TR, TO, TE, A>
  ) => Kind<F, R, O, E, readonly [Kind<T, TR, TO, TE, B>, Kind<T, TR, TO, TE, C>]>

  readonly traverseFilterMap: <F extends TypeLambda>(
    F: Applicative<F>
  ) => <A, R, O, E, B>(
    f: (a: A) => Kind<F, R, O, E, Option<B>>
  ) => <TR, TO, TE>(
    self: Kind<T, TR, TO, TE, A>
  ) => Kind<F, R, O, E, Kind<T, TR, TO, TE, B>>
}

/**
 * Returns a default `traversePartitionMap` implementation.
 *
 * @since 1.0.0
 */
export const traversePartitionMap = <T extends TypeLambda>(
  T: Traversable<T> & Covariant<T> & Compactable<T>
): TraversableFilterable<T>["traversePartitionMap"] =>
  (F) =>
    (f) =>
      (ta) =>
        pipe(
          ta,
          T.traverse(F)(f),
          F.map(compactable.separate(T))
        )

/**
 * Returns a default `traverseFilterMap` implementation.
 *
 * @since 1.0.0
 */
export const traverseFilterMap = <T extends TypeLambda>(
  T: Traversable<T> & Compactable<T>
): TraversableFilterable<T>["traverseFilterMap"] =>
  (F) => (f) => (ta) => pipe(ta, T.traverse(F)(f), F.map(T.compact))

/**
 * @since 1.0.0
 */
export const traverseFilter = <T extends TypeLambda>(
  T: TraversableFilterable<T>
) =>
  <F extends TypeLambda>(
    F: Applicative<F>
  ): (<B extends A, R, O, E, A = B>(
    predicate: (a: A) => Kind<F, R, O, E, boolean>
  ) => <TR, TO, TE>(
    self: Kind<T, TR, TO, TE, B>
  ) => Kind<F, R, O, E, Kind<T, TR, TO, TE, B>>) =>
    (predicate) =>
      T.traverseFilterMap(F)((b) =>
        pipe(
          predicate(b),
          F.map((keep) => (keep ? O.some(b) : O.none))
        )
      )

/**
 * @since 1.0.0
 */
export const traversePartition = <T extends TypeLambda>(
  T: TraversableFilterable<T>
) =>
  <F extends TypeLambda>(
    F: Applicative<F>
  ): (<B extends A, R, O, E, A = B>(
    predicate: (a: A) => Kind<F, R, O, E, boolean>
  ) => <TR, TO, TE>(
    self: Kind<T, TR, TO, TE, B>
  ) => Kind<F, R, O, E, readonly [Kind<T, TR, TO, TE, B>, Kind<T, TR, TO, TE, B>]>) =>
    (predicate) =>
      T.traversePartitionMap(F)((b) =>
        pipe(
          predicate(b),
          F.map((keep) => (keep ? E.right(b) : E.left(b)))
        )
      )
