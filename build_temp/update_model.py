"""
批量修改模型 ID=101 (集中调度平台_天资源数据_机房信息表) 的显示名和描述
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
MODEL_ID = 101
MODEL_NEW_DISPLAY_NAME = "集中调度平台_天资源数据_机房信息表"
MODEL_NEW_DESCRIPTION = "包含机房的租赁信息、产权信息、使用单位、资产状态等详细数据，用于管理和维护机房资源，确保资源的有效利用和管理"
# ==========================

# ===== 精确字段映射 (英文引用名 -> 中文显示名, 描述) =====
# 键为小写引用名（与 WrenAI 中存储的一致）
FIELD_MAP = {
    "id": ('标识', '唯一标识'),
    "transsync": ('是否送传输网管', '是否同步到传输网管系统'),
    "onlinestatus": ('服务状态', '机房服务状态'),
    "enterprisecode": ('集团编码', '集团编码'),
    "enterprisename": ('集团名称', '集团名称'),
    "leasestartdate": ('租赁起始日期', '租赁开始日期'),
    "contractamount": ('合同金额', '合同金额'),
    "contractcontacterphone": ('合同对方联系电话', '合同对方联系电话'),
    "contractcontacter": ('合同对方联系人', '合同对方联系人'),
    "contractparty": ('合同对方', '合同对方'),
    "propertyunit": ('物业单位', '物业单位'),
    "dimarea": ('机房面积', '机房面积'),
    "paydate": ('付款日期', '付款日期'),
    "leaseenddate": ('租赁结束日期', '租赁结束日期'),
    "assetbarcode": ('资产条形码', '资产条形码'),
    "useunit": ('使用单位', '使用单位'),
    "owner": ('产权单位', '产权单位'),
    "assetuse": ('资产用途', '资产用途'),
    "assetstatus": ('资产状态', '资产状态'),
    "propertycategory": ('产权性质', '产权性质'),
    "assetno": ('固定资产编号', '固定资产编号'),
    "projectname": ('工程名称', '工程名称'),
    "pipelinesync": ('是否送管线系统', '是否同步到管线系统'),
    "sitecategory": ('局站类型', '局站类型'),
    "address_id": ('所属标准地址', '所属标准地址'),
    "assemblename": ('拼装名称', '拼装名称'),
    "locationcategory": ('网络资源点类型', '网络资源点类型'),
    "virtualcategory": ('显示类别', '显示类别'),
    "image": ('图片', '图片'),
    "locationlevel": ('业务级别', '业务级别'),
    "inventoryimportingtemplate_id": ('导入模板', '导入模板'),
    "site_id": ('所属站点', '所属站点'),
    "township_id": ('所属乡镇街道', '所属乡镇街道'),
    "county_id": ('所属区县', '所属区县'),
    "prefecture_id": ('所属地市', '所属地市'),
    "province_id": ('所属省份', '所属省份'),
    "lifecyclestatus": ('生命周期状态', '生命周期状态'),
    "alias": ('别名', '别名'),
    "entitytype_id": ('实体类型', '实体类型'),
    "updater": ('修改人', '修改人'),
    "updatedate": ('修改时间', '修改时间'),
    "creator": ('新增人', '新增人'),
    "createdate": ('新增时间', '新增时间'),
    "version": ('乐观锁', '乐观锁'),
    "memo": ('备注', '备注'),
    "code": ('编码', '编码'),
    "name": ('名称', '名称'),
    "floodlevel": ('机房防汛等级', '机房防汛等级'),
    "specialrequirement": ('进入机房的特殊要求', '进入机房的特殊要求'),
    "noisestandard": ('区域噪音标准', '区域噪音标准'),
    "noisedecibel": ('噪音分贝', '记录机房噪音分贝值'),
    "hasnoisereduction": ('是否有降噪设备', '标识机房是否安装了降噪设备'),
    "holedirection": ('馈线孔洞朝向', '记录馈线孔洞的朝向'),
    "haspreventingwaterleakage": ('是否有房屋防漏水措施', '标识机房是否采取了防漏水措施'),
    "hasoilmachine": ('有无快速油机接口', '标识机房是否具备快速油机接口'),
    "haswaterproofwall": ('有无防水墙', '标识机房是否具备防水墙'),
    "buildingcategory": ('机房建筑物类型', '记录机房建筑物类型'),
    "areausageratio": ('面积使用率', '记录机房面积使用率'),
    "installationratio": ('装机率', '记录机房装机率'),
    "estimatedinstallationamount": ('预估装机数', '记录机房预估装机数'),
    "enterprisecustomerpoint": ('是否是集团客户点', '标识机房是否为集团客户点'),
    "businesshall": ('是否是营业厅', '标识机房是否为营业厅'),
    "detailedaddress": ('详细地址', '记录机房的详细地址'),
    "bearingcapacity": ('承重能力', '记录机房的承重能力'),
    "columndirection": ('机架列方向', '记录机架列方向'),
    "rowdirection": ('机架行方向', '记录机架行方向'),
    "roomcategory": ('机房类型', '记录机房类型'),
    "plannningendcolumn": ('机架终止列号', '记录机架终止列号'),
    "plannningendrow": ('机架终止行号', '记录机架终止行号'),
    "dimheight": ('机房层高', '记录机房层高'),
    "dimwidth": ('机房宽度', '记录机房宽度'),
    "dimlength": ('机房长度', '记录机房长度'),
    "floornumber": ('所在楼层', '记录机房所在楼层'),
    "extensionid": ('引用标识', '记录引用标识'),
    "plannningstartcolumn": ('机架起始列号', '记录机架起始列号'),
    "plannningstartrow": ('机架起始行号', '记录机架起始行号'),
    "sharedunit": ('共享单位', '记录共享单位'),
    "isshared": ('是否共享', '标识机房是否共享'),
    "commonconstructionunit": ('共建单位', '记录共建单位'),
    "iscommonconstruction": ('是否共建', '标识机房是否共建'),
    "maintenancearea": ('所属维护区域', '记录机房所属维护区域'),
    "generalsiteaddress": ('共站址', '记录共站址'),
    "propertyunitcontacterphone": ('物业单位联系人电话', '记录物业单位联系人电话'),
    "propertyunitcontacter": ('物业单位联系人', '记录物业单位联系人'),
    "relatedcontactphone": ('相关联系电话', '记录相关联系电话'),
    "relatedcontacter": ('相关联系人', '记录相关联系人'),
    "hasairconditioningsecurityfaci": ('是否有空调防盗设施', '标识机房是否具备空调防盗设施'),
    "hasaircondition": ('是否有空调', '标识机房是否具备空调'),
    "builddate": ('创建日期', '记录机房创建日期'),
    "doorposition": ('门的位置', '记录门的位置'),
    "assetcode": ('资产编号', '记录机房资产编号'),
    "floormaxnum": ('楼宇楼层数', '记录楼宇楼层数'),
    "abbreviation": ('缩写', '记录机房缩写'),
    "addressshared": ('与其他运营商共址', '标识机房是否与其他运营商共址'),
    "propertycompany": ('物业单位', '记录物业单位'),
    "sitelevel": ('机房级别', '记录机房级别'),
    "preventtheftlevel": ('机房防盗等级', '记录机房防盗等级'),
    "securitylevel": ('机房安全等级', '记录机房安全等级'),
    "room_id": ('所属机房', '记录所属机房'),
    "hosttype": ('业主类型', '记录业主类型'),
    "isfibergw": ('是否为分纤点', '标识是否为分纤点'),
    "opticalnetlay": ('光交基础网层级', '光交基础网层级'),
    "isduplicated": ('梳理确认是否重复', '标识是否重复'),
    "s_fibergwtype": ('分纤点类型', '分纤点类型'),
    "toweroperationcode": ('铁塔公司运维编码', '铁塔公司运维编码'),
    "twoleveleomsaccount": ('上二级主管EOMS账号', '上二级主管EOMS账号'),
    "physiteno": ('物理站址编号', '物理站址编号'),
    "roomcontract": ('合同房屋金额', '合同房屋金额'),
    "countendurance": ('计算续航能力', '计算续航能力'),
    "asset_id_": ('资产ID', '资产ID'),
    "oldresourcetaskid": ('关联任务(三库分离字段)', '关联任务(三库分离字段)'),
    "threeleveleomsaccount": ('上三级主管EOMS账号', '上三级主管EOMS账号'),
    "positionpointcode": ('位置点标识', '位置点标识'),
    "positionnumber": ('机架位置总数', '机架位置总数'),
    "broletelephone": ('维护组B角手机电话号码', '维护组B角手机电话号码'),
    "towercompanyname": ('铁塔公司名称', '铁塔公司名称'),
    "propertyunitemail": ('物业单位联系的邮件地址', '物业单位联系的邮件地址'),
    "superiorname": ('上一级主管姓名', '上一级主管姓名'),
    "region2plannningstartcolumn": ('区域二机架起始列号', '区域二机架起始列号'),
    "regionbranchunit_id": ('区域维护部', '区域维护部'),
    "leasestartdate_": ('租赁开始日期', '租赁开始日期'),
    "assetlocal": ('财务地点', '财务地点'),
    "generatetracktime": ('发电路程时间', '发电路程时间'),
    "roomlevel": ('机房级别', '机房级别'),
    "s_county_id": ('区县ID', '区县ID'),
    "isattcomplete": ('属性是否完整', '属性是否完整'),
    "projectname0812bak_": ('项目名称备份', '项目名称备份'),
    "owner_": ('所有者', '所有者'),
    "servicelevel": ('基站服务等级', '基站服务等级'),
    "spatialid": ('空间ID', '空间ID'),
    "s_isfibergw": ('是否为分纤点', '是否为分纤点'),
    "paydate_": ('支付日期', '支付日期'),
    "propertyrights": ('移动产权移交铁塔情况', '移动产权移交铁塔情况'),
    "platformname": ('天面名称', '天面名称'),
    "longitude": ('经度', '经度'),
    "isctttocmcc": ('是否铁通迁移到移动', '是否铁通迁移到移动'),
    "endmaintaingroupid": ('代维末端班组ID', '代维末端班组ID'),
    "s_isfamilycustomercoving": ('是否覆盖家庭客户', '是否覆盖家庭客户'),
    "threelevelname": ('上三级主管姓名', '上三级主管姓名'),
    "oldresourcecheckstatus": ('审核状态', '审核状态'),
    "branchunit_id": ('维护单位', '维护单位'),
    "s_locationcategory": ('位置类别', '位置类别'),
    "s_locationlevel": ('位置级别', '位置级别'),
    "roomremotetype": ('机房类型细化', '机房类型细化'),
    "eomsroleid": ('EOMS角色组ID', 'EOMS角色组ID'),
    "category": ('分类', '分类'),
    "superioreomsaccount": ('上一级主管EOMS账号', '上一级主管EOMS账号'),
    "region2plannningendrow": ('区域二机架终止行号', '区域二机架终止行号'),
    "twodimensioncode": ('二维码', '二维码'),
    "commonconstructionunit_": ('共同建设单位', '共同建设单位'),
    "electricpaycycle": ('电费支付周期', '电费支付周期'),
    "site_type_": ('站点类型', '站点类型'),
    "isplanningresource": ('是否规划数据', '是否规划数据'),
    "propertytransfermemo": ('铁塔移交备注', '铁塔移交备注'),
    "device_id": ('所属设备', '所属设备'),
    "generatetime": ('发电时间段', '发电时间段'),
    "useunit__": ('使用单位', '使用单位'),
    "region2plannningstartrow": ('区域二机架起始行号', '区域二机架起始行号'),
    "twolevelname": ('上二级主管姓名', '上二级主管姓名'),
    "powerfromtype": ('供电方式', '供电方式'),
    "contactorderno": ('采购订单编号', '采购订单编号'),
    "initialendurance": ('初始续航能力', '初始续航能力'),
    "s_georegion_id": ('地理区域ID', '地理区域ID'),
    "floornumber_": ('楼层编号', '楼层编号'),
    "s_township_id": ('乡镇ID', '乡镇ID'),
    "latitude": ('纬度', '纬度'),
    "usedurate": ('机房U数占用率', '机房U数占用率'),
    "cityreview": ('地市公司审核', '地市公司审核'),
    "sharedunit_": ('共享单位', '共享单位'),
    "s_entitytype_id": ('实体类型ID', '实体类型ID'),
    "arolename": ('维护组_A角姓名', '维护组_A角姓名'),
    "antennacontract": ('合同天线金额', '合同天线金额'),
    "position_id": ('所属位置点id', '所属位置点id'),
    "generatesendtime": ('发电派单延时时间', '发电派单延时时间'),
    "islabelprinted": ('标签是否打印', '标签是否打印'),
    "aroleeomsaccount": ('维护组_A角EOMS账号', '维护组_A角EOMS账号'),
    "site_level_": ('站点等级', '站点等级'),
    "electricunitprice": ('电费单价', '电费单价'),
    "assignedrolename": ('分派到个人角色名称', '分派到个人角色名称'),
    "brolename": ('维护组_B角姓名', '维护组_B角姓名'),
    "s_sitecategory": ('站点类别', '站点类别'),
    "groupirmname": ('集团综资中名称', '集团综资中名称'),
    "broleeomsaccount": ('维护组_B角EOMS账号', '维护组_B角EOMS账号'),
    "endmaintaingroup": ('代维末端班组', '代维末端班组'),
    "georegion_id": ('所属图形区域', '所属图形区域'),
    "s_province_id": ('省份ID', '省份ID'),
    "propertytransferdate": ('铁塔交接时间', '铁塔交接时间'),
    "totalunumber": ('机房U数', '机房U数'),
    "projectcode": ('工程编码', '工程编码'),
    "haspowerdevice": ('是否建有动环设备', '是否建有动环设备'),
    "emergency_id": ('所属应急通信车', '所属应急通信车'),
    "maintancedept": ('维护属地', '维护属地'),
    "idingranite_": ('Granite 系统内 ID', 'Granite 系统内 ID'),
    "leaseenddate_": ('租赁到期日期', '租赁到期日期'),
    "datamaintenancepersonnel": ('一线数据维护人', '一线数据维护人'),
    "roomposition": ('楼层内位置', '楼层内位置'),
    "fibergwtype": ('分纤点级别', '分纤点级别'),
    "isonlyopticalfiber": ('是否光交汇聚', '是否光交汇聚'),
    "towercompanycode": ('铁塔公司编码', '铁塔公司编码'),
    "usedunumber": ('占用U数', '占用U数'),
    "cscsitename": ('动环网管基站名称', '动环网管基站名称'),
    "duplicatedobjectname": ('重复目标机房名称', '重复目标机房名称'),
    "objectid": ('对象ID', '对象ID'),
    "irmordercode": ('综资工单名称', '综资工单名称'),
    "maintenancemethod": ('维护方式', '维护方式'),
    "assetlocaldesc": ('财务地点描述', '财务地点描述'),
    "useunit_": ('使用单位', '使用单位'),
    "powerdeviceproperty": ('动环设备产权', '动环设备产权'),
    "region2rowdirection": ('区域二机架行方向', '区域二机架行方向'),
    "se_anno_cad_data": ('CAD数据', 'CAD数据'),
    "propertycontract": ('合同物业管理费金额', '合同物业管理费金额'),
    "stronghold_id": ('所属网络资源点', '所属网络资源点'),
    "s_virtualcategory": ('虚拟类别', '虚拟类别'),
    "aroletelephone": ('维护组A角手机电话号码', '维护组A角手机电话号码'),
    "s_name": ('名称', '名称'),
    "liableperson": ('数据质量责任人', '数据质量责任人'),
    "region2columndirection": ('区域二机架列方向', '区域二机架列方向'),
    "uniquecode": ('唯一代码', '唯一代码'),
    "towerroom_id": ('铁塔公司机房', '铁塔公司机房'),
    "powerroomlevel": ('动环机房级别', '动环机房级别'),
    "batterysupporttime": ('蓄电池续航时间', '蓄电池续航时间'),
    "propertytransfertype": ('铁塔交接情况', '铁塔交接情况'),
    "maintainconter": ('代维中心', '代维中心'),
    "provincereview": ('省公司审核', '省公司审核'),
    "idinhotu_": ('ID', 'ID'),
    "delicery": ('交付状态', '交付状态'),
    "electricpaydate": ('电费支付日期', '电费支付日期'),
    "owner2_": ('所有者2', '所有者2'),
    "oldresourcechecktime": ('外线库审核时间', '外线库审核时间'),
    "generatorpower": ('发电油机匹配', '发电油机匹配'),
    "freepositionnumber": ('空闲机架数', '空闲机架数'),
    "codeincntower": ('铁塔公司站址编号', '铁塔公司站址编号'),
    "s_prefecture_id": ('区县ID', '区县ID'),
    "cscsite_id": ('动环网管基站', '动环网管基站'),
    "usedpositionrate": ('机架位置占有率', '机架位置占有率'),
    "propertyunitcontactoremail": ('物业单位联系人的邮件地址', '物业单位联系人的邮件地址'),
    "platformproperty": ('天面产权性质', '天面产权性质'),
    "region2plannningendcolumn": ('区域二机架终止列号', '区域二机架终止列号'),
    "rangeofdriving": ('车程', '车程'),
    "isprovincialmanage": ('是否省管', '是否省管'),
    "objecttypeingranite_": ('对象类型', '对象类型'),
    "usedpositionnumber": ('占用机架数', '占用机架数'),
    "isdividedoublearea": ('是否划分为双区域', '是否划分为双区域'),
    "identification": ('资源标识', '资源标识'),
    "propertyunitwebsite": ('物业单位网址', '物业单位网址'),
    "dimarea_": ('区域', '区域'),
    "constructunit_id": ('所属建设单位', '所属建设单位'),
    "remoteunitamount": ('拉远数量', '拉远数量'),
    "ispersonnel": ('是否代维', '是否代维'),
    "nameincntower": ('铁塔公司识别名', '铁塔公司识别名'),
    "update_time": ('更新时间', '记录数据更新的时间'),
    "totalpowerofdevice": ('设备额定总功率', '记录设备的额定总功率'),
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
