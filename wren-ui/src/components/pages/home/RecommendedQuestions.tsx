import clsx from 'clsx';
import styled from 'styled-components';
import { useMemo } from 'react';
import { Skeleton } from 'antd';
import BulbOutlined from '@ant-design/icons/BulbOutlined';
import { makeIterable } from '@/utils/iteration';
import {
  RecommendedQuestionsTask,
  RecommendedQuestionsTaskStatus,
} from '@/apollo/client/graphql/__types__';

export interface SelectQuestionProps {
  question: string;
  sql: string;
}

interface Props {
  items: { question: string; sql: string }[];
  loading?: boolean;
  error?: {
    shortMessage?: string;
    code?: string;
    message?: string;
    stacktrace?: string[];
  };
  className?: string;
  onSelect: ({ question, sql }: SelectQuestionProps) => void;
}

const StyledSkeleton = styled(Skeleton)`
  padding: 4px 0;
  .ant-skeleton-paragraph {
    margin-bottom: 0;
    li {
      height: 14px;
      + li {
        margin-top: 12px;
      }
    }
  }
`;

export const getRecommendedQuestionProps = (
  data: RecommendedQuestionsTask,
  show = true,
) => {
  if (!data || !show) return { show: false };
  const questions = (data?.questions || []).slice(0, 3).map((item) => ({
    question: item.question,
    sql: item.sql,
  }));
  const loading = data?.status === RecommendedQuestionsTaskStatus.GENERATING;
  return {
    show: loading || questions.length > 0,
    state: {
      items: questions,
      loading,
      error: data?.error,
    },
  };
};

const QuestionItem = (props: {
  index: number;
  question: string;
  sql: string;
  onSelect: ({ question, sql }: SelectQuestionProps) => void;
}) => {
  const { index, question, sql, onSelect } = props;
  return (
    <div className={clsx(index > 0 && 'mt-1')}>
      <span
        className="cursor-pointer hover:text"
        onClick={() => onSelect({ question, sql })}
      >
        {question}
      </span>
    </div>
  );
};
const QuestionList = makeIterable(QuestionItem);

export default function RecommendedQuestions(_props: Props) {
  return null;
}
