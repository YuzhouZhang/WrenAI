"""
批量修改模型 ID=66 (API_PMC_CORE_BIG_P_KPI_15MIN) 的显示名和描述
使用精确的字段映射数据，通过 wren-ui GraphQL API 更新
"""

import requests
import json
import sys

# ========== 配置 ==========
GRAPHQL_URL = "http://wren-ui:3000/api/graphql"
MODEL_ID = 72
MODEL_NEW_DISPLAY_NAME = "网络费用管理平台_管理者视图预算管理省公司视图统计业务表"
MODEL_NEW_DESCRIPTION = "网络费用管理平台管理者视图预算管理省公司视图统计业务模型表。"
# ==========================

# ===== 精确字段映射 (英文引用名 -> 中文显示名, 描述) =====
# 键为小写引用名（与 WrenAI 中存储的一致）
FIELD_MAP = {
    "id": ("主键ID", ""),
    "base_id": ("业务ID关联t_managerview_budget_networkfee_base", "业务ID（关联t_managerview_budget_networkfee_base）"),
    "parent_id": ("父业务ID", "父业务ID"),
    "business_no": ("业务标识", "业务标识"),
    "business_name": (
        "业务名",
        "业务名称或维度分类。该列是一个多维度混杂字段，包含了“地级市/区县”、“网络专业/中心部门”以及“费用科目”三类值。\n\n"
        "当用户查询以下概念时，必须在该字段上进行过滤：\n"
        "1. 地区/分公司 (分以下两种格式)：\n"
        "   - 地级市：杭州市, 宁波市, 温州市, 嘉兴市, 湖州市, 绍兴市, 金华市, 衢州市, 舟山市, 台州市, 丽水市。\n"
        "   - 杭州下辖区县 (必须使用“地市-区县”的拼接格式)：杭州市-临安市, 杭州市-余杭区, 杭州市-富阳区, 杭州市-建德区, 杭州市-拱墅区, 杭州市-桐庐区, 杭州市-江东区, 杭州市-江干区, 杭州市-淳安区, 杭州市-萧山区, 杭州市-西湖区。\n"
        "2. 网络专业、中心或部门：\n"
        "   - 网络专业：核心网, 传送网, 数据网, 无线及接入网, 网络支撑网, 网络信息安全。\n"
        "   - 专业中心/部门：网优中心, 网管中心, 网络部, 互客中心。\n"
        "3. 费用科目或具体费用类型：\n"
        "   - 水电费, 低值易耗品, 网元租赁费, 网络维修费, 装移机工料费, 综合配套, 全省网络费概览。\n\n"
        "SQL 过滤生成规则示例：\n"
        "- 问：“余杭区的费用是多少” -> WHERE business_name = '杭州市-余杭区'\n"
        "- 问：“核心网的水电费是多少” -> WHERE business_name IN ('核心网', '水电费')\n"
        "- 问：“金华市的网络维修费” -> WHERE business_name IN ('金华市', '网络维修费')"
    ),
    "budget_amount": ("预算金额", "预算金额"),
    "budget_execute_amount": ("预算执行金额", "预算执行金额"),
    "percent": ("百分比占比", "百分比（占比）"),
    "fixed_assets": ("百元固定资产维修费", "百元固定资产维修费"),
    "wireless": ("地市专业每百元固定资产对标无线", "地市专业每百元固定资产对标-无线"),
    "transmission": ("地市专业每百元固定资产对标传输", "地市专业每百元固定资产对标-传输"),
    "dynamic": ("地市专业每百元固定资产对标动力", "地市专业每百元固定资产对标-动力"),
    "jd_tongbi": ("地市执行进度同环比同比", "地市执行进度同环比-同比"),
    "jd_huanbi": ("地市执行进度同环比环比", "地市执行进度同环比-环比"),
    "order": ("排名排序", "排名（排序）"),
    "incr_percent": ("地市预算同比增长排名增长率", "地市预算同比增长排名-增长率"),
    "incr_year": ("地市预算同比增长排名今年", "地市预算同比增长排名-今年"),
    "incr_last_year": ("地市预算同比增长排名去年", "地市预算同比增长排名-去年"),
    "update_time": ("更新时间", "更新时间"),
    "remark": ("备注说明", "备注说明")
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
