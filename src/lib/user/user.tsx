import { boolean, date, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { InferModel, eq, sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  lastRequest: text('lastRequest'),
  isAdmin: boolean('isAdmin'),
});


export type User = InferModel<typeof users>;

export type NewUser = InferModel<typeof users, 'insert'>;