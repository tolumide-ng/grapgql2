import {ResolverMap} from '../../types/graphql-utils'
import * as yup from 'yup';
import { formatYupError } from '../../utils/formatYupError';
import { createConfirmEmailLink } from '../../utils/createEmail';
import {generateMail} from '../../utils/nodeMailer'
import {secondResponse} from '../../utils/basicUtils'
import Baserepository from '../../Baserepository/base.repository';
import User from '../../database/models/User'
// import Baserepository from '../../Baserepository'

const schema = yup.object().shape({
    email: yup.string().min(5).max(255).email(),
    password: yup.string().min(7).max(255)
})


export const resolvers: ResolverMap = {
    Mutation: {
        register: async (_:any, args, context): Promise<any> => {
            try{
                await schema.validate(args, {abortEarly: false})
            }catch(err){
                return formatYupError(err)
            }
            const {email, password} = args
            // const emailAlreadyExist = await User.findOne({where: {email}, select: ['id']});
            const emailAlreadyExist = await Baserepository.findBy(User, ['id'], ['email', `${email}`])

            if(emailAlreadyExist.length){
                return {
                    __typename: "RegisterError",
                        path: 'email',
                        message: 'already taken'
                    }
            }

        const user = await Baserepository.create(User, {email, password})
            const {redis, url} = context;
            const link = await createConfirmEmailLink(url, user.id, redis);
            // I will be providing a link to the frontend with the id attached as a req.params for the frontend to send as argument in a real-life scenario
            const htmlBody = `<p>Thank you for chosing to do business with us, Here is your confirmation email link ${link}</p>`
            await generateMail({email, htmlBody, emailSender: '"Brown 👻" <donotreplyBrown@crowdy.com>'});
            return {
                __typename: "RegisterSuccess",
                ...secondResponse('success', 'Please check your email for your confirmation link')
            }
        }
    }
}