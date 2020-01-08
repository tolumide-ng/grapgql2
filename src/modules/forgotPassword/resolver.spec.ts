import * as fs from 'fs'
import {makeExecutableSchema} from 'graphql-tools'
import {Redis} from '../../../tests/test.utils'
import {graphql} from 'graphql'
import * as faker from 'faker'
import * as path from 'path'

// the actual resolvers
import { resolvers } from './resolvers'
import { createTypeormConn } from '../../utils/createTypeormConn'
import { User } from '../../entity/User'
import {successStatus, successMessage, errorStatus} from './messages'

let connection: any;
const email: () => string = () => faker.internet.email()
const password: () => string = () => faker.internet.password()
const redis = new Redis()
const LOCALHOST: string = 'https://localhost:4000'




const query = (email: string) => `
query {
    forgotPassword(email: "${email}"){
        status
        message
    }
}
`


describe('Test User Forgot Password', () => {
    beforeAll(async () => {
        connection = await createTypeormConn();

    });

    beforeEach(async () => {
        const all = await User.find();
        await User.remove(all)
        await connection.synchronize()
        await jest.clearAllMocks()
    })

    afterAll(async () => {
        await connection.close();
    })

    const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8');
    const schema = makeExecutableSchema({typeDefs, resolvers});


    test('should successfully request forgot password', async () => {
        const userEmail: string = email()
        const user = User.create({email: userEmail, password: password()})
        await user.save()
        const theUser = await User.find({where: {email: userEmail}});
        expect(theUser.length).toEqual(1);

        const response: any = await graphql({schema, source: query(userEmail), contextValue: {redis, url: LOCALHOST}})

        expect(response.data.forgotPassword.status).toEqual(successStatus)
        expect(response.data.forgotPassword.message).toEqual(successMessage)
    })


    test('should return error if the email does not exist on forogt password request', async () => {

        const response: any = await graphql({schema, source: query('test@test.com'), contextValue: {redis, url: LOCALHOST}})


        expect(response.data.forgotPassword.status).not.toEqual(successStatus)
        expect(response.data.forgotPassword.message).toEqual(successMessage)
        expect(response.data.forgotPassword.status).toEqual(errorStatus)

    })
})