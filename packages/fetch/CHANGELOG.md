# @logos-ui/fetch

## 4.1.5

### Patch Changes

- Updated dependencies [66eff61]
  - @logos-ui/utils@3.3.0

## 4.1.4

### Patch Changes

- Updated dependencies [08cffe5]
  - @logos-ui/utils@3.2.0

## 4.1.3

### Patch Changes

- Updated dependencies [b85f688]
  - @logos-ui/utils@3.1.1

## 4.1.2

### Patch Changes

- Updated dependencies [0110f9e]
  - @logos-ui/utils@3.1.0

## 4.1.1

### Patch Changes

- Updated dependencies [637f320]
  - @logos-ui/utils@3.0.0

## 4.1.0

### Minor Changes

- e333da3: Added configurable retry mechanism to FetchEngine:

  - Added ability to configure an external abort controller per request

  - Added retry configuration with the following options:

    - `maxAttempts`: Maximum number of retry attempts (default: 3)
    - `baseDelay`: Base delay between retries in ms (default: 1000)
    - `maxDelay`: Maximum delay between retries in ms (default: 10000)
    - `useExponentialBackoff`: Whether to use exponential backoff (default: true)
    - `retryableStatusCodes`: Status codes that trigger a retry (default: [408, 429, 499, 500, 502, 503, 504])
    - `shouldRetry`: Custom function to determine if a request should be retried

  - Added retry-related features:

    - Exponential backoff with configurable delays
    - Per-request retry configuration override
    - New 'fetch-retry' event emitted before each retry attempt
    - Retry attempt count included in all fetch events
    - Enhanced error handling with attempt tracking

  - Enhanced error handling:

    - Added attempt count to FetchError
    - Added step tracking ('fetch', 'parse', 'response') to errors
    - Improved error classification and handling

  - Added utility improvements:
    - New attempt/attemptSync helpers for error handling
    - Enhanced error event data with more context

### Patch Changes

- Updated dependencies [e333da3]
  - @logos-ui/utils@2.3.0

## 4.0.0

### Major Changes

- f870720: # Better semantics

  Rename classes to use more precise and semantic names.

  - `FetchFactory` -> `FetchEngine`
  - `ObserverFactory` -> `ObserverEngine`
  - `LocaleFactory` -> `LocaleManager`
  - `StorageFactory` -> `StorageAdapter`

  Why? Because these abstractions aren't factories, they are engines or adapters. They provide a way to interact with a specific system in a highly configurable way. It's more accurate to call them engines or adapters or managers.

- 9bae275: ## All packages

  - Stricter and more consistent TypeScript types
  - Improved documentation
  - Improved test coverage

  ## `@logos-ui/observer`

  - Added `EventPromise` when calling `once` without a callback
  - Added `EventGenerator` when calling `on` without a callback
  - `on('*')` and `emit('*')` now work as expected
  - Regex listeners now emit a `{ event, data }` object instead of just the data
  - Added Emit validators to allow developers to validate the data being emitted
  - Added `$facts()`, `$internals()`, and `$has(event)` meta helpers for debugging
  - Removed `Component` as type and as a first argument when constructing an `ObserverEngine`. Only `observe(component)` is now available.
  - Removed alternative methods for `on`, `once` and etc. The API is now decisively `on`, `once`, `off`, and `emit`.

  ## `@logos-ui/fetch`

  - Added `params` to instance options and request options. You can now pass query parameters to the fetch request.
  - `headers`, `params`, and `modifyOptions` now have an equivalent configuration option for each HTTP method.
    - `headers` -> `methodHeaders`
    - `params` -> `methodParams`
    - `modifyOptions` -> `modifyMethodOptions`
    - All follow a `{ method: option }` pattern
  - Added `validate` options for header, state, and params. You can now also validate per-request if configured.
  - `type` is no longer a required option. It is now inferred from the response headers.
  - `defaultType` is used when the response headers do not contain a `Content-Type` header.
  - The determination of how to parse response can be overridden by passing the `determineType(response)` option. The user can now determine how to parse the response based on the response headers.
  - Empty responses are now properly handled and do not throw an error.
  - Can now pass a `formatHeaders` function to format the headers before they are sent.
  - Can modify params like headers using the `addParams(params)`, `removeParams(params)`, and `hasParams(params)` methods.
  - Headers and params can be modified per http method by passing the last argument: `addParams(params, method)` and `addHeaders(headers, method)`.

  ## `@logos-ui/dom`

  - For consistency, events now match the same API as `@logos-ui/observer`.
    - `on`, `once`, `off`, `emit`

  ## `@logos-ui/kit`

  - Upgrading to breaking package versions
  - Can now configure multiple API clients by passing the `apis` config, where each key is the API name and the value is the API configuration.

