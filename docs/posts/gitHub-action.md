---
title: GitHub Actions学习记录
date: 2026-07-01
author: myWorldmakerTonyczk
---

# GitHub Actions学习记录

## 什么是GitHub Actions？

GitHub Actions 是运行在 GitHub 云端服务器上的自动化工作流，可以监听仓库中的**各种事件**，并自动执行预先定义好的**任务**。

## 文件格式
首先至少记得 GitHub Actions 的文件格式是 YAML，文件路径为 `.github/workflows/main.yml`。
注意：文件名可以随意，如 `czk.yml`，只要后缀名为 `.yml` 即可。

## 踩坑实录：从零开始一步步试错

学习的最好方式就是动手试。我新建了一个空文件 `.github/workflows/czk.yml`，push 上去，然后盯着 Actions 面板看报错——**缺什么就加什么**，直到跑通为止。

### 第一回合：空文件 → `on`

空文件 push 上去，Actions 直接报错：

> **Error: No event triggers defined in `on`**

原来 workflow 文件里必须声明**什么时候运行**。好，加上 `on`：

```yaml
on:
  push:
    branches: [main]
```

### 第二回合：有 `on` 没 `jobs` → 继续报错

加上 `on` 后 push，又红了：

> **Invalid workflow file: .github/workflows/czk.yml#L1**
> **(Line: 1, Col: 1): Required property is missing: jobs**

有了"什么时候"，还得有"干什么"。加上 `jobs`：

```yaml
on:
  push:
    branches: [main]

jobs:
  job1:
  job2:
```

### 第三回合：有 `jobs` 但缺 `runs-on` 和正确的 `steps`

满怀信心 push，结果报错更详细了：

> **(Line: 6, Col: 11): Unexpected value 'run:pwd'**
> **(Line: 7, Col: 11): Unexpected value 'run:ls'**
> **(Line: 5, Col: 9): Required property is missing: runs-on**
> **(Line: 9, Col: 9): Required property is missing: runs-on**

这里暴露了三个问题：

1. **`run:pwd` 写法错误**——YAML 中冒号后面必须有空格，应该是 `run: pwd`
2. **每个 job 必须指定 `runs-on`**——告诉 GitHub 在什么操作系统上跑
3. **`run` 命令要放在 `steps` 下面**，不能直接挂在 job 上

修正后：

```yaml
on:
  push:
    branches: [main]

jobs:
  job1:
    runs-on: ubuntu-latest
    steps:
      - run: pwd
      - run: ls

  job2:
    runs-on: ubuntu-latest
    steps:
      - run: echo "hello github actions!"
```

### ✅ 成功！

push 上去，两个 job 并行跑了起来，终于一片绿色 ✅。

回头看，踩的坑其实就对应了 workflow 的三个必填字段：

| 必填项 | 含义 | 报错关键词 |
|--------|------|------------|
| `on` | 什么时候触发 | `No event triggers defined in on` |
| `jobs` | 要做什么任务 | `Required property is missing: jobs` |
| `jobs.<id>.runs-on` | 在什么环境运行 | `Required property is missing: runs-on` |

**教训**：YAML 中 `key: value` 的冒号后面必须有空格，`run:pwd` 会被当成一个普通字符串而不是一个指令。

## 语法

***核心：在什么时间（on）+ 干什么事情（jobs）***

### 1. `on` — 触发工作流的事件

```yaml
on:
  push:
    branches: [main]       # 当 main 分支有推送时触发
  workflow_dispatch:       # 允许手动触发
```

常用事件：
- `push`：代码推送时触发
- `pull_request`：PR 创建/更新时触发
- `workflow_dispatch`：允许在 GitHub 网页上手动点击运行
- `schedule`：定时触发（cron 表达式）

### 2. `permissions` — 权限控制

GitHub Actions 默认有一定的权限，但建议显式声明最小权限原则：

```yaml
permissions:
  contents: read      # 读取仓库内容
  pages: write        # 写入 GitHub Pages
  id-token: write     # 用于 OIDC 认证（部署到 Pages 需要）
```

### 3. `concurrency` — 并发控制

防止多个工作流同时运行导致冲突：

```yaml
concurrency:
  group: pages
  cancel-in-progress: false   # 不取消正在运行的，而是排队等待
```

### 4. `jobs` — 定义要执行的任务

每个 job 是一个独立的执行单元，可以包含多个 step。

```yaml
jobs:
  build:                            # job 名称
    runs-on: ubuntu-latest          # 运行环境（操作系统）
    steps:                          # 步骤列表
      - name: Checkout              # 步骤名称（可选，但建议写）
        uses: actions/checkout@v4   # 使用官方 action：拉取代码

      - name: Setup Node
        uses: actions/setup-node@v4 # 使用官方 action：安装 Node.js
        with:                       # 传入参数
          node-version: 20
          cache: npm                # 缓存 npm 依赖，加速构建

      - name: Install dependencies
        run: npm ci                 # 直接运行 shell 命令

      - name: Build with VitePress
        run: npm run docs:build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist
```

`uses` vs `run`：
- `uses`：引用别人写好的 action（来自 GitHub Marketplace）
- `run`：直接在虚拟机中执行 shell 命令

### 5. Job 之间的依赖 — `needs`

多个 job 默认**并行**执行，用 `needs` 可以串行化：

```yaml
  deploy:
    needs: build          # 等 build 完成后再执行 deploy
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

### 6. `environment` — 部署环境

```yaml
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}   # 部署完成后显示 URL
```

## 完整示例：部署 VitePress 博客到 GitHub Pages

以下是我这个博客实际使用的 workflow 文件 `.github/workflows/deploy.yml`：

```yaml
name: Deploy VitePress to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build with VitePress
        run: npm run docs:build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 整体流程解析

1. **触发**：每次 push 到 main 分支（或手动触发）
2. **构建（build job）**：
   - 拉取代码 → 安装 Node.js 20 → `npm ci` 安装依赖 → `npm run docs:build` 构建 → 上传构建产物
3. **部署（deploy job）**：等 build 完成后，将产物部署到 GitHub Pages
4. **结果**：博客自动更新到 `https://<username>.github.io/<repo>/`

## 常见问题

**Q: `npm ci` 和 `npm install` 有什么区别？**
- `npm ci` 严格按 `package-lock.json` 安装，适合 CI/CD 环境，速度更快
- `npm install` 可能更新 `package-lock.json`，适合本地开发

**Q: 如何查看工作流运行状态？**
- GitHub 仓库页面 → Actions 标签页，可以看到每次运行的日志

**Q: 如何调试失败的 workflow？**
- 在 Actions 页面点击失败的运行记录，展开每个 step 查看日志输出