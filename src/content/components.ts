/* The open components, one page each at /stack/<slug>. What each says is
   taken from its repository's README, and a snippet is copied from it, so
   a page claims nothing its code does not bear out. `entries` are the
   ontology's entry ids the component's packages provide. */

export type Snippet = { caption: string; lang: string; code: string };

/* A benchmark's headline: per scenario, the rate each rival reaches,
   copied from a run's summary.md, and a note of whose run it was. The
   component's own row is the one named as it is, or as it is with how
   it ran in brackets after: "postgres-eio (pipelined)". Scenarios in
   one unit share a scale; in different units, each has its own. */
export type Bench = {
  note: string;
  scale?: "shared" | "each";
  scenarios: { name: string; rates: { server: string; rate: number }[] }[];
};

export type Component = {
  slug: string;
  name: string;
  /* Its latest release's tag, set by hand after each release. */
  version: string;
  /* The repository on github.com/hyphatech. */
  repo: string;
  tagline: string;
  about: string[];
  docs?: string;
  packages: string[];
  dune: string;
  entries: string[];
  snippets: Snippet[];
  bench?: Bench;
};

export const repoUrl = (c: Component) => `https://github.com/hyphatech/${c.repo}`;
export const releaseUrl = (c: Component) => `${repoUrl(c)}/releases/tag/${c.version}`;

const opam = (packages: string[]) =>
  ["opam repo add hypha https://github.com/hyphatech/opam-repository.git", `opam install ${packages.join(" ")}`].join("\n");
export const install = (c: Component) => opam(c.packages);

