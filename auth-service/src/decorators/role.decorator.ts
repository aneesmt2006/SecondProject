import 'reflect-metadata'
import type { RequestHandler } from "express"
import { METADATA_KEY } from "inversify-express-utils"
import { authorize } from "../middlewares/role.middleware.js"

interface ControllerMetadata {
    path: string;
    target: NewableFunction;
    middleware: RequestHandler[];
    key?: string;
}

interface ControllerMethodMetadata {
    key: string;
    method: string;
    path: string;
    target: NewableFunction;
    middleware: RequestHandler[];
}

export const role = (allowedRoles: string[]) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (target: NewableFunction | object, key?: string, descriptor?: PropertyDescriptor): void => {

        if (key === undefined) {
            // ─── Controller-level decorator ───────────────────────────────────
            const controllerMetadata = Reflect.getMetadata(
                METADATA_KEY.controller,
                target
            ) as ControllerMetadata | undefined;

            if (controllerMetadata) {
                controllerMetadata.middleware = [
                    authorize(allowedRoles),
                    ...(controllerMetadata.middleware ?? []),
                ];
                Reflect.defineMetadata(
                    METADATA_KEY.controller,
                    controllerMetadata,
                    target
                );
            }
            return;
        }

        // ─── Method-level decorator ────────────────────────────────────────
        const metadataList: ControllerMethodMetadata[] =
            (Reflect.getOwnMetadata(
                METADATA_KEY.controllerMethod,
                (target as object).constructor
            ) as ControllerMethodMetadata[] | undefined) ?? [];

        const routeEntry = metadataList.find((m) => m.key === key);
        if (routeEntry) {
            routeEntry.middleware.unshift(authorize(allowedRoles));
        }
    };
}