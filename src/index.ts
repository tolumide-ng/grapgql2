import "reflect-metadata";
import { GraphQLServer } from 'graphql-yoga'
import {createTypeormConn} from './utils/createTypeormConn';
// import * as session from 'express-session'
// import redis from 'redis'
// const session = require('express-session')
import dotenv from 'dotenv'
import Redis from 'ioredis'
import { User } from "./entity/User";
import {genSchema} from './utils/genSchema'


dotenv.config()


// let RedisStore = require('connect-redis')(session);
// let client = redis.createClient()

// INSTALL PSQL EXTENSION ON CI (TRAVIS/CIRCLECI) WHEN ACTIAVTED WITH =>
// CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


export const startServer = async () => {


    const redis = new Redis()

    const server = new GraphQLServer({schema: genSchema(), context: ({request}) => ({redis, url: `${request.protocol}://${request.get('host')}`, // session: request.session,
    // url: process.env.FRONTEND_URL
    })})

    server.express.get('/confirm/:id', async (req, res): Promise<void> => {
        const { id } = req.params;
        const userId: any = await redis.get(id);
        if(userId){
            await User.update({ id: userId }, {confirmed: true});
            redis.del(id)
            res.send('ok')
        } else {
            res.send('Invalid')
        }
    });

    // server.express.use(
    //     session({
    //         store: new RedisStore({client}),
    //         name: 'quid',
    //         secret: process.env.SECRET,
    //         resave: false,
    //         saveUninitialized: false,
    //         cookie: {
    //             httpOnly: true,
    //             secure: process.env.NODE_ENV === 'production',
    //             maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    //         }
    //     })
    // )



    // const server = new GraphQLServer({ typeDefs: path.join(__dirname, './schema.graphql'), resolvers })
    await createTypeormConn()
    await server.start(() => console.log('Server is running on localhost:4000'))
}


startServer()