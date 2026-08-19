

export const redisKeyGenerator=(doctorId:string,date:string,time:string)=>{
    return `slot:${doctorId}:${date}:${time}`
}
