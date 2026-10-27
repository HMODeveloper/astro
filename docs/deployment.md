# 服务器部署

线上站点由后端服务统一对外提供, 静态页面与接口均在同一个容器内运行.

## 1. 获取版本

镜像在每次推送版本 tag 时自动构建, 发布记录见 GitHub Releases 页面:

https://github.com/HMODeveloper/astro/releases

镜像地址为 ghcr.io/hmodeveloper/astro, 标签包括:

- latest: 最新一次构建
- 版本号: 与 Release 对应, 形如 v20261027-1
- sha-提交号: 指定提交的构建

生产环境建议使用版本号标签, 便于定位问题与回滚.

## 2. 拉取镜像

```bash
docker pull ghcr.io/hmodeveloper/astro:latest
```

## 3. 启动容器

```bash
docker run -d --name hmo-astro -p 3000:3000 --restart unless-stopped ghcr.io/hmodeveloper/astro:latest
```

容器内后端监听 3000 端口, 静态产物位于 /app/dist 目录, 对外提供服务需自行配置反向代理, 站点域名为 hmomc.cn.

## 4. 更新内容

内容更新后, 仓库会推送新的版本 tag, 触发持续集成重新构建镜像. 更新线上内容只需拉取新镜像并重建容器.

查看可用版本:

```bash
docker pull ghcr.io/hmodeveloper/astro:latest
```

停止并删除旧容器:

```bash
docker rm -f hmo-astro
```

使用新镜像重新启动:

```bash
docker run -d --name hmo-astro -p 3000:3000 --restart unless-stopped ghcr.io/hmodeveloper/astro:latest
```

若使用固定版本标签, 把上述命令中的 latest 替换为目标版本号即可.

## 5. 验证状态

查看容器运行状态:

```bash
docker ps
```

检查后端健康检查接口:

```bash
curl http://127.0.0.1:3000/api
```

接口返回 ok 字段即表示服务正常.
