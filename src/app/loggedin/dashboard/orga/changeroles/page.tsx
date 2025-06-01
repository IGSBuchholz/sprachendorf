'use client';
import withAuth from "@/lib/authHOC";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, Variants } from 'framer-motion';
import { User, Role } from "@prisma/client";

// Dynamically import the QR Scanner
// @ts-ignore
import { Scanner } from "@yudiel/react-qr-scanner";

const variants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

interface ScannerRoleProps {
    user: User & { role: Role };
}

function ScannerRoleComp({ user }: ScannerRoleProps) {
    // Step management:
    // 0 = loading users
    // 1 = search / list users
    // 2 = QR scanning
    // 3 = choose new role
    // 4 = confirm change
    // 5 = done / success
    const [step, setStep] = useState<number>(0);

    // List of all users (mocked or fetched)
    const [users, setUsers] = useState<User[]>([]);
    // Filtered users based on search input
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortOption, setSortOption] = useState<string>("email");

    // The user selected (either by clicking or scanning)
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(false);
    const isSelf = selectedUser?.email == user.email;

    // The new role chosen
    const [newRole, setNewRole] = useState<Role | null>(null);

    // Define the ordered roles for ranking
    const allRoles: Role[] = [Role.USER, Role.HELPER, Role.TEACHER, Role.ADMIN];
    // Determine the numeric rank of a role
    const roleRank = (r: Role) => allRoles.indexOf(r);

    // Compute which roles this “user” (logged-in helper/teacher/admin) is allowed to assign:
    // all roles whose rank ≤ own rank
    const allowableRoles: Role[] = useMemo(() => {
        const ownRank = roleRank(user.role);
        return allRoles.filter((r) => roleRank(r) <= ownRank);
    }, [user.role]);

    // Effect: fetch or mock the list of users once on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/getuserdata', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                });
                if (!res.ok) throw new Error("Failed to fetch users");
                const usersData: User[] = await res.json();
                setUsers(usersData);
                setFilteredUsers(usersData);
                setStep(2);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    // Update the filteredUsers whenever the searchTerm changes
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredUsers(users);
        } else {
            const lower = searchTerm.trim().toLowerCase();
            setFilteredUsers(
                users.filter(
                    (u) =>
                        u.email.toLowerCase().includes(lower) ||
                        //@ts-ignore
                        u.role.toLowerCase().includes(lower)
                )
            );
        }
    }, [searchTerm, users]);

    // Handler when a user is selected from the list
    async function handleSelectUser(u: User) {
        setIsLoadingUserData(true);
        try {
            const res = await fetch(`/api/getuserdata`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: u.email }),
            });
            if (!res.ok) throw new Error("Failed to fetch user data");
            const data: User = await res.json();
            setSelectedUser(data);
            setStep(3);
        } catch (error) {
            console.error("Error loading user data:", error);
            setSelectedUser(null);
        } finally {
            setIsLoadingUserData(false);
        }
    }

    // Handler when QR scan yields a result
    async function handleScan(result: any) {
        if (result) {
            // Assume the QR code contains the user’s email string
            let scannedEmail = (result[0].rawValue as string).split("....")[1];
            scannedEmail = scannedEmail.replace("%40", "@");
            if (!scannedEmail.endsWith("@igs-buchholz.de")) {
                console.error("invalid email");
                return;
            }
            setStep(3);
            setIsLoadingUserData(true);
            try {
                const res = await fetch(`/api/getuserdata`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: scannedEmail }),
                });
                if (!res.ok) throw new Error("Failed to fetch user data");
                const data: User = await res.json();
                console.log("User", data)
                setSelectedUser(data);
            } catch (error) {
                console.error("Error loading scanned user data:", error);
                setSelectedUser(null);
            } finally {
                setIsLoadingUserData(false);
            }
        }
    }

    // Handler when scanning sees an error (optional)
    function handleError(err: any) {
        console.error("QR Scanner error:", err);
    }

    // Handler to submit the role change (mock)
    async function submitRoleChange() {
        if (!selectedUser || !newRole) return;
        try {
            const res = await fetch('/api/changerole', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: selectedUser.email, newRole }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to change role');
            }
            setStep(5);
        } catch (error) {
            console.error("Error changing role:", error);
        }
    }

    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
        <>
            {step === 0 && (
                <div className="flex justify-center items-center h-screen bg-white">
                    <div className="inline-flex animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            )}

            {step === 1 && (
                <motion.div
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    <div className="min-h-screen flex flex-col items-center justify-start bg-white py-12 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-xl w-full bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-3xl font-extrabold text-black mb-6">
                                    Nutzer auswählen
                                </h2>

                                <input
                                    type="text"
                                    placeholder="Name oder E-Mail suchen..."
                                    className="w-full border border-gray-300 text-black rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="w-full border border-gray-300 text-black rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="email">Sortiere nach E-Mail (A–Z)</option>
                                    <option value="role">Sortiere nach Rolle</option>
                                </select>

                                <div className="max-h-64 overflow-y-auto">
                                {[...filteredUsers]
                                    .sort((a, b) =>
                                        sortOption === "email"
                                            ? a.email.localeCompare(b.email)
                                            //@ts-ignore
                                            : a.role.localeCompare(b.role)
                                    )
                                    .map((u, idx) => (
                                        <motion.div
                                            key={u.id}
                                            variants={variants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            transition={{ duration: 0.3 + idx * 0.1 }}
                                        >
                                            <div
                                                className={`drop-shadow-md bg-white mt-2 rounded-xl ${
                                                    isLoadingUserData ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer"
                                                } border border-gray-200`}
                                                onClick={() => !isLoadingUserData && handleSelectUser(u)}
                                            >
                                                <div className="text-black py-4 px-4">
                                                    <h3 className="font-medium">{u.email}</h3>
                                                    <p className="text-xs text-gray-500">
                                                        Rolle:{' '}
                                                        <span
                                                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                                                u.role === Role.ADMIN
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : u.role === Role.TEACHER
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : u.role === Role.HELPER
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {u.role}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div
                                    variants={variants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.8 }}
                                >
                                    <button
                                        onClick={() => setStep(2)}
                                        className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                                    >
                                        QR-Code scannen
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-3xl font-extrabold text-black mb-8">
                                    QR-Code scannen
                                </h2>
                                <div className="flex justify-center">
                                    {/* @ts-ignore */}
                                    <Scanner
                                        onScan={handleScan}
                                        // @ts-ignore
                                        onError={handleError}
                                        formats={['qr_code']}
                                    />
                                </div>
                                <button
                                    onClick={() => setStep(1)}
                                    className="mt-6 w-full bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400"
                                >
                                    Stattdessen Nutzerliste verwenden
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {step === 3 && selectedUser && (
                <motion.div
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-3xl font-extrabold text-black mb-6">
                                    Rolle ändern für:
                                </h2>
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium text-black">
                                        {selectedUser.email}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Aktuelle Rolle:{" "}
                                        {isLoadingUserData ? (
                                            <div className="inline-block h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        ) : (
                                            selectedUser?.role
                                        )}
                                    </p>
                                </div>

                                <h3 className="text-xl font-semibold text-black mb-4">
                                    Neue Rolle wählen
                                </h3>
                                {isSelf && (
                                    <p className="text-sm text-red-500 mb-4">
                                        Du kannst deine eigene Rolle nicht ändern.
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-4">
                                    {allowableRoles.map((r, idx) => (
                                        <motion.div
                                            key={r}
                                            variants={variants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            transition={{ duration: 0.3 + idx * 0.1 }}
                                        >
                                            <button
                                                onClick={() => setNewRole(r)}
                                                disabled={isSelf || r === selectedUser.role}
                                                className={`px-4 py-3 rounded-full border-2 ${
                                                    isSelf || r === selectedUser.role
                                                        ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                                        : newRole === r
                                                        ? "border-blue-500 bg-blue-100 text-blue-700"
                                                        : "border-gray-300 bg-white text-black hover:bg-gray-100"
                                                }`}
                                            >
                                                {r.replace("USER", "SCHÜLER")
                                                  .replace("HELPER", "FREIWILLIGER")
                                                  .replace("TEACHER", "LEHRER")}
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={() => {
                                            setSelectedUser(null);
                                            setNewRole(null);
                                            setStep(1);
                                        }}
                                        className="w-1/2 mr-2 bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400"
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        onClick={() => setStep(4)}
                                        disabled={isLoadingUserData || !newRole || isSelf}
                                        className={`w-1/2 ml-2 py-2 rounded-lg ${
                                            isLoadingUserData || !newRole || isSelf
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                : "bg-blue-500 text-white hover:bg-blue-600"
                                        }`}
                                    >
                                        Weiter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {step === 4 && selectedUser && newRole && (
                <motion.div
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-3xl font-extrabold text-black mb-6">
                                    Änderungen bestätigen
                                </h2>
                                <div className="mb-6 space-y-3">
                                    <p className="text-black">
                                        <span className="font-semibold">Nutzer:</span>{" "}
                                        {selectedUser.email}
                                    </p>
                                    <p className="text-black">
                                        <span className="font-semibold">Aktuelle Rolle:</span>{" "}
                                        <span
                                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                                selectedUser.role === Role.ADMIN
                                                    ? 'bg-red-100 text-red-800'
                                                    : selectedUser.role === Role.TEACHER
                                                    ? 'bg-green-100 text-green-800'
                                                    : selectedUser.role === Role.HELPER
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {selectedUser.role}
                                        </span>
                                    </p>
                                    <p className="text-black">
                                        <span className="font-semibold">Neue Rolle:</span>{" "}
                                        <span
                                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                                newRole === Role.ADMIN
                                                    ? 'bg-red-100 text-red-800'
                                                    : newRole === Role.TEACHER
                                                    ? 'bg-green-100 text-green-800'
                                                    : newRole === Role.HELPER
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {newRole}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setStep(3)}
                                        className="w-1/2 mr-2 bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400"
                                    >
                                        Zurück
                                    </button>
                                    <button
                                        onClick={submitRoleChange}
                                        className="w-1/2 ml-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                                    >
                                        Bestätigen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {step === 5 && (
                <motion.div
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-sm w-full bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6 text-center">
                                <h2 className="text-2xl font-extrabold text-green-600 mb-4">
                                    Rolle erfolgreich geändert!
                                </h2>
                                <p className="text-black mb-6">
                                    {selectedUser?.email} hat nun die Rolle <b>{newRole}</b>.
                                </p>
                                <button
                                    onClick={() => {
                                        // Reset to initial state
                                        setSelectedUser(null);
                                        setNewRole(null);
                                        setStep(1);
                                    }}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                                >
                                    Zurück zur Nutzerliste
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
}

export default withAuth(ScannerRoleComp, Role.TEACHER);