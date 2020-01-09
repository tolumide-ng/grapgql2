import * as fs from 'fs'
import {makeExecutableSchema} from 'graphql-tools'
import {Redis, genUser} from '../../../tests/test.utils'
import {graphql} from 'graphql'
import * as path from 'path'

// the actual resolvers
import { resolvers } from './resolvers'
import User from '../../database/models/User'
import {successStatus, successMessage, errorStatus} from './messages'
import databaseConnection from '../..'
import Baserepository from '../../Baserepository/base.repository'



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
        await databaseConnection.migrate.latest()
        await databaseConnection('users').truncate()
    });

    beforeEach(async () => {
        await databaseConnection('users').truncate()
        await jest.clearAllMocks()
    })

    afterAll(async () => {
        await databaseConnection('users').truncate()
        await databaseConnection.destroy()

    })

    const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8');
    const schema = makeExecutableSchema({typeDefs, resolvers});


    test('should successfully request forgot password', async () => {
        const {email, password} = await genUser()
        // const userEmail: string = email()
        await Baserepository.create(User, {email, password})

        const theUser = await Baserepository.findBy(User, ['id'], ['email', email])

        expect(theUser.length).toEqual(1);

        const response: any = await graphql({schema, source: query(email), contextValue: {redis, url: LOCALHOST}})

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