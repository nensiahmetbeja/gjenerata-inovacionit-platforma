import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';

interface StatusData {
  label: string;
  color_badge: string;
}

interface ApplicationStatusBadgeProps {
  statusId: string;
  className?: string;
}

// Utility function to determine if a color is dark
const isColorDark = (hexColor: string): boolean => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if dark (luminance < 0.5)
  return luminance < 0.5;
};

export function ApplicationStatusBadge({ statusId, className }: ApplicationStatusBadgeProps) {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('status')
          .select('*')
          .eq('id', statusId)
          .single();

        if (error) {
          console.error('Error fetching status:', error);
          setStatusData({ label: 'Unknown Status', color_badge: '#6b7280' });
          return;
        }

        if (data) {
          setStatusData({
            label: data.label || 'Unknown',
            color_badge: (data as any).color_badge || '#6b7280'
          });
        }
      } catch (error) {
        console.error('Error in fetchStatus:', error);
        setStatusData({ label: 'Unknown Status', color_badge: '#6b7280' });
      } finally {
        setLoading(false);
      }
    };

    if (statusId) {
      fetchStatus();
    }
  }, [statusId]);

  if (loading) {
    return (
      <Badge variant="outline" className={className}>
        Loading...
      </Badge>
    );
  }

  if (!statusData) {
    return (
      <Badge variant="outline" className={className}>
        Unknown
      </Badge>
    );
  }

  const backgroundColor = statusData.color_badge;
  const textColor = isColorDark(backgroundColor) ? '#ffffff' : '#1d1e22';

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${className}`}
      style={{
        backgroundColor,
        color: textColor,
        border: `1px solid ${backgroundColor}`,
      }}
    >
      {statusData.label}
    </span>
  );
}