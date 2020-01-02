import {v4} from 'uuid'
import {Redis} from 'ioredis'

export const createConfirmEmailLink = async (url: string, userId: string, redis: Redis) => {
    const id = v4();
    // Expires in 24hrs
    await redis.set(id, userId, 'ex',  1000 * 60 * 60 * 24);
    return `${url}/confirm/${id}`
}


export const forgotPasswordEmailLink = async (url: string, userId: string, redis: Redis) => {
    const id = v4();
    // Forgot password expires in 20 minutes
    await redis.set(`${id}-forgot`, userId, 'ex', 1000 * 60 * 20 * 1);
    return `${url}/confirm/${id}`
}