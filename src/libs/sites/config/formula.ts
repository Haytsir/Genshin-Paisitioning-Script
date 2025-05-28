interface Variable {
  name: string;
  description: string;
  getValue: () => number;
}

class FormulaParser {
  private static readonly OPERATORS = new Set(['+', '-', '*', '/']);
  private static readonly BRACKETS = new Set(['(', ')']);
  public static readonly VARIABLE_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

  private static isOperator(token: string): boolean {
    return this.OPERATORS.has(token);
  }

  private static isVariable(token: string): boolean {
    return this.VARIABLE_REGEX.test(token);
  }

  private static tokenize(formula: string): string[] {
    const tokens: string[] = [];
    let current = '';
    
    for (let i = 0; i < formula.length; i++) {
      const char = formula[i];
      
      if (char === ' ') continue;
      
      if (this.OPERATORS.has(char) || this.BRACKETS.has(char)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(char);
      } else {
        current += char;
      }
    }
    
    if (current) {
      tokens.push(current);
    }
    
    return tokens;
  }

  private static validateTokens(tokens: string[]): void {
    let lastToken: string | null = null;
    let bracketCount = 0;

    for (const token of tokens) {
      if (this.isOperator(token)) {
        if (lastToken && this.isOperator(lastToken)) {
          throw new Error('Invalid expression: consecutive operators');
        }
      } else if (token === '(') {
        if (lastToken && !this.isOperator(lastToken) && lastToken !== '(') {
          throw new Error('Invalid expression: missing operator before parenthesis');
        }
        bracketCount++;
      } else if (token === ')') {
        bracketCount--;
        if (bracketCount < 0) {
          throw new Error('Mismatched parentheses');
        }
      }
      lastToken = token;
    }

    if (bracketCount !== 0) {
      throw new Error('Mismatched parentheses');
    }
  }

  private static generateJsCode(tokens: string[]): string {
    const stack: string[] = [];
    const operators: string[] = [];
    
    for (const token of tokens) {
      if (this.isOperator(token)) {
        while (operators.length > 0 && 
               operators[operators.length - 1] !== '(' && 
               this.getPrecedence(operators[operators.length - 1]) >= this.getPrecedence(token)) {
          const op = operators.pop()!;
          const b = stack.pop()!;
          const a = stack.pop()!;
          stack.push(`(${a} ${op} ${b})`);
        }
        operators.push(token);
      } else if (token === '(') {
        operators.push(token);
      } else if (token === ')') {
        while (operators.length > 0 && operators[operators.length - 1] !== '(') {
          const op = operators.pop()!;
          const b = stack.pop()!;
          const a = stack.pop()!;
          stack.push(`(${a} ${op} ${b})`);
        }
        operators.pop(); // Remove '('
      } else if (this.isVariable(token)) {
        stack.push(token);
      } else {
        const num = parseFloat(token);
        if (isNaN(num)) {
          throw new Error(`Invalid number: ${token}`);
        }
        stack.push(token);
      }
    }
    
    while (operators.length > 0) {
      const op = operators.pop()!;
      if (op === '(') {
        throw new Error('Mismatched parentheses');
      }
      const b = stack.pop()!;
      const a = stack.pop()!;
      stack.push(`(${a} ${op} ${b})`);
    }
    
    if (stack.length !== 1) {
      throw new Error('Invalid expression');
    }
    
    return stack[0];
  }

  private static getPrecedence(operator: string): number {
    switch (operator) {
      case '+':
      case '-':
        return 1;
      case '*':
      case '/':
        return 2;
      default:
        return 0;
    }
  }

  public static compile(formula: string): string {
    const tokens = this.tokenize(formula);
    this.validateTokens(tokens);
    return this.generateJsCode(tokens);
  }
}

export class FormulaManager {
  private variables: Map<string, Variable> = new Map();
  private compiledFormulas: Map<string, Function> = new Map();

  public setVariable(name: string, description: string, getValue: () => number): void {
    if (!FormulaParser.VARIABLE_REGEX.test(name)) {
      throw new Error('Invalid variable name');
    }
    this.variables.set(name, { name, description, getValue });
  }

  public evaluate(formula: string): number {
    if (!this.compiledFormulas.has(formula)) {
      try {
        const jsCode = FormulaParser.compile(formula);
        const variableNames = Array.from(this.variables.keys());
        const usedVariables = new Set(jsCode.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []);
        for (const varName of usedVariables) {
          if (!this.variables.has(varName) && !['true', 'false', 'null', 'undefined'].includes(varName)) {
            throw new Error(`Unknown variable: ${varName}`);
          }
        }
        const compiledFn = new Function(...variableNames, `return ${jsCode};`);
        this.compiledFormulas.set(formula, compiledFn);
      } catch (error) {
        throw error;
      }
    }

    const compiledFn = this.compiledFormulas.get(formula)!;
    const variableValues = Array.from(this.variables.values()).map(v => v.getValue());
    
    try {
      const result = compiledFn(...variableValues);
      if (result === Infinity || result === -Infinity) {
        throw new Error('Division by zero');
      }
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Division by zero')) {
          throw new Error('Division by zero');
        }
        if (error.message.includes('is not defined')) {
          const varName = error.message.split(' ')[0];
          throw new Error(`Unknown variable: ${varName}`);
        }
      }
      throw error;
    }
  }

  public getVariables(): Variable[] {
    return Array.from(this.variables.values());
  }
}
