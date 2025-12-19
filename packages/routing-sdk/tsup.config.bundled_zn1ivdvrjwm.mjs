// tsup.config.ts
import { defineConfig } from "tsup";
import { exec } from "child_process";
var tsup_config_default = defineConfig((options) => ({
  entry: {
    index: "./src/index.ts"
  },
  sourcemap: false,
  skipNodeModulesBundle: true,
  format: ["esm", "cjs"],
  noExternal: ["@pancakeswap/utils"],
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL3BoaWxpcC93b3JrL3BhbmNha2UtZnJvbnRlbmQvcGFja2FnZXMvcm91dGluZy1zZGsvdHN1cC5jb25maWcudHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL1VzZXJzL3BoaWxpcC93b3JrL3BhbmNha2UtZnJvbnRlbmQvcGFja2FnZXMvcm91dGluZy1zZGtcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL1VzZXJzL3BoaWxpcC93b3JrL3BhbmNha2UtZnJvbnRlbmQvcGFja2FnZXMvcm91dGluZy1zZGsvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd0c3VwJ1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygob3B0aW9ucykgPT4gKHtcbiAgZW50cnk6IHtcbiAgICBpbmRleDogJy4vc3JjL2luZGV4LnRzJyxcbiAgfSxcbiAgc291cmNlbWFwOiBmYWxzZSxcbiAgc2tpcE5vZGVNb2R1bGVzQnVuZGxlOiB0cnVlLFxuICBmb3JtYXQ6IFsnZXNtJywgJ2NqcyddLFxuICBub0V4dGVybmFsOiBbJ0BwYW5jYWtlc3dhcC91dGlscyddLFxuICBkdHM6IGZhbHNlLFxuICBjbGVhbjogIW9wdGlvbnMud2F0Y2gsXG4gIHRyZWVzaGFrZTogdHJ1ZSxcbiAgc3BsaXR0aW5nOiB0cnVlLFxuICBvblN1Y2Nlc3M6IGFzeW5jICgpID0+IHtcbiAgICBleGVjKCd0c2MgLS1lbWl0RGVjbGFyYXRpb25Pbmx5IC0tZGVjbGFyYXRpb24nLCAoZXJyLCBzdGRvdXQpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihzdGRvdXQpXG4gICAgICAgIGlmICghb3B0aW9ucy53YXRjaCkge1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfSxcbn0pKVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVCxTQUFTLG9CQUFvQjtBQUNuVixTQUFTLFlBQVk7QUFFckIsSUFBTyxzQkFBUSxhQUFhLENBQUMsYUFBYTtBQUFBLEVBQ3hDLE9BQU87QUFBQSxJQUNMLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxXQUFXO0FBQUEsRUFDWCx1QkFBdUI7QUFBQSxFQUN2QixRQUFRLENBQUMsT0FBTyxLQUFLO0FBQUEsRUFDckIsWUFBWSxDQUFDLG9CQUFvQjtBQUFBLEVBQ2pDLEtBQUs7QUFBQSxFQUNMLE9BQU8sQ0FBQyxRQUFRO0FBQUEsRUFDaEIsV0FBVztBQUFBLEVBQ1gsV0FBVztBQUFBLEVBQ1gsV0FBVyxZQUFZO0FBQ3JCLFNBQUssMkNBQTJDLENBQUMsS0FBSyxXQUFXO0FBQy9ELFVBQUksS0FBSztBQUNQLGdCQUFRLE1BQU0sTUFBTTtBQUNwQixZQUFJLENBQUMsUUFBUSxPQUFPO0FBQ2xCLGtCQUFRLEtBQUssQ0FBQztBQUFBLFFBQ2hCO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
