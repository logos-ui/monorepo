import { Func, PathLeaves, PathNames, PathValue, Truthy } from './types';


export const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
export const isReactNative =  typeof navigator !== "undefined" && navigator?.product === "ReactNative";
export const isCloudflare = typeof globalThis !== "undefined" && globalThis?.navigator?.userAgent === "Cloudflare-Workers";
export const isBrowserLike = isBrowser || isReactNative || isCloudflare;

/**
 * Defines visible, non-configurable properties on an object
 * @param target
 * @param props
 */
export const definePublicProps = <T, U extends Record<string, unknown>>(target: T, props: U, configurable = false) => {

    Object.entries(props).map(([prop, value]) => {

        Object.defineProperty(
            target,
            prop,
            {
                value,
                writable: false,
                enumerable: true,
                configurable
            }
        );
    });
};

/**
 * Defines hidden, non-configurable properties on an object
 * @param target
 * @param props
 */
export const definePrivateProps = <T, U extends Record<string, unknown>>(target: T, props: U, configurable = false) => {

    Object.entries(props).map(([prop, value]) => {

        Object.defineProperty(
            target,
            prop,
            {
                value,
                writable: false,
                enumerable: false,
                configurable
            }
        );
    });
};

/**
 * Defines hidden, non-configurable getters on an object
 * @param target
 * @param props
 */
export const definePrivateGetters = <T, U extends Record<string, Func>>(target: T, props: U, configurable = false) => {

    Object.entries(props).map(([prop, getter]) => {

        Object.defineProperty(
            target,
            prop,
            {
                get: getter,
                writable: false,
                enumerable: false,
                configurable
            }
        );
    });
};


class AssertationError extends Error {}

/**
 * Asserts that a value is true
 *
 * @param test value that is coerced to true
 * @param message error message to display when test is false
 * @param ErrorClass error class to throw
 */
export const assert = (
    test: Truthy | (() => boolean),
    message?: string,
    ErrorClass?: typeof Error
) => {

    const check = test instanceof Function ? test() : !!test

    if (check === false) {

        throw new (ErrorClass || AssertationError)(message || 'assertion failed');
    }
};

type AssertObjTestFn<T, P extends string> = (val: PathValue<T, P>) => [boolean, string];

/**
 * Asserts the values in an object based on the provided assertations.
 * The assertations are a map of paths to functions that return a tuple
 * of a boolean and a message. This is intended to be used for testing
 * and validation when there is no schema validator available.
 *
 *
 * @param obj
 * @param assertions
 *
 * @example
 *
 * const obj = {
 *     a: 1,
 *     b: 'hello',
 *     c: { d: 2 }
 * }
 *
 * assertObject(obj, {
 *     a: (val) => [val === 1, 'a should be 1'],
 *     b: (val) => [val === 'hello', 'b should be hello'],
 *     c: [
 *         (val) => [!!val, 'c should not be empty'],
 *         (val) => [isObject(val), 'c should be an object']
 *     ],
 *     'c.d': (val) => [val === 2, 'c.d should be 2']
 * });
 */
export const assertObject = <T extends object>(
    obj: T,
    assertions: {
        [K in PathNames<T>]?: AssertObjTestFn<T, K> | AssertObjTestFn<T, K>[]
    }
) => {

    const tests = [] as [
        unknown,
        AssertObjTestFn<T, any>
    ][]

    for (const path in assertions) {

        const val = reach(obj, path as never);
        const test = assertions[path as never] as AssertObjTestFn<T, any> | AssertObjTestFn<T, any>[];

        if (test === undefined) {

            throw new Error(`assertation for path ${path} is undefined`);
        }

        if (test instanceof Array) {

            for (const t of test) {

                tests.push([val, t]);
            }
            continue;
        }

        tests.push([val, test]);
    }

    for (const [val, test] of tests) {

        const [check, message] = test(val as never);

        assert(check, message);
    }
}


/**
 * Asserts only if value is not undefined
 *
 * @param val value to test
 * @param test
 * @param message
 * @param ErrorClass
 */
export const assertOptional = <T>(
    val: T | undefined,
    ...rest: Parameters<typeof assert>
) => {

    if (val !== undefined) {

        assert(...rest);
    }
}


/**
 * Merges sources into targets, using the target as a default fallback
 * @param target object to modify
 * @param sources to apply against target
 * @returns
 */
export const applyDefaults = <T>(target: T, ...sources: T[]) => {

    for (const source of sources) {

        for (const k in source) {

            if (typeof source[k] === 'object') {

                const _t = (target || {}) as T;
                type NextVal = T[keyof T];

                const value = applyDefaults(
                    (_t[k] || {}) as NextVal,
                    (source[k])
                );

                target[k as keyof T] = value as NextVal;
            }
            else {

                target[k] = source[k];
            }
        }
    }


    return target;
}

