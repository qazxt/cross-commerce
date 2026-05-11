#!/bin/bash

# FindsIndex Clone 重启脚本
# 用法：./scripts/restart.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔄 重启服务..."
echo ""

# 停止
"$SCRIPT_DIR/stop.sh"

echo ""
sleep 2

# 启动
"$SCRIPT_DIR/start.sh"
