import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

export const errorHandler = async(error:Error,req:Request,res:Response,_next:NextFunction)=>{
     res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({error:error.message})
}