import { useState } from 'react';
import { Modal } from '../common/Modal';
import type { CanvasType } from '../../types';
import { CANVAS_CONFIG } from '../../types';
import { useTripStore } from '../../store/tripStore';
import {
  Calendar,
  MapPin,
  Home,
  Compass,
  Utensils,
  Plane,
  Image,
  Link,
} from 'lucide-react';

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  canvasType: CanvasType;
}

const ICON_MAP = {
  Calendar,
  MapPin,
  Home,
  Compass,
  Utensils,
  Plane,
};

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
];

export function AddIdeaModal({ isOpen, onClose, tripId, canvasType }: AddIdeaModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);

  const { addIdea, currentUser } = useTripStore();
  const config = CANVAS_CONFIG[canvasType];
  const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    addIdea(tripId, canvasType, {
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl || undefined,
      link_url: linkUrl || undefined,
      created_by: currentUser.id,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setImageUrl('');
    setLinkUrl('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add ${config.label} Idea`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Canvas type indicator */}
        <div
          className={`flex items-center gap-3 p-3 rounded-lg ${config.color} bg-opacity-10`}
        >
          {IconComponent && (
            <div className={`p-2 rounded-lg ${config.color}`}>
              <IconComponent size={20} className="text-white" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800">{config.label}</p>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g., Beautiful beach resort in Bali"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field min-h-[100px] resize-none"
            placeholder="Add more details about your idea..."
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center gap-2">
              <Image size={16} />
              Image URL
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field flex-1"
              placeholder="https://example.com/image.jpg"
            />
            <button
              type="button"
              onClick={() => setShowImagePicker(!showImagePicker)}
              className="btn-secondary text-sm"
            >
              Pick
            </button>
          </div>

          {/* Image picker */}
          {showImagePicker && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {PLACEHOLDER_IMAGES.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setImageUrl(url);
                    setShowImagePicker(false);
                  }}
                  className={`h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    imageUrl === url ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Image preview */}
          {imageUrl && (
            <div className="mt-2 relative h-32 rounded-lg overflow-hidden">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Link URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center gap-2">
              <Link size={16} />
              Link URL
            </span>
          </label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="input-field"
            placeholder="https://booking.com/hotel..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Add Idea
          </button>
        </div>
      </form>
    </Modal>
  );
}
