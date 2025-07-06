import path from "node:path";
import fs from "node:fs";

interface MonorepoProject {
    name: string;
    path: string;
    node_path: string;
    private: boolean;
    is_root: boolean;
}

export interface projects {
    rootDir: string;
    rootPackage?: MonorepoProject;
    packages: MonorepoProject[];
}

// 忽略文件规则
let ignoreRules: string[]
// 根目录
let rootDir: string

export function getMonorepoProjects(root?: string): projects {
    rootDir = root ?? getRoot();
    // 忽略文件
    ignoreRules = getIgnore(rootDir);
    const packages = getProjects(rootDir);

    return {
        rootDir,
        rootPackage: packages.find(p => p.is_root),
        packages: packages.filter(p => !p.is_root),
    };
}

/**
 * 查找monorepo项目根目录
 * @returns 项目根目录
 */
function getRoot() {
    const configFiles = ["pnpm-workspace.yaml", "lerna.json", "workspace.json"];

    // 直接使用 process.cwd() 获取当前工作目录
    let currentDir = process.cwd();
    const rootDir = path.parse(currentDir).root;
    // console.log("rootDir", path.parse(currentDir));
    do {
        // 检查当前目录是否存在配置文件
        const found = configFiles.some((file) =>
            fs.existsSync(path.join(currentDir, file))
        );

        if (found) return currentDir;

        const parentDir = path.dirname(currentDir);
        currentDir = parentDir;
    } while (currentDir !== rootDir);

    return rootDir;
}

/**
 * 查找monorepo下所有子项目
 * @param dir 项目根目录
 * @returns 项目列表
 */
function getProjects(dir: string): MonorepoProject[] {
    const projects = [];

    // 读取目录下所有文件
    const files = fs.readdirSync(dir);

    // 查找package.json
    if (files.includes("package.json")) {
        projects.push(getProject(dir));
    }

    // 过滤出目录
    const dirs = files.filter((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        const is_dir = stat.isDirectory();
        const is_normal = !file.startsWith('.')
        const is_white = !ignoreRules.includes(file)
        return is_dir && is_normal && is_white;
    });
    // console.log('dirs', dirs);

    dirs.forEach((child_dir) => {
        const list = getProjects(path.join(dir, child_dir));
        if (list.length) {
            projects.push(...list);
        }
    });

    return projects;
}

/**
 * 根据gitignor获取忽略文件/文件夹
 * @param dir 目录路径
 * @returns 忽略规则数组
 */
function getIgnore(dir: string): string[] {
    const gitignorePath = path.join(dir, ".gitignore");
    if (!fs.existsSync(gitignorePath)) {
        return [];
    }

    const content = fs.readFileSync(gitignorePath, "utf-8");
    return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));
}

/**
 * 根据package.json获取项目信息
 * @param dir 目录路径
 * @returns 项目信息对象
 */
function getProject(dir: string): MonorepoProject {
    const pkgPath = path.join(dir, "package.json");
    if (!fs.existsSync(pkgPath)) {
        throw new Error(`package.json not found in ${dir}`);
    }

    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const is_root = dir === rootDir
    let node_path = dir
    if (process.platform === 'win32') {
        node_path = dir.replace(/\\/g, '/')
            .replace(/^\/\//, '/');
    }

    return {
        name: pkgJson.name,
        path: dir,
        node_path,
        private: !!pkgJson.private,
        is_root
    };
}

/**
 * 根据vite.config.js获取alias
 * @param dir 目录路径
 * @returns 路径对应表
 */
// function getAlias(dir: string): {
//     const pkgPath = path.join(dir, "package.json");
//     if (!fs.existsSync(pkgPath)) {
//         throw new Error(`package.json not found in ${dir}`);
//     }
//
//     const pkgJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
//     const is_root = dir === rootDir
//
//     return []
// }
