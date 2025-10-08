// tsup.config.ts
import { defineConfig } from "tsup";
import { exec } from "child_process";
var tsup_config_default = defineConfig((options) => {
  return {
    entry: {
      index: "./src/index.ts"
    },
    format: ["esm", "cjs"],
    noExternal: ["@pancakeswap/utils", "@pancakeswap/solana-core-sdk"],
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
  };
});
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL3BoaWxpcC93b3JrL3BhbmNha2UtZnJvbnRlbmQvcGFja2FnZXMvdG9rZW5zL3RzdXAuY29uZmlnLnRzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIi9Vc2Vycy9waGlsaXAvd29yay9wYW5jYWtlLWZyb250ZW5kL3BhY2thZ2VzL3Rva2Vuc1wiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vVXNlcnMvcGhpbGlwL3dvcmsvcGFuY2FrZS1mcm9udGVuZC9wYWNrYWdlcy90b2tlbnMvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd0c3VwJ1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygob3B0aW9ucykgPT4ge1xuICByZXR1cm4ge1xuICAgIGVudHJ5OiB7XG4gICAgICBpbmRleDogJy4vc3JjL2luZGV4LnRzJyxcbiAgICB9LFxuICAgIGZvcm1hdDogWydlc20nLCAnY2pzJ10sXG4gICAgbm9FeHRlcm5hbDogWydAcGFuY2FrZXN3YXAvdXRpbHMnLCAnQHBhbmNha2Vzd2FwL3NvbGFuYS1jb3JlLXNkayddLFxuICAgIGR0czogZmFsc2UsXG4gICAgY2xlYW46ICFvcHRpb25zLndhdGNoLFxuICAgIHRyZWVzaGFrZTogdHJ1ZSxcbiAgICBzcGxpdHRpbmc6IHRydWUsXG4gICAgb25TdWNjZXNzOiBhc3luYyAoKSA9PiB7XG4gICAgICBleGVjKCd0c2MgLS1lbWl0RGVjbGFyYXRpb25Pbmx5IC0tZGVjbGFyYXRpb24nLCAoZXJyLCBzdGRvdXQpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3Ioc3Rkb3V0KVxuICAgICAgICAgIGlmICghb3B0aW9ucy53YXRjaCkge1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVTLFNBQVMsb0JBQW9CO0FBQ3BVLFNBQVMsWUFBWTtBQUVyQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxZQUFZO0FBQ3ZDLFNBQU87QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNMLE9BQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxRQUFRLENBQUMsT0FBTyxLQUFLO0FBQUEsSUFDckIsWUFBWSxDQUFDLHNCQUFzQiw4QkFBOEI7QUFBQSxJQUNqRSxLQUFLO0FBQUEsSUFDTCxPQUFPLENBQUMsUUFBUTtBQUFBLElBQ2hCLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFdBQVcsWUFBWTtBQUNyQixXQUFLLDJDQUEyQyxDQUFDLEtBQUssV0FBVztBQUMvRCxZQUFJLEtBQUs7QUFDUCxrQkFBUSxNQUFNLE1BQU07QUFDcEIsY0FBSSxDQUFDLFFBQVEsT0FBTztBQUNsQixvQkFBUSxLQUFLLENBQUM7QUFBQSxVQUNoQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
