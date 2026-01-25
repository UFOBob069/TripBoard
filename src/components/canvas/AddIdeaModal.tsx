import { useState } from 'react';
import { Modal } from '../common/Modal';
import type { CanvasType, DateIdeaMetadata, TransportationMetadata } from '../../types';
import { CANVAS_CONFIG } from '../../types';
import { useTripStore } from '../../store/tripStore';
import {
  Calendar,
  MapPin,
  Home,
  Compass,
  Utensils,
  Plane,
  Link,
  Loader2,
  Search,
  Car,
  Train,
  Bus,
  Ship,
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

// Placeholder images for different canvas types
const PLACEHOLDER_IMAGES: Record<CanvasType, string[]> = {
  dates: [],
  location: [],
  accommodation: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400',
  ],
  activities: [
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400',
    'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
  ],
  food: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400',
  ],
  transportation: [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400',
  ],
};

// Popular city suggestions
const POPULAR_CITIES = [
  'Paris', 'Tokyo', 'New York', 'London', 'Barcelona',
  'Rome', 'Dubai', 'Bali', 'Sydney', 'Amsterdam',
  'Miami', 'Las Vegas', 'Cancun', 'Hawaii', 'Cabo',
];

// Transportation types with icons
const TRANSPORTATION_TYPES = [
  { type: 'flight', label: 'Flight', icon: Plane, color: 'bg-cyan-500' },
  { type: 'car', label: 'Car / Rental', icon: Car, color: 'bg-blue-500' },
  { type: 'train', label: 'Train', icon: Train, color: 'bg-green-500' },
  { type: 'bus', label: 'Bus', icon: Bus, color: 'bg-orange-500' },
  { type: 'ferry', label: 'Ferry / Boat', icon: Ship, color: 'bg-indigo-500' },
] as const;

// Generate city image URL using Unsplash source
const getCityImageUrl = (city: string): string => {
  const searchTerm = encodeURIComponent(`${city} city skyline travel`);
  return `https://source.unsplash.com/800x600/?${searchTerm}`;
};

