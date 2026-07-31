import { useState, useMemo } from 'react';
import clsx from 'clsx';
import styled from 'styled-components';
import { Space, Button, Row, Col } from 'antd';
import ColumnHeightOutlined from '@ant-design/icons/ColumnHeightOutlined';
import MinusOutlined from '@ant-design/icons/MinusOutlined';
import EllipsisWrapper from '@/components/EllipsisWrapper';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import { Logo } from '@/components/Logo';
import { makeIterable } from '@/utils/iteration';
import { GroupedQuestion } from '@/hooks/useRecommendedQuestionsInstruction';

const CategorySectionBlock = styled.div`
  background: var(--gray-1);
  border: 1px solid var(--gray-4);
  border-radius: 4px;
  padding: 16px;
`;

const QuestionBlock = styled.div`
  background: var(--gray-1);
  user-select: none;
  height: 150px;
  transition: border-color ease 0.2s;

  &:hover:not(.is-disabled) {
    border-color: var(--geekblue-6) !important;
  }

  &.is-active {
    border-color: var(--geekblue-6) !important;
  }

  &.is-disabled {
    opacity: 0.8;
  }
`;

const MAX_EXPANDED_QUESTIONS = 9;

interface Props {
  onSelect: (payload: { sql: string; question: string }) => void;
  recommendedQuestions: GroupedQuestion[];
  loading: boolean;
}

const QuestionTemplate = ({
  category,
  sql,
  question,
  onSelect,
  loading,
  selectedQuestion,
}) => {
  const isSelected = selectedQuestion === question;
  const isDisabled = loading && !isSelected;

  const onClick = () => {
    if (loading) return;
    onSelect({ sql, question });
  };

  return (
    <Col span={8}>
      <QuestionBlock
        className={clsx(
          'border border-gray-5 rounded px-3 pt-3 pb-4',
          loading ? 'cursor-wait' : 'cursor-pointer',
          {
            'is-active': isSelected,
            'is-disabled cursor-not-allowed': isDisabled,
          },
        )}
        onClick={onClick}
      >
        <div className="d-flex justify-space-between align-center text-sm mb-3">
          <div
            className="border border-gray-5 px-2 rounded-pill text-truncate"
            title={category}
          >
            {category}
          </div>
          {isSelected && loading && <LoadingOutlined className="ml-1 gray-7" />}
        </div>
        <EllipsisWrapper multipleLine={4} text={question} />
      </QuestionBlock>
    </Col>
  );
};

const QuestionColumnIterator = makeIterable(QuestionTemplate);

export default function RecommendedQuestionsPrompt(_props: Props) {
  return null;
}
