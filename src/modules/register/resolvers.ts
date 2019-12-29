import {ResolverMap} from '../../types/graphql-utils'
import * as bcrypt from 'bcryptjs';
import {User,} from '../../entity/User';
import * as yup from 'yup';
import { formatYupError } from '../../utils/formatYupError';

const schema = yup.object().shape({
    email: yup.string().min(5).max(255).email(),
    password: yup.string().min(7).max(255)
})


export const resolvers: ResolverMap = {
    Query: {
        bye: () => 'Bye'
    },

    Mutation: {
        register: async (_:any, args): Promise<any> => {
            try{
                await schema.validate(args, {abortEarly: false})
            }catch(err){
                return formatYupError(err)
            }
            const {email, password} = args
            const emailAlreadyExist = await User.findOne({where: {email}, select: ['id']});
            if(emailAlreadyExist){
                return [
                    {
                        path: 'email',
                        message: 'already taken'
                    }
                ]
            }
            const salt = bcrypt.genSaltSync(10);
            const hashPwd = bcrypt.hashSync(password, salt);
            const user =  User.create({email, password: hashPwd});
            await user.save();
            return null;
        }
    }
}