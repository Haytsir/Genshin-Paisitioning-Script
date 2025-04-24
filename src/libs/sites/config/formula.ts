// 기본 타입 정의
type OperatorType = '+' | '-' | '*' | '/';

interface BaseExpression {
  type: 'value' | 'operation' | 'variable';
}

interface ValueExpression extends BaseExpression {
  type: 'value';
  value: number;
}

interface OperationExpression extends BaseExpression {
  type: 'operation';
  operator: OperatorType;
  left: Expression;
  right: Expression;
}

interface VariableExpression extends BaseExpression {
  type: 'variable';
  path: string[];
}

type Expression = ValueExpression | OperationExpression | VariableExpression;

// 수식 컨텍스트 인터페이스
export interface FormulaContext {
  pos: number;
  [key: string]: any;
}

// 컴파일된 수식 타입
export type CompiledFormula = (context: FormulaContext) => number;

// 사용자 설정 인터페이스
export interface UserFormulaConfig {
  [mapId: number]: {
    x: string;
    y: string;
  };
}

// 수식 파서 클래스
export class FormulaParser {
  private pos = 0;
  private input: string;

  constructor(input: string) {
    this.input = input.replace(/\s+/g, '');
  }

  static parse(input: string): Expression {
    return new FormulaParser(input).parseExpression();
  }

  private parseExpression(): Expression {
    return this.parseAdditive();
  }

  private parseAdditive(): Expression {
    let left = this.parseMultiplicative();
  
    while (this.pos < this.input.length) {
      const op = this.input[this.pos];
      if (op !== '+' && op !== '-') break;
      this.pos++;
      
      // 연산자 다음에 피연산자가 없으면 에러
      if (this.pos >= this.input.length) {
        throw new Error('연산자 뒤에 피연산자가 없습니다');
      }
      
      const right = this.parseMultiplicative();
      left = {
        type: 'operation',
        operator: op as '+' | '-',
        left,
        right
      };
    }
  
    return left;
  }

  private parseMultiplicative(): Expression {
    let left = this.parsePrimary();
  
    while (this.pos < this.input.length) {
      const op = this.input[this.pos];
      if (op !== '*' && op !== '/') break;
      this.pos++;
      
      // 연산자 다음에 피연산자가 없으면 에러
      if (this.pos >= this.input.length) {
        throw new Error('연산자 뒤에 피연산자가 없습니다');
      }
      
      const right = this.parsePrimary();
      left = {
        type: 'operation',
        operator: op as '*' | '/',
        left,
        right
      };
    }
  
    return left;
  }

  private parsePrimary(): Expression {
    if (this.input[this.pos] === '(') {
      this.pos++;
      const expr = this.parseExpression();
      if (this.input[this.pos] === ')') {
        this.pos++;
        return expr;
      }
      throw new Error('괄호가 닫히지 않았습니다');
    }

    let start = this.pos;
    while (
      this.pos < this.input.length && 
      /[0-9a-zA-Z_\.]/.test(this.input[this.pos])
    ) {
      this.pos++;
    }

    const token = this.input.slice(start, this.pos);
    
    if (/^-?\d*\.?\d+$/.test(token)) {
      return {
        type: 'value',
        value: parseFloat(token)
      };
    }

    return {
      type: 'variable',
      path: token.split('.')
    };
  }
}

export class FormulaCompiler {
  static compile(expr: Expression): CompiledFormula {
    const code = this.generateCode(expr);
    
    const safeGet = `
      function safeGet(obj, path) {
        try {
          return path.reduce((curr, key) => 
            curr && curr[key] !== undefined ? curr[key] : null
          , obj);
        } catch {
          return null;
        }
      }
    `;

    return Function('context', `
      "use strict";
      ${safeGet}
      try {
        const result = ${code};
        return Number.isFinite(result) ? result : context.pos;
      } catch (error) {
        console.error('수식 평가 오류:', error);
        return context.pos;
      }
    `) as CompiledFormula;
  }

  private static generateCode(expr: Expression): string {
    switch (expr.type) {
      case 'value':
        return expr.value.toString();
      
      case 'operation':
        const left = this.generateCode(expr.left);
        const right = this.generateCode(expr.right);
        return `(${left} ${expr.operator} ${right})`;
      
      case 'variable':
        return `(safeGet(context, ${JSON.stringify(expr.path)}) ?? 0)`;
      
      default:
        throw new Error('알 수 없는 수식 타입');
    }
  }
}

export class FormulaManager {
  private compiledFormulas: Record<number, { x: CompiledFormula, y: CompiledFormula }> = {};

  constructor(config?: UserFormulaConfig) {
    if (config) {
      this.updateConfig(config);
    }
  }

  updateConfig(config: UserFormulaConfig) {
    for (const [mapId, formulas] of Object.entries(config)) {
      try {
        this.compiledFormulas[Number(mapId)] = {
          x: FormulaCompiler.compile(FormulaParser.parse(formulas.x)),
          y: FormulaCompiler.compile(FormulaParser.parse(formulas.y))
        };
      } catch (error) {
        console.error(`수식 파싱 오류:`, error);
        this.compiledFormulas[Number(mapId)] = {
          x: ctx => ctx.pos,
          y: ctx => ctx.pos
        };
      }
    }
  }

  calculatePosition(pos: [number, number], mapId: number, context: Omit<FormulaContext, 'pos'> = {}): [number, number] {
    const formula = this.compiledFormulas[mapId];
    if (!formula) return pos;

    return [
      formula.x({ pos: pos[0], ...context }),
      formula.y({ pos: pos[1], ...context })
    ];
  }

  // 수식 유효성 검사
  validateFormula(formula: string): boolean {
    try {
      FormulaParser.parse(formula);
      return true;
    } catch {
      return false;
    }
  }
}

// 기본 설정 예시
export const DEFAULT_FORMULA_CONFIG: UserFormulaConfig = {
  0: { // teyvat
    x: "(pos - 2285) / 2",
    y: "(pos + 5890) / 2"
  },
  1: { // enkanomiya
    x: "pos * 1.275 - 2247",
    y: "pos * 1.275 - 670"
  },
  2: { // underground
    x: "pos * 1.275 - 2060",
    y: "pos * 1.275 - 225"
  }
};
