# EOMS 系统专用数据模型与元数据接口文档
# (EOMS System Data Model & Metadata API Documentation)

本文档专门提供给 **EOMS（集中运维管理系统）** 研发与运维团队，用于快速对接 Wren AI 数据智能平台的**元数据只读查询**与**自然语言 Text-to-SQL 智能流式数据问答**接口。

---

## 目录 (Table of Contents)

1. [服务地址与认证鉴权 (Base URL & Authentication)](#1-服务地址与认证鉴权-base-url--authentication)
2. [接口概览 (Endpoints Overview)](#2-接口概览-endpoints-overview)
3. [元数据只读接口 (Metadata Endpoints - EOMS 专属)](#3-元数据只读接口-metadata-endpoints---eoms-专属)
   - [3.1 获取全部数据源表清单 (ListDataSourceTables)](#31-获取全部数据源表清单-listdatasourcetables)
   - [3.2 获取指定数据表的字段详情 (DataSourceTable)](#32-获取指定数据表的字段详情-datasourcetable)
4. [智能流式问答与 SQL 查询接口 (Text-to-SQL Endpoints)](#4-智能流式问答与-sql-查询接口-text-to-sql-endpoints)
   - [4.1 智能流式问答一站式接口 (/api/v1/stream/ask)](#41-智能流式问答一站式接口-apiv1streamask)
   - [4.2 自然语言生成 SQL (/api/v1/generate_sql)](#42-自然语言生成-sql-apiv1generate_sql)
   - [4.3 SQL 执行与数据获取 (/api/v1/run_sql)](#43-sql-执行与数据获取-apiv1run_sql)
5. [多语言流式调用示例 (Code Examples)](#5-多语言流式调用示例-code-examples)
   - [5.1 Python 流式处理示例](#51-python-流式处理示例)
   - [5.2 Java (OkHttp SSE) 示例](#52-java-okhttp-sse-流式调用示例)
   - [5.3 cURL 命令行流式调用示例](#53-curl-命令行流式调用示例)
6. [全局状态码与错误排查 (Status Codes & Troubleshooting)](#6-全局状态码与错误排查-status-codes--troubleshooting)

---

## 1. 服务地址与认证鉴权 (Base URL & Authentication)

所有 API 请求均通过网关统一接入：

```http
http://188.107.223.24:3001
```

### 🔐 认证方式 (Authentication)

网关已对 EOMS 系统实施严格的 **API Key 白名单隔离认证机制**。EOMS 系统的所有请求均须在 HTTP 请求头（Header）中携带分配给本系统的专用密钥。系统支持以下两种 Header 形式（任选其一即可）：

* **方式一（推荐）：自定义 Key Header**
  * **Header 名称**：`X-API-KEY`
  * **Header 数值**：`<EOMS_API_KEY>`（例如：`wren_sk_eoms_xxxxxxxxxxxxxxxxxxxxxxxx`）

* **方式二：标准 Bearer Header**
  * **Header 名称**：`Authorization`
  * **Header 数值**：`Bearer <EOMS_API_KEY>`（例如：`Bearer wren_sk_eoms_xxxxxxxxxxxxxxxxxxxxxxxx`）

> ⚠️ **权限隔离说明**：
> 1. 元数据只读端点（`/api/v1/metadata/*`）仅对 EOMS 系统的专属 Key 开放；未携带 Key 或使用其他非授权 Key 请求将直接返回 `403 Forbidden`。
> 2. 原生的 `/api/graphql` 端点已被网关全局封禁，所有元数据操作均须通过本文档定义的标准化端点访问。

### 🚦 访问控制与限流规范 (Rate Limiting)

* **请求限流 (Rate Limit)**：单 IP 每秒限制最多 **15 个请求 (15 r/s)**，突发请求缓冲区（Burst）为 **25 个请求**。
* **流式传输长连接**：流式接口（SSE）已配置禁用代理缓冲（`proxy_buffering off`）与长连接支持，连接和后端代理超时均设定为 **300 秒（5 分钟）**。
* **字符集与格式**：数据交互格式统一为 `application/json`，流式响应协议为 `text/event-stream`。

---

## 2. 接口概览 (Endpoints Overview)

| 分类 | 请求方法 | 接口路径 | 描述说明 |
| :--- | :--- | :--- | :--- |
| **元数据只读** | `POST` | `/api/v1/metadata/tables` | 获取数据源中所有可用的物理表名清单（强制走缓存，不打扰底层库） |
| **元数据只读** | `POST` | `/api/v1/metadata/tables/{tableName}` | 获取指定物理表的字段列表（列名、数据类型等） |
| **元数据只读** | `POST` | `/api/v1/metadata/table?name={tableName}` | （兼容形式）通过 Query 参数获取指定数据表的字段列表 |
| **智能流式问答** | `POST` | `/api/v1/stream/ask` | 输入自然语言问题，通过 **SSE 流式实时推送** 推理阶段、生成的 SQL、执行进度及打字机结果总结 |
| **SQL 生成** | `POST` | `/api/v1/generate_sql` | 将自然语言问题转化为经过语义校验的 SQL 查询语句（非流式） |
| **SQL 执行** | `POST` | `/api/v1/run_sql` | 在受控数据源上执行指定的 SQL 并返回结构化二维数据（非流式） |

---

## 3. 元数据只读接口 (Metadata Endpoints - EOMS 专属)

### 3.1 获取全部数据源表清单 (ListDataSourceTables)

* **接口路径**：`POST /api/v1/metadata/tables`
* **接口说明**：
  * 获取数据源中已经抓取到的所有物理表名称。
  * **设计保障**：网关层强行锁定 `refresh: false`。查询将直接从本地元数据缓存中读取，毫秒级响应，**绝不穿透并频繁扫描底层数据库的系统字典表**。

#### 请求头 (Request Headers)

| Header 名称 | 必填 | 示例值 | 描述 |
| :--- | :--- | :--- | :--- |
| `Content-Type` | 是 | `application/json` | 数据交互格式 |
| `X-API-KEY` | 是 | `wren_sk_eoms_xxxxxxxxxxxxxxxxxxxxxxxx` | EOMS 专属密钥 |

#### 请求体 (Request Body)

传空 JSON 对象即可：
```json
{}
```

#### 响应参数说明 (Response Parameters)

| 字段路径 | 类型 | 描述说明 |
| :--- | :--- | :--- |
| `data.listDataSourceTables` | `Array<Object>` | 数据源表对象列表 |
| `data.listDataSourceTables[].name` | `string` | 数据表名称（用于后续查询指定表的字段） |

#### 响应示例 (Response Example)

```json
{
  "data": {
    "listDataSourceTables": [
      {
        "name": "res_device_info"
      },
      {
        "name": "res_port_info"
      },
      {
        "name": "res_circuit_route"
      },
      {
        "name": "alarm_event_list"
      }
    ]
  }
}
```

---

### 3.2 获取指定数据表的字段详情 (DataSourceTable)

* **接口路径**：`POST /api/v1/metadata/tables/{tableName}`
  * *(亦支持 Query 参数形式：`POST /api/v1/metadata/table?name={tableName}`)*
* **接口说明**：
  * 传入指定数据表的表名，获取该表全部字段的物理列名（name）、字段类型（type）及扩展属性。
  * **安全保障**：表名在网关层经过正则防注入过滤，只允许 `[a-zA-Z0-9_\-\.]` 安全字符；且完全禁止任何写入/修改（Mutation）操作。

#### 路径参数说明 (Path Parameters)

| 参数名 | 类型 | 必填 | 示例值 | 描述说明 |
| :--- | :--- | :--- | :--- | :--- |
| `tableName` | `string` | 是 | `res_device_info` | 目标数据表名称（来自 3.1 接口返回的 `name`） |

#### 请求头 (Request Headers)

| Header 名称 | 必填 | 示例值 | 描述 |
| :--- | :--- | :--- | :--- |
| `Content-Type` | 是 | `application/json` | 数据交互格式 |
| `X-API-KEY` | 是 | `wren_sk_eoms_xxxxxxxxxxxxxxxxxxxxxxxx` | EOMS 专属密钥 |

#### 请求示例 (Request Example)

* 请求 URL：`http://188.107.223.24:3001/api/v1/metadata/tables/res_device_info`
* 请求体：`{}`

#### 响应示例 (Response Example)

```json
{
  "data": {
    "dataSourceTable": {
      "name": "res_device_info",
      "columns": [
        {
          "name": "extensionid",
          "type": "varchar",
          "properties": {}
        },
        {
          "name": "coverage",
          "type": "varchar",
          "properties": {}
        },
        {
          "name": "ipaddress",
          "type": "varchar",
          "properties": {}
        },
        {
          "name": "maintenanceowner",
          "type": "varchar",
          "properties": {}
        },
        {
          "name": "contactphone",
          "type": "varchar",
          "properties": {}
        },
        {
          "name": "created_at",
          "type": "timestamp",
          "properties": {}
        }
      ]
    }
  }
}
```

---

## 4. 智能流式问答与 SQL 查询接口 (Text-to-SQL Endpoints)

### 4.1 智能流式问答一站式接口 (/api/v1/stream/ask)

* **接口路径**：`POST /api/v1/stream/ask`
* **协议类型**：**Server-Sent Events (SSE)** 流式传输
* **功能描述**：
  * 用户提交自然语言提问后，服务端通过持久连接实时向客户端推送处理进度事件（意图理解 -> 表检索 -> SQL 生成 -> SQL 执行 -> 打字机总结推流）。
  * 具备极佳的实时交互性，免去客户端长轮询等待。

#### 请求头 (Request Headers)

| Header 名称 | 必填 | 示例值 | 描述说明 |
| :--- | :--- | :--- | :--- |
| `Content-Type` | 是 | `application/json` | 提交请求体格式 |
| `Accept` | 是 | `text/event-stream` | 声明客户端接收 SSE 流式事件 |
| `X-API-KEY` | 是 | `wren_sk_eoms_xxxxxxxxxxxxxxxxxxxxxxxx` | EOMS 专属密钥 |

#### 请求参数 (Request Parameters)

| 参数名 | 类型 | 必填 | 描述说明 |
| :--- | :--- | :--- | :--- |
| `question` | `string` | 是 | 用户的自然语言提问文本（如："统计各维护单位的设备总数"） |
| `tables` | `string[]` | 否 | 限制参与问答与 SQL 生成的表名列表。若不传则全库自动检索 |
| `threadId` | `string` | 否 | 上下文会话 ID（UUID），用于多轮上下文追问 |
| `sampleSize` | `number` | 否 | 生成数据总结时的最大采样行数，默认为 `500` |
| `language` | `string` | 否 | 指定 AI 回答与总结的语言，默认为 `"Chinese"` |

#### 请求示例 (Request Example)

```json
{
  "question": "统计各维护单位的设备总数，并按设备数降序排列",
  "language": "Chinese"
}
```

---

#### 🌊 SSE 事件流协议与事件类型说明 (Event Stream Protocol)

客户端接收到的响应格式为标准的 SSE 数据块：
```http
event: <事件名称>
data: <JSON格式的载荷>

```

在单次问答中，服务端会依次推送以下几类关键事件：

| 事件类型 (`event`) | 说明与触发时机 | 载荷核心字段 (`data`) |
| :--- | :--- | :--- |
| `message_start` | 流建立开始 | `{"type": "message_start", "timestamp": 1751014954139}` |
| `state` | **系统状态阶段流转**<br>通知前端当前系统所处的执行阶段 | `{"state": "...", "sql": "..."}`<br>常见阶段值见下表 |
| `content_block_start` | 内容生成块开启 | `{"type": "content_block_start", "content_type": "summary_generation"}` |
| `content_block_delta` | **打字机增量内容**<br>AI 总结结果的逐字逐句流式推送 | `{"type": "content_block_delta", "delta": "根据统计，"}` |
| `content_block_stop` | 内容生成块结束 | `{"type": "content_block_stop"}` |
| `message_end` | 整条会话流完成 | `{"type": "message_end", "threadId": "...", "duration": 3450}` |
| `error` | 处理过程中发生错误 | `{"code": "...", "message": "..."}` |

##### 附：`state` 状态流转生命周期

1. `sql_generation_start`：开始分析问题；
2. `sql_generation_understanding`：正在理解提问意图与实体；
3. `sql_generation_searching`：正在检索相关的数据表与列；
4. `sql_generation_generating`：大模型正在编写 SQL；
5. `sql_generation_success`：**SQL 生成成功**，此时 `data` 中会携带完整的 `sql` 字段；
6. `sql_execution_start`：开始在数据库中执行该 SQL；
7. `sql_execution_end`：SQL 执行完毕，开始启动数据结果归纳；

---

#### 完整 SSE 报文传输示例 (Raw SSE Output Example)

```http
event: message_start
data: {"type":"message_start","timestamp":1751014954139}

event: state
data: {"state":"sql_generation_start","question":"统计各维护单位的设备总数"}

event: state
data: {"state":"sql_generation_understanding"}

event: state
data: {"state":"sql_generation_generating"}

event: state
data: {"state":"sql_generation_success","sql":"SELECT maintenanceunit, COUNT(*) AS device_count FROM res_device_info GROUP BY maintenanceunit ORDER BY device_count DESC"}

event: state
data: {"state":"sql_execution_start"}

event: state
data: {"state":"sql_execution_end"}

event: content_block_start
data: {"type":"content_block_start","content_type":"summary_generation"}

event: content_block_delta
data: {"type":"content_block_delta","delta":"根据"}

event: content_block_delta
data: {"type":"content_block_delta","delta":"最新统计，"}

event: content_block_delta
data: {"type":"content_block_delta","delta":"第一维护中心设备数量最多，共有 1,280 台。"}

event: content_block_stop
data: {"type":"content_block_stop"}

event: message_end
data: {"type":"message_end","threadId":"e9b7a123-4567-89ab-cdef-0123456789ab","duration":2890}
```

---

### 4.2 自然语言生成 SQL (/api/v1/generate_sql)

* **接口路径**：`POST /api/v1/generate_sql`
* **功能描述**：非流式接口。仅将自然语言转化为 SQL 语句，**不执行该 SQL**。适合在 EOMS 侧进行 SQL 安全审核或使用 EOMS 自有连接池执行的场景。

#### 请求示例 (Request Example)

```json
{
  "question": "查询IP为10.20.30.40的设备维护责任人和联系电话"
}
```

#### 响应示例 (Response Example)

```json
{
  "id": "c1a2b3c4-d5e6-7890-1234-56789abcdef0",
  "sql": "SELECT maintenanceowner, contactphone FROM res_device_info WHERE ipaddress = '10.20.30.40' LIMIT 1"
}
```

---

### 4.3 SQL 执行与数据获取 (/api/v1/run_sql)

* **接口路径**：`POST /api/v1/run_sql`
* **功能描述**：非流式接口。传入一条标准 SQL 语句，由平台在数据源上执行并以二维数组返回数据结果。

#### 请求示例 (Request Example)

```json
{
  "sql": "SELECT extensionid, ipaddress FROM res_device_info LIMIT 2"
}
```

#### 响应示例 (Response Example)

```json
{
  "columns": ["extensionid", "ipaddress"],
  "data": [
    ["DEV_0001", "10.20.30.1"],
    ["DEV_0002", "10.20.30.2"]
  ]
}
```

---

## 5. 多语言流式调用示例 (Code Examples)

### 5.1 Python 流式处理示例

在 Python 中使用 `requests` 启用 `stream=True` 处理流式响应，实现打字机效果输出：

```python
import json
import requests

BASE_URL = "http://188.107.223.24:3001"
API_KEY = "wren_sk_eoms_xxxxxxxxxxxxxxxxxxxxxxxx"

headers = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
    "X-API-KEY": API_KEY
}

def stream_ask(question: str):
    url = f"{BASE_URL}/api/v1/stream/ask"
    payload = {
        "question": question,
        "language": "Chinese"
    }

    print(f"\n💬 提问: {question}\n" + "=" * 50)
    
    # 启用流式长连接 stream=True
    response = requests.post(url, headers=headers, json=payload, stream=True, timeout=300)
    response.raise_for_status()

    current_event = None

    for line in response.iter_lines(decode_unicode=True):
        if not line:
            continue
        
        # 解析 SSE 事件类型
        if line.startswith("event: "):
            current_event = line[len("event: "):].strip()
        elif line.startswith("data: "):
            data_str = line[len("data: "):].strip()
            try:
                data = json.loads(data_str)
            except json.JSONDecodeError:
                continue

            # 处理各阶段事件
            if current_event == "state":
                state = data.get("state")
                if state == "sql_generation_success":
                    print(f"\n[AI 生成的 SQL]:\n{data.get('sql')}\n")
                    print("[AI 正在总结分析数据...]: ", end="", flush=True)
                elif state == "sql_execution_start":
                    print("⚙️ 正在执行 SQL 查询...")

            elif current_event == "content_block_delta":
                # 打字机输出文字增量
                delta_text = data.get("delta", "")
                print(delta_text, end="", flush=True)

            elif current_event == "message_end":
                duration = data.get("duration", 0)
                print(f"\n\n✅ 问答完成 (耗时: {duration}ms, 会话ID: {data.get('threadId')})")

if __name__ == "__main__":
    stream_ask("统计各维护单位的设备总数，并按降序排列")
```

---

### 5.2 Java (OkHttp SSE) 流式调用示例

在 Java 业务系统中，推荐使用 `okhttp3` 的 `EventSource` 监听器：

```java
import okhttp3.*;
import okhttp3.sse.*;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.util.concurrent.TimeUnit;

public class EomsStreamClient {
    private static final String BASE_URL = "http://188.107.223.24:3001";
    private static final String API_KEY = "wren_sk_eoms_xxxxxxxxxxxxxxxxxxxxxxxx";

    public static void main(String[] args) {
        OkHttpClient client = new OkHttpClient.Builder()
                .readTimeout(300, TimeUnit.SECONDS)
                .build();

        Request request = new Request.Builder()
                .url(BASE_URL + "/api/v1/stream/ask")
                .addHeader("X-API-KEY", API_KEY)
                .addHeader("Accept", "text/event-stream")
                .post(RequestBody.create(
                        "{\"question\": \"统计各维护单位的设备总数\", \"language\": \"Chinese\"}",
                        MediaType.parse("application/json")
                ))
                .build();

        EventSource.Factory factory = EventSources.createFactory(client);
        factory.newEventSource(request, new EventSourceListener() {
            @Override
            public void onOpen(EventSource eventSource, Response response) {
                System.out.println("🔗 SSE 连接已建立...");
            }

            @Override
            public void onEvent(EventSource eventSource, String id, String type, String data) {
                JsonObject json = JsonParser.parseString(data).getAsJsonObject();

                if ("state".equals(type)) {
                    String state = json.get("state").getAsString();
                    if ("sql_generation_success".equals(state)) {
                        System.out.println("\n[生成的 SQL]: " + json.get("sql").getAsString());
                    }
                } else if ("content_block_delta".equals(type)) {
                    // 打字机文本流式输出
                    System.out.print(json.get("delta").getAsString());
                } else if ("message_end".equals(type)) {
                    System.out.println("\n\n✅ 问答完成！");
                }
            }

            @Override
            public void onFailure(EventSource eventSource, Throwable t, Response response) {
                System.err.println("❌ 传输异常: " + (t != null ? t.getMessage() : "HTTP " + response.code()));
            }
        });
    }
}
```

---

### 5.3 cURL 命令行流式调用示例

在终端测试时，请添加 `-N` 参数（禁用缓存以即时刷新流）：

```bash
curl -N -X POST "http://188.107.223.24:3001/api/v1/stream/ask" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -H "X-API-KEY: wren_sk_eoms_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{"question": "统计各维护单位的设备总数", "language": "Chinese"}'
```

---

## 6. 全局状态码与错误排查 (Status Codes & Troubleshooting)

| HTTP 状态码 | 含义说明 | 常见原因与解决排查 |
| :--- | :--- | :--- |
| `200 OK` | 请求成功 | 正常建立连接与返回业务数据（流式接口将建立 SSE 通道）。 |
| `400 Bad Request` | 请求参数有误 | 1. 检查 JSON 语法是否合法；<br>2. `question` 字段不能为空。 |
| `401 Unauthorized` | 身份未认证 | 请求头中缺少 `X-API-KEY` 或 `Authorization`，请确认已携带有效 Header。 |
| `403 Forbidden` | 访问被拒绝 / 权限不足 | **最常见原因**：<br>1. 访问元数据端点时传入了非 EOMS 专用的 API Key（非白名单）；<br>2. 试图直接访问被封禁的 `/api/graphql` 原始端点；<br>3. 访问了未开放的非 API 路径。 |
| `405 Method Not Allowed` | 请求方法不支持 | 接口只支持 `POST` 方法，若误用 `GET`、`PUT` 等将返回 405。 |
| `429 Too Many Requests` | 触发频率限制 | 请求超出单 IP 15 次/秒 的频率阈值。请优化 EOMS 侧调用并发。 |
| `500 Internal Server Error` | 服务端内部异常 | 后端推理或数据源连接异常，请联系平台管理员排查后台日志。 |
