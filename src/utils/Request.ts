import cloneDeep from "lodash/cloneDeep";
import merge from "lodash/merge";
import Judge from "./Judge";

export default class Request {
  /**
   * Request实例
   */
  public static instance: Request;
  /**
   * 全局配置组
   */
  private globalConfig: GlobalConfig[] = [];
  /**
   * 全局配置索引
   */
  private globalConfigIndex = 0;
  /**
   * 拦截器组
   */
  private interceptorList: interceptor[] = [];
  /**
   * 拦截器响应函数列表
   */
  private interceptorResList: any[] = [];
  /**
   * 是否缓存了响应函数列表
   */
  private isCacheInterceptorResList = false;
  /**
   * 拦截器一定会执行的函数组
   */
  private interceptorFinalList: Function[] = [];
  /**
   * 请求对象列表
   */
  private requestTaskList: any = {};

  private constructor() {}

  /**
   * 创建Request实例
   */
  static getInstance(): Request {
    if (!this.instance) this.instance = new Request();
    return this.instance;
  }

  /**
   * 设置全局配置
   * @tips 如果传入数组，设置多个全局变量。默认使用索引为0的配置
   * @tips 如果传入对象 只设置一个全局变量
   * @param globalConfig 全局配置赌对象或数组
   */
  public setGlobalConfig(globalConfig: GlobalConfig[]): void {
    if (!Judge.isArray(globalConfig)) throw new Error("setGlobalConfig必须传入数组");
    this.globalConfig = globalConfig;
  }

  /**
   * 发起get请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public get(
    uri: string,
    data: ResquestData = "",
    localOptions: LocalOptions = {
      config: {},
      globalConfigIndex: this.globalConfigIndex,
      key: ""
    }
  ): Promise<any> {
    const { config, globalConfigIndex, key } = localOptions;
    return this.request(
      "GET",
      uri,
      data,
      config || {},
      globalConfigIndex || this.globalConfigIndex,
      key || ""
    );
  }

  /**
   * 发起post请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public post(
    uri: string,
    data: ResquestData = "",
    localOptions: LocalOptions = {
      config: {},
      globalConfigIndex: this.globalConfigIndex,
      key: ""
    }
  ): Promise<any> {
    const { config, globalConfigIndex, key } = localOptions;
    return this.request(
      "POST",
      uri,
      data,
      config || {},
      globalConfigIndex || this.globalConfigIndex,
      key || ""
    );
  }

  /**
   * 发起put请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public put(
    uri: string,
    data: ResquestData = "",
    localOptions: LocalOptions = {
      config: {},
      globalConfigIndex: this.globalConfigIndex,
      key: ""
    }
  ): Promise<any> {
    const { config, globalConfigIndex, key } = localOptions;
    return this.request(
      "PUT",
      uri,
      data,
      config || {},
      globalConfigIndex || this.globalConfigIndex,
      key || ""
    );
  }

  /**
   * 发起delete请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public delete(
    uri: string,
    data: ResquestData = "",
    localOptions: LocalOptions = {
      config: {},
      globalConfigIndex: this.globalConfigIndex,
      key: ""
    }
  ): Promise<any> {
    const { config, globalConfigIndex, key } = localOptions;
    return this.request(
      "DELETE",
      uri,
      data,
      config || {},
      globalConfigIndex || this.globalConfigIndex,
      key || ""
    );
  }

  /**
   * 发起trace请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public trace(
    uri: string,
    data: ResquestData = "",
    localOptions: LocalOptions = {
      config: {},
      globalConfigIndex: this.globalConfigIndex,
      key: ""
    }
  ): Promise<any> {
    const { config, globalConfigIndex, key } = localOptions;
    return this.request(
      "TRACE",
      uri,
      data,
      config || {},
      globalConfigIndex || this.globalConfigIndex,
      key || ""
    );
  }

  /**
   * 发起connect请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public connect(
    uri: string,
    data: ResquestData = "",
    localOptions: LocalOptions = {
      config: {},
      globalConfigIndex: this.globalConfigIndex,
      key: ""
    }
  ): Promise<any> {
    const { config, globalConfigIndex, key } = localOptions;
    return this.request(
      "CONNECT",
      uri,
      data,
      config || {},
      globalConfigIndex || this.globalConfigIndex,
      key || ""
    );
  }

  /**
   * 发起options请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public options(
    uri: string,
    data: ResquestData = "",
    localOptions: LocalOptions = {
      config: {},
      globalConfigIndex: this.globalConfigIndex,
      key: ""
    }
  ): Promise<any> {
    const { config, globalConfigIndex, key } = localOptions;
    return this.request(
      "OPTIONS",
      uri,
      data,
      config || {},
      globalConfigIndex || this.globalConfigIndex,
      key || ""
    );
  }

  /**
   * 配置检查
   * @param config 局部配置
   * @param globalConfigIndex 全局配置索引
   * @return 全局配置与自定义配置合并后的对象 和 深拷贝的全局配置
   */
  private configCheck(config: LocalConfig, globalConfigIndex: number) {
    const { globalConfig: globalConfigList } = this;
    // 判断是否设置全局配置
    if (globalConfigList.length === 0)
      throw new Error("至少设置一组全局配置，请调用setGlobalConfig进行全局配置");

    // 配置索引越界报错
    if (globalConfigIndex > globalConfigList.length - 1)
      throw new Error("无法找到当前索引下的配置，请检查配置数组");

    if (!Judge.isUndefined(config.data)) throw new Error("自定义配置中不可传入data");

    // 深拷贝全局配置 防止引用窜改
    const globalConfig = cloneDeep(globalConfigList[globalConfigIndex]);

    // 全局配置与自定义配置合并
    return [merge(globalConfig, config), globalConfig];
  }

