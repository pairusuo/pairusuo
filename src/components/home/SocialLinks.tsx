import Link from "next/link";
import { FaGithub } from "react-icons/fa";
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
        }
    ];

    return (
        <div className="flex items-center space-x-6">
            {socialLinks.map((link, index) => (
                <Link
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.label}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    aria-label={link.label}
                >
                    {link.icon}
                    <span className="sr-only">{link.label}</span>
                </Link>
            ))}
        </div>
    );
};
