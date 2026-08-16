import crypto from 'crypto'

export const create256Hash=(buffer:Buffer)=>{
    return crypto.createHash('sha256').update(buffer).digest("hex")
}