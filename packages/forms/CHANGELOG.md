# @logos-ui/forms

## 0.0.7

### Patch Changes

- 5ef68a9: Once again...
- Updated dependencies [5ef68a9]
  - @logos-ui/utils@1.1.4

## 0.0.6

### Patch Changes

- 432396d: Check against global to detect NodeJS because of build time issues when `process` when not reading as `global.process`
- Updated dependencies [432396d]
  - @logos-ui/utils@1.1.3

## 0.0.5

### Patch Changes

- ba8b52d: Properly detect NodeJS so as to work with electron when stubbing window.
- Updated dependencies [ba8b52d]
  - @logos-ui/utils@1.1.2

## 0.0.4

### Patch Changes

- e6e4d56: Added a window stub so packages can be used in NodeJS. Now, Observer, Localize, StateMachine, Storage, and whatever non-DOM related utility functions are usefule.
- Updated dependencies [e6e4d56]
  - @logos-ui/utils@1.1.1

## 0.0.3

### Patch Changes

- Updated dependencies [e5d039d]
  - @logos-ui/utils@1.1.0

## 0.0.2

### Patch Changes

- 58c0208: Initial commit!

  These packages were made to simplify the development of web applications, and reduce the decisions we make when building apps. You don't always need all the things, but you always need some things. When you apps are simple, they should remain so. When they grow in complexity, they should do so with ease.

  [Discussions can be had here](https://github.com/logos-ui/discuss). This will also include a link to the documentation (which is a WIP at the current moment). Domain not included here because it will in the future change. Enjoy using this neat piece of software utility, and do not be afraid to provide feedback; it is welcome!

- Updated dependencies [58c0208]
  - @logos-ui/utils@1.0.0
