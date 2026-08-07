import { Router } from "express";
import eventController from '../controllers/event.controller.ts';
import adminMiddleware from '../middleware/admin.middleware.ts';
import authMiddleware from '../middleware/auth.middleware.ts';
import validate from '../middleware/validate.middleware.ts';
import { createEvent, EventById, listEvents } from '../validators/event.validator.ts';

const router = Router()

router.get('/', validate(listEvents), eventController.listEvents);
router.get('/:id',validate(EventById),eventController.getEventById)
router.post('/', authMiddleware, adminMiddleware, validate(createEvent), eventController.createEvent);

export default router;
