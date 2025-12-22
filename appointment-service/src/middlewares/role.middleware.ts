import type { NextFunction, Request, Response } from "express";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { COMMON_MESSAGE } from "../constants/common-response.constants.js";

export const authorize = (allowedRoles:string[]) => 

    (req:Request,res:Response,next:NextFunction)=>{
        const role = req.headers['x-token-role'] as string
        if(!role || !allowedRoles.includes(role))  return commonResponse.failure(res,COMMON_MESSAGE.NOT_ACCESS,HTTP_STATUS.FORBIDDEN)
 

 next()
}
