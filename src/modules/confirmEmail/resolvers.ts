import {ResolverMap} from '../../types/graphql-utils'
import User from '../../database/models/User'
// import Redis from 'ioRedis'
import {secondResponse} from '../../utils/basicUtils'
import Baserepository from '../../Baserepository/base.repository';

// const redis = new Redis()

export const resolvers: ResolverMap = {

    Query: {
        confirmEmail: async (_, args, {redis}): Promise<{}> => {
            const {id} = args;
           const userId: any = await redis.get(id);
            if(userId){
                await Baserepository.updateById(User, userId, {confirmed: true})
                redis.del(id);
                return secondResponse('Success', 'Email Verified')
            } else {
                return secondResponse('Error', 'Invalid Client Id')
            }
        }
    }
}