import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export function StatusBadge({ label, color = "#E7E9F3", className }: StatusBadgeProps) {
  // Function to determine if we should use light or dark text based on background color
  const getTextColor = (bgColor: string) => {
    // Remove # if present
    const hex = bgColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness using the luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return white for dark backgrounds, dark for light backgrounds
    return brightness < 128 ? '#ffffff' : '#1d1e22';
  };

  const textColor = getTextColor(color);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        className
      )}
      style={{
        backgroundColor: color,
        color: textColor,
      }}
    >
      {label}
    </span>
  );
}