import * as Equivalence from "@fp-ts/data/Equivalence"
import { pipe } from "@fp-ts/data/Function"
import * as fc from "fast-check"

describe("Equivalence", () => {
  it("string", () => {
    assert.isTrue(Equivalence.string.equals("ok")("ok"))
    assert.isFalse(Equivalence.string.equals("ok")("no"))
    assert.strictEqual(Equivalence.string.hash("ok"), Equivalence.string.hash("ok"))
    assert.notStrictEqual(Equivalence.string.hash("ok"), Equivalence.string.hash("no"))
  })
  it("number", () => {
    assert.isTrue(Equivalence.number.equals(10)(10))
    assert.isFalse(Equivalence.number.equals(10)(20))
    assert.strictEqual(Equivalence.number.hash(10), Equivalence.number.hash(10))
    assert.notStrictEqual(Equivalence.number.hash(10), Equivalence.number.hash(20))
  })
  it("bigint", () => {
    assert.isTrue(Equivalence.bigint.equals(10n)(10n))
    assert.isFalse(Equivalence.bigint.equals(10n)(20n))
    assert.strictEqual(Equivalence.bigint.hash(10n), Equivalence.bigint.hash(10n))
    assert.notStrictEqual(Equivalence.bigint.hash(10n), Equivalence.bigint.hash(20n))
  })
  it("bigint", () => {
    assert.isTrue(Equivalence.symbol.equals(Symbol.for("hello"))(Symbol.for("hello")))
    assert.isFalse(Equivalence.symbol.equals(Symbol.for("hello"))(Symbol.for("hello/no")))
    assert.strictEqual(
      Equivalence.symbol.hash(Symbol.for("hello")),
      Equivalence.symbol.hash(Symbol.for("hello"))
    )
    assert.notStrictEqual(
      Equivalence.symbol.hash(Symbol.for("hello")),
      Equivalence.symbol.hash(Symbol.for("hello/no"))
    )
  })
  it("contramap", () => {
    interface User {
      id: string
      name: string
    }
    const eq = pipe(Equivalence.string, Equivalence.contramap((_: User) => _.id))
    assert.isTrue(eq.equals({ id: "ok", name: "a" })({ name: "b", id: "ok" }))
    assert.isFalse(eq.equals({ id: "ok", name: "a" })({ name: "b", id: "no" }))
    assert.strictEqual(eq.hash({ id: "ok", name: "a" }), eq.hash({ id: "ok", name: "a" }))
    assert.notStrictEqual(eq.hash({ id: "ok", name: "a" }), eq.hash({ id: "no", name: "a" }))
  })
  it("struct", () => {
    const eq = Equivalence.struct({
      name: Equivalence.string,
      id: Equivalence.string
    })
    assert.isTrue(eq.equals({ id: "ok", name: "a" })({ name: "a", id: "ok" }))
    assert.isTrue(eq.equals({ id: "ok", name: "a" })({ id: "ok", name: "a" }))
    assert.isFalse(eq.equals({ id: "ok", name: "a" })({ name: "b", id: "no" }))
    assert.strictEqual(eq.hash({ id: "ok", name: "a" }), eq.hash({ id: "ok", name: "a" }))
    assert.notStrictEqual(eq.hash({ id: "ok", name: "a" }), eq.hash({ id: "no", name: "a" }))
  })
  it("tuple", () => {
    const eq = Equivalence.tuple(Equivalence.string, Equivalence.string)
    assert.isTrue(eq.equals(["a", "b"])(["a", "b"]))
    assert.isFalse(eq.equals(["a", "b"])(["a", "c"]))
    assert.strictEqual(eq.hash(["a", "b"]), eq.hash(["a", "b"]))
    assert.notStrictEqual(eq.hash(["a", "b"]), eq.hash(["a", "c"]))
  })
  it("strict", () => {
    const eq = Equivalence.strict<unknown>()
    fc.assert(fc.property(fc.anything(), fc.anything(), (a, b) => {
      if (a !== b) {
        assert.isTrue(eq.hash(a) !== eq.hash(b) || !eq.equals(b)(a))
      } else {
        assert.isTrue(eq.hash(a) === eq.hash(b) && eq.equals(b)(a))
      }
      assert.isTrue(eq.equals(a)(a) && eq.hash(a) === eq.hash(a))
      assert.isTrue(eq.equals(b)(b) && eq.hash(b) === eq.hash(b))
    }))
  })
})