### Patch Changes

- a05786d: mapErrCodetoStatus() and exactOptionalPropertyTypes
- e4e671a: Fix build script
- Updated dependencies [8859bc6]
- Updated dependencies [90b498a]
- Updated dependencies [e4e671a]
- Updated dependencies [bd7c0e0]
- Updated dependencies [89d795c]
  - @logos-ui/utils@2.2.0

## 4.0.0-next.6

### Patch Changes

- a05786d: mapErrCodetoStatus() and exactOptionalPropertyTypes

## 4.0.0-next.5

### Patch Changes

- Updated dependencies [bd7c0e0]
  - @logos-ui/utils@2.2.0-next.4

## 4.0.0-next.4

### Patch Changes

- e4e671a: Fix build script
- Updated dependencies [e4e671a]
  - @logos-ui/utils@2.2.0-next.3

## 4.0.0-next.3

### Patch Changes

- Updated dependencies [89d795c]
  - @logos-ui/utils@2.2.0-next.2

## 4.0.0-next.2

### Patch Changes

- Updated dependencies [8859bc6]
  - @logos-ui/utils@2.2.0-next.1

## 4.0.0-next.1

### Patch Changes

- Updated dependencies [90b498a]
  - @logos-ui/utils@2.2.0-next.0

## 4.0.0-next.0

### Major Changes

- 9bae275: ## All packages

  - Stricter and more consistent TypeScript types
  - Improved documentation
  - Improved test coverage

  ## `@logos-ui/observer`

  - Added `EventPromise` when calling `once` without a callback
  - Added `EventGenerator` when calling `on` without a callback
  - `on('*')` and `emit('*')` now work as expected
  - Regex listeners now emit a `{ event, data }` object instead of just the data
  - Added Emit validators to allow developers to validate the data being emitted
  - Added `$facts()`, `$internals()`, and `$has(event)` meta helpers for debugging
  - Removed `Component` as type and as a first argument when constructing an `ObserverEngine`. Only `observe(component)` is now available.
  - Removed alternative methods for `on`, `once` and etc. The API is now decisively `on`, `once`, `off`, and `emit`.

  ## `@logos-ui/fetch`

  - Added `params` to instance options and request options. You can now pass query parameters to the fetch request.
  - `headers`, `params`, and `modifyOptions` now have an equivalent configuration option for each HTTP method.
    - `headers` -> `methodHeaders`
    - `params` -> `methodParams`
    - `modifyOptions` -> `modifyMethodOptions`
    - All follow a `{ method: option }` pattern
  - Added `validate` options for header, state, and params. You can now also validate per-request if configured.
  - `type` is no longer a required option. It is now inferred from the response headers.
  - `defaultType` is used when the response headers do not contain a `Content-Type` header.
  - The determination of how to parse response can be overridden by passing the `determineType(response)` option. The user can now determine how to parse the response based on the response headers.
  - Empty responses are now properly handled and do not throw an error.
  - Can now pass a `formatHeaders` function to format the headers before they are sent.
  - Can modify params like headers using the `addParams(params)`, `removeParams(params)`, and `hasParams(params)` methods.
  - Headers and params can be modified per http method by passing the last argument: `addParams(params, method)` and `addHeaders(headers, method)`.

  ## `@logos-ui/dom`

  - For consistency, events now match the same API as `@logos-ui/observer`.
    - `on`, `once`, `off`, `emit`

  ## `@logos-ui/kit`

  - Upgrading to breaking package versions
  - Can now configure multiple API clients by passing the `apis` config, where each key is the API name and the value is the API configuration.

## 3.2.0

### Minor Changes

