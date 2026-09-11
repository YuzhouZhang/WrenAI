"""
批量修改模型 ID=110 (资源中心_光纤收发器设备信息) 的显示名和描述
使用精确的字段映射数据，通过 wren-ui GraphQL API 更新
将字段显示名和描述更新为对应描述
"""

import requests
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


# ========== 配置 ==========
GRAPHQL_URL = "http://wren-ui:3000/api/graphql"
MODEL_ID = 110
MODEL_NEW_DISPLAY_NAME = "资源中心_光纤收发器设备信息"
MODEL_NEW_DESCRIPTION = (
    "光纤收发器设备信息表，记录设备的维护单位、责任人、联系方式、产权单位等信息，用于设备管理和维护。"
)
# ==========================

# ===== 精确字段映射 (英文引用名 -> (中文显示名, 描述)) =====
# 键为小写引用名（与 WrenAI 中存储的一致）
# 显示名与描述保持一致
FIELD_MAP = {
    "extensionid": ("引用标识", "光纤收发器设备的唯一标识"),
    "coverage": ("覆盖范围", "设备覆盖的地理范围"),
    "maintenanceunit": ("维护单位", "负责设备维护的单位"),
    "maintenanceowner": ("维护责任人", "负责设备维护的责任人"),
    "contactphone": ("联系电话", "维护单位的联系电话"),
    "phone": ("固定电话", "维护单位的固定电话"),
    "mobile": ("移动电话", "维护单位的移动电话"),
    "ipaddress": ("IP地址", "设备的IP地址"),
    "propertyrightunit_": ("产权单位", "设备的产权单位"),
    "versioninformation": ("版本信息", "设备的版本信息"),
    "fixedassetnumber": ("固定资产编号", "设备的固定资产编号"),
    "productinstance": ("产品实例标识", "设备的产品实例标识"),
    "customerinterfacetype": ("客户端客户设备端口类型", "客户端客户设备端口的类型"),
    "customerportno": ("客户端客户设备端口编号", "客户端客户设备端口的编号"),
    "portstatus": ("端口状态", "设备端口的状态"),
    "deviceconnectip": ("互联IP地址", "设备互联的IP地址"),
    "customerdevicevlan": ("客户端设备VLAN", "客户端设备的VLAN"),
    "propertyrightunit": ("产权单位编号", "设备产权单位的编号"),
    "customerdevicemacaddress": ("客户端设备MAC地址", "客户端设备的MAC地址"),
    "businessaccesspointlongitude": ("业务接入点经度", "业务接入点的经度"),
    "businessaccesspointlatitude": ("业务接入点纬度", "业务接入点的纬度"),
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

        if ref_name.lower() in FIELD_MAP:
            new_display, new_desc = FIELD_MAP[ref_name.lower()]
            matched += 1
        elif old_desc and old_desc not in ("None", "nan"):
            new_display = old_desc
            new_desc = old_desc
            matched += 1
        else:
            new_display = old_display
            new_desc = old_display
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
