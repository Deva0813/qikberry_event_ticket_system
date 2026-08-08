import { mongoClient } from "../config/prismaClient.ts";
import type { Event } from "../generated/mongodb-client/index.js";
import ApiError from "../utils/error.ts";

async function createEvent(data: Event) {
  return mongoClient.event.create({
    data: {
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      location: data.location,
      totalTickets: data.totalTickets,
      ticketsRemaining: data.totalTickets,
      metadata: data.metadata || {},
    },
  });
}

async function listEvents({
  page = 1,
  limit = 10,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}) {
  const skip = (page - 1) * limit;

  const where = search
    ? { title: { contains: search, mode: "insensitive" as const } }
    : {};

  const [items, total] = await Promise.all([
    mongoClient.event.findMany({
      skip,
      take: limit,
      orderBy: { date: "asc" },
      where,
    }),
    mongoClient.event.count(),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getEventById(id: Event["id"]) {
  const event = await mongoClient.event.findUnique({ where: { id } });
  if (!event) throw new ApiError(404, "Event not found");
  return event;
}

export default { createEvent, listEvents, getEventById };
