import { Func, MaybePromise, assert } from '@logos-ui/utils';
import { html } from './';
import { GlobalEvents } from './events';
import { EvListener } from './events';

/**
 * Appends children to the parent element
 * @param parent
 * @param children
 */
export const appendIn = (parent: Element, ...children: (Element | Node)[]) => {

    while (children.length) {

        // https://stackoverflow.com/questions/54496398/typescript-type-string-undefined-is-not-assignable-to-type-string
        const child = children.shift()!;
        parent.appendChild(child);
    }
};

/**
 * Appends elements after the target element
 * @param target
 * @param elements
 */
export const appendAfter = (target: Element, ...elements: Element[]) => {

    while (elements.length) {

        const el = elements.shift()!;
        target.after(el);
        target = el;
    }
};

/**
 * Appends elements after the target element
 * @param target
 * @param elements
 */
export const appendBefore = (target: Element, ...elements: Element[]) => {

    while (elements.length) {

        const el = elements.shift()!;
        target.before(el);
        target = el;
    }
};

/**
 * Receives a form to clone, and a callback to manipulate the clone.
 * Appends a hidden form to DOM and then submits.
 * @param {HTMLFormElement} form The form element
 * @param {Function} changeCb The callback that will be passed cloned form
 */
export const cloneAndSubmitForm = <T extends HTMLFormElement>(
    form: T,
    changeCb: (form: T) => MaybePromise<void>
) => {


    html.events.on(form, 'submit', async (e) => {

        e.preventDefault();

        const clone = form.cloneNode(true) as T;

        changeCb && (await changeCb(clone));

        html.css.set(clone, { display: 'none'});
        document.body.appendChild(clone);
        clone.submit();
    });
};

/**
 * Triggers then given function when the DOMContentLoaded
 * event is triggered.
 * @param fn
 */
export const onceReady = (fn: Func) => {

    window?.addEventListener('DOMContentLoaded', fn);
}

/**
 * Copy given text to clipboard
 * @param text
 */
export const copyToClipboard = (text: string) => {

    navigator.clipboard.writeText(text);
};

/**
 * Shortcut to `document.createElement(...)`
 * @param args
 * @returns
 */
export const createEl: Document['createElement'] = (...args: Parameters<Document['createElement']>) => {

    return document.createElement(...args);
}

type CreateElWithOpts<CustomHtmlEvents> = {
    text?: string,
    class?: string[],
    attrs?: Record<string, string>,
    domEvents?: { [E in keyof GlobalEventHandlersEventMap]?: EvListener<E> },
    customEvents?: CustomHtmlEvents,
    css?: Partial<CSSStyleDeclaration>
}

/**
 * Create an HTML element and attach attributes, css, events, classes.
 * Attaches `cleanup()` function for later detaching event listeners.
 * @param opts
 * @returns
 *
 * @example
 *
 * const myForm = createElWith('form', {
 *     text: 'inner text',
 *     attrs: {
 *         method: 'post',
 *         acton: '/login'
 *     },
 *     css: {
 *         background: 'red',
 *     },
 *     class: ['form'],
 *     domEvents: {
 *         reset: (e) => {},
 *         submit: (e) => {}
 *     },
 *     customEvents: {
 *         bounce: (e) => {}
 *     }
 * });
 *
 * // unbind events
 * myForm.cleanup();
 */
export const createElWith = <
    CustomHtmlEvents extends Record<string, (e: Event) => any>,
    N extends Parameters<Document['createElement']>[0],
>(
    name: N, opts: CreateElWithOpts<CustomHtmlEvents> = {}
) => {

    const el = createEl(name);

    assert(!!el, 'invalid element');
    assert(!opts.class || Array.isArray(opts.class), 'invalid opts.class');
    assert(!opts.attrs || typeof opts.attrs === 'object', 'invalid opts.attrs');
    assert(!opts.domEvents || typeof opts.domEvents === 'object', 'invalid opts.events');
    assert(!opts.customEvents || typeof opts.customEvents === 'object', 'invalid opts.events');
    assert(!opts.css || typeof opts.css === 'object', 'invalid opts.css');
    assert(!opts.text || typeof opts.text === 'string', 'invalid opts.text');

    if (opts.text && opts.text.length) {

        appendIn(el, document.createTextNode(opts.text));
    }

    if (opts.class && opts.class.length) {

        el.classList.add(...opts.class);
    }

    if (opts.css) {
        html.css.set(el, opts.css);
    }

    if (opts.attrs) {
        html.attrs.set(el, opts.attrs);
    }

    /**
     * Cleans up events, if any were passed
     * @returns
     */
    let cleanup = () => null as any;

    const attachEventsFor = (
        events: [string, EvListener<any>][]
    ) => {

        const entries = Object.entries(events);

        const cleaupCbs = entries.map(
            ([ev, fn]) => html.events.add(el, ev, fn as any)
        );

        const originalCleanup = cleanup;
        cleanup = () => {

            originalCleanup();
            cleaupCbs.forEach(cleanUp => cleanUp());
        };
    }

    if (opts.domEvents) {

        attachEventsFor(Object.entries(opts.domEvents));
    }

    if (opts.customEvents) {

        attachEventsFor(Object.entries(opts.customEvents));
    }

    const returnEl = el as (
        N extends keyof HTMLElementDeprecatedTagNameMap
        ? HTMLElementDeprecatedTagNameMap[N]
        : N extends keyof HTMLElementTagNameMap
            ? HTMLElementTagNameMap[N]
            : HTMLElement
    ) & { cleanup: typeof cleanup };

    return returnEl
};