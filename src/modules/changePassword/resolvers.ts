import { ResolverMap } from "../../types/graphql-utils";
import { secondResponse } from "../../utils/basicUtils";
import User from '../../database/models/User'
import Baserepository from "../../Baserepository/base.repository";

export const resolvers: ResolverMap = {

    Mutation: {
        changePassword: async (_, {passwordResetLink, password}, {redis}) => {
            // TODO - Validate the password to ensure it contains all the minimum requirements
            // const {passwordResetLink, password} = args;

            const userId: any = await redis.get(`${passwordResetLink}-forgot`);
            if(!userId){
                return secondResponse('Error', 'Password reset Failed')
            }

            await Baserepository.updateById(User, userId, {password})
            // clear all tokens
            await redis.del(`${userId}-tokens`);
            // delete password reset link
            await redis.del(`${passwordResetLink}-forgot`);
            return secondResponse('Success', 'Password reset Successfull')
        }
    }
}