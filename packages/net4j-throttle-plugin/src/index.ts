import { IPlugin, IConfig as RootConfig } from 'net4j';

// default wait 1 second
const DEFAULT_WAIT = 1000;

// default throttle code in error
const DEFAULT_CODE = 'THROTTLE_CODE';

// GC when reqList keys bigger than threshold
const GC_THRESHOLD = 20;

interface IThrottleConfig {
  enable?: boolean;
  wait?: number;
}

interface IThrottleError extends Error {
  code?: string;
}

interface IReq {
  [token: string]: {
    startTime: number;
  }
}

export interface PluginConfig extends RootConfig {
  throttleConfig?: IThrottleConfig;
}

interface IConfig extends IThrottleConfig {}

class ThrottlePlugin implements IPlugin {
  private reqList: IReq;
  private defaultWait: number;

  constructor(config: IConfig = {}) {
    this.defaultWait = config.wait || DEFAULT_WAIT;
    this.reqList = {};
  }

  beforeRequest(e, config: PluginConfig) {
    if (config && config.throttleConfig && config.throttleConfig.enable === false) {
      return config;
    }
    const token = `${config.url}#${config.method}#${JSON.stringify(config.params)}#${JSON.stringify(config.data)}`;
    const request = this.reqList[token];
    if (request) {
      if (new Date().getTime() - request.startTime <= this.defaultWait) {
        const e: IThrottleError = new Error('operaion too quick');
        e.code = DEFAULT_CODE;
        throw e;
      }
    } else {
      this.GC();
    }
    this.reqList[token] = {
      startTime: new Date().getTime(),
    }
    return config;
  }

  afterRequest(e, response) {
    if (e && e.code === DEFAULT_CODE) {
      console.log('[net4j-throttle]Been throttled')
      return Promise.resolve(undefined);
    } else if (e) {
      return Promise.reject(e);
    }
    return response;
  }

  // GC for reqList
  private GC() {
    if (Object.keys(this.reqList).length > GC_THRESHOLD) {
      this.reqList = {}
    }
    return;
  }

}

export default ThrottlePlugin;
