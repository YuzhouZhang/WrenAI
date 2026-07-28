"""
批量修改模型 ID=90 (有线网子中心_家宽告警信息表) 的显示名和描述
使用精确的字段映射数据，通过 wren-ui GraphQL API 更新
将字段显示名和描述更新为对应元数据
"""

import requests
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


# ========== 配置 ==========
GRAPHQL_URL = "http://wren-ui:3000/api/graphql"
MODEL_ID = 90
MODEL_NEW_DISPLAY_NAME = "有线网子中心_家宽告警信息表"
MODEL_NEW_DESCRIPTION = "该表存储的宽带网络告警明细数据，包含OLT、ONU设备告警信息及时间戳，用于监控家宽网络运行状态及故障定位，保障用户宽带接入服务质量。"
# ==========================

# ===== 精确字段映射 (英文引用名 -> 中文显示名, 描述) =====
# 键为小写引用名（与 WrenAI 中存储的一致）
FIELD_MAP = {
    "interrupt_time": ('中断时长', '告警导致业务中断时长'),
    "end_time": ('结束时间', '告警持续结束时间'),
    "starttime": ('开始时间', '告警持续开始时间'),
    "city_name": ('城市名称', '记录告警发生所属城市。取值为浙江省11个地市带“市”全称（杭州市、宁波市、温州市、嘉兴市、湖州市、绍兴市、金华市、衢州市、舟山市、台州市、丽水市）。用户提问简称时，SQL 过滤须补全“市”字全称'),
    "load_time": ('加载时间', '数据入库加载时间'),
    "time_id": ('时间ID', '时间维度编码标识'),
    "eventtime": ('事件时间', '告警事件触发时间'),
    "alarmtitle": ('告警标题', '告警事件简要标题'),
    "alarmid": ('告警ID', '告警唯一标识符'),
    "pon_name": ('PON名称', 'PON口所属机房或链路名称'),
    "onu_name": ('ONU名称', '光网络单元设备名称'),
    "olt_pon": ('OLTPON口', 'OLT设备PON端口号'),
    "olt_ip": ('OLTIP地址', '光线路终端设备IP'),
    "bras_ip": ('BRASIP地址', '宽带远程接入服务器IP'),
    "area_name": ('区域名称', '记录告警发生所属区域或区县。特别注意：县级市（如义乌市、诸暨市等）存储在本字段而非 city_name 字段；用户输入简称时须匹配对应全称'),
    "province_name": ('省份名称', "记录告警发生所属省份。全表唯一固定值为 '浙江省'；当用户提及“浙江”或“浙江省”时，SQL 过滤条件应为 province_name = '浙江省'"),
    "class": ('告警类型', '告警分类描述如终端掉电'),
    "datetime": ('告警时间', '告警发生的具体时间点'),
    "accountid": ('账号ID', '用户宽带账号标识'),
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
