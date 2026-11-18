/* Held once so every page quotes the same words. Rules for editing:
   - A decimal deepens or qualifies the one above, never repeats it.
   - A term the argument coins is defined where it first appears, and
     one idea keeps one word: software (1), meaning (1.1), states and
     operations (1.11), part and composition (1.21), capability and
     domain (1.22), effect (1.31), foundation (2.3), system (2.33),
     correct (3.1), check (3.21), ontology (3.3), type (4.1). A word
     every reader knows, such as agent, is not defined.
   - Each line names its subject, states rather than advises, names no
     product, and promises no flawless application.
   - Never name the form's source or explain it.
   - The argument ends on enforcement, not review; 7 stands alone. */

export interface Proposition {
  n: string;
  text: string;
}

export const propositions: Proposition[] = [
  { n: "1", text: "Software is meaning made executable." },
  {
    n: "1.1",
    text: "The meaning of a thing is what it is, what it may become and what may be done with it.",
  },
  {
    n: "1.11",
    text: "The conditions a thing can be in are its states. Its state determines which operations are allowed.",
  },
  { n: "1.2", text: "Software is built by composition." },
  { n: "1.21", text: "Composition joins parts, each with a meaning of its own." },
  { n: "1.22", text: "Some parts provide capabilities. Others hold the rules of a domain." },
  { n: "1.23", text: "Capabilities recur from product to product. A domain belongs to one." },
  { n: "1.3", text: "Every part carries assumptions about data, effects and failure." },
  { n: "1.31", text: "An effect is whatever a part does to the world beyond it." },
  { n: "1.32", text: "Where those assumptions differ, integration work begins." },
  { n: "1.33", text: "Differences of convention add integration cost, not meaning." },
  { n: "1.4", text: "The cost of software lies as much in the joins as in the parts." },

  { n: "2", text: "Whatever meaning is left unstated is guessed." },
  { n: "2.1", text: "Each guess becomes an assumption carried by the part that embodies it." },
  { n: "2.11", text: "Two reasonable guesses can contradict each other." },
  { n: "2.12", text: "Software built on contradictory guesses breaks at its joins." },
  { n: "2.2", text: "An agent changes what code costs, not what code must do." },
  { n: "2.21", text: "An agent guesses at the meaning its instructions leave unstated." },
  { n: "2.22", text: "The faster agents write, the more guesses become code." },
  { n: "2.3", text: "An agent's foundation is the parts, conventions and language it builds on." },
  { n: "2.31", text: "An agent inherits the strengths and omissions of its foundation." },
  { n: "2.32", text: "Whatever a foundation permits, an agent will write." },
  { n: "2.33", text: "A foundation and the software built on it form one system." },
  { n: "2.4", text: "Errors are certain. Their kinds are not." },
  {
    n: "2.41",
    text: "A foundation decides which kinds are prevented, which are exposed and which get through.",
  },
  { n: "2.5", text: "A review is a judgement, not a proof." },
  { n: "2.51", text: "People decide what software must mean." },
  { n: "2.52", text: "An agent decides within the boundaries of its foundation." },

  { n: "3", text: "Correctness must be made explicit." },
  { n: "3.1", text: "Software is correct when it does what its meaning says." },
  { n: "3.11", text: "Correctness can be judged only against stated meaning." },
  { n: "3.2", text: "An instruction can be ignored. A check cannot." },
  { n: "3.21", text: "A check makes a stated property enforceable." },
  { n: "3.22", text: "A rule left unchecked will eventually be broken." },
  { n: "3.3", text: "An ontology makes meaning explicit." },
  {
    n: "3.31",
    text: "An ontology describes the things a system represents and how they relate.",
  },
  { n: "3.32", text: "An ontology left unchecked is only a description." },
  { n: "3.4", text: "Every state a thing can take must be named." },
  { n: "3.41", text: "An unnamed state is handled by accident, or not at all." },
  { n: "3.5", text: "External input is untrusted until it is validated." },
  { n: "3.51", text: "Data is validated once, where it enters." },
  { n: "3.6", text: "A part may cause only the effects it is given." },

  { n: "4", text: "A language decides what can be stated." },
  { n: "4.1", text: "Types describe the states data can take and the operations allowed on it." },
  { n: "4.11", text: "Invalid states must be unrepresentable." },
  { n: "4.12", text: "The type of validated data records its guarantees." },
  {
    n: "4.13",
    text: "Not every rule of a domain fits in a type. Every rule that fits belongs there.",
  },
  { n: "4.2", text: "Code must state plainly what it means to do." },
  { n: "4.21", text: "A person can judge only what the code makes plain." },
  { n: "4.3", text: "A language is one layer of a foundation, not the whole of it." },
  { n: "4.31", text: "No language makes software correct on its own." },
  { n: "4.32", text: "Types rule out kinds of error, not errors of logic." },
  { n: "4.4", text: "What types cannot rule out must be tested." },
  {
    n: "4.41",
    text: "Tests challenge behaviour. They reveal errors, never their absence.",
  },
  {
    n: "4.42",
    text: "A test written from the meaning challenges the code. A test written from the code repeats its assumptions.",
  },
  { n: "4.5", text: "What tests cannot settle must be observed." },
  { n: "4.51", text: "Load, timing and the real shape of data are known only in operation." },
  { n: "4.6", text: "Reliability comes in layers." },
  { n: "4.61", text: "Each layer catches errors the one before it lets through." },

  { n: "5", text: "A coherent foundation does each thing one way." },
  { n: "5.1", text: "Conventions settle what would otherwise be arbitrary." },
  { n: "5.11", text: "Every arbitrary choice is a chance to be wrong." },
  { n: "5.2", text: "Parts designed together compose without translation." },
  { n: "5.21", text: "Data, effects and failure are modelled one way across every part." },
  { n: "5.3", text: "One canonical approach is worth more than several good ones." },
  { n: "5.4", text: "Tests carry what was learned in building a part." },
  { n: "5.41", text: "A foundation is trusted when its parts are tested together." },
  { n: "5.5", text: "Every part says how it is meant to be used." },

  { n: "6", text: "What can be computed must not be guessed." },
  { n: "6.1", text: "Composition comes before invention." },
  { n: "6.11", text: "What a part already does need not be guessed again." },
  { n: "6.2", text: "Deterministic where possible. Intelligent where necessary." },
  { n: "6.21", text: "An agent interprets what cannot be determined." },

  { n: "7", text: "What the language cannot say, the system cannot get wrong." },
];

export const find = (n: string): string =>
  propositions.find((p) => p.n === n)?.text ?? "";

/* How deep a proposition sits: 1 for "3", 2 for "3.1", 3 for "4.11". */
export const depth = (n: string): number =>
  n.includes(".") ? 1 + (n.split(".")[1]?.length ?? 0) : 1;
