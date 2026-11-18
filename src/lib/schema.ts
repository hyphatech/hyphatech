export const organization = {
  "@type": "Organization",
  "@id": "https://hyphatech.io/#organization",
  name: "Hypha",
  legalName: "Hypha Technologies Ltd",
  url: "https://hyphatech.io/",
  logo: "https://hyphatech.io/apple-touch-icon.png",
  sameAs: ["https://github.com/hyphatech", "https://hypha.pub/"],
};

export const website = {
  "@type": "WebSite",
  "@id": "https://hyphatech.io/#website",
  name: "Hypha Technologies",
  alternateName: ["Hypha", "hyphatech.io"],
  url: "https://hyphatech.io/",
  publisher: { "@id": organization["@id"] },
};
