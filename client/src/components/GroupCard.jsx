import React from 'react';

const GroupCard = ({
    group,
    unreadCount,
    onClick,
    onJoin,
    joined = false,
    userLearningLangs = [],
    userKnownLangs = [],
}) => {
    const isLearning = userLearningLangs.includes(group.languageLevel);
    const canHelp = userKnownLangs.includes(group.languageLevel);

    return (
        <div
            onClick={onClick}
            className="cursor-pointer bg-white rounded-xl shadow-lg p-5 hover:shadow-2xl transform hover:-translate-y-1 transition duration-300 ease-in-out relative"
            title={`Members: ${group.members?.length ?? 0}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            <h2 className="text-lg font-semibold text-gray-900 mb-2 truncate">{group.name}</h2>
            <p className="text-sm text-gray-600">
                {(group.members?.length ?? 0)} member{(group.members?.length ?? 0) !== 1 && 's'}
            </p>
            {group.languageLevel && (
                <p className="text-xs text-gray-500 mt-1">Language: {group.languageLevel}</p>
            )}

            {(isLearning || canHelp) && (
                <div className="mt-2 flex gap-2 flex-wrap">
                    {isLearning && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            You're learning this
                        </span>
                    )}
                    {canHelp && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            You can help others
                        </span>
                    )}
                </div>
            )}

            {unreadCount > 0 && (
                <span
                    className="absolute top-3 right-3 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
                    aria-label={`${unreadCount} unread messages`}
                >
                    {unreadCount}
                </span>
            )}

            {
                !joined && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onJoin?.(group._id);
                        }}
                        className="mt-4 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                    >
                        Join
                    </button>
                )
            }
        </div>
    );
};

export default GroupCard;
