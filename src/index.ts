// import "reflect-metadata";
import { GraphQLServer } from 'graphql-yoga'
// import {createTypeormConn} from './utils/createTypeormConn';

import {Model} from 'objection'
import Knex from 'knex'
import dotenv from 'dotenv'
import Redis from 'ioredis'
import { User } from "./entity/User";
import {genSchema} from './utils/genSchema'



dotenv.config()

// const stage = process.env.NODE_ENV


const knex = Knex({
    client: process.env.DATABASE_CLIENT,
    connection: {
        database: process.env.DATABASE_URL,
        user:     process.env.USER,
        password: process.env.PASSWORD,
        host: process.env.HOST
      },
      pool: {
          min: 2,
          max: 10
      },
      migrations: {
          tableName: 'knex_migrations',
          directory: './database/migrations'
      }
})

Model.knex(knex)



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


    // await createTypeormConn()
    await server.start(() => console.log('Server is running on localhost:4000'))
}


startServer();

export default knex