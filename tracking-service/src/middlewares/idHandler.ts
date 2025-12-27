import type {  NextFunction, Request, Response } from "express";

export const idHandler = (req:Request,_res:Response,_next:NextFunction)=>{
    const id = req.headers['x-token-id'] as string
    return id
}