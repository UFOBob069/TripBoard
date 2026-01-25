import { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon,
  X,
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

// Popular city suggestions with images
const POPULAR_DESTINATIONS = [
  { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
  { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
  { name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800' },
  { name: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
  { name: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800' },
  { name: 'Rome', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
  { name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },
  { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
  { name: 'Sydney', country: 'Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800' },
  { name: 'Amsterdam', country: 'Netherlands', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800' },
  { name: 'Miami', country: 'USA', image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800' },
  { name: 'Las Vegas', country: 'USA', image: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800' },
  { name: 'Cancun', country: 'Mexico', image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800' },
  { name: 'Hawaii', country: 'USA', image: 'https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=800' },
  { name: 'Cabo', country: 'Mexico', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800' },
  { name: 'Austin', country: 'USA', image: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800' },
  { name: 'Nashville', country: 'USA', image: 'https://images.unsplash.com/photo-1545419913-775cde142068?w=800' },
  { name: 'Denver', country: 'USA', image: 'https://images.unsplash.com/photo-1619856699906-09e1f58c98b1?w=800' },
  { name: 'San Francisco', country: 'USA', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800' },
  { name: 'Los Angeles', country: 'USA', image: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800' },
];

// Transportation types with icons
const TRANSPORTATION_TYPES = [
  { type: 'flight', label: 'Flight', icon: Plane, color: 'bg-cyan-500' },
  { type: 'car', label: 'Car / Rental', icon: Car, color: 'bg-blue-500' },
  { type: 'train', label: 'Train', icon: Train, color: 'bg-green-500' },
  { type: 'bus', label: 'Bus', icon: Bus, color: 'bg-orange-500' },
  { type: 'ferry', label: 'Ferry / Boat', icon: Ship, color: 'bg-indigo-500' },
] as const;

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  properties: {
    short_code?: string;
  };
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

export function AddIdeaModal({ isOpen, onClose, tripId, canvasType }: AddIdeaModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [showManualImageInput, setShowManualImageInput] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flexible, setFlexible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [mapboxResults, setMapboxResults] = useState<MapboxFeature[]>([]);
  const [transportationType, setTransportationType] = useState<TransportationMetadata['type']>('flight');
  const [carrier, setCarrier] = useState('');
  const [price, setPrice] = useState('');
  const [itemDate, setItemDate] = useState('');

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const { addIdea, currentUser } = useTripStore();
  const config = CANVAS_CONFIG[canvasType];
  const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP];
  const isDateBoard = canvasType === 'dates';
  const isLocationBoard = canvasType === 'location';
  const isTransportationBoard = canvasType === 'transportation';

  // Mapbox geocoding search
  useEffect(() => {
    if (!isLocationBoard || !citySearch || citySearch.length < 2) {
      setMapboxResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (!mapboxToken) {
        const filtered = POPULAR_DESTINATIONS.filter((d) =>
          d.name.toLowerCase().includes(citySearch.toLowerCase()) ||
          d.country.toLowerCase().includes(citySearch.toLowerCase())
        );
        setMapboxResults(filtered.map((d) => ({
          id: d.name,
          place_name: `${d.name}, ${d.country}`,
          text: d.name,
          properties: {},
        })));
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(citySearch)}.json?types=place,locality,region&limit=6&access_token=${mapboxToken}`
        );
        if (response.ok) {
          const data = await response.json();
          setMapboxResults(data.features || []);
        }
      } catch (error) {
        console.error('Mapbox search error:', error);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [citySearch, isLocationBoard, mapboxToken]);

  const filteredLocalDestinations = POPULAR_DESTINATIONS.filter((d) =>
    d.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    d.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCitySelect = async (cityName: string, placeName?: string) => {
    setTitle(placeName || cityName);
    setCitySearch(cityName);
    setShowCitySuggestions(false);
    setIsLoading(true);

    // Check popular destinations first for reliable images
    const popularCity = POPULAR_DESTINATIONS.find(
      (d) => d.name.toLowerCase() === cityName.toLowerCase()
    );

    if (popularCity) {
      setImageUrl(popularCity.image);
      setIsLoading(false);
      return;
    }

    // Try Teleport API for city photos
    try {
      const slug = cityName.toLowerCase().replace(/\s+/g, '-');
      const teleportResponse = await fetch(
        `https://api.teleport.org/api/urban_areas/slug:${slug}/images/`
      );
      if (teleportResponse.ok) {
        const data = await teleportResponse.json();
        if (data.photos?.[0]?.image?.web) {
          setImageUrl(data.photos[0].image.web);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Continue to Unsplash fallback
    }

    // Unsplash fallback - use a generic city image
    setImageUrl(`https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80`);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);

    try {
      if (isDateBoard) {
        if (!startDate || !endDate) {
          setIsLoading(false);
          return;
        }

        const metadata: DateIdeaMetadata = {
          start_date: startDate,
          end_date: endDate,
          flexible,
        };

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
        if (!title.trim()) {
          setIsLoading(false);
          return;
        }

        await addIdea(tripId, canvasType, {
          title: title.trim(),
          ...(description.trim() && { description: description.trim() }),
          ...(imageUrl && { image_url: imageUrl }),
          created_by: currentUser.id,
        });
      } else if (isTransportationBoard) {
        if (!title.trim()) {
          setIsLoading(false);
          return;
        }

        const transportMetadata: TransportationMetadata = {
          type: transportationType,
          carrier: carrier.trim() || undefined,
          price: price ? parseFloat(price) : undefined,
        };

        const fullDescription = [
          description.trim(),
          itemDate ? `📅 ${new Date(itemDate).toLocaleDateString()}` : '',
        ].filter(Boolean).join('\n');

        await addIdea(tripId, canvasType, {
          title: title.trim(),
          ...(fullDescription && { description: fullDescription }),
          ...(imageUrl && { image_url: imageUrl }),
          ...(linkUrl && { link_url: linkUrl }),
          created_by: currentUser.id,
          metadata: transportMetadata,
        });
      } else {
        // Standard form for accommodation, activities, food
        if (!title.trim()) {
          setIsLoading(false);
          return;
        }

        const fullDescription = [
          description.trim(),
          itemDate ? `📅 ${new Date(itemDate).toLocaleDateString()}` : '',
        ].filter(Boolean).join('\n');

        await addIdea(tripId, canvasType, {
          title: title.trim(),
          ...(fullDescription && { description: fullDescription }),
          ...(imageUrl && { image_url: imageUrl }),
          ...(linkUrl && { link_url: linkUrl }),
          created_by: currentUser.id,
        });
      }

      // Reset form
      setTitle('');
      setDescription('');
      setLinkUrl('');
      setImageUrl('');
      setManualImageUrl('');
      setShowManualImageInput(false);
      setStartDate('');
      setEndDate('');
      setFlexible(false);
      setCitySearch('');
      setTransportationType('flight');
      setCarrier('');
      setPrice('');
      setItemDate('');
      setMapboxResults([]);
      setShowImagePicker(false);
      onClose();
    } catch (error) {
      console.error('Error adding idea:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlPaste = async () => {
    if (!linkUrl) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(linkUrl)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          const { title: fetchedTitle, image, logo } = data.data;

          if (fetchedTitle && !title) {
            setTitle(fetchedTitle);
          }

          // Prefer image over logo
          if (image?.url && !image.url.includes('logo')) {
            setImageUrl(image.url);
          } else if (logo?.url) {
            // If we only got a logo, don't set it - let user pick from placeholders
            console.log('Only logo found, skipping image');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching link preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualImageSubmit = () => {
    if (manualImageUrl.trim()) {
      setImageUrl(manualImageUrl.trim());
      setShowManualImageInput(false);
      setManualImageUrl('');
    }
  };

  const clearImage = () => {
    setImageUrl('');
    setShowImagePicker(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add ${config.label} Idea`} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Canvas type indicator */}
          <div className={`flex items-center gap-3 p-3 rounded-lg ${config.color} bg-opacity-10`}>
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
                    className="input-field min-h-[60px] resize-none"
                    placeholder="Any reason for these dates?"
                  />
                </div>
              )}
            </>
          ) : isLocationBoard ? (
            <>
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
                        placeholder="Search for a city..."
                        required
                      />
                      {showCitySuggestions && citySearch.length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                          {(mapboxResults.length > 0 ? mapboxResults : filteredLocalDestinations.map((d) => ({
                            id: d.name,
                            place_name: `${d.name}, ${d.country}`,
                            text: d.name,
                            properties: {},
                          }))).map((result) => (
                            <button
                              key={result.id}
                              type="button"
                              onClick={() => handleCitySelect(result.text, result.place_name)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                            >
                              <MapPin size={14} className="text-gray-400" />
                              <span className="text-sm">{result.place_name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => citySearch && handleCitySelect(citySearch)}
                      disabled={!citySearch || isLoading}
                      className="btn-secondary text-sm"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {!citySearch && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Popular destinations</p>
                  <div className="grid grid-cols-5 gap-2">
                    {POPULAR_DESTINATIONS.slice(0, 10).map((dest) => (
                      <button
                        key={dest.name}
                        type="button"
                        onClick={() => handleCitySelect(dest.name, `${dest.name}, ${dest.country}`)}
                        className="group relative h-14 rounded-lg overflow-hidden"
                      >
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 flex items-end p-1">
                          <span className="text-white text-xs font-medium truncate">{dest.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {imageUrl && (
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Why this destination? (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[60px] resize-none"
                  placeholder="e.g., Great weather, lots of activities..."
                />
              </div>
            </>
          ) : isTransportationBoard ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {TRANSPORTATION_TYPES.map((transport) => {
                    const TransportIcon = transport.icon;
                    const isSelected = transportationType === transport.type;
                    return (
                      <button
                        key={transport.type}
                        type="button"
                        onClick={() => setTransportationType(transport.type)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                          isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? transport.color : 'bg-gray-100'}`}>
                          <TransportIcon size={16} className={isSelected ? 'text-white' : 'text-gray-500'} />
                        </div>
                        <span className={`text-xs ${isSelected ? 'text-primary-700 font-medium' : 'text-gray-600'}`}>
                          {transport.label.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder={transportationType === 'flight' ? 'LAX to JFK - Delta' : 'Hertz SUV Rental'}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {transportationType === 'flight' ? 'Airline' : 'Carrier'}
                  </label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="input-field"
                    placeholder="Delta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="input-field pl-7"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={itemDate}
                    onChange={(e) => setItemDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Link size={14} className="inline mr-1" />
                  Booking Link
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="input-field"
                  placeholder="https://expedia.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[50px] resize-none"
                  placeholder="Flight times, connection info..."
                />
              </div>
            </>
          ) : (
            // Standard form for accommodation, activities, food
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Link size={14} className="inline mr-1" />
                  Link (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="input-field flex-1"
                    placeholder="https://expedia.com/..."
                  />
                  <button
                    type="button"
                    onClick={handleUrlPaste}
                    disabled={!linkUrl || isLoading}
                    className="btn-secondary text-sm"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Fetch'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder={canvasType === 'accommodation' ? 'Beach Resort' : canvasType === 'food' ? 'Local Restaurant' : 'Fun Activity'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={14} className="inline mr-1" />
                  Date (optional)
                </label>
                <input
                  type="date"
                  value={itemDate}
                  onChange={(e) => setItemDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[60px] resize-none"
                  placeholder="Add details..."
                />
              </div>

              {/* Image section - compact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <ImageIcon size={14} className="inline mr-1" />
                  Image (optional)
                </label>

                {imageUrl ? (
                  <div className="relative h-28 rounded-lg overflow-hidden">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setShowManualImageInput(true)}
                        className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                        title="Change image"
                      >
                        <ImageIcon size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(!showImagePicker)}
                      className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-primary-400 hover:text-primary-500 text-sm"
                    >
                      Choose from gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualImageInput(true)}
                      className="px-3 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-primary-400 hover:text-primary-500"
                      title="Enter image URL"
                    >
                      <Link size={16} />
                    </button>
                  </div>
                )}

                {showManualImageInput && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        className="input-field flex-1"
                        placeholder="https://example.com/image.jpg"
                        autoFocus
                      />
                      <button type="button" onClick={handleManualImageSubmit} className="btn-primary text-sm">
                        Set
                      </button>
                      <button type="button" onClick={() => setShowManualImageInput(false)} className="btn-secondary text-sm">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Paste a direct link to an image (right-click image → Copy image address)
                    </p>
                  </div>
                )}

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
                        className="h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-500"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Fixed footer with actions */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Add Idea
          </button>
        </div>
      </form>
    </Modal>
  );
}
