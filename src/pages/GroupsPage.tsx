import { useState } from 'react';
import {
  Users,
  Plus,
  UserPlus,
  Copy,
  Check,
  Map,
  ChevronRight,
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { Modal } from '../components/common/Modal';
import { AvatarGroup } from '../components/common/Avatar';
import { Header } from '../components/layout/Header';

export function GroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [joinError, setJoinError] = useState('');

  const { groups, createGroup, joinGroup, setActiveGroup } = useTripStore();
  const groupList = Object.values(groups);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    createGroup(groupName.trim(), groupDescription.trim());
    setGroupName('');
    setGroupDescription('');
    setShowCreateModal(false);
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    const group = joinGroup(inviteCode.trim());
    if (group) {
      setInviteCode('');
      setJoinError('');
      setShowJoinModal(false);
    } else {
      setJoinError('Invalid invite code. Please check and try again.');
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Your Groups</h1>
            <p className="text-gray-500">
              Create or join groups to start planning trips together
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <UserPlus size={18} />
              Join Group
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Create Group
            </button>
          </div>
        </div>

        {/* Groups grid */}
        {groupList.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No groups yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create a new group or join an existing one to start planning trips
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <UserPlus size={18} />
                Join Group
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Create Group
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupList.map((group) => (
              <div
                key={group.id}
                className="card p-6 cursor-pointer hover:shadow-xl transition-all"
                onClick={() => setActiveGroup(group.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <Users size={24} className="text-primary-600" />
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <AvatarGroup users={group.members} max={3} size="sm" />
                    <span className="text-sm text-gray-500">
                      {group.members.length} member
                      {group.members.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Map size={14} />
                    {group.trips.length} trip{group.trips.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Invite code */}
                <div
                  className="mt-4 flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <p className="text-xs text-gray-400">Invite Code</p>
                    <p className="font-mono font-medium text-gray-700">
                      {group.invite_code}
                    </p>
                  </div>
                  <button
                    onClick={() => copyInviteCode(group.invite_code)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    {copiedCode === group.invite_code ? (
                      <Check size={18} className="text-green-500" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Group"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input-field"
              placeholder="e.g., Summer Adventure Crew"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="What's this group about?"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Group
            </button>
          </div>
        </form>
      </Modal>

      {/* Join Group Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setJoinError('');
          setInviteCode('');
        }}
        title="Join a Group"
      >
        <form onSubmit={handleJoinGroup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invite Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setJoinError('');
              }}
              className="input-field font-mono text-center text-lg tracking-wider"
              placeholder="ABCD1234"
              maxLength={8}
              required
            />
            {joinError && (
              <p className="text-sm text-red-500 mt-2">{joinError}</p>
            )}
          </div>

          <p className="text-sm text-gray-500">
            Ask your group admin for the 8-character invite code
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowJoinModal(false);
                setJoinError('');
                setInviteCode('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Join Group
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
