import bcrypt from 'bcryptjs'

export const response = (message: string) => [{
    path: 'login',
    message
}]


export const hashPwd = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hashPwd = bcrypt.hashSync(password, salt);
    return hashPwd;
}

export const secondResponse = (status: string, message: string) => ({
    status,
    message
})