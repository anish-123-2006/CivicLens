import React from 'react';

export type PaletteMode = 'light' | 'dark';
export interface ColorModeValue {
  toggleColorMode: () => void;
  mode: PaletteMode;
}

export const ColorModeContext: React.Context<ColorModeValue>;
export default ColorModeContext;
