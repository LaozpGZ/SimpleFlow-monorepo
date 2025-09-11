interface AmbiguityCheckEntry {
  key: string;
  files: string[];
  contexts: string[];
}

export async function ambiguityCheckDryRun({
  entries,
  chunkSize = 20,
}: {
  entries: AmbiguityCheckEntry[];
  chunkSize?: number;
}): Promise<number> {
  return Math.ceil(entries.length / chunkSize);
}