  /**
   * 请求拦截器处理
   * @param mergeConfig 合并后的配置
   */
  private async reqInterceptorHandle(mergeConfig: MergeConfig) {
    const { interceptorList } = this;

    // 第一次进入缓存响应拦截函数
    for (let i = 0; i < interceptorList.length; i++) {
      const returnValue = interceptorList[i](mergeConfig, this.addInterceptorFinal);
      if (Judge.isPromise(returnValue)) {
        try {
          // 必过
          await returnValue;
        } catch (error) {
          this.interceptorFinalList.forEach(final => final());
          return Promise.reject(error);
        }
      } else if (Judge.isFunction(returnValue)) {
        !this.isCacheInterceptorResList && this.interceptorResList.unshift(returnValue);
      }
      continue;
    }

    this.isCacheInterceptorResList = true;
  }

  /**
   * 响应拦截器处理
   * @param response 响应数据
   * @param reject promise错误处理函数
   */
  private async resInterceptorHandle(response: any, reject: (reason?: any) => void) {
    const { interceptorResList } = this;
    for (let i = 0; i < interceptorResList.length; i++) {
      const returnValue = interceptorResList[i](response);
      if (Judge.isPromise(returnValue)) {
        try {
          // 必过
          await returnValue;
        } catch (error) {
          this.interceptorFinalList.forEach(final => final());
          return reject(error);
        }
      } else if (Judge.isUndefined(returnValue)) {
        continue;
      } else {
        // 修稿响应值
        response = returnValue;
      }
    }
    return response;
  }

  /**
   *
   * @param method 请求方法
   * @param uri 请求标识符
   * @param data 请求数据
   * @param config 局部配置
   * @param globalConfigIndex 全局配置索引
   * @param key 为该请求命名
   */
  private async request(
    method: RequestMethod,
    uri: string,
    data: ResquestData,
    config: LocalConfig,
    globalConfigIndex: number,
    key: string
  ) {
    const [mergeConfig, globalConfig] = this.configCheck(config, globalConfigIndex);

    await this.reqInterceptorHandle(mergeConfig);

    const globalData = globalConfig.data;
    let _data: ResquestData;

    // 同时存在 判断是否都是对象 是对象就合并
    if (globalData && data) {
      if (Judge.isObject(globalData) && Judge.isObject(data)) {
        _data = merge(globalConfig.data, data);
      }
    } else {
      _data = globalData || data || "";
    }

    const { baseUrl, header, dataType, responseType, timeout, sslVerify } = mergeConfig;

    return new Promise((resolve, reject) => {
      const requestTask = uni.request({
        url: this.mergeUrl(baseUrl, uri),
        method,
        data: _data,
        header: header || {},
        dataType: dataType || "json",
        responseType: responseType || "text",
        timeout: timeout || 3000,
        sslVerify: sslVerify || true,
        success: async res => {
          const response = await this.resInterceptorHandle(res, reject);
          this.interceptorFinalList.forEach(final => final());
          resolve(response);
        },
        fail: error => {
          this.interceptorFinalList.forEach(final => final());
          reject(error);
        }
      } as RequestOptions);
      key && (this.requestTaskList[key] = requestTask);
    });
  }

