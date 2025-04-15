import React, { FC, useEffect, useState } from "react";
import CalendarIcon from "@/icons/CalendarIcon";
import { getSetting, saveSetting } from "@/utils/localStorage";

interface ReportsFilterProps {
  range: {
    id: number;
    label: string;
    notes: number;
  }[];
  onChange: (params: {
    items: { field: string; operator: string; value: number }[];
  }) => void;
}

const ReportsFilter: FC<ReportsFilterProps> = ({ range, onChange }) => {
  const [selectedRange, setSelectedRange] = useState(
    getSetting("selectedRange") || range[range.length - 1].id,
  );

  const isInSelectedRange = (currentId: number) => {
    const selectedIndex = range.findIndex(
      (range) => range.id === selectedRange,
    );
    const currentIndex = range.findIndex((range) => range.id === currentId);
    return currentIndex <= selectedIndex;
  };

  const handleRangeChange = (rangeId: number) => {
    setSelectedRange(rangeId);
    saveSetting("selectedRange", rangeId);
    onChange({
      items: [{ field: "rel_date", operator: "<=", value: rangeId }],
    });
  };

  useEffect(() => {
    const range = getSetting("selectedRange");
    if (range !== null) {
      onChange({
        items: [{ field: "rel_date", operator: "<=", value: range }],
      });
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="text-gray-700 flex items-center gap-2">
        <CalendarIcon />
        <h4 className="font-bold">Reports:</h4>
      </div>
      <div className="flex w-full overflow-hidden rounded-2xl bg-light-gray">
        {range.map((range) => {
          const isInRange = isInSelectedRange(range.id);

          return (
            <div
              key={range.id}
              className={`p-2 ${isInRange ? "reports-filter-active bg-main" : "bg-light-gray"} w-full`}
            >
              <button
                onClick={() => handleRangeChange(range.id)}
                className={`relative flex w-full min-w-[120px] items-center rounded-medium bg-white px-4 py-2 shadow-filter`}
              >
                <div className="flex">
                  <h4 className="filter-label font-bold">{range.label}</h4>
                  <div className="flex items-center text-sm">
                    <span className="mx-1 text-secondary">•</span>
                    <span className="text-secondary">
                      {range.notes > 1
                        ? `${range.notes} notes`
                        : `${range.notes} note`}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsFilter;
