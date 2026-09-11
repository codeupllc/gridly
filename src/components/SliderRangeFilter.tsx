import React from 'react';
import { Range, getTrackBackground } from 'react-range';

const STEP = 1;
const TRACK_BG = '#e8e0d2';
const ACCENT = '#c9a96e';

export interface SliderRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const SliderRangeFilter: React.FC<SliderRangeFilterProps> = ({ min, max, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[12px] font-medium tabular-nums text-stone-500">
      Range: {value[0]} – {value[1]}
    </label>
    <Range
      values={value}
      step={STEP}
      min={min}
      max={max}
      onChange={(vals: number[]) => onChange([vals[0], vals[1]])}
      renderTrack={({ props, children }) => (
        <div
          {...props}
          className="my-4 h-1.5 w-full rounded-full"
          style={{
            ...props.style,
            background: getTrackBackground({
              values: value,
              colors: [TRACK_BG, ACCENT, TRACK_BG],
              min,
              max,
            }),
          }}
        >
          {children}
        </div>
      )}
      renderThumb={({ props }) => (
        <div
          {...props}
          className="h-4.5 w-4.5 rounded-full border-2 border-white bg-[#c9a96e] shadow-[0_2px_8px_rgba(201,169,110,0.5)]"
          style={{ ...props.style, height: 18, width: 18 }}
        />
      )}
    />
  </div>
);
