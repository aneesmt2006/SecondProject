import { inject } from "inversify";
import { controller, httpPost } from "inversify-express-utils";
import type { interfaces } from "inversify-express-utils";
import { TYPES } from "../types/index.js";
import type { NextFunction, Request, Response } from "express";
import type { ITokenService } from "../services/interfaces/ITokenService.js";
import { AUTH_RESPONSE_MESSAGES } from "../constants/response-messages.constant.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { commonResponse } from "../utils/common.reponse.utils.js";

@controller("/auth/common")
export class TokenController implements interfaces.Controller {
  private _tokenService: ITokenService;

  constructor(@inject(TYPES.TokenService) service: ITokenService) {
    this._tokenService = service;
  }

  @httpPost("/refresh")
  public async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        commonResponse.failure(
          res,
          AUTH_RESPONSE_MESSAGES.REFRESH_TOKEN_MISSING,
          400,
        );
        return;
      }

      const {
        accessToken,
        message,
      } = await this._tokenService.refresh(refreshToken);

      

      commonResponse.success(
        res,
        message,
         {accessToken} ,
        HTTP_STATUS.OK,
      );
    } catch (error) {
      next(error);
    }
  }
}
