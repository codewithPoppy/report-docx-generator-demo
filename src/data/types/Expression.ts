import { evaluate } from "mathjs";
import { IExpressionField } from "../ReadyComponents";
import { IBasicStylingObject, IStyleFields } from "../Style";
import { Context } from "../../context";
import { XML } from "../../word/XML";
import Logger from "../../logger";

/**
 * Class to resolve expression type value
 */
export class Expression {
  private _logger;

  constructor() {
    this._logger = new Logger("ExpressionDataType");
  }

  public value(
    contextObj: Context,
    obj: any,
    context: any,
    key: string,
    expressions: IExpressionField[],
    style?: IStyleFields
  ): string {
    const expressionArr: { [key: string]: any } = {};

    for (const key in context) {
      // eslint-disable-next-line no-prototype-builtins
      if (context.hasOwnProperty(key)) {
        const element = context[key];

        try {
          const v = evaluate(element, expressionArr);
          expressionArr[key] = v;
        } catch (error) {
          // this._logger.error("Invalid error expression", { error: error });
        }
      }
    }

    const expressionIndex = expressions.findIndex((x) => x.name === key);

    let val =
      key !== "" && expressionIndex > -1
        ? evaluate(expressions[expressionIndex].value, expressionArr)
        : evaluate(obj["value"] || "", expressionArr);

    if (val === 0) {
      val = "0";
    } else if (!val) {
      val = "";
    }
    const stylingDef = contextObj.getStyleFields().value(key) || style;

    if (stylingDef && stylingDef.style) {
      const style = XML.getStyle(val, stylingDef.style as IBasicStylingObject);

      return (
        XML.unescape("<w:r><w:rPr>" + style + "</w:rPr><w:t>") + val + XML.unescape("</w:t></w:r>")
      );
    }

    return val;
  }
}
