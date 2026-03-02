import React from 'react';
import { SiInstagram, SiFacebook, SiX, SiTiktok } from 'react-icons/si';

type Platform = 'Instagram' | 'Facebook' | 'Twitter/X' | 'TikTok';

interface PlatformIconProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const sizeMap = {
  sm: 14,
  md: 20,
  lg: 28,
};

const platformColors: Record<string, string> = {
  Instagram: 'text-coral-400',
  Facebook: 'text-amber-500',
  'Twitter/X': 'text-charcoal-200',
  TikTok: 'text-coral-300',
};

const PlatformIconComponent: React.FC<PlatformIconProps> = ({
  platform,
  size = 'md',
  className = '',
  showLabel = false,
}) => {
  const iconSize = sizeMap[size];
  const colorClass = platformColors[platform] ?? 'text-charcoal-300';

  const renderIcon = () => {
    switch (platform) {
      case 'Instagram':
        return <SiInstagram size={iconSize} />;
      case 'Facebook':
        return <SiFacebook size={iconSize} />;
      case 'Twitter/X':
        return <SiX size={iconSize} />;
      case 'TikTok':
        return <SiTiktok size={iconSize} />;
      default:
        return <span className="text-xs font-bold">{platform[0]}</span>;
    }
  };

  if (showLabel) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${colorClass} ${className}`}>
        {renderIcon()}
        <span className="text-sm font-medium">{platform}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center ${colorClass} ${className}`}>
      {renderIcon()}
    </span>
  );
};

export default PlatformIconComponent;
