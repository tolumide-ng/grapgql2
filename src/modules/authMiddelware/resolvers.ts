import {verifyToken} from '../../utils/basicUtils'

// When the token is issued to the user, ensure that the token is also saved on redis with an expiry. When a user chooses to login to the application, we should verify that the token is indeed present in redis first before we verify the authenticity of the token.

// Advantages
// 1. When a user uses the forgot password feature of the applciation, we clear all the token on redis making every other devices the user might have used to log in before now unable to access the server until they update there password
// 2. In the case

export const authMiddleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
    // decode the token to get the userId
    const validateToken = verifyToken(args.token);
    // const getTokens = await context.redis.get()

    if(!validateToken){
        return {
            status: 'Error',
            error: 'Invalid User Token',
        }
    } else {
        const { id } = validateToken;
        context.redis.get(`${id}-tokens`);
        // get the score by then token to remove the invalid tokens

        // get all expired tokens in the redis list by there score and delete them;
        const expiredTokens = context.redis.zrangebyscore(`${id}-tokens`, `-inf`, new Date());
        console.log('this are the expired tokens, ', expiredTokens)
        // zrangebyscore id-43 -inf 3
        context.redis.zadd()
        const result = await resolve(root, args, context, info);
        return result;
    }
 }