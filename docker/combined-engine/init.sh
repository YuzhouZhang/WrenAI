#!/bin/sh
set -e

# ============================================================
# Bootstrap 初始化逻辑 (原 wren-bootstrap init.sh)
# 此部分在引擎启动前执行，确保所需配置文件和目录存在
# ============================================================

# DATA_PATH 对应 config.properties / mdl 所在的目录
data_path=${DATA_PATH:-"/usr/src/app/etc"}

# 确保数据目录存在
mkdir -p ${data_path}

echo "[Bootstrap] DATA_PATH=${data_path}"

# 创建 config.properties（如不存在）
if [ ! -f ${data_path}/config.properties ]; then
  echo "[Bootstrap] Creating config.properties"
  echo "node.environment=production" > ${data_path}/config.properties
else
  echo "[Bootstrap] config.properties already exists"
fi

# 检查 wren.experimental-enable-dynamic-fields 配置项
if ! grep -q "wren.experimental-enable-dynamic-fields" ${data_path}/config.properties; then
  echo "[Bootstrap] Setting wren.experimental-enable-dynamic-fields=true"
  echo "wren.experimental-enable-dynamic-fields=true" >> ${data_path}/config.properties
fi

# 创建 mdl 目录（如不存在）
if [ ! -d ${data_path}/mdl ]; then
  echo "[Bootstrap] Creating mdl folder"
  mkdir -p ${data_path}/mdl
else
  echo "[Bootstrap] mdl folder already exists"
fi

# 创建 sample.json（如不存在）
if [ ! -f ${data_path}/mdl/sample.json ]; then
  echo "[Bootstrap] Creating mdl/sample.json"
  echo "{\"catalog\": \"test_catalog\", \"schema\": \"test_schema\", \"models\": []}" > ${data_path}/mdl/sample.json
else
  echo "[Bootstrap] mdl/sample.json already exists"
fi

echo "[Bootstrap] config.properties content:"
cat ${data_path}/config.properties

echo "[Bootstrap] Initialization completed successfully"
