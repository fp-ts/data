import * as _ from "@fp-ts/data/Metric"
import * as U from "./util"

// import { pipe } from "@fp-ts/data/Function"

describe.concurrent("Duration", () => {
  it("instances and derived exports", () => {
    expect(_.Contravariant).exist
    expect(_.contramap).exist
    expect(_.Invariant).exist
    expect(_.imap).exist
  })

  it("fromDistance", () => {
    U.deepStrictEqual(_.fromDistance<number>((a) => (b) => Math.abs(a - b)).distance(-1)(1), 2)
    U.deepStrictEqual(_.fromDistance<number>((a) => (b) => a === b ? 0 : 1).distance(0)(3), 1)
  })

  it("getOrder", () => {
    const metrtic = _.fromDistance<number>((a) => (b) => Math.abs(a - b))
    const order = _.getOrder(metrtic)(0)
    U.deepStrictEqual(order.compare(1)(2), 1)
  })
})
