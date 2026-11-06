# **PROJECT_NAME**

Vben 5.8.0 · **UI_LABEL** · UnoCSS。业务来源于用户提供的 vben-develop-frame，具体迁移映射见 MIGRATION.md。统一使用 Node.js 24 LTS（24.16.0 起，24.x）与 pnpm 12.16.1；.nvmrc、.node-version 和 Docker 固定 Node.js 24.16.0。可执行 `npm install -g pnpm@12.16.1` 准备包管理器，安装时会检查版本。

```sh
pnpm install
pnpm dev
pnpm check
pnpm build
```

开发环境默认演示登录，填写任意非空用户名与密码，业务数据保存在浏览器本地，不保存密码。生产构建始终使用真实接口，即使本地设置 VITE_DEMO_MODE=true 也不会启用演示登录。
复制 .env.example 为 .env.local，设置 VITE_DEMO_MODE=false 后联调真实接口。默认通过 VITE_API_BASE_URL 直接访问后端，开发默认 http://127.0.0.1:8081；后端需允许跨域，上传路径默认 /files/upload。开发代理默认注释，需要时启用 vite.config.ts 中的代理示例并清空基础地址。修改配置后重启开发服务器。

DEV\_ 变量只供开发服务器使用。生产构建支持将 `VITE_API_BASE_URL` 留空，通过同源 Nginx/网关代理访问后端；也可填写后端 origin 直接调用，跨域时后端需要允许前端域名跨域。容器 Nginx `/api` 和上传代理默认注释，使用同源模式时需配置容器或外层代理。登录接口返回 accessToken，当前用户接口返回权限与菜单。Token 在内存中，刷新重新登录。可通过 AuthAdapter 替换实际认证方式。

业务公共前缀由 `VITE_API_PREFIX` 控制，默认 `/api`；没有前缀时显式设置 `VITE_API_PREFIX=`，也可设为 `/v1`。业务请求使用 `apiRequest`，地址为基础地址 + 公共前缀 + 接口路径；上传及通用 `request` 不附加业务前缀，上传默认 `/files/upload`。接口路径差异仍需在 src/api 或业务 schema 中按后端契约调整。

src/modules/system 定义共用业务字段与仓库，src/ui.ts 和 src/admin-components.ts 是所选组件库适配；其他 UI 不进入项目。src/api 保留原模板 API 函数与 DTO。

业务样式在 uno.config.ts 配置。Vben 内部组件仍需官方 Tailwind 编译，限定扫描 packages，不对上游组件机械替换。两者不需要创建时选择。

数字 code === 200 为成功；message 优先，兼容 msg。直接 request 保留完整响应，迁移的 API 函数返回 data。请求失败只抛错，catch 消化不弹提示、不主动打印；逃逸到全局才使用 Message 并调用 console.error，包含分类和可用堆栈。silent 只打印，取消不打印不提示，同一错误实例只主动打印一次。默认错误日志记录本次运行中的全部脱敏信息，不限制条数，刷新后清空，不上传。

路由为 History 模式，生产服务器需回退 index.html；容器内配置见 deploy/default.conf.template，外层 Nginx、宝塔或网关接入说明见 deploy/README.md。packages/internal 是固定 Vben 上游源码，升级需审查和验证。不要直接批量格式化这些目录。

项目按创建时选择生成静态文件或 Docker 镜像部署配置；默认静态发布，由 Jenkins 构建后上传至服务器 Nginx。Docker 方式由 Jenkins 构建并导出镜像，经 SSH 上传后服务器导入并启动，无需镜像仓库。完整配置、权限和回滚见 [部署说明](deploy/README.md)。两种生产构建均使用真实接口模式。
