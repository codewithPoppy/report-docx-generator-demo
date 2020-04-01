import { FIELD_TYPES } from "../Types";
import { IExpressionField } from "../ReadyComponents";
import { IBasicStylingObject } from "../Style";
import { Context } from "../../context";
import Logger from "../../logger";
import { XML } from "../../word/XML";

export class DataType {
  private static _logger = new Logger("DataType");
  constructor() {
    /* Do nothing */
  }

  public static getData(
    contextObj: Context,
    type: number,
    obj: any,
    context: any,
    key: string,
    expressions: IExpressionField[],
    styles?: IBasicStylingObject,
    ignoreWp?: boolean
  ): string {
    const style = { key: "", style: styles };

    switch (type) {
      case FIELD_TYPES.STRING:
      case FIELD_TYPES.TEXT_AREA:
        return contextObj.getString().value(contextObj, key, obj, style);

      case FIELD_TYPES.NUMBER:
        return contextObj.getNumber().value(contextObj, key, obj, style);

      case FIELD_TYPES.PICTURE:
        // eslint-disable-next-line no-case-declarations
        const wp = ignoreWp ? "" : "<w:p>";
        // eslint-disable-next-line no-case-declarations
        const wpClose = ignoreWp ? "" : "</w:p>";
        return XML.unescape(wp + contextObj.getPicture().value(contextObj, obj) + wpClose);

      case FIELD_TYPES.DATE:
        return contextObj.getDate().value(contextObj, key, obj, style);

      case FIELD_TYPES.EXPRESSION:
        return contextObj.getExpression().value(contextObj, obj, context, key, expressions, style);

      case FIELD_TYPES.DROPDOWN:
        return contextObj.getDropdown().value(contextObj, key, obj, style);
      default:
        this._logger.error("Invalid data type: " + type);
        return "";
    }
  }
}
