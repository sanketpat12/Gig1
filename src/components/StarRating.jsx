import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value = 0, onChange, readonly = false, size = 20 }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="stars" style={{ gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`star ${star <= display ? 'star-filled' : 'star-empty'}`}
          style={{ cursor: readonly ? 'default' : 'pointer', transition: 'transform 0.15s, color 0.15s' }}
          fill={star <= display ? '#ffd200' : 'transparent'}
          stroke={star <= display ? '#ffd200' : 'rgba(255,255,255,0.25)'}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange && onChange(star)}
        />
      ))}
    </div>
  );
}
