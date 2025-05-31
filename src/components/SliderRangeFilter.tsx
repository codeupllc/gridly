import React from 'react';
import { Range, getTrackBackground } from 'react-range';
import styled from 'styled-components';

const STEP = 1;

const RangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RangeLabel = styled.label`
  font-size: 0.95rem;
  color: #444;
`;

const StyledTrack = styled.div`
  height: 6px;
  width: 100%;
  border-radius: 4px;
  background: #e5e7eb;
  margin: 1.5em 0;
`;

const Thumb = styled.div`
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px #aaa;
`;

export interface SliderRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const SliderRangeFilter: React.FC<SliderRangeFilterProps> = ({ min, max, value, onChange }) => (
  <RangeContainer>
    <RangeLabel>
      Range: {value[0]} – {value[1]}
    </RangeLabel>
    <Range
      values={value}
      step={STEP}
      min={min}
      max={max}
      onChange={(vals: number[]) => onChange([vals[0], vals[1]])}
      renderTrack={({ props, children }) => (
        <StyledTrack
          {...props}
          style={{
            ...props.style,
            background: getTrackBackground({
              values: value,
              colors: ['#e5e7eb', '#2563eb', '#e5e7eb'],
              min,
              max,
            }),
          }}
        >
          {children}
        </StyledTrack>
      )}
      renderThumb={({ props }) => <Thumb {...props} />}
    />
  </RangeContainer>
); 