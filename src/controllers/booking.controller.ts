
import type { Request, Response } from 'express';
import { Role, type User } from '../generated/mysql-client/index.js';
import bookingService from "../services/booking.service.ts";
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/error.ts';
import logger from '../utils/logger.ts';

const bookTicket = catchAsync(async (req: Request & { user: Pick<User, "id" | "role"> }, res: Response) => {

  if (req.user.role == Role.ADMIN) {
    logger.error('Only USER role can access this api', { user: req.user });
    throw new ApiError(401, 'Only USER role can access this api');
  }

  const booking = await bookingService.bookTicket({
    userId: req.user.id,
    eventId: req.body.eventId,
    quantity: req.body.quantity,
  });
  res.status(201).json({ success: true, data: booking });
});

const myTickets = catchAsync(async (req: Request & { user: Pick<User, "id" | "role"> }, res: Response) => {
  const bookings = await bookingService.getMyTickets(req.user.id);
  res.status(200).json({ success: true, data: bookings });
});

const cancelMyTicket = catchAsync(async (req: Request & { user: Pick<User, "id" | "role"> }, res: Response) => {
  const result = await bookingService.cancelTicket({
    userId: req.user.id,
    bookingId: req.body.bookingId
  })

  res.status(200).json({success:true,data:result})
})

export default { bookTicket, myTickets,cancelMyTicket };
