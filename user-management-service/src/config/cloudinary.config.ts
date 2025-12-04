import { config } from "./env.config.js";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
cloudinary.config({
  cloud_name: config.cloudinary_name as string,
  api_key: config.cloudinary_api_key as string,
  api_secret: config.cloudinary_secret_key as string,
});

export const uploadToCloudinary = async (files: Express.Multer.File[]):Promise<string[]> => {
  const urls: string[] = [];
  for (let file of files) {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "fetus-development",
          transformation: [{ width: 800, height: 600, crop: "limit" }],
        },
        (
          error: UploadApiErrorResponse | undefined,
          uploadResult: UploadApiResponse | undefined
        ) => {
          if (error) {
            console.log("Cloudinary error for", file.originalname, error);
            reject(error);
          } else if (!uploadResult) {
            reject(new Error("Images not Uploaded .something happen wrong"));
          } else {
            console.log("Uploaded :", uploadResult.public_id);
            resolve(uploadResult);
          }
        }
      );

      stream.end(file.buffer);
    });

    urls.push(result.secure_url);
  }

  return urls
};

export default cloudinary;
export type { UploadApiResponse, UploadApiErrorResponse };
