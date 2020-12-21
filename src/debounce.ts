import type { DebounceSettings, DebouncedFunc as DebouncedFuncOrigin } from 'lodash';
import origin from 'lodash.debounce';
import beforeCall from './beforeCall';

export interface DebouncedFunc<T extends AnyFunction> extends DebouncedFuncOrigin<T> {
  isPending: boolean;
}

export default function debounce<T extends AnyFunction>(
  fn: T,
  wait?: number,
  options?: DebounceSettings
): DebouncedFunc<T> {
  const unpending = (): void => {
    // eslint-disable-next-line no-use-before-define
    debounced.isPending = false;
  };

  const debounced = beforeCall(origin(beforeCall(fn, unpending), wait, options), () => {
    debounced.isPending = true;
  }) as DebouncedFunc<T>;

  debounced.isPending = false;
  debounced.cancel = beforeCall(debounced.cancel.bind(debounced), unpending);
  return debounced;
}
