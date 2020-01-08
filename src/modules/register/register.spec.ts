import * as fs from 'fs';
import {createTypeormConn} from '../../utils/createTypeormConn'
import {makeExecutableSchema} from 'graphql-tools';
import {graphql} from 'graphql';
import Redis from 'ioredis'
import {User} from '../../entity/User'
import * as faker from 'faker';
import * as path from 'path'

//the actual resolvers
import {resolvers} from './resolvers'


// credit: https://github.com/nzaghini/graphql-server-addc-2018/blob/master/__tests__/Movies-test.js


let connection: any;
const email = faker.internet.email()
const password= faker.internet.password()
const redis = new Redis()



const mutation = (email:string, password:string) => `
mutation {
    register(email: "${email}", password: "${password}"){
        ...on RegisterError{
            errorMessage: message,
            path
          }
          ...on RegisterSuccess{
            message
        }
    }
}
`


describe.only('Test User registration', () => {
    beforeAll(async () => {
        connection = await createTypeormConn()
        await connection.synchronize()

    });

    beforeEach(async () => {
        const all = await User.find();
        await User.remove(all)
    })

    afterAll(async() => {
        await connection.close();
        // console.log(connection)
    })
    // Reading the actual schema
    const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf8');
    // make the actual schema and resolvers executable
    const schema = makeExecutableSchema({typeDefs, resolvers});



    // running the test for each case in the cases array

        test('should create a user', async () => {
            const previousUser = await User.find({where: {email}})
            expect(previousUser.length).toBeLessThan(1)


            const response = await graphql({schema, source: mutation(email, password), contextValue: {redis, url:'https://localhost:4000'} });


            expect(response).toEqual({
                "data": {
                    "register": {
                        "message": "Please check your email for your confirmation link",
                     },
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

            const response: any = await graphql({schema, source: mutation(email, password), contextValue: {redis, url:'https://localhost:4000'}})
            expect(response.data.register.errorMessage).toEqual('already taken')
        });

        test('should return error if validation error occurs', async () => {
            const email = 'ot'
            const response:any = await graphql({schema, source: mutation(email, password), contextValue: {redis, url:'https://localhost:4000'}});
            expect(response.data.register.errorMessage).toEqual('email must be at least 5 characters');
        })


})




