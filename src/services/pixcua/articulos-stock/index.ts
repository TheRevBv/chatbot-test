import GenericSQLService from "../generic";

export default class ArticulosStockService extends GenericSQLService<any> {
  constructor() {
    super("Inventory", "ArticulosStock");
  }

  public getArticulosStockLST = async () => {
    const data = await this.getByFx("Inventory", "fxArticulosStockLST");
    return data.recordset;
  };
}
