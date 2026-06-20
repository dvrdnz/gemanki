export interface FieldDefinition {
  name: string;
  ord?: number | null;
  sticky?: boolean;
  rtl?: boolean;
  font?: string;
  size?: number;
  media?: string[];
}

export interface TemplateDefinition {
  name?: string;
  ord?: number | null;
  qfmt: string;
  afmt: string;
  did?: number | null;
  bqfmt?: string;
  bafmt?: string;
}

export interface ModelProps {
  id: number;
  name: string;
  flds: FieldDefinition[];
  tmpls: TemplateDefinition[];
  req: Array<[number, "all" | "any", number[]]>;
  sortf?: number;
  did?: number;
  latexPre?: string;
  latexPost?: string;
  mod?: number;
  usn?: number;
  vers?: unknown[];
  type?: number;
  css?: string;
  tags?: string[];
}

export class Model {
  props: Required<ModelProps>;
  fieldNameToOrd: Record<string, number>;

  constructor(props: ModelProps);
  note(fields: string[] | Record<string, string>, tags?: string[] | null, guid?: string | null): Note;
}

export class Deck {
  id: number;
  name: string;
  desc: string;
  notes: Note[];

  constructor(id: number, name: string, desc?: string);
  addNote(note: Note): void;
}

export class Note {
  model: Model;
  fields: string[];
  tags: string[] | null;

  constructor(model: Model, fields: string[], tags?: string[] | null, guid?: string | null);
  get guid(): string;
  get cards(): number[];
}

export class Package {
  decks: Deck[];
  media: unknown[];

  constructor();
  setSqlJs(db: unknown): void;
  addDeck(deck: Deck): void;
  writeToBuffer(): Promise<Buffer>;
  write(db: unknown): void;
}

export const defaultModel: object;
export const defaultField: object;
export const defaultTemplate: object;
export const defaultConf: object;
export const defaultDeckConf: object;
export const defaultDeck: object;
export const APKG_SCHEMA: string;
