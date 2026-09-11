/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('data_source_metadata_cache', (table) => {
    table.increments('id').primary();
    table.integer('project_id').notNullable().unique();
    table.text('tables').notNullable();
    table.timestamps(true, true);

    table
      .foreign('project_id')
      .references('id')
      .inTable('project')
      .onDelete('CASCADE');

    table.index('project_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('data_source_metadata_cache');
};
