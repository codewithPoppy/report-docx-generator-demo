import { Context } from "../../context";
import { XML } from "../../word/XML";
import { IItems } from "../Items";

export class PieChart {
  constructor() {
    /* Do nothing */
  }

  public value(
    context: Context,
    key: string,
    splitByField: string,
    chartTitle: string
  ): string {
    let res = "";
    const filteredItems: IItems[] = context.getItems().filteredItems;

    // group by filtered items
    const groupByItems: any = filteredItems.reduce((r, a) => {
      key = a[splitByField];
      r[key] = r[key] || [];
      r[key].push(a);
      return r;
    }, Object.create(null));

    res += XML.drawGroupTableInPieChart(
      splitByField,
      Object.keys(groupByItems).map((key: string) => ({
        value: key,
        count: groupByItems[key].length,
      }))
    );
    return res;
  }
}
