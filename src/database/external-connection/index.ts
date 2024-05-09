import sql, {
  ConnectionPool,
  Request,
  IResult,
  config as SQLConfig,
  Transaction,
} from "mssql";

interface DBConfig extends SQLConfig {
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

class SQLDatabase {
  private poolPromise: Promise<ConnectionPool> | null = null;
  private config: DBConfig;

  constructor() {
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

  public async query<T = any>(
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
      console.error("Error ejecutando querie:", err);
      throw err;
    }
  }

  public async executeProcedure<T = any>(
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
      console.error("Error ejecutando procedimiento almacenado:", err);
      throw err;
    }
  }

  public async startTransaction(): Promise<Transaction> {
    const pool = await this.connect();
    const transaction = new Transaction(pool);
    await transaction.begin();
    return transaction;
  }

  public async commitTransaction(transaction: Transaction): Promise<void> {
    await transaction.commit();
  }

  public async rollbackTransaction(transaction: Transaction): Promise<void> {
    await transaction.rollback();
  }

  public async close(): Promise<void> {
    const pool = await this.connect();
    await pool.close();
    this.poolPromise = null;
  }
}

export default SQLDatabase;
