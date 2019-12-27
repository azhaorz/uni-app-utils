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

const PromiseType = "[object Promise]";
const FunctionType = "[object Function]";
// const StringType = "[object String]";
const ObjectType = "[object Object]";
// const ArrayBufferType = "[object ArrayBuffer]";
const UndefinedType = "[object Undefined]";
// const BooleanType = "[object Boolean]";

export default class Request {
  /**
   * Request实例
   */
  static instance: Request;
  /**
   * 全局配置组
   */
  private globalConfig: GlobalConfig[];
  /**
   * 全局配置索引
   */
  private globalConfigIndex = 0;
  /**
   * 拦截器组
   */
  private interceptorList: interceptor[] = [];
  /**
   * 请求对象列表
   */
  private requestTaskList = {};

  private constructor() {

  }

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
    if (!Array.isArray(globalConfig)) throw new Error("setGlobalConfig必须传入数组")
    this.globalConfig = globalConfig;
  }

  /**
   * 发起get请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public get(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("GET", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  }

  /**
   * 发起post请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public post(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("POST", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  }

  /**
   * 发起put请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public put(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("PUT", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  }

  /**
   * 发起delete请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public delete(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("DELETE", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  }

  /**
   * 发起trace请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public trace(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("TRACE", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  }

  /**
   * 发起connect请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public connect(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("CONNECT", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  }

  /**
   * 发起options请求
   * @param uri 请求标识符
   * @param data 请求数据
   * @param options 局部配置选项
   */
  public options(uri: string, data: ResquestData = "", localOptions: LocalOptions = {}): Promise<any> {
    const { config, globalConfigIndex, name } = localOptions;
    return this.request("OPTIONS", uri, data, config || {}, globalConfigIndex || this.globalConfigIndex, name || "");
  }
    
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
    // 如果存在配置数组 索引越界报错
    if (!globalConfigList)
      throw new Error("调用setGlobalConfig进行全局配置");

    // 配置索引越界报错
    if (globalConfigIndex > globalConfigList.length - 1)
      throw new Error("无法找到当前索引下的配置，请检查配置数组");

    if (this.getType(config.data) !== UndefinedType)
      throw new Error("自定义配置中不可传入data，请在请求的第二个参数中传入需要的data");
      
    // 深拷贝全局配置 防止引用窜改
    let globalConfig = cloneDeep(globalConfigList[globalConfigIndex]);

    // 全局配置与自定义配置合并
    const mergeConfig = merge(globalConfig, config);

    const interceptorResList = [];

    for (let i = 0; i < interceptorList.length; i ++) {
      const returnValue = interceptorList[i](mergeConfig);
      const type = this.getType(returnValue);
      if (type === PromiseType) {
        try {
          await returnValue;
        } catch (error) {
          return Promise.reject(error);
        }
      } else if (returnValue === false) {
        continue;
      } else if (type === FunctionType) {
        interceptorResList.unshift(returnValue);
      }
    };
    
    const globalData = globalConfig.data;
    let _data: ResquestData;

    // 同时存在 判断是否都是对象 是对象就合并
    if (globalData && data) {
      if (this.getType(globalConfig.data) === ObjectType && this.getType(data) === ObjectType) {
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
        success: async (res) => {
          for (let i = 0; i < interceptorResList.length; i ++) {
            const returnValue = interceptorResList[i](res);
            const type = this.getType(returnValue);
            if (type === PromiseType) {
              try {
                await returnValue;
              } catch (error) {
                return reject(error);
              }
            } else if (returnValue === false) {
              continue;
            }
          };
          resolve(res);
        },
        fail: (error) => {
          reject(error);
        }
      });
      if (name) {
        this.requestTaskList[name] = requestTask;
      }
    });
  }

  /**
   * 设置默认使用的配置
   * @param index 配置在数组中的索引
   */
  public setDefaultConfigIndex(index: number): void {
    this.globalConfigIndex = index;
  }

  /**
   * 获取请求对象
   * @param name 请求名称
   */
  public getRequestTask(name: string) {
    return this.requestTaskList[name];
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
    interceptorList.forEach(interceptor => {
      this.interceptorList.push(interceptor);
    });
  }
  
  /**
   * 获取值的类型
   * @param value 任意类型
   * @return 类型字符串
   */
  private getType(value: any): string {
    return Object.prototype.toString.call(value);
  }
};

/**
 * 发送请求携带的数据
 * @tips 5+App（自定义组件编译模式）不支持ArrayBuffer类型
 */
type ResquestData = string | object | ArrayBuffer

/**
 * 请求方法
 */
type RequestMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT';

/**
 * 拦截器函数
 */
type interceptor = (config: MergeConfig) => Promise<any> | Function | boolean | void

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
interface MergeConfig extends GlobalConfig {}

interface LocalConfig extends CommonConfig {
  /**
   * 开发者服务器接口地址
   */
  baseUrl?: string;
  data?: ResquestData;
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
  name?: string;
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

/**
 * uni实例
 */
declare const uni: Uni;

declare class Uni {
  /**
   * 发起 HTTPS 网络请求
   * @param options
   * @see https://uniapp.dcloud.io/api/request/request?id=request
   */
  request(options?: RequestOptions): RequestTask;
}

interface RequestOptions {
  /**
   * 开发者服务器接口地址
   * 
   */
  url: string;
  /**
   * 请求的参数
   * @tips 5+App（自定义组件编译模式）不支持ArrayBuffer类型
   */
  data?: string | object | ArrayBuffer;
  /**
   * 设置请求的 header，header 中不能设置 Referer。
   */
  header?: any;
  /**
   * 默认为 GET
   * 可以是：OPTIONS，GET，HEAD，POST，PUT，DELETE，TRACE，CONNECT
   */
  method?: 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT';
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
  /**
   * 成功返回的回调函数
   */
  success?: (result: RequestSuccessCallbackResult) => void;
  /**
   * 失败的回调函数
   */
  fail?: (result: GeneralCallbackResult) => void;
  /**
   * 结束的回调函数（调用成功、失败都会执行）
   */
  complete?: (result: GeneralCallbackResult) => void;
}

interface RequestSuccessCallbackResult {
  /**
   * 开发者服务器返回的数据
   */
  data?: string;
  /**
   * 开发者服务器返回的 HTTP 状态码
   */
  statusCode?: number;
  /**
   * 开发者服务器返回的 HTTP Response Header
   */
  header?: any;
}

interface GeneralCallbackResult {
  /**
   * 错误信息
   */
  errMsg?: string;
}

interface RequestTask {
  /**
   * 中断请求任务
   */
  abort(): void;
}