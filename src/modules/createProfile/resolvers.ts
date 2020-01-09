import { ResolverMap } from "../../types/graphql-utils";
import Profile from '../../database/models/Profile'
import { secondResponse, zodiacs, relationship } from "../../utils/basicUtils";
import Baserepository from "../../Baserepository/base.repository";
import { zodiacError, relationshipError } from "./messages";

// npm run typeorm migration:create -migrationName
// typeorm entity:create -entityName
// npm run typeorm -- migration:generate -n userDetail



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
                    message: zodiacError
                }
            }

            if(!relationship.includes(relationshipStatus)){
                return {
                    __typename: 'ProfileError',
                    message: relationshipError
                }
            }
            // Please ensure the phone number of the individual is confirmed with Twilio
            // const userProfile = User.create({
            //     zodiacSign, email, phone, location, interests, sexualOrientation, relationshipStatus, age
            // })
            // const profile = Profile.create({
            //     zodiacSign, countryCode, phone, location, interests, sexualOrientation, relationshipStatus, age
            // })

            // await profile.save()
            await Baserepository.create(Profile, {zodiacSign, countryCode, phone, location, interests, sexualOrientation, relationshipStatus, age})

            return {
                __typename: 'ProfileSuccess',
                ...secondResponse('success', 'profile created successfully')}

        }
    }
}


