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

export default function RecommendedQuestions(_props: Props) {
  return null;
}
