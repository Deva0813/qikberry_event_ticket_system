import type { NextFunction, Request, Response } from 'express';
import joi from "joi";
import ApiError from "../utils/error.ts";


export default (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  const toValidate: any = {};
  if (schema.body) toValidate.body = req.body;
  if (schema.query) toValidate.query = req.query;
  if (schema.params) toValidate.params = req.params;

  const compiled = joi.object(schema).prefs({ abortEarly: false, stripUnknown: true });

  const { error, value } = compiled.validate(toValidate);

  if (error) {
    const details = error.details.map((d) => d.message);
    throw new ApiError(400, 'Validation failed', details as any);
  }

  if (value.body) req.body = value.body;
  if (value.query) {
    Object.keys(req.query).forEach((key) => delete (req.query as any)[key]);
    Object.assign(req.query, value.query);
  }
  if (value.params) req.params = value.params;
  next();
};
