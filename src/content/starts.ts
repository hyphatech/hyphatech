/* Where a company starts: its pain, in its own words, and what changes. */

import BookOpenText from "@lucide/astro/icons/book-open-text";
import Split from "@lucide/astro/icons/split";
import Plug from "@lucide/astro/icons/plug";
import ServerOff from "@lucide/astro/icons/server-off";
import Construction from "@lucide/astro/icons/construction";
import Rocket from "@lucide/astro/icons/rocket";
import type { Card } from "./factory";

export const starts: Card[] = [
  { icon: BookOpenText, title: "Only a few people understand it", body: "What they know is written down with them, in a record the business owns." },
  { icon: Split, title: "Fixing one thing breaks another", body: "The logic behind it is untangled first, and rebuilt the way it should have been." },
  { icon: Plug, title: "It can't integrate with modern services", body: "Payments, accounting, email and the rest are wired into your system properly." },
  { icon: ServerOff, title: "Its technology is no longer supported", body: "What matters is rebuilt on a sound foundation that evolves with the business." },
  { icon: Construction, title: "A rewrite stalled halfway through", body: "What was built is compared with the old system and finished." },
  { icon: Rocket, title: "A prototype customers now depend on", body: "What it proved is kept, and the rest is rebuilt to hold as it grows." },
];
