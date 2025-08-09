import React, { useState, useEffect } from 'react';

const CreateGroupForm = ({ userId, onCreate, onCancel }) => {
    const [groupName, setGroupName] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await fetch(`/api/friends/list`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!res.ok) throw new Error('Failed to fetch friends');
                const data = await res.json();
                setFriends(data || []);
            } catch (err) {
                console.error(err.message);
            }
        };

        if (userId) {
            fetchFriends();
        }
    }, [userId]);

    const toggleFriend = (friendId) => {
        setSelectedFriends((prev) =>
            prev.includes(friendId)
                ? prev.filter((id) => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!groupName.trim()) {
            alert('Group name is required');
            return;
        }

        const members = [...selectedFriends];
        if (!members.includes(userId)) {
            members.push(userId);
        }

        try {
            const res = await fetch('/api/groups/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: groupName,
                    participants: members,
                }),
            });

            if (!res.ok) throw new Error('Failed to create group');

            const data = await res.json();
            onCreate(data);
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold mb-4">Create New Group</h2>

            <label className="block mb-2">
                Group Name:
                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full p-2 border rounded mt-1"
                    required
                />
            </label>

            <div className="mb-4">
                <h3 className="font-medium mb-2">Select Friends:</h3>
                {friends.length === 0 ? (
                    <p className="text-gray-500">You have no friends to add.</p>
                ) : (
                    friends.map((friend) => (
                        <label key={friend._id} className="block">
                            <input
                                type="checkbox"
                                checked={selectedFriends.includes(friend._id)}
                                onChange={() => toggleFriend(friend._id)}
                            />
                            <span className="ml-2">{friend.name}</span>
                        </label>
                    ))
                )}
            </div>

            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border rounded"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Create Group
                </button>
            </div>
        </form>
    );
};

export default CreateGroupForm;
