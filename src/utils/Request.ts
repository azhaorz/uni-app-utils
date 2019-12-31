/*
 * @Github: https://github.com/HanZhaorz/uni-app-utils
 * @Descripttion: uni app utils
 * @Version: v1.0.0
 * @Author: Hanzhaorz
 * @Date: 2019-12-24 16:43:45
 * @LastEditors  : Hanzhaorz
 * @LastEditTime : 2019-12-27 16:19:03
 */

import cloneDeep from "lodash/cloneDeep";
import merge from "lodash/merge";
import Judge from './Judge';

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
   * 拦截器一定会执行的函数组
   */
  private interceptorFinalList: Function[] = [];
  /**
   * 请求对象列表
   */
  private requestTaskList = {};

  private constructor() {};

  /**
   * 创建Request实例
   */
  static getInstance(): Request {
    if (!this.instance) this.instance = new Request();
    return this.instance;
  };

  /**
   * 设置全局配置
   * @tips 如果传入数组，设置多个全局变量。默认使用索引为0的配置
   * @tips 如果传入对象 只设置一个全局变量
   * @param globalConfig 全局配置赌对象或数组
   */
  public setGlobalConfig(globalConfig: GlobalConfig[]): void {
    if (!Judge.isArray(globalConfig)) throw new Error("setGlobalConfig必须传入数组")
    this.globalConfig = globalConfig;
  };

  /**
   * 发起get请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public get(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("GET", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  };

  /**
   * 发起post请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public post(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("POST", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  };

  /**
   * 发起put请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public put(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("PUT", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  };

  /**
   * 发起delete请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public delete(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("DELETE", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  };

  /**
   * 发起trace请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public trace(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("TRACE", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  };

  /**
   * 发起connect请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public connect(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("CONNECT", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  };

  /**
   * 发起options请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public options(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("OPTIONS", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  };

  // public uploadFile(globalConfigIndex = 0): UploadTask {
  //   const { globalConfig: globalConfigList } = this;
  //   globalConfigList[globalConfigIndex]
  //   return uni.uploadFile({
  //     url: "https://mt.starli.com.cn/?r=api/maotai/user/identification-card",
  //     filePath: tempFilePaths[0],
  //     name: "file",
  //     formData: {
  //       "side": type
  //     }
  //   });
  // }
  
  /**
   * 
   * @param method 请求方法
   * @param uri 请求标识符
   * @param data 请求数据
   * @param config 局部配置
   * @param globalConfigIndex 全局配置索引
   * @param name 为该请求命名
   */
  private async request(
    method: RequestMethod,
    uri: string, 
    data: ResquestData,
    config: LocalConfig,
    globalConfigIndex: number,
    name: string
  ) {
    const { globalConfig: globalConfigList, interceptorList } = this;
    // 判断是否设置全局配置
    if (globalConfigList.length === 0)
      throw new Error("至少设置一组全局配置，请调用setGlobalConfig进行全局配置");

    // 配置索引越界报错
    if (globalConfigIndex > globalConfigList.length - 1)
      throw new Error("无法找到当前索引下的配置，请检查配置数组");

    if (!Judge.isUndefined(config.data))
      throw new Error("自定义配置中不可传入data，请在请求的第二个参数中传入需要的data");
      
    // 深拷贝全局配置 防止引用窜改
    let globalConfig = cloneDeep(globalConfigList[globalConfigIndex]);

    // 全局配置与自定义配置合并
    const mergeConfig = merge(globalConfig, config);

    const interceptorResList = [];

    for (let i = 0; i < interceptorList.length; i ++) {
      const returnValue = interceptorList[i](mergeConfig, this.addInterceptorFinal);
      if (Judge.isPromise(returnValue)) {
        try {
          // 必过
          await returnValue;
        } catch (error) {
          this.interceptorFinalList.forEach(final => final());
          return Promise.reject(error);
        }
      } else if (returnValue === false) {
        continue;
      } else if (Judge.isFunction(returnValue)) {
        interceptorResList.unshift(returnValue);
      }
    };
    
    const globalData = globalConfig.data;
    let _data: ResquestData;

    // 同时存在 判断是否都是对象 是对象就合并
    if (globalData && data) {
      if (Judge.isObject(globalData) && Judge.isObject(data)) {
        _data = merge(globalConfig.data, data);
      }
    } else {
      _data = globalData || data || "";
    };

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
        success: async (res) => {
          for (let i = 0; i < interceptorResList.length; i ++) {
            const returnValue = interceptorResList[i](res);
            if (Judge.isPromise(returnValue)) {
              try {
                // 必过
                await returnValue;
              } catch (error) {
                this.interceptorFinalList.forEach(final => final());
                return reject(error);
              }
            } else if (returnValue === false) {
              continue;
            };
          };
          this.interceptorFinalList.forEach(final => final());
          resolve(res);
        },
        fail: (error) => {
          this.interceptorFinalList.forEach(final => final());
          reject(error);
        }
      } as RequestOptions);
      name && (this.requestTaskList[name] = requestTask);
    });
  };

  /**
   * 设置默认使用的配置
   * @param index 配置在数组中的索引
   */
  public setDefaultConfigIndex(index: number): void {
    if (!Judge.isNumber(index)) throw new Error("setDefaultConfigIndex必须传入数字，并且与全局配置组索引相对应");
    this.globalConfigIndex = index;
  };

  /**
   * 获取请求对象
   * @param name 请求名称
   */
  public getRequestTask(name: string) {
    return this.requestTaskList[name];
  };
  
  /**
   * 合成最终请求路径
   * @param baseUrl 服务器地址
   * @param uri 请求标识符
   */
  private mergeUrl(baseUrl: string, uri: string): string {
    return baseUrl + uri;
  };
  
  /**
   * 添加拦截器
   * @param interceptorList 拦截器函数数组
   */
  public addInterceptor(interceptorList: interceptor[]) {
    if (!Judge.isArray(interceptorList)) throw new Error("addInterceptor必须传入数组");
    interceptorList.forEach((interceptor, index) => {
      if (!Judge.isFunction(interceptor)) throw new Error(`addInterceptor传入的函数中，第${ index + 1 }个不是函数`);
      this.interceptorList.push(interceptor);
    });
  };

  /**
   * 添加最终执行函数
   * @param interceptorFinal 拦截器函数数
   */
  private addInterceptorFinal = (interceptorFinal: interceptorFinal) => {
    if (!Judge.isFunction(interceptorFinal)) throw new Error("interceptorFinal必须传入函数");
    this.interceptorFinalList.unshift(interceptorFinal);
  };
};

/**
 * 发送请求携带的数据
 * @tips 5+App（自定义组件编译模式）不支持ArrayBuffer类型
 */
type ResquestData = string | object | ArrayBuffer;

/**
 * 请求方法
 */
type RequestMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT';

/**
 * 拦截器函数
 */
type interceptor = (config: MergeConfig, addInterceptorFinal: Function) => Promise<any> | Function | boolean | void;

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
};

/**
 * 合并配置项
 */
export interface MergeConfig extends GlobalConfig {
  [propName: string]: any;
};

// 局部配置
interface LocalConfig extends CommonConfig {
  /**
   * 开发者服务器接口地址
   */
  baseUrl?: string;
  data?: undefined;
};

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
  name?: string;
};

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
};
