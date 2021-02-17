export type PendingTasks<K extends string> = { default: number } & PartialRecord<K, number>;

export interface TaskCounter<K extends string> {
  /** true - while has at least 1 running task by key. */
  isPending: (key?: keyof PendingTasks<K>) => boolean;
  /** true - while has at least 1 running task. */
  isAnyPending: () => boolean;
  push: (key?: keyof PendingTasks<K>) => void;
  pop: (key?: keyof PendingTasks<K>) => void;
  reset: (key?: keyof PendingTasks<K>) => void;
  resetAll: () => void;
}

export default function getTaskCounter<K extends string = never>(
  pendingTasks: PendingTasks<K> = { default: 0 },
  resetTask = (tasks: typeof pendingTasks, key: keyof typeof pendingTasks) => {
    /* eslint-disable no-param-reassign */
    if (key === 'default') {
      tasks.default = 0;
      return;
    }
    delete tasks[key];
  }
): TaskCounter<K> {
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
    tasks[key] = ((tasks[key] ?? 0) + 1) as PendingTasks<K>[typeof key];
  };

  const pop = (key: keyof PendingTasks<K> = 'default'): void => {
    // console.log('pop', key);
    if (!isPending(key)) return;
    tasks[key] = ((tasks[key] as number) - 1) as PendingTasks<K>[typeof key];
  };

  const reset = (key: keyof PendingTasks<K> = 'default'): void => {
    if (!isPending(key)) return;
    resetTask(tasks, key);
  };

  const resetAll = (): void => {
    if (!isAnyPending()) return;
    Object.getOwnPropertyNames(tasks).forEach((key) =>
      resetTask(tasks, key as keyof PendingTasks<K>)
    );
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
