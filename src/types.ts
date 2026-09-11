export type TableThemeName = 'light' | 'dark' | 'blue' | 'green' | 'slate';

export interface TableTheme {
    container?: string;
    header?: string;
    groupChip?: string;
    row?: string;
    rowBg?: string;
    rowHover?: string;
    groupedRow?: string;
    selected?: string;
    border?: string;
    input?: string;
    filterInput?: string;
    inputPlaceholder?: string;
    muted?: string;
    button?: string;
}
