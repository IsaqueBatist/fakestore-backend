import * as jwt from 'jsonwebtoken';



interface IJwtData {
    uid: number,
    role: string
}


const sign = (data: IJwtData): string => {
    if(!process.env.JWT_SECRET) return 'JWT_SECRET_NOT_FOUND'
    
    return jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
}

const verify = (token: string): IJwtData | 'JWT_SECRET_NOT_FOUND' | 'INVALID_TOKEN'  => {
    if(!process.env.JWT_SECRET) return 'JWT_SECRET_NOT_FOUND'
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (typeof decoded === 'string') return 'INVALID_TOKEN'
        return decoded as IJwtData
    } catch (error) {
        console.error(error)
        return 'INVALID_TOKEN'
    }
}


export const JWTService = {
    sign,
    verify
}