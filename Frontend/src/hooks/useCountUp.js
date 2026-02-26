import { useState, useEffect } from 'react';

/**
 * useCountUp Hook
 * Animates a number from 0 to target over a specified duration.
 * 
 * @param {number} end - Target value
 * @param {number} duration - Animation duration in ms
 * @returns {number} - Current count value
 */
export const useCountUp = (end, duration = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Using easeOutExpo for a smooth feel
            const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setCount(Math.floor(easedProgress * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return count;
};
