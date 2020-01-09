import { ResolverMap } from '../../types/graphql-utils'
import User from '../../database/models/User'
import { secondResponse } from '../../utils/basicUtils';
import { forgotPasswordEmailLink } from '../../utils/createEmail';
import { generateMail } from '../../utils/nodeMailer';
import Baserepository from '../../Baserepository/base.repository';



export const resolvers: ResolverMap = {
    Query: {
        forgotPassword: async (_, { email }, {redis, url}) => {
            // Does the email exist ?
            // const emailExist = await User.findOne({where: { email }, select: ['id', 'email']});
            const emailExist = await Baserepository.findBy(User, ['email', 'id'], ['email', email])
            if(emailExist[0]){

                console.log('email exists', emailExist)
                const link = await forgotPasswordEmailLink(url, emailExist[0].id, redis);
                const htmlBody = `<div>Hello, Please note that the password reset link is only valid for 20 minutes. You can click on the link below to reset your password: <div> ${link} </div> </div>`

                await generateMail({email, htmlBody, emailSender: 'forgotPassword@crowdy.com'})

                return secondResponse('Success', 'Please check your email to follow the next steps')
            }
            return secondResponse('Error', 'Please check your email to follow the next steps');
        }
    }
}