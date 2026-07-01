# 合并 wren-bootstrap 和 wren-engine 的镜像
# 基于 wren-engine 镜像，将 bootstrap 的初始化逻辑内嵌到启动流程中
FROM ghcr.io/canner/wren-engine:0.22.0

WORKDIR /usr/src/app

# 复制脚本文件
COPY init.sh /usr/src/app/init.sh
COPY combined-entrypoint.sh /usr/src/app/combined-entrypoint.sh

# 修复 Windows CRLF 换行符 + 设置可执行权限
RUN sed -i 's/\r$//' /usr/src/app/init.sh /usr/src/app/combined-entrypoint.sh && \
    chmod +x /usr/src/app/combined-entrypoint.sh /usr/src/app/init.sh

EXPOSE 8080 7432

CMD ["/usr/src/app/combined-entrypoint.sh", "wren-server-0.21.4-SNAPSHOT-executable.jar"]
