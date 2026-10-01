import logger from "../utils/logger.js";
import type { NextFunction, Request, Response } from "express";
import { controller, httpPost, type interfaces } from "inversify-express-utils";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { upload } from "../middlewares/multer.js";
import { uploadToCloudinary } from "../config/cloudinary.config.js";
import { ADMIN_RESPONSE_MESSAGES } from "../constants/response-messages.constants.js";
import { role } from "../decorators/role.decorator.js";

@role(["admin", "doctor", "user"])
@controller("/super-admin/upload")
export class AdminUploadController implements interfaces.Controller {
  @httpPost("/images", upload.array("images", 10))
  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      let urls: string[] = [];
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        logger.info("No files received");
        commonResponse.failure(
          res,
          ADMIN_RESPONSE_MESSAGES.NO_FILES,
          HTTP_STATUS.BAD_REQUEST,
        );
        return;
      }

      const getUrls = await uploadToCloudinary(files);
      logger.info("What happen ==>", getUrls);
      urls = getUrls;

      logger.info("All URLs:", urls);
      commonResponse.success(
        res,
        ADMIN_RESPONSE_MESSAGES.IMAGE_UPLOADED,
        urls,
        HTTP_STATUS.OK,
      );
    } catch (error) {
      logger.error("Full upload error:", error);
      next(error);
    }
  }
}
