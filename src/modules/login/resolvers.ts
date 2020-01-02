import {ResolverMap} from '../../types/graphql-utils'
import { User } from '../../entity/User'
import { invalidLogin, confirmEmailMessage } from './messages'
import bcrypt from 'bcryptjs'
import {signJwt, loginResponse, secondResponse} from '../../utils/basicUtils'


export const resolvers: ResolverMap = {
    Query: {
        login: async (_, {email, password}, {redis}) => {
            const user = await User.findOne({where: { email }});
            if(!user){
                return {
                    __typename: 'LoginError',
                    ...secondResponse('Error', invalidLogin)
                }
            }
            const valid = await bcrypt.compare(password, user.password);
            if(!valid){
                return {
                    __typename: 'LoginError',
                    ...secondResponse('Error', invalidLogin)
                }
            }

            if(!user.confirmed){
                return {
                    __typename: 'LoginError',
                    ...secondResponse('Error', confirmEmailMessage)
                }
            }

            const token = signJwt({id: user.id, email: user.email});

            let now  = Date.now();
            now += 1000 * 60 * 60 * 24



            await redis.zadd(`${user.id}-tokens`, `${now}`, token)


            const expiredTokens = await redis.zrangebyscore(`${user.id}-tokens`, `-inf`, Date.now());

            // Remove expired tokens on user login
            expiredTokens.length > 1 && expiredTokens.forEach( async token => {
                await redis.zrem(`${user.id}-tokens`, token)
            });



            // await redis.set(id, userId, 'ex', 60 * 60 * 24)
            return {__typename: 'LoginSuccess',
            ...loginResponse({status: 'Success', token})};
        }
    }
}