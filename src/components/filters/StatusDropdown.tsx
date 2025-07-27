import { useEffect, useState } from 'react';
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { supabase } from '@/integrations/supabase/client';

interface StatusDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function StatusDropdown({ value, onValueChange }: StatusDropdownProps) {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('status')
        .select('id, label')
        .order('label');
      
      if (data) {
        setOptions(data.map(item => ({ value: item.id, label: item.label })));
      }
    };

    fetchStatus();
  }, []);

  return (
    <FilterDropdown
      value={value}
      onValueChange={onValueChange}
      placeholder="Zgjidhni statusin"
      options={options}
      allLabel="Të gjitha statuset"
    />
  );
}