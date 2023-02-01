import { beforeCall } from './beforeCall';
import { delayed } from './delayed';

export interface ListIteratorOptions {
  readonly delay?: number | undefined;
  readonly loop?: boolean | undefined;
}

export type NextOptions = ListIteratorOptions;
type GetNextOptions = Pick<NextOptions, 'loop'>;

export interface ListIterator {
  readonly next: (options?: NextOptions | undefined) => Promise<void>;
  readonly back: () => Promise<void>;
  readonly isCanNext: (options?: GetNextOptions | undefined) => Promise<boolean>;
  readonly isCanBack: (options?: GetNextOptions | undefined) => Promise<boolean>;
  /** Pending for next */
  readonly isPending: boolean;
  /** Cancel the delayed switch. */
  readonly cancel: VoidFunction;
}

export interface ListScope {
  readonly getCurrentIndex: () => number | Promise<number>;
  readonly getSize: () => number | Promise<number>;
}

export function getListIterator(
  scope: ListScope,
  onSwitch: (nextIndex: number) => unknown,
  options?: ListIteratorOptions | undefined
): ListIterator {
  let nextIndex = -1;

  const getNextItem = async (loop?: boolean | undefined): Promise<number> => {
    const [size, currentIndex] = await Promise.all([scope.getSize(), scope.getCurrentIndex()]);
    // eslint-disable-next-line no-nested-ternary
    const next = currentIndex === size - 1 ? (loop ? 0 : -1) : Math.min(currentIndex + 1, size - 1);
    return next;
  };

  const getPrevItem = async (loop?: boolean | undefined): Promise<number> => {
    const [size, currentIndex] = await Promise.all([scope.getSize(), scope.getCurrentIndex()]);
    // eslint-disable-next-line no-nested-ternary
    const next = currentIndex === 0 ? (loop ? size - 1 : -1) : Math.min(currentIndex - 1, size - 1);
    return next;
  };

  const isCanNext = async (opts?: GetNextOptions | undefined): Promise<boolean> => {
    return (await getNextItem(opts?.loop)) >= 0;
  };

  const isCanBack = async (opts?: GetNextOptions | undefined): Promise<boolean> => {
    return (await getPrevItem(opts?.loop)) >= 0;
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
    async ({ loop = options?.loop } = {}) => {
      nextIndex = await getNextItem(loop);
    }
  );

  const back: ListIterator['back'] = beforeCall(
    () => {
      nextIndex >= 0 && onSwitch(nextIndex);
    },
    async () => {
      cancel();
      nextIndex = await getPrevItem();
    }
  );

  return {
    get isPending() {
      return delayedNext.isPending;
    },
    next,
    back,
    isCanNext,
    isCanBack,
    cancel,
  };
}

export default getListIterator;
