import { FIELD_TYPES } from "../Types";
import { IItems } from "../Items";
import { DataType } from "../types/DataType";
import { IExpressionField, ISection } from "../ReadyComponents";
import * as fs from "fs";
import * as path from "path";
import { IListStylingObject } from "../Style";
import PizZip from "pizzip";
import { Context } from "../../context";
import { XML } from "../../word/XML";

const Docxtemplater = require("docxtemplater");

export class List {
  private _docTemplate: any;
  private _zipTemplate: PizZip;

  private _template?: string;

  constructor() {
    this._zipTemplate = new PizZip();
  }

  public loadTemplate(context: Context, input: string) {
    const zipTemplateContent = fs.readFileSync(
      path.resolve(context.getRelativeFileFinder().getFolder(), input),
      "binary"
    );
    this._zipTemplate = new PizZip(zipTemplateContent);
  }

  public value_template(
    context: Context,
    key: string,
    fieldsT: string[],
    expressions: IExpressionField[],
    template: string,
    sections?: ISection
  ) {
    const styleDef = context.getStyleFields().value(key);
    let response = "";
    const style = styleDef && styleDef.style ? (styleDef.style as IListStylingObject) : {};

    if (sections && sections.field) {
      const values: string[] = context.getItems().uniqueValues(sections.field);
      values.forEach((value: string) => {
        const items = context.getItems().filterByValue(sections.field, value);
        const header = context.getItemsStruct().getHeader(sections.field);

        /* Add templates section header */
        response += XML.startParagraph();
        /* Check if label must be printed */
        if (sections.showFieldLabel) {
          response += XML.styledText(`${header}:`, value, sections.labelStyle);
          response += XML.blankSpace();
        }
        response += XML.styledText(`${value}`, value, sections.valueStyle);
        response += XML.endParagraph();

        /* Add the templates for the given value */
        response += this._addTemplate(context, fieldsT, expressions, template, style, items);

        /* Add line break after section - empty paragraph */
        response += XML.startParagraph();
        response += XML.endParagraph();
      });
    } else {
      /* Return all templates */
      response += this._addTemplate(
        context,
        fieldsT,
        expressions,
        template,
        style,
        context.getItems().filteredItems
      );
    }

    return response;
  }

  private _addTemplate(
    context: Context,
    fieldsT: string[],
    expressions: IExpressionField[],
    template: string,
    style: IListStylingObject,
    items: IItems[]
  ) {
    let response = "";
    let fields = fieldsT;

    const baseZip = context
      .getTemplater()
      .prepareTemplateToImport(path.resolve(context.getRelativeFileFinder().getFolder(), template));

    /* Iterate over each item */
    items.forEach((item: IItems, index: number, arr: IItems[]) => {
      const zip = new PizZip(baseZip, { base64: true });

      const doc = new Docxtemplater();
      doc.loadZip(zip).setOptions({ delimiters: { start: "$_", end: "_$" } });

      fields = Object.keys(item);

      for (let i = 0; i < expressions.length; i++) {
        const element = expressions[i];

        if (!fields.includes(element.name)) fields.push(element.name);
      }

      const data: { [key: string]: any } = {};

      /* Iterate over each field to show */
      (fields || []).forEach((field: string) => {
        const expressionIndex = expressions.findIndex((x) => x.name === field);

        const strField =
          expressionIndex > -1
            ? expressions[expressionIndex].labelName || expressions[expressionIndex].name
            : field.charAt(0).toUpperCase() + field.slice(1);

        const struct = context.getItemsStruct().value(field);

        const fieldStyle =
          (style.fieldsStyle || []).filter((x) => x.field === field)[0] || undefined;

        const xml = DataType.getData(
          context,
          struct ? struct.type : 0,
          {
            value: item[field],
            format: struct ? struct.format : "mm/dd/yyyy"
          },
          item,
          field,
          expressions,
          fieldStyle ? fieldStyle.style : undefined,
          false
        );

        let resp = "";

        if (struct && struct.type === FIELD_TYPES.PICTURE) {
          if (fieldStyle && fieldStyle.shouldShowLabel) {
            resp += XML.paragraphContent(strField + ":");
          }

          resp += xml;
        } else {
          if (fieldStyle && fieldStyle.shouldShowLabel) {
            resp += strField + ": " + xml;
          } else {
            resp += xml;
          }
        }

        data[field] = resp;
      });

      doc.setData(data);
      doc.render();

      const xml = doc.getZip().file("word/document.xml")?.asText();

      let xmlTemplate = "";

      const templateXml = /<w:body[^>]*>((.|[\n\r])*)<\/w:body>/im.exec(xml);

      if (templateXml && templateXml[0]) {
        xmlTemplate = templateXml[0]
          .replace(new RegExp("<w:body>", "g"), "")
          .replace(new RegExp("</w:body>", "g"), "")
          .replace(/<w:sectPr[^>]*>((.|[\n\r])*)<\/w:sectPr>/im, "");
      }

      response += xmlTemplate;

      /* Add page break */
      if (index !== arr.length - 1) response += XML.pageBreak();
    });

    return response;
  }

