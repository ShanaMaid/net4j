import { IPlugin, IConfig as RootConfig } from 'net4j';

export interface PluginConfig extends RootConfig {
  actionName?: string;
  defaultLoadingText?: string;
}

interface IConfig {
  loading: (text?: string) => () => void;
  defaultLoadingText?: string;
}

class LoadingPlugin implements IPlugin{
  private config: IConfig;
  private loadingClose: () => void;

  constructor(config: IConfig) {
    this.config = config;
    this.loadingClose = () => {};
  }

  beforeRequest(e: Error, config: PluginConfig) {
    // For more flexible , every request can reset laodingText.
    const loadingText = (config.actionName || '') +
      (config.defaultLoadingText || this.config.defaultLoadingText || 'loading');
    this.loadingClose = this.config.loading(loadingText);
    return config;
  }

  afterRequest(e, res) {
    this.loadingClose();
    if (e) {
      return Promise.reject(e);
    }
    return res;
  }
}

export default LoadingPlugin;
