import { default as EventEmitter } from "node:events";
import type { BenchFunction, BenchResult, RunBenchmarkFunc, RunOptions } from "@/runners/types";
import { BenchResultEvent } from "@/suite/constants";
import type { BenchGroup, BenchResultItem, DescriptionItem, SuiteItemStatus } from "@/suite/types";

export const descriptionStore = new Map<string, DescriptionItem>();
export const benchFunctionStore = new Map<string, BenchFunction>();
export const benchGroupStore = new Map<string, BenchGroup>();
export const benchResultStore = new Map<string, BenchResultItem>();

export const events = new EventEmitter();

const descriptionIdStack: string[] = [];

export const resetAllStores = () => {
  descriptionStore.clear();
  benchFunctionStore.clear();
  benchGroupStore.clear();
  benchResultStore.clear();
};

export const createPendingBenchResult = (id: string) =>
  ({
    id,
    status: "pending",
    data: null,
    error: null,
  }) satisfies BenchResultItem;

export const createDoneBenchResult = (id: string, data: BenchResult) =>
  ({
    id,
    status: "done",
    data,
    error: null,
  }) satisfies BenchResultItem;

export const createErrorBenchResult = (id: string, error: Error) =>
  ({
    id,
    status: "error",
    data: null,
    error,
  }) satisfies BenchResultItem;

const createId = (...strings: (string | undefined)[]) => strings.filter(Boolean).join(" >> ");

const $describe = (description: string, status: SuiteItemStatus, func: () => void) => {
  const parentId = descriptionIdStack.at(-1);
  const descId = createId(parentId, description);

  if (parentId) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    descriptionStore.get(parentId)!.children.push(descId);
  }

  descriptionStore.set(descId, { id: descId, status, description, children: [] });
  descriptionIdStack.push(descId);
  func();
  descriptionIdStack.pop();
};

const $bench = (description: string, status: SuiteItemStatus, func: BenchFunction) => {
  const descId = descriptionIdStack.at(-1);
  const funcId = createId(descId, description);

  if (descId == null) {
    throw new Error("[viter]: `bench` function must be inside `description`");
  }

  const group = benchGroupStore.get(descId) || { id: descId, benchFunctionIds: [] };

  group.benchFunctionIds.push(funcId);
  benchGroupStore.set(descId, group);
  benchResultStore.set(descId, createPendingBenchResult(descId));
  benchFunctionStore.set(funcId, func);

  $describe(description, status, () => {});
};

export const describe = (name: string, fn: () => void) => {
  $describe(name, "run", fn);
};

describe.skip = (name: string, fn: () => void) => {
  $describe(name, "skip", fn);
};

describe.todo = (name: string, fn: () => void = () => {}) => {
  $describe(name, "todo", fn);
};

export const bench = (name: string, fn: () => void) => {
  $bench(name, "run", fn);
};

bench.skip = (name: string, fn: () => void) => {
  $bench(name, "skip", fn);
};

bench.todo = (name: string, fn: () => void = () => {}) => {
  $bench(name, "todo", fn);
};

export const start = async (runBenchmark: RunBenchmarkFunc, runOptions: RunOptions) => {
  for (const [descId, group] of benchGroupStore) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const funcs = group.benchFunctionIds.map((id) => benchFunctionStore.get(id)!);

    await runBenchmark(funcs, runOptions)
      .then((result) => {
        benchResultStore.set(descId, createDoneBenchResult(descId, result));
        events.emit(BenchResultEvent.Done, descId);
      })
      .catch((error) => {
        benchResultStore.set(descId, createErrorBenchResult(descId, error));
        events.emit(BenchResultEvent.Error, descId);
      });
  }
};

// export const formConsoleOutput = () => {
//   const descIds = Array.from(descriptionStore).map((value) => value[0]);
//   return descIds.map((id) => )
// };
