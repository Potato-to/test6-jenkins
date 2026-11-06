pipeline {
  agent any
  options { skipDefaultCheckout(true); disableConcurrentBuilds(); timestamps() }
  stages {
    stage('Initialize parameters') {
      steps {
        script {
          // Create parameters only for a new job. Existing job values are authoritative.
          if (!params || params.isEmpty()) {
            properties([parameters([
              string(name: 'DEPLOY_HOST', defaultValue: '', description: '部署目标 Linux 服务器的主机名或 IPv4 地址'),
              string(name: 'SSH_PORT', defaultValue: '22', description: '服务器 SSH 端口，通常为 22'),
              string(name: 'SSH_CREDENTIALS_ID', defaultValue: 'project-deploy-ssh', description: 'Jenkins 中保存的 SSH 用户名和私钥凭据 ID'),
              string(name: 'KNOWN_HOSTS_CREDENTIALS_ID', defaultValue: 'deploy-known-hosts', description: 'Jenkins 中保存的已核验 known_hosts 文件凭据 ID'),
              string(name: 'DEPLOY_DIR', defaultValue: '/srv/test6', description: '服务器上的部署目录，必须为不含空格的绝对路径'),
              string(name: 'PROJECT_NAME', defaultValue: 'test6', description: '项目标识：小写字母开头，仅含小写字母、数字、下划线或连字符，最多 63 个字符'),
              string(name: 'IMAGE_TAG', defaultValue: '', description: '每次部署使用新的版本号；留空时使用 build-构建编号'),
              string(name: 'VITE_API_BASE_URL', defaultValue: '', description: '后端地址，例如 https://api.example.com，不含路径；留空使用同源请求，需配置反向代理'),
              string(name: 'VITE_API_PREFIX', defaultValue: '/api', description: '业务接口公共前缀，默认 /api；留空表示不添加前缀'),
              string(name: 'VITE_FRAME_HOSTS', defaultValue: '', description: '允许 iframe 嵌入的主机名，多个用英文逗号分隔；修改后需重新构建'),
              string(name: 'VITE_UPLOAD_URL', defaultValue: '/files/upload', description: '相对于后端基础地址的上传路径，默认 /files/upload；修改后需重新构建'),
            ])])
            error('已创建 Jenkins 参数，请返回任务配置修改默认值后重新构建。')
          }
        }
      }
    }
    stage('Checkout') {
      steps {
        script {
          def revision = checkout scm
          env.GIT_COMMIT = revision.GIT_COMMIT
          // Git plugin returns origin/main (also for a detached checkout in a normal Pipeline).
          def localBranch = revision.GIT_LOCAL_BRANCH
          def remoteBranch = revision.GIT_BRANCH
          if (localBranch && localBranch != '**') {
            env.DEPLOY_BRANCH = localBranch.replaceFirst('^refs/heads/', '')
          } else if (remoteBranch?.startsWith('refs/heads/')) {
            env.DEPLOY_BRANCH = remoteBranch.replaceFirst('^refs/heads/', '')
          } else if (remoteBranch) {
            env.DEPLOY_BRANCH = remoteBranch.replaceFirst('^refs/remotes/', '').replaceFirst('^[^/]+/', '')
          } else {
            error('无法识别检出的 Git 分支，请在任务的 Git 配置中指定分支，例如 */main。')
          }
          echo "本次检出分支：${env.DEPLOY_BRANCH}，提交：${env.GIT_COMMIT}"
          if (!(env.DEPLOY_BRANCH in ['main', 'develop', 'test']) && !env.DEPLOY_BRANCH.startsWith('release/')) {
            echo '该分支只执行校验，不执行审批或部署。'
          }
        }
      }
    }
    stage('Validate') {
      steps {
        script { env.RELEASE_VERSION = params.IMAGE_TAG?.trim() ?: "build-${env.BUILD_NUMBER}" }
        sh '''#!/usr/bin/env bash
set -Eeuo pipefail
[[ "$DEPLOY_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || { echo 'Set DEPLOY_HOST'; exit 1; }
[[ "$SSH_PORT" =~ ^[0-9]{1,5}$ ]] && ((10#$SSH_PORT>0 && 10#$SSH_PORT<=65535))
[[ "$PROJECT_NAME" =~ ^[a-z][a-z0-9_-]{0,62}$ ]]
[[ "$RELEASE_VERSION" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,79}$ ]]
[[ "$DEPLOY_DIR" =~ ^/[a-zA-Z0-9/_-]+$ && "$DEPLOY_DIR" != / ]]
[[ -z "${VITE_API_BASE_URL:-}" || "${VITE_API_BASE_URL:-}" =~ ^https?://[a-zA-Z0-9][a-zA-Z0-9.-]*(:[0-9]{1,5})?$ ]] || { echo 'VITE_API_BASE_URL must be empty for same-origin requests or an HTTP(S) origin; configure API paths with VITE_API_PREFIX'; exit 1; }
'''
      }
    }
    stage('Build static files') {
      tools {
        nodejs 'node24'
      }
      when { expression { env.DEPLOY_BRANCH in ['main', 'develop', 'test'] || env.DEPLOY_BRANCH.startsWith('release/') } }
      steps {
        sh '''#!/usr/bin/env bash
set -Eeuo pipefail
node -e "if (!/^24[.]/.test(process.versions.node) || Number(process.versions.node.split('.')[1]) < 16) process.exit(1)"
[[ "$(pnpm --version)" == 12.16.1 ]] || { echo '请在构建节点安装 pnpm 12.16.1'; exit 1; }
export VITE_DEMO_MODE=false
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-}"
export VITE_API_PREFIX="${VITE_API_PREFIX-/api}"
export VITE_FRAME_HOSTS="${VITE_FRAME_HOSTS:-}"
export VITE_UPLOAD_URL="${VITE_UPLOAD_URL:-/files/upload}"
pnpm install --frozen-lockfile
pnpm build
test -s dist/index.html
'''
      }
    }
    stage('Approval') {
      when {
        expression { env.DEPLOY_BRANCH == 'main' || env.DEPLOY_BRANCH.startsWith('release/') }
      }
      steps {
        timeout(time: 30, unit: 'MINUTES') {
          input(
            message: "确认发布 ${env.DEPLOY_BRANCH} 的版本 ${env.RELEASE_VERSION} 到 ${params.DEPLOY_HOST}？\nGit 提交：${env.GIT_COMMIT}",
            ok: '确认发布'
          )
        }
      }
    }
    stage('Transfer and deploy') {
      when {
        expression { env.DEPLOY_BRANCH in ['main', 'develop', 'test'] || env.DEPLOY_BRANCH.startsWith('release/') }
      }
      steps {
        withCredentials([
          sshUserPrivateKey(credentialsId: params.SSH_CREDENTIALS_ID, keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER'),
          file(credentialsId: params.KNOWN_HOSTS_CREDENTIALS_ID, variable: 'SSH_KNOWN_HOSTS')
        ]) {
          sh '''#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
[[ "$SSH_USER" =~ ^[a-zA-Z_][a-zA-Z0-9_-]*$ ]]
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
ssh_args=(-i "$SSH_KEY" -p "$SSH_PORT" -o BatchMode=yes -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$SSH_KNOWN_HOSTS")
# Allocate a fresh source directory even when restarting the same build after a transfer failure.
release=$(ssh "${ssh_args[@]}" "$SSH_USER@$DEPLOY_HOST" "mkdir -p '$DEPLOY_DIR/releases' && mktemp -d '$DEPLOY_DIR/releases/$RELEASE_VERSION.XXXXXXXX'")
[[ "$release" == "$DEPLOY_DIR/releases/$RELEASE_VERSION."* && "$release" =~ ^/[a-zA-Z0-9/_.-]+$ ]] || { echo 'Invalid remote release directory'; exit 1; }
tar -czf "$work/site.tar.gz" -C dist .
ssh "${ssh_args[@]}" "$SSH_USER@$DEPLOY_HOST" "cat > '$release/site.tar.gz'" < "$work/site.tar.gz"
ssh "${ssh_args[@]}" "$SSH_USER@$DEPLOY_HOST" "cat > '$release/deploy.sh'" < deploy/deploy.sh
ssh "${ssh_args[@]}" "$SSH_USER@$DEPLOY_HOST" "bash '$release/deploy.sh' deploy '$DEPLOY_DIR' '$RELEASE_VERSION' '$release/site.tar.gz'"
ssh "${ssh_args[@]}" "$SSH_USER@$DEPLOY_HOST" "rm -f -- '$release/site.tar.gz' '$release/deploy.sh'; rmdir -- '$release'" || echo '发布成功，上传临时目录清理失败'
'''
        }
      }
    }
  }
}
