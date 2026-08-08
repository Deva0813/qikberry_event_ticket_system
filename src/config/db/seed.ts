import bcrypt from "bcryptjs";
import {
  connectDatabases,
  disconnectDatabases,
  mysqlClient,
} from "../prismaClient.ts";
import { Role } from "../../generated/mysql-client/index.js";

const SALT_ROUNDS = 12;

async function seed_data() {
  try {
    const passwordHash = await bcrypt.hash("12345678", SALT_ROUNDS);

    const exist_user = await mysqlClient.user.findFirst({
      where:{email:"admin@qikberry.com"}
    })

    if (exist_user) {
      return null
    }

    const user = await mysqlClient.user.create({
      data: {
        email: "admin@qikberry.com",
        passwordHash: passwordHash,
        name: "Admin",
        role:Role.ADMIN
      },
    });
    if (user) {
      console.log("\n-------------------------- USER CREATED --------------------------")
      console.table({
        "id": user.id,
        "Name": user.name,
        "Email": user.email,
        "Role":user.role
      })
    }

  } catch (e) {
    console.log(e);
  }
}

async function seeding() {
  await connectDatabases();
  await seed_data();
  await disconnectDatabases();
}

export default seeding;
