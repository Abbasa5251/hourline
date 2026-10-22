// timeanddate.com's names for abbreviations tzdb writes differently, keyed by zone then tzdb's abbreviation.
// tzdb only records abbreviations in common English use and writes "+0545" for the rest; everything it does name
// (PDT, CET, IST, AEST, …) comes straight from the bundled data, so rule changes relabel themselves on a bump.
// Keyed by tzdb's abbreviation, not the offset, so Istanbul is EEST in summer 2015 and TRT once tzdb says "+03".
const CHILE = { '-04': 'CLT', '-03': 'CLST' };
const INDOCHINA = { '+07': 'ICT' };

export const ABBR: Record<string, Record<string, string>> = {
  // Americas
  'America/Sao_Paulo': { '-03': 'BRT', '-02': 'BRST' },
  'America/Argentina/Buenos_Aires': { '-03': 'ART' },
  'America/Santiago': CHILE,
  'America/Coyhaique': CHILE, // timeanddate keeps CLST for Aysén's permanent −3 (2025)
  'America/Bogota': { '-05': 'COT', '-04': 'COST' },
  'America/Lima': { '-05': 'PET' },
  'America/Caracas': { '-04': 'VET', '-0430': 'VET' },
  // Europe
  'Europe/Istanbul': { '+03': 'TRT' },
  // Africa & Middle East
  // UTC+0 is named GMT since the permanent switch on 2026-09-20 (timeanddate said WET for earlier Ramadan +0).
  'Africa/Casablanca': { '+00': 'GMT', '+01': 'WEST' },
  'Asia/Dubai': { '+04': 'GST' },
  'Asia/Riyadh': { '+03': 'AST' },
  'Asia/Tehran': { '+0330': 'IRST', '+0430': 'IRDT' },
  // Asia
  'Asia/Kathmandu': { '+0545': 'NPT' },
  'Asia/Dhaka': { '+06': 'BST' },
  'Asia/Bangkok': INDOCHINA,
  'Asia/Ho_Chi_Minh': INDOCHINA,
  'Asia/Singapore': { '+08': 'SGT' },
  'Asia/Kuala_Lumpur': { '+08': 'MYT' },
  'Asia/Manila': { PST: 'PHST', PDT: 'PHDT' },
  // Oceania
  'Australia/Lord_Howe': { '+1030': 'LHST', '+11': 'LHDT' },
  'Pacific/Chatham': { '+1245': 'CHAST', '+1345': 'CHADT' },
  'Pacific/Fiji': { '+12': 'FJT', '+13': 'FJST' },
  'Pacific/Kiritimati': { '+14': 'LINT' },
};
