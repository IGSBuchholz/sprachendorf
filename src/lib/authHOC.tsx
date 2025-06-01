//@ts-ignore
'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from '@prisma/client'
import {roleIsGreaterOrEqual} from "@/lib/user/usermanager";



//@ts-ignore
const withAuth = (WrappedComponent, neededRole: Role = 'USER') => {
    //@ts-ignore
    // eslint-disable-next-line react/display-name
  return (props) => {
    const router = useRouter();
    const [user, setUser] = useState()
    const [isVerifying, setIsVerifying] = useState(true)


    useEffect(() => {

        const verifyLogin = async () => {
            const response = await fetch('/api/session'); // replace with your API endpoint
            console.log(response.status)
            if (response.status == 200) {
                const data = await response.json();
                console.log(data.user);
                setUser(data.user);
                setIsVerifying(false);
                if(!roleIsGreaterOrEqual(data.user.role, neededRole)){
                    router.replace('/loggedin/dashboard')
                }
            } else {
                router.replace("/login"); // replace with your login route
            }
        }

        verifyLogin()

    }, [router])

    if(isVerifying){
        return <div className="flex justify-center items-center h-screen bg-white">
            <div className="inline-flex animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
    }
//@ts-ignore
    return <WrappedComponent {...props} user={user}/>;
  };
};

export default withAuth;
