import 'reflect-metadata'
import { METADATA_KEY } from "inversify-express-utils"
import { authorize } from "../middlewares/role.middleware.js"

export const role = (allowedRoles:string[]) =>{
    return (target:any,key?:string,descriptor?:PropertyDescriptor)=>{

        // controller level decorator 
         if (key === undefined) {
      const controllerMetadata = Reflect.getMetadata(
        METADATA_KEY.controller
        , target
      );
      if (controllerMetadata) {
        controllerMetadata.middleware = [
          ...(controllerMetadata.middleware || []),
          authorize(allowedRoles)
        ];
        Reflect.defineMetadata(
          METADATA_KEY.controller,
          controllerMetadata,
          target
        );
      }
      return;
    }

    // method level decorator 
         const methodMetadata = Reflect.getMetadata(
      METADATA_KEY.controllerMethod,
      target[key]
    ) || [];

    methodMetadata.middleware = [
      ...(methodMetadata.middleware || []),
      authorize(allowedRoles)
    ];

    Reflect.defineMetadata(
      METADATA_KEY.controllerMethod,
      methodMetadata,
      target[key]
    );
  };
}
