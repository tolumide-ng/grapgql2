import {GraphQLSchema} from 'graphql'
import {mergeSchemas, makeExecutableSchema} from 'graphql-tools'
import * as path from 'path'
import * as fs from 'fs'


export const genSchema = () => {
    const schemas: GraphQLSchema[] = [];
    const folders = fs.readdirSync(path.join(__dirname, '../modules'));
    folders.forEach(folder => {
        const {resolvers} = require(`../modules/${folder}/resolvers`);
        let typeDefs = path.join(__dirname, `../modules/${folder}/schema.graphql`);
        typeDefs = fs.readFileSync(typeDefs, 'utf-8')

        schemas.push(makeExecutableSchema({resolvers, typeDefs}))
    });
    return mergeSchemas({schemas})
}