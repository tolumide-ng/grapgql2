import "reflect-metadata";
import { GraphQLServer } from 'graphql-yoga'
import {GraphQLSchema} from 'graphql'
import {createTypeormConn} from './utils/createTypeormConn';
import {makeExecutableSchema, mergeSchemas} from 'graphql-tools'
import * as path from 'path';
import * as fs from 'fs'


// IMPORTANT! => PLEASE REMEMBER TO INSTALL PSQL EXTENSION ON CI (TRAVIS/CIRCLECI) WHEN ACTIAVTED WITH =>
// CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


export const startServer = async () => {

    const schemas: GraphQLSchema[] = [];
    const folders = fs.readdirSync(path.join(__dirname, './modules'));
    folders.forEach(folder => {
        const {resolvers} = require(`./modules/${folder}/resolvers`);
        let typeDefs = path.join(__dirname, `./modules/${folder}/schema.graphql`);
        typeDefs = fs.readFileSync(typeDefs, 'utf-8')

        schemas.push(makeExecutableSchema({resolvers, typeDefs}))
    });

    const server = new GraphQLServer({schema: mergeSchemas({schemas})})




    // const server = new GraphQLServer({ typeDefs: path.join(__dirname, './schema.graphql'), resolvers })
    await createTypeormConn()
    await server.start(() => console.log('Server is running on localhost:4000'))
}


startServer()