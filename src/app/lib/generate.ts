export interface Equation {
    question: string;
    answer: number;
  }
  
  type GeneratorFn = () => Equation;
  
  export const generators: Record<string, GeneratorFn> = {
    /** Two‑digit addition (10–99) */
    add2: () => {
      const a = Math.floor(Math.random() * 90) + 10;
      const b = Math.floor(Math.random() * 90) + 10;
      return { question: `${a} + ${b} =`, answer: a + b };
    },
  
    /** Three‑digit addition (100–999) */
    add3: () => {
      const a = Math.floor(Math.random() * 900) + 100;
      const b = Math.floor(Math.random() * 900) + 100;
      return { question: `${a} + ${b} =`, answer: a + b };
    },
  
    /** Two‑digit multiplication (10–99) */
    mult2: () => {
      const a = Math.floor(Math.random() * 90) + 10;
      const b = Math.floor(Math.random() * 90) + 10;
      return { question: `${a} × ${b} =`, answer: a * b };
    },
  
    /** Three‑digit multiplication (100–999) */
    mult3: () => {
      const a = Math.floor(Math.random() * 900) + 100;
      const b = Math.floor(Math.random() * 900) + 100;
      return { question: `${a} × ${b} =`, answer: a * b };
    },
  };
  
  export function generateRandom(ids: string[]): Equation {
    const idx = Math.floor(Math.random() * ids.length);
    const key = ids[idx];
    const gen = generators[key];
    if (!gen) throw new Error(`Generator not found: ${key}`);
    return gen();
  }
  