export interface IProxyConfig {
    target : string,
    pathRewrite?:{ [key:string] :string }
    serviceName:string
}

export interface IErrorResponse{
    message:string,
    number:number,
}