'use client';
import withAuth from "@/lib/authHOC"
import QRCode from "react-qr-code";
import {useEffect, useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {UserSession} from "@/lib/usersession";

//@ts-ignore
function Dashboard({ user }) {

    if(!user) return;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [coursesDone, setCoursesDone] = useState([]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {

        const fetchCoursesDone = async () => {
            const response = await fetch("/api/getcoursesdone", {
                method: "GET", // *GET, POST, PUT, DELETE, etc.
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const res = await response.json();

            setCoursesDone(res)

        }

        fetchCoursesDone()

    }, [])

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();

    return <>
        <div className={"min-h-screen bg-white"}>
            <div className="flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 mb-6">
                        <h2 className="text-3xl font-extrabold text-black mb-8 text-center">
                            {user.name}
                        </h2>
                        <QRCode className={"mx-auto"} value={user.email}/>
                    </div>
                </div>
            </div>

            {user.isAdmin ?
                <div className="flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full bg-blue-500 rounded-lg shadow-md overflow-hidden py-6 text-center cursor-pointer hover:scale-110" onClick={() => {router.push('/loggedin/dashboard/scanner')}} >
                        Kurse-Verifizieren
                    </div>
                </div>: ""}

            <div className=" flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-3xl font-extrabold text-black mb-8 text-center">
                            Abgeschlossene Stationen
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {//ts-ignore
                                coursesDone.map((course, index) => {
                                    if(!course) return <></>
                                    if(!course['imglink'] || !course['country'] || !course['level']){
                                        return <></>
                                    }
                                return (
                                    <div key={index} className="flex flex-col items-center justify-center text-black">
                                        <div className="w-24 h-24 rounded-full overflow-hidden inline-block">
                                            <img src={course['imglink'] + ".svg"} alt="flag" className="w-full h-full object-cover" />
                                        </div>
                                        <h4 className="text-center">{course['country']} {course['level']}</h4>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </>


}

export default withAuth(Dashboard)