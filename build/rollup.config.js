/*
 * @Github:
 * @Descripttion: uni app request util
 * @Version: v1.0.0
 * @Author: 吴汉钊
 * @Date: 2019-12-25 10:48:01
 * @LastEditors  : Hanzhaorz
 * @LastEditTime : 2019-12-27 14:26:43
 */
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import clear from "rollup-plugin-clear";
import filesize from "rollup-plugin-filesize";
import minify from "rollup-plugin-babel-minify";

export default {
  input: "./src/main.ts",
  output: [
    // {
    //   file: "dist/bundle.esm.js",
    //   format: "es",
    //   sourcemap: true
    // }
    {
      format: "cjs",
      file: "dist/bundle.cjs.js",
      sourcemap: true
    }
  ],
  plugins: [
    clear({
      targets: ["./dist"],
      watch: true
    }),
    typescript(),
    resolve(),
    commonjs(),
    minify({
      comments: false
    }),
    filesize()
  ]
};
