import * as fs from 'fs'
import {makeExecutableSchema} from 'graphql-tools'
import {graphql} from 'graphql'
import User from '../../database/models/User'
import * as faker from 'faker'
import * as path from 'path'
import { resolvers } from './resolvers'
// import bcrypt from 'bcryptjs'
import {invalidLogin, confirmEmailMessage, errorStatus, successStatus} from './messages'
import { Redis } from '../../../tests/test.utils'
import databaseConnection from '../..'
import Baserepository from '../../Baserepository/base.repository'


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
        await databaseConnection.migrate.latest()
        await databaseConnection('users').truncate()

    });

    beforeEach(async() => {
        await databaseConnection('users').truncate()
    })


    afterAll(async() => {
        await databaseConnection('users').truncate()
        await databaseConnection.destroy()

    })


    const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8');
    const schema = makeExecutableSchema({typeDefs, resolvers})


    test('should successfully login an existing and confirmed user', async () => {
        const {email, password} = genUser()

        await Baserepository.create(User, {email, password})

        const previousUser = await Baserepository.findBy(User, ['id'], ['email', email])
        await Baserepository.updateById(User, previousUser[0].id, {confirmed: true})

        expect(previousUser.length).toEqual(1)

        const response: any = await graphql({schema, source: loginMutation(email, password), contextValue: {redis}});

        expect(response.data.login.status).toEqual(successStatus);
        expect(response.data.login.token).toBeTruthy()
    })

    test('should fail login if the password is incorrect', async () => {
        const {email, password} = genUser();

        await Baserepository.create(User, {email, password})

        const previousUser = await Baserepository.findBy(User, ['id'], ['email', email])

        expect(previousUser.length).toEqual(1)


        const response: any = await graphql({schema, source: loginMutation(email, 'fakePassword'), contextValue: {redis}});


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


        // const user = User.create({email, password})
        // await user.save()
        await Baserepository.create(User, {email, password})

        // const previousUser = await User.find({where: { email}})
        const previousUser = await Baserepository.findBy(User, ['id', 'email'], ['email', email])
        console.log('the previous userUSERRRRR>>>>>>>>>', previousUser)
        console.log('TYPE OF USER>>>>>>>', typeof(previousUser))
        expect(Object.keys(previousUser).length).toEqual(1)




        const response: any = await graphql({schema, source: loginMutation(email, password), contextValue: {redis}});


        expect(response.data.login.errorStatus).toEqual(errorStatus)
        expect(response.data.login.message).toEqual(confirmEmailMessage)
    })
})