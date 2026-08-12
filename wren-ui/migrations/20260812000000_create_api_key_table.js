/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('api_keys', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.string('key_hash').notNullable().unique();
    table.string('key_prefix').notNullable();

    // Tables allowed (JSON array in string format, e.g. ["orders", "customers"])
    table.text('allowed_tables').notNullable();

    table.boolean('is_active').notNullable().defaultTo(true);

    // Foreign key to project
    table.integer('project_id').notNullable();
    table
      .foreign('project_id')
      .references('id')
      .inTable('project')
      .onDelete('CASCADE');

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('api_keys');
};
