import {ResolverMap} from '../../types/graphql-utils'
import { User } from '../../entity/User'
import { invalidLogin, confirmEmailMessage } from './messages'
import bcrypt from 'bcryptjs'
import {response} from '../../utils/basicUtils'


export const resolvers: ResolverMap = {
    Mutation: {
        login: async (_, {email, password}) => {
            const user = await User.findOne({where: { email }});
            if(!user){
                return response(invalidLogin)
            }
            const valid = await bcrypt.compare(password, user.password);
            if(!valid){
                return response(invalidLogin)
            }

            if(!user.confirmed){
                return response(confirmEmailMessage)
            }

            // session.userId = user.id

            return null;
        }
    }
}