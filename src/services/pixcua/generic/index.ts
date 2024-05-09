import sql, {
  IResult,
  Request,
  config as SQLConfig,
  ConnectionPool,
  Transaction,
} from "mssql";

export interface DBConfig extends SQLConfig {
  user: string;
  password: string;
  server: string;
  database: string;
  options: {
    encrypt: boolean;
    enableArithAbort: boolean;
    trustServerCertificate: boolean;
  };
}

export default class GenericSQLService<T> {
  private poolPromise: Promise<ConnectionPool> | null = null;
  private config: DBConfig;
  private tableName: string;
  private schema: string;

  constructor(schema: string, tableName: string) {
    this.tableName = tableName;
    this.schema = schema;
    this.config = {
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      server: process.env.DB_SERVER!,
      database: process.env.DB_DATABASE!,
      options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,
      },
    };
    this.poolPromise = this.connect();
  }

  private async connect(): Promise<ConnectionPool> {
    if (!this.poolPromise) {
      this.poolPromise = sql.connect(this.config);
    }
    return this.poolPromise;
  }

  private async query(
    query: string,
    parameters: any[] = [],
    transaction?: Transaction
  ): Promise<IResult<T>> {
    const pool = await this.connect();
    let request: Request;
    request = transaction ? new Request(transaction) : new Request(pool);

    parameters.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });

    try {
      return await request.query<T>(query);
    } catch (err) {
      console.error("Error ejecutando consulta:", err);
      throw err;
    }
  }

  public async executeProcedure(
    procedureName: string,
    parameters: any[] = [],
    transaction?: Transaction
  ): Promise<IResult<T>> {
    const pool = await this.connect();
    let request: Request;
    request = transaction ? new Request(transaction) : new Request(pool);

    parameters.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });

    try {
      return await request.execute<T>(procedureName);
    } catch (err) {
      console.error("Error ejecutando procedimiento:", err);
      throw err;
    }
  }

  public async executeProcedureQuery(
    query: string,
    transaction?: Transaction
  ): Promise<IResult<T>> {
    const pool = await this.connect();
    let request: Request;
    request = transaction ? new Request(transaction) : new Request(pool);
    try {
      return await request.execute<T>(query);
    } catch (err) {
      console.error("Error ejecutando procedimiento:", err);
      throw err;
    }
  }

  public async startTransaction(): Promise<Transaction> {
    const pool = await this.connect();
    const transaction = new Transaction(pool);
    const trans = await transaction.begin();
    return trans;
  }

  public async commitTransaction(transaction: Transaction) {
    await transaction.commit();
  }

  public async rollbackTransaction(transaction: Transaction) {
    await transaction.rollback();
  }

  public async getByQuery(query: string): Promise<IResult<T>> {
    return this.query(query);
  }

  public async getByFx(schema: string, fxName: string): Promise<IResult<T>> {
    const query = `SELECT * FROM ${schema}.${fxName}()`;
    return this.query(query);
  }

  public async getAll(): Promise<IResult<T>> {
    const query = `SELECT * FROM ${this.schema}.${this.tableName}`;
    return this.query(query);
  }

  public async getById(id: number): Promise<IResult<T>> {
    const query = `SELECT * FROM ${this.schema}.${this.tableName} WHERE id = @id`;
    return this.query(query, [{ name: "id", type: sql.Int, value: id }]);
  }

  public async create(data: T): Promise<IResult<T>> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const query = `INSERT INTO ${this.schema}.${this.tableName} (${keys.join(
      ", "
    )}) VALUES (${values.join(", ")})`;
    return this.query(query);
  }

  public async update(id: number, data: T): Promise<IResult<T>> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const query = `UPDATE ${this.schema}.${this.tableName} SET ${keys
      .map((key, index) => `${key} = ${values[index]}`)
      .join(", ")} WHERE id = @id`;
    return this.query(query, [{ name: "id", type: sql.Int, value: id }]);
  }

  public async delete(id: number): Promise<IResult<T>> {
    const query = `DELETE FROM ${this.schema}.${this.tableName} WHERE id = @id`;
    return this.query(query, [{ name: "id", type: sql.Int, value: id }]);
  }

  public async deleteAll(): Promise<IResult<T>> {
    const query = `DELETE FROM ${this.schema}.${this.tableName}`;
    return this.query(query);
  }

  public async executeQuery(query: string): Promise<IResult<T>> {
    return this.query(query);
  }

  public async close() {
    const pool = await this.connect();
    await pool.close();
    this.poolPromise = null;
  }
}
