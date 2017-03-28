export interface MenuConfig {
    include?: string[];
    exclude?: string[];
}

export interface ProjectConfig {
    src: string;
    menu?: MenuConfig
}

export interface Config {
    manifest: {
        title: string,
        intro: string
    },
    projects: ProjectConfig[],
    output?: string;
}
