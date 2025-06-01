'use server'
import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/sessionmanager";
import { evaluateAuthCode, AuthCodeEvaluationResult } from "@/lib/authcode/authcodemanager";
import { issueAuthCode, AuthCodeIssueingResult } from "@/lib/authcode/authcodemanager";
import { getConfiguration } from "@/lib/config/configmanager";
import { checkCountry, getUser, insertUser } from "@/lib/user/usermanager";
import {Role, User} from "@prisma/client";
import { getNameFromEmail } from "@/lib/mailhandler";

export async function POST(req: NextRequest) {
  console.log("Router reached");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@igs-buchholz\.de$/;
  const body = await req.json();

  if (!body || !body.email) {
    console.log("No Email provided");
    return new NextResponse("No Email Provided", { status: 400 });
  }

  const mail: string = body.email;
  if (!emailRegex.test(mail)) {
    return new NextResponse("Wrong E-Mail Regex", { status: 400 });
  }

  const code: number | undefined = body.code;

  if (code != null) {
    const loginStatus = await evaluateAuthCode(mail.toLowerCase(), code);
    console.log(`Auth code evaluation result for ${mail}: ${loginStatus}`);

    if (loginStatus === AuthCodeEvaluationResult.SUCCESS) {
      let userData: User | null = await getUser(mail.toLowerCase());
      console.log("Fetched user data:", userData);

      if (!userData) {
        const newUser = await insertUser(mail, Role.USER);
        const token = await createToken({
          id: newUser.email,
          email: newUser.email,
          role: newUser.role,
          startCountry: newUser.startcountry || "",
          name: await getNameFromEmail(newUser.email),
        });

        return new NextResponse("User Logged In", {
          status: 200,
          headers: {
            'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax`,
          },
        });
      } else {
        userData = await checkCountry(userData);
        const token = await createToken({
          id: userData.email,
          email: userData.email,
          role: userData.role,
          startCountry: userData.startcountry || "",
          name: await getNameFromEmail(userData.email),
        });

        return new NextResponse("User Logged In", {
          status: 200,
          headers: {
            'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax`,
          },
        });
      }
    }

    return new NextResponse(loginStatus, { status: 401 });
  } else {
    let sendEmail = true;
    if (body.sendEmail != null) {
      sendEmail = body.sendEmail;
    }

    const issueResult = await issueAuthCode(mail.toLowerCase(), sendEmail);
    console.log(`Issue auth code result for ${mail}: ${issueResult}`);

    if (issueResult === AuthCodeIssueingResult.SUCCESS) {
      return new NextResponse("CODE SENT", { status: 201 });
    }
    return new NextResponse(issueResult, { status: 500 });
  }
}