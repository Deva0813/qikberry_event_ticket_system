import { mysqlClient } from "../config/prismaClient.ts";
import { Role, type User } from "../generated/mysql-client/index.js";
import ApiError from '../utils/error.ts';


function toSafeUser(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function makeAdmin(id: string) {
  const user = await mysqlClient.user.update({
    where: { id },
    data: {
      role: Role.ADMIN
    }
  })
  if (!user) throw new ApiError(404, 'User Not Found');
  return {
    user: toSafeUser(user)
  }
}

export default { toSafeUser, makeAdmin };

