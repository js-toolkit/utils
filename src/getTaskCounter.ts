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
  resetTask?:
    | ((
        tasks: NonNullable<this['pendingTasks']>,
        key: keyof NonNullable<this['pendingTasks']>
      ) => void)
    | undefined;
  onPending?: VoidFunction | undefined;
  onIdle?: VoidFunction | undefined;
  onStartTask?: ((task: keyof NonNullable<this['pendingTasks']>) => void) | undefined;
  onEndTask?: ((task: keyof NonNullable<this['pendingTasks']>) => void) | undefined;
}

export function getTaskCounter<K extends string = never>({
  pendingTasks = { default: 0 },
  resetTask = (tasks, key) => {
    /* eslint-disable no-param-reassign */
    if (key === 'default') {
      tasks.default = 0;
      return;
    }
    delete tasks[key];
  },
  onPending,
  onIdle,
  onStartTask,
  onEndTask,
}: TaskCounterOptions<K>): TaskCounter<K> {
  const tasks = pendingTasks;

  const isPending = (key: keyof PendingTasks<K> = 'default'): boolean => {
    // console.log('calc pending', key, this.pendingTasks[key]);
    return (tasks[key] ?? 0) > 0;
  };

  const isAnyPending = (): boolean => {
    // console.log('calc any pending', key, this.pendingTasks[key]);
    return Object.values(tasks).some((count) => count > 0);
  };

  const push = (key: keyof PendingTasks<K> = 'default'): void => {
    // console.log('push', key);
    const hasAny = isAnyPending();
    const hasTask = isPending(key);
    tasks[key] = ((tasks[key] ?? 0) + 1) as PendingTasks<K>[typeof key];
    !hasTask && onStartTask && onStartTask(key);
    !hasAny && onPending && onPending();
  };

  const pop = (key: keyof PendingTasks<K> = 'default'): void => {
    // console.log('pop', key);
    if (!isPending(key)) return;
    tasks[key] = ((tasks[key] as number) - 1) as PendingTasks<K>[typeof key];
    !isPending(key) && onEndTask && onEndTask(key);
    !isAnyPending() && onIdle && onIdle();
  };

  const reset = (key: keyof PendingTasks<K> = 'default'): void => {
    if (!isPending(key)) return;
    resetTask(tasks, key);
    onEndTask && onEndTask(key);
    !isAnyPending() && onIdle && onIdle();
  };

  const resetAll = (): void => {
    if (!isAnyPending()) return;
    const keys = Object.getOwnPropertyNames(tasks) as (keyof PendingTasks<K>)[];
    keys.forEach(reset);
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
