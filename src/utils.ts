export const logger = (domain: string) =>
  (...messages: any[]) => console.log(`[${ domain.toUpperCase() }]`, ...messages);
