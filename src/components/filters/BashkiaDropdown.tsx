import { useEffect, useState } from 'react';
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { supabase } from '@/integrations/supabase/client';

interface BashkiaDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function BashkiaDropdown({ value, onValueChange }: BashkiaDropdownProps) {
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

  return (
    <FilterDropdown
      value={value}
      onValueChange={onValueChange}
      placeholder="Zgjidhni bashkinë"
      options={options}
      allLabel="Të gjitha bashkitë"
    />
  );
}