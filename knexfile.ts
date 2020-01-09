// Update with your config settings.
require('dotenv').config()

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
        database: 'gq_ts',
        user:     'postgres',
        password: '',
        host: 'localhost'
      },
      migrations: {
        tableName: 'knex_migrations',
        directory: './src/database/migrations'
      }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