- dd1794f: ## @logos-ui/observer

  ### Breaking Changes

  - `observer.on` and `observer.one` return a function that can be used to remove the listener. This is a breaking change since before it would return an object with a `cleanup` method.
  - Alignments with traditional event emitter patterns:
    - `observer.one` is now an alias, and `observer.once` is the primary method.
    - `observer.trigger` is now an alias, and `observer.emit` is the primary method.

  ### New Features

  - `observer.on` returns an event generator when no callback is provided.
    - Event generators listen for the next event using `next()` method, which returns a promise that resolves with data. Once resolved, a new promise is generated to await the next event.
    - Event generators can also `.emit(...)` events to the generator.
    - Event generators can be `destroy()`ed and will no longer listen for events or allow the emission of events.

  ### Fixes and Improvements

  - Observer functions are now validated to ensure runtime safety.

  ## @logos-ui/fetch

  ### New Features

  - Added FetchOptions:
    - `methodHeaders` allows for the configuration of headers based on the HTTP method.
    - `modifyMethodOptions` allows for the modification of options based on the HTTP method.
    - `validate` allows for validation configuration for:
      - `headers(...httpHeaders)` - Validates headers.
      - `state(...instanceState)` - Validates the state of the instance.
      - `perRequest.headers: boolean` - Validates headers on a per-request basis.
    - `fetch.headers` returns the headers configuration.

  ### Improvements

  - `fetch.addHeader()` can now be passed key, value arguments to add a single header: `fetch.addHeader('key', 'value')`.
  - `fetch.setState()` can now be passed a key, value argument to set a single state: `fetch.setState('key', 'value')`.

  ### Fixes

  - Headers typings allow configuration of headers as partials.
  - `FetchError` correctly passes the HTTP body to the error message on `FetchError.data`, if available.

  ## @logos-ui/utils

  ### New Features

  - `utils` now includes a `Deferred` class that can be used to create a promise that can be resolved or rejected externally.

### Patch Changes

- Updated dependencies [dd1794f]
  - @logos-ui/utils@2.1.0

## 3.1.0

### Minor Changes

- 5ee6904: Fix bad assumptions around responses without content types

## 3.0.0

### Major Changes

- 2b64cfa: Abortable promise is exported. Can now check abortable promises if isFinished and isAborted.

  BREAKING: Abandoned or aborted promises will throw a 499 status code instead of a 998. See https://www.belugacdn.com/499-error-code for more information. Many CDNs and proxies will return a 499 status code when a client aborts a request. This is closer to the commonly used 499 nginx status code for client-initiated aborts.

## 2.0.6

### Patch Changes

- ca76a50: Bump again
- Updated dependencies [ca76a50]
  - @logos-ui/utils@2.0.5

## 2.0.5

### Patch Changes

- 0566a67: Bump all dependencies for cjs / esm build
- Updated dependencies [0566a67]
  - @logos-ui/utils@2.0.4

## 2.0.4

### Patch Changes

- Updated dependencies [176ed64]
  - @logos-ui/utils@2.0.3

## 2.0.3

### Patch Changes

- Updated dependencies [c167f6b]
  - @logos-ui/utils@2.0.2

## 2.0.2

### Patch Changes

- c7051bb: Make modules CJS/ESM agnostic
- Updated dependencies [c7051bb]
  - @logos-ui/utils@2.0.1

## 2.0.1

### Patch Changes

- 9de5826: Export correctly for esm / cjs

## 2.0.0

### Major Changes

- 847eb42: Build for ESM and CJS. Modules should now work in both.

### Patch Changes

- Updated dependencies [847eb42]
  - @logos-ui/utils@2.0.0

## 1.1.1 - 1.1.4

### Patch Changes

- 5ef68a9: Once again...
- Updated dependencies [5ef68a9]
  - @logos-ui/utils@1.1.4
- 432396d: Check against global to detect NodeJS because of build time issues when `process` when not reading as `global.process`
- Updated dependencies [432396d]
  - @logos-ui/utils@1.1.3
- ba8b52d: Properly detect NodeJS so as to work with electron when stubbing window.
- Updated dependencies [ba8b52d]
  - @logos-ui/utils@1.1.2
- e6e4d56: Added a window stub so packages can be used in NodeJS. Now, Observer, Localize, StateMachine, Storage, and whatever non-DOM related utility functions are usefule.
- Updated dependencies [e6e4d56]
  - @logos-ui/utils@1.1.1

## 1.1.0

### Minor Changes

- e5d039d: Documentation for all packages is completed and can be found at [https://logosui.com](https://logosui.com). All packages are tested and ready for use. For bug reports, questions, and suggestions, please use [https://github.com/logos-ui/discuss](https://github.com/logos-ui/discuss).

### Patch Changes

- Updated dependencies [e5d039d]
  - @logos-ui/utils@1.1.0

## 1.0.0

### Major Changes

- 58c0208: Initial commit!

  These packages were made to simplify the development of web applications, and reduce the decisions we make when building apps. You don't always need all the things, but you always need some things. When you apps are simple, they should remain so. When they grow in complexity, they should do so with ease.

  [Discussions can be had here](https://github.com/logos-ui/discuss). This will also include a link to the documentation (which is a WIP at the current moment). Domain not included here because it will in the future change. Enjoy using this neat piece of software utility, and do not be afraid to provide feedback; it is welcome!

### Patch Changes

- Updated dependencies [58c0208]
  - @logos-ui/utils@1.0.0
