import path from "path";
import { translateRepo } from "../util/translateRepo";

export async function commandHandler(args: string[]) {
  let dir: string | undefined;
  let dryrun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dryrun") {
      dryrun = true;
    } else if (!dir) {
      dir = arg;
    }
  }

  const target = dir ? path.resolve(dir) : process.cwd();
  await translateRepo(target, dryrun);
}
