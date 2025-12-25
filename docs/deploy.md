手动部署步骤
1. 上传到服务器（在你本地终端执行，或用 FTP 工具）：

bash
scp ~/simpleflow-web.tar root@195.138.131.6:/root/
2. 在 Ubuntu 服务器上执行：

bash
# 加载镜像
docker load -i /root/simpleflow-web.tar
# 运行容器
docker run -d -p 3000:3000 --name simpleflow-web --restart unless-stopped simpleflow-web:latest
3. 验证运行状态：

bash
docker ps
curl http://localhost:3000
如果你能直接登录服务器终端，可以把上面的命令复制过去执行。