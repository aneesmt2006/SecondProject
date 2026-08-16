import { controller, httpPost, next, type interfaces } from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { IRagIngestionService } from "../services/interfaces/IRagIngestionService.js";
import { inject } from "inversify";
import type { NextFunction, Request, Response } from "express";
import type { IRagAskChatService } from "../services/interfaces/IRagAskChatService.js";
import { role } from "../decorators/role.decorator.js";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";




@controller('/chatBot')
export class AskChatBotController implements interfaces.Controller {
    constructor(@inject(TYPES.RagAskChatService)private _ragAskChatService:IRagAskChatService){}

    @role(['user'])
    @httpPost('/ask')
    async askQuestion(req:Request,res:Response,next:NextFunction){
        try {
            const {query} = req.body
            const userId = req.headers['x-token-id'] as string
            const {answer,message} = await this._ragAskChatService.ask(query,userId)
            commonResponse.success(res,message,answer,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }
}