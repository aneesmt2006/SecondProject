import type { Request, Response } from "express";

export class GatewayController {
    healthCheck(req:Request,res:Response){
        res.status(200).json({message:"Health of API Gateway is Good(running)"});
    }
};