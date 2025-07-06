# vite-plugin-monoalias

#### 介绍

解决monorepo项目中路径别名解析问题。当子项目使用`@`指向自己的`src`目录时，在其他子项目中引用该子项目文件会导致路径解析错误，因为它始终指向打包项目的`src`目录而不是原始项目的`src`目录。

#### 安装

```bash
# 使用pnpm
pnpm add vite-plugin-monoalias -D

# 使用npm
npm install vite-plugin-monoalias --save-dev

# 使用yarn
yarn add vite-plugin-monoalias -D
```

#### 基本使用

在vite配置文件中添加插件：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Monoalias from 'vite-plugin-monoalias'

export default defineConfig({
  plugins: [
    vue(),
    Monoalias(), // 添加插件
  ],
})
```

#### 高级配置

```ts
Monoalias({
  /**
   * 手动指定monorepo项目根目录
   * 默认会自动检测
   */
  root: fileURLToPath(new URL("../../", import.meta.url)),
  
  /**
   * 需要替换的别名配置，默认值为{"@": "./src"}
   */
  alias: {
    "@": "./src"
  },
})
```
