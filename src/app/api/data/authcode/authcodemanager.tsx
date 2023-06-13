import {NewUser} from "@/app/api/data/user/user";

const sgMail = require('@sendgrid/mail');
import { sendLoginMail } from "../mailhandler";
import {authCode, authCodes, NewAuthCode} from "./authcode";
import { getDatabaseConnection } from "../databsemanager";
import {eq} from "drizzle-orm";

  export enum AuthCodeIssueingResult {
    SUCCESS = 'SUCCESS',
    DATABASE_ERROR = 'DATABASE_ERROR',
    EMAIL_ERROR = 'EMAIL_ERROR'
  }

  export async function issueAuthCode(email: string): Promise<AuthCodeIssueingResult> {

    const authCode = Math.floor(100000 + Math.random() * 900000); // Generate a random number

    const expiresAt = new Date(new Date().getTime() + 10 * 60 * 1000);

    try{
      const connection = await getDatabaseConnection();

      const newAuthCode: NewAuthCode = {email: email, authCode, expiresAt: expiresAt}

      await connection.insert(authCodes).values({email: email, authCode, expiresAt: expiresAt});

    }catch(err){

      console.log(err)

      return AuthCodeIssueingResult.DATABASE_ERROR;

    }

    try{

      await sendLoginMail(email, authCode);

    }catch(err){

      return AuthCodeIssueingResult.EMAIL_ERROR;

    }

    console.log("*********\nIssued Authcode\n E-Mail:" + email + "\n Code: " + authCode +"\n*********")

    return AuthCodeIssueingResult.SUCCESS;

  }

  export enum AuthCodeEvaluationResult {
    INTERNAL_ERROR = 'INTERNAL ERROR',
    SUCCESS = 'SUCCESS',
    CODE_EXPIRED = 'CODE EXPIRED',
    CODE_NOT_FOUND = 'CODE NOT FOUND',
  }

  export async function evaluateAuthCode(email: string, authCode: number): Promise<AuthCodeEvaluationResult> {
    try {
      const connection = await getDatabaseConnection();

      const resL = await connection.select().from(authCodes).where(eq(authCodes.email, email)).where(eq(authCodes.authCode, authCode));

      if(!resL.length>0){
        return AuthCodeEvaluationResult.CODE_NOT_FOUND;
      }

      const codeEntry: authCode = resL[0];

      if(codeEntry){

        if(new Date() < codeEntry.expiresAt){
          return AuthCodeEvaluationResult.SUCCESS;
        }
        return AuthCodeEvaluationResult.CODE_EXPIRED;

      }else{

        return AuthCodeEvaluationResult.CODE_NOT_FOUND;

      }

    } catch (error) {
      console.error('Failed to evaluate auth code:', error);
      return AuthCodeEvaluationResult.INTERNAL_ERROR;
    }
  }