import { boolean, date, integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { InferModel, eq, sql } from 'drizzle-orm';

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  country: text('language').notNull(),
  levels: integer('levels'),
  imglink: text('imglink'),
  maxusers: integer('maxusers')
});


export type Course = InferModel<typeof courses>;

export type NewCourse = InferModel<typeof courses, 'insert'>;