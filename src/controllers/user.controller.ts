import type { Request, Response } from "express";
import userService from "../services/user.service.ts";
import catchAsync from "../utils/catchAsync.ts";
 
const makeAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.makeAdmin(req.params?.id as string)
  res.status(200).json({ success: true, data: result })
})

export default { makeAdmin};