export function AddIdeaModal({ isOpen, onClose, tripId, canvasType }: AddIdeaModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flexible, setFlexible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [transportationType, setTransportationType] = useState<TransportationMetadata['type']>('flight');
  const [carrier, setCarrier] = useState('');
  const [price, setPrice] = useState('');

  const { addIdea, currentUser } = useTripStore();
  const config = CANVAS_CONFIG[canvasType];
  const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP];
  const isDateBoard = canvasType === 'dates';
  const isLocationBoard = canvasType === 'location';
  const isTransportationBoard = canvasType === 'transportation';

  const filteredCities = POPULAR_CITIES.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCitySelect = (city: string) => {
    setTitle(city);
    setCitySearch(city);
    setShowCitySuggestions(false);
    // Auto-fetch image for the city
    setIsLoading(true);
    const cityImageUrl = getCityImageUrl(city);
    setImageUrl(cityImageUrl);
    // Small delay to show loading state
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleCitySearch = () => {
    if (!citySearch.trim()) return;
    handleCitySelect(citySearch.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (isDateBoard) {
      if (!startDate || !endDate) return;

      const metadata: DateIdeaMetadata = {
        start_date: startDate,
        end_date: endDate,
        flexible,
      };

      // Format title from dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateTitle = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

      await addIdea(tripId, canvasType, {
        title: dateTitle,
        description: flexible ? 'Flexible dates' : description,
        created_by: currentUser.id,
        metadata,
      });
    } else if (isLocationBoard) {
      if (!title.trim()) return;

      await addIdea(tripId, canvasType, {
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl || getCityImageUrl(title.trim()),
        created_by: currentUser.id,
      });
    } else if (isTransportationBoard) {
      if (!title.trim()) return;

      const transportMetadata: TransportationMetadata = {
        type: transportationType,
        carrier: carrier.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
      };

      await addIdea(tripId, canvasType, {
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl || undefined,
        link_url: linkUrl || undefined,
        created_by: currentUser.id,
        metadata: transportMetadata,
      });
    } else {
      if (!title.trim()) return;

      await addIdea(tripId, canvasType, {
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl || undefined,
        link_url: linkUrl || undefined,
        created_by: currentUser.id,
      });
    }

    // Reset form
    setTitle('');
    setDescription('');
    setLinkUrl('');
    setImageUrl('');
    setStartDate('');
    setEndDate('');
    setFlexible(false);
    setCitySearch('');
    setTransportationType('flight');
    setCarrier('');
    setPrice('');
    onClose();
  };

  const handleUrlPaste = async () => {
    if (!linkUrl) return;

    setIsLoading(true);

    try {
      // Try to fetch link metadata using a free link preview API
      const encodedUrl = encodeURIComponent(linkUrl);
      const response = await fetch(`https://api.linkpreview.net/?key=free&q=${encodedUrl}`, {
        method: 'GET',
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        if (data.title && !title) {
          setTitle(data.title);
        }
        if (data.image) {
          setImageUrl(data.image);
        } else if (data.favicon) {
          // Use favicon as fallback if no image
          setImageUrl(data.favicon);
        }
      } else {
        // Fallback: Try to extract info from URL
        try {
          const url = new URL(linkUrl);

          // Generate a more meaningful title from URL path
          if (!title) {
            const pathParts = url.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0) {
              // Use the last meaningful path segment
              const lastPart = pathParts[pathParts.length - 1]
                .replace(/[-_]/g, ' ')
                .replace(/\.\w+$/, '') // Remove file extension
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              setTitle(lastPart || url.hostname.replace('www.', ''));
            } else {
              setTitle(url.hostname.replace('www.', ''));
            }
          }

          // Use a relevant placeholder based on canvas type
          const placeholders = PLACEHOLDER_IMAGES[canvasType];
          if (placeholders.length > 0 && !imageUrl) {
            setImageUrl(placeholders[Math.floor(Math.random() * placeholders.length)]);
          }
        } catch {
          // Invalid URL, ignore
        }
      }
    } catch (error) {
      console.error('Error fetching link preview:', error);
      // Use fallback placeholder
      const placeholders = PLACEHOLDER_IMAGES[canvasType];
      if (placeholders.length > 0) {
        setImageUrl(placeholders[Math.floor(Math.random() * placeholders.length)]);
      }
      if (!title) {
        try {
          const url = new URL(linkUrl);
          setTitle(url.hostname.replace('www.', ''));
        } catch {
          // Invalid URL
        }
      }
    } finally {
      setIsLoading(false);
    }
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

        {isDateBoard ? (
          // Date-specific form
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flexible}
                onChange={(e) => setFlexible(e.target.checked)}
                className="w-4 h-4 text-primary-500 rounded"
              />
              <span className="text-sm text-gray-700">These dates are flexible</span>
            </label>

            {!flexible && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Any reason for these dates? (e.g., long weekend, cheaper flights)"
                />
              </div>
            )}
          </>
        ) : isLocationBoard ? (
          // Location/City-specific form
          <>
            {/* City search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  City or Destination <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setShowCitySuggestions(true);
                        setTitle(e.target.value);
                      }}
                      onFocus={() => setShowCitySuggestions(true)}
                      className="input-field"
                      placeholder="e.g., Paris, Tokyo, New York..."
                      required
                    />
                    {showCitySuggestions && citySearch && filteredCities.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => handleCitySelect(city)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                          >
                            <MapPin size={14} className="text-gray-400" />
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCitySearch}
                    disabled={!citySearch || isLoading}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Search size={16} />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enter a city name to auto-fetch an image
              </p>
            </div>

            {/* Popular cities */}
            {!citySearch && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Popular destinations</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CITIES.slice(0, 10).map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 text-gray-600 text-sm rounded-full transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image preview */}
            {imageUrl && (
              <div className="relative h-48 rounded-lg overflow-hidden">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                {isLoading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-white" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Why this destination? (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[80px] resize-none"
                placeholder="e.g., Great weather, lots of activities, good food scene..."
              />
            </div>
          </>
        ) : isTransportationBoard ? (
          // Transportation-specific form
          <>
            {/* Transportation Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transportation Type
              </label>
              <div className="grid grid-cols-5 gap-2">
                {TRANSPORTATION_TYPES.map((transport) => {
                  const TransportIcon = transport.icon;
                  const isSelected = transportationType === transport.type;
                  return (
                    <button
                      key={transport.type}
                      type="button"
                      onClick={() => setTransportationType(transport.type)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? `border-primary-500 bg-primary-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? transport.color : 'bg-gray-100'}`}>
                        <TransportIcon size={18} className={isSelected ? 'text-white' : 'text-gray-500'} />
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? 'text-primary-700' : 'text-gray-600'}`}>
                        {transport.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Link URL with auto-fetch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <Link size={16} />
                  Booking Link (optional)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="input-field flex-1 min-w-0"
                  placeholder="https://expedia.com/flights..."
                />
                <button
                  type="button"
                  onClick={handleUrlPaste}
                  disabled={!linkUrl || isLoading}
                  className="flex-shrink-0 btn-secondary text-sm flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Fetch'
                  )}
                </button>
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
                placeholder={`e.g., ${transportationType === 'flight' ? 'LAX to JFK - Delta' : transportationType === 'car' ? 'Hertz SUV Rental' : transportationType === 'train' ? 'Amtrak Northeast Regional' : 'Bus to destination'}`}
                required
              />
            </div>

            {/* Carrier & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {transportationType === 'flight' ? 'Airline' : transportationType === 'car' ? 'Rental Company' : 'Carrier'} (optional)
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="input-field"
                  placeholder={transportationType === 'flight' ? 'e.g., Delta, United' : 'e.g., Hertz, Enterprise'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-field pl-7"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[60px] resize-none"
                placeholder="Flight times, connection info, etc..."
              />
            </div>

            {/* Image preview if fetched */}
            {imageUrl && (
              <div className="relative h-32 rounded-lg overflow-hidden">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  &times;
                </button>
              </div>
            )}
          </>
        ) : (
          // Standard form for other canvases
          <>
            {/* Link URL with auto-fetch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <Link size={16} />
                  Link (optional)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="input-field flex-1 min-w-0"
                  placeholder="https://expedia.com/hotel..."
                />
                <button
                  type="button"
                  onClick={handleUrlPaste}
                  disabled={!linkUrl || isLoading}
                  className="flex-shrink-0 btn-secondary text-sm flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Fetch'
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Paste a link and click Fetch to auto-populate title & image
              </p>
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
                placeholder={`e.g., ${canvasType === 'accommodation' ? 'Beautiful beach resort' : canvasType === 'food' ? 'Amazing local restaurant' : 'Exciting activity'}`}
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
                className="input-field min-h-[80px] resize-none"
                placeholder="Add more details about your idea..."
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>

              {imageUrl ? (
                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowImagePicker(!showImagePicker)}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                  Click to choose an image
                </button>
              )}

              {/* Image picker */}
              {showImagePicker && PLACEHOLDER_IMAGES[canvasType].length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {PLACEHOLDER_IMAGES[canvasType].map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImageUrl(url);
                        setShowImagePicker(false);
                      }}
                      className={`h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        imageUrl === url ? 'border-primary-500' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

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
