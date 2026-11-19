"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import emailjs from "@emailjs/nodejs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const sendWithdrawalEmail = async ({
    interviewerName,
    interviewerEmail,
    credits,
    platformFee,
    netAmount,
    paymentMethod,
    paymentDetail,
    reviewUrl,
}) => {
    const {
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        EMAILJS_PUBLIC_KEY,
        EMAILJS_PRIVATE_KEY,
    } = process.env;

    if (
        !EMAILJS_SERVICE_ID ||
        !EMAILJS_TEMPLATE_ID ||
        !EMAILJS_PUBLIC_KEY ||
        !EMAILJS_PRIVATE_KEY
    ) {
        throw new Error("EmailJS Environment Variables Are Missing");
    }

    if (!ADMIN_EMAIL) {
        throw new Error("Admin Email Is Not Configured");
    }

    const templateParams = {
        to_email: ADMIN_EMAIL,
        interviewer_name: interviewerName,
        interviewer_email: interviewerEmail,
        credits: String(credits),
        platform_fee: platformFee.toFixed(2),
        net_amount: netAmount.toFixed(2),
        payment_method: paymentMethod,
        payment_detail: paymentDetail,
        review_url: reviewUrl,
    };

    const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        {
            publicKey: EMAILJS_PUBLIC_KEY,
            privateKey: EMAILJS_PRIVATE_KEY,
        },
    );

    return response;
};

export const setAvailability = async ({ startTime, endTime }) => {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await db.user.findUnique({
        where: { clerkUserId: user.id },
    });

    if (!dbUser || dbUser.role !== "INTERVIEWER") {
        throw new Error("Forbidden");
    }

    if (!startTime || !endTime) {
        throw new Error("Start And End Time Required");
    }

    if (new Date(startTime) >= new Date(endTime)) {
        throw new Error("Start Time Must Be Before End Time");
    }

    try {
        const existing = await db.availability.findFirst({
            where: {
                interviewerId: dbUser.id,
                status: "AVAILABLE",
            },
        });

        if (existing) {
            await db.availability.update({
                where: { id: existing.id },
                data: {
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                },
            });
        } else {
            await db.availability.create({
                data: {
                    interviewerId: dbUser.id,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    status: "AVAILABLE",
                },
            });
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        console.error("Availability Error:", err);
        throw new Error("Failed To Save Availability");
    }
};

export const getAvailability = async () => {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await db.user.findUnique({
        where: { clerkUserId: user.id },
    });

    if (!dbUser) throw new Error("User Not Found");

    return db.availability.findFirst({
        where: {
            interviewerId: dbUser.id,
            status: "AVAILABLE",
        },
    });
};

export const getInterviewerAppointments = async () => {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await db.user.findUnique({
        where: { clerkUserId: user.id },
    });

    if (!dbUser) throw new Error("User Not Found");

    return db.booking.findMany({
        where: {
            interviewerId: dbUser.id,
        },
        include: {
            interviewee: {
                select: {
                    name: true,
                    imageUrl: true,
                    email: true,
                },
            },
            feedback: true,
        },
        orderBy: {
            startTime: "desc",
        },
    });
};

export const getInterviewerStats = async () => {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await db.user.findUnique({
        where: {
            clerkUserId: user.id,
        },
        select: {
            creditBalance: true,
            creditRate: true,
            bookingsAsInterviewer: {
                where: {
                    status: "COMPLETED",
                },
                select: {
                    creditsCharged: true,
                },
            },
        },
    });

    if (!dbUser) throw new Error("User Not Found");

    const totalEarned = dbUser.bookingsAsInterviewer.reduce(
        (sum, booking) => sum + booking.creditsCharged,
        0,
    );

    return {
        creditBalance: dbUser.creditBalance,
        creditRate: dbUser.creditRate,
        totalEarned,
        completedSessions: dbUser.bookingsAsInterviewer.length,
    };
};

export const requestWithdrawal = async ({
    credits,
    paymentMethod,
    paymentDetail,
}) => {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await db.user.findUnique({
        where: {
            clerkUserId: user.id,
        },
    });

    if (!dbUser || dbUser.role !== "INTERVIEWER") {
        throw new Error("Forbidden");
    }

    if (
        typeof credits !== "number" ||
        !Number.isFinite(credits) ||
        credits <= 0
    ) {
        throw new Error("Invalid Credit Amount");
    }

    if (credits > dbUser.creditBalance) {
        throw new Error("Insufficient Credit Balance");
    }

    if (
        typeof paymentMethod !== "string" ||
        !paymentMethod.trim() ||
        typeof paymentDetail !== "string" ||
        !paymentDetail.trim()
    ) {
        throw new Error("Payment Details Required");
    }

    const PLATFORM_FEE = 0.2;
    const netAmount = credits * (1 - PLATFORM_FEE) * 5;
    const platformFee = credits * PLATFORM_FEE * 5;

    try {
        const [payout] = await db.$transaction([
            db.payout.create({
                data: {
                    interviewerId: dbUser.id,
                    credits,
                    platformFee,
                    netAmount,
                    paymentMethod: paymentMethod.trim(),
                    paymentDetail: paymentDetail.trim(),
                    status: "PROCESSING",
                },
            }),

            db.user.update({
                where: {
                    id: dbUser.id,
                },
                data: {
                    creditBalance: {
                        decrement: credits,
                    },
                },
            }),
        ]);

        try {
            const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payout/${payout.id}`;

            await sendWithdrawalEmail({
                interviewerName: dbUser.name ?? "Unknown",
                interviewerEmail: dbUser.email,
                credits,
                platformFee,
                netAmount,
                paymentMethod: paymentMethod.trim(),
                paymentDetail: paymentDetail.trim(),
                reviewUrl,
            });
        } catch (emailErr) {
            console.error("Withdrawal EmailJS Failed:", emailErr);
        }

        revalidatePath("/dashboard");

        return {
            success: true,
            netAmount,
        };
    } catch (err) {
        console.error("Withdrawal Request Error:", err);
        throw new Error("Withdrawal Request Failed");
    }
};

export const getWithdrawalHistory = async () => {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await db.user.findUnique({
        where: {
            clerkUserId: user.id,
        },
    });

    if (!dbUser) throw new Error("User Not Found");

    return db.payout.findMany({
        where: {
            interviewerId: dbUser.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
