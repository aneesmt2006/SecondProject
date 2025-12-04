import type { NextFunction, Request, Response } from "express";
import { controller, httpPost, type interfaces } from "inversify-express-utils";
import { createPresignedPost } from "../utils/s3.js";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { AUTH_RESPONSE_MESSAGES } from "../constants/response-messages.constants.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { role } from "../decorators/role.decorator.js";

@role(['doctor', 'user', 'admin'])
@controller('/upload')
export class UplaodController implements interfaces.Controller {
    @httpPost('/signed-url')
    public async register(req:Request,res:Response,next:NextFunction){
        console.log("Signed url hit");
        try {
             let urls = req.body.array
             console.log('array---',urls)
             if(!Array.isArray(urls)){
                throw new Error("File must be inside Array")
             }
            //  key = 'public/'+key;
            const responseArray = await createPresignedPost(urls);
            commonResponse.success(res,AUTH_RESPONSE_MESSAGES.FILE_UPLOAD,responseArray,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }
}
