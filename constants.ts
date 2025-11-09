import { TemplateInfo, ColorTheme } from './types';
import {
  ModernPreview,
  ClassicPreview,
  CreativePreview,
  MinimalistPreview,
  BoldPreview,
  RetroPreview,
  CorporatePreview,
  ElegantPreview,
  FriendlyPreview,
  TechnicalPreview,
  EarthyPreview,
  SwissPreview,
} from './components/TemplatePreviews';

export const TEMPLATES: TemplateInfo[] = [
  { id: 'modern', name: 'Modern', previewComponent: ModernPreview },
  { id: 'classic', name: 'Classic', previewComponent: ClassicPreview },
  { id: 'creative', name: 'Creative', previewComponent: CreativePreview },
  { id: 'minimalist', name: 'Minimalist', previewComponent: MinimalistPreview },
  { id: 'bold', name: 'Bold', previewComponent: BoldPreview },
  { id: 'retro', name: 'Retro', previewComponent: RetroPreview },
  { id: 'corporate', name: 'Corporate', previewComponent: CorporatePreview },
  { id: 'elegant', name: 'Elegant', previewComponent: ElegantPreview },
  { id: 'friendly', name: 'Friendly', previewComponent: FriendlyPreview },
  { id: 'technical', name: 'Technical', previewComponent: TechnicalPreview },
  { id: 'earthy', name: 'Earthy', previewComponent: EarthyPreview },
  { id: 'swiss', name: 'Swiss', previewComponent: SwissPreview },
];

export const NOTE_COLORS = ['#FFFDE7', '#FFF3E0', '#E8F5E9', '#E1F5FE', '#EDE7F6', '#FFEBEE'];
export const NOTE_COLORS_BORDER = [
  '#FBC02D',
  '#FFB74D',
  '#81C784',
  '#4FC3F7',
  '#B39DDB',
  '#E57373',
];

export const PREFERENCE_TAGS = ['Email', 'Call'];

export const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Software & Subscriptions',
  'Travel',
  'Meals & Entertainment',
  'Marketing & Advertising',
  'Professional Services',
  'Utilities',
  'Other',
];

export const THEMES: ColorTheme[] = [
  {
    name: 'Blue',
    colors: {
      '50': '239 246 255',
      '100': '219 234 254',
      '200': '191 219 254',
      '300': '147 197 253',
      '400': '96 165 250',
      '500': '59 130 246',
      '600': '37 99 235',
      '700': '29 78 216',
      '800': '30 64 175',
      '900': '30 58 138',
      '950': '23 37 84',
    },
    swatchColor: '#3b82f6',
  },
  {
    name: 'Green',
    colors: {
      '50': '240 253 244',
      '100': '220 252 231',
      '200': '187 247 208',
      '300': '134 239 172',
      '400': '74 222 128',
      '500': '34 197 94',
      '600': '22 163 74',
      '700': '21 128 61',
      '800': '22 101 52',
      '900': '20 83 45',
      '950': '5 46 22',
    },
    swatchColor: '#22c55e',
  },
  {
    name: 'Purple',
    colors: {
      '50': '245 243 255',
      '100': '237 233 254',
      '200': '221 214 254',
      '300': '196 181 253',
      '400': '167 139 250',
      '500': '139 92 246',
      '600': '124 58 237',
      '700': '109 40 217',
      '800': '91 33 182',
      '900': '76 29 149',
      '950': '46 16 101',
    },
    swatchColor: '#8b5cf6',
  },
  {
    name: 'Rose',
    colors: {
      '50': '255 241 242',
      '100': '255 228 230',
      '200': '254 205 211',
      '300': '253 164 175',
      '400': '251 113 133',
      '500': '244 63 94',
      '600': '225 29 72',
      '700': '190 18 60',
      '800': '159 18 57',
      '900': '136 19 55',
      '950': '76 5 25',
    },
    swatchColor: '#f43f5e',
  },
  {
    name: 'Orange',
    colors: {
      '50': '255 247 237',
      '100': '255 237 213',
      '200': '254 215 170',
      '300': '253 186 116',
      '400': '251 146 60',
      '500': '249 115 22',
      '600': '234 88 12',
      '700': '194 65 12',
      '800': '154 52 18',
      '900': '124 45 18',
      '950': '69 10 7',
    },
    swatchColor: '#f97316',
  },
];
