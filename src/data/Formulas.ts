import Joi from "joi";
import { Context } from "../context";
import Logger from "../logger";
import { IFilterField } from "./ReadyComponents";
import { FormulaCtrl } from "./components/Formula";

export interface IFormula {
  key: string;
  type: string;
  field?: string;
  condition?: IFilterField;
}

/**
 * Formula data handler
 */
export class Formulas {
  private _formulas: IFormula[];
  private _logger;

  constructor() {
    this._formulas = [];
    this._logger = new Logger("Formulas");
  }

  /**
   * Load the project fields from JSON file
   */
  public static loadData(context: Context, data: any) {
    context.formulas.validate(data);
  }

  /**
   * Validate the ready components data
   */
  public validate(formulas: IFormula[]) {
    /* Initialize the JOI validator */
    const validator = Joi.object({
      key: Joi.string().required(),
      type: Joi.string().required().uppercase().valid("LIST", "COUNT", "SUM", "DATE", "AVG"),
      field: Joi.string().optional().allow(""),
      condition: Joi.object({
        field: Joi.string().required(),
        filterType: Joi.string()
          .uppercase()
          .valid("UNDER", "ABOVE", "EQUALS", "CONTAINS", "ALL")
          .required(),
        value: Joi.alternatives(Joi.string().required(), Joi.number().required())
      }).optional()
    });

    /* Iterate each value */
    (formulas || []).forEach((dataValue: IFormula) => {
      /* Validate the object data type */
      const { error, value } = validator.validate(dataValue);
      if (error) {
        this._logger.error("There is an error inside the formula definition", {
          item: dataValue,
          error: error
        });
        process.exit(-1);
      }

      /* Add the transformed data */
      this._formulas.push(value);
    });
  }

  /**
   * Get the key value for the project field
   */
  public value(context: Context, key: string): string {
    /* Filter the ready components by the placeholder key */
    const formulas: IFormula[] = (this._formulas || []).filter(
      (value: IFormula) => value.key === key
    );

    /* Check if a valid project was found */
    if (!formulas || formulas.length !== 1) {
      this._logger.error("Invalid formula for key", { key: key });
      return "";
    }

    /* Apply data filters */
    context.getItems().startFilter();
    const filter: IFilterField[] = [];
    if (formulas[0].condition && formulas[0].condition.filterType) {
      filter.push(formulas[0].condition);
    }
    context.getItems().applyFilters(filter, []);

    /* Calculate the formula */
    return FormulaCtrl.value(context, formulas[0].type, formulas[0].field);
  }

  public get values(): IFormula[] {
    return this._formulas;
  }
}
