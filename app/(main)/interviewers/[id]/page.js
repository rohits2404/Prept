import { InterviewerProfile } from "@/modules/interviewers";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const InterviewerProfilePage = async ({ params }) => {
    const user = await currentUser();
    if (!user) redirect("/");

    return <InterviewerProfile params={params} />;
};

export default InterviewerProfilePage;
