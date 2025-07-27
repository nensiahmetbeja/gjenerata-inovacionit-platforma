import { FilterDropdown } from "@/components/ui/filter-dropdown";

interface GrupMoshaDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
}

const GRUPMOSH_OPTIONS = [
  { value: "Nxënës (15-18 vjeç)", label: "Nxënës (15-18 vjeç)" },
  { value: "Studentë (19-24 vjeç)", label: "Studentë (19-24 vjeç)" },
  { value: "Profesionistë (25-29 vjeç)", label: "Profesionistë (25-29 vjeç)" }
];

export function GrupMoshaDropdown({ value, onValueChange }: GrupMoshaDropdownProps) {
  return (
    <FilterDropdown
      value={value}
      onValueChange={onValueChange}
      placeholder="Zgjidhni grupmoshën"
      options={GRUPMOSH_OPTIONS}
      allLabel="Të gjitha grupet"
    />
  );
}