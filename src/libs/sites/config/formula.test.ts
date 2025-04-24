import { FormulaParser, FormulaCompiler, FormulaManager, FormulaContext } from './formula';

describe('Formula Parser', () => {
  test('기본 수식 파싱', () => {
    const input = "(pos - 2285) / 2";
    const result = FormulaParser.parse(input);

    // 예상되는 AST 구조
    expect(result).toEqual({
      type: 'operation',
      operator: '/',
      left: {
        type: 'operation',
        operator: '-',
        left: {
          type: 'variable',
          path: ['pos']
        },
        right: {
          type: 'value',
          value: 2285
        }
      },
      right: {
        type: 'value',
        value: 2
      }
    });
  });

  test('복잡한 수식 파싱', () => {
    const input = "pos * 1.275 - 2247";
    const result = FormulaParser.parse(input);

    expect(result).toEqual({
      type: 'operation',
      operator: '-',
      left: {
        type: 'operation',
        operator: '*',
        left: {
          type: 'variable',
          path: ['pos']
        },
        right: {
          type: 'value',
          value: 1.275
        }
      },
      right: {
        type: 'value',
        value: 2247
      }
    });
  });

  test('잘못된 수식 처리', () => {
    expect(() => FormulaParser.parse("(pos - 2285")).toThrow('괄호가 닫히지 않았습니다');
    expect(() => FormulaParser.parse("pos *")).toThrow();
  });
});

describe('Formula Compiler', () => {
  test('기본 수식 컴파일 및 실행', () => {
    const input = "(pos - 2285) / 2";
    const ast = FormulaParser.parse(input);
    const compiled = FormulaCompiler.compile(ast);

    const context: FormulaContext = { pos: 5000 };
    expect(compiled(context)).toBe((5000 - 2285) / 2);
  });

  test('컨텍스트 변수 사용', () => {
    const input = "pos * scale.x + offset.x";
    const ast = FormulaParser.parse(input);
    const compiled = FormulaCompiler.compile(ast);

    const context: FormulaContext = {
      pos: 100,
      scale: { x: 1.5 },
      offset: { x: 100 }
    };
    expect(compiled(context)).toBe(100 * 1.5 + 100);
  });

  test('잘못된 컨텍스트 처리', () => {
    const input = "pos * scale.x";
    const ast = FormulaParser.parse(input);
    const compiled = FormulaCompiler.compile(ast);

    const context: FormulaContext = { pos: 100 };
    expect(compiled(context)).toBe(0);
  });
});

describe('Formula Manager', () => {
  test('위치 계산', () => {
    const manager = new FormulaManager({
      0: {
        x: "(pos - 2285) / 2",
        y: "(pos + 5890) / 2"
      }
    });

    const result = manager.calculatePosition([5000, 5000], 0);
    expect(result).toEqual([
      (5000 - 2285) / 2,
      (5000 + 5890) / 2
    ]);
  });

  test('추가 컨텍스트 사용', () => {
    const manager = new FormulaManager({
      0: {
        x: "pos * scale.x + offset.x",
        y: "pos * scale.y + offset.y"
      }
    });

    const result = manager.calculatePosition([100, 100], 0, {
      scale: { x: 1.5, y: 2.0 },
      offset: { x: 100, y: 200 }
    });

    expect(result).toEqual([
      100 * 1.5 + 100,
      100 * 2.0 + 200
    ]);
  });

  test('수식 유효성 검사', () => {
    const manager = new FormulaManager();
    
    expect(manager.validateFormula("(pos - 2285) / 2")).toBe(true);
    expect(manager.validateFormula("(pos - 2285) - 2 + 50 + 100")).toBe(true);
    expect(manager.validateFormula("pos * 1.275 - 2247")).toBe(true);
    expect(manager.validateFormula("(pos - 2285")).toBe(false);
    expect(manager.validateFormula("pos *")).toBe(false);
  });
});

// 디버깅을 위한 헬퍼 함수
function debugFormula(input: string) {
  console.log('Input:', input);
  
  const ast = FormulaParser.parse(input);
  console.log('AST:', JSON.stringify(ast, null, 2));
  
  const compiled = FormulaCompiler.compile(ast);
  console.log('Compiled:', compiled.toString());
  
  return { ast, compiled };
}

// 디버깅 예시
test('수식 디버깅', () => {
  const { ast, compiled } = debugFormula("(pos - 2285) / 2");
  
  // AST 구조 확인
  expect(ast).toMatchSnapshot();
  
  // 컴파일된 함수 실행
  const result = compiled({ pos: 5000 });
  expect(result).toBe((5000 - 2285) / 2);
});