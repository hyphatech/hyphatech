/* Held once so every page quotes the same words. Rules for editing:
   - A decimal deepens or qualifies the one above, never repeats it.
   - Terms are defined before use (meaning 1.1, states/operations 1.11).
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
  { n: "1.11", text: "What a thing may become are its states. What may be done with it are its operations." },
  { n: "1.2", text: "Software is built by composition." },
  { n: "1.21", text: "An application combines reusable capabilities with rules that belong to its domain." },
  { n: "1.22", text: "Capabilities recur from product to product. A domain belongs to one." },
  { n: "1.3", text: "Every component carries assumptions about data, effects and failure." },
  { n: "1.31", text: "Where those assumptions differ, integration work begins." },
  { n: "1.32", text: "Translation between arbitrary conventions adds cost and nothing else." },
  { n: "1.4", text: "The cost of software lies as much in the joins as in the parts." },

  { n: "2", text: "Whatever meaning is left unstated is guessed." },
  { n: "2.1", text: "Two reasonable guesses can contradict each other." },
  { n: "2.11", text: "Software built on contradicting guesses breaks at its joins." },
  { n: "2.2", text: "Agents change what code costs, not what it must guarantee." },
  { n: "2.21", text: "Generating code is cheap." },
  { n: "2.3", text: "An agent works within the environment it is given." },
  { n: "2.31", text: "An agent inherits that environment's strengths and its omissions alike." },
  { n: "2.32", text: "Whatever a foundation permits, an agent will eventually write." },
  { n: "2.4", text: "Mistakes are certain. Their kinds are not." },
  {
    n: "2.41",
    text: "A foundation decides which kinds are prevented, which are exposed and which get through.",
  },
  { n: "2.5", text: "A review is a judgement, not a proof." },
  { n: "2.51", text: "Intent is decided. Whatever can be checked is enforced." },

  { n: "3", text: "Correctness must be made explicit." },
  {
    n: "3.1",
    text: "An ontology makes meaning explicit: what each thing is, and how each relates to the rest.",
  },
  { n: "3.11", text: "One ontology is shared by all who build." },
  { n: "3.12", text: "An ontology nothing checks is only a description." },
  { n: "3.13", text: "Meaning that is stated and checked is a boundary." },
  { n: "3.2", text: "An instruction can be ignored. A check cannot." },
  { n: "3.21", text: "A system enforces only the rules it actually checks." },
  { n: "3.22", text: "A rule nothing checks will be broken, given enough commits." },
  { n: "3.3", text: "Every state that matters must be named." },
  { n: "3.31", text: "An unnamed state is handled by accident, or not at all." },
  { n: "3.4", text: "Invalid states must be unrepresentable." },
  { n: "3.41", text: "Once validated, data can carry its guarantees in its type." },
  { n: "3.42", text: "Not every rule of a domain fits in a type. Every rule that fits belongs there." },
  { n: "3.5", text: "External input remains untrusted until it is validated." },
  {
    n: "3.51",
    text: "A type describes data that has passed validation. The boundary is where data is checked.",
  },
  { n: "3.6", text: "Code may touch only what it is given: storage, network, time." },
  { n: "3.61", text: "What is given can be replaced, so code can be tested without the world it touches." },

  { n: "4", text: "A language decides what can be stated." },
  { n: "4.1", text: "Types describe the states data can take and the operations allowed on it." },
  { n: "4.11", text: "Exhaustive matching makes a forgotten case visible before the code runs." },
  { n: "4.12", text: "Module signatures draw boundaries an implementation cannot cross." },
  { n: "4.2", text: "Code must state its intent plainly." },
  { n: "4.21", text: "Accepting a change is a judgement, and judgement needs the intent in view." },
  { n: "4.3", text: "The language is the foundation, not the whole system." },
  { n: "4.31", text: "No language makes an application correct on its own." },
  { n: "4.32", text: "Types rule out classes of error, not errors of logic." },
  { n: "4.4", text: "What types cannot guarantee must be tested." },
  {
    n: "4.41",
    text: "Tests challenge behaviour. A passing test shows a case that works, not that none fails.",
  },
  { n: "4.42", text: "A test carries most weight when it is written from the requirement, not from the code." },
  { n: "4.43", text: "Tests derived from an implementation can reproduce its assumptions." },
  { n: "4.5", text: "What tests cannot settle must be observed." },
  { n: "4.51", text: "Load, timing and the real shape of data are known only in operation." },
  { n: "4.6", text: "Reliability comes from layered guarantees, not from a single mechanism." },
  { n: "4.61", text: "Each layer catches errors the one before it lets through." },

  { n: "5", text: "A coherent system speaks one language." },
  { n: "5.1", text: "Coherent conventions reduce arbitrary choices." },
  { n: "5.11", text: "Every arbitrary choice is a chance to be wrong." },
  { n: "5.2", text: "Components designed together compose without translation." },
  { n: "5.21", text: "Data, effects and errors are modelled one way across every part." },
  { n: "5.3", text: "One canonical approach is worth more than several good ones." },
  { n: "5.4", text: "Tests that travel with a component preserve what was learned in building it." },
  { n: "5.41", text: "An ecosystem is trusted when its parts are tested together." },
  { n: "5.5", text: "Every part says how it is meant to be used." },
  { n: "5.51", text: "A part's types hold every use to what can be checked." },

  { n: "6", text: "What can be computed must not be guessed." },
  { n: "6.1", text: "Composition comes before invention." },
  { n: "6.11", text: "A task is first decomposed into the capabilities it requires." },
  { n: "6.12", text: "Where an existing component fits, it is reused." },
  { n: "6.13", text: "Bespoke implementation is kept for domain logic." },
  {
    n: "6.2",
    text: "Mechanical, decidable work is done deterministically: generated, parsed, validated, compiled.",
  },
  { n: "6.21", text: "A model is asked only where judgement is needed." },
  { n: "6.3", text: "Deterministic where possible. Intelligent where necessary." },
  {
    n: "6.31",
    text: "Generators write the structure and agents write the logic. The compiler checks that they fit.",
  },

  { n: "7", text: "What the language cannot say, the system cannot get wrong." },
];

export const find = (n: string): string =>
  propositions.find((p) => p.n === n)?.text ?? "";

/* How deep a proposition sits: 1 for "3", 2 for "3.1", 3 for "4.11". */
export const depth = (n: string): number =>
  n.includes(".") ? 1 + (n.split(".")[1]?.length ?? 0) : 1;
