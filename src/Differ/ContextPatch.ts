/**
 * @since 1.0.0
 */

import type { Context } from "@fp-ts/data/Context"
import * as CP from "@fp-ts/data/internal/Differ/ContextPatch"

const TypeId: unique symbol = CP.ContextPatchTypeId as TypeId

/**
 * @since 1.0.0
 * @category symbol
 */
export type TypeId = typeof TypeId

/**
 * A `Patch<Input, Output>` describes an update that transforms a `Env<Input>`
 * to a `Env<Output>` as a data structure. This allows combining updates to
 * different services in the environment in a compositional way.
 *
 * @since 1.0.0
 * @category models
 */
export interface ContextPatch<Input, Output> {
  readonly _id: TypeId
  readonly _Input: (_: Input) => void
  readonly _Output: (_: never) => Output
}

/**
 * An empty patch which returns the environment unchanged.
 *
 * @since 1.0.0
 * @category constructors
 */
export const empty: <Input = never, Output = never>() => ContextPatch<Input, Output> = CP.empty

/**
 * @since 1.0.0
 * @category constructors
 */
export const diff: <Input, Output>(
  oldValue: Context<Input>,
  newValue: Context<Output>
) => ContextPatch<Input, Output> = CP.diff

/**
 * Combines two patches to produce a new patch that describes applying the
 * updates from this patch and then the updates from the specified patch.
 *
 * @since 1.0.0
 * @category mutations
 */
export const combine: <Output, Output2>(
  that: ContextPatch<Output, Output2>
) => <Input>(
  self: ContextPatch<Input, Output>
) => ContextPatch<Input, Output2> = CP.combine

/**
 * Applies a `Patch` to the specified `Context` to produce a new patched
 * `Context`.
 *
 * @since 1.0.0
 * @category destructors
 */
export const patch: <Input>(
  context: Context<Input>
) => <Output>(
  self: ContextPatch<Input, Output>
) => Context<Output> = CP.patch
