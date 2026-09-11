"""
批量修改模型 ID=109 (电路信息表) 的显示名和描述
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
MODEL_ID = 109
MODEL_NEW_DISPLAY_NAME = "电路信息表"
MODEL_NEW_DESCRIPTION = (
    "电路信息表用于存储电路的详细信息，包括业务等级、传输IP地址、业务设备IP地址、接口类型、链路数量、数据来源等，用于电路管理和维护。"
)
# ==========================

# ===== 精确字段映射 (英文引用名 -> (中文显示名, 描述)) =====
# 键为小写引用名（与 WrenAI 中存储的一致）
# 显示名与描述保持一致
FIELD_MAP = {
    "slalevel": ("业务等级", "电路业务等级"),
    "rmuid": ("资源管理唯一标识", "资源管理唯一标识"),
    "aendnetworklayer": ("A端业务系统", "A端业务系统"),
    "zendnetworklayer": ("Z端业务系统", "Z端业务系统"),
    "aendtranslatedportname": ("A端网管端口名称", "A端网管端口名称"),
    "zendtranslatedportname": ("Z端网管端口名称", "Z端网管端口名称"),
    "addressipv4": ("传输IP地址IPV4", "传输IP地址IPV4"),
    "maskipv4": ("掩码IPV4", "掩码IPV4"),
    "addressipv6": ("传输IP地址IPV6", "传输IP地址IPV6"),
    "maskipv6": ("掩码IPV6", "掩码IPV6"),
    "businessipv4": ("业务设备IP地址IPV4", "业务设备IP地址IPV4"),
    "businessipv6": ("业务设备IP地址IPV6", "业务设备IP地址IPV6"),
    "aendportip": ("A端设备端口IP地址", "A端设备端口IP地址"),
    "interfacetype": ("接口类型", "接口类型"),
    "zendportip": ("Z端设备端口IP地址", "Z端设备端口IP地址"),
    "linkcount": ("链路数量", "链路数量"),
    "datasource": ("数据来源", "数据来源"),
    "projectcode": ("工程编号", "工程编号"),
    "constructunit": ("建设单位", "建设单位"),
    "aendnode_id": ("A端业务系统", "A端业务系统"),
    "zendnode_id": ("Z端业务系统", "Z端业务系统"),
    "purposeforenterprise": ("政企产品用途", "政企产品用途"),
    "isspn": ("是否SPN电路", "是否SPN电路"),
    "nocircuitroute": ("无电路路由", "无电路路由"),
    "nolandingport": ("电路落地网元端口缺失", "电路落地网元端口缺失"),
    "aisreuserport": ("A端是否复用端口", "A端是否复用端口"),
    "zisreuserport": ("Z端是否复用端口", "Z端是否复用端口"),
    "isgwytauditrelease": ("光网易探现场核查更新", "光网易探现场核查更新"),
    "auditstatus": ("稽核状态", "稽核状态"),
    "extensionid": ("引用标识", "引用标识"),
    "servicetype_": ("业务类型", "业务类型"),
    "transcircuitname": ("传输电路名称", "传输电路名称"),
    "interfacetypecode": ("接口类型代码", "接口类型代码"),
    "suffix": ("后缀", "后缀"),
    "aenddistributiondevicetypecode": ("A端连接设备类型", "A端连接设备类型"),
    "zenddistributiondevicetypecode": ("Z端连接设备类型", "Z端连接设备类型"),
    "leasedlineno": ("专线编号", "专线编号"),
    "originalcircuitgroupno": ("原电路群号", "原电路群号"),
    "aendportcategory": ("A端端口类型", "A端端口类型"),
    "aendopticalelectricalfeature": ("A端端口光电特性", "A端端口光电特性"),
    "zendportcategory": ("Z端端口类型", "Z端端口类型"),
    "zendopticalelectricalfeature": ("Z端端口光电特性", "Z端端口光电特性"),
    "opticalcable": ("承载光缆", "承载光缆"),
    "servicetype_bak20150624_": ("业务类型", "业务类型"),
    "servicetype": ("业务类型", "业务类型"),
    "serviceportrack": ("业务端口关联机架", "业务端口关联机架"),
    "serviceportroom": ("业务端口关联机房", "业务端口关联机房"),
    "serviceportfloor": ("业务端口关联楼层", "业务端口关联楼层"),
    "serviceportsite": ("业务端口关联站点", "业务端口关联站点"),
    "servicedevicevendor": ("业务设备厂家", "业务设备厂家"),
    "serveiceportbandwidth_id": ("业务端口带宽ID", "业务端口带宽ID"),
    "serviceporttype": ("业务端口类型", "业务端口类型"),
    "isconstructionunderconfig": ("是否按照配置施工", "是否按照配置施工"),
    "detaildescripetion": ("详细描述", "详细描述"),
    "localtoend": ("本端对端", "本端对端"),
    "specialty": ("所属专业部门专业", "所属专业部门专业"),
    "servicedescription": ("业务描述", "业务描述"),
    "linktype": ("链路类型", "链路类型"),
    "fiberamount": ("纤芯数量", "纤芯数量"),
    "frequencyband": ("频段站型", "频段站型"),
    "loadtype": ("关联业务类型", "关联业务类型"),
    "vlanid": ("VLANID", "VLANID"),
    "aendportworkmode": ("A端端口工作模式", "A端端口工作模式"),
    "aendporttagflag": ("A端端口tag标识", "A端端口tag标识"),
    "zendportworkmode": ("Z端端口工作模式", "Z端端口工作模式"),
    "zendporttagflag": ("Z端端口tag标识", "Z端端口tag标识"),
    "slalevel20200313_": ("SLALEVEL20200313", "SLALEVEL20200313"),
    "circuitrate": ("电路速率", "电路速率"),
    "switchlowcir": ("保障速率", "保障速率"),
    "associationtransmissioncircuit": ("传输电路群号", "传输电路群号"),
    "pauseandrecover": ("停复机标识", "停复机标识"),
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
