import { Router } from "express";
import userController from "../controllers/user.controller.ts";
import adminMiddleware from "../middleware/admin.middleware.ts";
import authMiddleware from "../middleware/auth.middleware.ts";
import validate from "../middleware/validate.middleware.ts";
import { paramId } from "../validators/auth.validator.ts";

const router = Router();

router.patch(
  "/user_role/:id",
  authMiddleware,
  adminMiddleware,
  validate(paramId),
  userController.makeAdmin,
);

export default router;
