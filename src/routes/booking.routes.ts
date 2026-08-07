import { Router } from "express";
import bookingController from "../controllers/booking.controller.ts";
import authMiddleware from "../middleware/auth.middleware.ts";
import validate from "../middleware/validate.middleware.ts";
import { createBooking } from "../validators/booking.validator.ts";


const router = Router()

router.use(authMiddleware);

router.post('/', validate(createBooking), bookingController.bookTicket);
router.get('/me', bookingController.myTickets);
router.patch("/cancel",bookingController.cancelMyTicket)

export default router;
