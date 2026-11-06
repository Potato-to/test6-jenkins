# 静态文件发布（默认）

Jenkins 构建节点安装 Node.js 24.16.0（24.x）和 pnpm 12.16.1，以及 Git、Bash、tar、SSH 客户端。流水线执行冻结安装和 `pnpm build`，审批通过后上传 `dist`。服务器不需要 Docker、Node.js 或 pnpm。

## 服务器准备

Ubuntu 可安装 `sudo apt-get install nginx openssh-server`，并确认存在 Bash、tar、flock、realpath、find、sort。管理员创建专用目录，例如：

```bash
sudo mkdir -p /srv/test6
sudo chown admin1:admin1 /srv/test6
sudo chmod 755 /srv/test6
```

将 admin1 替换为实际 SSH 部署账号，确认所有父目录允许 Nginx 用户穿过。参考 `nginx.conf.example`，将站点根目录配置为 `/srv/test6/current`；管理员执行 `sudo nginx -t` 后加载配置，并按实际端口开放防火墙。流水线不修改系统 Nginx 配置，不需要 sudo。

## Jenkins 普通 Pipeline

选择 Pipeline script from SCM → Git，指定仓库、分支（例如 `*/main`）和 `Jenkinsfile`。首次构建创建参数后停止，在任务配置中保存默认值，再使用参数构建。已有参数不会自动补齐，请升级时手动核对。每次构建输入只影响当次。

准备 SSH Username with private key 凭据和经核验的 known_hosts 文件凭据；按参数填写其 ID。当前系统 ssh 直接使用密钥文件，请使用专用无口令密钥，或另行配置 SSH Agent 解锁加密私钥。服务器公钥放入部署用户的 authorized_keys。非 22 端口的 known_hosts 使用 `[host]:port`。

`DEPLOY_HOST`、`SSH_PORT`、`DEPLOY_DIR` 是服务器连接信息；`PROJECT_NAME` 为项目标识，`IMAGE_TAG` 沿用版本参数名称（静态方式也是版本号），留空使用 build-构建编号。HTTP 端口由服务器 Nginx 管理。

VITE*API_BASE_URL 可留空或不配置；同源模式需要按实际路径设置 API 和上传代理，也可由前端代码自行指定地址。VITE_API_PREFIX 未配置默认 /api，显式空值不加前缀。VITE*\* 都是 Jenkins 构建参数，改动后重新打包。

`main`、`release/*` 在打包后等待审批（最多 30 分钟）；`develop`、`test` 自动发布；其他分支只校验。master 项目需修改两处发布分支条件。需要限制审批人时在 input 中配置 submitter 为实际用户 ID 或组；管理员仍可审批。构建与配置权限由 Jenkins 管理。

## 发布与回滚

脚本锁定项目目录，将产物解压至 `releases/版本号`，检查 index.html 后原子切换 current 链接，并保存 previous。解压失败不会切换在线版本；发布版本号不能重复。部署成功后保留最多 5 份受管理版本，始终保护 current 和 previous；未标记目录和符号链接不清理。失败上传可能留下临时目录，应确认无运行任务后按需清理。

```bash
bash deploy/deploy.sh status /srv/test6
bash deploy/deploy.sh rollback /srv/test6
bash deploy/deploy.sh rollback /srv/test6 build-123
```

手动发布：`bash deploy/deploy.sh deploy /srv/test6 build-124 /path/site.tar.gz`，压缩包根目录应直接包含 index.html。回滚脚本需预先保存在运维目录，或使用仓库检出副本。切换链接无需重载 Nginx；正在访问旧页面的客户端仍可能请求旧资源，发布窗口内应检查页面和接口，不承诺旧客户端永不中断。

由原 Docker 模式迁移时，不要直接复用其 releases 目录；先选择新目录和空闲 Nginx 端口验证，确认新站点可用后再切换入口，最后停用旧容器。
