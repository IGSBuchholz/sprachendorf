import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('config', {
  id: serial('id').primaryKey(),
  key: text('key'),
  value: text('value'),
});