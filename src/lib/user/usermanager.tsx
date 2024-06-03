import { eq } from 'drizzle-orm';
import { getDatabaseConnection } from '../databsemanager'; // Assuming this is the file with the previously defined methods.
import { User, users, NewUser } from './user';
import {PostgresJsDatabase} from "drizzle-orm/postgres-js";
import {Course, courses} from "@/lib/conutries";
import {getCountries} from "@/app/api/getcountries/route"; // The User entity defined above.

    export async function getUser(emailAdress: string): Promise<User | undefined> {
        const db = await getDatabaseConnection();
        console.log("WHAT")

        const userRes = await db.select().from(users).where(eq(users.email, emailAdress));

        console.log("THG")

        if(userRes.length>0){
            return userRes[0];
        }
        console.log("HE")

        return undefined;
    }

    export async function updateUserLastRequest(email: string, lastRequestDate: Date): Promise<void> {
        const connection = await getDatabaseConnection();
        await connection.update(users).set({lastRequest: lastRequestDate.toDateString()}).where(eq(users.email, email));
    }

    export async function insertUser(email: string, isAdmin = false, lastRequestDate = Date.now()): Promise<NewUser> {
        const connection = await getDatabaseConnection();

        const countryChosen = await chooseCountry(connection)
        console.log("WTF ist das ")
        const newUser: NewUser = {id: Math.floor(Math.random()*9999999), email: email, isAdmin: isAdmin, lastRequest: lastRequestDate.toString(), startcountry: countryChosen.country}

        console.log(newUser)
        await connection.insert(users).values(newUser);
        return newUser;
    }

    export async function chooseCountry(connection: PostgresJsDatabase) : Promise<Course>{
        const countries = await getCountries()
        console.log("WW" + Math.floor(Math.random()*countries.length))
        var country = countries[Math.floor(Math.random()*countries.length)];
        console.log("THE CHOSEN ONE" + country.country)
        var usersAlready = await connection.select().from(users).where(eq(users.startcountry, country.country));
        const selectCntry = await connection.select().from(courses).where(eq(courses.country, country.country));
        if (selectCntry[0].maxusers && usersAlready.length >= selectCntry[0].maxusers) {
            return chooseCountry(connection);
        }
        return country;
    }


    export async function setAdmin(email: string, isAdmin: boolean): Promise<boolean> {
        try{
            const connection = await getDatabaseConnection();
            await connection.update(users).set({isAdmin: isAdmin}).where(eq(users.email, email));
        }catch(e){
            return false;
        }
        return true;
    }


