'use client';
import withAuth from "@/lib/authHOC"
import QRCode from "react-qr-code";
import {useEffect, useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {UserSession} from "@/lib/usersession";
import Link from "next/link";
import {Variants, motion} from "framer-motion";
import { ExportButton } from "@/lib/exportpdf";
import {boolean} from "drizzle-orm/pg-core";
import {Role} from "@prisma/client";

const variants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

//@ts-ignore
function Dashboard({ user }) {

    if(!user) return;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [coursesDone, setCoursesDone] = useState([]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [events, setEvents] = useState({
        showPDF: false,
        cleanUp: false
    });
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

        const getEvents = async () => {
            const response = await fetch("/api/currentevent", {
                method: "GET", // *GET, POST, PUT, DELETE, etc.
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const res = await response.json();
            console.log(res.showPDF)
            setEvents(res)

        }

        getEvents()
        fetchCoursesDone()

    }, [])

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();

    return <>
        <div className={"min-h-screen bg-white"}>


            {events.cleanUp && !user.isAdmin ? <div className="flex items-center justify-center bg-white pt-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-red-500 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 text-center">
                        <h3>Bitte begib dich zur Station <b>{user.startCountry}</b> um bei den Aufräumarbeiten zu helfen!</h3>
                    </div>
                </div>
            </div> : coursesDone.length == 0 && !user.isAdmin? <div className="flex items-center justify-center bg-white pt-6 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full bg-green-500 rounded-lg shadow-md overflow-hidden">
                        <div className="p-6 text-center">
                            <h3>Deine erste Station ist <b>{user.startCountry}</b>, begib dich zu dieser!</h3>
                        </div>
                    </div>
                </div>
            : ""}

            <div className="flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 mb-6">
                        <h2 className="text-3xl font-extrabold text-black mb-8 text-center">
                            {user.name}
                        </h2>
                        <QRCode className={"mx-auto"} value={"...." + user.email}/>
                    </div>
                </div>
            </div>

            {user.role != Role.USER ?
                <div className="flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                    <Link href={'/loggedin/dashboard/scanner'} className="max-w-md w-full bg-blue-500 rounded-lg shadow-md overflow-hidden py-6 text-center cursor-pointer hover:scale-110">
                        Kurse-Verifizieren
                    </Link>
                </div>
                : ""}

            {(user.role == (Role.TEACHER) || user.role == Role.ADMIN) ?
                <div className="flex items-center justify-center bg-white pb-12 px-4 sm:px-6 lg:px-8">
                    <Link href={'/loggedin/dashboard/orga/changeroles'}
                          className="max-w-md w-full bg-blue-500 rounded-lg shadow-md overflow-hidden py-6 text-center cursor-pointer hover:scale-110">
                        {user.role === Role.TEACHER ? 'Helfer hinzufügen / ' : 'Nutzer'} verwalten
                    </Link>
                </div> : ""}

            <div className=" flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-3xl font-extrabold text-black mb-8 text-center">
                        Abgeschlossene Stationen
                        </h2>
                        { events.showPDF ? <ExportButton coursesDone={coursesDone} usersname={user.name} /> : ""}
                        { coursesDone.length > 0 ? <div className="grid grid-cols-3 gap-4">
                            {//ts-ignore
                                coursesDone.map((course, index) => {
                                    if(!course) return <></>
                                    if(!course['imglink'] || !course['country'] || !course['level']){
                                        return <></>
                                    }
                                return (
                                    <motion.div
                                        variants={variants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        key={"kdone" + index}
                                        transition={{ duration: 0.3 + index*0.15 }}
                                    >
                                    <div className="flex flex-col items-center justify-center text-black">
                                        <div className="w-24 h-24 rounded-full overflow-hidden inline-block">
                                            <img src={course['imglink']} alt="flag" className="w-full h-full object-cover" />
                                        </div>
                                        <h4 className="text-center">{course['country']} {course['level']}</h4>
                                    </div>
                                    </motion.div>
                                )
                            })}
                        </div> :

                            <h3 className={"text-gray-400 text-center"}>Du hast noch keine Station abgeschlossen!</h3>

                        }
                    </div>
                </div>
            </div>
        </div>

    </>


}

export default withAuth(Dashboard)