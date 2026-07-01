import yaml

# 模拟 ConfigMap 中 config.yaml 的实际内容
config_content = """type: llm
provider: litellm_llm
timeout: 120
models:
  - alias: default
    model: openai/deepseekv3.1-w8a8
    api_base: http://188.103.147.179:30175/gateway/api/XKpb9p/v1
    api_key: no-key
    timeout: 600
    kwargs:
      n: 1
      temperature: 0
      extra_headers:
        Authorization-Gateway: sk-200a7d17-affc-410c-bd2f-99ecaa9fd187
      response_format:
        type: json_object
---
type: embedder
provider: litellm_embedder
models:
  - model: openai/Qwen3-Embedding-8B
    alias: default
    api_base: http://188.103.147.179:30175/gateway/api/nvG1iv/v1
    api_key_name: WREN_EMBEDDING_API_KEY
    timeout: 600
---
type: engine
provider: wren_ui
endpoint: http://wren-ui:3000
---
type: engine
provider: wren_ibis
endpoint: http://wren-ibis:8000
---
type: document_store
provider: qdrant
location: http://qdrant:6333
embedding_model_dim: 4096
timeout: 120
recreate_index: true
---
type: pipeline
pipes:
  - name: db_schema_indexing
    embedder: litellm_embedder.default
    document_store: qdrant
---
settings:
  doc_endpoint: https://docs.getwren.ai
  is_oss: true
"""

docs = list(yaml.load_all(config_content, Loader=yaml.SafeLoader))
print(f"Total documents: {len(docs)}")
for i, doc in enumerate(docs):
    print(f"\n--- Document {i} ---")
    print(f"  Type: {type(doc).__name__}")
    if doc is None:
        print(f"  Value: None  <-- THIS WOULD CAUSE KeyError!")
    elif isinstance(doc, dict):
        print(f"  Keys: {list(doc.keys())}")
        if 'type' in doc:
            print(f"  type = {doc['type']}")
        elif 'settings' in doc:
            print(f"  [settings section - will be filtered]")
        else:
            print(f"  NO 'type' KEY! <-- THIS WOULD CAUSE KeyError!")
    else:
        print(f"  Unexpected value: {doc}")

# 模拟 filtering
components = [c for c in docs if c is not None and "settings" not in c]
print(f"\n\nFiltered components: {len(components)}")
for i, c in enumerate(components):
    print(f"  Component {i}: type={c.get('type', 'MISSING!')}")
