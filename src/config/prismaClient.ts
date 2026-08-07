import { PrismaClient as MongoPrismaClient } from "../generated/mongodb-client/index.js";
import { PrismaClient as MysqlPrismaClient } from "../generated/mysql-client/index.js";

const mysqlClient = new MysqlPrismaClient();
const mongoClient = new MongoPrismaClient();

async function connectDatabases() {
    await mysqlClient.$connect();
    await mongoClient.$connect();
}

async function disconnectDatabases() {
    await mysqlClient.$disconnect();
    await mongoClient.$disconnect();
}

export { mysqlClient, mongoClient, connectDatabases, disconnectDatabases };
