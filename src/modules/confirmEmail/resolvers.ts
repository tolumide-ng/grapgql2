import {ResolverMap} from '../../types/graphql-utils'
import {User} from '../../entity/User'
import Redis from 'ioRedis'
import {secondResponse} from '../../utils/basicUtils'

const redis = new Redis()

export const resolvers: ResolverMap = {
    Query: {
        confirmEmail: async (_, args): Promise<any> => {
            const {id} = args;
            const userId: any = await redis.get(id);
            if(userId){
                await User.update({id: userId}, {confirmed: true});
                redis.del(id);
                return secondResponse('success', 'Email Verified')
            } else {
                return secondResponse('fail', 'Invalid Client Id')
            }
        }
    }
}