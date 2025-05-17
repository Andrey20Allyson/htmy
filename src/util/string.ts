import { JSBinaryOperationType } from "../parser/nodes/js-binary-operation.type";
import { SyntaxNode } from "../parser/nodes/syntax-node";
import { StringSlice } from "./slice";

export function sliceIdentifier(source: StringSlice): StringSlice {
  let i = 0;

  while (true) {
    const char = source.at(i++);

    if (char == null) {
      break;
    }

    if (!isIdentifierBody(char)) {
      break;
    }
  }

  return source.slice(0, i - 1);
}

export function isWord(source: StringSlice, word: string): boolean {
  for (let i = 0; i < word.length; i++) {
    if (i >= source.length) {
      return false;
    }

    if (!source.isCharAtEq(i, word[i]!)) {
      return false;
    }
  }

  return true;
}

export function isIdentifierStart(char: string): boolean {
  return isAlpha(char) || char === "_";
}

export function isIdentifierBody(char: string): boolean {
  return isAlphanum(char) || char === "_";
}

export function isAlphanum(char: string): boolean {
  return isAlpha(char) || isNum(char);
}

export function isAlpha(char: string): boolean {
  return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
}

export function isNum(char: string): boolean {
  return char >= "0" && char <= "9";
}

export function arrayToString(array: any[]) {
  if (array.length === 0) {
    return `${Color.DIM}empty array${Color.RESET}`;
  }

  return `\n${ident(
    array.map((value, i) => `- ${ident(fancy(value)).trimStart()}`).join("\n")
  )}`;
}

export class Color {
  static readonly RESET = "\x1b[0m";
  static readonly GREEN = "\x1b[32m";
  static readonly BLUE = "\x1b[34m";
  static readonly YELLOW = "\x1b[33m";
  static readonly RED = "\x1b[31m";
  static readonly CYAN = "\x1b[36m";
  static readonly MAGENTA = "\x1b[35m";
  static readonly WHITE = "\x1b[37m";
  static readonly BLACK = "\x1b[30m";

  static readonly BRIGHT = "\x1b[1m";
  static readonly DIM = "\x1b[2m";
  static readonly UNDERLINE = "\x1b[4m";
  static readonly REVERSED = "\x1b[7m";
  static readonly STRIKETHROUGH = "\x1b[9m";
  static readonly HIDDEN = "\x1b[8m";

  static readonly BG_GREEN = "\x1b[42m";
  static readonly BG_BLUE = "\x1b[44m";
  static readonly BG_YELLOW = "\x1b[43m";
  static readonly BG_RED = "\x1b[41m";
  static readonly BG_CYAN = "\x1b[46m";
  static readonly BG_MAGENTA = "\x1b[45m";
  static readonly BG_WHITE = "\x1b[47m";
  static readonly BG_BLACK = "\x1b[40m";
}

export function fancy(input: any): string {
  if (input == null) {
    return `${Color.DIM}empty${Color.RESET}`;
  }

  if (Array.isArray(input)) {
    return arrayToString(input);
  }

  if (typeof input === "string") {
    return `${Color.GREEN + Color.BRIGHT}'${
      Color.RESET + Color.GREEN
    }${input.replaceAll("'", "\\'")}${Color.BRIGHT}'${Color.RESET}`;
  }

  if (input instanceof SyntaxNode) {
    const props = Object.entries(input)
      .filter(([key]) => key !== "length")
      .map(
        ([key, value]) =>
          `${key}${Color.DIM + ":" + Color.RESET} ${fancy(value)}`
      )
      .join("\n");

    return `${
      Color.BLUE + `[${input.constructor.name}]` + Color.RESET
    }\n${ident(props)}`;
  }

  if (input instanceof JSBinaryOperationType) {
    return `operator(${fancy(input.value)})`;
  }

  if (typeof input === "object") {
    const props = Object.entries(input)
      .map(([key, value]) => `${key}: ${fancy(value)}`)
      .join(", ");

    return `{\n${ident(props)}\n}`;
  }

  if (typeof input === "number") {
    return `${Color.YELLOW}${input}${Color.RESET}`;
  }

  if (typeof input === "boolean") {
    return `${Color.MAGENTA}${input}${Color.RESET}`;
  }

  return input.toString();
}

export interface Stringable {
  toString(): string;
}

export function ident(input: Stringable, identStr = "  ") {
  // console.log(SyntaxNode);
  return input
    .toString()
    .split("\n")
    .map((line) => identStr + line)
    .join("\n");
}
