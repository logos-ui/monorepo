---
"@logosdx/hooks": minor
"@logosdx/fetch": patch
---

`HookEngine.addPipe()` registers pipe middleware (#147)

`@logosdx/hooks`:

- New `addPipe(name, callback, options?)` method, typed against the lifecycle's `(next, ...args, ctx)` shape. Pipe middleware — retry, dedupe, caching execution — now registers with full type inference instead of requiring an `as any` cast on `add()`.
- `addPipe` shares the same registry, `AddOptions` semantics (`priority`, `once`, `times`, `ignoreOnFail`), cleanup-function return, and `register()` strict-mode enforcement as `add()`. Runtime behavior of `add`, `pipe`, `pipeSync` is unchanged.

`@logosdx/fetch`:

- `retryPlugin` and `dedupePlugin` register their `execute` middleware via `addPipe` instead of `add(... as any)`. No behavior change.
