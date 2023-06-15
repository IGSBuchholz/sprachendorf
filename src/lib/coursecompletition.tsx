import {boolean, date, integer, pgTable, serial, text, time, timestamp, varchar} from "drizzle-orm/pg-core";
import { InferModel, eq, sql } from 'drizzle-orm';

export const courseCompletitions = pgTable('coursecompletition', {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    country: text('country'),
    level: integer('level'),
    niveau: integer('niveau')
});


export type courseCompletition = InferModel<typeof courseCompletitions>;

export type NewCourseCompletition = InferModel<typeof courseCompletitions, 'insert'>;