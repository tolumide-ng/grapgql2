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


let connection: any;
const genUser: () => {email: string, password: string} = () => ({
    email: faker.internet.email(),
    password: faker.internet.password()
})
const id = () => faker.random.uuid()
const redis = new Redis()


const query = (id:string) => `
query {
    confirmEmail(id: "${id}"){
        status
        message
    }
}
`


describe.only('Test Confirm Email', () => {
    beforeAll(async () => {
        connection = await createTypeormConn();

    });

    beforeEach(async() => {
        const all = await User.find();
        await User.remove(all)
        await connection.synchronize()
        redis.del()
    })

    afterAll(async () => {
        await connection.close();
    })


    const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8');
    const schema = makeExecutableSchema({typeDefs, resolvers});

    test('should confirm a valid token', async () => {
        const { email, password } = genUser()

        const user = await User.create({email, password});
        await user.save();

        const checkUser: any = await User.find({where: { email }});
        expect(checkUser.length).toEqual(1);
        await redis.set(user.id)

        const response: any = await graphql({schema, source: query(user.id), contextValue: {redis}});

        expect(response.data.confirmEmail.status).toEqual('Success')
        expect(response.data.confirmEmail.message).toEqual('Email Verified')
    })

    test('should fail confirm email if the token is not valid', async () => {
        const response: any = await graphql({schema, source: query(id()), contextValue: {redis}});

        expect(response.data.confirmEmail.status).toEqual('Error')
        expect(response.data.confirmEmail.message).toEqual('Invalid Client Id')
    })

    // test('shoul')
})