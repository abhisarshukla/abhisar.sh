import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useRef, useState } from "react";

export default function HeroShader() {
    const [frame, setFrame] = useState(0);
    const r = useRef({ current: 0, target: 0, lastMove: 0, raf: 0 });

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            r.current.target = (e.clientX / window.innerWidth) * 8000;
            r.current.lastMove = Date.now();
        };

        const tick = () => {
            const isActive = Date.now() - r.current.lastMove < 2000;

            if (isActive) {
                // Lerp toward mouse-driven target
                r.current.current +=
                    (r.current.target - r.current.current) * 0.04;
            } else {
                // Slow auto-drift when idle or on mobile
                r.current.current += 0.4;
            }

            setFrame(r.current.current | 0);
            r.current.raf = requestAnimationFrame(tick);
        };

        window.addEventListener("mousemove", onMouseMove, { passive: true });
        r.current.raf = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            cancelAnimationFrame(r.current.raf);
        };
    }, []);

    return (
        <MeshGradient
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: 0.22 }}
            colors={["#0d1a2e", "#130d24", "#1e0c12", "#131211", "#13100a"]}
            speed={0}
            frame={frame}
        />
    );
}
