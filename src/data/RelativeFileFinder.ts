/**
 * Items data handler
 */
export class RelativeFileFinder {
  private _folder = "";

  constructor() {
    /* Do nothing */
  }

  /**
   * Load the items from JSON file
   */
  public setFolder(defintionPath: string) {
    this._folder = defintionPath;
  }

  public getFolder(): string {
    return this._folder;
  }
}
