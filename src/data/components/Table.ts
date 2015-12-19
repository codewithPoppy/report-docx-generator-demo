import { ITableBorderStyle } from "./../Style";
import { IItems } from "../Items";
import { IExpressionField, ISection, ITableTotal } from "../ReadyComponents";
import { ITableStylingObject } from "../Style";
import { Context } from "../../context";
import { XML } from "../../word/XML";

export const BORDER_MULTIPLIER = 8;
export class Table {
  constructor() {
    /* Do nothing */
  }

  public value(
    context: Context,
    key: string,
    fields: string[],
    expressions: IExpressionField[],
    sections?: ISection,
    totalRow?: ITableTotal[]
  ): string {
    const styleDef = context.getStyleFields().value(key);

    let response = "";

    const style =
      styleDef && styleDef.style ? (styleDef.style as ITableStylingObject) : {};

    if (sections && sections.field) {
      const values: string[] = context.getItems().uniqueValues(sections.field);
      values.forEach((value: string) => {
        const items = context.getItems().filterByValue(sections.field, value);
        const header = context.getItemsStruct().getHeader(sections.field);

        /* Add table section header */
        response += XML.startParagraph();

        /* Check if label must be printed */
        if (sections.showFieldLabel) {
          response += XML.styledText(`${header}:`, value, sections.labelStyle);
          response += XML.blankSpace();
        }
        response += XML.styledText(`${value}`, value, sections.valueStyle);
        response += XML.endParagraph();

        /* Add the table for the given value */
        response += this._addTable(
          context,
          fields,
          items,
          expressions,
          totalRow,
          style
        );

        /* Add line break after section - empty paragraph */
        response += XML.startParagraph();
        response += XML.endParagraph();
      });
    } else {
      /* Return single table */
      response += this._addTable(
        context,
        fields,
        context.getItems().filteredItems,
        expressions,
        totalRow,
        style
      );
    }

    return response;
  }

  private _addTable(
    context: Context,
    fields: string[],
    items: IItems[],
    expressions: IExpressionField[],
    totalRow: ITableTotal[],
    style: ITableStylingObject
  ): string {
    let response = "";

    /* Define table border styles (top, right, bottom, left) */
    const border = [8, 8, 8, 8];
    const color = ["black", "black", "black", "black"];

    /* Calculate the table border colors */
    style?.tableBorder?.forEach((tblBorder: ITableBorderStyle) => {
      switch (tblBorder.type.toLowerCase()) {
        case "all":
          const _border = Number(tblBorder.width) * BORDER_MULTIPLIER;
          border[0] = _border;
          border[1] = _border;
          border[2] = _border;
          border[3] = _border;
          color[0] = tblBorder.color;
          color[1] = tblBorder.color;
          color[2] = tblBorder.color;
          color[3] = tblBorder.color;
          break;
        case "top":
          border[0] = Number(tblBorder.width) * BORDER_MULTIPLIER;
          color[0] = tblBorder.color;
          break;
        case "bottom":
          border[2] = Number(tblBorder.width) * BORDER_MULTIPLIER;
          color[2] = tblBorder.color;
          break;
        case "left":
          border[3] = Number(tblBorder.width) * BORDER_MULTIPLIER;
          color[3] = tblBorder.color;
          break;
        case "right":
          border[1] = Number(tblBorder.width) * BORDER_MULTIPLIER;
          color[1] = tblBorder.color;
          break;
      }
    });

    /* Calculate the width of each column */
    let _colWidth = context.getTemplater().width;
    let _colCount = 0;
    const width: number[] = [];
    fields.forEach((field: string, col: number) => {
      const fieldHeaderStyle =
        (style.columnStyle || []).filter((x) => x.field === field)[0] || undefined;
      const styleWidth = fieldHeaderStyle?.width ? fieldHeaderStyle.width : -1;
      width.push(styleWidth);

      /* Dynamic adjust of table width */
      if (styleWidth === -1) {
        _colCount++;
      } else {
        _colWidth -= styleWidth;
      }
    });

    /* Calculate and set the remain fields widths */
    if (_colCount > 0) {
      _colWidth /= _colCount;
      width.forEach((value: number, col: number) => {
        if (value === -1) {
          width[col] = _colWidth;
        }
      });
    }

    /* Initialize the table */
    response += XML.startTable(
      context,
      fields || [],
      expressions,
      style,
      width,
      border,
      color
    );

    /* Iterate over each item */
    items.forEach((item: IItems) => {
      /* Add the information row */
      response += XML.addRow(
        context,
        item,
        fields || [],
        item,
        expressions,
        style,
        width,
        border,
        color
      );
    });

    /* Check if the total row must be added */
    if (totalRow && totalRow.length > 0) {
      response += XML.addTotalRow(
        context,
        items,
        totalRow,
        fields || [],
        expressions,
        style,
        width,
        border,
        color
      );
    }

    /* Close the table */
    response += XML.endTable();

    return response;
  }
}
