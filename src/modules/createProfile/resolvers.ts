import { ResolverMap } from "../../types/graphql-utils";
import { Profile } from "../../entity/Profile";
import { secondResponse } from "../../utils/basicUtils";

// npm run typeorm migration:create -migrationName
// typeorm entity:create -entityName
// npm run typeorm -- migration:generate -n userDetail

const zodiacs = [ 'Aries', 'Leo', 'Cancer', 'Pisces', 'Scorpio', 'Taurus', 'Sagittarius', 'Gemini', 'Virgo', 'Libra', 'Capricon', 'Aquarius']

// const schema = yup.object().shape({
//     name: yup.string().min(5).max(255).email()
// })

export const resolvers:ResolverMap = {
    Mutation: {
        createProfile: async(_: any, args): Promise<any> => {
            const {zodiacSign, countryCode, phone, location, interests, sexualOrientation, relationshipStatus, age} = args;

            if (!zodiacs.includes(zodiacSign)){
                return {
                    __typename: 'ProfileError',
                    message: 'Please use a valid zodiac sign'
                }
            }
            // Please ensure the phone number of the individual is confirmed with Twilio
            // const userProfile = User.create({
            //     zodiacSign, email, phone, location, interests, sexualOrientation, relationshipStatus, age
            // })
            const profile = Profile.create({
                zodiacSign, countryCode, phone, location, interests, sexualOrientation, relationshipStatus, age
            })

            await profile.save()

            return {
                __typename: 'ProfileSuccess',
                ...secondResponse('success', 'profile updated successfully')}

        }
    }
}


