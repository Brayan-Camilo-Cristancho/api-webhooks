export interface MessageBuilder {
  setBase(data: Record<string, string>): this;
  addSeverity(category: string): this;
  addDocumentation(): this;
  build(): any;
}