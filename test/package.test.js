import assert from "node:assert/strict";
import test from "node:test";
import JSZip from "jszip";
import initSqlJs from "sql.js";
import { Deck, Model, Package } from "../index.js";

function createBasicModel() {
  return new Model({
    id: 123456,
    name: "Basic",
    flds: [{ name: "Front" }, { name: "Back" }],
    req: [[0, "all", [0]]],
    tmpls: [{ name: "Card 1", qfmt: "{{Front}}", afmt: "{{Back}}" }],
  });
}

test("creates a note from named fields in model order", () => {
  const model = createBasicModel();
  const note = model.note({ Back: "Answer", Front: "Question" }, ["tag"]);

  assert.deepEqual(note.fields, ["Question", "Answer"]);
  assert.equal(note.tags?.[0], "tag");
  assert.deepEqual(note.cards, [0]);
});

test("rejects arrays with the wrong number of fields", () => {
  const model = createBasicModel();

  assert.throws(
    () => model.note(["Question"]),
    /Expected 2 fields for model 'Basic' but got 1/,
  );
});

test("writes an apkg buffer with collection and media files", async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  const apkg = new Package();
  apkg.setSqlJs(db);

  const deck = new Deck(987654321, "Example Deck", "Generated in a test");
  deck.addNote(createBasicModel().note(["Question", "Answer"], ["example"]));
  apkg.addDeck(deck);

  const buffer = await apkg.writeToBuffer();
  assert.equal(Buffer.isBuffer(buffer), true);

  const zip = await JSZip.loadAsync(buffer);
  assert.ok(zip.file("collection.anki2"));
  assert.equal(await zip.file("media").async("string"), "{}");

  const collectionBytes = await zip.file("collection.anki2").async("uint8array");
  const collection = new SQL.Database(collectionBytes);
  const decks = collection.exec("select decks from col")[0].values[0][0];
  const notes = collection.exec("select guid, tags, flds from notes")[0].values;
  const cards = collection.exec("select did, ord from cards")[0].values;

  assert.match(decks, /Example Deck/);
  assert.equal(notes.length, 1);
  assert.match(notes[0][0], /.+/);
  assert.equal(notes[0][1], "example");
  assert.equal(notes[0][2], "Question\u001fAnswer");
  assert.deepEqual(cards, [[987654321, 0]]);
});
