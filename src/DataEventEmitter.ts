/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-use-before-define */
import EventEmitter from 'eventemitter3';

export interface DataEvent<Type, Data, Target> {
  type: Type;
  data: Data;
  target: Target;
}

type EventMap = Record<string, [any] | [] | DataEvent<string, any, any>>;

export type ConvertToDataEventMap<
  EventTypes extends string | symbol | EventMap,
  Target extends DataEventEmitter<EventTypes, Target>
> = EventTypes extends string | symbol
  ? Record<EventTypes, [DataEvent<string, unknown, Target>]>
  : {
      [P in keyof EventTypes]: EventTypes[P] extends [DataEvent<string, any, any>]
        ? [DataEvent<P, EventTypes[P][0]['data'], Target>]
        : EventTypes[P] extends DataEvent<string, any, any>
        ? [DataEvent<P, EventTypes[P]['data'], Target>]
        : [DataEvent<P, EventTypes[P] extends [any] | [] ? EventTypes[P][0] : unknown, Target>];
    };

type ExtractTuple<T extends Record<string, [any] | []>> = {
  [P in keyof T]: T[P][0];
};

export type DataEventMap<
  Map extends EventMap,
  Target extends DataEventEmitter<Map, Target>
> = ExtractTuple<ConvertToDataEventMap<Map, Target>>;

export type DataEventListener<
  EventTypes extends string | symbol | EventMap,
  K extends EventEmitter.EventNames<ConvertToDataEventMap<EventTypes, Target>>,
  Target extends DataEventEmitter<EventTypes, Target>
> = EventEmitter.EventListener<ConvertToDataEventMap<EventTypes, Target>, K>;

export default class DataEventEmitter<
  EventTypes extends string | symbol | EventMap,
  Target extends DataEventEmitter<EventTypes, Target, Context> = DataEventEmitter<
    EventTypes,
    any,
    any
  >,
  Context = any
> extends EventEmitter<ConvertToDataEventMap<EventTypes, Target>, Context> {
  // @ts-ignore
  emit<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    ...args: EventEmitter.EventArgs<EventTypes, T>
  ): boolean {
    // Replace event data with type and data
    const data = args[0] as EventEmitter.EventArgs<EventTypes, T>[0];
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
