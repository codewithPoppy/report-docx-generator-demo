const logger = class {
  constructor(name: string) {}
  info(log: string, obj?: any) { console.log(log, obj); };
  error(err: string, obj?: any) { console.error(err, obj); };
  debug(err: string, obj?: any) { console.debug(err, obj); };
};

export default logger;
