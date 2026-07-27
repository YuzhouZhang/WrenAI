"""
将模型字段的 description 复制到 alias (displayName)，替换原来的字段别名
修复 Windows 控制台 GBK 编码兼容性问题
"""

import requests
import json
import sys
import io

# 强制设置 stdout 编码为 UTF-8 防止 GBK 打印 emoji 报错
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

GRAPHQL_URL = "http://localhost:3000/api/graphql"
TARGET_REF_NAME = "mysql_telecom_db_api_sample"

def graphql_request(query, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    try:
        resp = requests.post(GRAPHQL_URL, json=payload, timeout=30)
        resp.raise_for_status()
        result = resp.json()
        if "errors" in result:
            print(f"[ERROR] GraphQL 错误: {json.dumps(result['errors'], ensure_ascii=False, indent=2)}")
            return None
        return result
    except Exception as e:
        print(f"[ERROR] 请求失败: {e}")
        return None

def get_target_model(ref_name):
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
    if not result or "data" not in result or "listModels" not in result["data"]:
        return None, None
    
    for model in result["data"]["listModels"]:
        if model["referenceName"] == ref_name or model["displayName"] == ref_name:
            return model, model["fields"]
            
    # 如果没有精准匹配，取第一个非 tpch 的模型
    models = result["data"]["listModels"]
    if models:
        for m in models:
            if not m["referenceName"].startswith("tpch"):
                return m, m["fields"]
        return models[0], models[0]["fields"]
        
    return None, None

def main():
    model, fields = get_target_model(TARGET_REF_NAME)
    if not model:
        print(f"[ERROR] 未找到模型 {TARGET_REF_NAME}")
        return

    model_id = model["id"]
    print(f"[SUCCESS] 找到目标模型 (ID={model_id}): {model['displayName']} ({model['referenceName']})")
    print(f"共 {len(fields)} 个字段\n")

    columns_update = []
    updated_count = 0
    unchanged_count = 0

    print("字段别名替换预览:")
    print(f"{'标记':<4} {'字段ID':<8} {'引用名':<35} {'原别名(Alias)':<25} -> {'新别名(Alias)':<25} {'描述(Description)'}")
    print("-" * 120)

    for f in fields:
        ref_name = f["referenceName"]
        old_alias = f["displayName"]
        desc = ""
        if f.get("properties") and isinstance(f["properties"], dict):
            desc = f["properties"].get("description", "") or ""

        desc_clean = str(desc).strip()
        
        # 判断 description 是否有效（非 nan, none, -）
        if desc_clean and desc_clean.lower() not in ("nan", "none", "-"):
            new_alias = desc_clean
            updated_count += 1
            status = "[UPDATE]"
        else:
            new_alias = old_alias
            unchanged_count += 1
            status = "[KEEP]"

        print(f"{status:<8} {f['id']:<8} {ref_name:<35} {old_alias:<25} -> {new_alias:<25} {desc_clean}")

        columns_update.append({
            "id": f["id"],
            "displayName": new_alias,
            "description": desc
        })

    print("-" * 120)
    print(f"统计结果: {updated_count} 个字段用 Description 替换了 Alias，{unchanged_count} 个字段保持原 Alias。\n")

    if updated_count == 0:
        print("[WARN] 没有需要修改别名的字段（可能 description 均为空或为 nan）。")

    # 执行更新
    mutation = """
    mutation UpdateModelMetadata($where: ModelWhereInput!, $data: UpdateModelMetadataInput!) {
        updateModelMetadata(where: $where, data: $data)
    }
    """
    variables = {
        "where": {"id": model_id},
        "data": {
            "displayName": model["displayName"],
            "description": model.get("description", "") or "",
            "columns": columns_update
        }
    }

    print("正在提交模型更新...")
    res = graphql_request(mutation, variables)
    if res and res.get("data", {}).get("updateModelMetadata"):
        print("[SUCCESS] 模型元数据更新成功！")
        
        # 自动 deploy
        print("\n正在 Deploy 配置生效...")
        deploy_res = graphql_request("mutation { deploy }")
        if deploy_res and "errors" not in deploy_res:
            print("[SUCCESS] Deploy 成功，新字段别名已生效！")
        else:
            print("[ERROR] Deploy 失败，请在 Wren UI 手动点击 Deploy")
    else:
        print("[ERROR] 更新失败")

if __name__ == "__main__":
    main()
