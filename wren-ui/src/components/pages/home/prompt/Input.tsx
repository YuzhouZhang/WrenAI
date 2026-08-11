import { useEffect, useRef, useState, useMemo } from 'react';
import { Input, Button, Select, Popover, Tag, Tooltip } from 'antd';
import FilterOutlined from '@ant-design/icons/FilterOutlined';
import styled from 'styled-components';
import { attachLoading } from '@/utils/helper';
import { useListModelsQuery } from '@/apollo/client/graphql/model.generated';

const PromptButton = styled(Button)`
  min-width: 72px;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

interface Props {
  question: string;
  isProcessing: boolean;
  onAsk: (value: string, tables?: string[]) => Promise<void>;
  inputProps: {
    placeholder?: string;
  };
}

export default function PromptInput(props: Props) {
  const { onAsk, isProcessing, question, inputProps } = props;
  const $promptInput = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [innerLoading, setInnerLoading] = useState(false);

  const { data: modelsData } = useListModelsQuery();

  const tableOptions = useMemo(() => {
    return (modelsData?.listModels || []).map((m) => ({
      label: m.displayName || m.referenceName,
      value: m.referenceName,
    }));
  }, [modelsData]);

  useEffect(() => {
    if (question) setInputValue(question);
  }, [question]);

  useEffect(() => {
    if (!isProcessing) {
      $promptInput.current?.focus();
      setInputValue('');
    }
  }, [isProcessing]);

  const syncInputValue = (event) => {
    setInputValue(event.target.value);
  };

  const handleAsk = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;
    const startAsking = attachLoading(
      (val: string) =>
        onAsk(
          val,
          selectedTables.length > 0 ? selectedTables : undefined,
        ),
      setInnerLoading,
    );
    startAsking(trimmedValue);
  };

  const inputEnter = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.shiftKey) return;
    event.preventDefault();
    handleAsk();
  };

  const isDisabled = innerLoading || isProcessing;

  const popoverContent = (
    <div style={{ width: 280, padding: '4px 0' }}>
      <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 13 }}>
        限定查询的数据表范围：
      </div>
      <Select
        mode="multiple"
        allowClear
        showSearch
        placeholder="搜索并选择数据表（默认全表）"
        style={{ width: '100%' }}
        options={tableOptions}
        value={selectedTables}
        onChange={setSelectedTables}
        maxTagCount="responsive"
        filterOption={(input, option) =>
          ((option?.label as string) || '')
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
    </div>
  );

  return (
    <Container>
      {selectedTables.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>限定表范围:</span>
          {selectedTables.map((tbl) => (
            <Tag
              key={tbl}
              closable
              onClose={() =>
                setSelectedTables(selectedTables.filter((t) => t !== tbl))
              }
              color="blue"
            >
              {tbl}
            </Tag>
          ))}
          <Button
            type="link"
            size="small"
            style={{ padding: 0, fontSize: 12 }}
            onClick={() => setSelectedTables([])}
          >
            清空
          </Button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
        <Tooltip title="按数据表筛选提问范围">
          <Popover content={popoverContent} trigger="click" placement="topLeft">
            <Button
              size="large"
              icon={<FilterOutlined />}
              type={selectedTables.length > 0 ? 'primary' : 'default'}
              style={{ marginRight: 8 }}
              disabled={isDisabled}
            />
          </Popover>
        </Tooltip>

        <Input.TextArea
          ref={$promptInput}
          // disable grammarly
          data-gramm="false"
          size="large"
          autoSize
          value={inputValue}
          onInput={syncInputValue}
          onPressEnter={inputEnter}
          disabled={isDisabled}
          {...inputProps}
        />

        <PromptButton
          type="primary"
          size="large"
          className="ml-3"
          onClick={handleAsk}
          disabled={isDisabled}
        >
          Ask
        </PromptButton>
      </div>
    </Container>
  );
}
