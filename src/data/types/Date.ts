import dateformat from "dateformat";
import { IBasicStylingObject, IStyleFields } from "../Style";
import { Context } from "../../context";
import { XML } from "../../word/XML";

/**
 * Class to resolve date type value
 */
export class Date {
  constructor() {
    /* Do nothing */
  }

  public value(context: Context, key: string, obj: any, style?: IStyleFields): string {
    let format;
    if (obj["format"]) {
      format = obj["format"];
    } else {
      format = this.getDefaultFormat();
    }
    const val = obj["value"] ? dateformat(obj["value"] || 0, format.replace(/Y/g, "y"), true) : "";

    const stylingDef = context.getStyleFields().value(key) || style;

    if (stylingDef && stylingDef.style) {
      const style = XML.getStyle(val, stylingDef.style as IBasicStylingObject);

      return (
        XML.unescape("<w:r><w:rPr>" + style + "</w:rPr><w:t>") + val + XML.unescape("</w:t></w:r>")
      );
    }

    return val;
  }

  getDefaultFormat() {
    return "dddd, mmmm dS, yyyy, h:MM:ss TT";
  }
}
