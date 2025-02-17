import { EventEmitter } from '../EventEmitter';

type EventMap = { event1: []; event2: [{ a: string }] };

const emitter = new EventEmitter<EventMap>({
  ignoreListenerError: true,
});

const event1Handler = jest.fn<void, [EventEmitter.DataEventMap<EventMap, any>['event1']]>();
const event2Handler = jest.fn<void, [EventEmitter.DataEventMap<EventMap, any>['event2']]>();

test('Add 2 same handlers', () => {
  emitter.on('event1', event1Handler);
  emitter.on('event1', event1Handler);
  emitter.on('event2', event2Handler);
  expect(emitter.getListenerCount('event1')).toBe(1);
});

test('Remove event1 listener', () => {
  emitter.off('event1', event1Handler);
  expect(emitter.getListenerCount('event1')).toBe(0);
});

test('Remove all listeners but event2', () => {
  emitter.on('event1', event1Handler);
  emitter.on('event2', event2Handler);
  emitter.removeAllListenersBut('event2');
  expect(emitter.getListenerCount('event2')).toBe(1);
});

test('Remove all listeners', () => {
  emitter.on('event1', event1Handler);
  emitter.on('event2', event2Handler);
  emitter.removeAllListeners();
  expect(emitter.getListenerCount()).toBe(0);
});

test('Should handle only event1', () => {
  emitter.on('event1', event1Handler);
  emitter.emit('event1');
  emitter.emit('event2', { a: '' });
  expect(event1Handler).toHaveBeenCalledTimes(1);
});

test('Once only [event1]', () => {
  emitter.once('event1', event1Handler);
  emitter.emit('event1');
  expect(event1Handler).toHaveBeenCalledTimes(1);
  expect(emitter.getListenerCount('event1')).toBe(0);
});
