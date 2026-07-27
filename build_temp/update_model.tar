"""
批量修改模型 ID=84 (承载网工作台_带宽流量数据表) 的显示名和描述
使用精确的字段映射数据，通过 wren-ui GraphQL API 更新
将字段显示名修改为与描述一致
"""

import requests
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


# ========== 配置 ==========
GRAPHQL_URL = "http://wren-ui:3000/api/graphql"
MODEL_ID = 84
MODEL_NEW_DISPLAY_NAME = "承载网工作台_带宽流量数据表"
MODEL_NEW_DESCRIPTION = "存储IP网络带宽流量性能数据，用于监控网络流量峰值和均值，帮助优化网络资源配置。"
# ==========================

# ===== 精确字段映射 (英文引用名 -> 中文显示名, 描述) =====
# 键为小写引用名（与 WrenAI 中存储的一致）
FIELD_MAP = {
    "link_level_name": ('地市', '地市名称（浙江省11个地市简称，不带“市”字，包含：杭州、宁波、温州、嘉兴、湖州、绍兴、金华、衢州、舟山、台州、丽水）'),
    "bandwidth": ('带宽G', '带宽值单位G'),
    "influx_total_max": ('流入峰值Gbps', '流入峰值单位Gbps'),
    "outflux_total_max": ('流出峰值Gbps', '流出峰值单位Gbps'),
    "influx_avg_max": ('流入均值Gbps', '流入均值单位Gbps'),
    "outflux_avg_max": ('流出均值Gbps', '流出均值单位Gbps'),
    "data_time": ('时间', '记录数据的时间'),
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
    print(f"  {'ID':<6} {'引用名':<35} {'当前显示名':<30} → {'新显示名':<30} {'新描述'}")
    print(f"  {'─'*6} {'─'*35} {'─'*30}   {'─'*30} {'─'*30}")

    for f in fields:
        ref_name = f["referenceName"]
        old_display = f["displayName"]
        old_desc = ""
        if f.get("properties") and isinstance(f["properties"], dict):
            old_desc = f["properties"].get("description", "")

        if ref_name in FIELD_MAP:
            new_display, new_desc = FIELD_MAP[ref_name]
            matched += 1
        elif old_desc and old_desc not in ("None", "nan"):
            new_display = old_desc
            new_desc = old_desc
            matched += 1
        else:
            new_display = old_display
            new_desc = old_desc
            unmatched += 1

        changed = (old_display != new_display) or (old_desc != new_desc)
        marker = "🔄" if changed else "✅"
        print(f"  {marker} {f['id']:<4} {ref_name:<33} {old_display:<28} → {new_display:<28} {new_desc}")

        columns_update.append({
            "id": f["id"],
            "displayName": new_display,
            "description": new_desc
        })

    print(f"\n  📊 统计: 处理 {matched} 个带映射/描述字段, 保留 {unmatched} 个无描述字段")
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
