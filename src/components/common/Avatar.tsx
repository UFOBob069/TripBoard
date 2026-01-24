import type { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export function Avatar({ user, size = 'md', showName = false }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white overflow-hidden`}
        style={{ backgroundColor: user.color }}
        title={user.name}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          user.name.charAt(0).toUpperCase()
        )}
      </div>
      {showName && <span className="text-sm text-gray-700">{user.name}</span>}
    </div>
  );
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ users, max = 4, size = 'md' }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs -ml-2',
    md: 'w-8 h-8 text-sm -ml-3',
    lg: 'w-12 h-12 text-lg -ml-4',
  };

  return (
    <div className="flex items-center">
      {displayUsers.map((user, index) => (
        <div
          key={user.id}
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white border-2 border-white overflow-hidden ${
            index === 0 ? 'ml-0' : ''
          }`}
          style={{ backgroundColor: user.color, zIndex: displayUsers.length - index }}
          title={user.name}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-gray-600 bg-gray-200 border-2 border-white`}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
