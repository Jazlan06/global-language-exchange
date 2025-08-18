import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupCard from '../components/GroupCard';
import { useGroupUnread } from '../context/GroupUnreadContext';

const MyGroupsPage = () => {
  const rawToken = localStorage.getItem('token');
  const [groups, setGroups] = useState([]);
  const { unreadCounts } = useGroupUnread();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/groups', {
          headers: {
            Authorization: `Bearer ${rawToken}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch groups');
        const data = await res.json();
        const userId = JSON.parse(atob(rawToken.split('.')[1]))?.id;
        const joined = (data.groups || []).filter(g => g.members.some(m => m._id === userId));
        setGroups(joined);
      } catch (err) {
        console.error(err.message);
      }
    };
    if (rawToken) fetchGroups();
  }, [rawToken]);

  const handleGroupClick = (groupId) => navigate(`/groups/${groupId}`);

  return (
    <div
      className="p-6 max-w-5xl mx-auto min-h-screen bg-gradient-to-tr from-purple-100 via-pink-100 to-yellow-100"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-4 border-pink-400 inline-block pb-2 tracking-wide select-none">
        Your Joined Groups
      </h1>

      {groups.length === 0 ? (
        <p
          className="text-gray-600 text-center mt-20 text-lg italic opacity-70 animate-fadeIn"
          style={{ userSelect: 'none' }}
        >
          You're not in any groups yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {groups.map((group) => (
            <div
              key={group._id}
              onClick={() => handleGroupClick(group._id)}
              className="transform transition duration-300 hover:scale-105 hover:shadow-xl cursor-pointer animate-fadeIn"
            >
              <GroupCard
                group={group}
                unreadCount={unreadCounts[group._id] || 0}
                joined={true}
              />
            </div>
          ))}
        </div>
      )}

      {/* Animations CSS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default MyGroupsPage;
