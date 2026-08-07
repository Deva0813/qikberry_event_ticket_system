import { Router } from "express";
import authRouter from "./auth.routes.ts";
import bookingRouter from "./booking.routes.ts";
import eventRouter from "./event.routes.ts";
import userRouter from "./user.routes.ts";

const router = Router()

router.use('/auth', authRouter);
router.use('/events', eventRouter);
router.use('/bookings', bookingRouter);
router.use('/user', userRouter)

export default router;
