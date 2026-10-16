/* The open components, one page each at /stack/<slug>. What each says is
   taken from its repository's README, and a snippet is copied from it, so
   a page claims nothing its code does not bear out. `entries` are the
   ontology's entry ids the component's packages provide. */

export type Snippet = { caption: string; lang: string; code: string };

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
};

export const repoUrl = (c: Component) => `https://github.com/hyphatech/${c.repo}`;
export const releaseUrl = (c: Component) => `${repoUrl(c)}/releases/tag/${c.version}`;

const opam = (packages: string[]) =>
  ["opam repo add hypha https://github.com/hyphatech/opam-repository.git", `opam install ${packages.join(" ")}`].join("\n");
export const install = (c: Component) => opam(c.packages);

export const components: Component[] = [
  {
    slug: "spindle",
    version: "0.6.1",
    name: "Spindle",
    repo: "spindle",
    tagline: "The Eio-native web framework for modern OCaml.",
    about: [
      "Typed routes, dependencies and answers, on its own HTTP/1.1 engine: every requirement of RFC 9112 and 9110 it meets is a test, and so are WebSockets, forms and Structured Fields.",
      "Interactive OpenAPI docs and front-end schemas come from the routes the server runs. Postgres, sessions, logging, traces and metrics are in the box.",
    ],
    docs: "https://hyphatech.github.io/spindle/",
    packages: ["spindle", "spindle-postgres", "spindle-cli"],
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
  },
  {
    slug: "wiretype",
    version: "0.5.0",
    name: "Wiretype",
    repo: "wiretype",
    tagline: "JSON contracts for OCaml.",
    about: [
      "Describe a JSON shape once, or derive it from your type. That one value reads a document and reports every problem in it, writes a value, checks the bounds it states, and prints itself as JSON Schema 2020-12 and as Zod.",
      "A server, a browser and a model's tool call read the same contract. It depends on Ptime, Mtime and Uuidm alone.",
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
      "You write the SQL. You declare its parameters and rows once, and that one declaration binds the values going in and decodes the rows coming out. No ORM, no query DSL, no ppx.",
      "Every statement can be checked against your database from a test, without running it, and migrations are in the box.",
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
    version: "0.5.0",
    name: "postgres-eio",
    repo: "postgres-eio",
    tagline: "A native Postgres driver for OCaml 5 and Eio.",
    about: [
      "Protocol 3.0 and 3.2 over TCP, Unix sockets and TLS, with multi-host failover and load balancing; SCRAM-SHA-256 with channel binding; statement caching, pipelining, COPY and LISTEN/NOTIFY.",
      "A connection pool lends every connection in a clean state. Every failure is a value, and its errors and logs never contain parameters, passwords or message bytes.",
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
  },
  {
    slug: "spool",
    version: "0.3.1",
    name: "Spool",
    repo: "spool",
    tagline: "A durable job queue in your own Postgres, for OCaml 5 and Eio.",
    about: [
      "A job is a row written in the transaction that made the work owed, claimed by a runner under a lease, run outside every transaction, retried with backoff, and finished once however often it was attempted.",
      "It runs over Rowtype's Postgres backend and names no driver. Runners in several processes claim from one queue without waiting on each other.",
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
];

/* The page that provides an ontology entry, if one does. */
export const byEntry = (entry: string) => components.find((c) => c.entries.includes(entry));
