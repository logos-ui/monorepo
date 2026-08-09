# Spec: `HookEngine.addPipe()` — typed registration for pipe middleware

Resolves [#147](https://github.com/logosdx/monorepo/issues/147). The issue body is the design
analysis: three options were weighed there (an `add` overload, a branded `Pipe<>` lifecycle
marker, a sibling method) and the sibling method was chosen. This spec is the implementation
contract for that choice.

## Problem

`HookEngine.add()` types every callback as `HookCallback` (the `run()` shape: `(...args, ctx)`
returning `void | EarlyReturnSignal`). Pipe middleware is `(next, ...args, ctx)` and must return
the response, so it cannot be registered without `as any` or `@ts-expect-error`. The exported
`PipeCallback` type describes the correct shape but is accepted nowhere. In this repo,
`packages/fetch/src/plugins/retry.ts:86` and `packages/fetch/src/plugins/dedupe.ts:131` carry
the cast today.

## Decision

Add one public method, `addPipe`, typed with `PipeCallback` against the lifecycle signature.
It stores into the **same registry** `add()` uses — `pipe()`/`pipeSync()` already invoke
whatever was stored, so the fix is type-level; runtime behavior of `add`, `pipe`, `pipeSync`
is unchanged.

## API contract

```ts
addPipe<K extends HookName<Lifecycle>>(
    name: K,
    callback: PipeCallback<
        Parameters<FuncOrNever<Lifecycle[K]>>,
        Awaited<ReturnType<FuncOrNever<Lifecycle[K]>>>,
        FailArgs
    >,
    options?: HookEngine.AddOptions,
): () => void;
```

- Same runtime validation as `add`: assert `name` is a string, assert `callback` is a function,
  enforce `register()` strict mode (error message names `addPipe`).
- Same `AddOptions` semantics: `priority` (lower = outermost layer), `once`, `times`,
  `ignoreOnFail` — all already honored by `pipe()`'s chain builder.
- Returns the same cleanup-function shape as `add`.
- Implementation shares the insertion logic with `add` (extract a private helper both call);
  do not duplicate the priority-insert loop. No public-facing casts; the internal registry is
  already `HookEntry<any, FailArgs>`.
- JSDoc with a WHY-bearing example mirroring `pipe()`'s retry/dedupe example, and the
  `add` JSDoc's pipe-shaped example moves to `addPipe` (that example currently does not
  compile against `add` — it is the bug).

## Checkpoints

| # | Deliverable | Where | Done when |
|---|-------------|-------|-----------|
| 1 | `addPipe` method + shared insert helper + JSDoc | `packages/hooks/src/index.ts` | Issue #147's repro compiles cast-free using `addPipe`; `pnpm build` green |
| 2 | Runtime + type coverage | `tests/src/hooks.ts` | New `engine.addPipe()`, `engine.pipe()`, `engine.pipeSync()` describes pass (see Verification) |
| 3 | Migrate fetch plugins to `addPipe` | `packages/fetch/src/plugins/retry.ts`, `packages/fetch/src/plugins/dedupe.ts` | The outer `(... ) as any` on both registrations is gone; fetch test suite green |
| 4 | Docs + changeset | `docs/packages/hooks.md`, `skills/logosdx/references/hooks.md`, `.changeset/` | Both doc surfaces show `addPipe`; changeset: minor `@logosdx/hooks`, patch `@logosdx/fetch` |

## Verification

- Checkpoint 2 must cover, at minimum:
  - `addPipe`-registered middleware executes via `pipe()` and `pipeSync()` (onion order
    follows `priority`, lower = outermost).
  - Short-circuit by not calling `next()`; result propagation from `next()`.
  - `ctx.args()` replacement reaching inner layers; `ctx.fail()`; `ctx.removeHook()`.
  - `once`, `times`, `ignoreOnFail` options through the pipe path.
  - Cleanup function removes the middleware.
  - Strict-mode `register()` enforcement for `addPipe`.
  - Type-level: the issue's repro (a `PipeCallback`-typed const and an inline callback with
    inferred params) compiles when passed to `addPipe`; test file compiles under the suite's
    type checking with relative imports to `packages/hooks/src/index.ts`.
- **Build before test**: test-suite package imports resolve `@logosdx/*` to `dist/`. Run
  `pnpm build` after touching `packages/hooks/src` or the fetch plugins, or new exports throw
  "not a function" at test time.
- Full gate: `pnpm build` then `pnpm test` from repo root, all green.

## Non-goals

- Tightening `pipe()`/`pipeSync()` argument typing against the lifecycle (`...args: unknown[]`,
  unbound `R`) — potentially breaking for existing consumers; the issue lists it as Related,
  not as the fix.
- The branded `Pipe<>` lifecycle-marker design — rejected in the issue (requires every
  consumer lifecycle to annotate).
- `PipeOptions.append` typing — Related-listed, out of scope.
- Any behavior change to `add`, `run`, `runSync`, `pipe`, `pipeSync`.
- De-`any`-ing the interiors of the fetch retry/dedupe plugins beyond removing the outer
  registration cast.

## Change log

- 2026-08-08: Initial spec from issue #147 (autopilot).
- 2026-08-09: Implemented as specified, no contract deviations; shipped as a single
  squashed commit (PR #148). Checkpoints 1–2: `addPipe` + `#insertEntry` extraction +
  26 tests — first direct `pipe()`/`pipeSync()` coverage in the suite. Checkpoint 3:
  retry/dedupe migration, 6-line diff. Checkpoint 4: docs + changeset; also fixed
  three pre-existing doc examples that passed args to the zero-arg `coreFn`. Full
  gate green: build, 2434 tests, tsc clean.
