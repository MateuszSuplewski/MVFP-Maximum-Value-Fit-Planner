// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm'
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  primaryKey,
  smallint,
  time,
} from 'drizzle-orm/pg-core'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `mvfp_${name}`)

// Troubleshoot time precision issue
export const trainingPlans = createTable('training_plan', {
  id: serial('id').primaryKey(),
  user_email: varchar('user_email', { length: 128 }).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 512 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  estimated_time: time('estimated_time').notNull(),
  last_training_time: time('last_training_time'),
})

export const plannedExercises = createTable('planned_exercise', {
  id: serial('id').primaryKey(),
  exercise_id: serial('exercise_id').references(() => exercises.id),
  training_plan_id: serial('training_plan_id').references(
    () => trainingPlans.id
  ),
  series: smallint('series').notNull(),
  weights: smallint('weights').notNull(),
  reps: smallint('reps').notNull(),
  rest_time_between: time('rest_time_between').notNull(),
  rest_time_after: time('rest_time_after').notNull(),
})

export const exercises = createTable(
  'exercise',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    body_part_id: serial('body_part_id').references(() => bodyParts.id),
    target_id: serial('target_id').references(() => targets.id),
    secondary_targets: varchar('secondary_targets', { length: 256 }),
    gif_url: varchar('gif_url', { length: 256 }).notNull(),
    equipment_id: serial('equipment_id').references(() => equipmentList.id),
    instructions: varchar('instructions', { length: 1024 }).notNull(),
  },
  (exercise) => ({
    nameIndex: index('name_idx').on(exercise.name),
  })
)

export const bodyParts = createTable('body_part', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
})

export const equipmentList = createTable('equipment', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
})

export const targets = createTable('target', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
})

// To fill this data properly I need to get all unique targets & second targets!
export const secondaryTargets = createTable(
  'secondary_target',
  {
    exercise_id: serial('exercise_id').references(() => exercises.id),
    target_id: serial('target_id').references(() => targets.id),
  },
  (secondary_target) => ({
    pk: primaryKey({
      columns: [secondary_target.exercise_id, secondary_target.target_id],
    }),
  })
)
