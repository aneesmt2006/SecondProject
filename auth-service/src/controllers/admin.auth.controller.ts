import { inject } from "inversify";
import { controller, httpGet, httpPost, httpPut, type interfaces } from "inversify-express-utils";
import { TYPES } from "../types/index.js";
import type { IAdminAuthService } from "../services/interfaces/IAdminAuthService.js";
import { validate } from "../middlewares/validator.js";
import { loginSchema } from "../utils/schemas-zod.utils.js";
import type { NextFunction, Request, Response } from "express";
import type { TloginRequesDTO } from "../dtos/user.dto.js";
import { config } from "../config/env.config.js";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { role } from "../decorators/role.decorator.js";

@controller('/auth/admin')
export class AdminController implements interfaces.Controller{
    private _adminAuthService : IAdminAuthService
        constructor(@inject(TYPES.AdminAuthService) adminService:IAdminAuthService){
            this._adminAuthService = adminService
        }

    @httpPost('/login',validate(loginSchema))
    async login(req:Request,res:Response,next:NextFunction){

       try {
        const {email,password} = req.body
        const loginDTO:TloginRequesDTO = {email,password}
        const {admin,accessToken,refreshToken,message} = await this._adminAuthService.login(loginDTO.email,loginDTO.password)
              res.cookie('refreshToken',refreshToken,{
                httpOnly:true,
                secure:config.nodeEnv ==='production' ,
                sameSite:'strict',
                maxAge:config.refreshToken_maxAge as number // 7 day
              });

              commonResponse.success(res,message,{...admin,accessToken},HTTP_STATUS.OK)
       } catch (error) {
         next(error)
       }
    }
    
    @role(['admin'])
    @httpGet('/getAllUsers')
    async getAllUsers(req:Request,res:Response,next:NextFunction){
      try {
        const {users,message} = await this._adminAuthService.getAllUsers();
        console.log("users---------->",users)
        commonResponse.success(res,message,users,HTTP_STATUS.OK)
      } catch (error) {
        next(error)
      }

    }


    @role(['admin'])
    @httpGet('/getAllDoctors')
    async getAllDoctors(req:Request,res:Response,next:NextFunction){
      try {
        const {doctors,message} = await this._adminAuthService.getAllDoctors();
        console.log("doctors---------->",doctors)
        commonResponse.success(res,message,doctors,HTTP_STATUS.OK)
      } catch (error) {
        next(error)
      }
    }

    @role(['admin'])
    @httpPut('/updateDoctorStatus/:id')
    async updateDoctorStatus(req:Request,res:Response,next:NextFunction){
      try {
        const {id} = req.params
        const {status} = req.body;
        if(!id || !status) return commonResponse.failure(res,"Id and status is required",400)
        
          console.log("Id---->",id)
        const {doctor,message} = await this._adminAuthService.updateDoctorStatus(id,status);
        commonResponse.success(res,message,doctor,HTTP_STATUS.OK)
      } catch (error) {
        next(error)
      }
    }


    @role(['admin'])
    @httpPut('/updateUserStatus/:id')
    async updateUserStatus(req:Request,res:Response,next:NextFunction){
      const {id} = req.params
        const {status} = req.body;
      try {
        const {message,user}  = await this._adminAuthService.updateUserStatus(id!,status)
        commonResponse.success(res,message,user,HTTP_STATUS.OK)
      } catch (error) {
        next(error)
      }
    }
}
