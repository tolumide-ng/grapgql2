import * as fs from 'fs'
import {createTypeormConn} from '../../utils/createTypeormConn'
import {makeExecutableSchema} from 'graphql-tools'
import {graphql} from 'graphql'
import {User} from '../../entity/User'
import * as faker from 'faker'
import * as path from 'path'
import { resolvers } from './resolvers'
// import bcrypt from 'bcryptjs'
import {invalidLogin, confirmEmailMessage} from './messages'

let connection: any;

const genUser = () => ({
    email: faker.internet.email(),
    password: faker.internet.password()
})


const loginMutation = (email: string, password: string) => `
mutation {
    login(email: "${email}", password: "${password}"){
        path,
        message
    }
}
`


describe('Test User Login', () => {
    beforeAll(async () => {
        connection = await createTypeormConn();
    });

    beforeEach(async() => {
        await connection.synchronize(true)
    })

    afterAll(async() => {
        await connection.close()
    })


    const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8');
    const schema = makeExecutableSchema({typeDefs, resolvers})


    test('should successfully login an existing user', async () => {
        const {email, password} = genUser()


        // const salt = bcrypt.genSaltSync(10);
        // const hashPwd = bcrypt.hashSync(password, salt);

        const user = User.create({email, password, confirmed: true})
        await user.save()

        const previousUser = await User.find({where: { email}})
        expect(previousUser.length).toEqual(1)


        const response: any = await graphql({schema, source: loginMutation(email, password)});
        expect(response.data.login).toEqual(null)
    })

    test('should fail login if the password is incorrect', async () => {
        const {email, password} = genUser();

        const user = User.create({email, password, confirmed: true})
        await user.save()

        const previousUser = await User.find({where: { email}})
        expect(previousUser.length).toEqual(1)


        const response: any = await graphql({schema, source: loginMutation(email, 'fakePassword')});
        expect(response.data.login[0].message).toEqual(invalidLogin)
        expect(response.data.login[0].path).toEqual('login')
    })

    test('should fail login if email does not exist', async () => {
        const {email} = genUser();

        const response: any = await graphql({schema, source: loginMutation(email, 'fakePassword')});
        expect(response.data.login[0].message).toEqual(invalidLogin)
        expect(response.data.login[0].path).toEqual('login')
    })


    test('should fail login if account has not been activated', async () => {
        const {email, password} = genUser()


        // const salt = bcrypt.genSaltSync(10);
        // const hashPwd = bcrypt.hashSync(password, salt);

        const user = User.create({email, password})
        await user.save()

        const previousUser = await User.find({where: { email}})
        expect(previousUser.length).toEqual(1)


        const response: any = await graphql({schema, source: loginMutation(email, password)});
        expect(response.data.login[0].message).toEqual(confirmEmailMessage)
    })
})