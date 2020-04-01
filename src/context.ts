import { Image } from "./data/components/Image";
import { List } from "./data/components/List";
import { Table } from "./data/components/Table";
import { PieChart } from './data/components/PieChart'
import { Items } from "./data/Items";
import { ItemsStruct } from "./data/ItemsStruct";
import { Placeholders } from "./data/Placeholders";
import { ProjectFields } from "./data/ProjectFields";
import { ReadyComponents } from "./data/ReadyComponents";
import { StyleFields } from "./data/Style";
import { Date } from "./data/types/Date";
import { Expression } from "./data/types/Expression";
import { Number as NumberType } from "./data/types/Number";
import { Picture } from "./data/types/Picture";
import { String as StringType } from "./data/types/String";
import { RelativeFileFinder } from "./data/RelativeFileFinder";
import { Templater } from "./word/Templater";
import { Dropdown } from "./data/types/Dropdown";
import { Formulas } from "./data/Formulas";

export class Context {
  id;
  image: Image;
  list: List;
  table: Table;
  pieChart: PieChart;
  items: Items;
  itemsStruct: ItemsStruct;
  placeholders: Placeholders;
  projectFields: ProjectFields;
  readyComponents: ReadyComponents;
  styleFields: StyleFields;
  date: Date;
  expression: Expression;
  number: NumberType;
  picture: Picture;
  dropdown: Dropdown;
  string: StringType;
  relativeFileFinder: RelativeFileFinder;
  templater: Templater;
  private _formulas: Formulas;

  constructor(id: any) {
    this.id = id;
    this.image = new Image();
    this.list = new List();
    this.table = new Table();
    this.pieChart = new PieChart();
    this.items = new Items();
    this.itemsStruct = new ItemsStruct();
    this.placeholders = new Placeholders();
    this.projectFields = new ProjectFields();
    this.readyComponents = new ReadyComponents();
    this.styleFields = new StyleFields();
    this.date = new Date();
    this.expression = new Expression();
    this.number = new NumberType();
    this.picture = new Picture();
    this.string = new StringType();
    this.dropdown = new Dropdown();
    this.relativeFileFinder = new RelativeFileFinder();
    this.templater = new Templater(this);
    this._formulas = new Formulas();
  }

  public getRelativeFileFinder() {
    return this.relativeFileFinder;
  }

  public getTemplater() {
    return this.templater;
  }

  public getImage() {
    return this.image;
  }

  public getTable() {
    return this.table;
  }

  public getPieChart() {
    return this.pieChart;
  }

  public getList() {
    return this.list;
  }

  public getItems() {
    return this.items;
  }

  public getItemsStruct() {
    return this.itemsStruct;
  }

  public getPlaceholders() {
    return this.placeholders;
  }

  public getReadyComponents() {
    return this.readyComponents;
  }

  public getStyleFields() {
    return this.styleFields;
  }

  public getDate() {
    return this.date;
  }

  public getExpression() {
    return this.expression;
  }

  public getNumber() {
    return this.number;
  }

  public getPicture() {
    return this.picture;
  }

  public getString() {
    return this.string;
  }

  public getDropdown() {
    return this.dropdown;
  }

  public getProjectFields() {
    return this.projectFields;
  }

  public get formulas() {
    return this._formulas;
  }
}
