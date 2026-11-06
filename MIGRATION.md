# 本地模板迁移说明

来源：用户提供的 vben-develop-frame（package.json 版本 2.11.5）。保留 API 函数和 DTO，接口公共前缀通过 VITE_API_PREFIX 配置（默认 /api，可留空），运行基础升级到 Vben 5.8.0。不是原 v2 文件的逐字复制。

- 用户、角色、菜单、权限、字典类型、字典项和列表模板使用共用业务页面，表格、弹窗、选择器、开关及输入由所选 UI 库提供。角色关联菜单/权限和用户关联角色使用多选。父级使用选择器。
- 默认使用本地演示仓库，无后端即可新增、编辑、详情、查询、分页、启禁用和删除。数据保存在当前浏览器 localStorage，不保存用户密码。可复制 .env.example 到 .env.local，设置 VITE_DEMO_MODE=false 连接原接口；API 失败不会回退到演示数据。
- 原接口成功码 0 统一调整为数字 200；message 优先，兼容 msg。直接 request 保留完整响应，迁移的 API 函数仍只返回 data。
- History 路由、登录与退出、Vben 5 布局、菜单、错误日志、组件操作演示已接入。VITE_DEMO_MODE=false 时使用迁入的登录/当前用户/退出接口，也可通过 services/auth.ts 的 AuthAdapter 替换；演示登录不构成安全鉴权，前端权限不能替代服务端校验。
- 应用原子样式使用 UnoCSS（uno.config.ts）。Vben 内部 workspace 组件仍保留官方 Tailwind 样式编译依赖；扫描限定在 packages，业务 src 不由 Tailwind 扫描，不对上游组件做机械替换。
- 请求只抛出规范化错误，不提前弹窗；catch 消化后不提示，逃逸至全局时提示；取消、静默和去重行为保留。
- 原 v2 的 BasicTable/useTable、BasicForm/useForm、useModal/useDrawer 属于 v2 专属接口，改用当前 schema 和 UI 适配层；不将旧组件混入运行项目。

后端响应、账号权限、第三方登录、短信、扫码、注册和找回密码需要实际服务。旧模板这些表单不能凭复制成为可用服务；注册、找回密码、短信与扫码表单已保留，使用 configureAccountFlows 接入服务；账号认证使用 AuthAdapter，不默认调用原项目服务器。

- 补充迁移锁屏、受控外链 iframe 与站内跳转入口；外链通过 VITE_FRAME_HOSTS 配置 HTTPS 主机白名单。注册/重置/短信/扫码入口保留校验和服务适配器，未接入时明确报错，不模拟服务成功。

## 接口地址约定

业务接口源码只保存 /login、/system/...、/template/... 等相对路径。VITE_API_PREFIX 配置公共前缀，默认 /api，可留空或改为 /v1 等。生产部署可将 VITE_API_BASE_URL 留空使用同源代理，或填写后端 origin 直连，跨域时后端需允许跨域。上传独立使用 /files/upload，不附加业务前缀。Nginx 代理默认注释，使用同源模式时需配置容器或外层代理。
