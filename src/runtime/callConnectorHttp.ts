import axios from 'axios';
import { getDecodeString } from '../script';

interface IOptions {
  method: string;
  url: string;
  data: any;
  params: any;
  headers: any;
  [key: string]: any;
}

interface IConfig {
  before: (options: IOptions) => any;
}

const defaultFn = (options: IOptions, ...args: any) => ({
  ...options,
  ...args,
});

const httpRegExp = new RegExp('^(http|https)://');

export function call(
  connector: {
    id: string;
    script: string;
    useProxy?: boolean;
    executeEnv?: string;
    [key: string]: any
  },
  params: any,
  config?: IConfig
) {
  return new Promise((resolve, reject) => {
    try {
      const fn = connector.script ? eval(`(${decodeURIComponent(connector.script)})`) : getFetch(connector);
      const { before = defaultFn } = config || {};
      fn(
        params,
        { then: resolve, onError: reject },
        {
          executeEnv: connector.executeEnv,
          ajax(options: IOptions) {
            const opts = before({ ...options });
            const { url } = opts;

            if (!url) {
              reject('请求路径不能为空');
            }

            if (connector.useProxy && httpRegExp.test(url) && url.match(/^https?:\/\/([^/#&?])+/g)?.[0] !== location.origin) {
              const curOptions = {url: '/paas/api/proxy', method: 'post', data: opts || options} as Record<string, unknown>;

              if (opts.responseType) {
                curOptions.responseType = opts.responseType;
              }
              return axios(curOptions).then((res: any) => res.data).catch(error => {
                reject(error)
              })
            }

            return axios(opts || options).then((res: any) => res.data).catch(error => {
              reject(error)
            })
          },
        }
      );
    } catch (ex) {
      console.log('连接器错误', ex);
      reject(`连接器script错误.`);
    }
  });
}

const setData = (data, keys, val) => {
  const len = keys.length;
  function dfs(res, index, val) {
    if (!res || index === len) {
      return res;
    }
    const key = keys[index];
    if (Array.isArray(res)) {
      return res.map((item, i) => {
        const curVal = val[i];
        let obj;
        if (curVal === void 0) {
          obj = {};
          val.push(obj);
        } else {
          obj = curVal;
        }
        return dfs(item, index, obj);
      });
    } else {
      if (index === len - 1) {
        val[key] = res[key];
        return res[key];
      }
      res = res[key];
      if (Array.isArray(res)) {
        val[key] = val[key] || [];
      } else {
        val[key] = val[key] || {};
      }
    }
    return dfs(res, index + 1, Array.isArray(val) ? val : val[key]);
  }
  return dfs(data, 0, val);
};
const del = (data, keys) => {
  const len = keys.length;
  function dfs(data, index) {
    if (!data || index === len) return;
    const key = keys[index];
    if (index === len - 1) {
      Reflect.deleteProperty(data, key);
    }
    if (Array.isArray(data)) {
      data.forEach((item) => {
        dfs(item, index);
      });
    } else {
      dfs(data[key], index + 1);
    }
  }
  dfs(data, 0);
};
const pluginRun = functionString => eval(`(() => { return ${functionString ? getDecodeString(functionString) : '_ => _;' }})()`);
const getFetch = (connector) => {
  return (params, { then, onError }, config) => {
    const method = connector.method;
    const path = connector.path.trim();
    const outputKeys = connector.outputKeys || [];
    const excludeKeys = connector.excludeKeys || [];

    try {
      const url = path;
      /** 全局入参处理 */
      const newParams = pluginRun(connector.globalParamsFn)(
          method.startsWith('GET') ? { params, url, method } : { data: params, url, method }
      );
      newParams.url = newParams.url || url;
      newParams.method = newParams.method || method;
      /** 局部入参处理 */
      const options = pluginRun(connector.input)(newParams);
      /** url 里支持模板字符串 */
      options.url = (options.url || url).replace(/{(\w+)}/g, (match, key) => {
        const param = params[key] || '';
        Reflect.deleteProperty(options.params || {}, key);
        return param;
      });
      options.method = options.method || method;

      config
          .ajax(options)
          .then((response) => {
            /** 全局响应值处理 */
            return pluginRun(connector.globalResultFn)(
                { response, config: options },
                { throwStatusCodeError: onError }
            );
          })
          .then((response) => {
            /** 局部响应值处理 */
            return pluginRun(connector.output)(response, Object.assign({}, options), { throwStatusCodeError: onError });
          })
          .then((response) => {
            excludeKeys?.forEach((key) => del(response, key.split('.')));

            return response;
          })
          .then((response) => {
            let outputData: any = Array.isArray(response) ? [] : {};
            if (outputKeys === void 0 || outputKeys.length === 0) {
              outputData = response;
            } else {
              outputKeys.forEach((key) => {
                setData(response, key.split('.'), outputData);
              });

              /** 当标记单项时，自动返回单项对应的值 */
              if (Array.isArray(outputKeys) && outputKeys.length && (outputKeys.length > 1 || !(outputKeys.length === 1 && outputKeys[0] === ''))) {
                try {
                  let cascadeOutputKeys = outputKeys.map(key => key.split('.'));
                  while (Object.prototype.toString.call(outputData) === '[object Object]' && cascadeOutputKeys.every(keys => !!keys.length) && Object.values(outputData).length === 1) {
                    outputData = Object.values(outputData)[0];
                    cascadeOutputKeys.forEach(keys => keys.shift());
                  }
                } catch(e) {
                  console.log('connector format data error', e);
                }
              }
            }

            then(outputData);
          })
          .catch((error) => {
            onError((error && error.message) || error);
          });
    } catch (error) {
      return onError(error);
    }
  };
};
