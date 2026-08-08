import Joi from "joi";

const createEvent = {
  body: Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(5000).required(),
    date: Joi.date().iso().required(),
    location: Joi.string().max(200).required(),
    totalTickets: Joi.number().integer().min(1).required(),
    metadata: Joi.object().unknown(true).optional(),
  }),
};

const listEvents = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().optional()
  }),
};

const EventById = {
  param: Joi.object({
    id:Joi.string().required()
  }),
};

export { createEvent, listEvents,EventById };
