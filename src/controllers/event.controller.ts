import type { Request, Response } from "express";
import eventService from "../services/event.service.ts";
import catchAsync from "../utils/catchAsync.ts";

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const event = await eventService.createEvent(req.body);
  res.status(201).json({ success: true, data: event });
});

const listEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.listEvents({
    page: parseInt((req.query?.page as string) || "1"),
    limit: parseInt((req.query?.limit as string) || "10"),
    search: req.query?.search as string,
  });
  res.status(200).json({ success: true, ...result });
});

const getEventById = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.getEventById(req.params?.id as string);
  res.status(200).json({
    success: true,
    ...result,
  });
});

export default { createEvent, listEvents, getEventById };
