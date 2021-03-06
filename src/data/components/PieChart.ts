import { Context } from "../../context";
import { XML } from "../../word/XML";
import { IItems } from "../Items";
import { imageSize } from "image-size";
import highChartsExporter from "highcharts-export-server";
import { IPieChartStylingObject, IStyleFields, StyleFields } from "../Style";

export class PieChart {
  constructor() {
    /* Do nothing */
  }

  public async value(
    context: Context,
    key: string,
    splitByField: string,
    chartTitle: string
  ): Promise<string> {
    let res = "";
    const filteredItems: IItems[] = context.getItems().filteredItems;

    // group by filtered items
    const groupByItems: any = filteredItems.reduce((r, a) => {
      let k = a[splitByField];
      r[k] = r[k] || [];
      r[k].push(a);
      return r;
    }, Object.create(null));

    // get colors
    const styleDef: IStyleFields = context.getStyleFields().value(key);
    const style: IPieChartStylingObject =
      styleDef && styleDef.style
        ? (styleDef.style as IPieChartStylingObject)
        : {};

    // get result and chart data
    let resultData = [];
    let chartData = [];
    Object.keys(groupByItems).forEach((key: string) => {
      resultData.push({
        value: key,
        count: groupByItems[key].length,
      });
      chartData.push({
        name: key,
        y: groupByItems[key].length,
        color: style.valueToColor ? style.valueToColor[key] : undefined,
      });
    });
    let imgData = await this.makeChart(chartTitle, chartData);
    res += this.insertChart(context, imgData);
    res += XML.drawGroupTableInPieChart(splitByField, resultData);
    return res;
  }

  public makeChart(chartTitle: string, chartData: any[]): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      let exportSettings = {
        type: "jpg",
        options: {
          title: {
            text: chartTitle,
          },
          series: [
            {
              type: "pie",
              data: chartData,
              showInLegend: true,
              dataLabels: {
                enabled: false,
              },
            },
          ],
        },
      };

      highChartsExporter.initPool();
      highChartsExporter.export(exportSettings, (err, res) => {
        if (err) return reject(err);
        highChartsExporter.killPool();
        let buffer = Buffer.from(res.data, "base64");
        resolve(buffer);
      });
    });
  }

  public insertChart(context: Context, imgData: Buffer): string | null {
    const dimensions = imageSize(imgData);
    const imgId = context.getTemplater().attachImageBuffer(imgData);
    return XML.image("", imgId, dimensions.width, dimensions.height);
  }
}
