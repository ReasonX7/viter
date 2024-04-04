import { default as chalk } from "chalk";
import { calcPerformanceAsync } from "rdtsc";

type SuiteScenario = {
  name: string;
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  func: () => Promise<unknown> | void;
};

type SuiteResult = Awaited<ReturnType<typeof calcPerformanceAsync>>;

export class BenchmarkSuite {
  private timeToRun = 1000;
  private result: SuiteResult | null = null;
  private scenarios: SuiteScenario[] = [];

  constructor(private name: string) {}

  public addBench(name: SuiteScenario["name"], func: SuiteScenario["func"]) {
    this.scenarios.push({ name, func });

    return this;
  }

  public setTimeToRun(timeToRun: number) {
    this.timeToRun = timeToRun;

    return this;
  }

  public async run() {
    this.result = await calcPerformanceAsync(this.timeToRun, ...this.scenarios.map((s) => s.func));

    return this.result;
  }

  public async output() {
    if (this.result == null) {
      await this.run();
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const { calcInfo, cycles } = this.result!;

    const largestCharCount = Math.max(...this.scenarios.map((s) => s.name.length));

    const scenarioString = cycles
      .map((cycleCount, index) => {
        const { name } = this.scenarios[index];
        return { name, cycleCount };
      })
      .sort((x, y) => {
        const diff = x.cycleCount - y.cycleCount;
        return diff >= 0 ? 0 : -1;
      })
      .map((scenario, index, arr) => {
        const title = scenario.name.padStart(largestCharCount + 2, " ");
        const color =
          index === 0 ? chalk.green : index === arr.length - 1 ? chalk.red : chalk.yellow;
        return `${title}: ${color(scenario.cycleCount)}`;
      })
      .join("\n");

    const resultString = `
${chalk.cyan("==============================")}
${chalk.cyan(this.name)}
${chalk.cyan("==============================")}

Iteration cycles: ${chalk.yellow(calcInfo.iterationCycles)}
      Iterations: ${chalk.yellow(calcInfo.iterations)}
       Test time: ${chalk.yellow(calcInfo.testTime)}
       
Suite results (cycles):

${scenarioString}
`;

    return new Promise((resolve) => {
      process.stdout.write(resultString, () => resolve(undefined));
    });
  }
}
