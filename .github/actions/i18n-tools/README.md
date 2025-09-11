# i18n-tools

The `scan` command looks for a `.i18n-config` file in the target directory.
Use `scanDirs` to define directories to inspect and `exclude` for patterns
that should be ignored. Patterns from an existing `.gitignore` are also
honored. You can supply `extendedTranslationFiles` in `.i18n-config` to merge
additional translation entries from JSON files into the scan result.
An `ignores` array can list translation keys that should be skipped during translation.
The configuration must also include a `model` field indicating which
translation model to use. An optional `requirements` array can provide additional
context to be sent with each translation request.

```
i18n-pcs scan [dir] [--output file]
```

When `--output` is provided the result is written to the specified file,
otherwise the JSON is printed to the console.

The `translate` command processes missing translations for all configured languages:

```
i18n-pcs translate [dir] [--dryrun]
```

With `--dryrun` the tool only reports how many prompts would be required per language without performing any translations.

The `translateFile` command sends translation entries to an AI model and prints
the translated result as JSON. `--requirement` and `--model` are optional; you can
provide multiple `--requirement` flags. The model defaults to `gemini`.

```
i18n-pcs translateFile [file] --lang targetLang [--requirement requirement] [--model model]
```

The `ambiguity` command detects translation keys that appear in multiple files:

```
i18n-pcs ambiguity [dir] [--output dir] [--dryrun]
```

When `--output` is provided the ambiguous results are written to `ambiguity.json`
inside the given directory; otherwise the JSON is printed to the console.

With `--dryrun` the tool only reports how many prompts would be required without performing any checks.
