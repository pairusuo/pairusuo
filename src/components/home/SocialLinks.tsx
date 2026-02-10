import Link from "next/link";
import Image from "next/image";
import { FaGithub, FaWeixin, FaLink } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export const SocialLinks = () => {
    const socialLinks = [
        {
            icon: <FaGithub size="20" />,
            href: "https://github.com/pairusuo",
            label: "GitHub"
        },
        {
            icon: <FaXTwitter size="20" />,
            href: "https://x.com/pairusuo",
            label: "Twitter"
        },
        {
            icon: <FaWeixin size="20" />,
            href: "#", 
            label: "WeChat",
            isWeChat: true
        },
         {
            icon: <FaLink size="20" />,
            href: "https://web.okjike.com/u/73318647-5E08-4953-BBF2-FCA9A166A70E",
            label: "Jike"
        }
    ];

    return (
        <div className="flex items-center space-x-6">
            {socialLinks.map((link, index) => {
                if (link.isWeChat) {
                    return (
                        <div key={index} className="relative group">
                            <button
                                className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center"
                                aria-label={link.label}
                            >
                                {link.icon}
                            </button>
                            {/* QR Code Popup */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block transition-all duration-300 opacity-0 group-hover:opacity-100 z-50">
                                <div className="bg-white p-2 rounded-lg shadow-xl border border-border">
                                    <div className="relative w-32 h-32">
                                        <Image
                                            src="/qrcode.jpg"
                                            alt="WeChat QR Code"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-white"></div>
                            </div>
                        </div>
                    );
                }

                return (
                    <Link 
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                        aria-label={link.label}
                    >
                        {link.icon}
                    </Link>
                );
            })}
        </div>
    );
};
