import { GraphQLServer } from 'graphql-yoga'

import {Model} from 'objection'
import Knex from 'knex'
import dotenv from 'dotenv'
import Redis from 'ioredis'
import {genSchema} from './utils/genSchema'



dotenv.config()


const databaseConnection = Knex({
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
          directory: './src/database/migrations'
      }
})

Model.knex(databaseConnection)



// INSTALL PSQL EXTENSION ON CI (TRAVIS/CIRCLECI) WHEN ACTIAVTED WITH =>
// CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


export const startServer = async () => {


    const redis = new Redis()

    const server = new GraphQLServer({schema: genSchema(), context: ({request}) => ({redis, url: `${request.protocol}://${request.get('host')}`,
    })})


    await server.start(() => console.log('Server is running on localhost:4000'))
}

export default databaseConnection


startServer();
