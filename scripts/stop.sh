#!/bin/bash

# FindsIndex Clone 停止脚本
# 用法：./scripts/stop.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$PROJECT_DIR/.next.pid"
PORT=3000

echo "🛑 停止服务..."

# 读取 PID 文件
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "   停止进程 (PID: $OLD_PID)..."
        kill -9 "$OLD_PID" 2>/dev/null
        sleep 2
    fi
    rm -f "$PID_FILE"
    echo "✅ 服务已停止"
else
    echo "⚠️  未找到 PID 文件，尝试自动查找..."
    NEXT_PIDS=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}')
    if [ -n "$NEXT_PIDS" ]; then
        for pid in $NEXT_PIDS; do
            echo "   停止进程 $pid..."
            kill -9 "$pid" 2>/dev/null
        done
        echo "✅ 服务已停止"
    else
        echo "ℹ️  未发现运行中的服务"
    fi
fi

# 清理端口
PORT_PID=$(lsof -ti:$PORT 2>/dev/null)
if [ -n "$PORT_PID" ]; then
    echo "   清理端口 $PORT..."
    kill -9 "$PORT_PID" 2>/dev/null
    sleep 1
fi

echo ""
echo "✅ 完成"
