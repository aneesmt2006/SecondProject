import { controller, httpGet, type interfaces } from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { IAdminService } from "../services/interfaces/IAdminService.js";
import { inject } from "inversify";
import type { NextFunction, Request, Response } from "express";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { role } from "../decorators/role.decorator.js";




@role(['admin'])
@controller('/admin/fetch')
export class AdminController implements interfaces.Controller {
    constructor(@inject(TYPES.AdminService)private _adminService:IAdminService){}
    
    @httpGet('/usersProfile')
    async getUsersProfile(req:Request,res:Response,next:NextFunction){
        console.log("Users profile hit ------>")
        try {
        const {message,profiles} = await this._adminService.findAllUserProfile()
        console.log("PROFILESS_______>",profiles)
        commonResponse.success(res,message,profiles,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }
}