import { FormulaManager } from './formula';

describe('FormulaManager', () => {
  let manager: FormulaManager;

  beforeEach(() => {
    manager = new FormulaManager();
  });

  describe('변수 관리', () => {
    test('변수 추가 및 동적 값 가져오기', () => {
      let xValue = 10;
      let yValue = 20;

      manager.setVariable('x', 'X 좌표', () => xValue);
      manager.setVariable('y', 'Y 좌표', () => yValue);

      expect(manager.getVariables()).toHaveLength(2);
      expect(manager.getVariables()[0].name).toBe('x');
      expect(manager.getVariables()[0].description).toBe('X 좌표');

      // 값이 변경되었을 때 수식 계산 결과 확인
      expect(manager.evaluate('x + y')).toBe(30);
      
      xValue = 15;
      yValue = 25;
      expect(manager.evaluate('x + y')).toBe(40);
    });

    test('잘못된 변수명 지정', () => {
      expect(() => {
        manager.setVariable('123x', '잘못된 변수명', () => 10);
      }).toThrow('Invalid variable name');
    });

    test('변수 값 업데이트', () => {
      manager.setVariable('x', 'X 좌표', () => 10);
      manager.setVariable('x', 'X 좌표', () => 15);
      
      const variables = manager.getVariables();
      expect(variables[0].getValue()).toBe(15);
    });
  });

  describe('수식 계산', () => {
    let xValue: number;
    let yValue: number;
    let scaleValue: number;
    let offsetValue: number;

    beforeEach(() => {
      xValue = 10;
      yValue = 20;
      scaleValue = 2;
      offsetValue = 5;
      manager.setVariable('x', 'X 좌표', () => xValue);
      manager.setVariable('y', 'Y 좌표', () => yValue);
      manager.setVariable('scale', '배율', () => scaleValue);
      manager.setVariable('offset', '오프셋', () => offsetValue);
    });

    test('기본 사칙연산', () => {
      expect(manager.evaluate('x + y')).toBe(xValue + yValue);
      expect(manager.evaluate('x - y')).toBe(xValue - yValue);
      expect(manager.evaluate('x * y')).toBe(xValue * yValue);
      expect(manager.evaluate('y / x')).toBe(yValue / xValue);

      // 값 변경 후 재계산
      xValue = 15;
      yValue = 30;
      expect(manager.evaluate('x + y')).toBe(xValue + yValue);
      expect(manager.evaluate('x * y')).toBe(xValue * yValue);
    });

    test('scale과 offset 사용', () => {
      expect(manager.evaluate('x * scale + offset')).toBe(xValue * scaleValue + offsetValue);
      expect(manager.evaluate('y * scale - offset')).toBe(yValue * scaleValue - offsetValue);

      // 값 변경 후 재계산
      xValue = 20;
      yValue = 30;
      scaleValue = 3;
      offsetValue = 10;
      expect(manager.evaluate('x * scale + offset')).toBe(xValue * scaleValue + offsetValue);
      expect(manager.evaluate('y * scale - offset')).toBe(yValue * scaleValue - offsetValue);
    });

    test('괄호를 사용한 복잡한 수식', () => {
      expect(manager.evaluate('(x + y) * scale')).toBe((xValue + yValue) * scaleValue);
      expect(manager.evaluate('(x * scale) + (y / 2)')).toBe((xValue * scaleValue) + (yValue / 2));

      // 값 변경 후 재계산
      xValue = 15;
      yValue = 25;
      scaleValue = 3;
      expect(manager.evaluate('(x + y) * scale')).toBe((xValue + yValue) * scaleValue);
      expect(manager.evaluate('(x * scale) + (y / 2)')).toBe((xValue * scaleValue) + (yValue / 2));
    });

    test('존재하지 않는 변수 사용 시도', () => {
      expect(() => {
        manager.evaluate('x + z');
      }).toThrow('Unknown variable: z');
    });

    test('0으로 나누기 시도', () => {
      let zeroValue = 1;
      manager.setVariable('zero', '0 값', () => zeroValue);
      expect(manager.evaluate('x / zero')).toBe(xValue / zeroValue);

      // 0으로 나누기 시도
      zeroValue = 0;
      expect(() => {
        manager.evaluate('x / zero');
      }).toThrow('Division by zero');
    });

    test('잘못된 수식 형식', () => {
      expect(() => {
        manager.evaluate('x + * y');
      }).toThrow();
    });

    test('연산자 우선순위 확인', () => {
      // x + y * 2: y * 2가 먼저 계산되어야 함
      expect(manager.evaluate('x + y * 2')).toBe(xValue + yValue * 2);

      // x * (y + 3): 괄호 안의 y + 3이 먼저 계산되어야 함
      expect(manager.evaluate('x * (y + 3)')).toBe(xValue * (yValue + 3));

      // (x + y) * 2: 괄호 안의 x + y가 먼저 계산되어야 함
      expect(manager.evaluate('(x + y) * 2')).toBe((xValue + yValue) * 2);

      // x + y / 3: x / y가 먼저 계산되어야 함
      expect(manager.evaluate('x + y / 3')).toBe(xValue + yValue / 3);
    });
  });

  describe('성능 테스트', () => {
    test('빠른 계산 속도 확인', () => {
      let xValue = 10;
      let yValue = 20;
      let scaleValue = 2;
      let offsetValue = 5;
      manager.setVariable('x', 'X 좌표', () => xValue);
      manager.setVariable('y', 'Y 좌표', () => yValue);
      manager.setVariable('scale', '배율', () => scaleValue);
      manager.setVariable('offset', '오프셋', () => offsetValue);
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        xValue = i;
        yValue = (i % 50) + 10;
        manager.evaluate('(x + y) * scale + offset');
      }
      const endTime = performance.now();
      
      // 1000회 계산이 100ms 이내에 완료되어야 함
      console.log(`계산 시간: ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
  
  describe('성능 비교 테스트', () => {
    test('복잡한 수식(이중 괄호 포함) 하드코딩 연산과 파서 연산 속도 비교', () => {
      let xValue = 10;
      let yValue = 20;
      let scaleValue = 2;
      let offsetValue = 5;
      manager.setVariable('x', 'X 좌표', () => xValue);
      manager.setVariable('y', 'Y 좌표', () => yValue);
      manager.setVariable('scale', '배율', () => scaleValue);
      manager.setVariable('offset', '오프셋', () => offsetValue);

      const ITER = 100_000;
      let result = 0;
      const formula = '((x * (y + 3)) / (y - 2) + (x - y) * scale) * 1.5 + offset';

      // 하드코드 연산
      const startHard = performance.now();
      for (let i = 0; i < ITER; i++) {
        xValue = i + 1;
        yValue = (i % 50) + 10;
        result += (((xValue * (yValue + 3)) / (yValue - 2) + (xValue - yValue) * scaleValue) * 1.5 + offsetValue);
      }
      const endHard = performance.now();

      // 파서 연산
      xValue = 10; yValue = 20; result = 0;
      const startParser = performance.now();
      for (let i = 0; i < ITER; i++) {
        xValue = i + 1;
        yValue = (i % 50) + 10;
        result += manager.evaluate(formula);
      }
      const endParser = performance.now();

      console.log(`하드코드 연산: ${(endHard - startHard).toFixed(2)}ms`);
      console.log(`파서 연산: ${(endParser - startParser).toFixed(2)}ms`);

      // 파서가 하드코드보다 100배 이상 느리면 실패
      expect(endParser - startParser).toBeLessThan((endHard - startHard) * 100);
    });
  });
});
