# gemanki

Create Anki `.apkg` decks from Node.js.

`gemanki` is a small ESM library for generating Anki package. It writes the Anki SQLite collection with `sql.js` and returns the final `.apkg` archive as a Node `Buffer`.

## Requirements

- Node.js 18 or newer
- ESM project or dynamic `import()`

## Installation

```bash
npm install gemanki
```

For local development in this repository:

```bash
npm install
npm test
```

## Usage

```js
import { writeFile } from "node:fs/promises";
import initSqlJs from "sql.js";
import { Deck, Model, Package } from "gemanki";

const SQL = await initSqlJs();

const apkg = new Package();
apkg.setSqlJs(new SQL.Database());

const deck = new Deck(1234567890, "German Vocabulary");

const basicModel = new Model({
  id: 987654321,
  name: "Basic",
  flds: [{ name: "Front" }, { name: "Back" }],
  req: [[0, "all", [0]]],
  tmpls: [
    {
      name: "Card 1",
      qfmt: "{{Front}}",
      afmt: "{{FrontSide}}<hr id=\"answer\">{{Back}}",
    },
  ],
});

deck.addNote(basicModel.note(["Hallo", "Hello"], ["german"]));
deck.addNote(basicModel.note({ Front: "Danke", Back: "Thanks" }));

apkg.addDeck(deck);

const buffer = await apkg.writeToBuffer();
await writeFile("german-vocabulary.apkg", buffer);
```

The generated `.apkg` can be imported directly into Anki.

## API

### `new Package()`

Container for one or more decks.

- `setSqlJs(db)` sets a `sql.js` database instance, for example `new SQL.Database()`.
- `addDeck(deck)` adds a `Deck`.
- `writeToBuffer()` returns a `Promise<Buffer>` containing the `.apkg` archive.

### `new Deck(id, name, desc = "")`

Creates an Anki deck definition.

- `id` should be a stable positive integer.
- `name` is the deck name shown in Anki.
- `addNote(note)` appends a note to the deck.

### `new Model(props)`

Creates an Anki note type. Required properties:

- `id`: stable positive integer model ID
- `name`: model name
- `flds`: field definitions, for example `[{ name: "Front" }, { name: "Back" }]`
- `tmpls`: card templates with `qfmt` and `afmt`
- `req`: card generation rules, for example `[[0, "all", [0]]]`

Use `model.note(fields, tags?, guid?)` to create notes. `fields` can be either an array in model field order or an object keyed by field name.

## Limitations

- Media files are not supported yet. The generated package includes an empty Anki `media` manifest.
- This package targets Node.js ESM only.

## Publishing Checklist

Before publishing a new version:

```bash
npm test
npm pack --dry-run
npm publish
```

Check that the package name is available for your npm account and update `package.json` metadata such as `author`, `repository`, `homepage`, and `bugs` once the public repository URL is known.

## License

MIT
