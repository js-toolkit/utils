/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import { clear } from './clear';

type EventArgs = [any] | [any?] | [];

type EventObjects = Record<string, EventArgs | EventEmitter.DataEvent<string, any, any>>;

type GetEventObjectTuple<Map extends EventObjects, K extends keyof Map, Target> = Map[K] extends [
  EventEmitter.DataEvent<any, any, any>,
]
  ? [data: EventEmitter.DataEvent<K, Map[K][0]['data'], Target>]
  : Map[K] extends EventEmitter.DataEvent<any, any, any>
    ? [data: EventEmitter.DataEvent<K, Map[K]['data'], Target>]
    : [data: EventEmitter.DataEvent<K, Map[K] extends EventArgs ? Map[K][0] : unknown, Target>];

type ToArgs<Data> = IfExtends<
  Exclude<Data, undefined>,
  never,
  [],
  IfExtends<Data, undefined, [Data?], [Data]>
>;

type GetEventDataTuple<Map extends EventObjects, K extends keyof Map> = ToArgs<
  GetEventObjectTuple<Map, K, any>[0]['data']
>;

interface EE {
  readonly fn: AnyFunction;
  readonly once: boolean;
}

type EventNames<T extends string | symbol | EventObjects> = T extends string | symbol ? T : keyof T;

type EmitArgs<
  EventTypes extends string | symbol | EventObjects,
  K extends EventNames<EventTypes>,
> = EventTypes extends EventObjects
  ? GetEventDataTuple<EventTypes, Extract<K, keyof EventTypes>>
  : [unknown?];

type Events<EventTypes extends string | symbol | EventObjects> = PartialRecord<
  EventNames<EventTypes>,
  Map<EventEmitter.EventListener<EventTypes, any, any>, EE>
>;

const optionsKey = Symbol.for('@_EventEmitter.options');
const eventsKey = Symbol.for('@_EventEmitter.events');
const setOptionsKey = Symbol.for('@_EventEmitter.setOptions');
const getOptionsKey = Symbol.for('@_EventEmitter.getOptions');

export class EventEmitter<
  EventTypes extends string | symbol | EventObjects,
  Target extends Pick<
    EventEmitter<EventTypes, Target>,
    'on' | 'once' | 'off' | 'removeAllListeners' | 'emit'
  > = EventEmitter<EventTypes, any>,
> {
  static readonly symbols = {
    setOptions: setOptionsKey,
    getOptions: getOptionsKey,
  };

  private readonly [optionsKey]: RequiredStrict<EventEmitter.Options>;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  private readonly [eventsKey]: Events<EventTypes> = Object.create(null);

  constructor(options?: EventEmitter.Options) {
    this[optionsKey] = { ...options, ignoreListenerError: options?.ignoreListenerError ?? true };
  }

  [getOptionsKey](): EventEmitter.Options {
    return this[optionsKey];
  }

  [setOptionsKey](options: Partial<EventEmitter.Options>): this {
    const prev = this[optionsKey];
    Object.assign(this[optionsKey], {
      ignoreListenerError: options.ignoreListenerError ?? prev.ignoreListenerError,
    });
    return this;
  }

  getEventListeners(): EventEmitter.EventListeners<EventTypes, Target> {
    return Object.getOwnPropertyNames(this[eventsKey]).reduce(
      (acc, key) => {
        const ev = key as keyof Events<EventTypes>;
        acc[ev] = this[eventsKey][ev]!.keys().toArray();
        return acc;
      },
      Object.create(null) as EventEmitter.EventListeners<EventTypes, Target>
    );
  }

  getListenerCount<T extends EventNames<EventTypes>>(event?: T): number {
    if (event) return this[eventsKey][event]?.size ?? 0;
    let count = 0;
    for (const key in this[eventsKey]) {
      count += this.getListenerCount(key as EventNames<EventTypes>);
    }
    return count;
  }

  on<T extends EventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T, Target>,
    options?: EventEmitter.AddEventListenerOptions
  ): this {
    const map =
      this[eventsKey][event] ?? new Map<EventEmitter.EventListener<EventTypes, T, Target>, EE>();
    const ee = map.get(fn);
    // Recreate if once different.
    if (ee && ee.once === !!options?.once) return this;

    // const nextFn = this.options.ignoreListenerError
    //   ? (function wrappedFn(...agrs: Parameters<typeof fn>) {
    //       try {
    //         fn(...agrs);
    //       } catch (error) {
    //         console.error(error);
    //       }
    //     } as typeof fn)
    //   : fn;
    // map.set(fn, { fn: nextFn, once: !!options?.once });

    map.set(fn, { fn, once: !!options?.once });

    this[eventsKey][event] = map;
    return this;
  }

  once<T extends EventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T, Target>
  ): this {
    return this.on(event, fn, { once: true });
  }

  off<T extends EventNames<EventTypes>>(
    event: T,
    fn?: EventEmitter.EventListener<EventTypes, T, Target>
  ): this {
    const map = this[eventsKey][event];
    if (map) {
      if (fn) map.delete(fn);
      if (!fn || map.size === 0) {
        delete this[eventsKey][event];
      }
    }
    return this;
  }

  removeAllListeners(event?: EventNames<EventTypes>): this {
    if (event) {
      return this.off(event);
    }
    clear(this[eventsKey]);
    return this;
  }

  removeAllListenersBut(...events: EventNames<EventTypes>[]): this {
    if (events.length === 0) {
      return this.removeAllListeners();
    }
    const set = new Set(events);
    for (const key in this[eventsKey]) {
      const ev = key as EventNames<EventTypes>;
      if (!set.has(ev)) {
        this.off(ev);
      }
    }
    return this;
  }

  emit<T extends EventNames<EventTypes>>(event: T, ...args: EmitArgs<EventTypes, T>): boolean {
    const map = this[eventsKey][event];
    if (!map) return false;
    // Replace event data with type and data
    const data = args[0] as EmitArgs<EventTypes, T>[0];
    const eventObject: EventEmitter.DataEvent<T, typeof data, this> = {
      type: event,
      data,
      target: this,
    };
    map.forEach((ee, originFn) => {
      if (ee.once) {
        this.off(event, originFn);
      }
      try {
        ee.fn(eventObject);
      } catch (error) {
        if (this[optionsKey].ignoreListenerError) console.error(error);
        else throw error;
      }
    });
    return true;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace EventEmitter {
  export interface DataEvent<Type, Data, Target> {
    type: Type;
    data: Data;
    target: Target;
  }

  export type EventMap<Map extends EventObjects, Target> = {
    [P in keyof Map]: GetEventObjectTuple<Map, P, Target>[0];
  };

  type Listener<Args extends any[]> = (...args: Args) => void;

  export type EventListener<
    EventTypes extends string | symbol | EventObjects,
    K extends EventNames<EventTypes>,
    Target,
  > = EventTypes extends EventObjects
    ? Listener<[event: EventMap<EventTypes, Target>[Extract<K, keyof EventTypes>]]>
    : Listener<[event: EventEmitter.DataEvent<EventTypes, unknown, Target>]>;

  export type EventListeners<EventTypes extends string | symbol | EventObjects, Target> = {
    [P in EventNames<EventTypes>]: EventListener<EventTypes, P, Target>[];
  };

  export interface Options {
    /** Defaults to `true`. */
    readonly ignoreListenerError?: boolean | undefined;
  }

  export interface AddEventListenerOptions {
    readonly once?: boolean | undefined;
  }

  // export const symbols = {
  //   setOptions: Symbol.for('@_EventEmitter.setOptions'),
  //   getOptions: Symbol.for('@_EventEmitter.getOptions'),
  // };
}
