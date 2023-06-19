'use server';
import { getConfiguration } from "./config/configmanager";
const request = require('request')

var smtpurl = 'https://api.smtp2go.com/v3/email/send'

function capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
}

export async function getNameFromEmail(inputEmail: string){

    let nameArray = (inputEmail.split("@")[0]).split(".");

    let nameAFirst = (nameArray.length>1 ? capitalizeFirstLetter(nameArray[0]) + " " + capitalizeFirstLetter(nameArray[1]) : capitalizeFirstLetter(inputEmail.split('@')[0]));

    return nameAFirst;

}

var smtpob = async (email: string, code: string, apiKey = "") => {

    if(apiKey==""){
        apiKey=await getConfiguration('sg_ApiKey');
    }

    const usersName = await getNameFromEmail(email);

    let sender = await getConfiguration('sg_Sender_Displayname')  + " <" + await getConfiguration('sg_Sender') + ">";


    let tId = await getConfiguration('sg_LoginTemplate');

    console.log("Fucking Template ID:", tId)

    return {
        "api_key": apiKey,
        "to": [usersName + " <" + email.toLocaleLowerCase() +">"],
        "sender": sender,
        "template_id": tId,
        "template_data": {
            "CODE": code.toString(),
        }
    }
  }


enum SendMailResult{
    SUCCESS,
    TEMPLATE_UNKNOWN,
    MAILHANDLER_ERROR,
    FROMMAIL_UNKNOWN,
    SENDERROR
}

export async function sendLoginMail(email: string, authCode: number){

    const fromMail = await getConfiguration("sg_Sender")
    if(fromMail == undefined){
        return SendMailResult.FROMMAIL_UNKNOWN;
    }

    const templateID = await getConfiguration("sg_LoginTemplate")
    if(templateID == undefined){
        return SendMailResult.TEMPLATE_UNKNOWN;
    }

    try{

        var src = await smtpob(email, authCode.toString());

        console.log("emailsrc", src)

        request
        .post({
          headers: {'content-type': 'application/json'},
          url: smtpurl,
          body: JSON.stringify(src)
        })
        .on('response', function (response: { statusMessage: any; statusCode: number; }) {
            console.log(response.statusMessage)
          if (response.statusCode !== 200) {
            console.log(response.statusCode)
            console.log(response.statusMessage)
            return SendMailResult.SENDERROR;
          }else{
            return SendMailResult.SUCCESS;
          }
        })
            //@ts-ignore
        .on('data', function (data) {
          console.log('decoded chunk: ' + data)
        })
            //@ts-ignore
        .on('error', function (err) {
          console.log('Email sender', err)
        })

    }catch(err){

        console.error("Error (sendLoginMail:mailhandler.tsx)", err)
        return SendMailResult.SENDERROR;

    }

    return SendMailResult.SUCCESS;

}