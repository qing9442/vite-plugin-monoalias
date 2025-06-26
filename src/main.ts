import * as vite from "vite";
export default function myPlugin() {
  const virtualModuleId = "virtual:monoalias";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  let config;
  return {
    name: "monoalias",
    config: () => ({
      resolve: {
        alias: {
          foo: "bar",
        },
      },
    }),
    configResolved(resolvedConfig: any) {
      // 存储最终解析的配置
      config = resolvedConfig;
    },
    options(opt: any) {
      console.log("options", opt);
    },
    buildStart(opt: any) {
      console.log("build", opt);
    },
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
      // console.log(vite?.rolldownVersion);
    },
    load(id: string) {
      console.log('load',id)
      // if (id === resolvedVirtualModuleId) {
      //   return `export const msg = "from virtual module"`;
      // }
      // return {
      //   code: `export default ${JSON.stringify(content)}`,
      //   moduleType: 'js', 
      // }
    },
    transform(src: string, id: string) {
      console.log(src, id);
      // if (fileRegex.test(id)) {
      //   return {
      //     code: compileFileToJS(src),
      //     map:  null // 如果可行将提供 source map
      //   }
      // }
    },
  };
}
