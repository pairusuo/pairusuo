
"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TypewriterTitle } from '@/components/TypewriterTitle';
import { SocialLinks } from './SocialLinks'; // Ensure path is correct
import { 
    SiReact, SiNextdotjs, SiTailwindcss, SiTypescript, SiNodedotjs, SiDocker,
    SiCloudflare, SiSupabase, SiShadcnui, SiVercel, SiGithub,
    SiMysql, SiPostgresql, SiPython, SiPhp, SiLinux
} from 'react-icons/si';

// Define the icons data outside component to avoid re-creation
// Distributing icons in a cloud/orbit pattern
const techStackIcons = [
    // Center/Inner Circle
    { Icon: SiReact, color: "#61DAFB", x: -60, y: -40, delay: 0 },
    { Icon: SiNextdotjs, color: "var(--foreground)", x: 60, y: -40, delay: 0.1 },
    { Icon: SiTailwindcss, color: "#38B2AC", x: 0, y: 70, delay: 0.2 },
    
    // Middle Circle
    { Icon: SiTypescript, color: "#3178C6", x: -90, y: 30, delay: 0.3 },
    { Icon: SiNodedotjs, color: "#339933", x: 90, y: 30, delay: 0.4 },
    { Icon: SiDocker, color: "#2496ED", x: 0, y: -90, delay: 0.5 },

    // Outer Circle / scattered
    { Icon: SiCloudflare, color: "#F38020", x: -90, y: -80, delay: 0.6 },
    { Icon: SiSupabase, color: "#3ECF8E", x: 90, y: -80, delay: 0.7 },
    { Icon: SiShadcnui, color: "var(--foreground)", x: -50, y: 100, delay: 0.8 },
    { Icon: SiVercel, color: "var(--foreground)", x: 50, y: 100, delay: 0.9 },
    { Icon: SiGithub, color: "var(--foreground)", x: 120, y: -20, delay: 1.0 },

    // 数据库与后端语言 (Database & Backend Languages)
    { Icon: SiMysql, color: "#4479A1", x: 0, y: 0, delay: 0 },
    { Icon: SiPostgresql, color: "#336791", x: 0, y: 0, delay: 0 },
    { Icon: SiPython, color: "#3776AB", x: 0, y: 0, delay: 0 },
    { Icon: SiPhp, color: "#777BB4", x: 0, y: 0, delay: 0 },
    { Icon: SiLinux, color: "#FCC624", x: 0, y: 0, delay: 0 },
];

export const HeroSection = ({ 
    title, 
    introDescription, 
    features 
}: { 
    title: string; 
    introDescription: string;
    features: string[];
}) => {
    console.log('HeroSection rendering', { title, features });
    return (
        <section className="relative flex flex-col md:flex-row items-center justify-between py-12 md:py-20">
             {/* Left Content */}
             <div 
                className="w-full md:w-1/2 flex flex-col items-start z-10"
            >
                 <div className="flex items-center gap-2 mb-4">
                     <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-slate-800 to-gray-500 dark:from-slate-100 dark:via-slate-300 dark:to-gray-400 whitespace-nowrap">
                        {title}
                     </h1>
                     <motion.span 
                        className="text-4xl md:text-5xl lg:text-7xl cursor-default origin-bottom-right inline-block"
                        animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                        transition={{
                            duration: 2.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: 1
                        }}
                     >
                        👋
                     </motion.span>
                 </div>
                 
                 <div className="text-xl md:text-2xl font-medium text-foreground mt-2 mb-6 h-10">
                     <TypewriterTitle strings={features} />
                 </div>

                 <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mb-8">
                     {introDescription}
                 </p>

                 <SocialLinks />
            </div>

            {/* Right Visual / Tech Stack */}
            <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center mt-10 md:mt-0 perspective-1000 md:translate-x-12">
                {/* Central Character/Logo */}
                <div
                    className="relative z-10"
                >
                     <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-background shadow-2xl">
                         <Image 
                            src="/info.png"
                            alt="Pairusuo Avatar"
                            fill
                            className="object-cover"
                            priority
                         />
                     </div>
                </div>

                {/* Spherical Tech Icons Cloud */}
                <IconCloud icons={techStackIcons} />
            </div>
        </section>
    );
};

// Helper Component for the 3D Cloud
// Separated to keep the main component clean and handle its own animation loop
function IconCloud({ icons }: { icons: any[] }) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [points, setPoints] = React.useState<{x: number, y: number, z: number, scale: number, opacity: number, icon: any}[]>([]);
    
    // Configuration
    const radius = 230; // Radius of the sphere
    const rotationSpeed = 0.005; // Increased speed for better visibility

    React.useEffect(() => {
        // Initialize points on a Fibonacci Sphere for even distribution
        const numPoints = icons.length;
        const initialPoints = icons.map((icon, i) => {
            const phi = Math.acos(-1 + (2 * i) / numPoints);
            const theta = Math.sqrt(numPoints * Math.PI) * phi;
            return {
                x: radius * Math.cos(theta) * Math.sin(phi),
                y: radius * Math.sin(theta) * Math.sin(phi),
                z: radius * Math.cos(phi),
                icon: icon
            };
        });

        let animationFrameId: number;
        let angleX = 0;
        let angleY = 0;

        const animate = () => {
            // Constant rotation
            angleX += rotationSpeed;
            angleY += rotationSpeed;

            // Rotation Matrices
            const cx = Math.cos(angleX);
            const sx = Math.sin(angleX);
            const cy = Math.cos(angleY);
            const sy = Math.sin(angleY);

            const rotatedPoints = initialPoints.map(p => {
                // Rotate around X (optional, usually we just rotate Y for carousel, but for sphere we want complex rotation)
                // Let's do a simple combined rotation logic
                // Rotate Y first
                let x = p.x * cy - p.z * sy;
                let z = p.z * cy + p.x * sy;
                let y = p.y;

                // Rotate X
                let y2 = y * cx - z * sx;
                let z2 = y * sx + z * cx;
                
                // Update new positions
                const projectedX = x;
                const projectedY = y2;
                const projectedZ = z2;

                // Calculate visual properties
                // z ranges from -radius to +radius
                const scale = (projectedZ + radius * 2) / (radius * 2.5); // 0.something to 1.something
                const opacity = Math.max(0.2, (projectedZ + radius) / (radius * 2)); // Fade out back

                return {
                    x: projectedX,
                    y: projectedY,
                    z: projectedZ,
                    scale: scale,
                    opacity: opacity,
                    icon: p.icon
                };
            });

            // Update state
            // For 10 items, setState at 60fps is acceptable in modern React. 
            // If perf issues, would move to direct DOM manipulation or refs.
            setPoints(rotatedPoints);
            
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationFrameId);
    }, [icons]);

    return (
        <>
            {points.map((point, index) => (
                 <div
                    key={index}
                    className="absolute left-1/2 top-1/2 flex items-center justify-center will-change-transform"
                    style={{
                        transform: `translate3d(${point.x}px, ${point.y}px, 0) scale(${point.scale})`,
                        zIndex: point.z > 0 ? 20 : 1,
                        opacity: point.opacity,
                        marginLeft: '-25px',
                        marginTop: '-25px'
                    }}
                 >
                      <div className="bg-background/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-border/50">
                         <point.icon.Icon size={24} style={{ color: point.icon.color }} className="dark:brightness-150 dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-300" />
                      </div>
                 </div>
            ))}
        </>
    );
}
