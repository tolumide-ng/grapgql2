
exports.up = (knex) =>
  knex.schema.createTable('users', table => {
      table.increments('id').unsigned().primary();
      table.string('email').unique().notNull();
      table.string('password').notNull()
      table.boolean('confirmed').notNull().defaultTo(false)
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.datetime('updated_at').defaultTo(knex.fn.now());
  })

exports.down = function(knex) {
    knex.schema.dropTable('users')
};
