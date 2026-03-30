import { beforeCall } from './beforeCall';
import { delayed } from './delayed';

export interface TreeIteratorOptions {
  readonly delay?: number | undefined;
  readonly loop?: boolean | undefined;
}

export type NextOptions = Pick<TreeIteratorOptions, 'delay' | 'loop'>;

type GetNextOptions = Pick<NextOptions, 'loop'>;

export interface TreeIterator<Node extends AnyObject, StopNode extends Node = Node> {
  readonly next: (options?: NextOptions) => void;
  readonly back: (options?: NextOptions) => void;
  readonly getNext: (options?: GetNextOptions) => StopNode | undefined;
  readonly getBack: (options?: GetNextOptions) => StopNode | undefined;
  readonly isCanNext: (options?: GetNextOptions) => boolean;
  readonly isCanBack: (options?: GetNextOptions) => boolean;
  readonly isPending: boolean;
  /** Cancel the delayed switch. */
  readonly cancel: VoidFunction;
}

export interface TreeScope<Node extends AnyObject, StopNode extends Node> {
  readonly getCurrentNode: () => Node | undefined;
  readonly childrenProp: keyof Node;
  readonly parentProp: keyof Node;
  readonly stop: ((node: Node) => node is StopNode) | ((node: Node) => boolean);
}

export function getTreeIterator<Node extends AnyObject, StopNode extends Node = Node>(
  scope: TreeScope<Node, StopNode>,
  onSwitch: (nextNode: StopNode) => unknown,
  options?: TreeIteratorOptions
): TreeIterator<Node> {
  let nextTreeNode: StopNode | undefined;

  const getParent = (node: Node): Node | undefined => {
    return node[scope.parentProp] as Node | undefined;
  };

  const getChildren = (node: Node): readonly Node[] | undefined => {
    return node[scope.childrenProp] as readonly Node[];
  };

  const selectNext = (
    node: Node,
    step: -1 | 1,
    loop: boolean,
    visited: Set<Node>
  ): StopNode | undefined => {
    // Down to children
    if (!visited.has(node)) {
      const children = getChildren(node);
      const length = children?.length;
      if (children && length != null && length > 0) {
        const nextIdx = step + (step > 0 ? -1 : length);
        if (nextIdx >= 0 && nextIdx <= length - 1) {
          const nextNode = children[nextIdx];
          if (scope.stop(nextNode)) return nextNode as StopNode;
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
        if (scope.stop(nextNode)) return nextNode as StopNode;
        return selectNext(nextNode, step, loop, visited);
      }
    }

    // Up to parent
    if (scope.stop(parent)) return parent as StopNode;
    visited.add(parent);
    return selectNext(parent, step, loop, visited);
  };

  const getNextNode = (loop?: boolean): StopNode | undefined => {
    const currentNode = scope.getCurrentNode();
    if (!currentNode) return undefined;
    const visited = new Set<Node>();
    // visited.add(currentNode);
    return selectNext(currentNode, 1, loop ?? false, visited);
  };

  const getPrevNode = (loop?: boolean): StopNode | undefined => {
    const currentNode = scope.getCurrentNode();
    if (!currentNode) return undefined;
    const visited = new Set<Node>();
    // visited.add(currentNode);
    return selectNext(currentNode, -1, loop ?? false, visited);
  };

  const getNext = (opts?: GetNextOptions): StopNode | undefined => {
    return getNextNode(opts?.loop);
  };

  const getBack = (opts?: GetNextOptions): StopNode | undefined => {
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

  const next: TreeIterator<Node>['next'] = beforeCall(
    ({ delay = options?.delay } = Object.create(null)) => {
      nextTreeNode != null && delayedSwitch.delay(delay ?? 0);
    },
    ({ loop = options?.loop } = Object.create(null)) => {
      cancel();
      nextTreeNode = getNextNode(loop);
    }
  );

  const back: TreeIterator<Node>['back'] = beforeCall(
    ({ delay = options?.delay } = Object.create(null)) => {
      nextTreeNode != null && delayedSwitch.delay(delay ?? 0);
    },
    ({ loop = options?.loop } = Object.create(null)) => {
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
