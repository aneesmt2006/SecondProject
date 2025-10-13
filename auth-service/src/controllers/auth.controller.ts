import { inject, injectable } from "inversify";
import  { controller, httpPost} from "inversify-express-utils";
import type { interfaces } from "inversify-express-utils";
import { AuthService } from "../services/auth.service.js";
import { TYPES } from "../types/index.js";
import { validate } from "../middlewares/validator.js";
import { registerSchema } from "../utils/schemas-zod.utils.js";
import type { Request, Response } from "express";


@controller('/auth')
export class AuthController implements interfaces.Controller{
    private service: AuthService;
    constructor(@inject(TYPES.AuthService) service:AuthService){
        this.service = service
    }

    @httpPost('/register',validate(registerSchema))
    public async register(req:Request,res:Response){
        console.log("Register hit");  // Add for debug
        try {
            const user = await this.service.register(req.body);
            res.json(user)
        } catch (error) {
            console.error("Error :",error)
            console.log('error at register',error)
        }
    }
    
}