import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()



export const response = (message: string) => ({
    path: 'login',
    message
})


export const hashPwd = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hashPwd = bcrypt.hashSync(password, salt);
    return hashPwd;
}

export const secondResponse = (status: string, message: string) => ({
    status,
    message
})

export const loginResponse = ({status, token}: {status: string, token: string}) => ({
    status,
    token
})


export const signJwt = ({id, email}: {id: string, email: string}) => {
    return jwt.sign({
        data: {id, email}
      }, `${process.env.SECRET}` , { expiresIn: '24h' });
}


export const verifyToken = (token: string): any => {
    let result: any;
    jwt.verify(token, `${process.env.SECRET}`, (error, decode) => {
        if(!error){
            result = decode;
        } else {
            result = null;
        };
    })
    return result;
};

export const zodiacs = [ 'Aries', 'Leo', 'Cancer', 'Pisces', 'Scorpio', 'Taurus', 'Sagittarius', 'Gemini', 'Virgo', 'Libra', 'Capricon', 'Aquarius']

export const relationship = ['single', 'married', 'divorced']