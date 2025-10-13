

import type { NextFunction, Request, Response } from "express";
import { config } from "../config/env.js";
import jwt from 'jsonwebtoken'


export const authenticate = async (req:Request,res:Response,next:NextFunction)=>{
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    try {
        jwt.verify(token,config.jwtSecret);
        next()
    } catch (error) {
        return res.status(403).json({message:"Invalid Token"})
    }
}