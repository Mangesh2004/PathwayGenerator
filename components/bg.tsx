'use client'
import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

const Background = () => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
            setInit(true);
        });
    }, []);

    const particlesLoaded = useCallback(async (container?: Container) => {
        if (!container) return;
        console.log("Particles container loaded", container);
    }, []);

    return (
        init && (
            <Particles
                id="tsparticles"
                particlesLoaded={particlesLoaded}
                options={{
                    background: {
                        color: {
                            value: "#000000",
                        },
                    },
                    particles: {
                        color: {
                            value: "#ffffff",
                        },
                        links: {
                            color: "#ffffff",
                            distance: 150,
                            enable: true,
                            opacity: 0.5,
                            width: 1,
                        },
                        move: {
                            enable: true,
                            speed: 2,
                        },
                        number: {
                            value: 80,
                            density: {
                                enable: true,
                                //@ts-ignore
                                area: 800,
                            },
                        },
                        opacity: {
                            value: 0.5,
                        },
                        size: {
                            value: { min: 1, max: 3 },
                        },
                    },
                    interactivity: {
                        events: {
                            onClick: {
                                enable: true,
                                mode: "push",
                            },
                            onHover: {
                                enable: true,
                                mode: "repulse",
                            },
                        },
                    },
                    detectRetina: true,
                }}
            />
        )
    );
};

export default Background;