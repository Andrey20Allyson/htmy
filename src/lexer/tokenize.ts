import { StringSlice } from "../util/slice";
import {
  isIdentifierStart,
  isNum,
  isWord,
  sliceIdentifier,
} from "../util/string";
import { TokenType, Token } from "./token";

function identifierMatcher(source: StringSlice): StringSlice | null {
  const firstChar = source.getOrThrow(0);

  if (!isIdentifierStart(firstChar)) {
    return null;
  }

  return sliceIdentifier(source);
}

function jsKeywordMatcher(keyword: string): TokenMatcherFn {
  return (source) => {
    const firstChar = source.getOrThrow(0);

    if (!isIdentifierStart(firstChar)) {
      return null;
    }

    const text = sliceIdentifier(source);
    if (!isWord(text, keyword)) {
      return null;
    }

    return text;
  };
}

const htmlTextEndPatterns: string[] = ["<", "{", "@", "\r", "\n"];

function htmlTextMatcher(source: StringSlice): StringSlice | null {
  for (let i = 0; i < source.length; i++) {
    const char = source.getOrThrow(i);

    if (htmlTextEndPatterns.includes(char)) {
      return source.slice(0, i);
    }
  }

  return null;
}

function htmlStringMatcher(source: StringSlice): StringSlice | null {
  let firstChar = source.at(0);
  if (firstChar !== '"' && firstChar !== "'") {
    return null;
  }

  let i = 1;
  while (true) {
    const char = source.at(i++);

    if (char == null) {
      break;
    }

    if (char === firstChar) {
      break;
    }
  }

  return source.slice(0, i);
}

export default function tokenize(source: string | StringSlice) {
  if (typeof source === "string") {
    source = StringSlice.from(source);
  }

  let isTagContext = false;
  let lastKeyword: Token | null = null;
  function isCollectingText(): boolean {
    return !isTagContext && lastKeyword == null;
  }

  const matchers: [TokenMatcher, string][] = [
    ["</", TokenType.HTML_TAG_CLOSE_ARROW_LEFT],
    ["/>", TokenType.HTML_TAG_CLOSE_ARROW_RIGHT],
    ["<", TokenType.ARROW_LEFT],
    [">", TokenType.ARROW_RIGHT],

    ["{", TokenType.OPEN_BRACES],
    ["}", TokenType.CLOSE_BRACES],
    ["(", TokenType.OPEN_PAREM],
    [")", TokenType.CLOSE_PAREM],

    ["@for", TokenType.HTMY_KEYWORD],
    ["@if", TokenType.HTMY_KEYWORD],
    ["@end", TokenType.HTMY_KEYWORD],

    ["=", TokenType.ASSIGN],
    [
      () => (isTagContext ? htmlStringMatcher : null),
      TokenType.HTML_LITERAL_STRING,
    ],
    [
      () => (isTagContext ? identifierMatcher : null),
      TokenType.HTML_IDENTIFIER,
    ],
    [() => (isCollectingText() ? htmlTextMatcher : null), TokenType.HTML_TEXT],
  ];

  const openOfTagContextTypes = new Set([
    TokenType.ARROW_LEFT,
    TokenType.HTML_TAG_CLOSE_ARROW_LEFT,
  ]);

  const closeOfTagContextTypes = new Set([
    TokenType.ARROW_RIGHT,
    TokenType.HTML_TAG_CLOSE_ARROW_RIGHT,
  ]);

  const keywordTokensThatExpectsAJsContext = new Set(["@for", "@if"]);

  const tokens: Token[] = [];

  for (let i = 0; i < source.length; i++) {
    const token = matchToken(source.slice(i), matchers);
    if (token == null) {
      continue;
    }

    tokens.push(token);

    if (openOfTagContextTypes.has(token.type)) {
      isTagContext = true;
      i += token.text.length - 1;
      continue;
    }

    if (closeOfTagContextTypes.has(token.type)) {
      isTagContext = false;
      i += token.text.length - 1;
      continue;
    }

    if (token.type === TokenType.OPEN_BRACES) {
      const jsSource = sliceJSContext(source.slice(i), "{", "}");

      const jsTokens = tokenizeJs(jsSource);

      tokens.pop();

      tokens.push(
        new Token(TokenType.HTMY_OPEN_JS_CONTEXT, "{"),
        ...jsTokens,
        new Token(TokenType.HTMY_CLOSE_JS_CONTEXT, "}")
      );

      i += jsSource.length + 1;
      continue;
    }

    if (token.type === TokenType.HTMY_KEYWORD) {
      lastKeyword = token;

      i += token.text.length - 1;
      continue;
    }

    if (
      lastKeyword != null &&
      keywordTokensThatExpectsAJsContext.has(lastKeyword.text) &&
      token.type === TokenType.OPEN_PAREM
    ) {
      const jsSource = sliceJSContext(source.slice(i), "(", ")");

      const jsTokens = tokenizeJs(jsSource);

      tokens.pop();

      tokens.push(
        new Token(TokenType.HTMY_OPEN_JS_CONTEXT, "("),
        ...jsTokens,
        new Token(TokenType.HTMY_CLOSE_JS_CONTEXT, ")")
      );

      lastKeyword = null;
      i += jsSource.length + 1;
      continue;
    }

    i += token.text.length - 1;

    continue;
  }

  return tokens;
}

