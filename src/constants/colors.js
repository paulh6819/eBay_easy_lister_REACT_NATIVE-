export const colors = {
  // Primary cream/beige theme
  background: '#f8f5f1',      // Light cream background
  cardBackground: '#faf8f4',   // Slightly warmer cream for cards
  surface: '#ffffff',          // Pure white for elevated surfaces
  
  // Dark borders and outlines (matching Codebase design)
  border: '#2d3748',           // Dark gray/black borders
  borderLight: '#e2e8f0',      // Light borders for subtle divisions
  
  // Orange/peach accent colors
  primary: '#ed8936',          // Orange primary button
  primaryHover: '#dd7724',     // Darker orange for pressed state
  primaryLight: '#fbb078',     // Light orange for backgrounds
  
  // Text colors
  textPrimary: '#2d3748',      // Dark text
  textSecondary: '#4a5568',    // Medium gray text
  textMuted: '#718096',        // Light gray text
  textInverse: '#ffffff',      // White text for dark backgrounds
  
  // Status colors
  success: '#48bb78',          // Green for success states
  error: '#e53e3e',            // Red for errors
  warning: '#ed8936',          // Orange for warnings
  
  // Special colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};