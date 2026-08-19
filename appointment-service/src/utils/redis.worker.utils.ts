import { config } from "../config/env.config.js";
import { redisClient } from "../config/redis.config.js";
import { redisKeyGenerator } from "./redis.key.gen.utils.js"

//acquire lock
export const lockSlot=async(doctorId:string,date:string,time:string,keyValue:string):Promise<boolean>=>{
    const key  = redisKeyGenerator(doctorId,date,time);
    const acquiredResult = await redisClient.set(key,keyValue,{NX:true,EX:Number(config.slotLockTTL)})
    return acquiredResult==='OK'
}


//release lock
export const releaseSlot=async(doctorId:string,date:string,time:string,randomId:string):Promise<boolean>=>{
    //lua script for running two operations as single operation in redis server instead of two network call to redis server
    const script = `
    if redis.call("GET",KEYS[1]) == ARGV[1] then
        return redis.call("DEL",KEYS[1])
    else 
        return 0
    end
    `

    const  key  = redisKeyGenerator(doctorId,date,time);
    const result = await redisClient.eval(script,{
        keys:[key],
        arguments:[randomId]
    })

    return result===1
}

export const isLocked=async(doctorId:string,date:string,time:string):Promise<boolean>=>{
    const key =  redisKeyGenerator(doctorId,date,time);
    const isExist = await redisClient.exists(key)
    console.log("Is key exists or not ",isExist)
    return isExist===1?true:false
}
