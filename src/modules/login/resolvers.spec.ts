import * as fs from 'fs'
import {createTypeormConn} from '../../utils/createTypeormConn'
import {makeExecutableSchema} from 'graphql-tools'
import {graphql} from 'graphql'
import {User} from '../../entity/User'
import * as faker from 'faker'
import * as path from 'path'
import { resolvers } from './resolvers'
// import bcrypt from 'bcryptjs'
import {invalidLogin, confirmEmailMessage, errorStatus, successStatus} from './messages'
import { Redis } from '../../../tests/test.utils'

let connection: any;
const redis = new Redis()

const genUser = () => ({
    email: faker.internet.email(),
    password: faker.internet.password()
})


const loginMutation = (email: string, password: string) => `
query {
    login(email: "${email}", password: "${password}"){
        ...on LoginError{
            errorStatus: status
            message
        }
        ...on LoginSuccess{
            status
            token
        }
    }
}
`


describe('Test User Login', () => {
    beforeAll(async () => {
        connection = await createTypeormConn();
        await connection.synchronize()

    });

    beforeEach(async() => {
        const all = await User.find();
        await User.remove(all)
    })


    afterAll(async() => {
        await connection.close();
    })


    const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8');
    const schema = makeExecutableSchema({typeDefs, resolvers})


    test('should successfully login an existing user', async () => {
        const {email, password} = genUser()


        const user = User.create({email, password, confirmed: true})
        await user.save()

        const previousUser = await User.find({where: { email}})
        expect(previousUser.length).toEqual(1)


        const response: any = await graphql({schema, source: loginMutation(email, password), contextValue: {redis}});

        expect(response.data.login.status).toEqual(successStatus);
        expect(response.data.login.token).toBeTruthy()
    })

    test.skip('should fail login if the password is incorrect', async () => {
        const {email, password} = genUser();

        const user = User.create({email, password, confirmed: true})
        await user.save()

        const previousUser = await User.find({where: { email}})
        expect(previousUser.length).toEqual(1)


        const response: any = await graphql({schema, source: loginMutation(email, 'fakePassword'), contextValue: {redis}});
        console.log('((((((response))))', response)
        expect(response.data.login.errorStatus).toEqual(errorStatus)
        expect(response.data.login.message).toEqual(invalidLogin)
    })

    test('should fail login if email does not exist', async () => {
        const {email} = genUser();

        const response: any = await graphql({schema, source: loginMutation(email, 'fakePassword'), contextValue: {redis}});
        expect(response.data.login.errorStatus).toEqual(errorStatus)
        expect(response.data.login.message).toEqual(invalidLogin)
    })


    test('should fail login if account has not been activated', async () => {
        const {email, password} = genUser()


        const user = User.create({email, password})
        await user.save()

        const previousUser = await User.find({where: { email}})
        expect(previousUser.length).toEqual(1)


        const response: any = await graphql({schema, source: loginMutation(email, password), contextValue: {redis}});


        expect(response.data.login.errorStatus).toEqual(errorStatus)
        expect(response.data.login.message).toEqual(confirmEmailMessage)
    })
})