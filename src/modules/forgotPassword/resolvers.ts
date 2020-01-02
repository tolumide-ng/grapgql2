import { ResolverMap } from '../../types/graphql-utils'
import { User } from '../../entity/User'
import { secondResponse } from '../../utils/basicUtils';
import { forgotPasswordEmailLink } from '../../utils/createEmail';
import { generateMail } from '../../utils/nodeMailer';



export const resolvers: ResolverMap = {
    Query: {
        forgotPassword: async (_, { email }, {redis, url}) => {
            // Does the email exist ?
            const emailExist = await User.findOne({where: { email }, select: ['id', 'email']});
            if(emailExist){
                const link = await forgotPasswordEmailLink(url, emailExist.id, redis);
                const htmlBody = `<div>Hello, Please note that the password reset link is only valid for 2 hours. You can click on the link below to reset your password: <div> ${link} </div> </div>`

                await generateMail({email, htmlBody, emailSender: 'forgotPassword@crowdy.com'})

                return {
                    ...secondResponse('Success', 'Please check your email to follow the next steps')
                }
            }
            return {...secondResponse('Error', 'Please check your email to follow the next steps')};
        }
    }
}