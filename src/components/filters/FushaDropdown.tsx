import { useEffect, useState } from 'react';
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { supabase } from '@/integrations/supabase/client';

interface FushaDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function FushaDropdown({ value, onValueChange }: FushaDropdownProps) {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    const fetchFusha = async () => {
      const { data } = await supabase
        .from('fusha')
        .select('id, label')
        .order('label');
      
      if (data) {
        setOptions(data.map(item => ({ value: item.id, label: item.label })));
      }
    };

    fetchFusha();
  }, []);

  return (
    <FilterDropdown
      value={value}
      onValueChange={onValueChange}
      placeholder="Zgjidhni fushën"
      options={options}
      allLabel="Të gjitha fushat"
    />
  );
}