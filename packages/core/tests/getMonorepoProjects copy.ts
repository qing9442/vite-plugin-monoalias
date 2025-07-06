import * as path from "path";
import * as fs from "fs";
// import { globbySync } from "globby";
// import * as yaml from "yaml";

interface MonorepoProject {
  name: string;
  path: string;
  private: boolean;
}

export function getMonorepoProjects(root: string): {
  root: string;
  packages: MonorepoProject[];
} {
  root ??= getRoot();
  
  const packages = getProjects(root);

  return {
    root,
    packages,
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
  console.log("rootDir", rootDir);

  do {
    // 检查当前目录是否存在配置文件
    const found = configFiles.some((file) =>
      fs.existsSync(path.join(currentDir, file))
    );

    if (found) return currentDir;

    const parentDir = path.dirname(currentDir);
    console.log(parentDir);
    if (parentDir === currentDir || parentDir === path.parse(currentDir).root) {
      throw new Error("未找到 monorepo 根目录");
    }
    currentDir = parentDir;
  } while (currentDir !== rootDir);

  throw new Error("未找到monorepo根目录");
}

/**
 * 查找monorepo下所有子项目
 * @param root 项目根目录
 * @returns 项目列表
 */
function getProjects(root: string): MonorepoProject[] {
  const configFiles = ['pnpm-workspace.yaml', 'lerna.json', 'workspace.json'];
  const workspaceFile = configFiles.find(file => 
    fs.existsSync(path.join(root, file))
  );

  if (!workspaceFile) return [];

  const configPath = path.join(root, workspaceFile);
  const ext = path.extname(workspaceFile);
  let patterns: string[] = [];

  // 解析配置文件
  if (ext === '.yaml') {
    const content = fs.readFileSync(configPath, 'utf8');
    const packagesMatch = content.match(/packages:\s*\n([\s\S]+?)(\n\S|$)/);
    if (packagesMatch) {
      patterns = packagesMatch[1]
        .split('\n')
        .map(line => line.replace(/^\s*-\s*['"]?|['"]?$/g, '').trim());
    }
  } else {
    const content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    patterns = content.packages || content.workspaces?.packages || content.workspaces;
  }

  // 递归查找包目录
  const packageDirs = patterns.flatMap(pattern => {
    const [baseDir, ...subPath] = pattern.replace(/\*\*/g, '{/**}').split('/');
    return findPackageDirs(path.resolve(root, baseDir), subPath.join('/'));
  });

  // 过滤并生成项目信息
  return packageDirs.filter(dir => {
    try {
      const pkgPath = path.join(dir, 'package.json');
      return fs.existsSync(pkgPath) && 
        !dir.includes('node_modules') &&
        require(pkgPath).name;
    } catch (e) {
      console.warn(`Invalid package directory: ${dir}`);
      return false;
    }
  }).map(dir => ({
    name: require(path.join(dir, 'package.json')).name,
    path: dir,
    private: require(path.join(dir, 'package.json')).private || false
  }));
}

function findPackageDirs(baseDir: string, pattern: string): string[] {
  if (!fs.existsSync(baseDir)) return [];

  return fs.readdirSync(baseDir).reduce((acc, entry) => {
    const fullPath = path.join(baseDir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (patternMatch(entry, pattern)) {
        acc.push(fullPath);
      }
      if (pattern.includes('**')) {
        acc.push(...findPackageDirs(fullPath, pattern));
      }
    }
    return acc;
  }, [] as string[]);
}

/**
 * 带缓存的package.json读取
 */
const pkgCache = new Map<string, any>();

function getPackageInfo(dir: string) {
  const pkgPath = path.join(dir, 'package.json');
  
  if (!pkgCache.has(pkgPath)) {
    try {
      pkgCache.set(pkgPath, JSON.parse(fs.readFileSync(pkgPath, 'utf8')));
    } catch (e) {
      console.warn(`Invalid package.json: ${pkgPath}`);
      pkgCache.set(pkgPath, null);
    }
  }
  return pkgCache.get(pkgPath);
}

// 优化后的pattern匹配（支持多层通配）
function patternMatch(name: string, pattern: string): boolean {
  const segments = pattern.split('/');
  return matchSegments(name.split(path.sep), 0, segments, 0);
}

function matchSegments(
  nameParts: string[],
  nIndex: number,
  patternParts: string[], 
  pIndex: number
): boolean {
  if (pIndex === patternParts.length) return nIndex === nameParts.length;
  
  const currentPattern = patternParts[pIndex];
  
  // 处理**通配符
  if (currentPattern === '**') {
    return matchSegments(nameParts, nIndex, patternParts, pIndex + 1) ||
      (nIndex < nameParts.length && matchSegments(nameParts, nIndex + 1, patternParts, pIndex));
  }
  
  // 普通匹配
  const regex = new RegExp('^' + currentPattern
    .replace(/\*/g, '[^\\/]*')
    .replace(/\?/g, '.') + '$');
    
  if (nIndex >= nameParts.length || !regex.test(nameParts[nIndex])) return false;
  
  return matchSegments(nameParts, nIndex + 1, patternParts, pIndex + 1);
}
