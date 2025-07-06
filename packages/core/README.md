# vite-plugin-monoalias

#### 介绍

`monorepo`子项目中使用`@`指向自己项目下`src`路径时，会导致一个问题：在其他子项目中引用该子项目文件时，由于解析问题，最终指向的文件路径不对的问题。因为他始终指向的是，打包项目的`src`目录。

#### 安装教程

```shell
pnpm add vite-plugin-monoalias -D
```

#### 用法

'vite.config.ts'

```js
export default defineConfig({
    plugins: [
        vue(),
        Monoalias(),
    ],
});
```

#### 配置项

```js
Monoalias({
    // 手动指定monorepo项目根目录
    root: fileURLToPath(new URL("../../", import.meta.url)),
    // 需要替换的别名，及相对项目目录的地址
    alias:{"@":"./src"}
})
```


