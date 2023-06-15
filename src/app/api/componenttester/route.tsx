import { verifyToken } from "@/lib/sessionmanager";
import { NextResponse } from "next/server"

export async function GET(req: Request) {

    console.log("test")

    // await saveDatabaseConfiguration('postgresql://postgres:t4TiNcgrdv66wXMBhLskUzVZ@db.hwviynwoyitmjoykwfjr.supabase.co:5432/postgres');
    //
    // await insertUser('test@test.de', true);

    // const userObj = await getUser("alberteinstein@junge.de");
    //
    // console.log(userObj);
    //
    // await updateConfiguration("temptest2", "aaah")
    // console.log(await getConfiguration("temptest2"))

    // console.log(await sendLoginMail('constantin.debertin@igs-buchholz.de', 123))
    // const res = await issueAuthCode('constantin.debertin@igs-buchholz.de');

    //const res = await evaluateAuthCode('constantin.debertin@igs-buchholz.de', 601986);

    //const res = await getSessionKey();    
    //const res2 = await getSessionKey();

    const res = await verifyToken()

    console.log("FUCKING RESULT", res);
    
    return new NextResponse()

}