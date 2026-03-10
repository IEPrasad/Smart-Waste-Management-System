import { useEffect } from 'react';

/**
 * Custom hook that triggers a callback when the Escape key is pressed.
 * @param {Function} onEscape - Function to call when Escape is pressed.
 * @param {boolean} active - Whether the listener should be active (e.g., when a modal is open).
 */
const useEscapeKey = (onEscape, active = true) => {
    useEffect(() => {
        if (!active) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onEscape();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onEscape, active]);
};

export default useEscapeKey;
