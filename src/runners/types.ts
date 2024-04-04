import type { calcPerformanceAsync } from "rdtsc";

export type RunOptions = {
  warmupTime: number;
  runTime: number;
};

export type BenchFunction = () => void | Promise<void>;

export type BenchResult = Awaited<ReturnType<typeof calcPerformanceAsync>>;

export type RunBenchmarkFunc = (
  funcs: BenchFunction[],
  options: RunOptions,
) => Promise<BenchResult>;
