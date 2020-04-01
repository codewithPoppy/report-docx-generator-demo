import { IFilterField, IExpressionField } from "./ReadyComponents";
import { evaluate } from "mathjs";
import { Context } from "../context";
import Logger from "../logger";

/**
 * Items data type
 */
export interface IItems {
  [key: string]: any;
}

export interface IGroupedTableFunctionCondition {
  field: string;
  type: "ABOVE" | "UNDER" | "EQUALS" | "CONTAINS" | "ALL";
  value: any;
}

export interface IGroupedTableFunction {
  type: "LIST" | "COUNT" | "SUM" | "AVG";
  field: string;
  headerName: string;
  condition: IGroupedTableFunctionCondition;
}

/**
 * Items data handler
 */
export class Items {
  private _items: IItems[];
  private _tmpItems: IItems[];
  private _headers: IItems;
  private _logger;

  constructor() {
    this._items = [];
    this._tmpItems = [];
    this._headers = {};
    this._logger = new Logger("Items");
  }

  /**
   * Load the project fields from JSON file
   */
  public static loadData(context: Context, data: any) {
    context.getItems().validate(context, data);
  }

  /**
   * Validate the items data
   */
  public validate(context: Context, items: IItems[]) {
    const validator = context.getItemsStruct().itemValidator;

    /* Iterate each value */
    (items || []).forEach((dataValue: IItems) => {
      /* Validate the object data type */
      const { error, value } = validator.validate(dataValue);
      if (error) {
        this._logger.error("There is an error inside the item definition", {
          item: dataValue,
          error: error
        });
      } else {
        /* Add the transformed data */
        this._items.push(value);
      }
    });
  }

  /**
   * Start a filter and sort operations
   */
  public startFilter() {
    /* Duplicate items array to prevent initial data modification */
    this._tmpItems = this._items.slice(0);
  }

  /**
   * Apply data filters
   */
  public applyFilters(filters: IFilterField[], expressions: IExpressionField[]) {
    if (!filters || filters.length <= 0) {
      return;
    }

    /* Filter each item */
    this._tmpItems = this._tmpItems.filter((item: IItems) => {
      let filtered = true;

      /* Check each filter */
      filters.forEach((filter: IFilterField) => {
        let fieldVal = item[filter.field];

        const expressionIndex = expressions.findIndex((x) => x.name === filter.field);

        if (expressionIndex > -1) {
          const expressionArr: { [key: string]: any } = {};

          for (const key in item) {
            // eslint-disable-next-line no-prototype-builtins
            if (item.hasOwnProperty(key)) {
              const element = item[key];

              try {
                const v = evaluate(element, expressionArr);
                expressionArr[key] = v;
              } catch {
                /* Do nothing */
              }
            }
          }

          fieldVal = evaluate(expressions[expressionIndex].value, expressionArr);
        }

        switch (filter.filterType.toUpperCase()) {
          /* Greater than filter */
          case "ABOVE":
            filtered = filtered && fieldVal > filter.value;
            break;

          /* Equal filter */
          case "EQUALS":
            filtered = filtered && fieldVal.toString() === filter.value.toString();
            break;

          /* Less than filter */
          case "UNDER":
            filtered = filtered && fieldVal < filter.value;
            break;

          /* Contains filter */
          case "CONTAINS":
            filtered =
              filtered &&
              fieldVal.toString().toUpperCase().includes(filter.value.toString().toUpperCase());
            break;

          case "ALL":
            filtered = true;
            break;

          default:
            this._logger.error("Invalid filter", { filter: filter.filterType });
        }
      });

      return filtered;
    });
  }

  /**
   * Sort the items data
   */
  public sort(field?: string, sortDirection?: string, expression?: string) {
    if (!field) {
      return;
    }

    if (expression) {
      /* Sort the items according to the information */
      const direction: number = (sortDirection || "DESC").toUpperCase() === "ASC" ? 1 : -1;
      this._tmpItems.sort((a: IItems, b: IItems) => {
        const ctxA: { [key: string]: any } = {};

        for (const key in a) {
          // eslint-disable-next-line no-prototype-builtins
          if (a.hasOwnProperty(key)) {
            const element = a[key];

            try {
              const v = evaluate(element, ctxA);
              ctxA[key] = v;
            } catch {
              /* Do nothing */
            }
          }
        }

        const ctxB: { [key: string]: any } = {};

        for (const key in b) {
          // eslint-disable-next-line no-prototype-builtins
          if (b.hasOwnProperty(key)) {
            const element = b[key];

            try {
              const v = evaluate(element, ctxB);
              ctxB[key] = v;
            } catch {
              /* Do nothing */
            }
          }
        }

        const valA = evaluate(expression || "", ctxA);
        const valB = evaluate(expression || "", ctxB);

        return valA > valB ? 1 * direction : -1 * direction;
      });
    } else {
      /* Sort the items according to the information */
      const direction: number = (sortDirection || "DESC").toUpperCase() === "ASC" ? 1 : -1;
      this._tmpItems.sort((a: IItems, b: IItems) => {
        if (this.isString(a[field]) && this.isString(b[field])) {
          return a[field].localeCompare(b[field]) * direction;
        } else {
          return a[field] > b[field] ? 1 * direction : -1 * direction
        }
      }
      );
    }
  }

  private isString(val) {
    if(!val) {
      return false;
    }
    return typeof val === 'string' || val instanceof String;
  }

