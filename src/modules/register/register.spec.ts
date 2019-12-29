import * as fs from 'fs';
import {createTypeormConn} from '../../utils/createTypeormConn'
import {makeExecutableSchema} from 'graphql-tools';
import {graphql} from 'graphql';
import {User} from '../../entity/User'
import * as faker from 'faker';
import * as path from 'path'

//the actual resolvers
import {resolvers} from './resolvers'





// credit: https://github.com/nzaghini/graphql-server-addc-2018/blob/master/__tests__/Movies-test.js


let connection: any;
const email = faker.internet.email()
const password= faker.internet.password()


const mutation = (email:string, password:string) => `
mutation {
    register(email: "${email}", password: "${password}"){
        path,
        message
    }
}
`

describe('Test User registration', () => {
    beforeAll(async () => {
        connection = await createTypeormConn()
    });


    afterAll(async() => {
        await connection.close()
    })

    beforeEach(async () => {
        await connection.synchronize(true)
    })
    // Reading the actual schema
    const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf8');
    // make the actual schema and resolvers executable
    const schema = makeExecutableSchema({typeDefs, resolvers});



    // running the test for each case in the cases array

        test('should create a user', async () => {
            const previousUser = await User.find({where: {email}})
            expect(previousUser.length).toBeLessThan(1)
            const response = await graphql(schema, mutation(email, password));
            expect(response).toEqual({
                "data": {
                "register": null
            }});
            const currentUser = await User.find({where: {email}})
            const user = currentUser[0];
            expect(currentUser).toBeTruthy();
            expect(currentUser).toHaveLength(1);
            expect(user.email).toEqual(email);
            expect(user.password).not.toEqual(password);
        });

        test('should not create a user if the email already exists', async () => {
            const user =  User.create({email, password});
            await user.save();
            const previousUser = await User.find({where: {email}});
            expect(previousUser.length).toEqual(1);

            const response:any = await graphql(schema, mutation(email, password))
            expect(response.data.register[0].path).toEqual('email')
        });

        test('should return error if validation error occurs', async () => {
            const email = 'ot'
            const response:any = await graphql(schema, mutation(email, password));
            expect(response.data.register[0].message).toEqual('email must be at least 5 characters');
            expect(response.data.register[1].message).toEqual('email must be a valid email')
        })


})




