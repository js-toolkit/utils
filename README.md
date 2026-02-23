# @js-toolkit/utils

[![npm package](https://img.shields.io/npm/v/@js-toolkit/utils.svg?style=flat-square)](https://www.npmjs.org/package/@js-toolkit/utils)
[![license](https://img.shields.io/npm/l/@js-toolkit/utils.svg?style=flat-square)](https://www.npmjs.org/package/@js-toolkit/utils)

TypeScript utilities: helper functions, classes, FP data structures, and type helpers. Zero dependencies (optional `@js-toolkit/node-utils` for build minification).

## Install

```bash
yarn add @js-toolkit/utils
# or
npm install @js-toolkit/utils
```

## Import

Use subpath imports for tree-shaking:

```typescript
import { EventEmitter } from '@js-toolkit/utils/EventEmitter';
import { debounce } from '@js-toolkit/utils/debounce';
import { getErrorMessage } from '@js-toolkit/utils/getErrorMessage';
import type { DeepPartial, RequiredStrict } from '@js-toolkit/utils/types';
```

## API Overview

### Classes and primitives

| Module | Description |
|--------|-------------|
| `EventEmitter` | Typed event emitter |
| `Mutex` | Async mutex with acquire/release |
| `Queue` | FIFO queue |
| `CacheMap` | Map with `getOrCreate` / `getOrQueue` |
| `CancellablePromise` | Promise with cancel support |
| `DataEventEmitter` | Event emitter with typed data payloads |
| `Option`, `Try`, `Sink` | FP data structures |
| `List` | Immutable list (`collections/immutable`) |

### Functions

| Module | Description |
|--------|-------------|
| `noop` | No-op function |
| `clear` | Clear array in place |
| `debounce` | Debounced function with `isPending` |
| `delay` | Delayed execution with cancel |
| `delayed` | Delayed promise |
| `getErrorMessage` | Extract message from unknown error |
| `getAwaiter` | Deferred promise (resolve/reject later) |
| `promisify` | Wrap sync fn in Promise |
| `tryGet` | Try thunk, return fallback on error |
| `hasIn`, `hasOwn` | Safe property checks |
| `isEmptyObject` | Check if object has no own keys |
| `getEnumName`, `getEnumValues` | Enum helpers |
| `createDisposable` | Create `Symbol.dispose` object |
| `memoizeAsync` | Async memoization |
| `wait` | Promise-based delay |
| `escapeRegExp` | Escape regex special chars |

### Types

| Type | Description |
|------|-------------|
| `DeepPartial`, `DeepRequired` | Recursive partial/required |
| `RequiredStrict`, `OptionalToUndefined` | Strict optional handling |
| `Merge`, `Diff`, `OmitStrict` | Object type utilities |
| `Keys`, `TupleToUnion`, `ArrayItem` | Key and array helpers |
| `MapToKey`, `GettersToProps` | Mapped types |
| `UnreachableCaseError` | Exhaustive switch helper |

### Decorators

| Module | Description |
|--------|-------------|
| `@bind` | Bind method to instance |

### Logging

| Module | Description |
|--------|-------------|
| `log` | Logger with plugins (ConsolePlugin, LocalStoragePlugin) |

## Usage Examples

### EventEmitter

```typescript
import { EventEmitter } from '@js-toolkit/utils/EventEmitter';

interface Events {
  data: [payload: string];
  error: [err: Error];
}

const emitter = new EventEmitter<Events>();
emitter.on('data', (payload: string) => console.log(payload));
emitter.emit('data', 'hello');
```

### Mutex

```typescript
import { Mutex } from '@js-toolkit/utils/Mutex';

const mutex = new Mutex<string>();
const release = await mutex.acquire('worker-1');
try {
  // critical section
} finally {
  release[Symbol.dispose]();
}
```

### tryGet and getErrorMessage

```typescript
import { tryGet } from '@js-toolkit/utils/tryGet';
import { getErrorMessage } from '@js-toolkit/utils/getErrorMessage';

const input = '{"key":"value"}'; // e.g. from API or user
const value = tryGet(() => JSON.parse(input) as Record<string, unknown>, null);
if (value === null) {
  // parse failed
}

try {
  await fetch('/api/data'); // or any async operation
} catch (err: unknown) {
  console.error(getErrorMessage(err));
}
```

### Exhaustive switch with UnreachableCaseError

```typescript
import { UnreachableCaseError } from '@js-toolkit/utils/UnreachableCaseError';

type Status = 'idle' | 'loading' | 'done';

function handle(status: Status): string {
  switch (status) {
    case 'idle':
      return 'idle';
    case 'loading':
      return 'loading';
    case 'done':
      return 'done';
    default:
      throw new UnreachableCaseError(status);
  }
}
```

### Option (FP)

```typescript
import { Option } from '@js-toolkit/utils/fp/Option';

const value: string | null = null; // or from API, form, etc.
const opt = Option.of(value);
if (opt.nonEmpty()) {
  console.log(opt.get());
}
const result = opt.getOrElse('default');
```

### debounce

```typescript
import { debounce } from '@js-toolkit/utils/debounce';

async function fetchResults(query: string): Promise<void> {
  /* fetch and render */
}

const debouncedSearch = debounce((query: string) => void fetchResults(query), 300);
debouncedSearch('foo');
if (debouncedSearch.isPending) {
  // call is queued
}
debouncedSearch.cancel();
```

### getAwaiter

```typescript
import { getAwaiter } from '@js-toolkit/utils/getAwaiter';

const awaiter = getAwaiter<number>();
setTimeout(() => awaiter.resolve(42), 1000);
const value = await awaiter.wait(2000); // 42
```

### Types

```typescript
import type { DeepPartial, RequiredStrict, Keys } from '@js-toolkit/utils/types';

interface Config {
  a: number;
  b?: string;
}
type PartialConfig = DeepPartial<Config>;
type StrictConfig = RequiredStrict<Config>;
type ConfigKeys = Keys<Config>; // 'a' | 'b'
```

### @bind decorator

```typescript
import { bind } from '@js-toolkit/utils/decorators/bind';

class Handler {
  @bind
  handleClick() {
    // this is always bound
  }
}
```

## Testing

```bash
yarn test
```

## Repository

[https://github.com/js-toolkit/utils](https://github.com/js-toolkit/utils)
