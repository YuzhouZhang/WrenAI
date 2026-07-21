import { useMemo } from 'react';
import { useListModelsQuery } from '@/apollo/client/graphql/model.generated';

export function useColumnAliasMap() {
  const { data } = useListModelsQuery();

  const columnAliasMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!data?.listModels) return map;

    data.listModels.forEach((model) => {
      const allFields = [
        ...(model.fields || []),
        ...(model.calculatedFields || []),
      ];
      allFields.forEach((field) => {
        if (field.displayName) {
          if (field.referenceName) {
            map[field.referenceName] = field.displayName;
          }
          if (field.sourceColumnName) {
            map[field.sourceColumnName] = field.displayName;
          }
        }
      });
    });

    return map;
  }, [data?.listModels]);

  return columnAliasMap;
}
