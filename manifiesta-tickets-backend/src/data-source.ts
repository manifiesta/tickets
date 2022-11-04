import { DataSource, DataSourceOptions } from "typeorm";
import { Department } from "./api/departments/department.entity";
import { Seller } from "./api/sellers/seller.entity";

export function appDataSourceConfig(): DataSourceOptions {
  console.log('putain', process.env.DATABASE_NAME)
  return {
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: +process.env.DATABASE_PORT || 3306,
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.NODE_ENV === 'prod' ?
      process.env.DATABASE_NAME :
      process.env.DATABASE_NAME_TEST,
    entities: [Seller, Department],
    logging: true,
    synchronize: true,
  }
}

export function appDataSource(): DataSource {
  return new DataSource(appDataSourceConfig());
}