function tokenizeTagIntern(source: StringSlice): Token[] {
  throw new Error("Method not implemented.");
}

function sliceTagIntern(source: StringSlice): Token[] {
  throw new Error("Method not implemented.");
}

function tokenizeJs(source: StringSlice): Token[] {
  const tokens: Token[] = [];

  const patterns: [TokenMatcher, string][] = [
    ["(", TokenType.OPEN_PAREM],
    [")", TokenType.CLOSE_PAREM],
    ["{", TokenType.OPEN_BRACES],
    ["}", TokenType.CLOSE_BRACES],
    [".", TokenType.DOT],
    ["+", TokenType.PLUS],
    [",", TokenType.COMMA],
    ["==", TokenType.JS_EQUALS],
    ["!=", TokenType.JS_NOT_EQUALS],
    [jsKeywordMatcher("if"), TokenType.HTMY_KEYWORD],

    [jsKeywordMatcher("null"), TokenType.JS_LITERAL_NULL],
    [jsKeywordMatcher("true"), TokenType.JS_LITERAL_BOOLEAN],
    [jsKeywordMatcher("false"), TokenType.JS_LITERAL_BOOLEAN],

    [identifierMatcher, TokenType.JS_IDENTIFIER],
    [literalNumberMatcher, TokenType.JS_LITERAL_NUMBER],
  ];

  for (let i = 0; i < source.length; ) {
    const token = matchToken(source.slice(i), patterns);
    if (token == null) {
      i++;
      continue;
    }

    tokens.push(token);
    i += token.text.length;
  }

  return tokens;
}

function literalNumberMatcher(source: StringSlice): StringSlice | null {
  const firstChar = source.at(0);
  if (firstChar == null) {
    return null;
  }

  if (!isNum(firstChar)) {
    return null;
  }

  let i = 1;
  for (; i < source.length; i++) {
    const char = source.at(i);
    if (char == null || !isNum(char)) {
      break;
    }
  }

  return source.slice(0, i);
}

function sliceJSContext(
  source: StringSlice,
  openContextChar: string,
  closeContextChar: string
): StringSlice {
  let bracesOpen = 0;
  let paremOpen = 0;
  let contextLevel = 0;
  let i = 0;

  do {
    const char = source.getOrThrow(i++);

    if (char === openContextChar) {
      contextLevel++;
    }

    if (char === closeContextChar) {
      contextLevel--;
    }

    if (char === "(") {
      paremOpen++;
    }

    if (char === ")") {
      paremOpen--;
    }

    if (char === "{") {
      bracesOpen++;
    }

    if (char === "}") {
      bracesOpen--;
    }
  } while (contextLevel > 0);

  if (bracesOpen > 0) {
    throw new Error(`Expected the close of braces`);
  }

  if (paremOpen > 0) {
    throw new Error(`Expected the close of parem`);
  }

  return source.slice(1, i - 1);
}

type TokenMatcherFn = (str: StringSlice) => StringSlice | null;
type TokenMatcher = string | TokenMatcherFn | (() => TokenMatcherFn | null);

function matchToken(
  source: StringSlice,
  patterns: Iterable<[TokenMatcher, string]>
): Token | null {
  for (const [matcher, type] of patterns) {
    const match = getMatch(source, matcher);
    if (match == null) {
      continue;
    }

    if (match.length === 0) {
      continue;
    }

    return new Token(type, match);
  }

  return null;

  function getMatch(source: StringSlice, matcher: TokenMatcher): string | null {
    if (typeof matcher === "string") {
      if (isWord(source, matcher)) {
        return matcher;
      }

      return null;
    }

    const match = matcher(source);
    if (typeof match === "function") {
      return getMatch(source, match);
    }
    if (match == null) {
      return null;
    }

    return match.getSlicedInner();
  }
}
