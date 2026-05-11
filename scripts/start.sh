#!/bin/bash

# FindsIndex Clone 启动脚本
# 用法：./scripts/start.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$PROJECT_DIR/.next.pid"
PORT=3000

echo "🚀 FindsIndex Clone 启动脚本"
echo "=============================="

# 函数：清理旧进程
cleanup() {
    echo "📋 清理旧进程..."
    
    # 读取 PID 文件
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if ps -p "$OLD_PID" > /dev/null 2>&1; then
            echo "   停止旧进程 (PID: $OLD_PID)..."
            kill -9 "$OLD_PID" 2>/dev/null
            sleep 2
        fi
        rm -f "$PID_FILE"
    fi
    
    # 清理所有 next dev 进程
    echo "   查找并清理 next dev 进程..."
    NEXT_PIDS=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}')
    if [ -n "$NEXT_PIDS" ]; then
        for pid in $NEXT_PIDS; do
            echo "   停止进程 $pid..."
            kill -9 "$pid" 2>/dev/null
        done
        sleep 2
    fi
    
    # 清理端口
    echo "   清理端口 $PORT..."
    # 使用 fuser 或 netstat 查找端口占用
    PORT_PID=$(fuser -k $PORT/tcp 2>/dev/null || true)
    if [ -z "$PORT_PID" ]; then
        # 备用方法：通过 ss 查找
        PORT_PID=$(ss -tlnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1)
        if [ -n "$PORT_PID" ]; then
            kill -9 "$PORT_PID" 2>/dev/null
        fi
    fi
    sleep 2
    
    echo "✅ 清理完成"
}

# 函数：启动服务
start_server() {
    echo ""
    echo "🌐 启动服务器..."
    echo "   端口：$PORT"
    echo "   目录：$PROJECT_DIR"
    echo ""
    
    cd "$PROJECT_DIR"
    
    # 启动 Next.js（后台运行，监听所有接口）
    PORT=$PORT HOSTNAME=0.0.0.0 npm run dev > "$PROJECT_DIR/.next.log" 2>&1 &
    NEW_PID=$!
    
    # 保存 PID
    echo "$NEW_PID" > "$PID_FILE"
    
    echo "✅ 服务器已启动 (PID: $NEW_PID)"
    echo ""
    echo "📄 日志文件：$PROJECT_DIR/.next.log"
    echo ""
    echo "🌐 访问地址：http://localhost:$PORT"
    echo "🌐 访问地址：http://localhost:$PORT/zh"
    echo ""
    echo "=============================="
    echo "💡 提示："
    echo "   - 查看日志：tail -f $PROJECT_DIR/.next.log"
    echo "   - 停止服务：$SCRIPT_DIR/stop.sh"
    echo "   - 重启服务：$SCRIPT_DIR/restart.sh"
}

# 主流程
cleanup
start_server