export const components: Component[] = [
  {
    slug: "spindle",
    version: "0.8.0",
    name: "Spindle",
    repo: "spindle",
    tagline: "The Eio-native web framework for modern OCaml.",
    about: [
      "Build typed APIs and web applications, simple to start and ready for production. Handlers are straight-line OCaml, and JSON is derived from your types and validated on the way in, with every mistake reported at once.",
      "Your routes give you interactive OpenAPI docs, served by Scalar. Your types become your front end's schemas, Zod included, so a changed type changes both ends.",
      "Multicore by design. Every HTTP requirement it meets is backed by a test, with secure defaults, bounded waits and clean shutdowns. Postgres, WebSockets, live updates, sessions, logging, traces and metrics are included.",
    ],
    docs: "https://hyphatech.github.io/spindle/",
    packages: ["spindle"],
    dune: `(executable
 (name main)
 (libraries spindle eio_main)
 (preprocess (pps ppx_wiretype)))`,
    entries: ["spindle", "spindle-postgres"],
    snippets: [
      {
        caption: "A route: its method and path, what it reads and what it answers, typed from the records.",
        lang: "ocaml",
        code: `open Spindle.Syntax

type bill = {
  total : float; [@min 0.]
  tip : int; [@min 0] [@max 100]  (** percent *)
  people : int; [@min 1] [@max 50]
}
[@@deriving wiretype]

type share = { each : float } [@@deriving wiretype]

let split b =
  let total = b.total *. float (100 + b.tip) /. 100. in
  Ok { each = total /. float b.people }

let routes =
  [
    Spindle.post
      Spindle.Path.(s "split")
      (Spindle.Returns.json share_json)
      (let+ b = Spindle.json bill_json in
       split b);
  ]

let () =
  Spindle.Log.setup ();
  Eio_main.run @@ fun env ->
  Spindle.serve env (routes @ Spindle.Openapi.docs routes)`,
      },
      {
        caption: "Called. Interactive docs for every route are at /docs, generated from the same routes.",
        lang: "console",
        code: `$ curl localhost:8080/split --json '{"total": 90, "tip": 10, "people": 3}'
{"each":33}`,
      },
    ],
    bench: {
      note: "Sustained RPS on one core, request log on. Apple M4 Pro, Spindle 0.6.0, median of three runs.",
      scenarios: [
        {
          name: "Plaintext",
          rates: [
            { server: "Spindle", rate: 78_800 },
            { server: "Dream", rate: 51_800 },
            { server: "NestJS", rate: 42_500 },
            { server: "FastAPI", rate: 16_500 },
          ],
        },
        {
          name: "JSON",
          rates: [
            { server: "Spindle", rate: 61_200 },
            { server: "Dream", rate: 46_800 },
            { server: "NestJS", rate: 32_500 },
            { server: "FastAPI", rate: 13_500 },
          ],
        },
      ],
    },
  },
  {
    slug: "wiretype",
    version: "0.6.0",
    name: "Wiretype",
    repo: "wiretype",
    tagline: "JSON contracts for OCaml.",
    about: [
      "Define your JSON once and share it across your backend, front end and AI agents. The contract is derived from your OCaml type, with its bounds and docs.",
      "Invalid input is rejected with every mistake reported at once, each with its path and a code a client can act on. The same contract prints as JSON Schema and as Zod, so every side reads the same rules.",
    ],
    packages: ["wiretype", "ppx_wiretype"],
    dune: `(libraries wiretype)
(preprocess (pps ppx_wiretype))`,
    entries: ["wiretype"],
    snippets: [
      {
        caption: "A type, its bounds and its docs, derived as one description.",
        lang: "ocaml",
        code: `module J = Wiretype

(** A line of an order. *)
type line = {
  sku : string;
  quantity : int; [@min 1] [@max 99]  (** how many *)
  note : string option; [@max_length 200]
} [@@deriving wiretype]

let () =
  match J.decode line_json {|{"sku": "A1", "quantity": 120, "note": 7}|} with
  | Ok _ -> ()
  | Error problems ->
      List.iter (fun p -> print_endline (J.Problem.to_string p)) problems`,
      },
      {
        caption: "Every problem in one pass, each with its path and a code a client branches on.",
        lang: "text",
        code: `quantity: This must be at most 99. (too_large)
note: This must be text, not a number. (unexpected_type)`,
      },
      {
        caption: "The same description, printed as Zod for the front end.",
        lang: "typescript",
        code: `/** A line of an order. */
export const LineSchema = z.object({
  sku: z.string(),
  /** how many */
  quantity: z.int().check(z.gte(1), z.lte(99)),
  note: z.optional(z.string().check(z.maxLength(200))),
});
export type Line = z.infer<typeof LineSchema>;`,
      },
    ],
  },
  {
    slug: "rowtype",
    version: "0.8.1",
    name: "Rowtype",
    repo: "rowtype",
    tagline: "Typed Postgres queries and migrations for OCaml 5.",
    about: [
      "Write your queries in plain SQL and run them typed. Every query is checked against your database's schema before you deploy, so your app never sends one that no longer matches it.",
      "Runs on postgres-eio, a native driver with TLS, pooling and failover.",
    ],
    packages: ["rowtype", "rowtype-postgres", "rowtype-migrate"],
    dune: "(libraries rowtype rowtype-postgres eio_main)",
    entries: ["rowtype"],
    snippets: [
      {
        caption: "Statements: the SQL as written, with typed parameters and rows, and how many rows each answers.",
        lang: "ocaml",
        code: `module S = Rowtype
module Pg = Rowtype_postgres

type user = { id : int; name : string }

let user =
  S.map (S.t2 S.int S.text)
    ~parse:(fun (id, name) -> { id; name })
    ~print:(fun u -> (u.id, u.name))

let add_user =
  S.find ~params:S.text ~row:S.int
    "insert into users (name) values ($1) returning id"

let find_user =
  S.find_opt ~params:S.int ~row:user "select id, name from users where id = $1"`,
      },
      {
        caption: "Run on a connection; every failure is a value.",
        lang: "ocaml",
        code: `let* db =
  Pg.connect ~sw ~net:(Eio.Stdenv.net env)
    ~mono_clock:(Eio.Stdenv.mono_clock env) target
in
let* id = Pg.run db add_user "Ada" in
Pg.run db find_user id`,
      },
    ],
  },
  {
    slug: "postgres-eio",
    version: "0.5.1",
    name: "postgres-eio",
    repo: "postgres-eio",
    tagline: "A native Postgres driver for OCaml 5 and Eio.",
    about: [
      "Feature-complete: TLS with SCRAM and client certificates, a connection pool, failover and load balancing across hosts, streamed COPY, and LISTEN/NOTIFY that reconnects by itself. Errors and logs never contain your parameters or passwords.",
    ],
    packages: ["postgres-eio"],
    dune: "(libraries postgres-eio eio_main)",
    entries: ["postgres-eio"],
    snippets: [
      {
        caption: "A query, its rows folded as they arrive and never buffered.",
        lang: "ocaml",
        code: `let names =
  Postgres_eio.query conn
    "select name from customers where country = $1"
    ~params:[ Some "GB" ] ~init:[]
    ~row:(fun names row ->
      match row with [| Some name |] -> name :: names | _ -> names)`,
      },
      {
        caption: "Both libpq forms of connection string; with none given, a connection that crosses a network is encrypted.",
        lang: "text",
        code: `postgres://user:pass@host:5432/db?sslmode=require
host=db user=app sslmode=require`,
      },
    ],
    bench: {
      note: "Operations per second on one connection, Postgres 18.6 in Docker on an Apple M4 Pro, postgres-eio 0.5.1, median of three runs. A query is one round trip, rows are read 100,000 a query, and postgres-eio pipelines its 1,000 inserts into one round trip, which libpq and postgres_async cannot. libpq, in C, spends about a third of the CPU a query.",
      scale: "each",
      scenarios: [
        {
          name: "Queries",
          rates: [
            { server: "libpq", rate: 4_090 },
            { server: "postgres-eio", rate: 3_510 },
            { server: "postgres_async", rate: 2_040 },
          ],
        },
        {
          name: "Rows read",
          rates: [
            { server: "postgres-eio", rate: 7_190_000 },
            { server: "postgres_async", rate: 6_910_000 },
            { server: "libpq", rate: 5_600_000 },
          ],
        },
        {
          name: "Inserts",
          rates: [
            { server: "postgres-eio (pipelined)", rate: 396_900 },
            { server: "libpq", rate: 3_970 },
            { server: "postgres_async", rate: 1_840 },
          ],
        },
      ],
    },
  },
  {
    slug: "spool",
    version: "0.4.0",
    name: "Spool",
    repo: "spool",
    tagline: "A durable job queue in your own Postgres, for OCaml 5 and Eio.",
    about: [
      "Fewer moving parts: jobs live in the database you already run, commit or roll back with your own changes, and are backed up with your data. Anything from a quick email to long-running work, scheduled, prioritised and retried with backoff.",
    ],
    packages: ["spool"],
    dune: "(libraries spool rowtype-postgres eio_main)",
    entries: ["spool"],
    snippets: [
      {
        caption: "A kind: its name, its payload's Wiretype description and its queue. Enqueued in the caller's transaction.",
        lang: "ocaml",
        code: `let receipt =
  Spool.Kind.make ~queue:"mail" ~timeout:Mtime.Span.min "receipt.send"
    order

(* in the caller's transaction, through its own connection *)
Spool.enqueue conn ~now ~unique:order_id receipt order_id`,
      },
      {
        caption: "A runner, with two workers on the mail queue.",
        lang: "ocaml",
        code: `let runner =
  Spool.Runner.create ~sw ~net ~mono_clock ~now
    ~queues:[ ("mail", 2) ]
    [ Spool.handle receipt (fun _job order_id -> send_receipt order_id) ]
    conninfo
in
Spool.Runner.start runner`,
      },
    ],
  },
  {
    slug: "solidtype",
    version: "0.1.0",
    name: "Solidtype",
    repo: "solidtype",
    tagline: "Typed OCaml front ends on SolidJS and Kobalte.",
    about: [
      "Write your components in OCaml's JSX, and the browser gets the same code Solid's own compiler emits. A reactive read in the wrong place does not compile, and neither does a prop left out, an attribute an element does not take, or a missed case.",
      "[Solid](https://www.solidjs.com) and [Kobalte](https://kobalte.dev) are bound whole, server rendering included, with every element's attributes typed from Solid's own JSX types.",
    ],
    packages: ["solidtype", "ppx_solidtype", "mlx"],
    dune: `(library
 (name app)
 (modes melange)
 (libraries solidtype melange.dom)
 (preprocess (pps melange.ppx ppx_solidtype)))`,
    entries: ["solidtype"],
    snippets: [
      {
        caption: "A JSX component.",
        lang: "ocaml",
        code: `module Jsx = Solidtype.Jsx
module Solid = Solidtype.Solid

let make () =
  let count, set_count = Solid.create_signal 0 in
  <button type_=\`button on_click=(fun _ -> Solid.update set_count succ)>
    "Clicked " (fun () -> Jsx.int (Solid.get count))
  </button>`,
      },
      {
        caption: "Seamless integration with Solid.",
        lang: "js",
        code: `import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import solidtype from "vite-plugin-solidtype";

export default defineConfig({ plugins: [solidtype(), solid()] });`,
      },
    ],
  },
];

/* The page that provides an ontology entry, if one does. */
export const byEntry = (entry: string) => components.find((c) => c.entries.includes(entry));
