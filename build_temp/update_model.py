"""
批量修改模型 ID=66 (API_PMC_CORE_BIG_P_KPI_15MIN) 的显示名和描述
使用精确的字段映射数据，通过 wren-ui GraphQL API 更新
"""

import requests
import json
import sys

# ========== 配置 ==========
GRAPHQL_URL = "http://wren-ui:3000/api/graphql"
MODEL_ID = 76
MODEL_NEW_DISPLAY_NAME = "政企业务支撑平台_亚运会专线数据统计"
MODEL_NEW_DESCRIPTION = (
    "亚运会专线数据统计表。分地市记录了亚运会期间专线业务的客户数、业务数、故障数及万专线故障比，用于评估专线业务的稳定性与服务质量。\n\n"
    "【重要规则】此表为每日地市维度的存量快照表。每条记录代表该地市当天的总存量数值，而非每日增量。当用户查询“专线客户数”、“业务数”等存量指标且未指定具体日期时，严禁直接跨天 SUM 累加。必须默认过滤为最新一天（最大日期）的数据（若查询全省总量，则应在最新一天日期下对各地市进行 SUM 求和）。"
)
# ==========================

# ===== 精确字段映射 (英文引用名 -> 中文显示名, 描述) =====
# 键为小写引用名（与 WrenAI 中存储的一致）
FIELD_MAP = {
    "date_time": (
        "日期",
        "日期。注意：\n"
        "1. 数据库实际存储格式为 yyyyMMdd（不带横杠，如 20231030）。如果用户提问中包含横杠格式的日期（如 2023-10-30），必须自动转换为 yyyyMMdd 格式。\n"
        "2. 当查询客户数、业务数等存量指标未明确指定日期时，必须默认过滤最新一日。\n"
        "   - SQL 过滤示例：WHERE date_time = (SELECT MAX(date_time) FROM ...)"
    ),
    "company_num": (
        "客户数",
        "统计的客户数量。此指标为地市维度的日快照存量值。当询问专线客户数且未指定日期时，严禁直接进行跨天 SUM 累加。必须先过滤出最新一天（最大日期），在此基础上再对各地市求和（若涉及多地市或全省）。\n"
        "   - SQL 过滤示例（单地市最新）：WHERE region_name = '杭州市' AND date_time = (SELECT MAX(date_time) FROM ...)\n"
        "   - SQL 过滤示例（全省最新）：SELECT SUM(company_num) FROM ... WHERE date_time = (SELECT MAX(date_time) FROM ...)"
    ),
    "deline_num": (
        "业务数",
        "统计的业务数量。此指标为地市维度的日快照存量值。当询问业务数且未指定日期时，严禁直接进行跨天 SUM 累加。必须先过滤出最新一天（最大日期），在此基础上再对各地市求和（若涉及多地市或全省）。\n"
        "   - SQL 过滤示例（单地市最新）：WHERE region_name = '杭州市' AND date_time = (SELECT MAX(date_time) FROM ...)\n"
        "   - SQL 过滤示例（全省最新）：SELECT SUM(deline_num) FROM ... WHERE date_time = (SELECT MAX(date_time) FROM ...)"
    ),
    "fault_num": ("故障数", "统计的故障数量"),
    "qob": ("万专线故障比", "每万专线的故障比例"),
    "region_name": (
        "地市名称",
        "地市名称。表示该统计数据所属的城市。\n\n"
        "该字段的候选值（Distinct 值）仅包含以下 11 个浙江地市：\n"
        "- 杭州市, 宁波市, 温州市, 嘉兴市, 湖州市, 绍兴市, 金华市, 衢州市, 舟山市, 台州市, 丽水市\n\n"
        "SQL 过滤生成规则提示：\n"
        "1. 字段中的地市名称均带有“市”后缀。如果用户查询“杭州”、“温州”等不带“市”的名称，必须自动补齐“市”后缀进行匹配。\n"
        "   - 问：“杭州的专线故障数” -> WHERE region_name = '杭州市'\n"
        "   - 问：“温州和宁波的业务数” -> WHERE region_name IN ('温州市', '宁波市')"
    ),
}


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
            return None
        return result
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return None