/**
 * Returns an array of things, if not already an array.
 * @param items item or items
 * @returns
 */
export const itemsToArray = <T>(items: T | T[]): T[] => {

    if (!Array.isArray(items)) {

        items = [items];
    }

    return items;
};

/**
 * Returns 1 only if array of items contains only 1
 * @param items array of items
 * @returns
 */
export const oneOrMany = <T>(items: T[]): T | T[] => {

    if (items.length === 1) {
        return items[0] as T
    }

    return items;
};

/**
 * Checks if value is non-iterable:
 * null, undefined, String, Number, Boolean, Symbol
 * @param val
 * @returns {boolean}
 */
export const isNonIterable = (val: unknown): boolean => (
    val === null ||
    val === undefined ||
    val.constructor === String ||
    val.constructor === Number ||
    val.constructor === Boolean ||
    val.constructor === Symbol
);

/**
 * Checks if value is a type that does not
 * have a constructor
 * @param val
 * @returns {boolean}
 */
export const hasNoConstructor = (val: unknown): boolean => (
    val === null ||
    val === undefined
);

/**
 * Checks if either value is non iterable
 * @param value
 * @param compare
 * @returns {boolean}
 */
export const oneIsNonIterable = (value: unknown, compare: unknown): boolean => (
    isNonIterable(value) || isNonIterable(compare)
);

/**
 * Checks if both values have the same constructor
 * @param value
 * @param compare
 * @returns {boolean}
 */
export const hasSameConstructor = (value: unknown, compare: unknown): boolean => (
    (value as {}).constructor === (compare as {}).constructor
);

/**
 * Checks if both values are the length (or size). Values can be any iterable with
 * the property `length` or `size`.
 * @param a
 * @param b
 * @returns {boolean}
 */
export const isSameLength = (
    a: unknown[] | Set<unknown>,
    b: unknown[] | Set<unknown>
): boolean => (
    (a as []).length === (b as []).length &&
    (a as Set<''>).size === (b as Set<''>).size
);

/**
 * Checks if value is instance of a function
 * @param a
 * @returns {boolean}
 */
export const isFunction = (a: unknown) => a instanceof Function;

/**
 * Checks if value is instance of an object
 * @param a
 * @returns {boolean}
 */
export const isObject = (a: unknown) => a instanceof Object;

/**
 * Performs a for-in loop that breaks the instance `check` function returns false.
 * Used to check that a value is in another item.
 * @param {Object|Array} item an object or array
 * @param {Function} check function to perform the check
 * @returns {boolean}
 */
export const forInIsEqual = <T extends object>(
    item: T,
    check: {
        (v: T[keyof T], i: number | string): boolean
    }
): boolean => {

    let isEqual: boolean;

    for (const i in item) {

        isEqual = check(item[i], i);

        if (isEqual === false) {
            break;
        }
    }

    return isEqual!;
};

/**
 * Performs a for-of loop that breaks the instance `check` function returns false.
 * Used to check that a value is in another item.
 * @param {Array|Set|Map} item an array, set or map
 * @param {Function} check function to perform the check
 * @returns {boolean}
 */
export const forOfIsEqual = <
    I extends Iterable<unknown>
>(
    item: I,
    check: (v: unknown) => boolean
): boolean => {

    let isEqual: boolean;

    for (const val of item) {

        isEqual = check(val);

        if (isEqual === false) {
            break;
        }
    }

    return isEqual!;
};


/** Next tick but in the browser */
const nextTickQueue: Func[] = [];

(() => {

    if (!isBrowserLike) {
        return;
    }

    window?.addEventListener('message', function (ev: MessageEvent<string>) {

        const source = ev.source;
        const evName = ev.data;

        if (
            (
                source === window ||
                source === null
            ) &&
            evName === 'process-tick'
        ) {

            ev.stopPropagation();

            if (nextTickQueue.length > 0) {

                const fn = nextTickQueue.shift();
                fn?.call && fn();
            }
        }
    }, true);
})

/**
 * Browser implementation of `process.nextTick`
 * @param {function} fn
 */
export const _nextTick = (fn: Func) => {

    if (!isBrowserLike) {
        return;
    }

    nextTickQueue.push(fn);
    window?.postMessage('process-tick', '*');
};

/**
 * Checks if value is a function or an object
 * @param val
 * @returns {boolean}
 */
export const isFunctionOrObject = <T extends Function | Object>(val: T): boolean => (
    val.constructor === Function ||
    val.constructor === Object
);

/**
 * Checks if value is specifically undefined
 * @param val
 * @returns {boolean}
 */
