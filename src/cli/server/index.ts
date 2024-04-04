import { createServer } from "vite";
import { ViteNodeRunner } from "vite-node/client";
import { ViteNodeServer } from "vite-node/server";
import { installSourcemapsSupport } from "vite-node/source-map";

export const initializeServer = async () => {
  const server = await createServer({
    optimizeDeps: {
      noDiscovery: true,
      include: [],
    },
  });

  // This is need to initialize the plugins
  await server.pluginContainer.buildStart({});

  // create vite-node server
  const node = new ViteNodeServer(server);

  // fixes stacktraces in Errors
  installSourcemapsSupport({
    getSourceMap: (source) => node.getSourceMap(source),
  });

  // create vite-node runner
  const runner = new ViteNodeRunner({
    root: server.config.root,
    base: server.config.base,
    // when having the server and runner in a different context,
    // you will need to handle the communication between them
    // and pass to this function
    fetchModule: (id) => node.fetchModule(id),
    resolveId: (id, importer) => node.resolveId(id, importer),
  });

  return { runner, server };
};
