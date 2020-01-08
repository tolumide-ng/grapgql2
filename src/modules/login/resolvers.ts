import {ResolverMap} from '../../types/graphql-utils'
import User from '../../database/models/User'
import { invalidLogin, confirmEmailMessage } from './messages'
import bcrypt from 'bcryptjs'
import {signJwt, loginResponse, secondResponse} from '../../utils/basicUtils'
import Baserepository from '../../Baserepository/base.repository'


export const resolvers: ResolverMap = {
    Query: {
        login: async (_, {email, password}, {redis}) => {
            const user = await Baserepository.findBy(User, ['id', 'password', 'email', 'confirmed'], ['email', email])
            if(!user[0].id){
                return {
                    __typename: 'LoginError',
                    ...secondResponse('Error', invalidLogin)
                }
            }

            const valid = await bcrypt.compare(password, user[0].password);
            if(!valid){
                return {
                    __typename: 'LoginError',
                    ...secondResponse('Error', invalidLogin)
                }
            }

            if(!user[0].confirmed){
                return {
                    __typename: 'LoginError',
                    ...secondResponse('Error', confirmEmailMessage)
                }
            }

            const token = signJwt({id: user[0].id, email: user[0].email});

            let now  = Date.now();
            now += 1000 * 60 * 60 * 24



            await redis.zadd(`${user[0].id}-tokens`, `${now}`, token)


            const expiredTokens = await redis.zrangebyscore(`${user[0].id}-tokens`, `-inf`, Date.now());

            // Remove expired tokens on user login
            expiredTokens.length >= 1 && expiredTokens.forEach( async token => {
                await redis.zrem(`${user[0].id}-tokens`, token)
            });



            // await redis.set(id, userId, 'ex', 60 * 60 * 24)
            return {__typename: 'LoginSuccess',
            ...loginResponse({status: 'Success', token})};
        }
    }
}