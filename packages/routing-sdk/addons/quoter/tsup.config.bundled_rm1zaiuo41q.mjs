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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL2d6L0RvY3VtZW50cy9HaXRIdWIvU2ltcGxlRmxvdy1tb25vcmVwby9wYWNrYWdlcy9yb3V0aW5nLXNkay9hZGRvbnMvcXVvdGVyL3RzdXAuY29uZmlnLnRzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIi9Vc2Vycy9nei9Eb2N1bWVudHMvR2l0SHViL1NpbXBsZUZsb3ctbW9ub3JlcG8vcGFja2FnZXMvcm91dGluZy1zZGsvYWRkb25zL3F1b3RlclwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vVXNlcnMvZ3ovRG9jdW1lbnRzL0dpdEh1Yi9TaW1wbGVGbG93LW1vbm9yZXBvL3BhY2thZ2VzL3JvdXRpbmctc2RrL2FkZG9ucy9xdW90ZXIvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd0c3VwJ1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygob3B0aW9ucykgPT4gKHtcbiAgZW50cnk6IHtcbiAgICBpbmRleDogJy4vc3JjL2luZGV4LnRzJyxcbiAgfSxcbiAgc291cmNlbWFwOiBmYWxzZSxcbiAgc2tpcE5vZGVNb2R1bGVzQnVuZGxlOiB0cnVlLFxuICBmb3JtYXQ6IFsnZXNtJywgJ2NqcyddLFxuICBkdHM6IGZhbHNlLFxuICBjbGVhbjogIW9wdGlvbnMud2F0Y2gsXG4gIHRyZWVzaGFrZTogdHJ1ZSxcbiAgc3BsaXR0aW5nOiB0cnVlLFxuICBvblN1Y2Nlc3M6IGFzeW5jICgpID0+IHtcbiAgICBleGVjKCd0c2MgLS1lbWl0RGVjbGFyYXRpb25Pbmx5IC0tZGVjbGFyYXRpb24nLCAoZXJyLCBzdGRvdXQpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihzdGRvdXQpXG4gICAgICAgIGlmICghb3B0aW9ucy53YXRjaCkge1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfSxcbn0pKVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpWSxTQUFTLG9CQUFvQjtBQUM5WixTQUFTLFlBQVk7QUFFckIsSUFBTyxzQkFBUSxhQUFhLENBQUMsYUFBYTtBQUFBLEVBQ3hDLE9BQU87QUFBQSxJQUNMLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxXQUFXO0FBQUEsRUFDWCx1QkFBdUI7QUFBQSxFQUN2QixRQUFRLENBQUMsT0FBTyxLQUFLO0FBQUEsRUFDckIsS0FBSztBQUFBLEVBQ0wsT0FBTyxDQUFDLFFBQVE7QUFBQSxFQUNoQixXQUFXO0FBQUEsRUFDWCxXQUFXO0FBQUEsRUFDWCxXQUFXLFlBQVk7QUFDckIsU0FBSywyQ0FBMkMsQ0FBQyxLQUFLLFdBQVc7QUFDL0QsVUFBSSxLQUFLO0FBQ1AsZ0JBQVEsTUFBTSxNQUFNO0FBQ3BCLFlBQUksQ0FBQyxRQUFRLE9BQU87QUFDbEIsa0JBQVEsS0FBSyxDQUFDO0FBQUEsUUFDaEI7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
