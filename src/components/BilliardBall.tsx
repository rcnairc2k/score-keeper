import React from 'react';

interface BilliardBallProps {
    number: number;
    size?: string;
    className?: string;
}

export const BilliardBall: React.FC<BilliardBallProps> = ({ number, size = 'w-12 h-12', className = '' }) => {
    // Standard Pool Ball Colors
    const colors: Record<number, string> = {
        1: '#EAB308', // Yellow
        2: '#2563EB', // Blue
        3: '#DC2626', // Red
        4: '#7E22CE', // Purple
        5: '#F97316', // Orange
        6: '#16A34A', // Green
        7: '#991B1B', // Maroon
        8: '#000000', // Black
        9: '#EAB308', // Yellow
        10: '#2563EB', // Blue
        11: '#DC2626', // Red
        12: '#7E22CE', // Purple
        13: '#F97316', // Orange
        14: '#16A34A', // Green
        15: '#991B1B', // Maroon
    };

    const isStripe = number > 8;
    const color = colors[number] || '#374151';

    // Base ball style (white for stripe, color for solid)
    const baseBackground = isStripe ? '#fdfdfd' : color;

    return (
        <div
            className={`${size} rounded-full shadow-md relative flex items-center justify-center shrink-0 ${className}`}
            style={{
                background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 15%, transparent 50%), ${baseBackground}`,
                boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.4)'
            }}
        >
            {/* Stripe Band */}
            {isStripe && (
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, transparent 38%, ${color} 40%, ${color} 65%, transparent 67%)`,
                        transform: 'rotate(45deg)'
                    }}
                />
            )}

            {/* White Circle Container for Number */}
            <div
                className="w-[50%] h-[50%] bg-white rounded-full flex items-center justify-center z-10 relative shadow-sm"
                style={{
                    backgroundColor: '#fffdf0' // slightly off-white like real balls
                }}
            >
                <span className="text-black font-bold font-mono leading-none" style={{ fontSize: '100%' }}>
                    {number}
                </span>
            </div>

            {/* Gloss override for the whole ball to make it shiny */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
        </div>
    );
};
