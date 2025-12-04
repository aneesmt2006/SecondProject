// import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { config } from "../config/env.config.js";

// interface IcreatePresignedPost {
//   fileName: string;
//   fileType: string;
// }

// export const s3 = new S3Client({
//   region: String(config.awsRegion),
//   credentials: {
//     accessKeyId: String(config.awsAccessKey),
//     secretAccessKey: String(config.awsSecretKey),
//   },
// });

// const BUCKET_NAME = config.awsS3Bucket;
// export async function createPresignedPost(urlsArray: IcreatePresignedPost[]) {
//   console.log("URLS ARRAY", urlsArray);

//   const signedUrlsWithFile = await Promise.all(
//     urlsArray.map(async(obj) => {
//       const command = new PutObjectCommand({
//         Bucket: BUCKET_NAME,
//         Key: `public/${obj.fileName}`,
//         ContentType: obj.fileType,
//       });
//       console.log("AWS REGION--------------->",config.awsRegion)
//       const fileLink = `https://${BUCKET_NAME}.s3.${config.awsRegion}.amazonaws.com/public/${obj.fileName}`;
//       const signedUrl = await getSignedUrl(s3, command, {
//         expiresIn: 5 * 60, // 5 min - default is 15 minutes
//       });

//       return { fileLink, signedUrl };
//     }),
//   );
//   return signedUrlsWithFile;
// }
