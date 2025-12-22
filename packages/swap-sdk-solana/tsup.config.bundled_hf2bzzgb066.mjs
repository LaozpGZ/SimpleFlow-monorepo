// tsup.config.ts
import { defineConfig } from "tsup";
import { exec } from "child_process";
var tsup_config_default = defineConfig((options) => ({
  entry: {
    index: "./src/index.ts"
  },
  sourcemap: true,
  skipNodeModulesBundle: true,
  format: ["esm", "cjs"],
  dts: false,
  clean: !options.watch,
  treeshake: true,
  splitting: true,
  onSuccess: async () => {
    exec("tsc --emitDeclarationOnly --declaration", (err, stdout) => {
      if (err) {
        console.error(stdout);
        if (!options.watch) {
          process.exit(1);
        }
      }
    });
  }
}));
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL2d6L0RvY3VtZW50cy9HaXRIdWIvU2ltcGxlRmxvdy1tb25vcmVwby9wYWNrYWdlcy9zd2FwLXNkay1zb2xhbmEvdHN1cC5jb25maWcudHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL1VzZXJzL2d6L0RvY3VtZW50cy9HaXRIdWIvU2ltcGxlRmxvdy1tb25vcmVwby9wYWNrYWdlcy9zd2FwLXNkay1zb2xhbmFcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL1VzZXJzL2d6L0RvY3VtZW50cy9HaXRIdWIvU2ltcGxlRmxvdy1tb25vcmVwby9wYWNrYWdlcy9zd2FwLXNkay1zb2xhbmEvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd0c3VwJ1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygob3B0aW9ucykgPT4gKHtcbiAgZW50cnk6IHtcbiAgICBpbmRleDogJy4vc3JjL2luZGV4LnRzJyxcbiAgfSxcbiAgc291cmNlbWFwOiB0cnVlLFxuICBza2lwTm9kZU1vZHVsZXNCdW5kbGU6IHRydWUsXG4gIGZvcm1hdDogWydlc20nLCAnY2pzJ10sXG4gIGR0czogZmFsc2UsXG4gIGNsZWFuOiAhb3B0aW9ucy53YXRjaCxcbiAgdHJlZXNoYWtlOiB0cnVlLFxuICBzcGxpdHRpbmc6IHRydWUsXG4gIG9uU3VjY2VzczogYXN5bmMgKCkgPT4ge1xuICAgIGV4ZWMoJ3RzYyAtLWVtaXREZWNsYXJhdGlvbk9ubHkgLS1kZWNsYXJhdGlvbicsIChlcnIsIHN0ZG91dCkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKHN0ZG91dClcbiAgICAgICAgaWYgKCFvcHRpb25zLndhdGNoKSB7XG4gICAgICAgICAgcHJvY2Vzcy5leGl0KDEpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9LFxufSkpXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1XLFNBQVMsb0JBQW9CO0FBQ2hZLFNBQVMsWUFBWTtBQUVyQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxhQUFhO0FBQUEsRUFDeEMsT0FBTztBQUFBLElBQ0wsT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLFdBQVc7QUFBQSxFQUNYLHVCQUF1QjtBQUFBLEVBQ3ZCLFFBQVEsQ0FBQyxPQUFPLEtBQUs7QUFBQSxFQUNyQixLQUFLO0FBQUEsRUFDTCxPQUFPLENBQUMsUUFBUTtBQUFBLEVBQ2hCLFdBQVc7QUFBQSxFQUNYLFdBQVc7QUFBQSxFQUNYLFdBQVcsWUFBWTtBQUNyQixTQUFLLDJDQUEyQyxDQUFDLEtBQUssV0FBVztBQUMvRCxVQUFJLEtBQUs7QUFDUCxnQkFBUSxNQUFNLE1BQU07QUFDcEIsWUFBSSxDQUFDLFFBQVEsT0FBTztBQUNsQixrQkFBUSxLQUFLLENBQUM7QUFBQSxRQUNoQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
