export interface ProjectConfig {
    src: string;
    include?: string[];
    exclude?: string[];
}

export interface Config {
    manifest: {
        title: string,
        intro: string
    },
    projects: ProjectConfig[],
    output?: string;
}
