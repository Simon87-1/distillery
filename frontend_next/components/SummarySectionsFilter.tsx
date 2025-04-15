import { factsHeaders } from "@/utils";
import { getSetting, saveSetting } from "@/utils/localStorage";
import React, { useEffect, useState } from "react";
import SettingsIcon from "@/icons/SettingsIcon";

const SummarySectionsFilter = () => {
  const [sectionsFilter, setSectionsFilter] = useState<string[]>([]);

  const handleFilterToggle = (filter: string) => {
    setSectionsFilter((prev) => {
      if (prev.includes(filter)) {
        const newFilter = prev.filter((el) => el !== filter);
        saveSetting("selectedSections", newFilter);
        return newFilter;
      }
      saveSetting("selectedSections", [...prev, filter]);
      return [...prev, filter];
    });
  };

  useEffect(() => {
    const selectedSections = getSetting("selectedSections");
    if (selectedSections) {
      setSectionsFilter(selectedSections);
    }
  }, []);

  return (
    <div className="flex gap-2">
      <div className="flex items-center gap-2">
        <SettingsIcon color="#8D95A2" />
        <h4 className="font-bold">Select summary sections:</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {factsHeaders.map((section) => (
          <button
            key={section}
            onClick={() => handleFilterToggle(section)}
            className={`rounded-small border border-light-gray px-3 py-1.5 text-sm ${
              sectionsFilter.includes(section)
                ? "bg-light-main font-bold color-main"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {section}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SummarySectionsFilter;
