import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import {InferModel} from "drizzle-orm";

export const Configurations = pgTable('config', {
  key: text('key').primaryKey(),
  value: text('value'),
});

export type Configuration = InferModel<typeof Configurations>;

export type NewConfiguration = InferModel<typeof Configurations, 'insert'>;


