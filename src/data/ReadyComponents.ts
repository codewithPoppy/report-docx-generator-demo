import { IGroupedTableFunction } from "./Items";
import Joi from "joi";
import { Context } from "../context";
import Logger from "../logger";
import { IBasicStylingObject } from "./Style";

export interface IExpressionField {
  name: string;
  labelName?: string;
  value: string;
}

/**
 * Ready components filters
 */
export interface IFilterField {
  field: string;
  filterType: string;
  value: string | number;
}

export interface ISection {
  field?: string;
  showFieldLabel?: boolean;
  labelStyle?: IBasicStylingObject;
  valueStyle?: IBasicStylingObject;
}

export interface ITableTotal {
  field?: string;
  type?: string;
  label?: string;
}

/**
 * Project fields data type
 */
export interface IReadyComponents {
  key: string;
  type?: number;
  splitByField?: string;
  chartTitle?: string;
  sortByField?: string;
  sortByDirection?: string;
  filterByFieldAndValue?: IFilterField[];
  fieldsToShow?: string[];
  pictureField?: string;
  textField?: string;
  picturesPerPage?: number;
  expressions?: IExpressionField[];
  groupBy?: string;
  fieldFunctions?: IGroupedTableFunction[];
  templateName?: string;
  sections?: ISection;
  totalRow: ITableTotal[];
}

/**
 * Ready components data handler
 */
export class ReadyComponents {
  private _readyComponents: IReadyComponents[];
  private _logger;

  constructor() {
    this._readyComponents = [];
    this._logger = new Logger("ReadyComponents");
  }

  /**
   * Load the project fields from JSON file
   */
  public static loadData(context: Context, data: any) {
    context.getReadyComponents().validate(data);
  }

  /**
   * Validate the ready components data
   */
  public validate(readyComponents: IReadyComponents[]) {
    /* Iterate each value */
    (readyComponents || []).forEach((dataValue: IReadyComponents) => {
      /* Initialize the JOI validator */
      const validator = Joi.object({
        key: Joi.string().required(),
        type: Joi.number().integer().required(),
        splitByField: Joi.string(),
        chartTitle: Joi.string(),
        sortByField: Joi.string(),
        sortByDirection: Joi.string().uppercase().valid("ASC", "DESC"),
        fieldsToShow: Joi.array().items(Joi.string()),
        filterByFieldAndValue: Joi.array().items(
          Joi.object({
            field: Joi.string().required(),
            filterType: Joi.string()
              .uppercase()
              .valid("UNDER", "ABOVE", "EQUALS", "CONTAINS")
              .required(),
            value: Joi.alternatives(
              Joi.string().required(),
              Joi.number().required()
            ),
          })
        ),
        pictureField: Joi.string(),
        textField: Joi.string(),
        picturesPerPage: Joi.number(),
        expressions: Joi.array().items(
          Joi.object({
            name: Joi.string().required(),
            labelName: Joi.string(),
            value: Joi.string().required(),
          })
        ),
        groupBy: Joi.string(),
        fieldFunctions: Joi.any(),
        templateName: Joi.string(),
        sections: Joi.object({
          field: Joi.string().required(),
          showFieldLabel: Joi.boolean(),
          labelStyle: Joi.object().optional(),
          valueStyle: Joi.object().optional(),
        }),
        totalRow: Joi.array().items(
          Joi.object({
            field: Joi.string(),
            type: Joi.string(),
            label: Joi.string(),
          })
        ),
      }).with("sortByField", "sortByDirection");

      /* Validate the object data type */
      const { error, value } = validator.validate(dataValue);
      if (error) {
        this._logger.error(
          "There is an error inside the ready components definition",
          {
            item: dataValue,
            error: error,
          }
        );
        process.exit(-1);
      }

      /* Add the transformed data */
      this._readyComponents.push(value);
    });
  }

  /**
   * Get the key value for the project field
   */
  public async value(context: Context, key: string): Promise<string> {
    /* Filter the ready components by the placeholder key */
    const readyComponents: IReadyComponents[] = this._readyComponents.filter(
      (keyValue: IReadyComponents) => {
        return keyValue.key === key;
      }
    );

    /* Check if a valid project was found */
    if (!readyComponents || readyComponents.length !== 1) {
      this._logger.error("Invalid ready components for key", { key: key });
      return "";
    }

    /* Apply data filters and sort */
    context.getItems().startFilter();

    if (readyComponents[0].groupBy && readyComponents[0].type === 4) {
      context
        .getItems()
        .group(
          readyComponents[0].groupBy,
          readyComponents[0].fieldFunctions || [],
          readyComponents[0].expressions || []
        );
    }

    context
      .getItems()
      .applyFilters(
        readyComponents[0].filterByFieldAndValue || [],
        readyComponents[0].expressions || []
      );

    const sortExpressionIndex = readyComponents[0].expressions
      ? readyComponents[0].expressions.findIndex(
          (x) => x.name === readyComponents[0].sortByField
        )
      : -1;

    if (
      readyComponents[0].expressions &&
      readyComponents[0].sortByField &&
      sortExpressionIndex > -1
    )
      context
        .getItems()
        .sort(
          readyComponents[0].sortByField,
          readyComponents[0].sortByDirection,
          readyComponents[0].expressions[sortExpressionIndex].value
        );
    else
      context
        .getItems()
        .sort(
          readyComponents[0].sortByField,
          readyComponents[0].sortByDirection
        );

    /* Check for the ready component type */
    switch (readyComponents[0].type) {
      /* PieChart type */
      case 6:
        let pieChartRes = await context
          .getPieChart()
          .value(
            context,
            readyComponents[0].key,
            readyComponents[0].splitByField,
            readyComponents[0].chartTitle || readyComponents[0].splitByField
          );
        return pieChartRes;
      /* Table type */
      case 4:
      case 1:
        return context
          .getTable()
          .value(
            context,
            readyComponents[0].key,
            readyComponents[0].fieldsToShow || [],
            readyComponents[0].expressions || [],
            readyComponents[0].sections,
            readyComponents[0].totalRow || []
          );

      /* List type */
      case 5:
      case 2:
        return context
          .getList()
          .value(
            context,
            readyComponents[0].key,
            readyComponents[0].fieldsToShow || [],
            readyComponents[0].expressions || [],
            readyComponents[0].templateName,
            readyComponents[0].sections
          );

      /* Image type */
      case 3:
        return context
          .getImage()
          .value(
            context,
            readyComponents[0].pictureField || "",
            readyComponents[0].textField || "",
            readyComponents[0].picturesPerPage || 10,
            readyComponents[0].sections
          );

      default:
        this._logger.error("Invalid ready component type for key", {
          key: key,
        });
    }

    return "";
  }
}
