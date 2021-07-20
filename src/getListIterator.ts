import beforeCall from './beforeCall';
import delayed from './delayed';

export interface ListIteratorOptions {
  readonly delay?: number;
  readonly loop?: boolean;
}

export type NextOptions = ListIteratorOptions;

export interface ListIterator {
  readonly next: (options?: NextOptions) => void;
  readonly back: () => void;
  readonly isPending: boolean;
  /** Cancel delayed switch. */
  readonly cancel: VoidFunction;
}

export interface ListScope {
  readonly getCurrentIndex: () => number | Promise<number>;
  readonly getSize: () => number | Promise<number>;
}

export default function getListIterator(
  scope: ListScope,
  onSwitch: (nextIndex: number) => unknown,
  options?: ListIteratorOptions
): ListIterator {
  let nextIndex = -1;

  const selectNextTrack = async (loop?: boolean): Promise<void> => {
    const size = await scope.getSize();
    const currentIndex = await scope.getCurrentIndex();
    // eslint-disable-next-line no-nested-ternary
    const next = currentIndex === size - 1 ? (loop ? 0 : -1) : Math.min(currentIndex + 1, size - 1);
    if (next !== currentIndex) {
      nextIndex = next;
    }
  };

  const selectPrevTrack = async (loop?: boolean): Promise<void> => {
    const size = await scope.getSize();
    const currentIndex = await scope.getCurrentIndex();
    // eslint-disable-next-line no-nested-ternary
    const next = currentIndex === 0 ? (loop ? size - 1 : -1) : Math.min(currentIndex - 1, size - 1);
    if (next !== currentIndex) {
      nextIndex = next;
    }
  };

  const delayedNext = delayed(() => {
    // prevIndex = await scope.getCurrentIndex()
    onSwitch(nextIndex);
  }, 0);

  const cancel = (): void => delayedNext.cancel();

  const next: ListIterator['next'] = beforeCall(
    ({ delay = options?.delay } = {}) => {
      nextIndex >= 0 && delayedNext.delay(delay ?? 0);
    },
    ({ loop = options?.loop } = {}) => {
      return selectNextTrack(loop);
    }
  );

  const back: ListIterator['back'] = beforeCall(
    () => {
      cancel();
      nextIndex >= 0 && onSwitch(nextIndex);
    },
    () => {
      return selectPrevTrack();
    }
  );

  return {
    get isPending() {
      return delayedNext.isPending;
    },
    next,
    back,
    cancel,
  };
}
