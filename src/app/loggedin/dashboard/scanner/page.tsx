'use client';
import withAuth from "@/lib/authHOC"
import { useEffect, useState } from "react";
import Image from "next/image";
import { Course } from "@/lib/conutries";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
}

export async function getNameFromEmail(inputEmail: string){

    let nameArray = (inputEmail.split("@")[0]).split(".");

    let nameAFirst = (nameArray.length>1 ? capitalizeFirstLetter(nameArray[0]) + " " + capitalizeFirstLetter(nameArray[1]) : capitalizeFirstLetter(inputEmail.split('@')[0]));

    return nameAFirst;

}



function Scanner({ user }) {

    if(!user){
        return;
    }else{
        if(!user.isAdmin){
            return;
        }
    }

    const [email, setEmail] = useState("Not found");
    
    const [step, setStep] = useState(1);

    const [countries, setCountries] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState();
    const [courseLevel, setCourseLevel] = useState(1);
    const [courseNiveau, setCourseNiveau] = useState(1);


    async function submitCourse(){

        await fetch('/api/submitcourse',)
    
        const bodyContent = JSON.stringify({email: email, course: selectedCourse, level: courseLevel, courseNiveau: courseNiveau})
        const response = await fetch("/api/submitcourse", {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          headers: {
            "Content-Type": "application/json",
          },
          body: bodyContent, // body data type must match "Content-Type" header
        });
        setStep(2);
    }

    useEffect(() => {

        const getCountries = async () => {

            const resCountries = await fetch('/api/getcountries');

            const res = await resCountries.json();

            console.log(res.countries)

            setCountries(res.countries)

        }

        getCountries();

    }, [])

    function setLevel(level: number) {
        setCourseLevel(level);
        setStep(3);
    }

    return <>
        {step==1 ? <>
            <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-3xl font-extrabold text-black mb-8">
                            Kurs wählen
                        </h2>

                        {countries.map((course) => {
                            console.log(course.imglink)
                            function selectCourse(course: Course) {
                                console.log("Course Set", course)
                                setSelectedCourse(course)
                                setStep(2);
                            }

                            return <div className="drop-shadow-xl bg-white mt-6 rounded-xl hover:scale-105 cursor-pointer" onClick={() => {selectCourse(course)}}>
                                <div className="text-black py-6 px-4">
                                    <Image className="inline" alt={course.country+"-Flagge"} src={course.imglink + ".svg"} width={40} height={40}></Image>
                                    <h3 className="inline ml-4">{course.country}</h3>
                                </div>

                            </div>
                        })}

                    </div>
                </div>
          </div>

            
        
        
        </> : (step==2 ? <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-3xl font-extrabold text-black mb-8">
                            Unterkurs wählen
                        </h2>
                        <div className="mx-auto flex justify-center mt-6 py-4">
                                    {[...Array(selectedCourse.levels)].map((elementInArray, index) => ( 
                                    <div className="text-black rounded-full px-7 py-6 inline shadow-md bg-white mr-6 hover:bg-sky-100 cursor-pointer" onClick={() => {setLevel(index+1)}} key={index}>{index+1}</div> 
                                )  
                            )}
                        </div>
                        
                    </div>
                </div>
          </div> : (step==3 ? <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-3xl font-extrabold text-black mb-8">
                            Auf welchem Niveau wurde das gemacht?
                        </h2>
                        <div className="mx-auto flex justify-center mt-6 py-4">
                            <div className="text-black rounded-full px-3 py-4 inline shadow-md bg-white mr-6 hover:bg-sky-100 cursor-pointer text-3xl scale-80" onClick={() => {setStep(4); setCourseNiveau(3)}} key={"great"}>😁</div> 
                            <div className="text-black rounded-full px-3 py-4 inline shadow-md bg-white mr-6 hover:bg-sky-100 cursor-pointer text-3xl scale-80" onClick={() => {setStep(4); setCourseNiveau(2)}} key={"good"}>🙂</div> 
                            <div className="text-black rounded-full px-3 py-4 inline shadow-md bg-white mr-6 hover:bg-sky-100 cursor-pointer text-3xl scale-80" onClick={() => {setStep(4); setCourseNiveau(1)}} key={"mid"}>😐</div> 

                        </div>
                        
                    </div>
                </div>
          </div> : (step==4 ? <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-3xl font-extrabold text-black mb-8">
                            QR-Code scannen
                        </h2>
                        
                        <BarcodeScannerComponent
                            width={500}
                            height={500}
                            onUpdate={(err, result) => {
                                if (result){
                                    const emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@igs-buchholz\.de$')
                                    console.log("E-Mail:", result.text)
                                    setEmail(result.text.toString());
                                    if(result.text.endsWith("@igs-buchholz.de")){
                                        console.log("E-Mail passed:", email)
                                        setStep(5);
                                    }
                                }
                            
                            }}
                        />

                        
                    </div>
            </div> 
            </div> : (step==5 ? <>
            
                <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-3xl font-extrabold text-black mb-8">
                                Daten bestätigen
                            </h2>

                            <h3 className="text-black"><b>{selectedCourse.country}</b> ({courseNiveau})</h3>

                            <h3 className="text-black"><b>E-Mail: </b>{email}</h3>

                            <h3 className="text-black"><b>Niveau:</b> {courseNiveau}/3</h3>

                            <button onClick={submitCourse} className="rounded-xl bg-blue-500 px-6 py-2 mx-auto flex justify-center">Bestätigen</button>

                        </div>
                    </div>
                </div>        

            
            </> : "How did you get here?🤓🤓"))))}
    
    </>

}

export default withAuth(Scanner)