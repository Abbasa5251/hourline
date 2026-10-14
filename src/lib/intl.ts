// Bundled time-zone rules: force FormatJS's Intl.DateTimeFormat (IANA tzdb shipped inside the app) so every
// device converts identically, whatever tz data its OS has. Luxon calls Intl underneath, so it inherits this.
// Refresh by bumping @formatjs/intl-datetimeformat, then run `npx jest` — tz-timeanddate.test.ts must pass.

// Prerequisites; each loads only if the platform lacks it.
import '@formatjs/intl-getcanonicallocales/polyfill.js';
import '@formatjs/intl-locale/polyfill.js';
import '@formatjs/intl-pluralrules/polyfill.js';
import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-numberformat/polyfill.js';
import '@formatjs/intl-numberformat/locale-data/en.js';

// Always replace DateTimeFormat, then load its English data and every IANA zone.
import '@formatjs/intl-datetimeformat/polyfill-force.js';
import '@formatjs/intl-datetimeformat/locale-data/en.js';
import '@formatjs/intl-datetimeformat/add-all-tz.js';
