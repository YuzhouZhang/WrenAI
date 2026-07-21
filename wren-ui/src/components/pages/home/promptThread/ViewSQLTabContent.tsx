import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  Button,
  Divider,
  Empty,
  message,
  Space,
  Switch,
  Typography,
} from 'antd';
import CodeFilled from '@ant-design/icons/CodeFilled';
import EditOutlined from '@ant-design/icons/EditOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import { BinocularsIcon } from '@/utils/icons';
import { nextTick } from '@/utils/time';
import useNativeSQL from '@/hooks/useNativeSQL';
import { DATA_SOURCE_OPTIONS } from '@/components/pages/setup/utils';
import { getDataSourceImage } from '@/utils/dataSourceType';
import { Props as AnswerResultProps } from '@/components/pages/home/promptThread/AnswerResult';
import usePromptThreadStore from '@/components/pages/home/promptThread/store';
import PreviewData from '@/components/dataPreview/PreviewData';
import { usePreviewDataMutation } from '@/apollo/client/graphql/home.generated';
import { useColumnAliasMap } from '@/hooks/useColumnAliasMap';

const SQLCodeBlock = dynamic(() => import('@/components/code/SQLCodeBlock'), {
  ssr: false,
});

const { Text } = Typography;

const StyledBar = styled.div`
  background-color: var(--gray-2);
  height: 32px;
  padding: 4px 8px;
  border: 1px solid var(--gray-3);
  border-radius: 4px 4px 0px 0px;
`;

export default function ViewSQLTabContent(props: AnswerResultProps) {
  const { isLastThreadResponse, onInitPreviewDone, threadResponse } = props;

  const { onOpenAdjustSQLModal } = usePromptThreadStore();
  const { fetchNativeSQL, nativeSQLResult } = useNativeSQL();
  const [previewData, previewDataResult] = usePreviewDataMutation({
    onError: (error) => console.error(error),
  });

  const columnAliasMap = useColumnAliasMap();

  const { id, sql } = threadResponse || {};

  const previewDataWithAlias = useMemo(() => {
    const rawPreviewData = previewDataResult?.data?.previewData;
    if (!rawPreviewData) return undefined;
    const columns = (rawPreviewData.columns || []).map((col) => ({
      ...col,
      alias: columnAliasMap[col.name],
    }));
    return { ...rawPreviewData, columns };
  }, [previewDataResult?.data?.previewData, columnAliasMap]);

  const onPreviewData = async () => {
    await previewData({ variables: { where: { responseId: id } } });
  };

  const autoTriggerPreviewDataButton = async () => {
    await nextTick();
    await onPreviewData();
    await nextTick();
    onInitPreviewDone();
  };

  // when is the last step of the last thread response, auto trigger preview data button
  useEffect(() => {
    if (isLastThreadResponse) {
      autoTriggerPreviewDataButton();
    }
  }, [isLastThreadResponse]);

  const { hasNativeSQL, dataSourceType } = nativeSQLResult || {};
  const showNativeSQL = hasNativeSQL;

  const currentSQL =
    nativeSQLResult?.nativeSQLMode && nativeSQLResult?.loading === false
      ? nativeSQLResult.data
      : sql;

  const isSwitchLoading = nativeSQLResult?.loading;

  const setShowNativeSQL = async (checked: boolean) => {
    nativeSQLResult?.setNativeSQLMode(checked);
    checked && fetchNativeSQL({ variables: { responseId: id } });
  };

  const onAdjustSQL = () => {
    onOpenAdjustSQLModal({ responseId: id, sql });
  };

  const onCopySQL = () => {
    if (currentSQL) {
      navigator.clipboard.writeText(currentSQL);
      message.success('SQL copied to clipboard');
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Space size={8}>
          <Button
            size="small"
            className="gray-7"
            onClick={onAdjustSQL}
            data-ph-capture="true"
            data-ph-capture-attribute-name="view_sql_adjust_sql"
          >
            <EditOutlined className="gray-6" /> Edit SQL
          </Button>

          <Button
            size="small"
            className="gray-7"
            icon={<CopyOutlined className="gray-6" />}
            onClick={onCopySQL}
            data-ph-capture="true"
            data-ph-capture-attribute-name="view_sql_copy_sql"
          >
            Copy SQL
          </Button>
        </Space>

        <div className="d-flex align-items-center gap-2">
          <Text className="gray-6 text-sm">Compile View</Text>
          <Switch
            size="small"
            checked={showNativeSQL}
            onChange={setShowNativeSQL}
            loading={isSwitchLoading}
          />
        </div>
      </div>

      <div className="mb-4">
        {showNativeSQL && dataSourceType ? (
          <StyledBar className="d-flex align-items-center justify-content-between">
            <Space size={8}>
              {getDataSourceImage(dataSourceType) && (
                <img
                  src={getDataSourceImage(dataSourceType)}
                  alt={dataSourceType}
                  width={16}
                  height={16}
                />
              )}
              <Text className="gray-7 font-weight-semibold">
                {DATA_SOURCE_OPTIONS[dataSourceType]?.label || dataSourceType}
              </Text>
            </Space>

            <Space size={4}>
              <CodeFilled className="gray-6" />
              <Text className="gray-6 text-xs">Compiled View SQL</Text>
            </Space>
          </StyledBar>
        ) : null}

        <SQLCodeBlock code={currentSQL} />
      </div>

      <Divider />
      <Button
        icon={
          <BinocularsIcon
            style={{
              paddingBottom: 2,
              marginRight: 8,
            }}
          />
        }
        loading={previewDataResult.loading}
        onClick={onPreviewData}
        data-ph-capture="true"
        data-ph-capture-attribute-name="view_sql_preview_data"
      >
        View results
      </Button>
      {previewDataResult?.data?.previewData && (
        <div className="mt-2 mb-3">
          <PreviewData
            error={previewDataResult.error}
            loading={previewDataResult.loading}
            previewData={previewDataWithAlias}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Sorry, we couldn't find any records that match your search criteria."
                />
              ),
            }}
          />
          <div className="text-right">
            <Text className="text-base gray-6">Showing up to 500 rows</Text>
          </div>
        </div>
      )}
    </div>
  );
}
