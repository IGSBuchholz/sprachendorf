import { eq } from 'drizzle-orm';
import { getDatabaseConnection } from '../databsemanager'; // Assuming this is the file with the previously defined methods.
import { User, users, NewUser } from './user'; // The User entity defined above.

    export async function getUser(emailAdress: string): Promise<User> {
        const db = await getDatabaseConnection();


        const userRes: User[] = await db.select().from(users).where(eq(users.email, emailAdress));
        

        if(userRes.length>0){
            return userRes[0];
        }

        insertUser(emailAdress, false);

        const userRes2: User[] = await db.select().from(users).where(eq(users.email, emailAdress));
        
        return userRes2[0];
    }

    export async function updateUserLastRequest(email: string, lastRequestDate: Date): Promise<void> {
        const connection = await getDatabaseConnection();
        await connection.update(users).set({lastRequest: lastRequestDate.toDateString()}).where(eq(users.email, email));
    }

    export async function insertUser(email: string, isAdmin = false, lastRequestDate = Date.now()): Promise<NewUser> {
        const connection = await getDatabaseConnection();
        const newUser: NewUser = {email: email, isAdmin: isAdmin, lastRequest: lastRequestDate.toString()}
        await connection.insert(users).values(newUser);
        return newUser;
    }


    export async function setAdmin(email: string, isAdmin: boolean): Promise<boolean> {
        try{
            const connection = await getDatabaseConnection();
            await connection.update(users).set({isAdmin: isAdmin});    
        }catch(e){
            return false;
        }
        return true;
    }


