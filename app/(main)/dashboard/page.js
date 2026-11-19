import { InterviewerDashboard } from "@/modules/dashboard";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

const InterviewDashboardPage = async () => {
    const user = await currentUser();
    if (!user) redirect("/");

    return <InterviewerDashboard />;
};

export default InterviewDashboardPage;
