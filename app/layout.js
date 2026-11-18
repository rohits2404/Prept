import { Lora, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const lora = Lora({
    subsets: ["latin"],
    weight: ["400", "500"],
    style: ["normal", "italic"],
    variable: "--font-serif",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
    variable: "--font-sans",
});

export const metadata = {
    title: "Prept | AI-Powered Interview Preparation Platform",
    description:
        "Prepare For Your Dream Job With Prept, An AI-Powered Interview Platform. Practice Mock Interviews, Improve Your Communication Skills, And Build Confidence With Personalized AI-Driven Feedback.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${lora.variable} ${dmSans.variable} font-sans`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <main className="min-h-screen">{children}</main>
                    <Toaster richColors />
                </ThemeProvider>
            </body>
        </html>
    );
}
