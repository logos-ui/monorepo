---
type: Domain
---

# hooks

## What it does

`@logosdx/hooks` provides a lifecycle hook engine with middleware-style pipeline execution, priority chains, async/sync hooks, context passing, and a `ctx.fail()` mechanism that emits typed `HookError` instances.

## Artifacts

- [`skills/logosdx/references/hooks.md`](../../skills/logosdx/references/hooks.md) — skill reference (335 LOC) covering lifecycle hooks, middleware, plugins, priority chains; includes an `## addPipe() vs add()` section distinguishing run-shaped `(...args, ctx)` callbacks from onion-style `(next, ...args, ctx)` middleware

## CLI code

- [`packages/hooks/src/index.ts`](../../packages/hooks/src/index.ts) — all hook engine implementation in a single file (1316 LOC, 39k chars); exports `HookError`, `isHookError`, `PipeCallback`, and the `HookEngine` class
- `HookEngine.addPipe<K>(name, callback, options?)` registers onion-style middleware typed against `PipeCallback` (the `(next, ...args, ctx)` shape) without an `as any` cast; it runs the same validation as `add()` (string `name`, function `callback`, `register()` strict-mode via `#assertRegistered`, which names `addPipe` in its thrown error when called from that path) and writes into the same internal registry `add()` uses, sharing `AddOptions` semantics (`priority`, `once`, `times`, `ignoreOnFail`) and the cleanup-function return. The priority-ordered splice-and-cleanup logic formerly inline in `add()` is now the private `#insertEntry(name, callback, options)`, shared by both `add()` and `addPipe()`.
- [`packages/hooks/notes.md`](../../packages/hooks/notes.md) — internal design notes (700 LOC)

## Docs

- [`docs/packages/hooks.md`](../packages/hooks.md) — combined hooks reference (532 LOC)
- [`docs/spec/hooks-add-pipe.md`](../spec/hooks-add-pipe.md) — implementation spec for the `addPipe()` decision (issue #147); sibling-method approach chosen over an `add()` overload or a branded `Pipe<>` lifecycle marker

## Coupling

- Depends on `@logosdx/utils` for `attempt`, `attemptSync`, `assert`, `isFunction`, `isObject`, and `FunctionProps`.
- No dependency on `@logosdx/observer`.
- `@logosdx/fetch` is the largest in-repo consumer: `FetchEngine` composes a `HookEngine<FetchLifecycle>` ([`packages/fetch/src/engine/index.ts`](../../packages/fetch/src/engine/index.ts)) and runs every request through a three-phase pipeline — `hooks.run('beforeRequest')` → `hooks.pipe('execute')` → `hooks.run('afterRequest')` ([`packages/fetch/src/engine/executor.ts`](../../packages/fetch/src/engine/executor.ts)). Every fetch policy plugin (retry, dedupe, cache, rate-limit, cookies) is a hook installation whose `install()` returns the hook cleanup; a `HookScope` carries per-request state between phases (e.g. the cache key set in `beforeRequest` and read in `afterRequest`). [`packages/fetch/src/plugins/retry.ts`](../../packages/fetch/src/plugins/retry.ts) and [`packages/fetch/src/plugins/dedupe.ts`](../../packages/fetch/src/plugins/dedupe.ts) register their `execute` middleware via `engine.hooks.addPipe(...)`, replacing the prior `engine.hooks.add((...) as any, ...)` cast pattern. A behavior change to `run`/`pipe`/`HookScope` semantics is a behavior change to the entire fetch pipeline.
- Tests in [`tests/src/hooks.ts`](../../tests/src/hooks.ts) (1923 LOC, 58k chars), including `describe('engine.addPipe()', ...)` (unsubscribe behavior, invalid name/callback rejection, `register()` strict-mode error naming `addPipe`, type-level `PipeCallback` registration with no casts) and `describe('engine.pipe()', ...)` (onion execution order by priority).
- [`tests/src/smoke/hooks.test.ts`](../../tests/src/smoke/hooks.test.ts) runs browser smoke tests.

## Conventions worth knowing

- `HookEngine` runs hooks in priority order; lower numeric priority runs first. Fetch's built-in policies install at negative priorities so user hooks registered at the default priority run after them.
- `run` executes a hook chain where a hook may modify args or short-circuit with a result; `pipe` onion-wraps a core function middleware-style (in fetch: retry wraps dedupe wraps the network call).
- `ctx.fail(message)` within a hook handler halts the pipeline and throws `HookError` (or a custom error type if `handleFail` is overridden).
- `isHookError(err)` type guard identifies hook pipeline failures.
- The entire implementation lives in one 1316-line file rather than being split across modules.
