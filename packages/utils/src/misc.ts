import { Func, Truthy } from './types';

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

/**
 * Browser implementation of `process.nextTick`
 * @param {function} fn
 */
export const _nextTick = (fn: Func) => {

    nextTickQueue.push(fn);
    window?.postMessage('process-tick', '*');
};

/**
 * Checks if value is a function or an object
 * @param val
 * @returns
 */
export const isFunctionOrObject = <T extends Function | Object>(val: T): boolean => (
    val.constructor === Function ||
    val.constructor === Object
);

/**
 * Checks if value is specifically undefined
 * @param val
 * @returns
 */
export const isUndefined = (val: unknown) => val === undefined;

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

/**
 * Checks if the current environment is NodeJS
 */
export const isNode = () => !!(
    global && global.process
);


export const safely = async <T, E extends Error>(fn: Promise<T> | (() => T)) => {

    try {
        return {
            error: null,
            result: await ((fn instanceof Function) ? fn() : fn),
        }
    }
    catch (err) {
        return {
            error: err as E,
            result: null
        }
    }
}