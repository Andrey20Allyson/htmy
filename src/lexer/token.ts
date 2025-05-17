import util from "util";
import { ArraySlice, Slicable, Slice } from "../util/slice";

export class TokenType {
  static ARROW_LEFT = "arrow_left";
  static ARROW_RIGHT = "arrow_right";

  static HTML_TAG_CLOSE_ARROW_LEFT = "html_tag_close_arrow_left";
  static HTML_TAG_CLOSE_ARROW_RIGHT = "html_tag_close_arrow_right";
  static HTML_TEXT = "html_text";
  static HTML_IDENTIFIER = "html_identifier";
  static HTML_LITERAL_STRING = "html_literal_string";

  static HTMY_KEYWORD = "htmy_keyword";
  static HTMY_OPEN_JS_CONTEXT = "htmy_open_js_context";
  static HTMY_CLOSE_JS_CONTEXT = "htmy_close_js_context";

  static OPEN_BRACES = "open_braces";
  static CLOSE_BRACES = "close_braces";
  static OPEN_PAREM = "open_parem";
  static CLOSE_PAREM = "close_parem";
  static DOT = "dot";
  static COMMA = "comma";
  static COLON = "colon";
  static SEMICOLON = "semicolon";
  static PLUS = "plus";
  static ASSIGN = "assign";

  static JS_IDENTIFIER = "js_identifier";
  static JS_LITERAL_NUMBER = "js_literal_number";
  static JS_EQUALS = "js_equals";
  static JS_NOT_EQUALS = "js_not_equals";
  static JS_LITERAL_NULL = "js_literal_null";
  static JS_LITERAL_BOOLEAN = "js_literal_boolean";
}

export class Token {
  constructor(readonly type: string, readonly text: string) {}

  [util.inspect.custom]() {
    return `Token(${this.type}, ${util.inspect(this.text, false, null, true)})`;
  }

  toString() {
    return `Token(${this.type}, ${this.text})`;
  }
}

export class TokenArraySlice extends ArraySlice<Token> {
  constructor(tokens: Token[] | Slice<Token>, offset?: number, limit?: number) {
    super(tokens, offset, limit);
  }

  override slice(start: number, end?: number): TokenArraySlice {
    return new TokenArraySlice(super.slice(start, end));
  }
}
