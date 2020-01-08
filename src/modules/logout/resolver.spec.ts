import * as fs from 'fs'
import {makeExecutableSchema} from 'graphql-tools'
import {Redis} from '../../../tests/test.utils'
import {graphql} from 'graphql'
import * as faker from 'faker'
import * as path from 'path'

// the actual resolvers
import { resolvers } from './resolvers'
import { signJwt } from '../../utils/basicUtils'
import { createTypeormConn } from '../../utils/createTypeormConn'
import { User } from '../../entity/User'


let connection: any;
const email: () => string = () => faker.internet.email()
const id = faker.random.uuid()
const redis = new Redis()
const LOCALHOST: string = 'https://localhost:4000'


const query = (token: string) => `
query {
    logOut(token: "${token}"){
        message,
        status
    }
}
`

describe.skip('Test User Logout', () => {
    beforeAll(async () => {
        connection = await createTypeormConn()
    });

    beforeEach(async () => {
        const all = await User.find()
        await User.remove(all)
        jest.clearAllMocks()
    });

    afterAll(async () => {
        await connection.close();
    });


    const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8');
    const schema = makeExecutableSchema({typeDefs, resolvers});

    test('should logout an existing user', async() => {
        const token = signJwt({id, email: email()});
        await redis.zadd(token)


        const zremSpy = jest.spyOn(redis, 'zrem');
        const zrangebyscoreSpy = jest.spyOn(redis, 'zrangebyscore');


        await graphql({schema, source: query(token), contextValue: {redis, url: LOCALHOST}})


        expect(zremSpy).toHaveBeenCalled()
        expect(zrangebyscoreSpy).toHaveBeenCalled();

    });



    test('should fail when trying to logout an invalid token', async() => {
        const token = id;

        const zremSpy = jest.spyOn(redis, 'zrem');
        const zrangebyscoreSpy = jest.spyOn(redis, 'zrangebyscore');

        await graphql({schema, source: query(token), contextValue: {redis, url: LOCALHOST}});

        expect(zrangebyscoreSpy).not.toHaveBeenCalled()
        expect(zremSpy).not.toHaveBeenCalled();
    })


    test('should fail when trying to logout a valid but already loggedout token', async () => {
        // Token is valid but does not exist in the redis store (already logged out user)
        const token = signJwt({id, email: email()});


        const zremSpy = jest.spyOn(redis, 'zrem');
        const zrangebyscoreSpy = jest.spyOn(redis, 'zrangebyscore');


        await graphql({schema, source: query(token), contextValue: {redis, url: LOCALHOST}})


        expect(zrangebyscoreSpy).toHaveBeenCalled();
        expect(zremSpy).not.toHaveBeenCalled()
    })

})