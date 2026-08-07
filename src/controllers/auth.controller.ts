import type { Request, Response } from "express";
import authService from "../services/auth.service.ts";
import catchAsync from "../utils/catchAsync.ts";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
});

export default { register, login };
