import { GetObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config/env.config.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3.js";

const BUCKET_NAME = config.awsS3Bucket;
export const generateReadUrl=async(key:string)=>{
    const command = new GetObjectCommand({
        Bucket:BUCKET_NAME,
        Key:key
    })

    return await getSignedUrl(s3,command,{expiresIn:60})
}