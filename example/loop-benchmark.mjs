import { BenchmarkSuite } from "../dist/main.mjs";

const arr = Array.from(Array(10000)).map((x, i) => i);

const suite = new BenchmarkSuite("Loops")
  .setTimeToRun(1000)
  .addScenario("While", () => {
    let sum = 0;
    let i = arr.length;

    while (--i) {
      sum += arr[i];
    }
  })
  .addScenario("For", () => {
    let sum = 0;

    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
  })
  .addScenario("For Of", () => {
    let sum = 0;

    for (const i of arr) {
      sum += i;
    }
  })
  .addScenario("For Each", () => {
    let sum = 0;

    // biome-ignore lint/complexity/noForEach: <explanation>
    arr.forEach((i) => {
      sum += i;
    });
  });

await suite.output();
