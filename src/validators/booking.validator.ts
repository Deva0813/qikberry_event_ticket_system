import Joi from "joi"

const createBooking = {
  body: Joi.object({
    eventId: Joi.string().length(24).hex().required(), // Mongo ObjectId
    quantity: Joi.number().integer().min(1).max(10).default(1),
  }),
};

export { createBooking };
