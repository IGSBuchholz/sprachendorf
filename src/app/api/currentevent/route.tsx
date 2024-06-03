import {NextResponse} from "next/server";

export async function GET(req: Request){

    const currTime = new Date()
    var cleanUp = false;
    var showPDF = false;
    if(currTime.getHours()>=11 || currTime.getTime() > 1717623600*1000){
        if(currTime.getHours() < 12){
            cleanUp = true;
        }
        showPDF = true;
    }

    return new NextResponse(JSON.stringify({"cleanUp": cleanUp, "showPDF": showPDF}))

}
