'use server'
import { NextRequest, NextResponse } from "next/server";
import { issueSession } from "../data/sessionmanager";
import { evaluateAuthCode, AuthCodeEvaluationResult } from "../data/authcode/authcodemanager";
import { issueAuthCode, AuthCodeIssueingResult } from '../data/authcode/authcodemanager';
import {getUser, insertUser} from '../data/user/usermanager'
import {saveDatabaseConfiguration, getDatabaseConfiguration, getDatabaseConnection} from '../data/databsemanager'
import {getConfiguration, updateConfiguration} from '../data/config/configmanager'
import { sendLoginMail } from '../data/mailhandler'

export async function POST(req: Request) {

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

    const res = await evaluateAuthCode('constantin.debertin@igs-buchholz.de', 601986);

    console.log(res);

    return new NextResponse()

}