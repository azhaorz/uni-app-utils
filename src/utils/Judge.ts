export default class Judge {
  private constructor() {};

  // private static judgeType(value: any): string {
  //   return Object.prototype.toString.call(value);
  // };

  public static isNumber(value: any): boolean {
    return typeof value === "number"; 
  };

  public static isNumberObject(value: any): boolean {
    return value instanceof Number;
  };

  public static isBoolean(value: any): boolean {
    return typeof value === "boolean"; 
  };

  public static isBooleanObject(value: any): boolean {
    return value instanceof Boolean;
  };

  public static isString(value: any): boolean {
    return typeof value === "string";
  };

  public static isStringObject(value: any): boolean {
    return value instanceof String;
  };

  public static isFunction(value: any): boolean {
    return typeof value === "function";
  };

  public static isObject(value: any): boolean {
    return Object.prototype.toString.call(value) === "[object Object]";
  };

  public static isObjectObject(value: any): boolean {
    return typeof value === "object";
  };

  public static isUndefined(value: any): boolean {
    return typeof value === "undefined"; 
  };

  public static isArray(value: any): boolean {
    return value instanceof Array;
  };

  public static isPromise(value: any): boolean {
    return value instanceof Promise;
  };

  public static isArrayBuffer(value: any): boolean {
    return value instanceof ArrayBuffer;
  };
};
