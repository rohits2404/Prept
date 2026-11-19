import { MyAppointments } from "@/modules/appointments";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

const MyAppointmentsPage = async () => {
    const user = await currentUser();
    if (!user) redirect("/");

    return <MyAppointments />;
};

export default MyAppointmentsPage;
