import {createConnection, getConnectionOptions} from 'typeorm'

 export const createTypeormConn = async () => {
     const connectionOptions = await getConnectionOptions(process.env.NODE_ENV)
     const connection = await createConnection({...connectionOptions, name: 'default'});
     console.log(connection.isConnected)
     await connection.synchronize()
     return connection
 }