import React from 'react';

const IncomingCallModal = ({ callerName, onAccept, onDecline }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-lg w-96 text-center">
                <h2 className="text-xl font-semibold mb-4">{callerName} is calling...</h2>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onAccept}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Accept
                    </button>
                    <button
                        onClick={onDecline}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Decline
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
