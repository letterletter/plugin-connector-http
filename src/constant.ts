export const exampleParamsFunc = `export default function ({ params, data, headers, url, method }) {
  // 设置请求query、请求体、请求头
  return { params, data, headers, url, method };
 }
`;

export const exampleResultFunc = `export default function (result, { method, url, params, data, headers }) {
  // return {
  //  total: result.all,
  //  dataSource: result.list.map({id, name} => ({
  //     value:id, label: name
  //  }))
  // }
  return result;
}
`;

export const exampleSQLParamsFunc = `export default function ({ params, data, headers, url, method }) {
  const domainInfo = {
    serviceId: '__serviceId__',
    relativePath: '__relativePath__'
  }
  // 设置请求query、请求体、请求头
  return { params, data: {
    params: {
      ...data
    },
    ...domainInfo,
  }, headers, url, method };
 }
`;

export const templateResultFunc = `export default function ({ response, config }) {
  // if (response.code !== 0) {
  //    throw new Error(response.errMsg)
  // }
  return response
}
`;

export const SERVICE_TYPE = {
  HTTP: 'http',
  TG: 'http-tg',
  KDEV: 'http-kdev',
};

export const DEFAULT_SCHEMA = {
  type: 'object',
  required: [],
  properties: {
    code: {
      type: 'number',
    },
    message: {
      type: 'string',
    },
    data: {
      type: 'object',
      properties: {
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: {
                type: 'string',
              },
              value: {
                type: 'number',
              },
            },
          },
        },
      },
    },
  },
};
export const NO_PANEL_VISIBLE = 0;
export const DEFAULT_PANEL_VISIBLE = 0b01;
export const TG_PANEL_VISIBLE = 0b10;
export const SQL_PANEL_VISIBLE = 0b1000;
export const DOMAIN_PANEL_VISIBLE = 0b10000;
export const KDEV_PANEL_VISIBLE = 0b100;
