/* A benchmark's rate as a chart prints it: millions to a tenth, anything
   less to the nearest ten, so a figure counting up settles on the one
   the page was built with. */
export const formatRate = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : (Math.round(n / 10) * 10).toLocaleString("en-US");