  public async uploadFiles(
    uri: string,
    options: UploadFileOptions = {
      filePath: [],
      formData: "",
      fileType: "",
      name: "file"
    },
    localOptions: LocalOptions = {
      config: {},
      globalConfigIndex: this.globalConfigIndex,
      key: ""
    }
  ) {
    const { formData, filePath, name, fileType } = options;

    if (!Judge.isArray(filePath)) throw new Error("文件路径必须为数组");

    if (filePath.length === 0) throw new Error("文件数组不能为空");

    const { config, globalConfigIndex, key } = localOptions;
    const [mergeConfig, globalConfig] = this.configCheck(
      config || {},
      globalConfigIndex || this.globalConfigIndex
    );
    await this.reqInterceptorHandle(mergeConfig);

    const globalData = globalConfig.data;
    let _data: ResquestData;
    // 同时存在 判断是否都是对象 是对象就合并
    if (globalData && formData) {
      if (Judge.isObject(globalData) && Judge.isObject(formData)) {
        _data = merge(globalConfig.data, formData);
      }
    } else {
      _data = globalData || formData || {};
    }

    const { baseUrl, header } = mergeConfig;

    const promiseList = [];

    const uploadTaskList: any = [];

    for (let i = 0; i < filePath.length; i++) {
      const p = new Promise((resolve, reject) => {
        const uploadTask = uni.uploadFile({
          url: this.mergeUrl(baseUrl, uri),
          filePath: filePath[i],
          name: name || "file",
          fileType: fileType || "",
          header,
          formData: _data,
          success: async res => {
            const response = await this.resInterceptorHandle(res, reject);
            this.interceptorFinalList.forEach(final => final());
            resolve(response);
          },
          fail: error => {
            this.interceptorFinalList.forEach(final => final());
            reject(error);
          }
        } as UploadFileOption);
        uploadTaskList.push(uploadTask);
      });
      promiseList.push(p);
    }
    key && (this.requestTaskList[key] = uploadTaskList);

    return await Promise.all(promiseList);
  }

  /**
   * 设置默认使用的配置
   * @param index 配置在数组中的索引
   */
  public setDefaultConfigIndex(index: number): void {
    if (!Judge.isNumber(index))
      throw new Error("setDefaultConfigIndex必须传入数字，并且与全局配置组索引相对应");
    this.globalConfigIndex = index;
  }

  /**
   * 获取请求对象
   * @param key 请求名称
   */
  public getRequestTask(key: string) {
    return this.requestTaskList[key];
  }

  /**
   * 合成最终请求路径
   * @param baseUrl 服务器地址
   * @param uri 请求标识符
   */
  private mergeUrl(baseUrl: string, uri: string): string {
    return baseUrl + uri;
  }

  /**
   * 添加拦截器
   * @param interceptorList 拦截器函数数组
   */
  public addInterceptor(interceptorList: interceptor[]) {
    if (!Judge.isArray(interceptorList)) throw new Error("addInterceptor必须传入数组");
    interceptorList.forEach((interceptor, index) => {
      if (!Judge.isFunction(interceptor))
        throw new Error(`addInterceptor传入的函数中，第${index + 1}个不是函数`);
      this.interceptorList.push(interceptor);
    });
  }

  /**
   * 添加最终执行函数
   * @param interceptorFinal 拦截器函数数
   */
  private addInterceptorFinal = (interceptorFinal: interceptorFinal) => {
    if (!Judge.isFunction(interceptorFinal)) throw new Error("interceptorFinal必须传入函数");
    this.interceptorFinalList.unshift(interceptorFinal);
  };
}

/**
 * 发送请求携带的数据
 * @tips 5+App（自定义组件编译模式）不支持ArrayBuffer类型
 */
type ResquestData = string | object | ArrayBuffer;

/**
 * 请求方法
 */
type RequestMethod = "OPTIONS" | "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT";

/**
 * 拦截器函数
 */
type interceptor = (
  config: MergeConfig,
  addInterceptorFinal: Function
) => Promise<any> | Function | boolean | void;

/**
 * 最终执行函数
 */
export type interceptorFinal = () => void;

/**
 * 全局配置项
 */
interface GlobalConfig extends CommonConfig {
  /**
   * 开发者服务器接口地址
   */
  baseUrl: string;
  data?: ResquestData;
}

/**
 * 合并配置项
 */
export interface MergeConfig extends GlobalConfig {
  [propName: string]: any;
}

// 局部配置
interface LocalConfig extends CommonConfig {
  /**
   * 开发者服务器接口地址
   */
  baseUrl?: string;
  data?: undefined;
}

/**
 * 局部配置项
 */
interface LocalOptions {
  config?: LocalConfig;
  /**
   * 全局配置索引
   */
  globalConfigIndex?: number;
  /**
   * 请求名称
   */
  key?: string;
}

/**
 * 公共配置项
 */
interface CommonConfig {
  /**
   * 设置请求的 header，header 中不能设置 Referer。
   */
  header?: any;
  /**
   * 如果设为json，会尝试对返回的数据做一次 JSON.parse
   */
  dataType?: string;
  /**
   * 设置响应的数据类型。合法值：text、arraybuffer
   */
  responseType?: string;
  /**
   * 超时时间，单位 ms
   * @tips 仅支付宝小程序
   */
  timeout?: number;
  /**
   * 验证 ssl 证书
   * @tips 	仅5+App安卓端支持（HBuilderX 2.3.3+）
   */
  sslVerify?: boolean;
}

interface UploadFileOptions {
  /**
   * @tips 仅支付宝小程序，且必填。
   */
  fileType?: "" | "image" | "video" | "audio";
  /**
   * 要上传文件资源的路径组
   */
  filePath: string[];
  /**
   * 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
   */
  name: string;
  /**
   * HTTP 请求中其他额外的 form data
   */
  formData: "" | object;
}
