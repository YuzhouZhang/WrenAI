"""
批量修改模型 ID=107 (电子运维管理系统_事件管理工单流程子流程) 的显示名和描述
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
MODEL_ID = 107
MODEL_NEW_DISPLAY_NAME = "电子运维管理系统_事件管理工单流程子流程"
MODEL_NEW_DESCRIPTION = (
    "事件管理工单流程子流程数据，记录工单处理过程中的任务信息，包括任务类型、任务状态、处理人、超时情况等，用于监控和分析工单处理效率和质量。"
)
# ==========================

# ===== 精确字段映射 (英文引用名 -> (中文显示名, 描述)) =====
# 键为小写引用名（与 WrenAI 中存储的一致）
# 显示名与描述保持一致
FIELD_MAP = {
    "last_leave_t2_time": ("最后离开T2的时间", "最后离开T2的时间"),
    "biz_info": ("其他信息", "其他信息"),
    "check_duration": ("考核历时", "考核历时"),
    "send_delay": ("派单延时", "派单延时"),
    "fault_recove_time": ("故障消除时间", "故障消除时间"),
    "t2_last_stage_time": ("T2阶段处理时间", "T2阶段处理时间"),
    "solve_detail": ("解决详情", "解决详情"),
    "new_hidden_name": ("故障处理产生新隐患关联规则", "故障处理产生新隐患关联规则"),
    "known_hidden_name": ("已知隐患故障关联规则", "已知隐患故障关联规则"),
    "intellect_check_msg": ("智能质检信息", "智能质检信息"),
    "is_overclock_sheet": ("是否超频工单", "是否超频工单"),
    "is_overlength_sheet": ("是否超长工单", "是否超长工单"),
    "group_major": ("集团专业", "集团专业"),
    "is_report": ("是否上报集团", "是否上报集团"),
    "auto_check_msg": ("智能质检信息", "智能质检信息"),
    "auto_check_reject_num": ("智能质检驳回次数", "智能质检驳回次数"),
    "fault_level": ("故障级别", "故障级别"),
    "apply_report_user_id": ("申请报结用户ID", "申请报结用户ID"),
    "first_daiwei_units_id": ("代维末端班组", "代维末端班组"),
    "quality_user_id": ("质检人", "质检人"),
    "report_team_id": ("报结人班组", "报结人班组"),
    "report_user_id": ("报结人", "报结人"),
    "apply_report_team_id": ("申请报结班组", "申请报结班组"),
    "accept_dept_id": ("受理班组", "受理班组"),
    "task_user_id": ("当前责任班组/人", "当前责任班组/人"),
    "alarm_is_ned_relation": ("告警是否需要关联", "告警是否需要关联"),
    "threshold_is_exact": ("阈值设置是否准确", "阈值设置是否准确"),
    "index_is_reasonable": ("性能指标是否合理", "性能指标是否合理"),
    "is_real_fault": ("是否命中真实故障", "是否命中真实故障"),
    "customer_phone": ("客户电话", "客户电话"),
    "customer_name": ("客户名称", "客户名称"),
    "transfer_circuit_code": ("传输电路编号", "传输电路编号"),
    "group_customer_level": ("集团客户级别", "集团客户级别"),
    "group_customer_no": ("集团客户编号", "集团客户编号"),
    "sheet_alarm_num": ("工单涉及告警量", "工单涉及告警量"),
    "pda_operate_type": ("PDA处理方式", "PDA处理方式"),
    "is_pda_operate": ("是否pda操作", "是否pda操作"),
    "fault_type": ("故障类型", "故障类型"),
    "mappering_major": ("专业映射", "专业映射"),
    "quality_user": ("质检人", "质检人"),
    "profession_type": ("专业类别", "专业类别"),
    "implement_time": ("采取措施时间", "采取措施时间"),
    "is_tower_reason": ("是否铁塔原因", "是否铁塔原因"),
    "sheet_over_duration": ("工单全程超时", "工单全程超时"),
    "sheet_duration": ("工单全程历时", "工单全程历时"),
    "bussiness_system": ("所属业务平台", "所属业务平台"),
    "is_second_transfer": ("是否二次转派", "是否二次转派"),
    "first_daiwei_units": ("代维末端班组", "代维末端班组"),
    "fault_reason": ("故障归因", "故障归因"),
    "sheet_solve_alarm_num": ("工单涉及告警量", "工单涉及告警量"),
    "send_major": ("派单专业", "派单专业"),
    "accept_t2_timely": ("T2受理时长", "T2受理时长"),
    "fault_duration_t2": ("T2历时", "T2历时"),
    "fault_duration_t2_ratio": ("T2历时占比", "T2历时占比"),
    "order_solve_time": ("预计解决时间", "预计解决时间"),
    "fault_deal_result": ("故障处理结果", "故障处理结果"),
    "handle_method": ("处理措施", "处理措施"),
    "material_type": ("物料类别", "物料类别"),
    "use_num": ("使用量", "使用量"),
    "material_model": ("物料型号", "物料型号"),
    "material_name": ("物料名称", "物料名称"),
    "material_code": ("物料编号", "物料编号"),
    "reject_t2_num": ("驳回T2次数", "驳回T2次数"),
    "t2_last_report_time": ("T2最后申请报结时间", "T2最后申请报结时间"),
    "handle_duty_man": ("实际处理人姓名", "实际处理人姓名"),
    "sendor_derview": ("故障初步处理情况", "故障初步处理情况"),
    "order_deal_location_msg": ("工单预处理定位信息", "工单预处理定位信息"),
    "transfer_type": ("转派方式", "转派方式"),
    "solution": ("解决方案", "解决方案"),
    "delay_cause_count": ("延期次数", "延期次数"),
    "delay_reason": ("延期理由", "延期理由"),
    "delay_cause_type": ("延期原因分类", "延期原因分类"),
    "report_stage": ("报结阶段", "报结阶段"),
    "is_delay_deal": ("是否延期解决", "是否延期解决"),
    "is_quality": ("是否质检", "是否质检"),
    "is_check2_reject": ("是否二级审核驳回", "是否二级审核驳回"),
    "is_check_reject": ("是否一级审核驳回", "是否一级审核驳回"),
    "report_team": ("报结人班组", "报结人班组"),
    "report_user": ("报结人", "报结人"),
    "apply_report_team": ("申请报结班组", "申请报结班组"),
    "apply_report_time": ("申请报结时间", "申请报结时间"),
    "apply_report_user": ("申请报结人", "申请报结人"),
    "deal_process": ("处理过程", "处理过程"),
    "fault_cause_type_name": ("故障原因类别", "故障原因类别"),
    "fault_cause_type": ("故障原因类别", "故障原因类别"),
    "fault_cause_desc": ("故障原因描述", "故障原因描述"),
    "fault_desc": ("故障描述", "故障描述"),
    "deleted": ("删除", "删除"),
    "update_time": ("更新时间", "更新时间"),
    "update_by_name": ("最后一次更新人姓名", "最后一次更新人姓名"),
    "update_by": ("最后一次更新人ID", "最后一次更新人ID"),
    "create_by_name": ("创建人", "创建人"),
    "create_by": ("创建人ID", "创建人ID"),
    "ext_c": ("扩展字段C", "扩展字段C"),
    "ext_b": ("扩展字段B", "扩展字段B"),
    "ext_a": ("扩展字段A", "扩展字段A"),
    "one_audit_by_name": ("一级审核人姓名", "一级审核人姓名"),
    "one_audit_by": ("一级审核人ID", "一级审核人ID"),
    "t2_stage_title": ("T2阶段处理工单主题", "T2阶段处理工单主题"),
    "t2_stage_voucher": ("T2阶段处理凭证", "T2阶段处理凭证"),
    "t2_stage_reason": ("T2阶段处理原因", "T2阶段处理原因"),
    "check_reject_reason": ("审核驳回原因", "审核驳回原因"),
    "t2_last_stage_opinion": ("T2最后阶段处理意见", "T2最后阶段处理意见"),
    "t2_is_upload_file": ("T2处理是否上传附件", "T2处理是否上传附件"),
    "t2_deal_is_timeout": ("T2处理是否超时", "T2处理是否超时"),
    "t2_accept_is_timeout": ("T2受理是否超时", "T2受理是否超时"),
    "t2_deal_limit_time": ("T2处理时限", "T2处理时限"),
    "t2_accept_limit_time": ("T2受理时限", "T2受理时限"),
    "t2_deal_timely": ("T2处理历时", "T2处理历时"),
    "t2_accept_timely": ("T2受理历时", "T2受理历时"),
    "t2_deal_dept_id": ("T2处理部门ID", "T2处理部门ID"),
    "t2_accept_dept_name": ("T2受理部门", "T2受理部门"),
    "t2_accept_dept_id": ("T2受理部门ID", "T2受理部门ID"),
    "t2_deal_by_name": ("T2处理人", "T2处理人"),
    "t2_deal_by_id": ("T2处理人ID", "T2处理人ID"),
    "t2_accept_by_name": ("T2受理人", "T2受理人"),
    "t2_accept_by_id": ("T2受理人ID", "T2受理人ID"),
    "t2_deal_time": ("T2处理时间", "T2处理时间"),
    "t2_accept_time": ("T2受理时间", "T2受理时间"),
    "t2_first_accept_time": ("T2首次受理时间", "T2首次受理时间"),
    "alarm_type": ("告警类型", "告警类型"),
    "alarm_id": ("告警编码ID", "告警编码ID"),
    "alarm_org_name": ("告警机构名称", "告警机构名称"),
    "alarm_org_id": ("告警机构ID", "告警机构ID"),
    "alarm_detail": ("告警正文", "告警正文"),
    "alarm_location": ("告警定位信息", "告警定位信息"),
    "alarm_area": ("区县", "区县"),
    "alarm_region": ("地市", "地市"),
    "ne_name": ("网元名称", "网元名称"),
    "clear_time": ("清除时间", "清除时间"),
    "alarm_send_time": ("告警发生时间", "告警发生时间"),
    "alarm_title": ("告警标题", "告警标题"),
    "network_three_level_major": ("网络三级专业", "网络三级专业"),
    "network_two_level_major": ("网络二级专业", "网络二级专业"),
    "network_one_level_major": ("网络一级专业", "网络一级专业"),
    "delay_time": ("延期时间", "延期时间"),
    "delay_task_name": ("延期环节名称", "延期环节名称"),
    "delay_task_def_id": ("延期环节ID", "延期环节ID"),
    "delay_status": ("延期状态", "延期状态-RUNNING，COMPLETED"),
    "one_audit_task_inst_id": ("一级审核任务ID", "一级审核任务ID"),
    "t3_task_inst_id": ("T3任务ID", "T3任务ID"),
    "t2_task_inst_id": ("T2任务ID", "T2任务ID"),
    "task_inst_id": ("任务实例ID", "任务实例ID"),
    "task_def_id": ("任务实例", "任务实例"),
    "sub_task_is_timeout": ("子任务是否超时", "子任务是否超时"),
    "task_deal_expiry_date": ("子流程超时时间", "子流程超时时间"),
    "assignee_name": ("处理人名称", "处理人名称"),
    "assignee": ("处理人", "处理人"),
    "task_status": ("任务状态", "任务状态"),
    "finish_time": ("结束时间", "结束时间"),
    "create_time": ("创建时间", "创建时间"),
    "task_name": ("任务名称", "任务名称"),
    "task_type": ("任务类型", "任务类型;主派、分派"),
    "sheet_id": ("工单号", "工单号"),
    "main_id": ("mainId", "mainId"),
    "id": ("主键ID", "主键ID"),
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
