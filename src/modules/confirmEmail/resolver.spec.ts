import * as fs from 'fs'
import {makeExecutableSchema} from 'graphql-tools'
import {Redis, genUser} from '../../../tests/test.utils'
import {graphql} from 'graphql'
import * as faker from 'faker'
import * as path from 'path'

// the actual resolvers
import { resolvers } from './resolvers'
import User from '../../database/models/User'
import databaseConnection from '../..'
import Baserepository from '../../Baserepository/base.repository'


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
        await databaseConnection.migrate.latest()
        await databaseConnection('users').truncate()
    });

    beforeEach(async() => {
        await databaseConnection('users').truncate()
        redis.del()
    })

    afterAll(async () => {
        await databaseConnection('users').truncate()
        await databaseConnection.destroy()

    })


    const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8');
    const schema = makeExecutableSchema({typeDefs, resolvers});

    test('should confirm a valid token', async () => {
        const { email, password } = genUser()

        await Baserepository.create(User, {email, password})

        // const checkUser: any = await User.find({where: { email }});
        const checkUser: any = await Baserepository.findBy(User, ['id', 'email'], ['email', email])

        expect(checkUser.length).toEqual(1);
        await redis.set(checkUser[0].id)

        const response: any = await graphql({schema, source: query(checkUser[0].id), contextValue: {redis}});

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