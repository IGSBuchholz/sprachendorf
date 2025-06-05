'use client';

import {Suspense, useEffect, useState} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {useSearchParams} from "next/navigation";
import { Variants, motion } from "framer-motion";
import type { CourseCompletition } from "@prisma/client" // adjust this import if you have a shared type for completed courses
import { isBrowser } from "is-in-browser";

// Dynamically import the QR Scanner to avoid SSR issues
import { Scanner } from "@yudiel/react-qr-scanner";


const variants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export default function Page() {
    return <>
        <Suspense>
            <KioskPage></KioskPage>
        </Suspense>
    </>
}


function KioskPage() {
    const searchParams = useSearchParams();
    const key = searchParams.get("key") || "";

    const [scannedValue, setScannedValue] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [userData, setUserData] = useState<{
        name: string;
        email: string;
        coursesDone: CourseCompletition[];
    } | null>(null);

    // Reset state if the key changes (unlikely), or to allow re‐scanning
    useEffect(() => {
        setScannedValue(null);
        setErrorMessage(null);
        setUserData(null);
        setLoading(false);
    }, [key]);

    async function fetchUserData(qrString: string) {
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch("/api/getuserdata/kiosk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: key, qr: qrString }),
            });
            console.log("Status", response.status)
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            const data = await response.json();
            console.log("Status", JSON.stringify(data));
            // Expect data to have shape: { name, email, coursesDone: Array<{ country: string; level: number; imglink: string }> }
            if (!data || !data.coursesDone) {
                throw new Error("No user data returned");
            }

            setUserData(data);
        } catch (err) {
            console.error(err);
            setErrorMessage("Benutzerdaten konnten nicht abgerufen werden.");
        } finally {
            setLoading(false);
        }
    }

    function handleScan(result: any) {
        if (!result || !Array.isArray(result) || result.length === 0) {
            return;
        }
        const raw = result[0].rawValue as string;
        console.log(raw)
        // Verify format: must match "https://sprachendorf.igsbuchholz.de/user?id=..."
        const pattern = /^https:\/\/sprachendorf\.igsbuchholz\.de\/user\?id=.+$/;
        if (!pattern.test(raw)) {
            setErrorMessage("Ungültiges QR-Code-Format.");
            return;
        }

        // If already scanned same value, skip
        if (scannedValue === raw) {
            return;
        }

        setScannedValue(raw);
        fetchUserData(raw);
    }

    function handleError(err: any) {
        console.error("QR Scanner Fehler:", err);
        setErrorMessage("Scanner-Fehler.");
    }

    function resetScanning() {
        setScannedValue(null);
        setErrorMessage(null);
        setUserData(null);
        setLoading(false);
    }

    // @ts-ignore
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8 cursor-none">
            <div className="flex w-full justify-center space-x-8">
                {/* Left pane: QR Scanner */}
                <div className="bg-white rounded-lg shadow-md w-1/3 flex flex-col items-center justify-center p-8">
                <h2 className="text-xl font-semibold mb-4">QR-Code scannen</h2>
                <div className="w-full max-w-md">
                    <Scanner
                        formats={["qr_code"]}
                        onScan={handleScan}
                        //@ts-ignore
                        onError={handleError}
                    />
                </div>

                {errorMessage && (
                    <motion.div
                        className="mt-4 text-red-600 font-medium text-center"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                    >
                        {errorMessage}
                    </motion.div>
                )}

                {scannedValue && !loading && userData && (
                    <button
                        onClick={resetScanning}
                        className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Neuer Scan
                    </button>
                )}
            </div>

                {/* Right pane: User Data / Courses Done */}
                <div className="bg-white rounded-lg shadow-md w-2/3 flex flex-col items-center justify-start p-8">
                {loading && (
                    <motion.div
                        className="w-full max-w-lg bg-white rounded-lg shadow-md overflow-hidden p-6 animate-pulse"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        transition={{ duration: 0.3 }}
                    >
                        {/* Skeleton for user name */}
                        <div className="h-8 bg-gray-300 rounded mb-4"></div>
                        {/* Skeleton for email */}
                        <div className="h-4 bg-gray-300 rounded mb-6 w-3/4 mx-auto"></div>
                        {/* Skeleton for "Abgeschlossene Stationen" heading */}
                        <div className="h-6 bg-gray-300 rounded mb-4 w-1/2 mx-auto"></div>
                        {/* Skeleton placeholders for three course items */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-20 w-20 bg-gray-300 rounded-full mx-auto"></div>
                            <div className="h-20 w-20 bg-gray-300 rounded-full mx-auto"></div>
                            <div className="h-20 w-20 bg-gray-300 rounded-full mx-auto"></div>
                        </div>
                    </motion.div>
                )}

                {!loading && scannedValue && userData && (
                    <motion.div
                        className="w-full max-w-lg bg-white rounded-lg shadow-md overflow-hidden"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-black mb-4 text-center">
                                {userData.name}
                            </h2>
                            <p className="text-gray-700 mb-6 text-center">
                                {userData.email}
                            </p>

                            <h3 className="text-xl font-semibold text-black mb-4 text-center">
                                Abgeschlossene Stationen
                            </h3>

                            {userData.coursesDone.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4">
                                    {userData.coursesDone.map((course, idx) => {
                                        return (
                                            <motion.div
                                                key={`course-${idx}`}
                                                className="flex flex-col items-center justify-center"
                                                variants={variants}
                                                initial="initial"
                                                animate="animate"
                                                transition={{ duration: 0.3 + idx * 0.1 }}
                                            >
                                                <div className="w-20 h-20 rounded-full overflow-hidden mb-2 flex items-center justify-center">
                                                    <Image
                                                        //@ts-ignore
                                                        src={course.imglink}
                                                        alt={`${course.country} Flagge`}
                                                        width={80}
                                                        height={80}
                                                        className="object-cover object-center"
                                                    />
                                                </div>
                                                <p className="text-center text-sm font-medium">
                                                    {course.country} ({course.level})
                                                </p>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center">
                                    Keine abgeschlossenen Stationen gefunden.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                {!loading && scannedValue && !userData && !errorMessage && (
                    <motion.div
                        className="mt-4 text-red-600 font-medium text-center"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        transition={{ duration: 0.3 }}
                    >
                        Keine Benutzerdaten gefunden.
                    </motion.div>
                )}

                {!scannedValue && !loading && (
                    <motion.div
                        className="text-gray-500 mt-8 text-center"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        transition={{ duration: 0.3 }}
                    >
                        Bitte scannen Sie einen gültigen QR-Code.
                    </motion.div>
                )}
                </div>
            </div>
        </div>
    );
}