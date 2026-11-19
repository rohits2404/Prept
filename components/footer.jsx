import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="border-t border-white/10 bg-[#080809]">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 py-7 flex flex-col sm:flex-row items-center justify-between gap-5">
                {/* Logo */}
                <Link href="/">
                    <Image
                        src="/logo.png"
                        alt="Prept Logo"
                        width={100}
                        height={100}
                        className="h-9 w-auto"
                    />
                </Link>

                {/* Links */}
                <div className="flex items-center gap-6 text-xs text-stone-500">
                    <Link
                        href="/explore"
                        className="hover:text-amber-400 transition"
                    >
                        Explore
                    </Link>
                    <Link
                        href="/onboarding"
                        className="hover:text-amber-400 transition"
                    >
                        Get Started
                    </Link>
                    <Link
                        href="/privacy"
                        className="hover:text-amber-400 transition"
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/terms"
                        className="hover:text-amber-400 transition"
                    >
                        Terms
                    </Link>
                </div>

                {/* Copyright */}
                <p className="text-xs text-stone-600">
                    © {new Date().getFullYear()} Prept. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};
