import type { Response } from "express";


export class commonResponse{
  static success<T>(res:Response,message:string,data:T,status:number=200){
     return res.status(status).json({success:true,message,data,status})
  }

  static failure(res:Response,Errmessage:string,status:number=500){
    return res.status(status).json({message:Errmessage});
  }

}