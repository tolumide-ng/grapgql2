const {zodiacs, relationship} = require('../../utils/basicUtils');

exports.up = knex => (
    knex.schema.createTable('profiles', table => {
        table.increments('id').unsigned().primary();
        table.enu('zodiacSign', [...zodiacs]).notNull();
        table.string('countryCode').notNull();
        table.integer('phone').unsigned().notNull();
        table.string('location').notNull();
        table.string('interests').notNull();
        table.string('sexualOrientation').notNull()
        table.enu('relationshipStatus', [...relationship]).defaultTo('single')
        table.integer('age').notNull()
    })
)

exports.down = function(knex) {
    knex.schema.dropTable('profiles')
};
