/* The open components, one page each at /stack/<slug>. What each says is
   taken from its repository's README, and a snippet is copied from it, so
   a page claims nothing its code does not bear out. `entries` are the
   ontology's entry ids the component's packages provide. */

type Snippet = { caption: string; lang: string; code: string };

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
  then?: string[];
  dune: string;
  entries: string[];
  snippets: Snippet[];
};

export const repoUrl = (c: Component) => `https://github.com/hyphatech/${c.repo}`;

const opam = (packages: string[]) =>
  ["opam repo add open-opam https://github.com/open-opam/opam-repository.git", `opam install ${packages.join(" ")}`].join("\n");
export const install = (c: Component) => [opam(c.packages), ...(c.then ?? [])].join("\n");
/* Its first package's page in open-opam's catalogue. */
export const opamUrl = (c: Component) => `https://open-opam.org/packages/${c.packages[0]}/`;

export const components: Component[] = [
  {
    slug: "spindle",
    version: "0.15.1",
    name: "Spindle",
    repo: "spindle",
    tagline: "The web framework for modern OCaml.",
    about: [
      "Build typed APIs and web applications, fast and ergonomic. Handlers are straight-line OCaml on Eio, multicore by design, and JSON is derived from your types with every input validated.",
      "Your routes give you interactive OpenAPI docs, served by Scalar. Your types become your front end's schemas, Zod or Melange, so a changed type changes both ends.",
      "RFC-strict, on its own HTTP/1.1 engine: every requirement it meets is a test, for HTTP, WebSockets, forms and Structured Fields. SQLite and Postgres, WebSockets, server-sent events, sessions, logging, traces and metrics are included.",
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
  Spindle.serve env (routes @ Spindle.Openapi.routes routes)`,
      },
      {
        caption: "Called. Interactive docs for every route are at /docs, generated from the same routes.",
        lang: "console",
        code: `$ curl localhost:8080/split --json '{"total": 90, "tip": 10, "people": 3}'
{"each":33}`,
      },
    ],
  },
  {
    slug: "wiretype",
    version: "0.7.1",
    name: "Wiretype",
    repo: "wiretype",
    tagline: "JSON contracts for modern OCaml.",
    about: [
      "Define your JSON once and share it across your backend, front end and AI agents. Your records, variants and recursive types are the contract, their bounds and docs included.",
      "Invalid input is refused with every mistake at once, each at its path with a code a client can act on. One walk prints JSON Schema, Zod and a Melange module, held to the server's verdict on every test run, so a form finds what is wrong before it sends.",
    ],
    docs: "https://hyphatech.github.io/wiretype/",
    packages: ["wiretype", "ppx_wiretype"],
    dune: `(libraries wiretype)
(preprocess (pps ppx_wiretype))`,
    entries: ["wiretype"],
    snippets: [
      {
        caption: "A type, its bounds and its docs, derived as one description.",
        lang: "ocaml",
        code: `type line = {
  sku : string;
  quantity : int; [@min 1] [@max 99]  (** how many *)
  note : string option; [@max_length 200]
}
[@@deriving wiretype]
(** A line of an order. *)

Wiretype.decode line_json {|{"sku": "A1", "quantity": 120, "note": 7}|}`,
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
    version: "0.10.3",
    name: "Rowtype",
    repo: "rowtype",
    tagline: "SQL queries and migrations for modern OCaml.",
    about: [
      "Write your queries in plain SQL, with no ORM, no query DSL and no ppx, and run them typed. Every statement is described by your database from a test, without running it, so a renamed column fails a test instead of a request.",
      "The same statements run on Postgres and SQLite. Migrations come in the box as plain SQL files and one command, a library's own included. A refused write names its constraint and a lost write is told from one never sent, and rows of any size are read in the memory of one, with loads through COPY.",
    ],
    docs: "https://hyphatech.github.io/rowtype/",
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
    version: "0.5.3",
    name: "postgres-eio",
    repo: "postgres-eio",
    tagline: "The Postgres driver for modern OCaml.",
    about: [
      "Fast, secure and feature-complete. TLS, SCRAM-SHA-256 with channel binding and client certificates, and a connection that crosses a network is encrypted unless its string says otherwise. One pool serves every domain, across several hosts, with failover and load balancing.",
      "Statement caching, pipelining and batches keep work to one round trip. COPY streams in and out, rows are folded as they arrive, and LISTEN/NOTIFY reconnects by itself. Every failure says whether the statement may have run, so a retry is never blind.",
    ],
    docs: "https://hyphatech.github.io/postgres-eio/",
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
  },
  {
    slug: "spool",
    version: "0.7.1",
    name: "Spool",
    repo: "spool",
    tagline: "Durable jobs for modern OCaml, backed by Postgres.",
    about: [
      "Jobs live in the database you already run. A job is a row written with the work that made it owed, so a rollback leaves no job, and several processes share one queue with claims that never wait on each other, under leases a heartbeat renews.",
      "Retried with backoff or after what an upstream said, scheduled, prioritised and recurring, and a second request for the same job folds into the one already waiting. A job may wait for others, and a queue's limits hold across every runner. Tests never sleep: one call runs every job due at the test's own clock.",
      "A live dashboard comes as routes of your own Spindle server, open to whom you say and for what: watch the queue, retry, cancel or delete a job, pause a queue and set its limits.",
    ],
    docs: "https://hyphatech.github.io/spool/",
    packages: ["spool", "rowtype-migrate"],
    dune: "(libraries spool rowtype-postgres eio_main)",
    entries: ["spool"],
    snippets: [
      {
        caption: "A kind, enqueued with the order it is owed for: a rollback leaves neither.",
        lang: "ocaml",
        code: `let receipt = Spool.Kind.make ~queue:"mail" "receipt.send" order

let take_order conn ~now email =
  Pg.Transaction.within conn @@ fun conn ->
  let* order = Pg.run conn insert_order email in
  Spool.enqueue conn ~now ~unique:(string_of_int order) receipt order`,
      },
      {
        caption: "A runner, two workers on the mail queue.",
        lang: "ocaml",
        code: `let runner ~sw env conninfo =
  Spool.Runner.create ~sw ~net:(Eio.Stdenv.net env)
    ~mono_clock:(Eio.Stdenv.mono_clock env)
    ~now:Ptime_clock.now
    ~queues:[ ("mail", 2) ]
    [ Spool.handle receipt (fun _job order -> send_receipt order) ]
    conninfo`,
      },
    ],
  },
  {
    slug: "solidtype",
    version: "0.15.1",
    name: "Solidtype",
    repo: "solidtype",
    tagline: "SolidJS for modern OCaml.",
    about: [
      "Write your components in OCaml's JSX, and the browser gets the same code Solid's own compiler emits. Fast, accessible and reactivity-safe: a reactive read in the wrong place does not compile, and neither does a prop left out or an attribute an element does not take.",
      "[Solid](https://www.solidjs.com) is bound whole, with [Kobalte](https://kobalte.dev), [HeroUI](https://www.heroui.com), Gravity UI's icons, rhp's charts and @internationalized/date's dates included.",
    ],
    docs: "https://hyphatech.github.io/solidtype/",
    packages: ["solidtype", "solidtype-heroui"],
    then: ["bun add $(opam show solidtype-heroui --field x-npm-depends)"],
    dune: `(library
 (name app)
 (modes melange)
 (libraries solidtype solidtype-kobalte solidtype-heroui melange.dom)
 (preprocess (pps melange.ppx ppx_solidtype)))`,
    entries: ["solidtype"],
    snippets: [
      {
        caption: "A JSX component.",
        lang: "ocaml",
        code: `module Jsx = Solidtype.Jsx
module Solid = Solidtype.Solid
module Button = Solidtype_heroui.Button

let make () =
  let count, set_count = Solid.create_signal 0 in
  <Button variant=\`secondary on_click=(fun _ -> Solid.update set_count succ)>
    "Clicked " (Jsx.int (Solid.get count))
  </Button>`,
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

