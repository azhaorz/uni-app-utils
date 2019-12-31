import { MergeConfig } from "../utils/Request";
import Judge from "../utils/Judge";
import Tip from '../utils/Tip';

class Interceptors {
  /**
   * 是否在config中设置了isLoading字段
   */
  private static isSetIsLoadingField = false;

  public static loadingInterceptor(config: MergeConfig, addInterceptorFinal: Function): void {
    addInterceptorFinal(() => {
      config.isLoading && Tip.hideLoading();
    });
    if (!Interceptors.isSetIsLoadingField && !Judge.isBoolean(config.isLoading)) throw new Error(
      `请在全局配置(config)中设置isLoading字段，只能为boolean类型。参考如下：
      request.setGlobalConfig([
        {
          baseUrl: "***",
          ...,
          isLoading: true
        }
      ]);
      `
    );
    Interceptors.isSetIsLoadingField = true;
    config.isLoading && Tip.showLoading();
  }
};

export const loadingInterceptor = Interceptors.loadingInterceptor;
