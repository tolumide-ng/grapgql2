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
    // Forgot password expires in 2 hrs
    await redis.set(`${id}-forgot`, userId, 'ex', 1000 * 60 * 60 * 2);
    return `${url}/confirm/${id}`
}