  public value(
    context: Context,
    key: string,
    fieldsT: string[],
    expressions: IExpressionField[],
    template?: string,
    sections?: ISection
  ): string {
    if (template) {
      const xml = this.value_template(context, key, fieldsT, expressions, template, sections);
      return xml;
    }

    const styleDef = context.getStyleFields().value(key);
    let response = "";
    const style = styleDef && styleDef.style ? (styleDef.style as IListStylingObject) : {};

    if (sections && sections.field) {
      const values: string[] = context.getItems().uniqueValues(sections.field);
      values.forEach((value: string) => {
        const items = context.getItems().filterByValue(sections.field, value);
        const header = context.getItemsStruct().getHeader(sections.field);

        /* Add list section header */
        response += XML.startParagraph();
        /* Check if label must be printed */
        if (sections.showFieldLabel) {
          response += XML.styledText(`${header}:`, value, sections.labelStyle);
          response += XML.blankSpace();
        }
        response += XML.styledText(`${value}`, value, sections.valueStyle);
        response += XML.endParagraph();

        /* Add the list for the given value */
        response += this._addList(context, fieldsT, expressions, style, items);

        /* Add line break after section - empty paragraph */
        response += XML.startParagraph();
        response += XML.endParagraph();
      });
    } else {
      /* Return all list */
      response += response += this._addList(
        context,
        fieldsT,
        expressions,
        style,
        context.getItems().filteredItems
      );
    }

    return response;
  }

  private _addList(
    context: Context,
    fieldsT: string[],
    expressions: IExpressionField[],
    style: IListStylingObject,
    items: IItems[]
  ): string {
    const fields = fieldsT;
    let response = "";

    /* Iterate over each item */
    items.forEach((item: IItems, index: number, arr: IItems[]) => {
      /* Iterate over each field to show */
      (fields || []).forEach((field: string) => {
        const expressionIndex = expressions.findIndex((x) => x.name === field);

        const strField =
          expressionIndex > -1
            ? expressions[expressionIndex].labelName || expressions[expressionIndex].name
            : field.charAt(0).toUpperCase() + field.slice(1);

        const struct = context.getItemsStruct().value(field);
        if (struct) {
          const fieldStyle =
            (style.fieldsStyle || []).filter((x) => x.field === field)[0] || undefined;

          const xml = DataType.getData(
            context,
            struct.type,
            {
              value: item[field],
              format: struct.format
            },
            item,
            field,
            expressions,
            fieldStyle ? fieldStyle.style : undefined,
            true
          );

          response += XML.startParagraph();
          if (struct.type === FIELD_TYPES.PICTURE) {
            if (fieldStyle && fieldStyle.shouldShowLabel) {
              response += XML.paragraphContent(strField + ":");
            }

            response += " " + xml;
          } else {
            if (fieldStyle && fieldStyle.shouldShowLabel) {
              response += XML.paragraphContent(strField + ": " + xml);
            } else {
              response += XML.paragraphContent(xml);
            }
          }
          response += XML.endParagraph();
        }
      });

      /* Add page break */
      if (index !== arr.length - 1) response += XML.pageBreak();
    });

    return response;
  }
}
