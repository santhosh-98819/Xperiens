import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'h-10 w-auto',
  alt = 'Xperiens Logo',
}) => {
  const { resolvedTheme } = useTheme();

  // LIGHT THEME -> Display dark logo asset (dark lettering)
  // DARK THEME  -> Display light logo asset (light lettering)
  const logoSrc =
    resolvedTheme === 'dark'
      ? '/xperiens-logo-light.svg'
      : '/xperiens-logo-dark.svg';

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`object-contain transition-opacity duration-200 ${className}`}
      width={220}
      height={50}
    />
  );
};