export const isUndefined = (val: unknown) => val === undefined;

/**
 * Optional value check. If value is undefined or null, it is considered optional.
 * If a function is provided, it is used to check the value. If a boolean is provided,
 * it is used to check the value.
 *
 * @param val value to check
 * @param check function or boolean to check value
 *
 * @returns {boolean}
 */
export const isOptional = (
    val: unknown,
    check: ((val: unknown) => boolean) | boolean
) => (
    val === undefined || val === null
) || (
    check instanceof Function ? check(val) : check
);

/**
 * Reaches into an object and returns the value at the end of the path
 */
export const reach = <T extends object, P extends PathNames<T>>(
    obj: T,
    val: P
) => {

    const path = val.split('.');

    return path.reduce(
        (acc, key) => {

            if (acc === undefined || acc === null) {
                return null;
            }

            return acc[key];
        },
        obj as any
    ) as PathValue<T, P> | undefined;
}

/**
 * Creates a deferred promise
 */
export class Deferred<T> {

    public promise: Promise<T>;
    public resolve!: (value: T) => void;
    public reject!: (reason?: Error | string) => void;

    constructor() {

        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

/**
 * Helper utilities for working with text
 */
export const txt = {

    msgs: (...args: ({ toString(): string } | string)[]) => {

        return args.map((arg) => arg.toString()).join(' ');
    },

    lines: (...args: ({ toString(): string } | string)[]) => {

        return args.map((arg) => arg.toString()).join('\n');
    }
}


type ResultTuple<T> = [T, null] | [null, Error];

/**
 * Error monad, go-style.
 *
 * @param fn async function to run
 *
 * @example
 *
 * const [result, error] = await attempt(async () => {
 *     return 'hello';
 * });
 *
 * if (error) {
 *     console.error(error);
 * }
 *
 * console.log(result);
 */
export const attempt = async <T extends () => Promise<any>>(fn: T): Promise<ResultTuple<Awaited<ReturnType<T>>>> => {

    try {
        return [await fn(), null]
    } catch (e) {
        return [null, e as Error]
    }
}

/**
 * Synchronous error monad, go-style.
 *
 * @example
 *
 * const [result, error] = attemptSync(() => {
 *     return 'hello';
 * });
 *
 * if (error) {
 *     console.error(error);
 * }
 *
 * console.log(result);
 */
export const attemptSync = <T extends () => any>(fn: T): ResultTuple<ReturnType<T>> => {

    try {
        return [fn(), null]
    } catch (e) {
        return [null, e as Error]
    }
}

/**
 * Delays the last call of a function for `delay`
 * milliseconds and ignores all subsequent calls
 * until the delay has passed.
 *
 * @param fn function to debounce
 * @param delay delay in milliseconds
 * @returns debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {

    let timeout: ReturnType<typeof setTimeout>;
    let lastCalled: number | undefined;

    return (...args: Parameters<T>) => {

        clearTimeout(timeout);

        timeout = setTimeout(() => fn(...args), delay);
    }
}

/**
 * Throttle a function, calling it at most once
 * every `delay` milliseconds.
 *
 * @param fn function to throttle
 * @param delay delay in milliseconds
 * @returns throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(fn: T, delay: number) => {

    let lastCalled: number | undefined;

    return (...args: Parameters<T>) => {

        const now = Date.now();

        if (
            lastCalled &&
            (now - lastCalled < delay)
        ) {
            return;
        }

        lastCalled = now;

        fn(...args);
    }
}

/**
 * Waits for `ms` milliseconds
 * @param ms milliseconds to wait
 * @returns
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retries a function until it succeeds or the number of retries is reached.
 * @param fn function to retry
 * @param opts options
 * @returns
 */
export const retry = async <T extends (...args: any[]) => any>(
    fn: T,
    opts: {

        /**
         * Number of retries
         *
         * @default 3
         */
        retries: number,

        /**
         * Delay between retries
         *
         * @default 0
         */
        delay?: number,

        /**
         * Multiplier for the delay between retries
         *
         * @default 1
         */
        backoff?: number,

        /**
         * Function to determine if the function should be retried
         *
         * @param error error to check
         * @returns true if the function should be retried
         */
        shouldRetry?: (error: Error) => boolean
    }
) => {

    const {
        delay = 0,
        retries = 3,
        backoff = 1,
        shouldRetry = () => true
    } = opts;

    let attempts = 0;

    while (attempts < retries) {

        const [result, error] = await attempt(fn);

        if (result) {
            return result;
        }

        if (error && shouldRetry(error)) {

            await wait(delay * backoff);
            attempts++;

            continue;
        }

        throw error;
    }

    throw new Error('Max retries reached');
}