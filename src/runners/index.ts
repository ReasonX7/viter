import type { RunBenchmarkFunc } from "@/runners/types";
import { calcPerformanceAsync } from "rdtsc";

export const runRdtsc: RunBenchmarkFunc = async (funcs, { warmupTime, runTime }) => {
  if (warmupTime > 0) {
    await calcPerformanceAsync(warmupTime, ...funcs);
  }
  return await calcPerformanceAsync(runTime, ...funcs);
};