  public group(field: string, functions: IGroupedTableFunction[], expressions: IExpressionField[]) {
    const groupIndexes: string[] = [];
    const groups: IItems[][] = [];

    const expressionIndex = expressions.findIndex((x) => x.name === field);

    const toGroup = [...this._tmpItems];

    // Separate in Groups
    toGroup.forEach((x) => {
      let curVal = x[field];

      if (expressionIndex >= 0) {
        const expressionArr: { [key: string]: any } = {};

        for (const key in x) {
          // eslint-disable-next-line no-prototype-builtins
          if (x.hasOwnProperty(key)) {
            const element = x[key];

            try {
              const v = evaluate(element, expressionArr);
              expressionArr[key] = v;
            } catch (error) {
              this._logger.error("Invalid error group expression", { error: error });
            }
          }
        }

        curVal = evaluate(expressions[expressionIndex].value, expressionArr);
      }

      let groupIndex = groupIndexes.findIndex((y) => y === curVal);

      if (groupIndex < 0) {
        groupIndex = groupIndexes.push(curVal) - 1;
        groups.push([]);
      }

      groups[groupIndex].push(x);
    });

    const newItems: IItems[] = [];

    groups.forEach((g) => {
      const newItem: IItems = {};

      functions.forEach((f) => {
        let fieldVal;

        if (!f.condition) {
          this._logger.error("No condition specified.");
          process.exit(-1);
        }

        const condFunc = f.type;

        const cond: IGroupedTableFunctionCondition = f.condition;

        const matches: IItems[] = [];

        g.forEach((i) => {
          let filtered = true;

          let fVal = i[cond.field];

          const fExpressionIndex = expressions.findIndex((x) => x.name === cond.field);

          if (fExpressionIndex >= 0) {
            const expressionArr: { [key: string]: any } = {};

            for (const key in i) {
              // eslint-disable-next-line no-prototype-builtins
              if (i.hasOwnProperty(key)) {
                const element = i[key];

                try {
                  const v = evaluate(element, expressionArr);
                  expressionArr[key] = v;
                } catch (error) {
                  this._logger.error("Invalid error items expression", { error: error });
                }
              }
            }

            fVal = evaluate(expressions[fExpressionIndex].value, expressionArr);
          }

          switch (cond.type.toUpperCase()) {
            /* Greater than filter */
            case "ABOVE":
              filtered = filtered && fVal > cond.value;
              break;

            /* Equal filter */
            case "EQUALS":
              filtered = filtered && fVal.toString() === cond.value.toString();
              break;

            /* Less than filter */
            case "UNDER":
              filtered = filtered && fVal < cond.value;
              break;

            /* Contains filter */
            case "CONTAINS":
              filtered =
                filtered &&
                fVal.toString().toUpperCase().includes(cond.value.toString().toUpperCase());
              break;

            case "ALL":
              filtered = true;
              break;

            default:
              this._logger.error("Invalid filter", { filter: cond.type });
          }

          if (filtered) matches.push(i);
        });

        switch (condFunc.toUpperCase()) {
          case "LIST":
            // eslint-disable-next-line no-case-declarations
            const vals: any[] = [];

            for (let i = 0; i < matches.length; i++) {
              if (vals.findIndex((x) => x === matches[i][cond.field]) < 0) {
                vals.push(matches[i][cond.field]);
              }
            }

            fieldVal = "";

            for (let i = 0; i < vals.length; i++) {
              const element = vals[i];

              fieldVal += element + (i < vals.length - 1 ? ", " : "");
            }

            break;

          case "SUM":
            fieldVal = 0;

            for (let i = 0; i < matches.length; i++) {
              const element = matches[i][cond.field];

              fieldVal += element;
            }

            break;

          case "AVG":
            fieldVal = 0;
            for (let i = 0; i < matches.length; i++) {
              const element = matches[i][cond.field];
              fieldVal += element;
            }
            fieldVal /= matches.length;
            break;

          case "COUNT":
            fieldVal = matches.length;
            break;

          default:
            break;
        }

        newItem[f.field] = fieldVal;
        this._headers[f.field] = f.headerName;
      });

      newItems.push(newItem);
    });

    this._tmpItems = newItems;
  }

  public getHeader(key: string) {
    return this._headers[key] || key;
  }

  /**
   * Iterate each filtered item
   */
  public iterate(fnHandler: (item: IItems, index: number, items: IItems[]) => void) {
    this._tmpItems.forEach(fnHandler);
  }

  public get filteredItems(): IItems[] {
    return this._tmpItems;
  }

  public fnSum(field: string, items?: IItems[]): number {
    let tmp = 0;
    (items || this._tmpItems).forEach((item: IItems) => {
      tmp += item[field];
    });
    return tmp;
  }

  public fnAvg(field: string, items?: IItems[]): number {
    if ((items || this._tmpItems).length <= 0) {
      return 0;
    }
    return this.fnSum(field, items) / (items || this._tmpItems).length;
  }

  public fnCount(_field: string, items?: IItems[]): number {
    return (items || this._tmpItems).length;
  }

  public fnDate(_field: string, _items?: IItems[]): string {
    const date = new Date();
    return date.toLocaleString();
  }

  public uniqueValues(field: string): string[] {
    const keys: any = {};
    this._tmpItems.forEach((item: IItems) => {
      if (!keys[item[field]]) {
        keys[item[field]] = true;
      }
    });
    return Object.keys(keys);
  }

  public filterByValue(field: string, value: any): IItems[] {
    return this._tmpItems.filter((item: IItems) => item[field].toString() === value);
  }
}
