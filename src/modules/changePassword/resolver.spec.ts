import * as fs from 'fs'
import {makeExecutableSchema} from 'graphql-tools'
import {graphql} from 'graphql'
import User from '../../database/models/User'
import * as faker from 'faker'
import * as path from 'path'
import { resolvers } from './resolvers'

import { Redis, genUser } from '../../../tests/test.utils'
import databaseConnection from '../..'
import Baserepository from '../../Baserepository/base.repository'

const redis = new Redis()

const genToken: string = faker.random.uuid()
const PASSWORD = 'newPassword2020#'

const requestChangePassword = (passwordResetLink: string, password: string) => `
mutation {
    changePassword(passwordResetLink: "${passwordResetLink}", password: "${password}"){
        status
        message
    }
}
`


describe('Test Change Password', () => {
    beforeAll(async () => {
        await databaseConnection.migrate.latest()
        await databaseConnection('users').truncate()
    })

    beforeEach(async () => {
        await databaseConnection('users').truncate()
    })

    afterAll(async () => {
        await databaseConnection('users').truncate()
        await databaseConnection.destroy()

    })



    test('should successfully change a password', async () => {
        const { email, password } = genUser()

        // const user = User.create({email, password, confirmed: true})
        // await user.save()
        const user = await Baserepository.create(User, {email, password, confirmed: true})
        redis.set(`${user.id}`)

        // const previousUser = await User.find({where: {email}})
        const previousUser = await Baserepository.findBy(User, ['id'], ['email', email])

        expect(previousUser.length).toEqual(1);

        const response: any = await graphql({schema, source: requestChangePassword(`${user.id}`, PASSWORD), contextValue: {redis}});

        expect(response.data.changePassword.status).toEqual('Success');
        expect(response.data.changePassword.message).toEqual('Password reset Successfull');
    })

    const typeDefs  = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8')
    const schema = makeExecutableSchema({typeDefs, resolvers})


    test('should fail changePassword if the resetLink is invalid', async() => {

        const response: any = await graphql({schema, source: requestChangePassword(`${genToken}`, PASSWORD), contextValue: {redis}});
        expect(response.data.changePassword.status).toEqual('Error');
        expect(response.data.changePassword.message).toEqual('Password reset Failed');
    } )



})