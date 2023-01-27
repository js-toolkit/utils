import { beforeCall } from './beforeCall';
import { delayed } from './delayed';

export interface TreeIteratorOptions {
  readonly delay?: number;
  readonly loop?: boolean;
}

export type NextOptions = Pick<TreeIteratorOptions, 'delay' | 'loop'>;
type GetNextOptions = Pick<NextOptions, 'loop'>;

export interface TreeIterator<N extends AnyObject, SN extends N = N> {
  readonly next: (options?: NextOptions) => void;
  readonly back: (options?: NextOptions) => void;
  readonly getNext: (options?: GetNextOptions) => SN | undefined;
  readonly getBack: (options?: GetNextOptions) => SN | undefined;
  readonly isCanNext: (options?: GetNextOptions) => boolean;
  readonly isCanBack: (options?: GetNextOptions) => boolean;
  readonly isPending: boolean;
  /** Cancel the delayed switch. */
  readonly cancel: VoidFunction;
}

export interface TreeScope<N extends AnyObject, SN extends N> {
  readonly getCurrentNode: () => N | undefined;
  readonly childrenProp: keyof N;
  readonly parentProp: keyof N;
  readonly stop: ((node: N) => node is SN) | ((node: N) => boolean);
}

export function getTreeIterator<N extends AnyObject, SN extends N = N>(
  scope: TreeScope<N, SN>,
  onSwitch: (nextNode: SN) => unknown,
  options?: TreeIteratorOptions
): TreeIterator<N, SN> {
  let nextTreeNode: SN | undefined;

  const getParent = (node: N): N | undefined => {
    return node[scope.parentProp] as N | undefined;
  };

  const getChildren = (node: N): readonly N[] | undefined => {
    return node[scope.childrenProp] as readonly N[];
  };

  const selectNext = (node: N, step: -1 | 1, loop: boolean, visited: Set<N>): SN | undefined => {
    // Down to children
    if (!visited.has(node)) {
      const children = getChildren(node);
      if (children && children.length > 0) {
        const nextIdx = step + (step > 0 ? -1 : children.length);
        if (nextIdx >= 0 && nextIdx <= children.length - 1) {
          const nextNode = children[nextIdx];
          if (scope.stop(nextNode)) return nextNode;
          return selectNext(nextNode, step, loop, visited);
        }
      }
    }

    const parent = getParent(node);
    if (!parent) {
      if (loop) {
        visited.clear();
        return selectNext(node, step, false, visited);
      }
      return undefined;
    }

    // Move to sibling
    const siblings = getChildren(parent);
    if (siblings && siblings.length > 0) {
      const idx = siblings.indexOf(node);
      const nextIdx = idx + step;
      if (nextIdx >= 0 && nextIdx <= siblings.length - 1) {
        const nextNode = siblings[nextIdx];
        if (scope.stop(nextNode)) return nextNode;
        return selectNext(nextNode, step, loop, visited);
      }
    }

    // Up to parent
    if (scope.stop(parent)) return parent;
    visited.add(parent);
    return selectNext(parent, step, loop, visited);
  };

  const getNextNode = (loop?: boolean): SN | undefined => {
    const currentNode = scope.getCurrentNode();
    if (!currentNode) return undefined;
    const visited = new Set<N>();
    // visited.add(currentNode);
    return selectNext(currentNode, 1, loop ?? false, visited);
  };

  const getPrevNode = (loop?: boolean): SN | undefined => {
    const currentNode = scope.getCurrentNode();
    if (!currentNode) return undefined;
    const visited = new Set<N>();
    // visited.add(currentNode);
    return selectNext(currentNode, -1, loop ?? false, visited);
  };

  const getNext = (opts?: GetNextOptions): SN | undefined => {
    return getNextNode(opts?.loop);
  };

  const getBack = (opts?: GetNextOptions): SN | undefined => {
    return getPrevNode(opts?.loop);
  };

  const isCanNext = (opts?: GetNextOptions): boolean => {
    return getNextNode(opts?.loop) != null;
  };

  const isCanBack = (opts?: GetNextOptions): boolean => {
    return getPrevNode(opts?.loop) != null;
  };

  const delayedSwitch = delayed(() => {
    nextTreeNode != null && onSwitch(nextTreeNode);
  }, 0);

  const cancel = (): void => delayedSwitch.cancel();

  const next: TreeIterator<N, SN>['next'] = beforeCall(
    ({ delay = options?.delay } = {}) => {
      nextTreeNode != null && delayedSwitch.delay(delay ?? 0);
    },
    ({ loop = options?.loop } = {}) => {
      cancel();
      nextTreeNode = getNextNode(loop);
    }
  );

  const back: TreeIterator<N, SN>['back'] = beforeCall(
    ({ delay = options?.delay } = {}) => {
      nextTreeNode != null && delayedSwitch.delay(delay ?? 0);
    },
    ({ loop = options?.loop } = {}) => {
      cancel();
      nextTreeNode = getPrevNode(loop);
    }
  );

  return {
    get isPending() {
      return delayedSwitch.isPending;
    },
    next,
    back,
    getNext,
    getBack,
    isCanNext,
    isCanBack,
    cancel,
  };
}

export default getTreeIterator;
