# net4j-success-plugin

Easily to set success tip when request completed successfully.

```
import Net from 'net4j';
import { message } from 'antd';
import NetSuccess, { NetConfig } from 'net4j-success-plugin';

// Merge plugin config to net4j config,then you can use it in every requst in net4j
declare module 'net4j' {
  interface IConfig extends NetConfig {}
}

const net = new Net({
  plugins: [
    new NetSuccess({
      tipsComponent: message.success,
      defaultSuccessText: '操作成功', // Default is 'success'
    }),
  ]
});

// When api/goods completed successfully, tips component will display;
await net.get('api/goods');
```