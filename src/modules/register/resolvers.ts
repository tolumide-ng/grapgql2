import {ResolverMap} from '../../types/graphql-utils'
import {User,} from '../../entity/User';
import * as yup from 'yup';
import { formatYupError } from '../../utils/formatYupError';
import { createConfirmEmailLink } from '../../utils/createConfirmEmailLink';
import {generateMail} from '../../utils/nodeMailer'
import {secondResponse} from '../../utils/basicUtils'

const schema = yup.object().shape({
    email: yup.string().min(5).max(255).email(),
    password: yup.string().min(7).max(255)
})


export const resolvers: ResolverMap = {
    // Query: {
    //     bye: () => 'Bye'
    // },

    Mutation: {
        register: async (_:any, args, context): Promise<any> => {
            try{
                await schema.validate(args, {abortEarly: false})
            }catch(err){
                return formatYupError(err)
            }
            const {email, password} = args
            const emailAlreadyExist = await User.findOne({where: {email}, select: ['id']});
            if(emailAlreadyExist){
                return {
                    __typename: "RegisterError",
                        path: 'email',
                        message: 'already taken'
                    }
            }
        //    const pwd = hashPwd(password)
            const user =  User.create({email, password});
            await user.save();
            const {redis, url} = context;
            const link = await createConfirmEmailLink(url, user.id, redis);
            // I will be providing a link to the frontend with the id attached as a req.params for the frontend to send as argument in a real-life scenario
            const htmlBody = `<p>Thank you for chosing to do business with us, Here is your confirmation email link ${link}</p>`
            await generateMail({email, htmlBody});
            return {
                __typename: "RegisterSuccess",
                ...secondResponse('success', 'Please check your email for your confirmation link')
            }
        }
    }
}