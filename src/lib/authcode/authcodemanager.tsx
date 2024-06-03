import {range} from "@nextui-org/react/types/utils/numbers";

const sgMail = require('@sendgrid/mail');
import { sendLoginMail } from "../mailhandler";
import {authCode, authCodes, NewAuthCode} from "./authcode";
import { getDatabaseConnection } from "../databsemanager";
import {eq} from "drizzle-orm";
import {integer} from "drizzle-orm/pg-core";
import Integer from "@zxing/library/esm5/core/util/Integer";

  export enum AuthCodeIssueingResult {
    SUCCESS = 'SUCCESS',
    DATABASE_ERROR = 'DATABASE_ERROR',
    EMAIL_ERROR = 'EMAIL_ERROR'
  }

  export async function issueAuthCode(email: string, sendEmail = true): Promise<AuthCodeIssueingResult> {

    const authCode = Math.floor(100000 + Math.random() * 900000); // Generate a random number

    console.log(new Date().getTime())

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    //Date.now() + 10 * 60 * 1000;

    try{
      const connection = await getDatabaseConnection();

      const newAuthCode: NewAuthCode = {id: authCode, email: email.toLocaleLowerCase(), authCode: authCode}

      await connection.insert(authCodes).values(newAuthCode);

    }catch(err){

      console.log(err)

      return AuthCodeIssueingResult.DATABASE_ERROR;

    }

    try{

      console.log("SENDMAIL", sendEmail)
      if(sendEmail){
        console.log("EMAIL-RES", await sendLoginMail(email, authCode));
      }else{
        console.log("NOT SENDING EMAIL")
      }
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

      //@ts-ignore
      if(!resL.length>0){
        return AuthCodeEvaluationResult.CODE_NOT_FOUND;
      }
      //@ts-ignore
      const codeEntry: authCode = resL[0];

      if(codeEntry){
//@ts-ignore
        let expiryDate = new Date(codeEntry.expiresAt!);

        let nowDate = new Date(Date.now());

        if(expiryDate.getMilliseconds() > nowDate.getMilliseconds() || true){
          await connection.delete(authCodes).where(eq(authCodes.authCode, authCode));
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