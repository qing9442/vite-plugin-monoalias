/// <reference types="vite/client" />
declare module 'get-monorepo-packages' {
    const getPackages: (rootDir: string) => Promise<any[]>;
    export = getPackages;
}