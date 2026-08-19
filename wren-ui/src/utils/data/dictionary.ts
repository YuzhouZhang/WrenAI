import { ExpressionName } from '@/apollo/client/graphql/__types__';
import { JOIN_TYPE } from '@/utils/enum';

const DefaultText = 'Unknown';

export const getJoinTypeText = (type) =>
  ({
    [JOIN_TYPE.MANY_TO_ONE]: 'Many-to-one',
    [JOIN_TYPE.ONE_TO_MANY]: 'One-to-many',
    [JOIN_TYPE.ONE_TO_ONE]: 'One-to-one',
  })[type] || DefaultText;

export const getExpressionTexts = (type) =>
  ({
    // Aggregations
    [ExpressionName.AVG]: {
      name: 'Average (平均值)',
      syntax: 'avg(column)',
      description: '返回指定列中所有数值的平均值。',
    },
    [ExpressionName.COUNT]: {
      name: 'Count (计数)',
      syntax: 'count(column)',
      description: '返回所选数据中非空（非 NULL）行/记录的总数。',
    },
    [ExpressionName.MAX]: {
      name: 'Max (最大值)',
      syntax: 'max(column)',
      description: '返回指定列中的最大值。',
    },
    [ExpressionName.MIN]: {
      name: 'Min (最小值)',
      syntax: 'min(column)',
      description: '返回指定列中的最小值。',
    },
    [ExpressionName.SUM]: {
      name: 'Sum (求和)',
      syntax: 'sum(column)',
      description: '计算并返回指定列中所有数值的总和。',
    },

    // Math functions
    [ExpressionName.ABS]: {
      name: 'Absolute (绝对值)',
      syntax: 'abs(column)',
      description: '返回指定列数值的绝对值（转为正数）。',
    },
    [ExpressionName.CBRT]: {
      name: 'Cube root (立方根)',
      syntax: 'cbrt(column)',
      description: '返回指定数值的立方根。',
    },
    [ExpressionName.CEIL]: {
      name: 'Ceil (向上取整)',
      syntax: 'ceil(column)',
      description: '对小数进行向上取整（返回不小于该数的最小整数）。',
    },
    [ExpressionName.EXP]: {
      name: 'Exponential (指数)',
      syntax: 'exp(column)',
      description: '返回自然常数 e 的指定次幂（e^x）。',
    },
    [ExpressionName.FLOOR]: {
      name: 'Floor (向下取整)',
      syntax: 'floor(column)',
      description: '对小数进行向下取整（返回不大于该数的最大整数）。',
    },
    [ExpressionName.LN]: {
      name: 'Natural logarithm (自然对数)',
      syntax: 'ln(column)',
      description: '返回以 e 为底的自然对数（ln）。',
    },
    [ExpressionName.LOG10]: {
      name: 'Log10 (常用对数)',
      syntax: 'log10(column)',
      description: '返回以 10 为底的常用对数（log10）。',
    },
    [ExpressionName.ROUND]: {
      name: 'Round (四舍五入)',
      syntax: 'round(column)',
      description: '对小数进行四舍五入取整到最接近的整数。',
    },
    [ExpressionName.SIGN]: {
      name: 'Signum (符号函数)',
      syntax: 'sign(column)',
      description: '返回数值的正负符号（正数返回 1，负数返回 -1，零返回 0）。',
    },

    // String functions
    [ExpressionName.LENGTH]: {
      name: 'Length (字符串长度)',
      syntax: 'length(column)',
      description: '返回字符串中的字符个数/长度。',
    },
    [ExpressionName.REVERSE]: {
      name: 'Reverse (反转字符串)',
      syntax: 'reverse(column)',
      description: '返回按字符逆序反转后的字符串。',
    },
  })[type] || {
    name: DefaultText,
    syntax: DefaultText,
    description: DefaultText,
  };
