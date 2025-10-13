import type { NextFunction, Request, Response } from "express";
import type { IErrorResponse } from "../utils/interface.js";
import logger from "../config/logger.js";

export const handleError = async(err:Error,req:Request,res:Response,next:NextFunction)=>{
    logger.error(`Global error: ${err.message} - Path: ${req.path}`); 
    const response : IErrorResponse = {
        message:err.message || "Internal server Error",
        number:500
    }

   res.status(response.number).json(response);
};

