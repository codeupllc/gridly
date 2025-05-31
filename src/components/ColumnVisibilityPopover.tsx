import React from 'react';
import styled from 'styled-components';

const Popover = styled.div`
  background: #fff;
  color: #222;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  border-radius: 12px;
  z-index: 10000;
  overflow: visible;
  min-width: 10rem;
  max-width: 13rem;
  padding: 0.75rem;
  right: 0;
  left: auto;
  transform: translateX(0);
  position: absolute;
`;

const ToggleLabel = styled.label`
  color: #222;
  font-size: 0.97rem;
  gap: 0.4rem;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

const ToggleTrack = styled.div<{ checked: boolean }>`
  width: 1.4rem;
  height: 0.8rem;
  min-width: 1.4rem;
  min-height: 0.8rem;
  background: ${({ checked }: { checked: boolean }) => (checked ? '#2563eb' : '#e5e7eb')};
  border-radius: 999px;
  position: relative;
  transition: background 0.2s;
`;

const ToggleKnob = styled.div<{ checked: boolean }>`
  width: 0.85rem;
  height: 0.85rem;
  position: absolute;
  left: ${({ checked }: { checked: boolean }) => (checked ? '0.65rem' : '0.15rem')};
  top: 0.025rem;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(37,99,235,0.10);
  transition: background 0.2s, transform 0.2s, left 0.2s;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`;

export interface ColumnVisibilityPopoverProps {
    allLeafColumns: any[];
    visibleColumns: any[];
    onHideAll: () => void;
    onShowAll: () => void;
}

export const ColumnVisibilityPopover: React.FC<ColumnVisibilityPopoverProps> = ({
    allLeafColumns,
    visibleColumns,
    onHideAll,
    onShowAll,
}) => (
    <Popover>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>
            <button style={{ color: '#2563eb', fontWeight: 500, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }} onClick={onHideAll} type="button">Hide all</button>
            <button style={{ color: '#888', fontWeight: 500, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }} onClick={onShowAll} type="button">Show all</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 40 }}>
            {allLeafColumns.length === 0 ? (
                <div style={{ color: '#bbb', textAlign: 'center', padding: 16 }}>No columns available</div>
            ) : (
                allLeafColumns.map((col: any) => {
                    const isDisabled = visibleColumns.length === 1 && col.getIsVisible();
                    return (
                        <ToggleLabel key={col.id} style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                            <HiddenCheckbox
                                checked={col.getIsVisible()}
                                onChange={() => col.toggleVisibility()}
                                disabled={isDisabled}
                            />
                            <ToggleTrack checked={col.getIsVisible()}>
                                <ToggleKnob checked={col.getIsVisible()} />
                            </ToggleTrack>
                            <span style={{ marginLeft: 8 }}>
                                {typeof col.columnDef.header === 'function'
                                    ? col.columnDef.header({ column: col })
                                    : col.columnDef.header}
                            </span>
                        </ToggleLabel>
                    );
                })
            )}
        </div>
    </Popover>
); 