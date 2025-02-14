import { clear } from './clear';

type EventArgs = [any] | [any?] | [];

type EventMap = Record<string, EventArgs | EventEmitter.DataEvent<string, any, any>>;

type GetEventObjectTuple<Map extends EventMap, K extends keyof Map, Target> = Map[K] extends [
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

type GetEventDataTuple<Map extends EventMap, K extends keyof Map> = ToArgs<
  GetEventObjectTuple<Map, K, any>[0]['data']
>;

interface EE {
  readonly fn: AnyFunction;
  readonly once: boolean;
}

type DataEventNames<T extends string | symbol | EventMap> = T extends string | symbol ? T : keyof T;

type Events<EventTypes extends string | symbol | EventMap> = PartialRecord<
  DataEventNames<EventTypes>,
  Map<EventEmitter.DataEventListener<EventTypes, any, any>, EE>
>;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace EventEmitter {
  export interface DataEvent<Type, Data, Target> {
    type: Type;
    data: Data;
    target: Target;
  }

  export type DataEventMap<Map extends EventMap, Target> = {
    [P in keyof Map]: GetEventObjectTuple<Map, P, Target>[0];
  };

  type Listener<Args extends any[]> = (...args: Args) => void;

  export type DataEventListener<
    EventTypes extends string | symbol | EventMap,
    K extends DataEventNames<EventTypes>,
    Target,
  > = EventTypes extends EventMap
    ? Listener<[event: DataEventMap<EventTypes, Target>[Extract<K, keyof EventTypes>]]>
    : Listener<[event: EventEmitter.DataEvent<EventTypes, unknown, Target>]>;

  export type DataEventArgs<
    EventTypes extends string | symbol | EventMap,
    K extends DataEventNames<EventTypes>,
  > = EventTypes extends EventMap
    ? GetEventDataTuple<EventTypes, Extract<K, keyof EventTypes>>
    : [unknown?];

  export type EventListeners<EventTypes extends string | symbol | EventMap, Target> = {
    [P in DataEventNames<EventTypes>]: DataEventListener<EventTypes, P, Target>[];
  };

  export interface Options {
    /** Defaults to `true`. */
    readonly ignoreListenerError?: boolean | undefined;
  }

  export interface AddEventListenerOptions {
    readonly once?: boolean;
  }
}

const optionsKey = Symbol.for('@_EventEmitter.options');
const eventsKey = Symbol.for('@_EventEmitter.events');

export class EventEmitter<
  EventTypes extends string | symbol | EventMap,
  Target extends Pick<
    EventEmitter<EventTypes, Target>,
    'on' | 'once' | 'off' | 'removeAllListeners' | 'emit'
  > = EventEmitter<EventTypes, any>,
> {
  private readonly [optionsKey]: EventEmitter.Options;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  private readonly [eventsKey]: Events<EventTypes> = Object.create(null);

  constructor(options?: EventEmitter.Options) {
    this[optionsKey] = { ...options, ignoreListenerError: options?.ignoreListenerError ?? true };
  }

  getEventListeners(): EventEmitter.EventListeners<EventTypes, Target> {
    return Object.getOwnPropertyNames(this[eventsKey]).reduce(
      (acc, key) => {
        const ev = key as keyof Events<EventTypes>;
        acc[ev] = this[eventsKey][ev]!.keys().toArray();
        return acc;
      },
      {} as EventEmitter.EventListeners<EventTypes, Target>
    );
  }

  getListenerCount<T extends DataEventNames<EventTypes>>(event: T): number {
    return this[eventsKey][event]?.size ?? 0;
  }

  on<T extends DataEventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.DataEventListener<EventTypes, T, Target>,
    options?: EventEmitter.AddEventListenerOptions
  ): this {
    const map =
      this[eventsKey][event] ??
      new Map<EventEmitter.DataEventListener<EventTypes, T, Target>, EE>();
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

  once<T extends DataEventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.DataEventListener<EventTypes, T, Target>
  ): this {
    return this.on(event, fn, { once: true });
  }

  off<T extends DataEventNames<EventTypes>>(
    event: T,
    fn?: EventEmitter.DataEventListener<EventTypes, T, Target>
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

  removeAllListeners(event?: DataEventNames<EventTypes>): this {
    if (event) {
      return this.off(event);
    }
    clear(this[eventsKey]);
    return this;
  }

  removeAllListenersBut(...events: DataEventNames<EventTypes>[]): this {
    if (events.length === 0) {
      return this.removeAllListeners();
    }
    const set = new Set(events);
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in this[eventsKey]) {
      const ev = key as DataEventNames<EventTypes>;
      if (!set.has(ev)) {
        this.off(ev);
      }
    }
    return this;
  }

  emit<T extends DataEventNames<EventTypes>>(
    event: T,
    ...args: EventEmitter.DataEventArgs<EventTypes, T>
  ): boolean {
    const map = this[eventsKey][event];
    if (!map) return false;
    // Replace event data with type and data
    const data = args[0] as EventEmitter.DataEventArgs<EventTypes, T>[0];
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
