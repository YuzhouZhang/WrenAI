"""
查询 WrenAI 所有模型的 ID、别名、描述及字段信息
通过 wren-ui 的 GraphQL API 获取
"""

import requests
import json
import sys

# ========== 配置 ==========
# K8s Pod 内部访问: http://wren-ui:3000/api/graphql
# 本地端口转发访问: http://localhost:3000/api/graphql
GRAPHQL_URL = "http://wren-ui:3000/api/graphql"
# ==========================


def graphql_request(query, variables=None):
    """发送 GraphQL 请求"""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    try:
        resp = requests.post(GRAPHQL_URL, json=payload, timeout=30)
        resp.raise_for_status()
        result = resp.json()
        if "errors" in result:
            print(f"❌ GraphQL 错误: {json.dumps(result['errors'], ensure_ascii=False, indent=2)}")
            sys.exit(1)
        return result
    except requests.exceptions.ConnectionError:
        print(f"❌ 无法连接到 {GRAPHQL_URL}，请检查 wren-ui 服务是否正常运行")
        sys.exit(1)
    except requests.exceptions.Timeout:
        print(f"❌ 请求超时，请检查网络连接")
        sys.exit(1)


def list_all_models():
    """查询所有模型及其字段信息"""
    query = """
    query {
        listModels {
            id
            displayName
            referenceName
            sourceTableName
            description
            primaryKey
            cached
            refreshTime
            fields {
                id
                displayName
                referenceName
                sourceColumnName
                type
                isCalculated
                notNull
                properties
            }
            calculatedFields {
                id
                displayName
                referenceName
                sourceColumnName
                type
                isCalculated
                expression
            }
        }
    }
    """
    result = graphql_request(query)
    return result["data"]["listModels"]


def print_models_summary(models):
    """打印模型摘要信息"""
    print("=" * 80)
    print(f"  共发现 {len(models)} 个模型")
    print("=" * 80)

    for model in models:
        print(f"\n{'─' * 70}")
        print(f"  模型 ID:      {model['id']}")
        print(f"  显示名(别名): {model['displayName']}")
        print(f"  引用名:       {model['referenceName']}")
        print(f"  源表名:       {model['sourceTableName']}")
        print(f"  描述:         {model.get('description') or '(无)'}")
        print(f"  主键:         {model.get('primaryKey') or '(无)'}")
        print(f"  缓存:         {'是' if model.get('cached') else '否'}")

        # 打印字段
        fields = model.get("fields", [])
        calc_fields = model.get("calculatedFields", [])
        print(f"  字段数:       {len(fields)} 个字段 + {len(calc_fields)} 个计算字段")

        if fields:
            print(f"\n  {'字段ID':<8} {'显示名':<25} {'引用名':<25} {'类型':<12} {'描述'}")
            print(f"  {'─'*8} {'─'*25} {'─'*25} {'─'*12} {'─'*20}")
            for f in fields:
                desc = ""
                if f.get("properties") and isinstance(f["properties"], dict):
                    desc = f["properties"].get("description", "")
                print(f"  {f['id']:<8} {f['displayName']:<25} {f['referenceName']:<25} {(f.get('type') or 'N/A'):<12} {desc}")

        if calc_fields:
            print(f"\n  计算字段:")
            for cf in calc_fields:
                print(f"    ID={cf['id']}  {cf['displayName']}  ({cf.get('expression', '')})")

    print(f"\n{'=' * 80}")


def export_to_json(models, filename="models_export.json"):
    """导出模型信息到 JSON 文件，方便后续批量修改"""
    export_data = []
    for model in models:
        model_info = {
            "id": model["id"],
            "referenceName": model["referenceName"],
            "sourceTableName": model["sourceTableName"],
            "currentDisplayName": model["displayName"],
            "currentDescription": model.get("description") or "",
            "newDisplayName": "",  # <-- 在此填写新的别名
            "newDescription": "",  # <-- 在此填写新的描述
            "columns": []
        }
        for f in model.get("fields", []):
            col_desc = ""
            if f.get("properties") and isinstance(f["properties"], dict):
                col_desc = f["properties"].get("description", "")
            model_info["columns"].append({
                "id": f["id"],
                "referenceName": f["referenceName"],
                "currentDisplayName": f["displayName"],
                "currentDescription": col_desc,
                "newDisplayName": "",  # <-- 在此填写新的列别名
                "newDescription": "",  # <-- 在此填写新的列描述
            })
        export_data.append(model_info)

    with open(filename, "w", encoding="utf-8") as fp:
        json.dump(export_data, fp, ensure_ascii=False, indent=2)
    print(f"\n📁 已导出模型信息到: {filename}")
    print(f"   请编辑该文件中的 newDisplayName 和 newDescription 字段，")
    print(f"   然后使用批量更新脚本导入修改。")


if __name__ == "__main__":
    print("🔍 正在查询 WrenAI 模型列表...\n")
    models = list_all_models()
    print_models_summary(models)
    export_to_json(models)
