import {boolean, date, integer, pgTable, serial, text, time, timestamp, varchar} from "drizzle-orm/pg-core";
import { InferModel, eq, sql } from 'drizzle-orm';

export const authCodes = pgTable('authCode', {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    authCode: integer('authCode'),
    expiresAt: timestamp('expiresAt').defaultNow(),
});


export type authCode = InferModel<typeof authCodes>;

export type NewAuthCode = InferModel<typeof authCodes, 'insert'>;