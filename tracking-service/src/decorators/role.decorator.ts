import 'reflect-metadata'
import { METADATA_KEY } from "inversify-express-utils"
import { authorize } from '../middlewares/role.middleware.js';

export const role = (allowedRoles: string[]) => {
    return (target: any, key?: string, descriptor?: PropertyDescriptor) => {

        if (key === undefined) {
            // ─── Controller-level decorator ───────────────────────────────────
            const controllerMetadata = Reflect.getMetadata(
                METADATA_KEY.controller,
                target
            );
            if (controllerMetadata) {
                controllerMetadata.middleware = [
                    authorize(allowedRoles),
                    ...(controllerMetadata.middleware || []),
                ];
                Reflect.defineMetadata(
                    METADATA_KEY.controller,
                    controllerMetadata,
                    target
                );
            }
            return;
        }

        // ─── Method-level decorator ───────────────────────────────────────────
        //
        // WHY THIS APPROACH:
        // TypeScript applies method decorators bottom-up, so:
        //   @role(...)        ← runs SECOND
        //   @httpPost(...)    ← runs FIRST
        //
        // @httpPost reads getMiddlewareMetadata() at the moment IT runs,
        // which is BEFORE @role has written anything. So writing to
        // METADATA_KEY.middleware is already too late — @httpPost already
        // captured an empty list and pushed a frozen metadata object.
        //
        // The correct fix: after @httpPost has run, find the route entry it
        // created in METADATA_KEY.controllerMethod (by method key name) and
        // directly prepend our authorize middleware into its middleware array.
        // Since the array is a reference, the mutation is picked up when the
        // server registers routes.

        const metadataList: any[] =
            Reflect.getOwnMetadata(METADATA_KEY.controllerMethod, target.constructor) ?? [];

        const routeEntry = metadataList.find((m: any) => m.key === key);
        if (routeEntry) {
            // Prepend so authorization runs before any other route middleware
            routeEntry.middleware.unshift(authorize(allowedRoles));
        }
    };
}
