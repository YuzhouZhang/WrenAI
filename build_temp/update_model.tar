"""
批量修改模型 ID=66 (API_PMC_CORE_BIG_P_KPI_15MIN) 的显示名和描述
使用精确的字段映射数据，通过 wren-ui GraphQL API 更新
"""

import requests
import json
import sys

# ========== 配置 ==========
GRAPHQL_URL = "http://wren-ui:3000/api/graphql"
MODEL_ID = 68
MODEL_NEW_DISPLAY_NAME = "集中调度平台_台风点表"
MODEL_NEW_DESCRIPTION = (
    "台风点表记录了台风的实时位置、移动方向、速度、风力等级、中心气压等信息，用于台风路径追踪和影响范围分析，具有重要的气象监测和预警价值。"
)
# ==========================

# ===== 精确字段映射 (英文引用名 -> 中文显示名, 描述) =====
# 键为小写引用名（与 WrenAI 中存储的一致）
FIELD_MAP = {
    "id": ("自增id", "自增主键，唯一标识每条记录"),
    "point_id": ("台风点id台风ID台风点时间", "台风点唯一标识，由台风ID和台风点时间组成"),
    "typhoon_id": ("台风id", "台风的唯一标识"),
    "ckposition": ("备用字段", "预留字段，暂无具体用途"),
    "point_jl": ("备用字段", "预留字段，暂无具体用途"),
    "point_lng": ("经度", "台风点的经度坐标"),
    "point_lat": ("纬度", "台风点的纬度坐标"),
    "point_move_dir": ("移动方向", "台风的移动方向"),
    "point_move_speed": ("移动速度", "台风的移动速度"),
    "point_power": ("风力等级", "台风的风力等级"),
    "point_pressure": ("中心气压", "台风中心的气压"),
    "point_radius7": ("7级半径", "7级风力影响范围"),
    "point_radius10": ("10级半径", "10级风力影响范围"),
    "point_radius12": ("12级半径", "12级风力影响范围"),
    "point_speed": ("风速", "台风的风速"),
    "point_strong": ("风力描述", "台风的风力描述"),
    "point_time": ("台风点时间", "台风点的时间"),
    "distance": ("备用字段", "预留字段，暂无具体用途"),
    "create_time": ("入库时间", "数据入库时间"),
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
