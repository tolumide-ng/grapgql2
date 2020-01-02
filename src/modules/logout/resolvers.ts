import { ResolverMap } from "../../types/graphql-utils";
import { verifyToken, secondResponse } from "../../utils/basicUtils";

export const resolvers: ResolverMap = {
    Query: {
        logOut: async (_, args, {redis}) => {
            const {token} = args;
            const validateToken = await verifyToken(token)
            if(validateToken){
                const allTokens = await redis.zrangebyscore(`${validateToken.data.id}-tokens`, `-inf`, `+inf`);
                if (allTokens.includes(token)){
                    await redis.zrem(`${validateToken.data.id}-tokens`, token);
                    return secondResponse('Success', 'Logout Successfull')
                }
            }
            return secondResponse('Error', 'Logout Failed')
        }
    }
}