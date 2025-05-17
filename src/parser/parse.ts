import { Token, TokenArraySlice } from "../lexer/token";
import { HTMYChildrenNode } from "./nodes/htmy-children";
import { ParseContext } from "./parse-context";
import { HTMYChildrenParser } from "./parsers/htmy-children";
import { HTMYElementParser } from "./parsers/htmy-element";
import { HTMYElementIdentifierParser } from "./parsers/htmy-element-identifier";
import { HTMYIfStatementParser } from "./parsers/htmy-if-statement";
import {
  HTMYLiteralStringParser,
  HTMYPropertiesParser,
  HTMYPropertyParser,
} from "./parsers/htmy-properties";
import { HTMYTextParser } from "./parsers/htmy-text";
import { JSBinaryOperationParser } from "./parsers/js-binary-operation";
import { JSContextParser } from "./parsers/js-context";
import { JSExpressionParser } from "./parsers/js-expression";
import { JSIdentifierParser } from "./parsers/js-identifier";
import { JSLiteralNullParser } from "./parsers/js-literal-null";
import { JSOperationParser } from "./parsers/js-operation";

export default function parse(tokens: Token[] | TokenArraySlice) {
  if (tokens instanceof Array) {
    tokens = new TokenArraySlice(tokens);
  }

  const context = new ParseContext(tokens);

  context.addParser(HTMYElementIdentifierParser);
  context.addParser(HTMYElementParser);

  context.addParser(HTMYPropertiesParser);
  context.addParser(HTMYPropertyParser);
  context.addParser(HTMYLiteralStringParser);

  context.addParser(HTMYChildrenParser);
  context.addParser(HTMYTextParser);

  context.addParser(HTMYIfStatementParser);

  context.addParser(JSContextParser);
  context.addParser(JSExpressionParser);
  context.addParser(JSOperationParser);
  context.addParser(JSIdentifierParser);
  context.addParser(JSBinaryOperationParser);

  context.addParser(JSLiteralNullParser);

  return context.getParserOf(HTMYChildrenNode).parse(context);
}
