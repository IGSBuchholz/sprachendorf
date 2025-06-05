'use client';
import withAuth from "@/lib/authHOC"
import QRCode from "react-qr-code";
import {useEffect, useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {UserSession} from "@/lib/usersession";
import Link from "next/link";
import {Variants, motion} from "framer-motion";
import {boolean} from "drizzle-orm/pg-core";
import {Role} from "@prisma/client";
import {useSession} from "next-auth/react";
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import {ExportButton} from "@/lib/exportpdf";
import {Suspense} from "react";

const variants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

//@ts-ignore
function Dashboard() {

    const { data: session, status } = useSession();

    const [user, setUser] = useState<UserSession>({email: "", role: "USER", startcountry: "", name: ""});



    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [coursesDone, setCoursesDone] = useState([]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [events, setEvents] = useState({
        showPDF: false,
        cleanUp: false
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {

        if(!session){
            return;
        }
        setUser(session?.user as UserSession);

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

    }, [session])

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();

    const getEmoji = (niveau: number) => {
        if (niveau === 3) return "⭐️";
        if (niveau === 2) return "😁";
        if (niveau === 1) return "";
        return "";
    };

    return <>
        <div className={"min-h-screen bg-white"}>
            <div className="flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 mb-6">
                        <h2 className="text-3xl font-extrabold text-black mb-8 text-center flex items-center justify-center">
                            {user.name}
                            <button onClick={() => signOut()} className="ml-2 text-gray-500 hover:text-gray-700">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </h2>
                        {user.email ? <QRCode level={"L"} className="mx-auto" value={`....${user.email}`}></QRCode> : ""}
                    </div>
                </div>
            </div>

            {user.role != Role.USER ?
                <div className="flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                    <Link href={'/loggedin/orga/scanner'} className="max-w-md w-full bg-blue-500 rounded-lg shadow-md overflow-hidden py-6 text-center cursor-pointer hover:scale-110">
                        Kurse-Verifizieren
                    </Link>
                </div>
                : ""}

            {(user.role == (Role.TEACHER) || user.role == Role.ADMIN) ?
                <div className="flex items-center justify-center bg-white pb-12 px-4 sm:px-6 lg:px-8">
                    <Link href={'/loggedin/orga/changeroles'}
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
                                        <h4 className="text-center">{course['country']} {course['level']} {getEmoji(course['niveau'])}</h4>
                                    </div>
                                    </motion.div>
                                )
                            })}
                        </div> :

                            <h3 className={"text-gray-400 text-center"}>Du hast noch keine Station abgeschlossen!</h3>

                        }
                        <Suspense>
                            <ExportButton coursesDone={coursesDone} usersname={user.name}></ExportButton>
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>

    </>


}

export default Dashboard