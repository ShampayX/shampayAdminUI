// theme
import palette from '../../theme/palette';
//
import { ThemeColorPresetsValue } from './types';

// ----------------------------------------------------------------------

const themePalette = palette('light');

export const presets = [
  // DEFAULT
  {
    name: 'default',
    ...themePalette.primary,
  },
  // CYAN
  {
    name: 'cyan',
    lighter: '#CCF4FE',
    light: '#68CDF9',
    main: '#078DEE',
    dark: '#0351AB',
    darker: '#012972',
    contrastText: '#FFFFFF',
  },
  // PURPLE
  {
    name: 'purple',
    lighter: '#EBD6FD',
    light: '#B985F4',
    main: '#7635dc',
    dark: '#431A9E',
    darker: '#200A69',
    contrastText: '#FFFFFF',
  },
  // BLUE
  {
    name: 'blue',
    lighter: '#D1E9FC',
    light: '#76B0F1',
    main: '#2065D1',
    dark: '#103996',
    darker: '#061B64',
    contrastText: '#FFFFFF',
  },
  // ORANGE
  {
    name: 'orange',
    lighter: '#FEF4D4',
    light: '#FED680',
    main: '#fda92d',
    dark: '#B66816',
    darker: '#793908',
    contrastText: themePalette.grey[800],
  },
  // RED
  {
    name: 'red',
    lighter: '#FFE3D5',
    light: '#FFC1AC',
    main: '#FF3030',
    dark: '#B71833',
    darker: '#7A0930',
    contrastText: '#FFFFFF',
  },
  // Green
  {
    name: 'Green',
    lighter: '#33BC77',
    light: '#1AB366',
    main: '#00AB55',
    dark: '#00913C',
    darker: '#007822',
    contrastText: '#FFFFFF',
  },
  // PLAIN - neutral graphite, used by the sidebar "Plain" switch.
  // Keep this last: `defaultPreset` is picked by index from REACT_APP_PRESET.
  {
    name: 'plain',
    lighter: '#E8EBEF',
    light: '#A7B0BC',
    main: '#454F5B',
    dark: '#2B333C',
    darker: '#161C24',
    contrastText: '#FFFFFF',
  },
];

export const cyanPreset = presets[1];
export const purplePreset = presets[2];
export const bluePreset = presets[3];
export const orangePreset = presets[4];
export const redPreset = presets[5];
export const plainPreset = presets[7];

/**
 * The portal brand accent. Everything that reads as "theme colour" - MUI
 * `primary`, the sidebar highlight, focus rings, links, selected states -
 * resolves here, so there is exactly one purple in the app.
 */
export const brandPreset = purplePreset;

/**
 * `REACT_APP_PRESET` can still point a white-label build at another preset by
 * index. An unset or out-of-range value falls back to the brand instead of
 * leaving `primary` undefined.
 */
export const defaultPreset =
  presets[Number(process.env.REACT_APP_PRESET)] ?? brandPreset;

export const presetsOption = presets.map((color) => ({
  name: color.name,
  value: color.main,
}));

export function getPresets(key: ThemeColorPresetsValue) {
  return (
    {
      default: defaultPreset,
      cyan: cyanPreset,
      purple: purplePreset,
      blue: bluePreset,
      orange: orangePreset,
      red: redPreset,
      plain: plainPreset,
    }[key] || defaultPreset
  );
}
