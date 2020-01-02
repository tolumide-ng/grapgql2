import { ResolverMap } from "../../types/graphql-utils";
import { secondResponse, hashPwd } from "../../utils/basicUtils";
import {User} from '../../entity/User'

export const resolvers: ResolverMap = {

    Mutation: {
        changePassword: async (_, args, {redis}) => {
            // TODO - Validate the password to ensure it contains all the minimum requirements
            const {passwordResetLink, password} = args;

            const userId: any = await redis.get(`${passwordResetLink}-forgot`);
            if(!userId){
                return secondResponse('Error', 'Password reset Failed')
            }

            const hashedPassword = await hashPwd(password)
            await User.update({id: userId}, {password: hashedPassword});
            // clear all tokens
            await redis.del(`${userId}-tokens`);
            // delete password reset link
            await redis.del(`${passwordResetLink}-forgot`);
            return secondResponse('Success', 'Password reset Successfull')
        }
    }
}