def get_model_fields(model_id):
    """查询指定模型的所有字段"""
    query = """
    query {
        listModels {
            id
            displayName
            referenceName
            description
            fields {
                id
                displayName
                referenceName
                properties
            }
        }
    }
    """
    result = graphql_request(query)
    if not result:
        return None, None
    for model in result["data"]["listModels"]:
        if model["id"] == model_id:
            return model, model["fields"]
    return None, None


def preview_changes(model, fields):
    """预览所有将要修改的内容"""
    print("\n" + "=" * 100)
    print("  📋 变更预览")
    print("=" * 100)

    print(f"\n  【模型】")
    print(f"  当前别名: {model['displayName']}")
    print(f"  新的别名: {MODEL_NEW_DISPLAY_NAME}")
    print(f"  新的描述: {MODEL_NEW_DESCRIPTION}")

    columns_update = []
    matched = 0
    unmatched = 0

    print(f"\n  【字段变更】(共 {len(fields)} 个字段)")
    print(f"  {'ID':<6} {'引用名':<30} {'当前显示名':<30} → {'新显示名':<30} {'新描述'}")
    print(f"  {'─'*6} {'─'*30} {'─'*30}   {'─'*30} {'─'*30}")

    for f in fields:
        ref_name = f["referenceName"]
        if ref_name in FIELD_MAP:
            new_display, new_desc = FIELD_MAP[ref_name]
            old_display = f["displayName"]
            old_desc = ""
            if f.get("properties") and isinstance(f["properties"], dict):
                old_desc = f["properties"].get("description", "")

            changed = (old_display != new_display) or (old_desc != new_desc)
            marker = "🔄" if changed else "✅"
            print(f"  {marker} {f['id']:<4} {ref_name:<28} {old_display:<28} → {new_display:<28} {new_desc}")

            columns_update.append({
                "id": f["id"],
                "displayName": new_display,
                "description": new_desc
            })
            matched += 1
        else:
            print(f"  ⚠️  {f['id']:<4} {ref_name:<28} {f['displayName']:<28} → (未在映射表中，跳过)")
            unmatched += 1

    print(f"\n  📊 统计: 匹配 {matched} 个字段, 未匹配 {unmatched} 个字段")
    print(f"  📝 映射表共 {len(FIELD_MAP)} 条记录")
    return columns_update


def execute_update(model_id, columns_update):
    """执行更新"""
    mutation = """
    mutation UpdateModelMetadata($where: ModelWhereInput!, $data: UpdateModelMetadataInput!) {
        updateModelMetadata(where: $where, data: $data)
    }
    """
    variables = {
        "where": {"id": model_id},
        "data": {
            "displayName": MODEL_NEW_DISPLAY_NAME,
            "description": MODEL_NEW_DESCRIPTION,
            "columns": columns_update
        }
    }

    print("\n⏳ 正在提交更新...")
    result = graphql_request(mutation, variables)
    if result and result.get("data", {}).get("updateModelMetadata"):
        print("✅ 模型元数据更新成功！")
        return True
    else:
        print("❌ 更新失败")
        return False


def deploy():
    """触发 Deploy"""
    mutation = "mutation { deploy }"
    print("\n⏳ 正在 Deploy...")
    result = graphql_request(mutation)
    if result:
        print("✅ Deploy 成功，变更已生效！")
    else:
        print("❌ Deploy 失败，请手动在 UI 上点击 Deploy")


if __name__ == "__main__":
    print(f"🔍 正在查询模型 ID={MODEL_ID} 的信息...\n")

    model, fields = get_model_fields(MODEL_ID)
    if not model:
        print(f"❌ 未找到模型 ID={MODEL_ID}")
        sys.exit(1)

    print(f"  找到模型: {model['displayName']} ({model['referenceName']})")
    print(f"  共 {len(fields)} 个字段")

    # 1. 预览
    columns = preview_changes(model, fields)

    # 2. 确认
    print("\n" + "=" * 100)
    confirm = input("  ❓ 是否执行以上变更? (y/n): ").strip().lower()
    if confirm != "y":
        print("  ❎ 已取消")
        sys.exit(0)

    # 3. 更新
    success = execute_update(MODEL_ID, columns)

    # 4. Deploy
    if success:
        deploy_confirm = input("\n  ❓ 是否立即 Deploy? (y/n): ").strip().lower()
        if deploy_confirm == "y":
            deploy()
        else:
            print("  ⚠️  请记得手动 Deploy！")

    print("\n🏁 完成")
