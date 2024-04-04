import type { BenchResult, RunBenchmarkFunc } from "@/runners/types";
import {
  events,
  bench as $bench,
  describe as $describe,
  benchFunctionStore,
  benchGroupStore,
  benchResultStore,
  descriptionStore,
  resetAllStores,
  start,
} from "@/suite";
import { BenchResultEvent } from "@/suite/constants";
import { afterEach, describe, expect, it, vi } from "@reasonx/tools/vitest";
// import type { DescribeItem, BenchItem } from "@/suite";

describe("suite", () => {
  afterEach(() => {
    resetAllStores();
  });

  it("should create & run the successful benchmark", async () => {
    /**
     * Setup benchmarks suite.
     */
    const benchPush = vi.fn();
    const benchPop = vi.fn();
    const benchDeepWalk = vi.fn();

    const handleDoneBenchResult = vi.fn();
    const handleErrorBenchResult = vi.fn();

    // TODO: Add "todo" & "skip" describes and benches.
    // TODO: Add bench function that throws an error.
    // TODO: Add bench function that never resolves and has to be stopped by an AbortSignal.
    $describe("Utils", () => {
      $describe("LinkedList", () => {
        $bench("LinkedList Push", benchPush);
        $bench("LinkedList Pop", benchPop);
      });

      $describe("Object", () => {
        $bench("Deep Walk", benchDeepWalk);
      });
    });

    expect(descriptionStore).toMatchSnapshot();
    expect(benchFunctionStore).toMatchSnapshot();
    expect(benchGroupStore).toMatchSnapshot();

    /**
     * Run benchmark suite.
     */
    events.on(BenchResultEvent.Done, handleDoneBenchResult);
    events.on(BenchResultEvent.Error, handleDoneBenchResult);

    const runBenchmarkResults: BenchResult[] = [
      // LinkedList suite results:
      {
        calcInfo: {
          testTime: 1000,
          iterations: 900,
          iterationCycles: 100,
          funcsCount: 2,
        },
        cycles: [20n, 30n],
        absoluteDiff: [],
        relativeDiff: undefined,
      },

      // Object suite results:
      {
        calcInfo: {
          testTime: 1000,
          iterations: 500,
          iterationCycles: 10,
          funcsCount: 1,
        },
        cycles: [10n],
        absoluteDiff: [],
        relativeDiff: undefined,
      },
    ];
    const runBenchmarkMock: RunBenchmarkFunc = vi.fn().mockImplementation((funcs) => {
      if (funcs.length === 2) {
        // This is for "LinkedList" suite.
        return Promise.resolve(runBenchmarkResults[0]);
      }

      // This is for "Object" suite.
      return Promise.resolve(runBenchmarkResults[1]);
    });

    await start(runBenchmarkMock, { warmupTime: 2000, runTime: 1000 });

    expect(runBenchmarkMock).toHaveBeenCalledTimes(2);
    expect(runBenchmarkMock).toHaveBeenNthCalledWith(1, [benchPush, benchPop], {
      warmupTime: 2000,
      runTime: 1000,
    });
    expect(runBenchmarkMock).toHaveBeenNthCalledWith(2, [benchDeepWalk], {
      warmupTime: 2000,
      runTime: 1000,
    });

    expect(handleErrorBenchResult).toHaveBeenCalledTimes(0);
    expect(handleDoneBenchResult).toHaveBeenCalledTimes(2);
    expect(handleDoneBenchResult).toHaveBeenNthCalledWith(1, "Utils >> LinkedList");
    expect(handleDoneBenchResult).toHaveBeenNthCalledWith(2, "Utils >> Object");

    console.log("Description:");
    console.log(descriptionStore);
    console.log("Description:");
    console.log(descriptionStore);
    console.log("Bench results:");
    console.log(benchResultStore);
  });
});
