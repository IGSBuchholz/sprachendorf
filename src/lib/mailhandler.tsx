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

var smtpob = async (email: string, code: string, apiKey: string = "") => {

    if(apiKey==""){
        let res = await getConfiguration('sg_ApiKey')
        if(typeof res != "string"){
            console.error("NO sg_ApiKey configured!")
            return;
        }
        apiKey = (await getConfiguration('sg_ApiKey'))!;
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

        console.log('Email:', email);
        const response = await fetch(smtpurl, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          headers: {
            "Content-Type": "application/json",
              "X-Smtp2go-Api-Key": src?.api_key!,
              "accept": "application/json"
          },
          body: JSON.stringify(src), // body data type must match "Content-Type" header
        });

        const resJson = await response.json();
        console.log("Status:", response.status)

        console.log("ResJSOn", resJson.data.succeeded);

        if(resJson.data.succeeded>0){
          return SendMailResult.SUCCESS;
        }else{
          return SendMailResult.SENDERROR;
        }


    }catch(err){

        console.error("Error (sendLoginMail:mailhandler.tsx)", err)
        return SendMailResult.SENDERROR;

    }

    return SendMailResult.SUCCESS;

}