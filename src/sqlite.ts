import "reflect-metadata";
import { DataSource } from "typeorm";
import { Tracker } from "./entities/tracker";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [Tracker],
    migrations: [],
    subscribers: [],
}).initialize();