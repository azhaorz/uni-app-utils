/**
 * 提示与加载工具类
 */
export default class Tip {
  private static isLoadingPage = false;
  private static isLoadingNavbar = false;
  private static successIcon = "";
  private static cancelColor = "";
  private static confirmColor = "";

  /**
   * 消息提示
   * @param title 消息内容
   * @param duration 延迟时间(毫秒)
   * @return Promise 延迟后执行
   */
  public static toast(title: string, duration = 1500): Promise<void> {
    uni.showToast({
      title,
      icon: "none",
      mask: true,
      duration
    });
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * 成功提示
   * @param title 消息内容
   * @param duration 延迟时间(毫秒)
   * @return Promise 延迟后执行
   */
  static success(title: string, duration = 1500): Promise<void> {
    uni.showToast({
      title: title,
      icon: "success",
      image: Tip.successIcon,
      mask: true,
      duration
    });
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * 加载提示
   * @param title 消息内容
   * @param type 加载提示类型 page或navbar
   */
  public static showLoading(title = "", type: "page" | "navbar" = "page"): void {
    if (type === "page" && !Tip.isLoadingPage) {
      Tip.isLoadingPage = true;
      return uni.showLoading({
        title: title,
        mask: true
      });
    } else if (type === "navbar" && !Tip.isLoadingNavbar) {
      Tip.isLoadingNavbar = true;
      return uni.showNavigationBarLoading();
    }
    if (type !== "page" && type !== "navbar") throw new Error("第二个参数必须是page或nabbar");
  }

  /**
   * 加载完毕
   */
  static hideLoading(): void {
    if (Tip.isLoadingPage) {
      Tip.isLoadingPage = false;
      return uni.hideLoading();
    } else if (Tip.isLoadingNavbar) {
      Tip.isLoadingNavbar = false;
      return uni.hideNavigationBarLoading();
    }
  }

  /**
   * 两个按钮的提示窗
   * @param content 提示内容
   * @param title 提示标题
   * @param confirmText 确定按钮文字
   * @param cancelText 取消按钮文字
   */
  public static double(
    content: string,
    title = "提示",
    confirmText = "确定",
    cancelText = "取消"
  ): any {
    return uni.showModal({
      title,
      content,
      confirmText,
      cancelText,
      confirmColor: Tip.confirmColor,
      cancelColor: Tip.cancelColor
    });
  }

  /**
   * 一个按钮的提示窗
   * @param content 弹窗内容
   * @param title 弹窗标题
   * @param confirmText 确认按钮文字
   */
  public static single(content: string, title = "提示", confirmText = "知道了"): any {
    return uni.showModal({
      title,
      content,
      confirmText,
      showCancel: false,
      confirmColor: Tip.confirmColor
    });
  }

  /**
   * 设置取消按钮颜色
   * @param value 颜色值
   */
  public static setCancelColor(value: string) {
    Tip.cancelColor = value;
  }

  /**
   * 设置确认按钮值
   * @param value 颜色值
   */
  public static setConfirmColor(value: string) {
    Tip.confirmColor = value;
  }
}
