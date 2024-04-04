import { initializeServer } from "@/cli/server";
import { glob } from "glob";

const files = await glob(["**/*.bench.ts"], { ignore: "node_modules" });

const { runner, server } = await initializeServer();

for (const file of files) {
  await runner.executeFile(file);
}

await server.close();
