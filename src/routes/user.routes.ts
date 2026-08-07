import { Router } from "express";
import userController from "../controllers/user.controller.ts";
import validate from '../middleware/validate.middleware.ts';
import { paramId } from "../validators/auth.validator.ts";

const router = Router()

router.patch('/user_role/:id', validate(paramId), userController.makeAdmin)

export default router;
