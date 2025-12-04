import type { NextFunction, Request, Response } from "express";
import { ADMIN_RESPONSE_MESSAGES } from "../constants/response-messages.constant.js";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

export const authorize = (allowedRoles:string[]) => 

    (req:Request,res:Response,next:NextFunction)=>{
        const role = req.headers['x-token-role'] as string
        if(!role || !allowedRoles.includes(role))  return commonResponse.failure(res,ADMIN_RESPONSE_MESSAGES.NOT_ACCESS_TO_ADMIN_ROUTE,HTTP_STATUS.FORBIDDEN)
 

 next()
}
