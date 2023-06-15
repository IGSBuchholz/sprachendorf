'use client';
import withAuth from "@/lib/authHOC"

function Dashboard({ user }) {


    return <><h2>Here comes the dashboard {JSON.stringify(user)}</h2></>
}

export default withAuth(Dashboard)