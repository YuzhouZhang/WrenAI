"""
批量修改模型 ID=103 (数据共享平台_字段级元数据信息表) 的显示名和描述
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
MODEL_ID = 103
MODEL_NEW_DISPLAY_NAME = "数据共享平台_字段级元数据信息表"
MODEL_NEW_DESCRIPTION = (
    "本表为【全省/全域数据共享平台-字段级元数据信息表/字段字典台账】，记录了所有数据资产表中每一个字段的列名、数据类型、业务含义、计算指标口径算法及字段分类角色。通过元数据ID(metadata_id)与表级元数据表关联。\n\n"
    "【适用场景与提问意图】：\n"
    "1. 字段与列名查询：查询某张表(metadata_id)包含哪些字段/列、字段中文名(field_cn_name)、字段英文名/列名(field_en_name)、字段描述(field_desc)。\n"
    "2. 业务指标与计算口径：查询某指标的业务定义(metric_def)、计算公式/算法/SQL表达式(metric_algo)、计量单位(metric_unit)、是否为指标(is_metric='是')。\n"
    "3. 字段分类与角色：按字段分类角色(remark)筛选维度字段、主键字段、事实字段、计算指标、基础指标、时间维度、空间维度等。\n"
    "4. 物理结构与数据类型：查询字段数据类型(field_type, 如 VARCHAR/BIGINT/DECIMAL)、字段长度(field_length)、字段精度(field_precision)。\n\n"
    "【别名/同义词】：字段字典、列元数据、字段台账、指标字典、字段口径表、字段算法表、指标汇总表、数据列清单。"
)
# ==========================

# ===== 精确字段映射 (英文引用名 -> 中文显示名, 描述) =====
# 键为小写引用名（与 WrenAI 中存储的一致）
FIELD_MAP = {
    "id": ('自增主键', '字段记录的唯一自增主键数字ID，数值类型(BIGINT)'),
    "metadata_id": ('元数据ID', '关联表级元数据(table_level_info)的外键元数据ID，用于表与字段的层级关联'),
    "field_cn_name": ('字段中文名', '字段的业务中文名称与业务别名，如机房ID、设备名称、掉话率、统计时间等，支持LIKE模糊匹配'),
    "field_en_name": ('字段英文名', '物理/逻辑数据库表中的字段英文名称/列名，如 customer_id、alarm_time、data_volume，回答“英文列名”、“字段名”时使用'),
    "field_type": ('字段类型', "字段在底层数据库中的数据类型，全量枚举值：'VARCHAR'、'STRING'、'BIGINT'、'INT'、'INTEGER'、'DECIMAL'、'DOUBLE'、'FLOAT'、'NUMBER'、'NUMERIC'、'SMALLINT'、'DATE'、'DATETIME'、'TIMESTAMP'、'TEXT'"),
    "field_length": ('字段长度', '字段在数据库中允许的最大字符长度或物理字节空间大小（数值，如 32, 64, 128, 255）'),
    "field_precision": ('字段精度', '数值或浮点型字段的小数点精度位数（数值，如 0, 2, 4）'),
    "field_desc": ('字段描述', '字段在业务中的具体定义、取值范围、单位说明或业务含义规则描述文本'),
    "is_metric": ('字段是否指标', "标识该字段是否为业务度量/统计指标，全量枚举值：'是'、'否'、'0'"),
    "metric_def": ('指标定义', '当字段为指标时，该指标的业务统计口径定义说明（如 5G基站流量汇总、5G基站掉话率、无线接通率）'),
    "metric_algo": ('指标算法', "当字段为指标时，该指标的统计计算公式或SQL聚合表达式，常见如 'COUNT(*)'、'SUM(data_volume)'、'COUNT(DISTINCT user_id)'"),
    "metric_unit": ('指标单位', "业务指标的计量单位，全量枚举值：'%'、'GB'、'MB'、'ms'、'次'、'次/千次'、'条'、'个'、'户'、'分钟'、'小时'、'张'、'台'、'字节'、'万'、'无'"),
    "remark": ('备注', "字段在元数据字典中的角色分类备注，全量枚举值：'维度字段'、'主键字段'、'事实字段'、'计算指标'、'基础指标'、'复合指标'、'衍生指标'、'文本属性'、'时间维度'、'空间维度'、'业务主键'、'拓展预留'"),
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
