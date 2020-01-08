import * as fs from 'fs'
import {createTypeormConn} from '../../utils/createTypeormConn'
import {makeExecutableSchema} from 'graphql-tools'
import {graphql} from 'graphql'
import {User} from '../../entity/User'
import * as faker from 'faker'
import * as path from 'path'
import { resolvers } from './resolvers'

import { Redis } from '../../../tests/test.utils'

let connection: any;
const redis = new Redis()

const genUser = () => ({
    email: faker.internet.email(),
    password: faker.internet.password()
})
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
        connection = await createTypeormConn();
    })

    beforeEach(async () => {
        const all = await User.find();
        await connection.synchronize()
        await User.remove(all)
    })

    afterAll(async () => {
        await connection.close();
    })


    test('should successfully change a password', async () => {
        const { email, password } = genUser();

        const user = User.create({email, password, confirmed: true})
        await user.save()
        redis.set(`${user.id}`)

        const previousUser = await User.find({where: {email}})
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