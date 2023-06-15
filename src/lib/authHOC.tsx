//@ts-ignore
'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
//@ts-ignore
const withAuth = (WrappedComponent) => {
    //@ts-ignore
    // eslint-disable-next-line react/display-name
  return (props) => {
    const router = useRouter();
    const [user, setUser] = useState()
    const [isVerifying, setIsVerifying] = useState()


    useEffect(() => {

        const verifyLogin = async () => {
            const response = await fetch('/api/session'); // replace with your API endpoint
            console.log(response.status)
            if (response.status == 200) {
                const data = await response.json();
                console.log(data.user);
                setUser(data.user);
            } else {
                router.replace("/login"); // replace with your login route
            }
        }

        verifyLogin()

    }, [router])

    if(isVerifying){
        return <div className="flex justify-center items-center h-screen">
        <div className="inline-flex animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }
//@ts-ignore
    return <WrappedComponent {...props} user={user}/>;
  };
};

export default withAuth;
