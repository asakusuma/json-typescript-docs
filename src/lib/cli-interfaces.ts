export interface ProjectConfig {
    src: string
}

export interface Config {
    manifest: {
        title: string,
        intro: string
    },
    projects: ProjectConfig[],
    output?: string;
}