import { useEffect, useState } from 'react';
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { supabase } from '@/integrations/supabase/client';

interface BashkiaDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showAll?: boolean;
}

export function BashkiaDropdown({ value, onValueChange, placeholder = "Zgjidhni bashkinë", showAll = true }: BashkiaDropdownProps) {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    const fetchBashkia = async () => {
      const { data } = await supabase
        .from('bashkia')
        .select('id, label')
        .order('label');
      
      if (data) {
        setOptions(data.map(item => ({ value: item.id, label: item.label })));
      }
    };

    fetchBashkia();
  }, []);

  if (!showAll) {
    // For forms, use regular Select without "all" option
    return (
      <FilterDropdown
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        options={options}
        allLabel="" // No "all" option
      />
    );
  }

  return (
    <FilterDropdown
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      options={options}
      allLabel="Të gjitha bashkitë"
    />
  );
}