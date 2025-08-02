import React from 'react';

const BadgeList = ({ badges = [] }) => {
    if (!badges.length) return <p className="text-gray-500 italic">No badges earned yet.</p>;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {badges.map((badge, idx) => (
                <div
                    key={idx}
                    className="flex items-center gap-2 p-3 bg-white shadow-sm rounded-lg border hover:shadow-md transition duration-200"
                >
                    <span className="text-xl">{badge.label.split(' ')[0]}</span>
                    <span className="text-gray-700 font-medium text-sm truncate">{badge.label.split(' ').slice(1).join(' ')}</span>
                </div>
            ))}
        </div>
    );
};

export default BadgeList;
