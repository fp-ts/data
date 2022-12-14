/**
 * @since 1.0.0
 */

import type { HashSet } from "@fp-ts/data/HashSet"
import * as HSP from "@fp-ts/data/internal/Differ/HashSetPatch"

const TypeId: unique symbol = HSP.HashSetPatchTypeId as TypeId

/**
 * @since 1.0.0
 * @category symbol
 */
export type TypeId = typeof TypeId

/**
 * A patch which describes updates to a set of values.
 *
 * @since 1.0.0
 * @category models
 */
export interface HashSetPatch<Value> {
  readonly _id: TypeId
  readonly _Value: (_: Value) => Value
}

/**
 * Constructs an empty set patch.
 *
 * @since 1.0.0
 * @category constructors
 */
export const empty: <Value>() => HashSetPatch<Value> = HSP.empty

/**
 * Constructs a set patch from a new set of values.
 *
 * @since 1.0.0
 * @category constructors
 */
export const diff: <Value>(
  oldValue: HashSet<Value>,
  newValue: HashSet<Value>
) => HashSetPatch<Value> = HSP.diff

/**
 * Combines two set patches to produce a new set patch that describes
 * applying their changes sequentially.
 *
 * @since 1.0.0
 * @category mutations
 */
export const combine: <Value>(
  that: HashSetPatch<Value>
) => (
  self: HashSetPatch<Value>
) => HashSetPatch<Value> = HSP.combine

/**
 * Applies a set patch to a set of values to produce a new set of values
 * which represents the original set of values updated with the changes
 * described by this patch.
 *
 * @since 1.0.0
 * @category destructors
 */
export const patch: <Value>(
  oldValue: HashSet<Value>
) => (
  self: HashSetPatch<Value>
) => HashSet<Value> = HSP.patch
