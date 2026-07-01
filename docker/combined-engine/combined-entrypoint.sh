#!/bin/bash
set -e

# ============================================================
# Combined Entrypoint: Bootstrap + Engine
# 先运行 bootstrap 初始化，再启动 wren-engine
# ============================================================

echo "=== [Combined Entrypoint] Starting ==="

# Step 1: 运行 bootstrap 初始化
echo "=== [Step 1] Running bootstrap initialization ==="
/bin/sh /usr/src/app/init.sh

# Step 2: 启动 wren-engine (原 entrypoint.sh 逻辑)
export ENV_MAX_HEAP_SIZE=$2
export ENV_MIN_HEAP_SIZE=$3

echo "=== [Step 2] Starting wren-engine ==="
echo "  JAR: $1"
echo "  Max Heap: ${ENV_MAX_HEAP_SIZE:-512m}"
echo "  Min Heap: ${ENV_MIN_HEAP_SIZE:-64m}"
echo "  Config: etc/config.properties"

# 使用 exec 替换当前 shell 进程，确保信号正确传递
exec java -Xmx${ENV_MAX_HEAP_SIZE:-"512m"} -Xms${ENV_MIN_HEAP_SIZE:-"64m"} -Dconfig=etc/config.properties \
     --add-opens=java.base/java.nio=ALL-UNNAMED \
     -jar $1
