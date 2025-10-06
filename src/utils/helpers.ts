export const fillTemplate = (template: any, data: Record<string, string>): any => {

  const jsonString = JSON.stringify(template);

  const replaced = jsonString.replace(/\$\{(.*?)\}/g, (_, key) => {
    const value = data[key.trim()] ?? "";
    return JSON.stringify(value).slice(1, -1);
  });

  return JSON.parse(replaced);

};

export const mapSeverityConfig = (category: string) => {

  const config: Record<string, { badge: string }> = {
    high: { badge: "ALTA" },
    medium: { badge: "MEDIA" },
    low: { badge: "BAJA" },
    success: { badge: "ÉXITO" },
    notify: { badge: "NOTIFICACIÓN" },
    error: { badge: "ERROR" },
  };

  return config[category] ?? config.notify;

};