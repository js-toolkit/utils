export type PendingTasks<K extends string> = { default: number } & PartialRecord<K, number>;

export interface TaskCounter<K extends string> {
  /** true - while has at least 1 running task by key. */
  isPending: (key?: keyof PendingTasks<K>) => boolean;
  /** true - while has at least 1 running task. */
  isAnyPending: () => boolean;
  push: (key?: keyof PendingTasks<K>) => void;
  pop: (key?: keyof PendingTasks<K>) => void;
  reset: (key?: keyof PendingTasks<K>) => void;
  resetAll: VoidFunction;
}

export interface TaskCounterOptions<K extends string> {
  pendingTasks?: PendingTasks<K> | undefined;
  resetTask?: ((tasks: Map<typeof key, number>, key: keyof PendingTasks<K>) => void) | undefined;
  onPending?: VoidFunction | undefined;
  onIdle?: VoidFunction | undefined;
  onStartTask?: ((task: keyof PendingTasks<K>) => void) | undefined;
  onEndTask?: ((task: keyof PendingTasks<K>) => void) | undefined;
}

function defaultResetTask<K extends string>(
  tasks: Map<typeof key, number>,
  key: keyof PendingTasks<K>
): void {
  if (key === 'default') {
    tasks.set('default', 0);
    return;
  }
  tasks.delete(key);
}

export function getTaskCounter<K extends string = never>({
  pendingTasks = { default: 0 },
  resetTask = defaultResetTask<K>,
  onPending,
  onIdle,
  onStartTask,
  onEndTask,
}: TaskCounterOptions<K>): TaskCounter<K> {
  const tasks = new Map<keyof PendingTasks<K>, number>(
    Object.entries(pendingTasks) as [keyof PendingTasks<K>, number][]
  );

  const isPending = (key: keyof PendingTasks<K> = 'default'): boolean => {
    // console.log('calc pending', key, this.pendingTasks[key]);
    return (tasks.get(key) ?? 0) > 0;
  };

  const isAnyPending = (): boolean => {
    // console.log('calc any pending', key, this.pendingTasks[key]);
    return tasks.values().some((count) => count > 0);
  };

  const push = (key: keyof PendingTasks<K> = 'default'): void => {
    // console.log('push', key);
    const hasAny = isAnyPending();
    const hasTask = isPending(key);
    tasks.set(key, (tasks.get(key) ?? 0) + 1);
    !hasTask && onStartTask?.(key);
    !hasAny && onPending?.();
  };

  const pop = (key: keyof PendingTasks<K> = 'default'): void => {
    // console.log('pop', key);
    if (!isPending(key)) return;
    tasks.set(key, (tasks.get(key) ?? 1) - 1);
    !isPending(key) && onEndTask?.(key);
    !isAnyPending() && onIdle?.();
  };

  const reset = (key: keyof PendingTasks<K> = 'default'): void => {
    if (!isPending(key)) return;
    resetTask(tasks, key);
    onEndTask?.(key);
    !isAnyPending() && onIdle?.();
  };

  const resetAll = (): void => {
    if (!isAnyPending()) return;
    tasks.keys().forEach(reset);
  };

  const counter: TaskCounter<K> = {
    isPending,
    isAnyPending,
    push,
    pop,
    reset,
    resetAll,
  };

  return counter;
}
