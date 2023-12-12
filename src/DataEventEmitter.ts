/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-use-before-define */
import EventEmitter from 'eventemitter3';

export interface DataEvent<Type, Data, Target> {
  type: Type;
  data: Data;
  target: Target;
}

type EventArgs = [any] | [any?] | [];

type EventMap = Record<string, EventArgs | DataEvent<string, any, any>>;

export type ConvertToDataEventMap<
  EventTypes extends string | symbol | EventMap,
  Target, // extends DataEventEmitter<EventTypes, Target>,
> = EventTypes extends string | symbol
  ? Record<EventTypes, [DataEvent<string, unknown, Target>]>
  : {
      [P in keyof EventTypes]: EventTypes[P] extends [DataEvent<string, any, any>]
        ? [data: DataEvent<P, EventTypes[P][0]['data'], Target>]
        : EventTypes[P] extends DataEvent<string, any, any>
          ? [data: DataEvent<P, EventTypes[P]['data'], Target>]
          : [
              data: DataEvent<
                P,
                EventTypes[P] extends EventArgs ? EventTypes[P][0] : unknown,
                Target
              >,
            ];
    };

type ExtractTuple<T extends Record<string, EventArgs>> = {
  [P in keyof T]: T[P][0];
};

export type DataEventMap<
  Map extends EventMap,
  Target, // extends DataEventEmitter<Map, Target>,
> = ExtractTuple<ConvertToDataEventMap<Map, Target>>;

export type DataEventListener<
  EventTypes extends string | symbol | EventMap,
  K extends EventEmitter.EventNames<ConvertToDataEventMap<EventTypes, Target>>,
  Target, // extends DataEventEmitter<EventTypes, Target>,
> = EventEmitter.EventListener<ConvertToDataEventMap<EventTypes, Target>, K>;

type NormalizeEventTypes<EventTypes extends string | symbol | EventMap> =
  EventTypes extends EventMap
    ? EventTypes extends Record<string, DataEvent<string, any, any>>
      ? {
          [P in keyof EventTypes]: Exclude<EventTypes[P]['data'], undefined> extends never
            ? []
            : IfExtends<
                EventTypes[P]['data'],
                undefined,
                [data?: EventTypes[P]['data'] | undefined],
                [data: EventTypes[P]['data']]
              >;
        }
      : EventTypes
    : EventTypes;

export class DataEventEmitter<
  EventTypes extends string | symbol | EventMap,
  Target extends Pick<
    DataEventEmitter<EventTypes, Target, Context>,
    'on' | 'once' | 'off' | 'removeAllListeners' | 'emit'
  > = DataEventEmitter<EventTypes, any, any>,
  Context = any,
> extends EventEmitter<ConvertToDataEventMap<EventTypes, Target>, Context> {
  // @ts-ignore
  emit<T extends EventEmitter.EventNames<NormalizeEventTypes<EventTypes>>>(
    event: T,
    ...args: EventEmitter.EventArgs<NormalizeEventTypes<EventTypes>, T>
  ): boolean {
    // Replace event data with type and data
    const data = args[0] as EventEmitter.EventArgs<NormalizeEventTypes<EventTypes>, T>[0];
    const eventObject: DataEvent<T, typeof data, this> = { type: event, data, target: this };
    return super.emit(
      event as unknown as EventEmitter.EventNames<ConvertToDataEventMap<EventTypes, Target>>,
      ...([eventObject as unknown] as Parameters<
        DataEventListener<
          EventTypes,
          EventEmitter.EventNames<ConvertToDataEventMap<EventTypes, Target>>,
          Target
        >
      >)
    );
  }
}
