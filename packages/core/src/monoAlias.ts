import {getMonorepoProjects, projects} from "./getMonorepoProjects";
import type {Plugin} from "vite";

export interface ExternalAliasConfig {
    root?: string;
    // 需要劫持的路径对应表，默认： {"@": "./src"}
    alias?: any;
}

export default function monoAlias(options: ExternalAliasConfig = {}): Plugin {
    const {root, alias = {"@": "./src"}} = options;
    let monorepo: projects
    let aliasPrefix: string[] = Object.keys(alias)

    return <Plugin>{
        name: "monoalias",
        enforce: "pre",
        async configResolved() {
            monorepo = getMonorepoProjects(root);
            // console.log('monorepo', monorepo);
        },
        async resolveId(source: string, importer?: string, options?: any) {
            // 使用了别名的id
            const alia_config = aliasPrefix.find(alia => source.startsWith(`${alia}/`))
            // console.log("===", source, importer, options);
            if (alia_config) {
                // 匹配上的别名，找到对应项目
                const findPackage = monorepo.packages.find(p => importer?.startsWith(p.node_path))
                // options
                const src = new URL(alias[alia_config], `${findPackage?.node_path}/`)
                source = source.replace(`${alia_config}/`, `${src.href}/`)
            }
            // console.log(source);
            return await this.resolve(source, importer, options)
        },
    };
}
