// import Redis from 'ioredis'
import {createTypeormConn} from './createTypeormConn'
// import {createConfirmEmailLink} from './createConfirmEmailLink'
import {User} from '../entity/User'
import * as faker from 'faker'


process.env.TEST_HOST='http://localhost:4000'


let userId: string;
let connection: any;


describe('Confirm Email Link', () => {
    beforeAll(async () => {
        connection = await createTypeormConn()
        const user = await User.create({
            email: faker.internet.email(),
            password: faker.internet.password()
        }).save();
        userId = user.id;
        console.log('userId', userId)
    })


    afterAll(async ()=> {
        await connection.close();
    } )


    test.skip('should create valid confirmEmail Link', async () => {

        // const url = await createConfirmEmailLink(process.env.TEST_HOST as string, userId, new Redis());

        // await createConfirmEmailLink(process.env.TEST_HOST as string, userId, new Redis());

        // const response = await fetch(url)
        // console.log('a response from santa', response)
    })
})
