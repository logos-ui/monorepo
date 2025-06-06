import {
    _nextTick,
    assert,
    hasSameConstructor,
    isFunction,
    isNonIterable,
    oneIsNonIterable
} from '../index.ts';

import {
    cloneHandlers,
    prepareCloneHandlers,
    HandleCloningOf
} from './cloneHandlers.ts';

import {
    equalityHandlers,
    prepareDeepEqualHandlers,
    HandleEquatingOf
} from './equalityhandlers.ts';

import {
    mergeHandlers,
    prepareMergeHandlers,
    HandleMergeOf,
    MergeOptions
} from './mergeHandlers.ts';

export * from './cloneHandlers.ts';
export * from './equalityhandlers.ts';
export * from './mergeHandlers.ts';

export type AnyConstructor = (
    { new(...args: any[]): any }
);


/**
 * Deep clones Objects, Arrays, Maps and Sets
 * @param original
 * @returns {any} Cloned value
 */
export const deepClone = <T>(original: T): T => {

    // Primatives do not have issues with hoisting
    if (
        isNonIterable(original) ||
        original instanceof Date ||
        original instanceof RegExp ||
        typeof original === 'function'
    ) {
        return original;
    }

    const cloneType = cloneHandlers.get(original!.constructor as AnyConstructor);

    if (!cloneType) {
        return original;
    }

    return cloneType(original);
};


/**
 * Recursively checks if there are changes in the current structure.
 * Returns immediately after detecting a single change.
 * @param change changed item
 * @param current current item
 */
export const deepEqual = (change: unknown, current: unknown): boolean => {

    // Non-iterables can be checked with basic js strict equality
    if (oneIsNonIterable(change, current)) return change === current;

    // A change in contructor means it changed
    if (
        !hasSameConstructor(change as AnyConstructor, current as AnyConstructor)
    )
        return false
    ;

    const cur = current as { constructor: AnyConstructor };

    // Check if these items are different from one another
    // Each contructor may have a special way of deepEqualing
    let typedeepEqualFunc = equalityHandlers.get(cur.constructor);

    // Handles GeneratorFunction and AsyncFunction
    if (
        !typedeepEqualFunc &&
        isFunction(change) &&
        isFunction(current)
    ) {

        typedeepEqualFunc = equalityHandlers.get(Function);
    }

    if (!typedeepEqualFunc) {

        return change === current;
    }

    return typedeepEqualFunc(change, current);
};

/**
 * overridable defaults for the merge function
 */
export const mergeDefaults: MergeOptions = {

    mergeArrays: true,
    mergeSets: true
};


/**
 * Deep merge Objects, Arrays, Maps and Sets
 * @param target
 * @param source
 */
export const deepMerge = <
    Target = any,
    Source = any
>(target: Target, source: Source, options: MergeOptions = {}) => {

    options = {
        ...mergeDefaults,
        ...options
    };

    // Primatives do not have issues with hoisting
    if (isNonIterable(source) || (source instanceof Date)) {
        return source;
    }

    if (hasSameConstructor(source, target)) {

        const mergeType = mergeHandlers.get(target!.constructor as AnyConstructor);

        // Warn about using specific types that are not supported
        if (!mergeType) {
            return target;
        }

        return mergeType(target, source, options);
    }

    return source;
};

prepareCloneHandlers(deepClone);
prepareDeepEqualHandlers(deepEqual);
prepareMergeHandlers(deepMerge);


type AddHandleForClone<T extends AnyConstructor> = (target: InstanceType<T>) => InstanceType<T>;
type AddHandlerForMerge<T extends AnyConstructor> = (target: InstanceType<T>, source: InstanceType<T>, opts?: MergeOptions) => InstanceType<T>;
type AddHandlerForEquals<T extends AnyConstructor> = (target: InstanceType<T>, source: InstanceType<T>) => boolean

interface AddHandlerFor {
    <T extends AnyConstructor>(
        fn: 'deepClone',
        cnstr: T,
        handler: AddHandleForClone<T>
    ): void
    <T extends AnyConstructor>(
        fn: 'deepMerge',
        cnstr: T,
        handler: AddHandlerForMerge<T>
    ): void
    <T extends AnyConstructor>(
        fn: 'deepEqual',
        cnstr: T,
        handler: AddHandlerForEquals<T>
    ): void
}

export const addHandlerFor: AddHandlerFor = (fn, cnstr, handler) => {

    assert(/deep(Clone|Merge|Equal)/.test(fn), 'invalid function name');
    assert(isFunction(handler), 'handler is not a function');

    if (fn === 'deepClone') {
        cloneHandlers.set(
            cnstr,
            handler as never
        );
    }

    if (fn === 'deepEqual') {
        equalityHandlers.set(
            cnstr,
            handler as never
        );
    }

    if (fn === 'deepMerge') {
        mergeHandlers.set(
            cnstr,
            handler as never
        );
    }
}
