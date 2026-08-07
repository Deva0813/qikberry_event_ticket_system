import { mongoClient, mysqlClient } from "../config/prismaClient.ts";
import type { Event } from "../generated/mongodb-client/index.js";
import { BookingStatus, type Booking } from "../generated/mysql-client/index.js";
import ApiError from "../utils/error.ts";
import logger from "../utils/logger.ts";

const CANCELLATION_WINDOW_MS = 48 * 60 * 60 * 1000;


async function bookTicket({ userId, eventId, quantity }: { userId: string, eventId: Event["id"], quantity: number }) {

  const decremented = await mongoClient.event.updateMany({
    where: { id: eventId, ticketsRemaining: { gte: quantity } },
    data: { ticketsRemaining: { decrement: quantity } },
  });

  if (decremented.count === 0) {
    const event = await mongoClient.event.findUnique({ where: { id: eventId } });
    if (!event) throw new ApiError(404, 'Event not found');
    throw new ApiError(409, 'Not enough tickets available');
  }

  try {
    const booking = await mysqlClient.booking.create({
      data: { userId, eventId, quantity, status: 'CONFIRMED' },
    });
    return booking;
  } catch (err) {

    await mongoClient.event.update({
      where: { id: eventId },
      data: { ticketsRemaining: { increment: quantity } },
    });
    logger.error('Booking rollback triggered after MySQL write failure', { eventId, userId });
    throw new ApiError(500, 'Failed to complete booking, please try again');
  }
}

async function getMyTickets(userId: string) {
  const bookings = await mysqlClient.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (bookings.length === 0) return [];


  const eventIds = [...new Set(bookings.map((b: Booking) => b.eventId))];
  const events = await mongoClient.event.findMany({
    where: { id: { in: eventIds } },
    select: { id: true, title: true, date: true, location: true },
  });
  const eventMap = new Map(events.map((e: any) => [e.id, e]));

  return bookings.map((b: Booking) => ({
    ...b,
    event: eventMap.get(b.eventId) || null,
  }));
}

async function cancelTicket({ userId, bookingId }: { userId: string, bookingId: string }) {
 
  const bookingTicket = await mysqlClient.booking.findFirst({
    where: { id: bookingId, userId, status: BookingStatus.CONFIRMED },
  });

  if (!bookingTicket) {
    throw new ApiError(404, 'No booking available to cancel');
  }

  const event = await mongoClient.event.findUnique({
    where: { id: bookingTicket.eventId },
  });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const msUntilEvent = event.date.getTime() - Date.now();
  if (msUntilEvent < CANCELLATION_WINDOW_MS) {
    throw new ApiError(400, 'Bookings can only be cancelled at least 48 hours before the event');
  }

  await mysqlClient.booking.update({
    where: { id: bookingTicket.id },
    data: { status: BookingStatus.CANCELLED },
  });

  try {
    await mongoClient.event.update({
      where: { id: event.id },
      data: { ticketsRemaining: { increment: bookingTicket.quantity } },
    });
  } catch (err) {
 
    await mysqlClient.booking.update({
      where: { id: bookingTicket.id },
      data: { status: BookingStatus.CONFIRMED },
    });
    logger.error('Cancellation rollback: ticket release failed', { bookingId: bookingTicket.id, userId });
    throw new ApiError(500, 'Failed to cancel booking, please try again');
  }

  return { bookingId: bookingTicket.id, status: BookingStatus.CANCELLED };
}

export default { bookTicket, getMyTickets, cancelTicket };
