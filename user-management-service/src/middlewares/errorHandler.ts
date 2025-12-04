import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

export const errorHandler = (err:Error,req:Request,res:Response,next:NextFunction)=>{
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:err.message})
}