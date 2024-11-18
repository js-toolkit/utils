import type { DebounceSettings, DebouncedFunc as DebouncedFuncOrigin } from 'lodash';
import origin from 'lodash.debounce';
import { beforeCall } from './beforeCall';

export interface DebouncedFunc<T extends AnyFunction> extends DebouncedFuncOrigin<T> {
  isPending: boolean;
}

export function debounce<T extends AnyFunction>(
  fn: T,
  wait?: number,
  options?: DebounceSettings
): DebouncedFunc<T> {
  let pending = false;

  const unpending = (): void => {
    pending = false;
  };

  const debounced = beforeCall(origin(beforeCall(fn, unpending), wait, options), () => {
    pending = true;
  }) as DebouncedFunc<T>;

  debounced.isPending = pending;
  debounced.cancel = beforeCall(debounced.cancel.bind(debounced), unpending);

  Object.defineProperty(debounced, 'isPending', {
    get() {
      return pending;
    },
  });

  return debounced;
}
