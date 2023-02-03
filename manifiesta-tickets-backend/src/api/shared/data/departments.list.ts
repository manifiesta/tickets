export const departments = [
  { label: 'Province', labelFr: 'Province', labelNl: 'Provencie', code: 'BASE', id: 1},
  // { label: 'Antwerpen', code: 'ANT', id: 2 },
  // { label: 'Bruxelles & Brabant-Wallon', code: 'BBW', id: 2 },
  // { label: 'Hainaut', code: 'HAI', id: 2 },
  // { label: 'Liège', code: 'LIE', id: 2 },
  // { label: 'Limburg', code: 'LIM', id: 2 },
  // { label: 'Namur & Luxembourg', code: 'NLU', id: 2 },
  // { label: 'Oost-Vlaanderen', code: 'OOV', id: 2 },
  // { label: 'Vlaams-Brabant', code: 'VLB', id: 2 },
  // { label: 'West-Vlaanderen', code: 'WEV', id: 2 },
  { label: 'GVHV', labelFr: 'MPLP', labelNl: 'GVHV', code: 'GVHV', id: 2},
  { label: 'Comac', labelFr: 'Comac', labelNl: 'Comac', code: 'Comac', id: 3 },
  { label: 'Intal', labelFr: 'MPLP', labelNl: 'GVHV', code: 'Intal', id: 4 },
  { label: 'National', labelFr: 'Nationale', labelNl: 'Nationaal',  code: 'National', id: 5 },
];

export const provinces: { label: string, code: string, ranges: { start:number, end:number}[]}[] = [
  {
    label: 'Brussels-WaalsBrabant',
    code: 'BBW',
    ranges: [{start: 1000, end: 1299}, {start:1300, end: 1499}]
  },
  {
    label: 'Namen-Luxemburg',
    code: 'NLU',
    ranges: [{start: 5000, end: 5999},{start:6600, end:6999}]
  },
  {
    label: 'Henegouwen',
    code: 'HAI',
    ranges: [{start: 6000, end: 6599},{start:7000, end:7999}]
  },
  {
    label: 'VlaamsBrabant',
    code: 'VLB',
    ranges: [{start: 1500, end: 1999},{start:3000, end:3499}]
  },
  {
    label: 'Antwerpen',
    code: 'ANT',
    ranges: [{start: 2000, end: 2999}]
  },
  {
    label: 'Limburg',
    code: 'LIM',
    ranges: [{start: 3500, end: 3999}]
  },
  {
    label: 'Luik',
    code: 'LIE',
    ranges: [{start: 4000, end: 4999}]
  },
  {
    label: 'WestVlaanderen',
    code: 'WEV',
    ranges: [{start: 8000, end: 8999}]
  },
  {
    label: 'OostVlaanderen',
    code: 'OOV',
    ranges: [{start: 9000, end: 9999}]
  },
]
