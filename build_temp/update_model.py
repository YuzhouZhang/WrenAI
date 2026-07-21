"""
批量修改模型 ID=81 (核心网 VoLTE/IMS 呼叫信令接口数据样例表) 的显示名和描述
使用精确的字段映射数据，通过 wren-ui GraphQL API 更新
将字段显示名修改为与描述一致
"""

import requests
import json
import sys

# ========== 配置 ==========
GRAPHQL_URL = "http://wren-ui:3000/api/graphql"
MODEL_ID = 81
MODEL_NEW_DISPLAY_NAME = "核心网 VoLTE/IMS 呼叫信令接口数据样例表"
MODEL_NEW_DESCRIPTION = ""
# ==========================

# ===== 精确字段映射 (英文引用名 -> 中文显示名, 描述) =====
# 键为小写引用名（与 WrenAI 中存储的一致）
FIELD_MAP = {
    "protocol_id": ('protocol_id', ''),
    "video_codec_name": ('视频编解码', '视频编解码'),
    "service_type_name": ('业务类型', '业务类型'),
    "called_audio_sdp_port_name": ('被叫语音SDP端口号', '被叫语音SDP端口号'),
    "call_duration_name": ('通话时长(s)', '通话时长(s)'),
    "update_early_media_200_ok_delay_name": ('彩铃流程的Update 200 OK时延(ms)', '彩铃流程的Update 200 OK时延(ms)'),
    "callflow_type": ('CALLFLOW_type', 'CALLFLOW_type'),
    "update_early_delay_name": ('彩铃流程的Update时延(ms)', '彩铃流程的Update时延(ms)'),
    "calling_video_sdp_port_name": ('主叫视频SDP端口号', '主叫视频SDP端口号'),
    "pd": ('pd', ''),
    "probeid": ('probeid', ''),
    "dial_number_name": ('拨打号码', '拨打号码'),
    "redirecting_imsi_name": ('前转方IMSI', '前转方IMSI'),
    "first_fail_ne_type_name": ('第一拆线网元类型', '第一拆线网元类型'),
    "col_225020101_name": ('行政区层级2', '行政区层级2'),
    "col_112272141830_name": ('CS Retry触发消息', 'CS Retry触发消息'),
    "callflow": ('callflow', ''),
    "conf_uri_name": ('会议URI', '会议URI'),
    "col_225040101_name": ('行政区层级4', '行政区层级4'),
    "call_hold_name": ('呼叫保持标识', '呼叫保持标识'),
    "called_party_address_hash": ('CALLED_PARTY_ADDRESS', 'CALLED_PARTY_ADDRESS'),
    "encrytimsi_imsi": ('ENCRYTIMSI_IMSI', 'ENCRYTIMSI_IMSI'),
    "finish_warning_name": ('Warning Text', 'Warning Text'),
    "srl_starttime": ('开始时间', '开始时间'),
    "starttime_name": ('starttime_name', ''),
    "play_tone_protocol_name": ('放音协议', '放音协议'),
    "update_delay_name": ('Precondition流程的Update时延(ms)', 'Precondition流程的Update时延(ms)'),
    "alerting_time_name": ('振铃时间(ms)', '振铃时间(ms)'),
    "called_addr_identity_name": ('被叫用户标识', '被叫用户标识'),
    "access_type_name": ('接入网类型', '接入网类型'),
    "procedure_id": ('procedure_id', ''),
    "service_status_name": ('业务状态', '业务状态'),
    "answer_time_name": ('应答时间(ms)', '应答时间(ms)'),
    "srl_starttime_name": ('开始时间', '开始时间'),
    "srl_endtime_name": ('结束时间', '结束时间'),
    "user_type_name": ('用户类型', '用户类型'),
    "srl_interface": ('srl_interface', ''),
    "alert_early_media_type_name": ('180消息P-Early-Media类型', '180消息P-Early-Media类型'),
    "peer_access_info_name": ('对端接入位置信息', '对端接入位置信息'),
    "sid": ('sid', ''),
    "dest_ne_type_name": ('目的网元类型', '目的网元类型'),
    "play_tone_name": ('183或Update消息P-Early-Media类型', '183或Update消息P-Early-Media类型'),
    "firfailtime_name": ('第一拆线时间(ms)', '第一拆线时间(ms)'),
    "calling_addr_identity_name": ('主叫用户标识', '主叫用户标识'),
    "srl_term_untrust_ip_addr_name": ('终端IP', '终端IP'),
    "redirection_address_hash": ('REDIRECTION_ADDRESS', 'REDIRECTION_ADDRESS'),
    "sip_183_delay_name": ('183时延 (ms)', '183时延 (ms)'),
    "imei_name": ('IMEI', 'IMEI'),
    "srl_cw_falg_name": ('呼叫等待标识', '呼叫等待标识'),
    "audio_codec_name": ('语音编解码', '语音编解码'),
    "col_91444686986_name": ('SIP响应码', 'SIP响应码'),
    "impi_tel_uri_hash": ('IMPI_TEL_URI', 'IMPI_TEL_URI'),
    "calling_party_address_name": ('主叫号码', '主叫号码'),
    "callflow_imsi": ('CALLFLOW_imsi', 'CALLFLOW_imsi'),
    "callflow_msisdn": ('CALLFLOW_msisdn', 'CALLFLOW_msisdn'),
    "callflow_iserrorcause": ('CALLFLOW_iserrorcause', 'CALLFLOW_iserrorcause'),
    "callflow_pd": ('CALLFLOW_pd', 'CALLFLOW_pd'),
    "callflow_interfaceid": ('CALLFLOW_interfaceid', 'CALLFLOW_interfaceid'),
    "callflow_cause": ('CALLFLOW_cause', 'CALLFLOW_cause'),
    "callflow_relmsgtype": ('CALLFLOW_relmsgtype', 'CALLFLOW_relmsgtype'),
    "callflow_endtime": ('CALLFLOW_endtime', 'CALLFLOW_endtime'),
    "callflow_sessionid": ('CALLFLOW_sessionid', 'CALLFLOW_sessionid'),
    "callflow_protocolid": ('CALLFLOW_protocolid', 'CALLFLOW_protocolid'),
    "callflow_procedureid": ('CALLFLOW_procedureid', 'CALLFLOW_procedureid'),
    "callflow_probeid": ('CALLFLOW_probeid', 'CALLFLOW_probeid'),
    "callflow_isrt": ('CALLFLOW_isRT', 'CALLFLOW_isRT'),
    "callflow_cdrtype": ('CALLFLOW_cdrType', 'CALLFLOW_cdrType'),
    "callflow_starttime": ('CALLFLOW_starttime', 'CALLFLOW_starttime'),
    "callflow_refid": ('CALLFLOW_refid', 'CALLFLOW_refid'),
    "srl_source_ne_ip_name": ('源网元IP', '源网元IP'),
    "iwf_ability_flag_name": ('IWF SRVCC能力标志', 'IWF SRVCC能力标志'),
    "col_202050101_name": ('接入位置名称', '接入位置名称'),
    "impu_tel_uri_hash": ('IMPU_TEL_URI', 'IMPU_TEL_URI'),
    "dial_number_hash": ('DIAL_NUMBER', 'DIAL_NUMBER'),
    "conf_user_type_name": ('会议中的用户类型', '会议中的用户类型'),
    "source_ne_type_name": ('源网元类型', '源网元类型'),
    "original_party_address_name": ('原被叫地址', '原被叫地址'),
    "ue_ability_flag_name": ('终端SRVCC能力标志', '终端SRVCC能力标志'),
    "srl_called_audio_sdp_ip_addr_name": ('被叫语音SDP IP', '被叫语音SDP IP'),
    "redirecting_imsi_hash": ('REDIRECTING_IMSI', 'REDIRECTING_IMSI'),
    "redirect_reason_name": ('前转原因', '前转原因'),
    "col_225030101_name": ('行政区层级3', '行政区层级3'),
    "session_terminate_flag_name": ('会话中断标志', '会话中断标志'),
    "col_103130101_name": ('第一拆线网元名称', '第一拆线网元名称'),
    "access_info_name": ('接入位置信息', '接入位置信息'),
    "refid": ('refid', ''),
    "col_203050102_name": ('终端品牌', '终端品牌'),
    "srl_failcause": ('srl_failcause', ''),
    "iserrorcause": ('iserrorcause', ''),
    "finish_reason_code_name": ('Reason Code', 'Reason Code'),
    "srl_first_fail_ne_ip_name": ('第一拆线网元IP', '第一拆线网元IP'),
    "visit_domain_name": ('拜访网络域名', '拜访网络域名'),
    "video_rbt_capacity_name": ('主叫终端视频彩铃能力标志', '主叫终端视频彩铃能力标志'),
    "col_48705562008_name": ('目的网元名称', '目的网元名称'),
    "area_code_name": ('区号', '区号'),
    "called_addr_identity_hash": ('CALLED_ADDR_IDENTITY', 'CALLED_ADDR_IDENTITY'),
    "cs_retry_delay_name": ('CS Retry触发时延(ms)', 'CS Retry触发时延(ms)'),
    "col_225010101_name": ('行政区层级1', '行政区层级1'),
    "srl_endtime_utc": ('srl_endtime_utc', ''),
    "called_party_address_name": ('被叫号码', '被叫号码'),
    "srl_dest_ne_ip_name": ('目的网元IP', '目的网元IP'),
    "play_tone_cause_name": ('放音原因', '放音原因'),
    "cdrtype": ('cdrtype', ''),
    "original_party_address_hash": ('ORIGINAL_PARTY_ADDRESS', 'ORIGINAL_PARTY_ADDRESS'),
    "update_200_ok_delay_name": ('Precondition流程的Update 200 OK时延(ms)', 'Precondition流程的Update 200 OK时延(ms)'),
    "srl_retrans_msgtype_name": ('重传消息', '重传消息'),
    "encrytmsisdn_msisdn": ('ENCRYTMSISDN_MSISDN', 'ENCRYTMSISDN_MSISDN'),
    "redirection_address_name": ('前转目的方地址', '前转目的方地址'),
    "finish_reason_protocol_name": ('Reason Protocol', 'Reason Protocol'),
    "v_starttime": ('v_starttime', ''),
    "called_video_port_name": ('被叫视频SDP端口号', '被叫视频SDP端口号'),
    "device_type_name": ('VoLTE终端OS版本', 'VoLTE终端OS版本'),
    "starttime": ('starttime', ''),
    "calling_audio_sdp_port_name": ('主叫语音SDP端口号', '主叫语音SDP端口号'),
    "srl_called_video_ip_addr_name": ('被叫视频SDP IP', '被叫视频SDP IP'),
    "srl_endtime": ('结束时间', '结束时间'),
    "release_time_name": ('释放时间(ms)', '释放时间(ms)'),
    "finish_reason_name": ('Reason Text', 'Reason Text'),
    "redirect_counter_name": ('前转次数', '前转次数'),
    "impu_tel_uri_name": ('MSISDN', 'MSISDN'),
    "calling_addr_identity_hash": ('CALLING_ADDR_IDENTITY', 'CALLING_ADDR_IDENTITY'),
    "col_203050103_name": ('终端型号', '终端型号'),
    "col_48696404520_name": ('源网元名称', '源网元名称'),
    "peer_access_type_name": ('对端接入网类型', '对端接入网类型'),
    "tai_name": ('跟踪区标识', '跟踪区标识'),
    "col_2334010101_name": ('对端接入位置名称', '对端接入位置名称'),
    "prack_200_ok_delay_name": ('PRACK 200 OK时延(ms)', 'PRACK 200 OK时延(ms)'),
    "sv_name": ('IMEI软件版本号', 'IMEI软件版本号'),
    "imei_hash": ('IMEI', 'IMEI'),
    "update_early_media_200_ok_result_name": ('彩铃媒体协商结果', '彩铃媒体协商结果'),
    "prack_delay_name": ('PRACK时延(ms)', 'PRACK时延(ms)'),
    "calling_party_address_hash": ('CALLING_PARTY_ADDRESS', 'CALLING_PARTY_ADDRESS'),
    "srl_term_untrust_ip_addr_hash": ('SRL_TERM_UNTRUST_IP_ADDR', 'SRL_TERM_UNTRUST_IP_ADDR'),
    "srl_calling_audio_sdp_ip_addr_name": ('主叫语音SDP IP', '主叫语音SDP IP'),
    "retransmsg_timeoffset_name": ('重传消息时间(ms)', '重传消息时间(ms)'),
    "interface_name": ('接口类型', '接口类型'),
    "impi_tel_uri_name": ('IMSI', 'IMSI'),
    "call_side_name": ('呼叫侧类型', '呼叫侧类型'),
    "first_fail_ne_id": ('first_fail_ne_id', ''),
    "srl_calling_video_sdp_ip_addr_name": ('主叫视频SDP IP', '主叫视频SDP IP'),
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
