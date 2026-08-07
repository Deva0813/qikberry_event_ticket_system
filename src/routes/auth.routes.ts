import { Router } from "express";
import authController from "../controllers/auth.controller.ts"
import validate from '../middleware/validate.middleware.ts';
import { register,login, paramId } from "../validators/auth.validator.ts";

const router = Router()

router.post('/register', validate(register), authController.register);
router.post('/login', validate(login), authController.login);

export default router;
