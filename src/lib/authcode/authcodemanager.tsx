import { sendLoginMail } from "../mailhandler";
import { prisma } from "@/lib/prisma";

export enum AuthCodeIssueingResult {
  SUCCESS = 'SUCCESS',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EMAIL_ERROR = 'EMAIL_ERROR'
}

export async function issueAuthCode(email: string, sendEmail = true): Promise<AuthCodeIssueingResult> {
  const authCodeValue = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit code
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

  try {
    await prisma.authCode.create({
      data: {
        email: email.toLowerCase(),
        authCode: authCodeValue,
        expiresAt: expiresAt
      }
    });
  } catch (err) {
    console.error(err);
    return AuthCodeIssueingResult.DATABASE_ERROR;
  }

  try {
    console.log("SENDMAIL", sendEmail);
    if (sendEmail) {
      console.log("EMAIL-RES", await sendLoginMail(email, authCodeValue));
    } else {
      console.log("NOT SENDING EMAIL");
    }
  } catch (err) {
    console.error(err);
    return AuthCodeIssueingResult.EMAIL_ERROR;
  }

  console.log(`*********\nIssued Authcode\n E-Mail: ${email}\n Code: ${authCodeValue}\n*********`);
  return AuthCodeIssueingResult.SUCCESS;
}

export enum AuthCodeEvaluationResult {
  INTERNAL_ERROR = 'INTERNAL ERROR',
  SUCCESS = 'SUCCESS',
  CODE_EXPIRED = 'CODE EXPIRED',
  CODE_NOT_FOUND = 'CODE NOT FOUND'
}

export async function evaluateAuthCode(email: string, authCodeValue: number | string): Promise<AuthCodeEvaluationResult> {
  const authCodeInt = typeof authCodeValue === 'string' ? parseInt(authCodeValue, 10) : authCodeValue;
  try {
    const codeEntry = await prisma.authCode.findFirst({
      where: {
        email: email.toLowerCase(),
        authCode: authCodeInt
      }
    });

    if (!codeEntry) {
      return AuthCodeEvaluationResult.CODE_NOT_FOUND;
    }

    const nowDate = new Date();
    if (codeEntry.expiresAt && codeEntry.expiresAt > nowDate) {
      await prisma.authCode.deleteMany({
        where: { id: codeEntry.id }
      });
      return AuthCodeEvaluationResult.SUCCESS;
    }

    return AuthCodeEvaluationResult.CODE_EXPIRED;
  } catch (error) {
    console.error('Failed to evaluate auth code:', error);
    return AuthCodeEvaluationResult.INTERNAL_ERROR;
  }
}