import { XML } from "../../word/XML";
import { Context } from "../../context";

class Formula {
  private static _instance: Formula;

  private constructor() {
    /* Do nothing */
  }

  public static get shared(): Formula {
    if (!Formula._instance) {
      Formula._instance = new Formula();
    }
    return Formula._instance;
  }

  public value(context: Context, type: string, field: string): string {
    let response = "";
    let value = "";

    switch (type) {
      case "SUM":
        value = `${context.getItems().fnSum(field)}`;
        break;
      case "DATE":
        value = `${context.getItems().fnDate(field)}`;
        break;
      case "COUNT":
        value = `${context.getItems().fnCount(field)}`;
        break;
      case "AVG":
        value = `${context.getItems().fnAvg(field)}`;
        break;
      case "LIST":
        value = `${context.getItems().uniqueValues(field).join(", ")}`;
        break;
    }

    response += value;

    return response;
  }
}

export const FormulaCtrl = Formula.shared;
