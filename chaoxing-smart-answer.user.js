// ==UserScript==
// @name         超星智答 · 学习通自动答题助手（题库+AI双引擎）
// @namespace    https://github.com/YOUR_GITHUB_NAME/chaoxing-smart-answer
// @version      2.2.0
// @author       YOUR_NAME（基于 shushoujiu 的「超星学习通满分助手」二次开发）
// @description  超星学习通自动答题：6大题库并行 + AI 作答，自动注入课程名/章节/大题语境；答完多库投票复核；章节任务点、作业、考试、讨论全自动；内置接口日志面板与暂停开关。
// @homepageURL  https://github.com/YOUR_GITHUB_NAME/chaoxing-smart-answer
// @supportURL   https://github.com/YOUR_GITHUB_NAME/chaoxing-smart-answer/issues
// @license      MIT
// @icon         https://vitejs.dev/logo.svg
// @match        *://*.chaoxing.com/*
// @match        *://*.edu.cn/*
// @match        *://*.nbdlib.cn/*
// @match        *://*.hnsyu.net/*
// @match        *://*.gdhkmooc.com/*
// @require      https://cdn.staticfile.org/vue/3.3.4/vue.global.prod.js
// @require      https://cdn.staticfile.org/vue-demi/0.14.0/index.iife.min.js
// @require      https://cdn.staticfile.org/element-plus-icons-vue/2.1.0/global.iife.min.js
// @require      data:application/javascript,window.Vue%3DVue%3B
// @require      https://cdn.staticfile.org/pinia/2.1.6/pinia.iife.prod.js
// @require      https://cdn.staticfile.org/element-plus/2.3.12/index.full.min.js
// @require      https://cdn.staticfile.org/blueimp-md5/2.19.0/js/md5.min.js
// @require      https://cdn.staticfile.org/jquery/3.7.1/jquery.min.js
// @resource     element-plus  https://cdn.staticfile.org/element-plus/2.3.12/index.css
// @resource     ttf           https://www.forestpolice.org/ttf/2.0/table.json
// @connect      cx.icodef.com
// @connect      tk.enncy.cn
// @connect      api.muketool.com
// @connect      api.tikuhai.com
// @connect      api.deepseek.com
// @connect      api.zaizhexue.top
// @connect      app.datam.site
// @connect      localhost
// @connect      127.0.0.1
// @connect      *
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-end
// @antifeature  payment  脚本可选接入第三方付费题库（不填密钥则完全不使用）
// @downloadURL  https://raw.githubusercontent.com/YOUR_GITHUB_NAME/chaoxing-smart-answer/main/chaoxing-smart-answer.user.js
// @updateURL    https://raw.githubusercontent.com/YOUR_GITHUB_NAME/chaoxing-smart-answer/main/chaoxing-smart-answer.user.js
// ==/UserScript==
// ==/UserScript==

(t=>{if(typeof GM_addStyle=="function"){GM_addStyle(t);return}const i=document.createElement("style");i.textContent=t,document.head.append(i)})(" .dialog-footer button[data-v-6ed29f7f]:first-child{margin-right:10px}#csbutton[data-v-6ed29f7f]{position:fixed;bottom:20px;right:20px;z-index:99999}#zeokdjg[data-v-c3c6b09f]{position:fixed;left:10px;bottom:50vh;z-index:9999}.question_btn[data-v-c3c6b09f]{width:40px;height:40px;border-radius:5px;margin:5px}.question_div[data-v-c3c6b09f]{height:200px}.question_ti[data-v-c3c6b09f]{margin:10px 0 20px}.cx_log[data-v-c3c6b09f]{margin:2px 0}.status_log[data-v-c3c6b09f]{margin-top:10px}.dialog-footer button[data-v-c3c6b09f]:first-child{margin-right:10px}#csbutton[data-v-c3c6b09f]{position:fixed;bottom:20px;right:20px;z-index:99999} ");

(async function (vue, pinia$1, ElementPlus, md5, $$1) {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  ((e) => {
    const t = GM_getResourceText(e);
    GM_addStyle(t);
  })("element-plus");
  var _GM_getResourceText = (() => "undefined" != typeof GM_getResourceText ? GM_getResourceText : void 0)(), _GM_getValue = (() => "undefined" != typeof GM_getValue ? GM_getValue : void 0)(), _GM_info = (() => "undefined" != typeof GM_info ? GM_info : void 0)(), _GM_setValue = (() => "undefined" != typeof GM_setValue ? GM_setValue : void 0)(), _GM_xmlhttpRequest = (() => "undefined" != typeof GM_xmlhttpRequest ? GM_xmlhttpRequest : void 0)(), _unsafeWindow = (() => "undefined" != typeof unsafeWindow ? unsafeWindow : void 0)();
  const getConfig = () => {
    let config = _GM_getValue("config");
    if (!config) return defaultConfig$1;
    config = { ...defaultConfig$1, ...config };
    if (config.deepseekEnabled && !config.aiEnabled) {
      config.aiEnabled = true;
      config.aiApiKey = config.deepseekKey || "";
      config.aiApiUrl = "https://api.deepseek.com/v1/chat/completions";
      config.aiModel = config.deepseekModel || "deepseek-reasoner";
      _GM_setValue("config", config);
    }
    return config;
  }, defaultConfig$1 = { debugger: false, autoAnswer: true, autoVideo: true, autoJump: true, redoFinished: true, autoDiscuss: true, autoSubmit: true, thtoken: "", yztoken: "", gptKey: "", gptModel: "gpt-3.5-turbo", gpt: false, gptType: ["0", "1", "2", "3", "4", "5", "6", "7"], interval: 3, answerIntervalMin: 8, answerIntervalMax: 30, submitDelayMin: 20, submitDelayMax: 40, minAccuracy: 0.8, autoExam: true, examEnabled: true, examAutoSubmit: false, verifyAnswers: true, verifyAutoFix: true, hideExam: false, notice: "本脚本仅供学习交流使用，严禁用于商业用途，否则后果自负！", deepseekKey: "", deepseekEnabled: false, deepseekModel: "deepseek-reasoner", customApiUrl: "", customApiKey: "", customApiEnabled: false, aiEnabled: false, aiApiKey: "", aiApiUrl: "https://api.deepseek.com/v1/chat/completions", aiModel: "deepseek-reasoner", aiOnly: false, likeSearch: false, datamBank: true, datamModel: "deepseek-v3.2", zetoken: "bfa28ae86b2c74c55cc7c687a2ca83d7d117dc755d325f2a7a1649c93109d41a9f539426b4f26f8725524c33", bankEnabled: ["tkh", "yzt", "yx", "mkt", "datam", "ze"] }, modelOptionsRef = vue.ref([]), modelPresets = { "https://api.deepseek.com/v1/chat/completions": ["deepseek-chat", "deepseek-reasoner", "deepseek-v4.1-flash", "deepseek-v4-pro", "deepseek-v4-flash"], "https://api.openai.com/v1/chat/completions": ["gpt-6.1-sol", "gpt-6-astra", "gpt-6-sol", "gpt-6-luna", "gpt-5.6-sol", "gpt-5.6-terra"], "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions": ["gemini-4-argon", "gemini-3.8-flash", "gemini-3.7-flash"], "https://qianfan.baidubce.com/v2/chat/completions": ["ernie-5.1", "ernie-5.0", "ernie-x1-turbo", "ernie-4.5-turbo-128k"], "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions": ["qwen3.8-max", "qwen3.8-flash", "qwen3.8-omni-flash"], "https://api.moonshot.cn/v1/chat/completions": ["kimi-k3", "kimi-k2.6"], "https://open.bigmodel.cn/api/paas/v4/chat/completions": ["glm-5.3", "glm-5.3-flash", "glm-5.2"], "https://api.minimaxi.com/v1/chat/completions": ["MiniMax-M3.1-Flash", "MiniMax-M3", "MiniMax-M2.7", "MiniMax-M2.7-highspeed"], "https://token.sensenova.cn/v1/chat/completions": ["sensenova-6.7-flash-lite"], "https://api.xiaomimimo.com/v1/chat/completions": ["mimo-v2.6-pro", "mimo-v2.6-flash", "mimo-v2.5-pro", "mimo-v2.5"], "https://ark.cn-beijing.volces.com/api/v3/chat/completions": ["doubao-seed-2.0-pro", "doubao-seed-2.0-mini", "doubao-seed-2.0-lite", "doubao-seed-1.6"] }, userConfig = [{ name: "base", label: "基础配置", config: [{ name: "interval", label: "通用间隔(秒)", type: "number", value: defaultConfig$1.interval, desc: "通用间隔，用于脚本运行切换" }, { name: "answerIntervalMin", label: "答题间隔最小值(秒)", type: "number", value: defaultConfig$1.answerIntervalMin, desc: "每道题之间的最小等待时间" }, { name: "answerIntervalMax", label: "答题间隔最大值(秒)", type: "number", value: defaultConfig$1.answerIntervalMax, desc: "每道题之间的最大等待时间" }, { name: "submitDelayMin", label: "提交前延迟最小值(秒)", type: "number", value: defaultConfig$1.submitDelayMin, desc: "全部答完题后提交前的最小等待时间" }, { name: "submitDelayMax", label: "提交前延迟最大值(秒)", type: "number", value: defaultConfig$1.submitDelayMax, desc: "全部答完题后提交前的最大等待时间" }, { name: "customApiEnabled", label: "启用自定义题库", type: "switch", value: defaultConfig$1.customApiEnabled, desc: "开启后，自定义题库最优先查询（命中即用），命中不了才走AI/在线题库" }, { name: "customApiUrl", label: "自定义题库地址", type: "input", value: defaultConfig$1.customApiUrl, desc: "POST接口地址，如 http://localhost:8080/api/query（不写 http:// 会自动补全）" }, { name: "customApiKey", label: "自定义题库密钥", type: "input", value: defaultConfig$1.customApiKey, desc: "这里填「自定义题库」或「在线题库(LIKE知识库/datam.site)」的 API 密钥；LIKE 题库会读取此处的密钥，同时以 Bearer 请求头和 key 字段发送" }, { name: "aiEnabled", label: "启用AI自动答题", type: "switch", value: defaultConfig$1.aiEnabled, desc: "开启后，AI优先作答；AI没答上时回退题库（配合'仅AI模式'可完全不查题库）" }, { name: "aiApiUrl", label: "AI服务商/接口地址", type: "select", value: defaultConfig$1.aiApiUrl, options: [{ label: "DeepSeek", value: "https://api.deepseek.com/v1/chat/completions" }, { label: "OpenAI", value: "https://api.openai.com/v1/chat/completions" }, { label: "Google Gemini", value: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions" }, { label: "阿里通义千问", value: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" }, { label: "月之暗面 Kimi", value: "https://api.moonshot.cn/v1/chat/completions" }, { label: "智谱 GLM", value: "https://open.bigmodel.cn/api/paas/v4/chat/completions" }, { label: "百度文心(千帆)", value: "https://qianfan.baidubce.com/v2/chat/completions" }, { label: "字节豆包(方舟)", value: "https://ark.cn-beijing.volces.com/api/v3/chat/completions" }, { label: "MiniMax", value: "https://api.minimaxi.com/v1/chat/completions" }, { label: "商汤日日新", value: "https://token.sensenova.cn/v1/chat/completions" }, { label: "小米 MiMo", value: "https://api.xiaomimimo.com/v1/chat/completions" }], desc: "选择服务商自动带出模型列表；自定义OpenAI兼容地址可直接输入(回车确认)。注：datam.site 属在线题库，已并入题库渠道，不在此选择" }, { name: "aiModel", label: "AI模型名称", type: "select", get options() { return modelOptionsRef.value; }, value: defaultConfig$1.aiModel, desc: "选择服务商自动带出预设模型；点弹窗底部'获取模型列表'可拉取该密钥实际可用的模型；也可手动输入模型名" }, { name: "aiApiKey", label: "AI API密钥", type: "input", value: defaultConfig$1.aiApiKey, desc: "API密钥，填写完请保存再刷新页面" }, { name: "aiOnly", label: "仅AI模式", type: "switch", value: defaultConfig$1.aiOnly, desc: "开启后只用AI答题，完全不查询题库（含自定义题库与在线题库）；AI没答上也不回退" }] }, { name: "chapter", label: "章节配置", config: [{ name: "autoAnswer", label: "自动答题", type: "switch", value: defaultConfig$1.autoAnswer, desc: "开启后，会自动答题" }, { name: "autoVideo", label: "自动视频", type: "switch", value: defaultConfig$1.autoVideo, desc: "开启后，会自动观看视频" }, { name: "autoJump", label: "自动切换", type: "switch", value: defaultConfig$1.autoVideo, desc: "开启后，会自动切换章节" }, { name: "redoFinished", label: "重做已完成任务点", type: "switch", value: defaultConfig$1.redoFinished, desc: "开启后，即使任务点已被标记完成也重新处理一遍（视频/音频已完成的会立刻跳过，耗时很短；文档会重新滚动）；关闭则严格跳过已完成任务点" }, { name: "autoDiscuss", label: "自动完成讨论", type: "switch", value: defaultConfig$1.autoDiscuss, desc: "开启后，遇到讨论题(insertbbs)会用AI生成简短发言并提交；会参考其他同学的观点，语言跟随题目（英文题用英文）。需先启用AI并填密钥" }, { name: "autoSubmit", label: "自动提交", type: "switch", value: defaultConfig$1.autoSubmit, desc: "开启后，会自动提交答案" }, { name: "minAccuracy", label: "最低正确率", type: "input", value: defaultConfig$1.minAccuracy, desc: "不满足最低正确率则不会自动提交答案" }, { name: "verifyAnswers", label: "题库复核答案", type: "switch", value: defaultConfig$1.verifyAnswers, desc: "开启后，答完全部题目会再用题库交叉检查一遍（章节/作业在最后复核，考试因翻页无法回填改为每题填完立即复核）" }, { name: "verifyAutoFix", label: "复核不一致时自动修正", type: "switch", value: defaultConfig$1.verifyAutoFix, desc: "开启后，当两个及以上题库给出的答案与当前填写不一致时，自动改成题库答案" }] }, { name: "exam", label: "作业/考试配置", config: [{ name: "examEnabled", label: "考试自动答题", type: "switch", value: defaultConfig$1.examEnabled, desc: "开启后，自动识别考试/测验作答页并整卷作答；关闭则完全跳过考试页" }, { name: "autoExam", label: "考试自动切换", type: "switch", value: defaultConfig$1.autoExam, desc: "开启后，答完当前题自动点'下一题'继续；关闭则等你手动切换，切到新题后自动作答" }, { name: "examAutoSubmit", label: "考试自动交卷", type: "switch", value: defaultConfig$1.examAutoSubmit, desc: "开启后，全部题目答完自动走整卷预览并点击交卷；交卷不可撤回，谨慎开启" }] }, { name: "banks", label: "在线题库", config: [{ name: "bankEnabled", label: "启用哪些在线题库", type: "checkbox", value: defaultConfig$1.bankEnabled, options: [{ label: "题库海", value: "tkh" }, { label: "一之题库", value: "yzt" }, { label: "言溪题库", value: "yx" }, { label: "muketool", value: "mkt" }, { label: "LIKE知识库(datam.site)", value: "datam" }, { label: "ZE题库(zerror)", value: "ze" }], desc: "勾选后参与答题查询与答案复核；取消勾选即完全不请求该题库。LIKE知识库与ZE题库需在下方填各自密钥" }, { name: "zetoken", label: "ZE题库密钥", type: "input", value: defaultConfig$1.zetoken, desc: "ZError 在线题库的 API Token（在 tiku.zerror.cc 的 我的→题库配置 获取）" }, { name: "datamModel", label: "LIKE题库模型", type: "select", value: defaultConfig$1.datamModel, options: [{ label: "deepseek-v3.2", value: "deepseek-v3.2" }, { label: "deepseek-v3.1", value: "deepseek-v3.1" }, { label: "deepseek-v3", value: "deepseek-v3" }, { label: "glm-4.5", value: "glm-4.5" }, { label: "glm-4.5-air", value: "glm-4.5-air" }, { label: "gemini-2.5-pro", value: "gemini-2.5-pro" }, { label: "gemini-2.5-flash", value: "gemini-2.5-flash" }, { label: "gpt-5", value: "gpt-5" }, { label: "qwen-max", value: "qwen-max" }, { label: "qwen-plus", value: "qwen-plus" }, { label: "qwen-turbo", value: "qwen-turbo" }], desc: "LIKE知识库答题所用模型，可下拉选择或手动输入" }, { name: "likeSearch", label: "LIKE题库·联网搜索", type: "switch", value: defaultConfig$1.likeSearch, desc: "仅对 LIKE知识库(datam.site) 生效；开启后服务端联网检索再作答，更准但更慢、更耗点数" }] }], useformStore = pinia$1.defineStore({ id: "formstore", state: () => ({ forminput: getConfig(), dialogV: false, activeName: "base" }), actions: { saveConfig(forminput) {
    _GM_setValue("config", forminput);
  }, applyModelPresets(url) {
    const key = String(url || "").trim().replace(/\/$/, "");
    const presets = modelPresets[key] || [];
    modelOptionsRef.value = presets.map(function(id) {
      return { label: id, value: id };
    });
  }, fetchModels() {
    return new Promise((resolve) => {
      const cfg = this.forminput;
      const base = (cfg.aiApiUrl || "").trim();
      if (!base) {
        ElementPlus.ElNotification({ title: "提示", message: "请先选择AI服务商或填写API地址，再获取模型列表", type: "warning" });
        return resolve();
      }
      const root = base.replace(/\/chat\/completions\/?$/i, "").replace(/\/$/, "");
      // LIKE知识库(datam.site)：模型列表接口是 /api/v1/query/models
      const isLike = /datam\.site/i.test(root) || /\/api\/v1\/query$/i.test(root);
      const urls = isLike ? [root.replace(/\/api\/v1\/query.*$/i, "").replace(/\/+$/, "") + "/api/v1/query/models"] : [root + "/models"];
      isLike || (/\/v1\//i.test(root) && urls.push(root.replace(/\/v1\//i, "/") + "models"));
      let idx = 0;
      const tryNext = () => {
        if (idx >= urls.length) {
          ElementPlus.ElNotification({ title: "错误", message: "获取模型列表失败，请检查API地址与密钥", type: "error" });
          return resolve();
        }
        const url = urls[idx++];
        console.log("获取模型列表:", url);
        _GM_xmlhttpRequest({ method: "GET", url, headers: { "Authorization": "Bearer " + (cfg.aiApiKey || "") }, timeout: 2e4, onload: (res) => {
          try {
            const data = JSON.parse(res.responseText);
            const list = (data.data || data.models || []).map(function(m) {
              return m.id || m.name;
            }).filter(function(id) {
              return id;
            }).map(function(id) {
              return { label: id, value: id };
            });
            if (list.length > 0) {
              modelOptionsRef.value = list;
              // LIKE知识库：顺带查一次剩余点数
              if (isLike) {
                const balUrl = base.replace(/\/api\/v1\/query.*$/i, "").replace(/\/+$/, "") + "/api/v1/balance";
                _GM_xmlhttpRequest({ method: "GET", url: balUrl, headers: { "Authorization": "Bearer " + (cfg.aiApiKey || "") }, timeout: 15e3, onload: (br) => {
                  let extra = "";
                  try {
                    const bd = JSON.parse(br.responseText);
                    bd && bd.balance != null && (extra = `，剩余点数：${bd.balance}`);
                    console.log("LIKE知识库余额:", bd);
                  } catch (e) {
                  }
                  ElementPlus.ElNotification({ title: "Success", message: `已获取 ${list.length} 个模型，请在"AI模型名称"下拉框选择${extra}`, type: "success" });
                  resolve();
                }, ontimeout: () => {
                  ElementPlus.ElNotification({ title: "Success", message: `已获取 ${list.length} 个模型，请在"AI模型名称"下拉框选择`, type: "success" });
                  resolve();
                }, onerror: () => {
                  ElementPlus.ElNotification({ title: "Success", message: `已获取 ${list.length} 个模型，请在"AI模型名称"下拉框选择`, type: "success" });
                  resolve();
                } });
                return;
              }
              ElementPlus.ElNotification({ title: "Success", message: `已获取 ${list.length} 个模型，请在"AI模型名称"下拉框选择`, type: "success" });
              resolve();
            } else
              idx < urls.length ? tryNext() : (ElementPlus.ElNotification({ title: "提示", message: "接口未返回模型列表: " + String(res.responseText).slice(0, 120), type: "warning" }), resolve());
          } catch (e) {
            idx < urls.length ? tryNext() : (ElementPlus.ElNotification({ title: "错误", message: "模型列表解析失败: " + String(res.responseText).slice(0, 120), type: "error" }), resolve());
          }
        }, ontimeout: () => {
          idx < urls.length ? tryNext() : (ElementPlus.ElNotification({ title: "错误", message: "获取模型列表超时", type: "error" }), resolve());
        }, onerror: (err) => {
          idx < urls.length ? tryNext() : (ElementPlus.ElNotification({ title: "错误", message: "获取模型列表网络错误: " + (err && err.error || "未知"), type: "error" }), resolve());
        } });
      };
      tryNext();
    });
  } } });
  var export_helper_default = (sfc, props) => {
    let target = sfc.__vccOpts || sfc;
    for (let [key, val] of props)
      target[key] = val;
    return target;
  }, aim_vue_vue_type_script_lang_default = { name: "Aim" }, _hoisted_12$1 = { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 1024 1024" }, _hoisted_42 = [vue.createElementVNode("path", { fill: "currentColor", d: "M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768zm0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896z" }, null, -1), vue.createElementVNode("path", { fill: "currentColor", d: "M512 96a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V128a32 32 0 0 1 32-32zm0 576a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V704a32 32 0 0 1 32-32zM96 512a32 32 0 0 1 32-32h192a32 32 0 0 1 0 64H128a32 32 0 0 1-32-32zm576 0a32 32 0 0 1 32-32h192a32 32 0 1 1 0 64H704a32 32 0 0 1-32-32z" }, null, -1)];
  var aim_default = export_helper_default(aim_vue_vue_type_script_lang_default, [["render", function(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("svg", _hoisted_12$1, _hoisted_42);
  }], ["__file", "aim.vue"]]), setting_vue_vue_type_script_lang_default = { name: "Setting" }, _hoisted_1231 = { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 1024 1024" }, _hoisted_3230 = [vue.createElementVNode("path", { fill: "currentColor", d: "M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357.12 357.12 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a351.616 351.616 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357.12 357.12 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294.113 294.113 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293.12 293.12 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294.113 294.113 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288.282 288.282 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293.12 293.12 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a287.616 287.616 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384zm0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256z" }, null, -1)];
  var setting_default = export_helper_default(setting_vue_vue_type_script_lang_default, [["render", function(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("svg", _hoisted_1231, _hoisted_3230);
  }], ["__file", "setting.vue"]]);
  const _sfc_main$1 = vue.defineComponent({ components: {}, setup() {
    const formstoreObj = useformStore(), { forminput, dialogV, activeName } = pinia$1.storeToRefs(formstoreObj), ruleFormRef = vue.ref(), rules = vue.reactive({ interval: [{ required: true, message: "间隔时间不能为空" }, { type: "number", message: "间隔时间必须为数字" }, { validator: (rule, value) => value >= 1 ? Promise.resolve() : Promise.reject("间隔时间必须大于等于1") }], answerInterval: [{ required: true, message: "答题间隔不能为空" }, { type: "number", message: "答题间隔必须为数字" }, { validator: (rule, value) => value >= 1 ? Promise.resolve() : Promise.reject("答题间隔必须大于等于1") }], token: [{ validator: (rule, value) => {
      if (value) {
        return /^[a-zA-Z0-9]{6,}$/.test(value) ? Promise.resolve() : Promise.reject("token格式错误");
      }
      return Promise.resolve();
    } }] });
    vue.watch(() => forminput.value.aiApiUrl, (url) => formstoreObj.applyModelPresets(url), { immediate: true });
    return { dialogV, activeName, ruleFormRef, forminput, rules, submitForm: async (formEl) => {
      formEl && await formEl.validate((valid, fields) => {
        valid && (formstoreObj.saveConfig(forminput.value), ElementPlus.ElNotification({ title: "Success", message: "配置保存成功,请自行刷新页面", type: "success" }), dialogV.value = false);
      });
    }, fetchModels: () => formstoreObj.fetchModels(), userConfig, Setting: setting_default };
  } }), _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props)
      target[key] = val;
    return target;
  }, _hoisted_1$1 = { class: "dialog-footer" };
  const App = _export_sfc(_sfc_main$1, [["render", function(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_el_button = vue.resolveComponent("el-button"), _component_el_switch = vue.resolveComponent("el-switch"), _component_el_input = vue.resolveComponent("el-input"), _component_el_input_number = vue.resolveComponent("el-input-number"), _component_el_option = vue.resolveComponent("el-option"), _component_el_select = vue.resolveComponent("el-select"), _component_el_checkbox = vue.resolveComponent("el-checkbox"), _component_el_checkbox_group = vue.resolveComponent("el-checkbox-group"), _component_el_tooltip = vue.resolveComponent("el-tooltip"), _component_el_form_item = vue.resolveComponent("el-form-item"), _component_el_tab_pane = vue.resolveComponent("el-tab-pane"), _component_el_tabs = vue.resolveComponent("el-tabs"), _component_el_form = vue.resolveComponent("el-form"), _component_el_dialog = vue.resolveComponent("el-dialog");
    return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [vue.createVNode(_component_el_button, { type: "danger", id: "csbutton", icon: _ctx.Setting, circle: "", onClick: _cache[0] || (_cache[0] = ($event) => _ctx.dialogV = !_ctx.dialogV) }, null, 8, ["icon"]), vue.createVNode(_component_el_dialog, { modelValue: _ctx.dialogV, "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.dialogV = $event), title: "💯超星学习通满分助手", width: "30%", modal: false, center: "", draggable: "" }, { footer: vue.withCtx(() => [vue.createElementVNode("span", _hoisted_1$1, [vue.createVNode(_component_el_button, { onClick: _cache[2] || (_cache[2] = ($event) => _ctx.dialogV = false) }, { default: vue.withCtx(() => [vue.createTextVNode("取消")]), _: 1 }), vue.createVNode(_component_el_button, { onClick: _cache[9] || (_cache[9] = ($event) => _ctx.fetchModels()) }, { default: vue.withCtx(() => [vue.createTextVNode("获取模型列表")]), _: 1 }), vue.createVNode(_component_el_button, { type: "primary", onClick: _cache[3] || (_cache[3] = ($event) => _ctx.submitForm(_ctx.ruleFormRef)) }, { default: vue.withCtx(() => [vue.createTextVNode("保存")]), _: 1 })])]), default: vue.withCtx(() => [vue.createVNode(_component_el_form, { ref: "ruleFormRef", rules: _ctx.rules, model: _ctx.forminput, class: "demo-ruleForm" }, { default: vue.withCtx(() => [vue.createVNode(_component_el_tabs, { class: "demo-tabs", modelValue: _ctx.activeName, "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.activeName = $event) }, { default: vue.withCtx(() => [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.userConfig, (item) => (vue.openBlock(), vue.createBlock(_component_el_tab_pane, { key: item.name, label: item.label, name: item.name }, { default: vue.withCtx(() => [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(item.config, (item1) => (vue.openBlock(), vue.createBlock(_component_el_form_item, { label: item1.label, prop: item1.name }, { default: vue.withCtx(() => [vue.createVNode(_component_el_tooltip, { class: "box-item", effect: "dark", content: item1.desc || "", placement: "top" }, { default: vue.withCtx(() => ["switch" === item1.type ? (vue.openBlock(), vue.createBlock(_component_el_switch, { key: 0, modelValue: _ctx.forminput[item1.name], "onUpdate:modelValue": ($event) => _ctx.forminput[item1.name] = $event }, null, 8, ["modelValue", "onUpdate:modelValue"])) : "input" === item1.type ? (vue.openBlock(), vue.createBlock(_component_el_input, { key: 1, modelValue: _ctx.forminput[item1.name], "onUpdate:modelValue": ($event) => _ctx.forminput[item1.name] = $event }, null, 8, ["modelValue", "onUpdate:modelValue"])) : "number" === item1.type ? (vue.openBlock(), vue.createBlock(_component_el_input_number, { key: 2, modelValue: _ctx.forminput[item1.name], "onUpdate:modelValue": ($event) => _ctx.forminput[item1.name] = $event }, null, 8, ["modelValue", "onUpdate:modelValue"])) : "select" === item1.type ? (vue.openBlock(), vue.createBlock(_component_el_select, { key: 3, modelValue: _ctx.forminput[item1.name], "onUpdate:modelValue": ($event) => _ctx.forminput[item1.name] = $event, placeholder: "请选择", filterable: true, allowCreate: true, defaultFirstOption: true, clearable: true }, { default: vue.withCtx(() => [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(item1.options, (item2) => (vue.openBlock(), vue.createBlock(_component_el_option, { key: item2.value, label: item2.label, value: item2.value }, null, 8, ["label", "value"]))), 128))]), _: 2 }, 1032, ["modelValue", "onUpdate:modelValue"])) : "checkbox" === item1.type ? (vue.openBlock(), vue.createBlock(_component_el_checkbox_group, { key: 4, modelValue: _ctx.forminput[item1.name], "onUpdate:modelValue": ($event) => _ctx.forminput[item1.name] = $event }, { default: vue.withCtx(() => [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(item1.options, (item2) => (vue.openBlock(), vue.createBlock(_component_el_checkbox, { key: item2.value, label: item2.value, name: item2.value }, { default: vue.withCtx(() => [vue.createTextVNode(vue.toDisplayString(item2.label), 1)]), _: 2 }, 1032, ["label", "name"]))), 128))]), _: 2 }, 1032, ["modelValue", "onUpdate:modelValue"])) : vue.createCommentVNode("", true)]), _: 2 }, 1032, ["content"])]), _: 2 }, 1032, ["label", "prop"]))), 256))]), _: 2 }, 1032, ["label", "name"]))), 128))]), _: 1 }, 8, ["modelValue"])]), _: 1 }, 8, ["rules", "model"])]), _: 1 }, 8, ["modelValue"])], 64);
  }], ["__scopeId", "data-v-6ed29f7f"]]);
  let defaultConfig = getConfig();
  // ===== 接口日志（可视化）=====
  // 跨 frame 共享单例：作业/考试页的请求由子 iframe 里的脚本发起，日志必须汇总到同一份对象，
  // 否则顶层的日志面板看不到子 frame 的请求。
  const APILog = (function () {
    let shared = null;
    try {
      shared = (window.top && window.top.__mfAPILog) || null;
    } catch (e) {
      shared = null;
    }
    if (shared) return shared;
    const self = {
    items: [],
    listeners: [],
    max: 300,
    push(item) {
      this.items.push(item);
      this.items.length > this.max && this.items.shift();
      this.emit();
      return item;
    },
    done(item) {
      item.t2 = Date.now();
      console.groupCollapsed(`%c📡 [${item.provider}] ${item.ms}ms ${item.state === "ok" ? "✅" : "❌"} ${item.hit ? "命中" : ""}`,
        `color:${item.state === "ok" ? "#4CAF7A" : "#D65A5A"};font-weight:bold`);
      console.log("地址:", item.url);
      console.log("状态:", item.status, "耗时:", item.ms + "ms", item.note || "");
      item.preview && console.log("内容:", item.preview);
      console.groupEnd();
      this.stats && this.stats.refresh();
      this.emit();
    },
    setPreview(item, text) {
      item.preview = String(text || "").replace(/\s+/g, " ").slice(0, 300);
    },
    clear() {
      this.items.length = 0;
      this.emit();
    },
    emit() {
      for (let i = 0; i < this.listeners.length; i++) {
        try {
          this.listeners[i]();
        } catch (e) {
        }
      }
    },
    onChange(fn) {
      this.listeners.push(fn);
    },
    summary() {
      const total = this.items.length;
      const ok = this.items.filter(function(i) {
        return "ok" === i.state;
      }).length;
      const hit = this.items.filter(function(i) {
        return i.hit;
      }).length;
      const ms = this.items.reduce(function(s, i) {
        return s + (i.ms || 0);
      }, 0);
      return { total, ok, hit, avg: total ? Math.round(ms / total) : 0 };
    }
    };
    try {
      window.top && (window.top.__mfAPILog = self);
    } catch (e) {
    }
    try {
      _unsafeWindow.__mfAPILog = self;
    } catch (e) {
    }
    return self;
  })();
  // ===== 暂停控制（跨 frame 共享：按钮在顶层，答题循环可能在子 iframe）=====
  const PauseCtl = (function () {
    let shared = null;
    try {
      shared = (window.top && window.top.__mfPause) || null;
    } catch (e) {
      shared = null;
    }
    if (shared) return shared;
    const self = {
      paused: false,
      listeners: [],
      set(v) {
        const next = !!v;
        if (next === this.paused) return;
        this.paused = next;
        console.log(next ? "⏸ 已暂停自动答题" : "▶ 已继续自动答题");
        for (let i = 0; i < this.listeners.length; i++) {
          try {
            this.listeners[i](next);
          } catch (e) {
          }
        }
      },
      toggle() {
        this.set(!this.paused);
        return this.paused;
      },
      onChange(fn) {
        this.listeners.push(fn);
      },
      // 暂停时挂起，恢复后继续（答题循环里 await 它）
      wait() {
        if (!this.paused) return Promise.resolve();
        return new Promise(function (resolve) {
          const timer = setInterval(function () {
            if (!self.paused) {
              clearInterval(timer);
              resolve();
            }
          }, 300);
        });
      }
    };
    try {
      window.top && (window.top.__mfPause = self);
    } catch (e) {
    }
    return self;
  })();
  // ===== 答案缓存 + 并发去重（同一题干不重复请求）=====
  const AnswerCache = {
    map: new Map(),
    ttl: 30 * 60 * 1e3,
    key(q) {
      return String(q || "").replace(/\s+/g, "").slice(0, 200);
    },
    get(q) {
      const k = this.key(q), hit = this.map.get(k);
      if (!hit) return null;
      if (Date.now() - hit.t > this.ttl) {
        this.map.delete(k);
        return null;
      }
      return hit.v;
    },
    set(q, v) {
      const k = this.key(q);
      this.map.set(k, { t: Date.now(), v });
      this.map.size > 500 && this.map.delete(this.map.keys().next().value);
    },
    clear() {
      this.map.clear();
    }
  };
  const Inflight = {
    map: new Map(),
    run(key, fn) {
      if (this.map.has(key)) return this.map.get(key);
      const p = Promise.resolve().then(fn).finally(() => {
        this.map.delete(key);
      });
      this.map.set(key, p);
      return p;
    }
  };
  class ServerApi {
    constructor(window2 = _unsafeWindow) {
      __publicField(this, "api1", "http://api.tikuhai.com");
      __publicField(this, "api2", "http://cx.icodef.com/wyn-nb?v=4");
      __publicField(this, "api3", "https://tk.enncy.cn/query");
      __publicField(this, "api4", "https://api.muketool.com/cx/v2/query");
      __publicField(this, "windowz", _unsafeWindow);
      this.windowz = window2;
    }
    // ===== 统一请求层：计时 / 超时 / 错误归一 / 日志埋点 =====
    async req(meta, opt) {
      const started = Date.now();
      const item = { t: started, provider: meta.provider || "未知", kind: meta.kind || "api", url: opt.url, method: opt.method || "POST", state: "pending", ms: 0, status: 0, hit: false, note: "" };
      APILog.push(item);
      return new Promise((resolve) => {
        let settled = false;
        const done = (payload) => {
          if (settled) return;
          settled = true;
          item.ms = Date.now() - started;
          item.state = payload.ok ? "ok" : "error";
          item.status = payload.status || 0;
          item.note = payload.note || "";
          payload.ms = item.ms;
          payload.status = item.status;
          payload.__item = item;
          APILog.done(item);
          resolve(payload);
        };
        try {
          _GM_xmlhttpRequest({
            method: opt.method || "POST",
            url: opt.url,
            data: opt.data,
            headers: opt.headers || {},
            timeout: opt.timeout || 2e4,
            onload: (res) => {
              const text = String(res.responseText || "");
              let data = null, jsonOk = true;
              try {
                data = JSON.parse(text);
              } catch (e) {
                jsonOk = false;
              }
              done({ ok: res.status >= 200 && res.status < 400, status: res.status, text, data, jsonOk });
            },
            ontimeout: () => done({ ok: false, status: 0, text: "", data: null, jsonOk: false, note: "超时 " + (opt.timeout || 2e4) + "ms" }),
            onerror: (err) => done({ ok: false, status: 0, text: "", data: null, jsonOk: false, note: "网络错误: " + (err && err.error || "未知") })
          });
        } catch (e) {
          done({ ok: false, status: 0, text: "", data: null, jsonOk: false, note: "请求异常: " + ((e && e.message) || e) });
        }
      });
    }
    async defaultRequest(url, method, data = {}, headers = {}, type = false) {
      var _a;
      return type && (headers = { "Content-Type": "POST" == method ? "application/json" : "text/plain", Referer: this.windowz.location.href, v: _GM_info.script.version, key: defaultConfig.thtoken || "", uid: _unsafeWindow.uid || ((_a = _unsafeWindow == null ? void 0 : _unsafeWindow.getCookie) == null ? void 0 : _a.call(_unsafeWindow, "_uid")) || "", ...headers }), new Promise((resolve, reject) => {
        _GM_xmlhttpRequest({ method, url, data: JSON.stringify(data), headers, timeout: 1e4, onload: (res) => {
          resolve(res);
        }, ontimeout: () => {
          reject("timeout");
        }, onerror: (err) => {
          reject(err);
        } });
      });
    }
    async getAnswer(questionData) {
      defaultConfig = getConfig();
      const payload = { key: defaultConfig.thtoken || "", ...questionData };
      const r = await this.req({ provider: "题库海", kind: "tiku" }, {
        url: `${this.api1}/search`,
        method: "POST",
        data: JSON.stringify(payload),
        headers: { "Content-Type": "application/json", Referer: this.windowz.location.href, v: _GM_info.script.version, key: defaultConfig.thtoken || "" },
        timeout: 12e3
      });
      const out = { form: "题库海", answer: "", raw: "" };
      if (!r.ok || !r.jsonOk) {
        out.raw = r.note || ("HTTP " + r.status);
        APILog.setPreview(r.__item, out.raw);
        return out;
      }
      const d = r.data || {};
      if (-1 === d.code) {
        try {
          this.s2(d.data);
        } catch (e) {
        }
        out.answer = d.msg || "";
      } else {
        const dd = d.data || {};
        out.answer = dd.answer || d.msg || "";
        out.num = dd.num || "";
        out.usenum = dd.usenum || "";
      }
      APILog.setPreview(r.__item, out.answer);
      return out;
    }
    async getAnswer2(questionData) {
      defaultConfig = getConfig();
      const ip = Array.from({ length: 4 }, () => Math.floor(255 * Math.random())).join(".");
      const r = await this.req({ provider: "一之题库", kind: "tiku" }, {
        url: this.api2,
        method: "POST",
        data: JSON.stringify({ question: questionData.question }),
        headers: { "Content-Type": "application/json", Authorization: defaultConfig.yztoken || "", "X-Forwarded-For": ip, "X-Real-IP": ip },
        timeout: 12e3
      });
      const out = { form: "一之题库", answer: "", raw: "" };
      if (!r.ok || !r.jsonOk) {
        out.raw = r.note || ("HTTP " + r.status);
        APILog.setPreview(r.__item, out.raw);
        return out;
      }
      const res = r.data || {};
      if (1 === res.code && "string" === typeof res.data) {
        const data = res.data.replace(/javascript:void\(0\);/g, "").trim().replace(/\n/g, "");
        /叛逆|公众号|李恒雅|一之/.test(data) || (out.answer = data.split("#"));
      } else if (res.code !== 1) {
        out.raw = res.msg || res.message || ("code=" + res.code);
      }
      APILog.setPreview(r.__item, Array.isArray(out.answer) ? out.answer.join(" # ") : out.raw);
      return out;
    }
    async getAnswer3(questionData) {
      defaultConfig = getConfig();
      const r = await this.req({ provider: "言溪题库", kind: "tiku" }, {
        url: this.api3,
        method: "POST",
        data: JSON.stringify({ token: defaultConfig.enncytoken || "", title: questionData.question }),
        headers: { "Content-Type": "application/json" },
        timeout: 12e3
      });
      const out = { form: "言溪题库", answer: "", raw: "" };
      if (!r.ok || !r.jsonOk) {
        out.raw = r.note || ("HTTP " + r.status);
        APILog.setPreview(r.__item, out.raw);
        return out;
      }
      const res = r.data || {};
      out.answer = 1 === res.code && res.data ? res.data.answer || "" : "";
      if (!out.answer) out.raw = res.msg || res.message || ("code=" + res.code);
      APILog.setPreview(r.__item, out.answer || out.raw);
      return out;
    }
    async getAnswer4(questionData) {
      const r = await this.req({ provider: "muketool", kind: "tiku" }, {
        url: this.api4,
        method: "POST",
        data: JSON.stringify({ question: questionData.question, type: parseInt(questionData.type) }),
        headers: { "Content-Type": "application/json" },
        timeout: 12e3
      });
      const out = { form: "free4", answer: "", raw: "" };
      if (!r.ok || !r.jsonOk) {
        out.raw = r.note || ("HTTP " + r.status);
        APILog.setPreview(r.__item, out.raw);
        return out;
      }
      const res = r.data || {};
      if (1 === res.code && "string" === typeof res.data) out.answer = res.data.split("#");
      else if (res.code !== 1) out.raw = res.msg || res.message || ("code=" + res.code);
      APILog.setPreview(r.__item, Array.isArray(out.answer) ? out.answer.join(" # ") : out.raw);
      return out;
    }
    async getAnswer5(questionData) {
      // ZE题库(zerror)：POST /api/query，Bearer 鉴权，返回 {data:{code,data,msg},success}
      defaultConfig = getConfig();
      const token = String(defaultConfig.zetoken || "").trim();
      const typeMap = { "0": "single", "1": "multiple", "2": "completion", "3": "judgement" };
      const opts = (questionData.options || []).map(function(o) {
        return removeHtml(String(o || "")).trim();
      }).filter(function(o) {
        return o.length > 0;
      });
      const payload = {
        v: "2",
        title: questionData.question || "",
        options: opts.join("\n"),
        type: typeMap[String(questionData.type)] || "",
        images: [],
        suggestion_title: "",
        suggestion_options: ""
      };
      const out = { form: "ZE题库", answer: "", raw: "" };
      if (!token) {
        out.raw = "未填写 ZE题库密钥（在线题库页签内填写）";
        return out;
      }
      const r = await this.req({ provider: "ZE题库", kind: "tiku" }, {
        url: "https://api.zaizhexue.top/api/query",
        method: "POST",
        data: JSON.stringify(payload),
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        timeout: 15e3
      });
      if (!r.ok || !r.jsonOk) {
        out.raw = r.note || ("HTTP " + r.status);
        APILog.setPreview(r.__item, out.raw);
        return out;
      }
      const body = r.data || {};
      // 兼容两种层级：{data:{code,data,msg}} 与 {code,data,msg}
      const inner = body.data && "object" === typeof body.data && !Array.isArray(body.data) ? body.data : body;
      const code = inner.code != null ? inner.code : body.code;
      const msg = inner.msg || body.msg || "";
      const raw = inner.data != null ? inner.data : body.data;
      if (0 === code || "0" === String(code) || null == raw || "" === String(raw).trim()) {
        out.raw = msg || ("code=" + code);
        APILog.setPreview(r.__item, "未找到: " + out.raw);
        return out;
      }
      out.answer = Array.isArray(raw) ? raw.map(String) : String(raw).split("#").map(function(s) {
        return s.trim();
      }).filter(Boolean);
      out.raw = msg;
      APILog.setPreview(r.__item, (Array.isArray(out.answer) ? out.answer.join(" # ") : out.answer) + (msg ? " · " + msg : ""));
      return out;
    }
    async getAnswerFromCustomApi(questionData) {
      return new Promise((resolve) => {
        const config = getConfig();
        if (!config.customApiEnabled || !config.customApiUrl) {
          resolve({ form: "自定义题库", answer: "" });
          return;
        }
        // 地址规范化：补协议、去尾部斜杠、修掉常见的 /chat/completions 误填
        let apiUrl = String(config.customApiUrl || "").trim().replace(/\s/g, "");
        if (!/^https?:\/\//i.test(apiUrl)) {
          apiUrl = "http://" + apiUrl;
        }
        if (/^http:\/\/localhost/i.test(apiUrl) || /^http:\/\/127\./i.test(apiUrl)) {
          // 本地服务保持 http，避免 https 握手失败
        }
        const requestData = {
          question: questionData.question,
          type: questionData.type,
          options: questionData.options || [],
          key: config.customApiKey || ""
        };
        console.log("自定义题库请求:", apiUrl, "题型:", questionData.type);
        const parseAnswer = (data) => {
          if (data == null) return "";
          if ("string" === typeof data) return data.trim();
          if (Array.isArray(data)) return data.map((x) => (typeof x === "string" ? x : x && (x.answer || x.text || x.value) || "")).filter(Boolean);
          // data 直接就是字符串/数组（{success:true, data:"A,C"} 这种最常见）
          const inner = data.data;
          if ("string" === typeof inner) return inner.trim();
          if (Array.isArray(inner)) return inner.map((x) => (typeof x === "string" ? x : x && (x.answer || x.text || x.value) || "")).filter(Boolean);
          // 常见包裹：{answer, data:{answer}, result, content, msg}
          const dict = inner && "object" === typeof inner ? inner : data;
          const cand = dict.answer != null ? dict.answer
            : dict.result != null ? dict.result
            : dict.content != null ? dict.content
            : dict.msg != null ? dict.msg
            : data.answer != null ? data.answer
            : data.result != null ? data.result
            : data.content;
          if (cand == null) return "";
          if (Array.isArray(cand)) return cand.map(String);
          if ("object" === typeof cand) return cand.answer != null ? (Array.isArray(cand.answer) ? cand.answer.map(String) : String(cand.answer)) : "";
          return String(cand).trim();
        };
        // 判定是否算“成功”：不再死守 code===1，兼容 200/0/'1'/true/无 code
        const isOk = (data) => {
          if (data == null) return false;
          if ("success" === typeof data.success) return data.success;
          const code = data.code != null ? data.code : data.status != null ? data.status : data.errno;
          if (code == null) return true; // 没有 code 字段，按内容判断
          return ["0", "1", "200", "2000", "true", "ok", "success"].includes(String(code).toLowerCase()) || "" === String(code);
        };
        let done = false;
        const finish = (obj) => {
          if (done) return;
          done = true;
          resolve(obj);
        };
        const doRequest = async (url) => {
          const r = await this.req({ provider: "自定义题库", kind: "tiku" }, {
            url,
            method: "POST",
            data: JSON.stringify(requestData),
            headers: {
              "Content-Type": "application/json",
              ...(config.customApiKey ? { "Authorization": "Bearer " + config.customApiKey } : {})
            },
            timeout: 15e3
          });
          const raw = r.text || "";
          if (!r.ok) {
            // http:// 失败时自动尝试 https://（常见于本地/内网服务配了证书或反代）
            if (/^http:\/\//i.test(url)) {
              console.log("自定义题库改用 https 重试:", url);
              APILog.setPreview(r.__item, "http 失败，重试 https");
              return doRequest(url.replace(/^http:\/\//i, "https://"));
            }
            APILog.setPreview(r.__item, r.note || ("HTTP " + r.status));
            finish({ form: "自定义题库", answer: "", raw: "自定义题库网络错误: " + (r.note || "未知") + "，地址: " + url });
            return;
          }
          let data = null;
          try {
            data = JSON.parse(raw);
          } catch (e) {
            if (/^\s*[A-H](\s*[,，|]\s*[A-H])*\s*$/.test(raw) || raw.trim().length > 0 && raw.trim().length < 200 && !/^\s*</.test(raw)) {
              APILog.setPreview(r.__item, raw.trim());
              finish({ form: "自定义题库", answer: raw.trim() });
              return;
            }
            APILog.setPreview(r.__item, "非JSON: " + raw.slice(0, 160));
            finish({ form: "自定义题库", answer: "", raw: "自定义题库返回非JSON(" + r.status + "): " + raw.slice(0, 160) });
            return;
          }
          if (!isOk(data)) {
            const reason = data && (data.msg || data.message || data.error);
            APILog.setPreview(r.__item, "失败状态: " + (reason || raw.slice(0, 120)));
            finish({ form: "自定义题库", answer: "", raw: "自定义题库返回失败状态: " + (reason || JSON.stringify(data).slice(0, 160)) });
            return;
          }
          const ans = parseAnswer(data);
          if ((Array.isArray(ans) && ans.length > 0) || ("string" === typeof ans && ans.length > 0)) {
            APILog.setPreview(r.__item, Array.isArray(ans) ? ans.join(" # ") : ans);
            finish({ form: "自定义题库", answer: ans });
          } else {
            APILog.setPreview(r.__item, "无答案字段: " + raw.slice(0, 120));
            finish({ form: "自定义题库", answer: "", raw: "自定义题库无答案字段: " + raw.slice(0, 160) });
          }
        };
        doRequest(apiUrl);
      });
    }
    async getAnswerFromLikeApi(questionData) {
      return new Promise(async (resolve) => {
        const config = getConfig();
        // 作为在线题库使用：密钥取「自定义题库密钥」，模型取 LIKE 专用模型配置
        const apiKey = String(config.customApiKey || "").trim();
        if (!apiKey) {
          resolve({ form: "LIKE题库", answer: "", raw: "未填写密钥（请在自定义题库密钥中填入 LIKE知识库 的 API Key）" });
          return;
        }
        const base = "https://app.datam.site/api/v1/query";
        const typeNames = { "0": "单选题", "1": "多选题", "2": "填空题", "3": "判断题", "4": "简答题", "5": "名词解释", "6": "论述题", "7": "计算题" };
        const typeName = typeNames[questionData.type] || "单选题";
        const opts = questionData.options || [];
        const likeCourse = questionData.course || getCourseName();
        const likeChapter = questionData.chapter || getCatalogChapter();
        let query = `【${typeName}】${questionData.section ? "（所属大题：" + questionData.section + "）" : ""}${likeCourse ? "（课程：" + likeCourse + "）" : ""}${likeChapter ? "（章节：" + likeChapter + "）" : ""}${questionData.question}`;
        if (opts.length > 0) {
          query += "\n选项：\n" + opts.map(function(o, i) {
            return String.fromCharCode(65 + i) + ". " + removeHtml(String(o || "")).trim();
          }).join("\n");
        }
        if ("1" === String(questionData.type)) {
          query += "\n（多选题，可能有多个正确选项）";
        } else if (["2", "4", "5", "6", "7"].includes(String(questionData.type))) {
          query += "\n（请直接给出文字答案内容，不需要选项字母）";
        }
        const body = { query, search: !!config.likeSearch, vision: false };
        (config.datamModel || "deepseek-v3.2") && (body.model = config.datamModel || "deepseek-v3.2");
        console.log("LIKE题库请求:", base, "模型:", body.model, "联网:", body.search);
        let done = false;
        const finish = (obj) => {
          if (done) return;
          done = true;
          resolve(obj);
        };
        const r = await this.req({ provider: "LIKE题库", kind: "ai" }, {
          url: base,
          method: "POST",
          data: JSON.stringify(body),
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
          timeout: 9e4
        });
        const raw = r.text || "";
        if (!r.ok) {
          APILog.setPreview(r.__item, r.note || ("HTTP " + r.status));
          finish({ form: "LIKE题库", answer: "", raw: "LIKE接口请求失败: " + (r.note || ("HTTP " + r.status)) });
          return;
        }
        {
          let data = null;
          try {
            data = JSON.parse(raw);
          } catch (e) {
            APILog.setPreview(r.__item, "非JSON: " + raw.slice(0, 160));
            finish({ form: "LIKE题库", answer: "", raw: "LIKE接口返回非JSON(" + r.status + "): " + raw.slice(0, 200) });
            return;
          }
          if (data && (data.error || data.success === false)) {
            const msg = typeof data.error === "string" ? data.error : data.error && (data.error.message || JSON.stringify(data.error)) || data.message;
            APILog.setPreview(r.__item, "报错: " + (msg || raw.slice(0, 120)));
            finish({ form: "LIKE题库", answer: "", raw: "LIKE接口报错: " + (msg || raw.slice(0, 200)) });
            return;
          }
          const qt = String(data.questionType || "").toUpperCase();
          const ans = data.answer || {};
          const conf = "number" === typeof data.confidence ? data.confidence : null;
          let solved = "";
          if ("CHOICE" === qt) {
            const sel = ans.selectedOptions || ans.selected || ans.options;
            if (Array.isArray(sel) && sel.length > 0) {
              solved = sel.map(String);
            } else if (ans.otherText) {
              solved = [String(ans.otherText)];
            }
          } else if ("FILL_IN_BLANK" === qt) {
            if (Array.isArray(ans.blanks) && ans.blanks.length > 0) solved = ans.blanks.map(String);
            else if ("string" === typeof ans.blanks) solved = ans.blanks;
            else if (ans.otherText) solved = [String(ans.otherText)];
          } else if ("JUDGMENT" === qt) {
            const v = ans.isCorrect != null ? ans.isCorrect : ans.correct;
            solved = [v === true || "true" === String(v) || "1" === String(v) ? "正确" : "错误"];
          } else {
            const cand = ans.otherText || ans.text || ans.content || ans.selectedText || data.answer;
            solved = Array.isArray(cand) ? cand.map(String) : "string" === typeof cand ? cand : "";
          }
          const hasAnswer = Array.isArray(solved) ? solved.length > 0 : String(solved || "").trim().length > 0;
          if (!hasAnswer) {
            APILog.setPreview(r.__item, qt ? qt + " 无答案" : "无答案");
            finish({ form: "LIKE题库", answer: "", raw: "LIKE无答案" + (qt ? "(" + qt + ")" : "") + ": " + raw.slice(0, 200) });
            return;
          }
          conf !== null && conf < 0.5 && console.log("LIKE题库置信度较低:", conf);
          APILog.setPreview(r.__item, (qt || "") + " " + (Array.isArray(solved) ? solved.join(" # ") : solved) + (conf !== null ? " (置信度 " + conf + ")" : ""));
          finish({ form: "LIKE题库", answer: solved, conf, raw: conf !== null ? "置信度 " + conf : "" });
        }
      });
    }
    async getAnswerFromAI(questionData) {
      return new Promise((resolve) => {
        let aiItem = null;
        const aiDone = (obj) => {
          if (aiItem) {
            aiItem.ms = aiItem.ms || Date.now() - reqStart;
            aiItem.hit = !!(obj && (Array.isArray(obj.answer) ? obj.answer.length > 0 : String(obj.answer || "").length > 0));
            aiItem.state === "pending" && (aiItem.state = "ok");
            APILog.setPreview(aiItem, aiItem.preview && aiItem.preview.length > 60 ? aiItem.preview : (aiItem.preview || "") + " ⇒ " + (Array.isArray(obj && obj.answer) ? obj.answer.join(" # ") : String((obj && obj.answer) || (obj && obj.raw) || "")));
            APILog.done(aiItem);
          }
          resolve(obj);
        };
        var reqStart = 0;
        const config = getConfig();
        if (!config.aiEnabled || !config.aiApiKey) {
          aiDone({ form: "AI", answer: "" });
          return;
        }
        const questionTypeId = questionData.type;
        let prompt = "";
        const courseName = questionData.course || getCourseName();
        const chapterName = questionData.chapter || getCatalogChapter();
        const courseText = courseName ? `\n本门课程：「${courseName}」，请严格按该课程教材的知识体系与术语作答。` : "";
        const chapterText = chapterName ? `\n当前章节（课程目录）：「${chapterName}」，题目出自该章节，请按该章节所讲内容作答。` : "";
        const sectionText = questionData.section ? `\n本题所属大题/章节：「${questionData.section}」，请结合该大题的语境理解题目，不要脱离大题语境作答。` : "";
        const basePrompt = `你是一位专业的学习辅导老师，具备广泛的知识面，能够解答各类学科和学习问题。注意：本问题来自中国大学课本内容，请依据中国大学教材的知识体系和表述习惯作答。${courseText}${chapterText}${sectionText}`;
        if (questionTypeId === "3") {
          prompt = `${basePrompt}

这是一道判断题，请根据你的专业知识，只返回"正确"或"错误"。

题目：${questionData.question}`;
        } else if (questionTypeId === "1") {
          const optionsText = questionData.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return `${letter}.${opt}`;
          }).join(" ");
          prompt = `${basePrompt}

这是一道多选题，请根据你的专业知识，返回所有正确选项字母(选项范围A-${String.fromCharCode(64 + questionData.options.length)}，如：AB、ACD、BC等)，不要有任何其他内容，不要解释。

题目：${questionData.question}
选项：${optionsText}`;
        } else if (questionTypeId === "2") {
          prompt = `${basePrompt}

这是一道填空题，请根据你的专业知识，直接返回答案内容。如果有多个空，用"|"分隔每个空的答案。

题目：${questionData.question}`;
        } else if (questionTypeId === "4") {
          prompt = `${basePrompt}

这是一道简答题，请根据你的专业知识，给出简洁准确的答案。

题目：${questionData.question}`;
        } else if (questionTypeId === "5") {
          prompt = `${basePrompt}

这是一道名词解释题，请根据你的专业知识，给出准确的名词解释。

题目：${questionData.question}`;
        } else if (questionTypeId === "6") {
          prompt = `${basePrompt}

这是一道论述题，请根据你的专业知识，给出完整、有条理的论述答案。

题目：${questionData.question}`;
        } else if (questionTypeId === "7") {
          prompt = `${basePrompt}

这是一道计算题，请根据你的专业知识，给出计算过程和最终答案。

题目：${questionData.question}`;
        } else {
          const optionsText = questionData.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return `${letter}.${opt}`;
          }).join(" ");
          prompt = `${basePrompt}

这是一道单选题，请根据你的专业知识，只返回正确选项字母(选项范围A-${String.fromCharCode(64 + questionData.options.length)})，不要有任何其他内容，不要解释。

题目：${questionData.question}
选项：${optionsText}`;
        }
        const requestData = {
          model: config.aiModel || "deepseek-reasoner",
          messages: [{ role: "user", content: prompt }]
        };
        var reqStart = Date.now();
        console.log("AI请求发送中...", "模型:", config.aiModel, "题目类型:", questionTypeId === "3" ? "判断题" : questionTypeId === "1" ? "多选题" : "单选题");
        APILog.push({ t: reqStart, provider: "AI", kind: "ai", url: config.aiApiUrl, method: "POST", state: "pending", ms: 0, status: 0, hit: false, note: "model=" + (config.aiModel || "") });
        aiItem = APILog.items[APILog.items.length - 1];
        APILog.setPreview(aiItem, prompt.replace(/\s+/g, " ").slice(0, 200));
        _GM_xmlhttpRequest({
          method: "POST",
          url: config.aiApiUrl,
          data: JSON.stringify(requestData),
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + config.aiApiKey
          },
          timeout: 9e4,
          onload: async (res) => {
            aiItem.ms = Date.now() - reqStart;
            aiItem.status = res.status;
            aiItem.state = res.status >= 200 && res.status < 400 ? "ok" : "error";
            try {
              console.log("AI返回结果:", res.responseText);
              const data = JSON.parse(res.responseText);
              if (data.usage) {
                aiItem.note = "tools in/out: " + (data.usage.prompt_tokens || 0) + "/" + (data.usage.completion_tokens || 0);
              }
              if (data.choices && data.choices[0] && data.choices[0].message && (data.choices[0].message.content || data.choices[0].message.reasoning_content)) {
                const content = (data.choices[0].message.content || data.choices[0].message.reasoning_content || "").trim();
                const typeNames = { "0": "单选题", "1": "多选题", "2": "填空题", "3": "判断题", "4": "简答题", "5": "名词解释", "6": "论述题", "7": "计算题" };
                const typeName = typeNames[questionTypeId] || "单选题";
                if (questionTypeId === "3") {
                  const isTrue = /正确|对|是|√|true/i.test(content);
                  const isFalse = /错误|错|否|×|false/i.test(content);
                  if (isTrue || isFalse) {
                    const answerText = isTrue ? "正确" : "错误";
                    console.log(`AI解析成功(${typeName})，答案:`, answerText);
                    aiDone({ form: "AI", answer: [answerText] });
                  } else {
                    console.log("AI返回内容未匹配到判断结果:", content);
                    aiDone({ form: "AI", answer: "" });
                  }
                } else if (questionTypeId === "1") {
                  const answerLetters = extractAnswerLetters(content);
                  const answerOptions = [];
                  if (answerLetters)
                    for (let letter of answerLetters) {
                      const answerIndex = letter.charCodeAt(0) - 65;
                      answerIndex >= 0 && answerIndex < questionData.options.length && -1 === answerOptions.indexOf(questionData.options[answerIndex]) && answerOptions.push(questionData.options[answerIndex]);
                    }
                  if (0 === answerOptions.length) {
                    console.log("字母解析失败，尝试按选项文本匹配:", content);
                    questionData.options.forEach(function(opt) {
                      opt && content.includes(String(opt).trim()) && -1 === answerOptions.indexOf(opt) && answerOptions.push(opt);
                    });
                  }
                  if (answerOptions.length > 0) {
                    console.log(`AI解析成功(${typeName})，答案:`, answerOptions);
                    aiDone({ form: "AI", answer: answerOptions });
                  } else {
                    console.log("AI返回内容未匹配到选项:", content);
                    aiDone({ form: "AI", answer: "", raw: content });
                  }
                } else if (questionTypeId === "0") {
                  const answerLetters = extractAnswerLetters(content);
                  let answerIndex = -1;
                  if (answerLetters) {
                    const answerLetter = answerLetters[answerLetters.length - 1];
                    answerIndex = answerLetter.charCodeAt(0) - 65;
                  }
                  if (!(answerIndex >= 0 && answerIndex < questionData.options.length)) {
                    console.log("字母解析失败，尝试按选项文本匹配:", content);
                    answerIndex = questionData.options.findIndex(function(opt) {
                      return opt && content.includes(String(opt).trim());
                    });
                  }
                  if (answerIndex >= 0 && answerIndex < questionData.options.length) {
                    console.log(`AI解析成功(${typeName})，答案:`, questionData.options[answerIndex]);
                    aiDone({ form: "AI", answer: [questionData.options[answerIndex]] });
                  } else {
                    console.log("AI返回内容未匹配到选项:", content);
                    aiDone({ form: "AI", answer: "", raw: content });
                  }
                } else {
                  const textAnswers = content.split("|").map(s => s.trim()).filter(s => s.length > 0);
                  if (textAnswers.length > 0) {
                    console.log(`AI解析成功(${typeName})，答案:`, textAnswers);
                    aiDone({ form: "AI", answer: textAnswers });
                  } else if (content.length > 0) {
                    console.log(`AI解析成功(${typeName})，答案:`, content);
                    aiDone({ form: "AI", answer: [content] });
                  } else {
                    console.log("AI返回内容为空");
                    aiDone({ form: "AI", answer: "" });
                  }
                }
              } else {
                console.log("AI返回格式异常:", data);
                const errText = String(res.responseText || "");
                if (!questionData.__modelAutoFixed && /model_not_found|does not exist|model not exists|模型不存在|无可用渠道|invalid model|model_not_available/i.test(errText)) {
                  questionData.__modelAutoFixed = true;
                  const fixed = await this.autoFixModel(config.aiModel);
                  if (fixed && fixed !== config.aiModel) {
                    ElementPlus.ElNotification({ title: "已自动切换模型", message: `模型 ${config.aiModel} 不可用，已切换为 ${fixed} 并重试本题`, type: "warning" });
                    return resolve(await this.getAnswerFromAI(questionData));
                  }
                }
                const hint = /model_not_found|does not exist|model not exists|模型不存在/i.test(errText) ? "（模型不存在：点底部'获取模型列表'拉取可用模型；注意模型名区分大小写，如 glm-5.3 全小写）" : "";
                aiDone({ form: "AI", answer: "", raw: "接口返回格式异常: " + errText.slice(0, 200) + hint });
              }
            } catch (e) {
              console.log("AI解析错误:", e);
              aiDone({ form: "AI", answer: "", raw: "响应解析失败(多为API地址/密钥/模型名错误): " + String(res.responseText).slice(0, 200) });
            }
          },
          ontimeout: () => {
            console.log("AI请求超时");
            aiDone({ form: "AI", answer: "", raw: "AI请求超时(90秒)：模型太慢或网络不通，可换更快的模型" });
          },
          onerror: (err) => {
            console.log("AI请求错误:", err);
            aiDone({ form: "AI", answer: "", raw: "AI网络错误: " + (err && err.error || "未知") + "，检查API地址/密钥" });
          }
        });
      });
    }
    async fetchModelIds() {
      const config = getConfig();
      const base = (config.aiApiUrl || "").trim();
      if (!base)
        return null;
      const root = base.replace(/\/chat\/completions\/?$/i, "").replace(/\/$/, "");
      // LIKE知识库(datam.site)：模型列表接口是 /api/v1/query/models
      const isLike = /datam\.site/i.test(root) || /\/api\/v1\/query$/i.test(root);
      const urls = isLike ? [root.replace(/\/api\/v1\/query.*$/i, "").replace(/\/+$/, "") + "/api/v1/query/models"] : [root + "/models"];
      isLike || (/\/v1\//i.test(root) && urls.push(root.replace(/\/v1\//i, "/") + "models"));
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        try {
          const res = await new Promise((resolve, reject) => {
            _GM_xmlhttpRequest({ method: "GET", url, headers: { "Authorization": "Bearer " + (config.aiApiKey || "") }, timeout: 2e4, onload: (r) => resolve(r), ontimeout: () => reject("timeout"), onerror: (e) => reject(e) });
          });
          const data = JSON.parse(res.responseText);
          const ids = (data.data || data.models || []).map(function(m) {
            return m.id || m.name;
          }).filter(function(id) {
            return id;
          });
          if (ids.length > 0) {
            console.log("拉取到模型列表:", ids);
            return ids;
          }
        } catch (e) {
          console.log("模型列表拉取失败:", url, e);
        }
      }
      return null;
    }
    async autoFixModel(badModel) {
      const config = getConfig();
      const key = String(config.aiApiUrl || "").trim().replace(/\/$/, "");
      const bad = String(badModel || "").trim();
      const presetHit = (modelPresets[key] || []).find(function(id) {
        return String(id).toLowerCase() === bad.toLowerCase();
      });
      if (presetHit && presetHit !== bad) {
        config.aiModel = presetHit, _GM_setValue("config", config);
        console.log(`模型名大小写纠正: ${bad} -> ${presetHit}`);
        return presetHit;
      }
      const ids = await this.fetchModelIds();
      if (ids && ids.length > 0) {
        modelOptionsRef.value = ids.map(function(id) {
          return { label: id, value: id };
        });
        let hit = ids.find(function(id) {
          return String(id).toLowerCase() === bad.toLowerCase();
        });
        if (!hit) {
          const prefix = bad.replace(/[0-9._\-（(].*$/i, "").toLowerCase();
          hit = prefix && ids.find(function(id) {
            return String(id).toLowerCase().startsWith(prefix);
          }) || ids.find(function(id) {
            return /chat|flash|plus|pro|max|turbo|standard/i.test(String(id));
          }) || ids[0];
        }
        if (hit && hit !== bad) {
          config.aiModel = hit, _GM_setValue("config", config);
          console.log(`模型自动切换: ${bad} -> ${hit}`);
          return hit;
        }
      }
      return null;
    }
    async getAnswerForDiscussion(topic, replies, extra = {}) {
      const config = getConfig();
      if (!config.aiEnabled || !config.aiApiKey) return "";
      const rawTopic = String(topic || "");
      // 语言判定：以中英字符数量对比，容忍中文题号"1、"
      const langOf = (t) => {
        const s = String(t || "");
        const cjk = (s.match(/[\u3400-\u4dbf\u4e00-\u9fa5]/g) || []).length;
        const latin = (s.match(/[A-Za-z]/g) || []).length;
        if (latin >= 10 && cjk <= Math.max(1, latin * 0.15)) return "en";
        if (cjk >= 4 && latin <= cjk * 0.6) return "zh";
        return latin > cjk ? "en" : "zh";
      };
      const lang = langOf(rawTopic);
      const isEnglish = "en" === lang;
      const hasCJK = (s) => /[\u3400-\u4dbf\u4e00-\u9fa5]/.test(String(s || ""));
      // 参考回复只保留同语言的，避免中文回复把英文题带跑偏
      const refs = (replies || []).filter(function(r) {
        const rl = langOf(r);
        return rl === lang;
      }).slice(0, 6).map(function(r, i) {
        return `(${i + 1}) ${String(r).replace(/\s+/g, " ").slice(0, 160)}`;
      }).join("\n");

      const buildPrompt = (strict) => {
        if (isEnglish) {
          const head = strict
            ? `Your previous reply was NOT English. This time you MUST answer in ENGLISH ONLY. Any Chinese character is a failure.`
            : `MANDATORY LANGUAGE RULE: The discussion topic is in ENGLISH. Your reply MUST be written in ENGLISH ONLY — no Chinese characters at all.`;
          return `${head}

You are a Chinese university student posting a short reply in a course discussion board.
Write ONE short paragraph (${strict ? "50-110" : "60-120"} words) answering the discussion topic below.

Rules:
1. ENGLISH ONLY. Never use Chinese characters, even for names or terms.
2. One paragraph. No bullet points, no headings, no "First/Second/In conclusion" clichés.
3. Take a clear stance, connect it to the course content, give a concrete example if useful. Do not invent statistics or citations.
4. If reference replies are given, synthesize their ideas in your own words — never copy sentences.
5. Output ONLY the reply text. No quotes, no explanations.

${extra.course ? "Course: " + extra.course + "\n" : ""}${extra.chapter ? "Chapter: " + extra.chapter + "\n" : ""}Discussion topic: ${topic}
${refs ? "Reference replies from classmates:\n" + refs + "\n" : ""}`;
        }
        const head = strict
          ? `你上一段回复没有使用中文。这次必须全部使用中文作答，不得出现英文句子。`
          : `强制语言要求：本题是中文题，回答必须全部使用中文（专业术语可保留英文原词）。`;
        return `${head}

你是一名中国大学生，正在学习通上完成课程讨论。请针对下面的讨论题目写一段简短的发言。

要求：
1. 必须用中文作答。
2. 长度 80-180 字，一段话，不要分点、不要小标题、不要"首先/其次/总而言之"这类套话。
3. 观点明确、贴合课程内容，可适当举例，但不要编造数据和文献。
4. 如果给出了其他同学的观点，请综合他们的角度但不要照抄原句。
5. 只输出发言正文，不要任何解释、前缀或引号。

${extra.course ? "课程：" + extra.course + "\n" : ""}${extra.chapter ? "章节：" + extra.chapter + "\n" : ""}讨论题目：${topic}
${refs ? "其他同学的观点：\n" + refs + "\n" : ""}`;
      };

      const ask = async (prompt, tag) => {
        const r = await this.req({ provider: "AI-讨论" + (tag || ""), kind: "ai" }, {
          url: config.aiApiUrl,
          method: "POST",
          data: JSON.stringify({ model: config.aiModel || "deepseek-chat", messages: [{ role: "user", content: prompt }] }),
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + config.aiApiKey },
          timeout: 9e4
        });
        if (!r.ok) {
          APILog.setPreview(r.__item, "讨论生成失败: " + (r.note || ("HTTP " + r.status)));
          return "";
        }
        const data = r.data || {};
        const content = data && data.choices && data.choices[0] && data.choices[0].message && (data.choices[0].message.content || data.choices[0].message.reasoning_content) || "";
        const text = String(content).trim().replace(/^["“']|["”']$/g, "").replace(/\s+\n/g, "\n").trim();
        APILog.setPreview(r.__item, text.slice(0, 200));
        return text;
      };

      console.log("讨论AI请求:", rawTopic.slice(0, 60), "语言:", lang);
      let text = await ask(buildPrompt(false), "");
      // 语言不符 → 强指令重试一次
      if (text && isEnglish && hasCJK(text)) {
        console.warn("AI用中文回答了英文题，强制重试:", text.slice(0, 60));
        const retry = await ask(buildPrompt(true), "-重试");
        if (retry && !hasCJK(retry)) text = retry;
        else if (retry) text = retry;
      } else if (text && !isEnglish && langOf(text) === "en" && (text.match(/[A-Za-z]/g) || []).length > 40) {
        console.warn("AI用英文回答了中文题，强制重试");
        const retry = await ask(buildPrompt(true), "-重试");
        if (retry) text = retry;
      }
      return text;
    }
    async s(questionList, url) {
      return new Promise(async (resolve) => {
        const ques = { questionList, url };
        await this.defaultRequest(`${this.api1}/save1`, "POST", ques, { "Content-Type": "application/json" }).then((response) => {
          resolve();
        }).catch((e) => {
          resolve();
        });
      });
    }
    async s2(data) {
      data.url && this.defaultRequest(data.url, "GET", null, {}).then(async (response) => {
        const html = response.responseText;
        let document1, questionList, questionListHtml;
        document1 = new DOMParser().parseFromString(html, "text/html"), questionList = document1.getElementsByClassName("Py-mian1"), questionListHtml = [];
        for (let i = 0; i < questionList.length; i++)
          try {
            if (0 === i)
              continue;
            let questionTitle = removeHtml(questionList[i].getElementsByClassName("Py-m1-title")[0].innerHTML), questionType$1 = questionTitle.match(/\[(.*?)\]/)[1];
            if ("单选题" === questionType$1 || "多选题" === questionType$1) {
              questionTitle = questionTitle.replace(/[0-9]{1,3}.\s/gi, "").replace(/(^\s*)|(\s*$)/g, "").replace(/^【.*?】\s*/, "").replace(/\[(.*?)\]\s*/, "").replace(/\s*（\d+\.\d+分）$/, "");
              let optionHtml = $(questionList[i]).find("ul.answerList li.clearfix"), optionText = [];
              optionHtml.each(function(index, item) {
                let abcd = String.fromCharCode(65 + index) + ".", optionTemp = removeHtml(item.innerHTML);
                0 == optionTemp.indexOf(abcd) && (optionTemp = optionTemp.replace(abcd, "").trim()), optionText.push(optionTemp);
              }), questionListHtml.push({ question: questionTitle, type: questionType[questionType$1], options: optionText, questionData: questionList[i].innerHTML });
            }
          } catch (e) {
            continue;
          }
        let postData = { questionList: questionListHtml, url: data.url };
        await this.defaultRequest(data.url1, "POST", postData, {}, true).then().catch();
      }).catch();
    }
  }
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x.default : x;
  }
  var Typr = { parse: function(buff) {
    var bin = Typr._bin, data = new Uint8Array(buff), offset = 0;
    bin.readFixed(data, offset), offset += 4;
    var numTables = bin.readUshort(data, offset);
    offset += 2, bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2;
    for (var tags = ["cmap", "head", "hhea", "maxp", "hmtx", "name", "OS/2", "post", "loca", "glyf", "kern", "CFF ", "GPOS", "GSUB", "SVG "], obj = { _data: data }, tabs = {}, i = 0; i < numTables; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4, bin.readUint(data, offset), offset += 4;
      var toffset = bin.readUint(data, offset);
      offset += 4;
      var length = bin.readUint(data, offset);
      offset += 4, tabs[tag] = { offset: toffset, length };
    }
    for (i = 0; i < tags.length; i++) {
      var t = tags[i];
      tabs[t] && (obj[t.trim()] = Typr[t.trim()].parse(data, tabs[t].offset, tabs[t].length, obj));
    }
    return obj;
  }, _tabOffset: function(data, tab) {
    for (var bin = Typr._bin, numTables = bin.readUshort(data, 4), offset = 12, i = 0; i < numTables; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4, bin.readUint(data, offset), offset += 4;
      var toffset = bin.readUint(data, offset);
      if (offset += 4, bin.readUint(data, offset), offset += 4, tag == tab)
        return toffset;
    }
    return 0;
  } };
  Typr._bin = { readFixed: function(data, o) {
    return (data[o] << 8 | data[o + 1]) + (data[o + 2] << 8 | data[o + 3]) / 65540;
  }, readF2dot14: function(data, o) {
    return Typr._bin.readShort(data, o) / 16384;
  }, readInt: function(buff, p) {
    var a = Typr._bin.t.uint8;
    return a[0] = buff[p + 3], a[1] = buff[p + 2], a[2] = buff[p + 1], a[3] = buff[p], Typr._bin.t.int32[0];
  }, readInt8: function(buff, p) {
    return Typr._bin.t.uint8[0] = buff[p], Typr._bin.t.int8[0];
  }, readShort: function(buff, p) {
    var a = Typr._bin.t.uint8;
    return a[1] = buff[p], a[0] = buff[p + 1], Typr._bin.t.int16[0];
  }, readUshort: function(buff, p) {
    return buff[p] << 8 | buff[p + 1];
  }, readUshorts: function(buff, p, len) {
    for (var arr = [], i = 0; i < len; i++)
      arr.push(Typr._bin.readUshort(buff, p + 2 * i));
    return arr;
  }, readUint: function(buff, p) {
    var a = Typr._bin.t.uint8;
    return a[3] = buff[p], a[2] = buff[p + 1], a[1] = buff[p + 2], a[0] = buff[p + 3], Typr._bin.t.uint32[0];
  }, readUint64: function(buff, p) {
    return 4294967296 * Typr._bin.readUint(buff, p) + Typr._bin.readUint(buff, p + 4);
  }, readASCII: function(buff, p, l) {
    for (var s = "", i = 0; i < l; i++)
      s += String.fromCharCode(buff[p + i]);
    return s;
  }, readUnicode: function(buff, p, l) {
    for (var s = "", i = 0; i < l; i++) {
      var c = buff[p++] << 8 | buff[p++];
      s += String.fromCharCode(c);
    }
    return s;
  }, _tdec: window.TextDecoder ? new window.TextDecoder() : null, readUTF8: function(buff, p, l) {
    var tdec = Typr._bin._tdec;
    return tdec && 0 == p && l == buff.length ? tdec.decode(buff) : Typr._bin.readASCII(buff, p, l);
  }, readBytes: function(buff, p, l) {
    for (var arr = [], i = 0; i < l; i++)
      arr.push(buff[p + i]);
    return arr;
  }, readASCIIArray: function(buff, p, l) {
    for (var s = [], i = 0; i < l; i++)
      s.push(String.fromCharCode(buff[p + i]));
    return s;
  } }, Typr._bin.t = { buff: new ArrayBuffer(8) }, Typr._bin.t.int8 = new Int8Array(Typr._bin.t.buff), Typr._bin.t.uint8 = new Uint8Array(Typr._bin.t.buff), Typr._bin.t.int16 = new Int16Array(Typr._bin.t.buff), Typr._bin.t.uint16 = new Uint16Array(Typr._bin.t.buff), Typr._bin.t.int32 = new Int32Array(Typr._bin.t.buff), Typr._bin.t.uint32 = new Uint32Array(Typr._bin.t.buff), Typr._lctf = {}, Typr._lctf.parse = function(data, offset, length, font, subt) {
    var bin = Typr._bin, obj = {}, offset0 = offset;
    bin.readFixed(data, offset), offset += 4;
    var offScriptList = bin.readUshort(data, offset);
    offset += 2;
    var offFeatureList = bin.readUshort(data, offset);
    offset += 2;
    var offLookupList = bin.readUshort(data, offset);
    return offset += 2, obj.scriptList = Typr._lctf.readScriptList(data, offset0 + offScriptList), obj.featureList = Typr._lctf.readFeatureList(data, offset0 + offFeatureList), obj.lookupList = Typr._lctf.readLookupList(data, offset0 + offLookupList, subt), obj;
  }, Typr._lctf.readLookupList = function(data, offset, subt) {
    var bin = Typr._bin, offset0 = offset, obj = [], count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var noff = bin.readUshort(data, offset);
      offset += 2;
      var lut = Typr._lctf.readLookupTable(data, offset0 + noff, subt);
      obj.push(lut);
    }
    return obj;
  }, Typr._lctf.readLookupTable = function(data, offset, subt) {
    var bin = Typr._bin, offset0 = offset, obj = { tabs: [] };
    obj.ltype = bin.readUshort(data, offset), offset += 2, obj.flag = bin.readUshort(data, offset), offset += 2;
    var cnt = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < cnt; i++) {
      var noff = bin.readUshort(data, offset);
      offset += 2;
      var tab = subt(data, obj.ltype, offset0 + noff);
      obj.tabs.push(tab);
    }
    return obj;
  }, Typr._lctf.numOfOnes = function(n) {
    for (var num = 0, i = 0; i < 32; i++)
      0 != (n >>> i & 1) && num++;
    return num;
  }, Typr._lctf.readClassDef = function(data, offset) {
    var bin = Typr._bin, obj = [], format = bin.readUshort(data, offset);
    if (offset += 2, 1 == format) {
      var startGlyph = bin.readUshort(data, offset);
      offset += 2;
      var glyphCount = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < glyphCount; i++)
        obj.push(startGlyph + i), obj.push(startGlyph + i), obj.push(bin.readUshort(data, offset)), offset += 2;
    }
    if (2 == format) {
      var count = bin.readUshort(data, offset);
      offset += 2;
      for (i = 0; i < count; i++)
        obj.push(bin.readUshort(data, offset)), offset += 2, obj.push(bin.readUshort(data, offset)), offset += 2, obj.push(bin.readUshort(data, offset)), offset += 2;
    }
    return obj;
  }, Typr._lctf.getInterval = function(tab, val) {
    for (var i = 0; i < tab.length; i += 3) {
      var start = tab[i], end = tab[i + 1];
      if (tab[i + 2], start <= val && val <= end)
        return i;
    }
    return -1;
  }, Typr._lctf.readValueRecord = function(data, offset, valFmt) {
    var bin = Typr._bin, arr = [];
    return arr.push(1 & valFmt ? bin.readShort(data, offset) : 0), offset += 1 & valFmt ? 2 : 0, arr.push(2 & valFmt ? bin.readShort(data, offset) : 0), offset += 2 & valFmt ? 2 : 0, arr.push(4 & valFmt ? bin.readShort(data, offset) : 0), offset += 4 & valFmt ? 2 : 0, arr.push(8 & valFmt ? bin.readShort(data, offset) : 0), offset += 8 & valFmt ? 2 : 0, arr;
  }, Typr._lctf.readCoverage = function(data, offset) {
    var bin = Typr._bin, cvg = {};
    cvg.fmt = bin.readUshort(data, offset), offset += 2;
    var count = bin.readUshort(data, offset);
    return offset += 2, 1 == cvg.fmt && (cvg.tab = bin.readUshorts(data, offset, count)), 2 == cvg.fmt && (cvg.tab = bin.readUshorts(data, offset, 3 * count)), cvg;
  }, Typr._lctf.coverageIndex = function(cvg, val) {
    var tab = cvg.tab;
    if (1 == cvg.fmt)
      return tab.indexOf(val);
    if (2 == cvg.fmt) {
      var ind = Typr._lctf.getInterval(tab, val);
      if (-1 != ind)
        return tab[ind + 2] + (val - tab[ind]);
    }
    return -1;
  }, Typr._lctf.readFeatureList = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, obj = [], count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var noff = bin.readUshort(data, offset);
      offset += 2, obj.push({ tag: tag.trim(), tab: Typr._lctf.readFeatureTable(data, offset0 + noff) });
    }
    return obj;
  }, Typr._lctf.readFeatureTable = function(data, offset) {
    var bin = Typr._bin;
    bin.readUshort(data, offset), offset += 2;
    var lookupCount = bin.readUshort(data, offset);
    offset += 2;
    for (var indices = [], i = 0; i < lookupCount; i++)
      indices.push(bin.readUshort(data, offset + 2 * i));
    return indices;
  }, Typr._lctf.readScriptList = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, obj = {}, count = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < count; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var noff = bin.readUshort(data, offset);
      offset += 2, obj[tag.trim()] = Typr._lctf.readScriptTable(data, offset0 + noff);
    }
    return obj;
  }, Typr._lctf.readScriptTable = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, obj = {}, defLangSysOff = bin.readUshort(data, offset);
    offset += 2, obj.default = Typr._lctf.readLangSysTable(data, offset0 + defLangSysOff);
    var langSysCount = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < langSysCount; i++) {
      var tag = bin.readASCII(data, offset, 4);
      offset += 4;
      var langSysOff = bin.readUshort(data, offset);
      offset += 2, obj[tag.trim()] = Typr._lctf.readLangSysTable(data, offset0 + langSysOff);
    }
    return obj;
  }, Typr._lctf.readLangSysTable = function(data, offset) {
    var bin = Typr._bin, obj = {};
    bin.readUshort(data, offset), offset += 2, obj.reqFeature = bin.readUshort(data, offset), offset += 2;
    var featureCount = bin.readUshort(data, offset);
    return offset += 2, obj.features = bin.readUshorts(data, offset, featureCount), obj;
  }, Typr.CFF = {}, Typr.CFF.parse = function(data, offset, length) {
    var bin = Typr._bin;
    (data = new Uint8Array(data.buffer, offset, length))[offset = 0], data[++offset], data[++offset], data[++offset], offset++;
    var ninds = [];
    offset = Typr.CFF.readIndex(data, offset, ninds);
    for (var names = [], i = 0; i < ninds.length - 1; i++)
      names.push(bin.readASCII(data, offset + ninds[i], ninds[i + 1] - ninds[i]));
    offset += ninds[ninds.length - 1];
    var tdinds = [];
    offset = Typr.CFF.readIndex(data, offset, tdinds);
    var topDicts = [];
    for (i = 0; i < tdinds.length - 1; i++)
      topDicts.push(Typr.CFF.readDict(data, offset + tdinds[i], offset + tdinds[i + 1]));
    offset += tdinds[tdinds.length - 1];
    var topdict = topDicts[0], sinds = [];
    offset = Typr.CFF.readIndex(data, offset, sinds);
    var strings = [];
    for (i = 0; i < sinds.length - 1; i++)
      strings.push(bin.readASCII(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
    if (offset += sinds[sinds.length - 1], Typr.CFF.readSubrs(data, offset, topdict), topdict.CharStrings) {
      offset = topdict.CharStrings;
      sinds = [];
      offset = Typr.CFF.readIndex(data, offset, sinds);
      var cstr = [];
      for (i = 0; i < sinds.length - 1; i++)
        cstr.push(bin.readBytes(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
      topdict.CharStrings = cstr;
    }
    topdict.Encoding && (topdict.Encoding = Typr.CFF.readEncoding(data, topdict.Encoding, topdict.CharStrings.length)), topdict.charset && (topdict.charset = Typr.CFF.readCharset(data, topdict.charset, topdict.CharStrings.length)), topdict.Private && (offset = topdict.Private[1], topdict.Private = Typr.CFF.readDict(data, offset, offset + topdict.Private[0]), topdict.Private.Subrs && Typr.CFF.readSubrs(data, offset + topdict.Private.Subrs, topdict.Private));
    var obj = {};
    for (var p in topdict)
      -1 != ["FamilyName", "FullName", "Notice", "version", "Copyright"].indexOf(p) ? obj[p] = strings[topdict[p] - 426 + 35] : obj[p] = topdict[p];
    return obj;
  }, Typr.CFF.readSubrs = function(data, offset, obj) {
    var bin = Typr._bin, gsubinds = [];
    offset = Typr.CFF.readIndex(data, offset, gsubinds);
    var bias, nSubrs = gsubinds.length;
    bias = nSubrs < 1240 ? 107 : nSubrs < 33900 ? 1131 : 32768, obj.Bias = bias, obj.Subrs = [];
    for (var i = 0; i < gsubinds.length - 1; i++)
      obj.Subrs.push(bin.readBytes(data, offset + gsubinds[i], gsubinds[i + 1] - gsubinds[i]));
  }, Typr.CFF.tableSE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 0, 111, 112, 113, 114, 0, 115, 116, 117, 118, 119, 120, 121, 122, 0, 123, 0, 124, 125, 126, 127, 128, 129, 130, 131, 0, 132, 133, 0, 134, 135, 136, 137, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 138, 0, 139, 0, 0, 0, 0, 140, 141, 142, 143, 0, 0, 0, 0, 0, 144, 0, 0, 0, 145, 0, 0, 146, 147, 148, 149, 0, 0, 0, 0], Typr.CFF.glyphByUnicode = function(cff, code) {
    for (var i = 0; i < cff.charset.length; i++)
      if (cff.charset[i] == code)
        return i;
    return -1;
  }, Typr.CFF.glyphBySE = function(cff, charcode) {
    return charcode < 0 || charcode > 255 ? -1 : Typr.CFF.glyphByUnicode(cff, Typr.CFF.tableSE[charcode]);
  }, Typr.CFF.readEncoding = function(data, offset, num) {
    Typr._bin;
    var array = [".notdef"], format = data[offset];
    if (offset++, 0 != format)
      throw "error: unknown encoding format: " + format;
    var nCodes = data[offset];
    offset++;
    for (var i = 0; i < nCodes; i++)
      array.push(data[offset + i]);
    return array;
  }, Typr.CFF.readCharset = function(data, offset, num) {
    var bin = Typr._bin, charset = [".notdef"], format = data[offset];
    if (offset++, 0 == format)
      for (var i = 0; i < num; i++) {
        var first = bin.readUshort(data, offset);
        offset += 2, charset.push(first);
      }
    else {
      if (1 != format && 2 != format)
        throw "error: format: " + format;
      for (; charset.length < num; ) {
        first = bin.readUshort(data, offset);
        offset += 2;
        var nLeft = 0;
        1 == format ? (nLeft = data[offset], offset++) : (nLeft = bin.readUshort(data, offset), offset += 2);
        for (i = 0; i <= nLeft; i++)
          charset.push(first), first++;
      }
    }
    return charset;
  }, Typr.CFF.readIndex = function(data, offset, inds) {
    var bin = Typr._bin, count = bin.readUshort(data, offset), offsize = data[offset += 2];
    if (offset++, 1 == offsize)
      for (var i = 0; i < count + 1; i++)
        inds.push(data[offset + i]);
    else if (2 == offsize)
      for (i = 0; i < count + 1; i++)
        inds.push(bin.readUshort(data, offset + 2 * i));
    else if (3 == offsize)
      for (i = 0; i < count + 1; i++)
        inds.push(16777215 & bin.readUint(data, offset + 3 * i - 1));
    else if (0 != count)
      throw "unsupported offset size: " + offsize + ", count: " + count;
    return (offset += (count + 1) * offsize) - 1;
  }, Typr.CFF.getCharString = function(data, offset, o) {
    var bin = Typr._bin, b0 = data[offset], b1 = data[offset + 1];
    data[offset + 2], data[offset + 3], data[offset + 4];
    var vs = 1, op = null, val = null;
    b0 <= 20 && (op = b0, vs = 1), 12 == b0 && (op = 100 * b0 + b1, vs = 2), 21 <= b0 && b0 <= 27 && (op = b0, vs = 1), 28 == b0 && (val = bin.readShort(data, offset + 1), vs = 3), 29 <= b0 && b0 <= 31 && (op = b0, vs = 1), 32 <= b0 && b0 <= 246 && (val = b0 - 139, vs = 1), 247 <= b0 && b0 <= 250 && (val = 256 * (b0 - 247) + b1 + 108, vs = 2), 251 <= b0 && b0 <= 254 && (val = 256 * -(b0 - 251) - b1 - 108, vs = 2), 255 == b0 && (val = bin.readInt(data, offset + 1) / 65535, vs = 5), o.val = null != val ? val : "o" + op, o.size = vs;
  }, Typr.CFF.readCharString = function(data, offset, length) {
    for (var end = offset + length, bin = Typr._bin, arr = []; offset < end; ) {
      var b0 = data[offset], b1 = data[offset + 1];
      data[offset + 2], data[offset + 3], data[offset + 4];
      var vs = 1, op = null, val = null;
      b0 <= 20 && (op = b0, vs = 1), 12 == b0 && (op = 100 * b0 + b1, vs = 2), 19 != b0 && 20 != b0 || (op = b0, vs = 2), 21 <= b0 && b0 <= 27 && (op = b0, vs = 1), 28 == b0 && (val = bin.readShort(data, offset + 1), vs = 3), 29 <= b0 && b0 <= 31 && (op = b0, vs = 1), 32 <= b0 && b0 <= 246 && (val = b0 - 139, vs = 1), 247 <= b0 && b0 <= 250 && (val = 256 * (b0 - 247) + b1 + 108, vs = 2), 251 <= b0 && b0 <= 254 && (val = 256 * -(b0 - 251) - b1 - 108, vs = 2), 255 == b0 && (val = bin.readInt(data, offset + 1) / 65535, vs = 5), arr.push(null != val ? val : "o" + op), offset += vs;
    }
    return arr;
  }, Typr.CFF.readDict = function(data, offset, end) {
    for (var bin = Typr._bin, dict = {}, carr = []; offset < end; ) {
      var b0 = data[offset], b1 = data[offset + 1];
      data[offset + 2], data[offset + 3], data[offset + 4];
      var vs = 1, key = null, val = null;
      if (28 == b0 && (val = bin.readShort(data, offset + 1), vs = 3), 29 == b0 && (val = bin.readInt(data, offset + 1), vs = 5), 32 <= b0 && b0 <= 246 && (val = b0 - 139, vs = 1), 247 <= b0 && b0 <= 250 && (val = 256 * (b0 - 247) + b1 + 108, vs = 2), 251 <= b0 && b0 <= 254 && (val = 256 * -(b0 - 251) - b1 - 108, vs = 2), 255 == b0)
        throw val = bin.readInt(data, offset + 1) / 65535, vs = 5, "unknown number";
      if (30 == b0) {
        var nibs = [];
        for (vs = 1; ; ) {
          var b = data[offset + vs];
          vs++;
          var nib0 = b >> 4, nib1 = 15 & b;
          if (15 != nib0 && nibs.push(nib0), 15 != nib1 && nibs.push(nib1), 15 == nib1)
            break;
        }
        for (var s = "", chars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ".", "e", "e-", "reserved", "-", "endOfNumber"], i = 0; i < nibs.length; i++)
          s += chars[nibs[i]];
        val = parseFloat(s);
      }
      if (b0 <= 21) {
        if (key = ["version", "Notice", "FullName", "FamilyName", "Weight", "FontBBox", "BlueValues", "OtherBlues", "FamilyBlues", "FamilyOtherBlues", "StdHW", "StdVW", "escape", "UniqueID", "XUID", "charset", "Encoding", "CharStrings", "Private", "Subrs", "defaultWidthX", "nominalWidthX"][b0], vs = 1, 12 == b0)
          key = ["Copyright", "isFixedPitch", "ItalicAngle", "UnderlinePosition", "UnderlineThickness", "PaintType", "CharstringType", "FontMatrix", "StrokeWidth", "BlueScale", "BlueShift", "BlueFuzz", "StemSnapH", "StemSnapV", "ForceBold", 0, 0, "LanguageGroup", "ExpansionFactor", "initialRandomSeed", "SyntheticBase", "PostScript", "BaseFontName", "BaseFontBlend", 0, 0, 0, 0, 0, 0, "ROS", "CIDFontVersion", "CIDFontRevision", "CIDFontType", "CIDCount", "UIDBase", "FDArray", "FDSelect", "FontName"][b1], vs = 2;
      }
      null != key ? (dict[key] = 1 == carr.length ? carr[0] : carr, carr = []) : carr.push(val), offset += vs;
    }
    return dict;
  }, Typr.cmap = {}, Typr.cmap.parse = function(data, offset, length) {
    data = new Uint8Array(data.buffer, offset, length), offset = 0;
    var bin = Typr._bin, obj = {};
    bin.readUshort(data, offset), offset += 2;
    var numTables = bin.readUshort(data, offset);
    offset += 2;
    var offs = [];
    obj.tables = [];
    for (var i = 0; i < numTables; i++) {
      var platformID = bin.readUshort(data, offset);
      offset += 2;
      var encodingID = bin.readUshort(data, offset);
      offset += 2;
      var noffset = bin.readUint(data, offset);
      offset += 4;
      var id = "p" + platformID + "e" + encodingID, tind = offs.indexOf(noffset);
      if (-1 == tind) {
        var subt;
        tind = obj.tables.length, offs.push(noffset);
        var format = bin.readUshort(data, noffset);
        0 == format ? subt = Typr.cmap.parse0(data, noffset) : 4 == format ? subt = Typr.cmap.parse4(data, noffset) : 6 == format ? subt = Typr.cmap.parse6(data, noffset) : 12 == format ? subt = Typr.cmap.parse12(data, noffset) : console.log("unknown format: " + format, platformID, encodingID, noffset), obj.tables.push(subt);
      }
      if (null != obj[id])
        throw "multiple tables for one platform+encoding";
      obj[id] = tind;
    }
    return obj;
  }, Typr.cmap.parse0 = function(data, offset) {
    var bin = Typr._bin, obj = {};
    obj.format = bin.readUshort(data, offset), offset += 2;
    var len = bin.readUshort(data, offset);
    offset += 2, bin.readUshort(data, offset), offset += 2, obj.map = [];
    for (var i = 0; i < len - 6; i++)
      obj.map.push(data[offset + i]);
    return obj;
  }, Typr.cmap.parse4 = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, obj = {};
    obj.format = bin.readUshort(data, offset), offset += 2;
    var length = bin.readUshort(data, offset);
    offset += 2, bin.readUshort(data, offset), offset += 2;
    var segCountX2 = bin.readUshort(data, offset);
    offset += 2;
    var segCount = segCountX2 / 2;
    obj.searchRange = bin.readUshort(data, offset), offset += 2, obj.entrySelector = bin.readUshort(data, offset), offset += 2, obj.rangeShift = bin.readUshort(data, offset), offset += 2, obj.endCount = bin.readUshorts(data, offset, segCount), offset += 2 * segCount, offset += 2, obj.startCount = bin.readUshorts(data, offset, segCount), offset += 2 * segCount, obj.idDelta = [];
    for (var i = 0; i < segCount; i++)
      obj.idDelta.push(bin.readShort(data, offset)), offset += 2;
    for (obj.idRangeOffset = bin.readUshorts(data, offset, segCount), offset += 2 * segCount, obj.glyphIdArray = []; offset < offset0 + length; )
      obj.glyphIdArray.push(bin.readUshort(data, offset)), offset += 2;
    return obj;
  }, Typr.cmap.parse6 = function(data, offset) {
    var bin = Typr._bin, obj = {};
    obj.format = bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2, obj.firstCode = bin.readUshort(data, offset), offset += 2;
    var entryCount = bin.readUshort(data, offset);
    offset += 2, obj.glyphIdArray = [];
    for (var i = 0; i < entryCount; i++)
      obj.glyphIdArray.push(bin.readUshort(data, offset)), offset += 2;
    return obj;
  }, Typr.cmap.parse12 = function(data, offset) {
    var bin = Typr._bin, obj = {};
    obj.format = bin.readUshort(data, offset), offset += 2, offset += 2, bin.readUint(data, offset), offset += 4, bin.readUint(data, offset), offset += 4;
    var nGroups = bin.readUint(data, offset);
    offset += 4, obj.groups = [];
    for (var i = 0; i < nGroups; i++) {
      var off = offset + 12 * i, startCharCode = bin.readUint(data, off + 0), endCharCode = bin.readUint(data, off + 4), startGlyphID = bin.readUint(data, off + 8);
      obj.groups.push([startCharCode, endCharCode, startGlyphID]);
    }
    return obj;
  }, Typr.glyf = {}, Typr.glyf.parse = function(data, offset, length, font) {
    for (var obj = [], g = 0; g < font.maxp.numGlyphs; g++)
      obj.push(null);
    return obj;
  }, Typr.glyf._parseGlyf = function(font, g) {
    var bin = Typr._bin, data = font._data, offset = Typr._tabOffset(data, "glyf") + font.loca[g];
    if (font.loca[g] == font.loca[g + 1])
      return null;
    var gl = {};
    if (gl.noc = bin.readShort(data, offset), offset += 2, gl.xMin = bin.readShort(data, offset), offset += 2, gl.yMin = bin.readShort(data, offset), offset += 2, gl.xMax = bin.readShort(data, offset), offset += 2, gl.yMax = bin.readShort(data, offset), offset += 2, gl.xMin >= gl.xMax || gl.yMin >= gl.yMax)
      return null;
    if (gl.noc > 0) {
      gl.endPts = [];
      for (var i = 0; i < gl.noc; i++)
        gl.endPts.push(bin.readUshort(data, offset)), offset += 2;
      var instructionLength = bin.readUshort(data, offset);
      if (offset += 2, data.length - offset < instructionLength)
        return null;
      gl.instructions = bin.readBytes(data, offset, instructionLength), offset += instructionLength;
      var crdnum = gl.endPts[gl.noc - 1] + 1;
      gl.flags = [];
      for (i = 0; i < crdnum; i++) {
        var flag = data[offset];
        if (offset++, gl.flags.push(flag), 0 != (8 & flag)) {
          var rep = data[offset];
          offset++;
          for (var j = 0; j < rep; j++)
            gl.flags.push(flag), i++;
        }
      }
      gl.xs = [];
      for (i = 0; i < crdnum; i++) {
        var i8 = 0 != (2 & gl.flags[i]), same = 0 != (16 & gl.flags[i]);
        i8 ? (gl.xs.push(same ? data[offset] : -data[offset]), offset++) : same ? gl.xs.push(0) : (gl.xs.push(bin.readShort(data, offset)), offset += 2);
      }
      gl.ys = [];
      for (i = 0; i < crdnum; i++) {
        i8 = 0 != (4 & gl.flags[i]), same = 0 != (32 & gl.flags[i]);
        i8 ? (gl.ys.push(same ? data[offset] : -data[offset]), offset++) : same ? gl.ys.push(0) : (gl.ys.push(bin.readShort(data, offset)), offset += 2);
      }
      var x = 0, y = 0;
      for (i = 0; i < crdnum; i++)
        x += gl.xs[i], y += gl.ys[i], gl.xs[i] = x, gl.ys[i] = y;
    } else {
      var flags;
      gl.parts = [];
      do {
        flags = bin.readUshort(data, offset), offset += 2;
        var part = { m: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, p1: -1, p2: -1 };
        if (gl.parts.push(part), part.glyphIndex = bin.readUshort(data, offset), offset += 2, 1 & flags) {
          var arg1 = bin.readShort(data, offset);
          offset += 2;
          var arg2 = bin.readShort(data, offset);
          offset += 2;
        } else {
          arg1 = bin.readInt8(data, offset);
          offset++;
          arg2 = bin.readInt8(data, offset);
          offset++;
        }
        2 & flags ? (part.m.tx = arg1, part.m.ty = arg2) : (part.p1 = arg1, part.p2 = arg2), 8 & flags ? (part.m.a = part.m.d = bin.readF2dot14(data, offset), offset += 2) : 64 & flags ? (part.m.a = bin.readF2dot14(data, offset), offset += 2, part.m.d = bin.readF2dot14(data, offset), offset += 2) : 128 & flags && (part.m.a = bin.readF2dot14(data, offset), offset += 2, part.m.b = bin.readF2dot14(data, offset), offset += 2, part.m.c = bin.readF2dot14(data, offset), offset += 2, part.m.d = bin.readF2dot14(data, offset), offset += 2);
      } while (32 & flags);
      if (256 & flags) {
        var numInstr = bin.readUshort(data, offset);
        offset += 2, gl.instr = [];
        for (i = 0; i < numInstr; i++)
          gl.instr.push(data[offset]), offset++;
      }
    }
    return gl;
  }, Typr.GPOS = {}, Typr.GPOS.parse = function(data, offset, length, font) {
    return Typr._lctf.parse(data, offset, length, font, Typr.GPOS.subt);
  }, Typr.GPOS.subt = function(data, ltype, offset) {
    if (2 != ltype)
      return null;
    var bin = Typr._bin, offset0 = offset, tab = {};
    tab.format = bin.readUshort(data, offset), offset += 2;
    var covOff = bin.readUshort(data, offset);
    offset += 2, tab.coverage = Typr._lctf.readCoverage(data, covOff + offset0), tab.valFmt1 = bin.readUshort(data, offset), offset += 2, tab.valFmt2 = bin.readUshort(data, offset), offset += 2;
    var ones1 = Typr._lctf.numOfOnes(tab.valFmt1), ones2 = Typr._lctf.numOfOnes(tab.valFmt2);
    if (1 == tab.format) {
      tab.pairsets = [];
      var count = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < count; i++) {
        var psoff = bin.readUshort(data, offset);
        offset += 2, psoff += offset0;
        var pvcount = bin.readUshort(data, psoff);
        psoff += 2;
        for (var arr = [], j = 0; j < pvcount; j++) {
          var gid2 = bin.readUshort(data, psoff);
          psoff += 2, 0 != tab.valFmt1 && (value1 = Typr._lctf.readValueRecord(data, psoff, tab.valFmt1), psoff += 2 * ones1), 0 != tab.valFmt2 && (value2 = Typr._lctf.readValueRecord(data, psoff, tab.valFmt2), psoff += 2 * ones2), arr.push({ gid2, val1: value1, val2: value2 });
        }
        tab.pairsets.push(arr);
      }
    }
    if (2 == tab.format) {
      var classDef1 = bin.readUshort(data, offset);
      offset += 2;
      var classDef2 = bin.readUshort(data, offset);
      offset += 2;
      var class1Count = bin.readUshort(data, offset);
      offset += 2;
      var class2Count = bin.readUshort(data, offset);
      offset += 2, tab.classDef1 = Typr._lctf.readClassDef(data, offset0 + classDef1), tab.classDef2 = Typr._lctf.readClassDef(data, offset0 + classDef2), tab.matrix = [];
      for (i = 0; i < class1Count; i++) {
        var row = [];
        for (j = 0; j < class2Count; j++) {
          var value1 = null, value2 = null;
          0 != tab.valFmt1 && (value1 = Typr._lctf.readValueRecord(data, offset, tab.valFmt1), offset += 2 * ones1), 0 != tab.valFmt2 && (value2 = Typr._lctf.readValueRecord(data, offset, tab.valFmt2), offset += 2 * ones2), row.push({ val1: value1, val2: value2 });
        }
        tab.matrix.push(row);
      }
    }
    return tab;
  }, Typr.GSUB = {}, Typr.GSUB.parse = function(data, offset, length, font) {
    return Typr._lctf.parse(data, offset, length, font, Typr.GSUB.subt);
  }, Typr.GSUB.subt = function(data, ltype, offset) {
    var bin = Typr._bin, offset0 = offset, tab = {};
    if (1 != ltype && 4 != ltype && 5 != ltype)
      return null;
    tab.fmt = bin.readUshort(data, offset), offset += 2;
    var covOff = bin.readUshort(data, offset);
    if (offset += 2, tab.coverage = Typr._lctf.readCoverage(data, covOff + offset0), 1 == ltype) {
      if (1 == tab.fmt)
        tab.delta = bin.readShort(data, offset), offset += 2;
      else if (2 == tab.fmt) {
        var cnt = bin.readUshort(data, offset);
        offset += 2, tab.newg = bin.readUshorts(data, offset, cnt), offset += 2 * tab.newg.length;
      }
    } else if (4 == ltype) {
      tab.vals = [];
      cnt = bin.readUshort(data, offset);
      offset += 2;
      for (var i = 0; i < cnt; i++) {
        var loff = bin.readUshort(data, offset);
        offset += 2, tab.vals.push(Typr.GSUB.readLigatureSet(data, offset0 + loff));
      }
    } else if (5 == ltype)
      if (2 == tab.fmt) {
        var cDefOffset = bin.readUshort(data, offset);
        offset += 2, tab.cDef = Typr._lctf.readClassDef(data, offset0 + cDefOffset), tab.scset = [];
        var subClassSetCount = bin.readUshort(data, offset);
        offset += 2;
        for (i = 0; i < subClassSetCount; i++) {
          var scsOff = bin.readUshort(data, offset);
          offset += 2, tab.scset.push(0 == scsOff ? null : Typr.GSUB.readSubClassSet(data, offset0 + scsOff));
        }
      } else
        console.log("unknown table format", tab.fmt);
    return tab;
  }, Typr.GSUB.readSubClassSet = function(data, offset) {
    var rUs = Typr._bin.readUshort, offset0 = offset, lset = [], cnt = rUs(data, offset);
    offset += 2;
    for (var i = 0; i < cnt; i++) {
      var loff = rUs(data, offset);
      offset += 2, lset.push(Typr.GSUB.readSubClassRule(data, offset0 + loff));
    }
    return lset;
  }, Typr.GSUB.readSubClassRule = function(data, offset) {
    var rUs = Typr._bin.readUshort, rule = {}, gcount = rUs(data, offset), scount = rUs(data, offset += 2);
    offset += 2, rule.input = [];
    for (var i = 0; i < gcount - 1; i++)
      rule.input.push(rUs(data, offset)), offset += 2;
    return rule.substLookupRecords = Typr.GSUB.readSubstLookupRecords(data, offset, scount), rule;
  }, Typr.GSUB.readSubstLookupRecords = function(data, offset, cnt) {
    for (var rUs = Typr._bin.readUshort, out = [], i = 0; i < cnt; i++)
      out.push(rUs(data, offset), rUs(data, offset + 2)), offset += 4;
    return out;
  }, Typr.GSUB.readChainSubClassSet = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, lset = [], cnt = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < cnt; i++) {
      var loff = bin.readUshort(data, offset);
      offset += 2, lset.push(Typr.GSUB.readChainSubClassRule(data, offset0 + loff));
    }
    return lset;
  }, Typr.GSUB.readChainSubClassRule = function(data, offset) {
    for (var bin = Typr._bin, rule = {}, pps = ["backtrack", "input", "lookahead"], pi = 0; pi < pps.length; pi++) {
      var cnt = bin.readUshort(data, offset);
      offset += 2, 1 == pi && cnt--, rule[pps[pi]] = bin.readUshorts(data, offset, cnt), offset += 2 * rule[pps[pi]].length;
    }
    cnt = bin.readUshort(data, offset);
    return offset += 2, rule.subst = bin.readUshorts(data, offset, 2 * cnt), offset += 2 * rule.subst.length, rule;
  }, Typr.GSUB.readLigatureSet = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, lset = [], lcnt = bin.readUshort(data, offset);
    offset += 2;
    for (var j = 0; j < lcnt; j++) {
      var loff = bin.readUshort(data, offset);
      offset += 2, lset.push(Typr.GSUB.readLigature(data, offset0 + loff));
    }
    return lset;
  }, Typr.GSUB.readLigature = function(data, offset) {
    var bin = Typr._bin, lig = { chain: [] };
    lig.nglyph = bin.readUshort(data, offset), offset += 2;
    var ccnt = bin.readUshort(data, offset);
    offset += 2;
    for (var k = 0; k < ccnt - 1; k++)
      lig.chain.push(bin.readUshort(data, offset)), offset += 2;
    return lig;
  }, Typr.head = {}, Typr.head.parse = function(data, offset, length) {
    var bin = Typr._bin, obj = {};
    return bin.readFixed(data, offset), offset += 4, obj.fontRevision = bin.readFixed(data, offset), offset += 4, bin.readUint(data, offset), offset += 4, bin.readUint(data, offset), offset += 4, obj.flags = bin.readUshort(data, offset), offset += 2, obj.unitsPerEm = bin.readUshort(data, offset), offset += 2, obj.created = bin.readUint64(data, offset), offset += 8, obj.modified = bin.readUint64(data, offset), offset += 8, obj.xMin = bin.readShort(data, offset), offset += 2, obj.yMin = bin.readShort(data, offset), offset += 2, obj.xMax = bin.readShort(data, offset), offset += 2, obj.yMax = bin.readShort(data, offset), offset += 2, obj.macStyle = bin.readUshort(data, offset), offset += 2, obj.lowestRecPPEM = bin.readUshort(data, offset), offset += 2, obj.fontDirectionHint = bin.readShort(data, offset), offset += 2, obj.indexToLocFormat = bin.readShort(data, offset), offset += 2, obj.glyphDataFormat = bin.readShort(data, offset), offset += 2, obj;
  }, Typr.hhea = {}, Typr.hhea.parse = function(data, offset, length) {
    var bin = Typr._bin, obj = {};
    return bin.readFixed(data, offset), offset += 4, obj.ascender = bin.readShort(data, offset), offset += 2, obj.descender = bin.readShort(data, offset), offset += 2, obj.lineGap = bin.readShort(data, offset), offset += 2, obj.advanceWidthMax = bin.readUshort(data, offset), offset += 2, obj.minLeftSideBearing = bin.readShort(data, offset), offset += 2, obj.minRightSideBearing = bin.readShort(data, offset), offset += 2, obj.xMaxExtent = bin.readShort(data, offset), offset += 2, obj.caretSlopeRise = bin.readShort(data, offset), offset += 2, obj.caretSlopeRun = bin.readShort(data, offset), offset += 2, obj.caretOffset = bin.readShort(data, offset), offset += 2, offset += 8, obj.metricDataFormat = bin.readShort(data, offset), offset += 2, obj.numberOfHMetrics = bin.readUshort(data, offset), offset += 2, obj;
  }, Typr.hmtx = {}, Typr.hmtx.parse = function(data, offset, length, font) {
    for (var bin = Typr._bin, obj = { aWidth: [], lsBearing: [] }, aw = 0, lsb = 0, i = 0; i < font.maxp.numGlyphs; i++)
      i < font.hhea.numberOfHMetrics && (aw = bin.readUshort(data, offset), offset += 2, lsb = bin.readShort(data, offset), offset += 2), obj.aWidth.push(aw), obj.lsBearing.push(lsb);
    return obj;
  }, Typr.kern = {}, Typr.kern.parse = function(data, offset, length, font) {
    var bin = Typr._bin, version = bin.readUshort(data, offset);
    if (offset += 2, 1 == version)
      return Typr.kern.parseV1(data, offset - 2, length, font);
    var nTables = bin.readUshort(data, offset);
    offset += 2;
    for (var map = { glyph1: [], rval: [] }, i = 0; i < nTables; i++) {
      offset += 2;
      length = bin.readUshort(data, offset);
      offset += 2;
      var coverage = bin.readUshort(data, offset);
      offset += 2;
      var format = coverage >>> 8;
      if (0 != (format &= 15))
        throw "unknown kern table format: " + format;
      offset = Typr.kern.readFormat0(data, offset, map);
    }
    return map;
  }, Typr.kern.parseV1 = function(data, offset, length, font) {
    var bin = Typr._bin;
    bin.readFixed(data, offset), offset += 4;
    var nTables = bin.readUint(data, offset);
    offset += 4;
    for (var map = { glyph1: [], rval: [] }, i = 0; i < nTables; i++) {
      bin.readUint(data, offset), offset += 4;
      var coverage = bin.readUshort(data, offset);
      offset += 2, bin.readUshort(data, offset), offset += 2;
      var format = coverage >>> 8;
      if (0 != (format &= 15))
        throw "unknown kern table format: " + format;
      offset = Typr.kern.readFormat0(data, offset, map);
    }
    return map;
  }, Typr.kern.readFormat0 = function(data, offset, map) {
    var bin = Typr._bin, pleft = -1, nPairs = bin.readUshort(data, offset);
    offset += 2, bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2, bin.readUshort(data, offset), offset += 2;
    for (var j = 0; j < nPairs; j++) {
      var left = bin.readUshort(data, offset);
      offset += 2;
      var right = bin.readUshort(data, offset);
      offset += 2;
      var value = bin.readShort(data, offset);
      offset += 2, left != pleft && (map.glyph1.push(left), map.rval.push({ glyph2: [], vals: [] }));
      var rval = map.rval[map.rval.length - 1];
      rval.glyph2.push(right), rval.vals.push(value), pleft = left;
    }
    return offset;
  }, Typr.loca = {}, Typr.loca.parse = function(data, offset, length, font) {
    var bin = Typr._bin, obj = [], ver = font.head.indexToLocFormat, len = font.maxp.numGlyphs + 1;
    if (0 == ver)
      for (var i = 0; i < len; i++)
        obj.push(bin.readUshort(data, offset + (i << 1)) << 1);
    if (1 == ver)
      for (i = 0; i < len; i++)
        obj.push(bin.readUint(data, offset + (i << 2)));
    return obj;
  }, Typr.maxp = {}, Typr.maxp.parse = function(data, offset, length) {
    var bin = Typr._bin, obj = {}, ver = bin.readUint(data, offset);
    return offset += 4, obj.numGlyphs = bin.readUshort(data, offset), offset += 2, 65536 == ver && (obj.maxPoints = bin.readUshort(data, offset), offset += 2, obj.maxContours = bin.readUshort(data, offset), offset += 2, obj.maxCompositePoints = bin.readUshort(data, offset), offset += 2, obj.maxCompositeContours = bin.readUshort(data, offset), offset += 2, obj.maxZones = bin.readUshort(data, offset), offset += 2, obj.maxTwilightPoints = bin.readUshort(data, offset), offset += 2, obj.maxStorage = bin.readUshort(data, offset), offset += 2, obj.maxFunctionDefs = bin.readUshort(data, offset), offset += 2, obj.maxInstructionDefs = bin.readUshort(data, offset), offset += 2, obj.maxStackElements = bin.readUshort(data, offset), offset += 2, obj.maxSizeOfInstructions = bin.readUshort(data, offset), offset += 2, obj.maxComponentElements = bin.readUshort(data, offset), offset += 2, obj.maxComponentDepth = bin.readUshort(data, offset), offset += 2), obj;
  }, Typr.name = {}, Typr.name.parse = function(data, offset, length) {
    var bin = Typr._bin, obj = {};
    bin.readUshort(data, offset), offset += 2;
    var count = bin.readUshort(data, offset);
    offset += 2, bin.readUshort(data, offset);
    for (var tname, offset0 = offset += 2, i = 0; i < count; i++) {
      var platformID = bin.readUshort(data, offset);
      offset += 2;
      var encodingID = bin.readUshort(data, offset);
      offset += 2;
      var languageID = bin.readUshort(data, offset);
      offset += 2;
      var nameID = bin.readUshort(data, offset);
      offset += 2;
      length = bin.readUshort(data, offset);
      offset += 2;
      var noffset = bin.readUshort(data, offset);
      offset += 2;
      var plat = "p" + platformID;
      null == obj[plat] && (obj[plat] = {});
      var str, cname = ["copyright", "fontFamily", "fontSubfamily", "ID", "fullName", "version", "postScriptName", "trademark", "manufacturer", "designer", "description", "urlVendor", "urlDesigner", "licence", "licenceURL", "---", "typoFamilyName", "typoSubfamilyName", "compatibleFull", "sampleText", "postScriptCID", "wwsFamilyName", "wwsSubfamilyName", "lightPalette", "darkPalette"][nameID], soff = offset0 + 12 * count + noffset;
      if (0 == platformID)
        str = bin.readUnicode(data, soff, length / 2);
      else if (3 == platformID && 0 == encodingID)
        str = bin.readUnicode(data, soff, length / 2);
      else if (0 == encodingID)
        str = bin.readASCII(data, soff, length);
      else if (1 == encodingID)
        str = bin.readUnicode(data, soff, length / 2);
      else if (3 == encodingID)
        str = bin.readUnicode(data, soff, length / 2);
      else {
        if (1 != platformID)
          throw "unknown encoding " + encodingID + ", platformID: " + platformID;
        str = bin.readASCII(data, soff, length), console.log("reading unknown MAC encoding " + encodingID + " as ASCII");
      }
      obj[plat][cname] = str, obj[plat]._lang = languageID;
    }
    for (var p in obj)
      if (null != obj[p].postScriptName && 1033 == obj[p]._lang)
        return obj[p];
    for (var p in obj)
      if (null != obj[p].postScriptName && 3084 == obj[p]._lang)
        return obj[p];
    for (var p in obj)
      if (null != obj[p].postScriptName)
        return obj[p];
    for (var p in obj) {
      tname = p;
      break;
    }
    return console.log("returning name table with languageID " + obj[tname]._lang), obj[tname];
  }, Typr["OS/2"] = {}, Typr["OS/2"].parse = function(data, offset, length) {
    var ver = Typr._bin.readUshort(data, offset);
    offset += 2;
    var obj = {};
    if (0 == ver)
      Typr["OS/2"].version0(data, offset, obj);
    else if (1 == ver)
      Typr["OS/2"].version1(data, offset, obj);
    else if (2 == ver || 3 == ver || 4 == ver)
      Typr["OS/2"].version2(data, offset, obj);
    else {
      if (5 != ver)
        throw "unknown OS/2 table version: " + ver;
      Typr["OS/2"].version5(data, offset, obj);
    }
    return obj;
  }, Typr["OS/2"].version0 = function(data, offset, obj) {
    var bin = Typr._bin;
    return obj.xAvgCharWidth = bin.readShort(data, offset), offset += 2, obj.usWeightClass = bin.readUshort(data, offset), offset += 2, obj.usWidthClass = bin.readUshort(data, offset), offset += 2, obj.fsType = bin.readUshort(data, offset), offset += 2, obj.ySubscriptXSize = bin.readShort(data, offset), offset += 2, obj.ySubscriptYSize = bin.readShort(data, offset), offset += 2, obj.ySubscriptXOffset = bin.readShort(data, offset), offset += 2, obj.ySubscriptYOffset = bin.readShort(data, offset), offset += 2, obj.ySuperscriptXSize = bin.readShort(data, offset), offset += 2, obj.ySuperscriptYSize = bin.readShort(data, offset), offset += 2, obj.ySuperscriptXOffset = bin.readShort(data, offset), offset += 2, obj.ySuperscriptYOffset = bin.readShort(data, offset), offset += 2, obj.yStrikeoutSize = bin.readShort(data, offset), offset += 2, obj.yStrikeoutPosition = bin.readShort(data, offset), offset += 2, obj.sFamilyClass = bin.readShort(data, offset), offset += 2, obj.panose = bin.readBytes(data, offset, 10), offset += 10, obj.ulUnicodeRange1 = bin.readUint(data, offset), offset += 4, obj.ulUnicodeRange2 = bin.readUint(data, offset), offset += 4, obj.ulUnicodeRange3 = bin.readUint(data, offset), offset += 4, obj.ulUnicodeRange4 = bin.readUint(data, offset), offset += 4, obj.achVendID = [bin.readInt8(data, offset), bin.readInt8(data, offset + 1), bin.readInt8(data, offset + 2), bin.readInt8(data, offset + 3)], offset += 4, obj.fsSelection = bin.readUshort(data, offset), offset += 2, obj.usFirstCharIndex = bin.readUshort(data, offset), offset += 2, obj.usLastCharIndex = bin.readUshort(data, offset), offset += 2, obj.sTypoAscender = bin.readShort(data, offset), offset += 2, obj.sTypoDescender = bin.readShort(data, offset), offset += 2, obj.sTypoLineGap = bin.readShort(data, offset), offset += 2, obj.usWinAscent = bin.readUshort(data, offset), offset += 2, obj.usWinDescent = bin.readUshort(data, offset), offset += 2;
  }, Typr["OS/2"].version1 = function(data, offset, obj) {
    var bin = Typr._bin;
    return offset = Typr["OS/2"].version0(data, offset, obj), obj.ulCodePageRange1 = bin.readUint(data, offset), offset += 4, obj.ulCodePageRange2 = bin.readUint(data, offset), offset += 4;
  }, Typr["OS/2"].version2 = function(data, offset, obj) {
    var bin = Typr._bin;
    return offset = Typr["OS/2"].version1(data, offset, obj), obj.sxHeight = bin.readShort(data, offset), offset += 2, obj.sCapHeight = bin.readShort(data, offset), offset += 2, obj.usDefault = bin.readUshort(data, offset), offset += 2, obj.usBreak = bin.readUshort(data, offset), offset += 2, obj.usMaxContext = bin.readUshort(data, offset), offset += 2;
  }, Typr["OS/2"].version5 = function(data, offset, obj) {
    var bin = Typr._bin;
    return offset = Typr["OS/2"].version2(data, offset, obj), obj.usLowerOpticalPointSize = bin.readUshort(data, offset), offset += 2, obj.usUpperOpticalPointSize = bin.readUshort(data, offset), offset += 2;
  }, Typr.post = {}, Typr.post.parse = function(data, offset, length) {
    var bin = Typr._bin, obj = {};
    return obj.version = bin.readFixed(data, offset), offset += 4, obj.italicAngle = bin.readFixed(data, offset), offset += 4, obj.underlinePosition = bin.readShort(data, offset), offset += 2, obj.underlineThickness = bin.readShort(data, offset), offset += 2, obj;
  }, Typr.SVG = {}, Typr.SVG.parse = function(data, offset, length) {
    var bin = Typr._bin, obj = { entries: [] }, offset0 = offset;
    bin.readUshort(data, offset), offset += 2;
    var svgDocIndexOffset = bin.readUint(data, offset);
    offset += 4, bin.readUint(data, offset), offset += 4, offset = svgDocIndexOffset + offset0;
    var numEntries = bin.readUshort(data, offset);
    offset += 2;
    for (var i = 0; i < numEntries; i++) {
      var startGlyphID = bin.readUshort(data, offset);
      offset += 2;
      var endGlyphID = bin.readUshort(data, offset);
      offset += 2;
      var svgDocOffset = bin.readUint(data, offset);
      offset += 4;
      var svgDocLength = bin.readUint(data, offset);
      offset += 4;
      for (var sbuf = new Uint8Array(data.buffer, offset0 + svgDocOffset + svgDocIndexOffset, svgDocLength), svg = bin.readUTF8(sbuf, 0, sbuf.length), f = startGlyphID; f <= endGlyphID; f++)
        obj.entries[f] = svg;
    }
    return obj;
  }, Typr.SVG.toPath = function(str) {
    var pth = { cmds: [], crds: [] };
    if (null == str)
      return pth;
    for (var svg = new DOMParser().parseFromString(str, "image/svg+xml").firstChild; "svg" != svg.tagName; )
      svg = svg.nextSibling;
    var vb = svg.getAttribute("viewBox");
    vb = vb ? vb.trim().split(" ").map(parseFloat) : [0, 0, 1e3, 1e3], Typr.SVG._toPath(svg.children, pth);
    for (var i = 0; i < pth.crds.length; i += 2) {
      var x = pth.crds[i], y = pth.crds[i + 1];
      x -= vb[0], y = -(y -= vb[1]), pth.crds[i] = x, pth.crds[i + 1] = y;
    }
    return pth;
  }, Typr.SVG._toPath = function(nds, pth, fill) {
    for (var ni = 0; ni < nds.length; ni++) {
      var nd = nds[ni], tn = nd.tagName, cfl = nd.getAttribute("fill");
      if (null == cfl && (cfl = fill), "g" == tn)
        Typr.SVG._toPath(nd.children, pth, cfl);
      else if ("path" == tn) {
        pth.cmds.push(cfl || "#000000");
        var d = nd.getAttribute("d"), toks = Typr.SVG._tokens(d);
        Typr.SVG._toksToPath(toks, pth), pth.cmds.push("X");
      } else
        "defs" == tn || console.log(tn, nd);
    }
  }, Typr.SVG._tokens = function(d) {
    for (var ts = [], off = 0, rn = false, cn = ""; off < d.length; ) {
      var cc = d.charCodeAt(off), ch = d.charAt(off);
      off++;
      var isNum = 48 <= cc && cc <= 57 || "." == ch || "-" == ch;
      rn ? "-" == ch ? (ts.push(parseFloat(cn)), cn = ch) : isNum ? cn += ch : (ts.push(parseFloat(cn)), "," != ch && " " != ch && ts.push(ch), rn = false) : isNum ? (cn = ch, rn = true) : "," != ch && " " != ch && ts.push(ch);
    }
    return rn && ts.push(parseFloat(cn)), ts;
  }, Typr.SVG._toksToPath = function(ts, pth) {
    for (var i = 0, x = 0, y = 0, ox = 0, oy = 0, pc = { M: 2, L: 2, H: 1, V: 1, S: 4, C: 6 }, cmds = pth.cmds, crds = pth.crds; i < ts.length; ) {
      var cmd = ts[i];
      if (i++, "z" == cmd)
        cmds.push("Z"), x = ox, y = oy;
      else
        for (var cmu = cmd.toUpperCase(), ps = pc[cmu], reps = Typr.SVG._reps(ts, i, ps), j = 0; j < reps; j++) {
          var xi = 0, yi = 0;
          if (cmd != cmu && (xi = x, yi = y), "M" == cmu)
            x = xi + ts[i++], y = yi + ts[i++], cmds.push("M"), crds.push(x, y), ox = x, oy = y;
          else if ("L" == cmu)
            x = xi + ts[i++], y = yi + ts[i++], cmds.push("L"), crds.push(x, y);
          else if ("H" == cmu)
            x = xi + ts[i++], cmds.push("L"), crds.push(x, y);
          else if ("V" == cmu)
            y = yi + ts[i++], cmds.push("L"), crds.push(x, y);
          else if ("C" == cmu) {
            var x1 = xi + ts[i++], y1 = yi + ts[i++], x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
            cmds.push("C"), crds.push(x1, y1, x2, y2, x3, y3), x = x3, y = y3;
          } else if ("S" == cmu) {
            var co = Math.max(crds.length - 4, 0);
            x1 = x + x - crds[co], y1 = y + y - crds[co + 1], x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
            cmds.push("C"), crds.push(x1, y1, x2, y2, x3, y3), x = x3, y = y3;
          } else
            console.log("Unknown SVG command " + cmd);
        }
    }
  }, Typr.SVG._reps = function(ts, off, ps) {
    for (var i = off; i < ts.length && "string" != typeof ts[i]; )
      i += ps;
    return (i - off) / ps;
  }, null == Typr && (Typr = {}), null == Typr.U && (Typr.U = {}), Typr.U.codeToGlyph = function(font, code) {
    var cmap = font.cmap, tind = -1;
    if (null != cmap.p0e4 ? tind = cmap.p0e4 : null != cmap.p3e1 ? tind = cmap.p3e1 : null != cmap.p1e0 && (tind = cmap.p1e0), -1 == tind)
      throw "no familiar platform and encoding!";
    var tab = cmap.tables[tind];
    if (0 == tab.format)
      return code >= tab.map.length ? 0 : tab.map[code];
    if (4 == tab.format) {
      for (var sind = -1, i = 0; i < tab.endCount.length; i++)
        if (code <= tab.endCount[i]) {
          sind = i;
          break;
        }
      if (-1 == sind)
        return 0;
      if (tab.startCount[sind] > code)
        return 0;
      return 65535 & (0 != tab.idRangeOffset[sind] ? tab.glyphIdArray[code - tab.startCount[sind] + (tab.idRangeOffset[sind] >> 1) - (tab.idRangeOffset.length - sind)] : code + tab.idDelta[sind]);
    }
    if (12 == tab.format) {
      if (code > tab.groups[tab.groups.length - 1][1])
        return 0;
      for (i = 0; i < tab.groups.length; i++) {
        var grp = tab.groups[i];
        if (grp[0] <= code && code <= grp[1])
          return grp[2] + (code - grp[0]);
      }
      return 0;
    }
    throw "unknown cmap table format " + tab.format;
  }, Typr.U.glyphToPath = function(font, gid) {
    var path = { cmds: [], crds: [] };
    if (font.SVG && font.SVG.entries[gid]) {
      var p = font.SVG.entries[gid];
      return null == p ? path : ("string" == typeof p && (p = Typr.SVG.toPath(p), font.SVG.entries[gid] = p), p);
    }
    if (font.CFF) {
      var state = { x: 0, y: 0, stack: [], nStems: 0, haveWidth: false, width: font.CFF.Private ? font.CFF.Private.defaultWidthX : 0, open: false };
      Typr.U._drawCFF(font.CFF.CharStrings[gid], state, font.CFF, path);
    } else
      font.glyf && Typr.U._drawGlyf(gid, font, path);
    return path;
  }, Typr.U._drawGlyf = function(gid, font, path) {
    var gl = font.glyf[gid];
    null == gl && (gl = font.glyf[gid] = Typr.glyf._parseGlyf(font, gid)), null != gl && (gl.noc > -1 ? Typr.U._simpleGlyph(gl, path) : Typr.U._compoGlyph(gl, font, path));
  }, Typr.U._simpleGlyph = function(gl, p) {
    for (var c = 0; c < gl.noc; c++) {
      for (var i0 = 0 == c ? 0 : gl.endPts[c - 1] + 1, il = gl.endPts[c], i = i0; i <= il; i++) {
        var pr = i == i0 ? il : i - 1, nx = i == il ? i0 : i + 1, onCurve = 1 & gl.flags[i], prOnCurve = 1 & gl.flags[pr], nxOnCurve = 1 & gl.flags[nx], x = gl.xs[i], y = gl.ys[i];
        if (i == i0)
          if (onCurve) {
            if (!prOnCurve) {
              Typr.U.P.moveTo(p, x, y);
              continue;
            }
            Typr.U.P.moveTo(p, gl.xs[pr], gl.ys[pr]);
          } else
            prOnCurve ? Typr.U.P.moveTo(p, gl.xs[pr], gl.ys[pr]) : Typr.U.P.moveTo(p, (gl.xs[pr] + x) / 2, (gl.ys[pr] + y) / 2);
        onCurve ? prOnCurve && Typr.U.P.lineTo(p, x, y) : nxOnCurve ? Typr.U.P.qcurveTo(p, x, y, gl.xs[nx], gl.ys[nx]) : Typr.U.P.qcurveTo(p, x, y, (x + gl.xs[nx]) / 2, (y + gl.ys[nx]) / 2);
      }
      Typr.U.P.closePath(p);
    }
  }, Typr.U._compoGlyph = function(gl, font, p) {
    for (var j = 0; j < gl.parts.length; j++) {
      var path = { cmds: [], crds: [] }, prt = gl.parts[j];
      Typr.U._drawGlyf(prt.glyphIndex, font, path);
      for (var m = prt.m, i = 0; i < path.crds.length; i += 2) {
        var x = path.crds[i], y = path.crds[i + 1];
        p.crds.push(x * m.a + y * m.b + m.tx), p.crds.push(x * m.c + y * m.d + m.ty);
      }
      for (i = 0; i < path.cmds.length; i++)
        p.cmds.push(path.cmds[i]);
    }
  }, Typr.U._getGlyphClass = function(g, cd) {
    var intr = Typr._lctf.getInterval(cd, g);
    return -1 == intr ? 0 : cd[intr + 2];
  }, Typr.U.getPairAdjustment = function(font, g1, g2) {
    if (font.GPOS) {
      for (var ltab = null, i = 0; i < font.GPOS.featureList.length; i++) {
        var fl = font.GPOS.featureList[i];
        if ("kern" == fl.tag)
          for (var j = 0; j < fl.tab.length; j++)
            2 == font.GPOS.lookupList[fl.tab[j]].ltype && (ltab = font.GPOS.lookupList[fl.tab[j]]);
      }
      if (ltab)
        for (i = 0; i < ltab.tabs.length; i++) {
          var tab = ltab.tabs[i], ind = Typr._lctf.coverageIndex(tab.coverage, g1);
          if (-1 != ind) {
            if (1 == tab.format) {
              var right = tab.pairsets[ind];
              for (j = 0; j < right.length; j++)
                right[j].gid2 == g2 && (adj = right[j]);
              if (null == adj)
                continue;
            } else if (2 == tab.format)
              var c1 = Typr.U._getGlyphClass(g1, tab.classDef1), c2 = Typr.U._getGlyphClass(g2, tab.classDef2), adj = tab.matrix[c1][c2];
            return adj.val1[2];
          }
        }
    }
    if (font.kern) {
      var ind1 = font.kern.glyph1.indexOf(g1);
      if (-1 != ind1) {
        var ind2 = font.kern.rval[ind1].glyph2.indexOf(g2);
        if (-1 != ind2)
          return font.kern.rval[ind1].vals[ind2];
      }
    }
    return 0;
  }, Typr.U.stringToGlyphs = function(font, str) {
    for (var gls = [], i = 0; i < str.length; i++) {
      var cc = str.codePointAt(i);
      cc > 65535 && i++, gls.push(Typr.U.codeToGlyph(font, cc));
    }
    var gsub = font.GSUB;
    if (null == gsub)
      return gls;
    for (var llist = gsub.lookupList, flist = gsub.featureList, wsep = '\n	" ,.:;!?()  ،', R = "آأؤإاةدذرزوٱٲٳٵٶٷڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙۀۃۄۅۆۇۈۉۊۋۍۏےۓەۮۯܐܕܖܗܘܙܞܨܪܬܯݍݙݚݛݫݬݱݳݴݸݹࡀࡆࡇࡉࡔࡧࡩࡪࢪࢫࢬࢮࢱࢲࢹૅેૉ૊૎૏ૐ૑૒૝ૡ૤૯஁ஃ஄அஉ஌எஏ஑னப஫஬", ci = 0; ci < gls.length; ci++) {
      var gl = gls[ci], slft = 0 == ci || -1 != wsep.indexOf(str[ci - 1]), srgt = ci == gls.length - 1 || -1 != wsep.indexOf(str[ci + 1]);
      slft || -1 == R.indexOf(str[ci - 1]) || (slft = true), srgt || -1 == R.indexOf(str[ci]) || (srgt = true), srgt || -1 == "ꡲ્૗".indexOf(str[ci + 1]) || (srgt = true), slft || -1 == "ꡲ્૗".indexOf(str[ci]) || (slft = true);
      var feat = null;
      feat = slft ? srgt ? "isol" : "init" : srgt ? "fina" : "medi";
      for (var fi = 0; fi < flist.length; fi++)
        if (flist[fi].tag == feat)
          for (var ti = 0; ti < flist[fi].tab.length; ti++) {
            1 == (tab = llist[flist[fi].tab[ti]]).ltype && Typr.U._applyType1(gls, ci, tab);
          }
    }
    var cligs = ["rlig", "liga", "mset"];
    for (ci = 0; ci < gls.length; ci++) {
      gl = gls[ci];
      var rlim = Math.min(3, gls.length - ci - 1);
      for (fi = 0; fi < flist.length; fi++) {
        var fl = flist[fi];
        if (-1 != cligs.indexOf(fl.tag)) {
          for (ti = 0; ti < fl.tab.length; ti++)
            for (var tab = llist[fl.tab[ti]], j = 0; j < tab.tabs.length; j++)
              if (null != tab.tabs[j]) {
                var ind = Typr._lctf.coverageIndex(tab.tabs[j].coverage, gl);
                if (-1 != ind) {
                  if (4 == tab.ltype)
                    for (var vals = tab.tabs[j].vals[ind], k = 0; k < vals.length; k++) {
                      var lig = vals[k], rl = lig.chain.length;
                      if (!(rl > rlim)) {
                        for (var good = true, l = 0; l < rl; l++)
                          lig.chain[l] != gls[ci + (1 + l)] && (good = false);
                        if (good) {
                          gls[ci] = lig.nglyph;
                          for (l = 0; l < rl; l++)
                            gls[ci + l + 1] = -1;
                        }
                      }
                    }
                  else if (5 == tab.ltype) {
                    var ltab = tab.tabs[j];
                    if (2 != ltab.fmt)
                      continue;
                    var cind = Typr._lctf.getInterval(ltab.cDef, gl), cls = ltab.cDef[cind + 2], scs = ltab.scset[cls];
                    for (i = 0; i < scs.length; i++) {
                      var sc = scs[i], inp = sc.input;
                      if (!(inp.length > rlim)) {
                        for (good = true, l = 0; l < inp.length; l++) {
                          var cind2 = Typr._lctf.getInterval(ltab.cDef, gls[ci + 1 + l]);
                          if (-1 == cind && ltab.cDef[cind2 + 2] != inp[l]) {
                            good = false;
                            break;
                          }
                        }
                        if (good) {
                          var lrs = sc.substLookupRecords;
                          for (k = 0; k < lrs.length; k += 2)
                            lrs[k], lrs[k + 1];
                        }
                      }
                    }
                  }
                }
              }
        }
      }
    }
    return gls;
  }, Typr.U._applyType1 = function(gls, ci, tab) {
    for (var gl = gls[ci], j = 0; j < tab.tabs.length; j++) {
      var ttab = tab.tabs[j], ind = Typr._lctf.coverageIndex(ttab.coverage, gl);
      -1 != ind && (1 == ttab.fmt ? gls[ci] = gls[ci] + ttab.delta : gls[ci] = ttab.newg[ind]);
    }
  }, Typr.U.glyphsToPath = function(font, gls, clr) {
    for (var tpath = { cmds: [], crds: [] }, x = 0, i = 0; i < gls.length; i++) {
      var gid = gls[i];
      if (-1 != gid) {
        for (var gid2 = i < gls.length - 1 && -1 != gls[i + 1] ? gls[i + 1] : 0, path = Typr.U.glyphToPath(font, gid), j = 0; j < path.crds.length; j += 2)
          tpath.crds.push(path.crds[j] + x), tpath.crds.push(path.crds[j + 1]);
        clr && tpath.cmds.push(clr);
        for (j = 0; j < path.cmds.length; j++)
          tpath.cmds.push(path.cmds[j]);
        clr && tpath.cmds.push("X"), x += font.hmtx.aWidth[gid], i < gls.length - 1 && (x += Typr.U.getPairAdjustment(font, gid, gid2));
      }
    }
    return tpath;
  }, Typr.U.pathToSVG = function(path, prec) {
    null == prec && (prec = 5);
    for (var out = [], co = 0, lmap = { M: 2, L: 2, Q: 4, C: 6 }, i = 0; i < path.cmds.length; i++) {
      var cmd = path.cmds[i], cn = co + (lmap[cmd] ? lmap[cmd] : 0);
      for (out.push(cmd); co < cn; ) {
        var c = path.crds[co++];
        out.push(parseFloat(c.toFixed(prec)) + (co == cn ? "" : " "));
      }
    }
    return out.join("");
  }, Typr.U.pathToContext = function(path, ctx) {
    for (var c = 0, crds = path.crds, j = 0; j < path.cmds.length; j++) {
      var cmd = path.cmds[j];
      "M" == cmd ? (ctx.moveTo(crds[c], crds[c + 1]), c += 2) : "L" == cmd ? (ctx.lineTo(crds[c], crds[c + 1]), c += 2) : "C" == cmd ? (ctx.bezierCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3], crds[c + 4], crds[c + 5]), c += 6) : "Q" == cmd ? (ctx.quadraticCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3]), c += 4) : "#" == cmd.charAt(0) ? (ctx.beginPath(), ctx.fillStyle = cmd) : "Z" == cmd ? ctx.closePath() : "X" == cmd && ctx.fill();
    }
  }, Typr.U.P = {}, Typr.U.P.moveTo = function(p, x, y) {
    p.cmds.push("M"), p.crds.push(x, y);
  }, Typr.U.P.lineTo = function(p, x, y) {
    p.cmds.push("L"), p.crds.push(x, y);
  }, Typr.U.P.curveTo = function(p, a, b, c, d, e, f) {
    p.cmds.push("C"), p.crds.push(a, b, c, d, e, f);
  }, Typr.U.P.qcurveTo = function(p, a, b, c, d) {
    p.cmds.push("Q"), p.crds.push(a, b, c, d);
  }, Typr.U.P.closePath = function(p) {
    p.cmds.push("Z");
  }, Typr.U._drawCFF = function(cmds, state, font, p) {
    for (var stack = state.stack, nStems = state.nStems, haveWidth = state.haveWidth, width = state.width, open = state.open, i = 0, x = state.x, y = state.y, c1x = 0, c1y = 0, c2x = 0, c2y = 0, c3x = 0, c3y = 0, c4x = 0, c4y = 0, jpx = 0, jpy = 0, o = { val: 0, size: 0 }; i < cmds.length; ) {
      Typr.CFF.getCharString(cmds, i, o);
      var v = o.val;
      if (i += o.size, "o1" == v || "o18" == v)
        stack.length % 2 != 0 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX), nStems += stack.length >> 1, stack.length = 0, haveWidth = true;
      else if ("o3" == v || "o23" == v) {
        stack.length % 2 != 0 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX), nStems += stack.length >> 1, stack.length = 0, haveWidth = true;
      } else if ("o4" == v)
        stack.length > 1 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX, haveWidth = true), open && Typr.U.P.closePath(p), y += stack.pop(), Typr.U.P.moveTo(p, x, y), open = true;
      else if ("o5" == v)
        for (; stack.length > 0; )
          x += stack.shift(), y += stack.shift(), Typr.U.P.lineTo(p, x, y);
      else if ("o6" == v || "o7" == v)
        for (var count = stack.length, isX = "o6" == v, j = 0; j < count; j++) {
          var sval = stack.shift();
          isX ? x += sval : y += sval, isX = !isX, Typr.U.P.lineTo(p, x, y);
        }
      else if ("o8" == v || "o24" == v) {
        count = stack.length;
        for (var index = 0; index + 6 <= count; )
          c1x = x + stack.shift(), c1y = y + stack.shift(), c2x = c1x + stack.shift(), c2y = c1y + stack.shift(), x = c2x + stack.shift(), y = c2y + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y), index += 6;
        "o24" == v && (x += stack.shift(), y += stack.shift(), Typr.U.P.lineTo(p, x, y));
      } else {
        if ("o11" == v)
          break;
        if ("o1234" == v || "o1235" == v || "o1236" == v || "o1237" == v)
          "o1234" == v && (c1y = y, c2x = (c1x = x + stack.shift()) + stack.shift(), jpy = c2y = c1y + stack.shift(), c3y = c2y, c4y = y, x = (c4x = (c3x = (jpx = c2x + stack.shift()) + stack.shift()) + stack.shift()) + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy), Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y)), "o1235" == v && (c1x = x + stack.shift(), c1y = y + stack.shift(), c2x = c1x + stack.shift(), c2y = c1y + stack.shift(), jpx = c2x + stack.shift(), jpy = c2y + stack.shift(), c3x = jpx + stack.shift(), c3y = jpy + stack.shift(), c4x = c3x + stack.shift(), c4y = c3y + stack.shift(), x = c4x + stack.shift(), y = c4y + stack.shift(), stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy), Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y)), "o1236" == v && (c1x = x + stack.shift(), c1y = y + stack.shift(), c2x = c1x + stack.shift(), jpy = c2y = c1y + stack.shift(), c3y = c2y, c4x = (c3x = (jpx = c2x + stack.shift()) + stack.shift()) + stack.shift(), c4y = c3y + stack.shift(), x = c4x + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy), Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y)), "o1237" == v && (c1x = x + stack.shift(), c1y = y + stack.shift(), c2x = c1x + stack.shift(), c2y = c1y + stack.shift(), jpx = c2x + stack.shift(), jpy = c2y + stack.shift(), c3x = jpx + stack.shift(), c3y = jpy + stack.shift(), c4x = c3x + stack.shift(), c4y = c3y + stack.shift(), Math.abs(c4x - x) > Math.abs(c4y - y) ? x = c4x + stack.shift() : y = c4y + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, jpx, jpy), Typr.U.P.curveTo(p, c3x, c3y, c4x, c4y, x, y));
        else if ("o14" == v) {
          if (stack.length > 0 && !haveWidth && (width = stack.shift() + font.nominalWidthX, haveWidth = true), 4 == stack.length) {
            var adx = stack.shift(), ady = stack.shift(), bchar = stack.shift(), achar = stack.shift(), bind = Typr.CFF.glyphBySE(font, bchar), aind = Typr.CFF.glyphBySE(font, achar);
            Typr.U._drawCFF(font.CharStrings[bind], state, font, p), state.x = adx, state.y = ady, Typr.U._drawCFF(font.CharStrings[aind], state, font, p);
          }
          open && (Typr.U.P.closePath(p), open = false);
        } else if ("o19" == v || "o20" == v) {
          stack.length % 2 != 0 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX), nStems += stack.length >> 1, stack.length = 0, haveWidth = true, i += nStems + 7 >> 3;
        } else if ("o21" == v)
          stack.length > 2 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX, haveWidth = true), y += stack.pop(), x += stack.pop(), open && Typr.U.P.closePath(p), Typr.U.P.moveTo(p, x, y), open = true;
        else if ("o22" == v)
          stack.length > 1 && !haveWidth && (width = stack.shift() + font.Private.nominalWidthX, haveWidth = true), x += stack.pop(), open && Typr.U.P.closePath(p), Typr.U.P.moveTo(p, x, y), open = true;
        else if ("o25" == v) {
          for (; stack.length > 6; )
            x += stack.shift(), y += stack.shift(), Typr.U.P.lineTo(p, x, y);
          c1x = x + stack.shift(), c1y = y + stack.shift(), c2x = c1x + stack.shift(), c2y = c1y + stack.shift(), x = c2x + stack.shift(), y = c2y + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
        } else if ("o26" == v)
          for (stack.length % 2 && (x += stack.shift()); stack.length > 0; )
            c1x = x, c1y = y + stack.shift(), x = c2x = c1x + stack.shift(), y = (c2y = c1y + stack.shift()) + stack.shift(), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
        else if ("o27" == v)
          for (stack.length % 2 && (y += stack.shift()); stack.length > 0; )
            c1y = y, c2x = (c1x = x + stack.shift()) + stack.shift(), c2y = c1y + stack.shift(), x = c2x + stack.shift(), y = c2y, Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y);
        else if ("o10" == v || "o29" == v) {
          var obj = "o10" == v ? font.Private : font;
          if (0 == stack.length)
            console.log("error: empty stack");
          else {
            var ind = stack.pop(), subr = obj.Subrs[ind + obj.Bias];
            state.x = x, state.y = y, state.nStems = nStems, state.haveWidth = haveWidth, state.width = width, state.open = open, Typr.U._drawCFF(subr, state, font, p), x = state.x, y = state.y, nStems = state.nStems, haveWidth = state.haveWidth, width = state.width, open = state.open;
          }
        } else if ("o30" == v || "o31" == v) {
          var count1 = stack.length, alternate = (index = 0, "o31" == v);
          for (index += count1 - (count = -3 & count1); index < count; )
            alternate ? (c1y = y, c2x = (c1x = x + stack.shift()) + stack.shift(), y = (c2y = c1y + stack.shift()) + stack.shift(), count - index == 5 ? (x = c2x + stack.shift(), index++) : x = c2x, alternate = false) : (c1x = x, c1y = y + stack.shift(), c2x = c1x + stack.shift(), c2y = c1y + stack.shift(), x = c2x + stack.shift(), count - index == 5 ? (y = c2y + stack.shift(), index++) : y = c2y, alternate = true), Typr.U.P.curveTo(p, c1x, c1y, c2x, c2y, x, y), index += 4;
        } else {
          if ("o" == (v + "").charAt(0))
            throw console.log("Unknown operation: " + v, cmds), v;
          stack.push(v);
        }
      }
    }
    state.x = x, state.y = y, state.nStems = nStems, state.haveWidth = haveWidth, state.width = width, state.open = open;
  };
  const Typr$1 = getDefaultExportFromCjs(Typr), questionType = { "单选题": "0", "多选题": "1", "填空题": "2", "判断题": "3", "简答题": "4", "名词解释": "5", "论述题": "6", "计算题": "7" }, log = (data, type = "info") => {
    var _a;
    const style = `color: ${{ info: "orange", success: "green", error: "red" }[type]}; font-weight: bold;`;
    if (Array.isArray(data) || "object" == typeof data ? console.log(`%c${JSON.stringify(data, null, 2)}`, style) : console.log(`%c${data}`, style), defaultConfig$1.debugger) {
      const caller = (((_a = new Error().stack) == null ? void 0 : _a.split("\n")) || [])[2].trim();
      console.log(`${caller}`);
    }
  }, sleep = (time) => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1e3 * time);
  }), randomSleep = (min, max) => new Promise((resolve) => {
    const randomTime = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(() => {
      resolve();
    }, 1e3 * randomTime);
  }), waitIframeLoaded = (iframe) => new Promise((resolve) => {
    const timer = setInterval(() => {
      var _a;
      iframe.contentDocument && "complete" === ((_a = iframe.contentDocument) == null ? void 0 : _a.readyState) ? (clearInterval(timer), resolve()) : iframe.addEventListener("load", () => {
        clearInterval(timer), resolve();
      });
    }, 100);
  }), waitElementLoaded = (iframeWindow, selector) => new Promise((resolve) => {
    const timer = setInterval(() => {
      iframeWindow.document.querySelector(selector) && (clearInterval(timer), resolve());
    }, 100);
  }), removeHtml = (html) => null == html ? "" : html.replace(/<((?!img|sub|sup|br)[^>]+)>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").replace(/<br\s*\/?>/g, "\n").replace(/<img.*?src="(.*?)".*?>/g, '<img src="$1"/>').trim(), cl = (str) => str.replace(/^【.*?】\s*/, "").replace(/\s*（\d+\.\d+分）$/, ""), COURSE_SELECTORS = "#coursename, .courseName, #courseName, .course-name, .course_title, .courseTitle, .courseNameWrap h1, .course-name-wrap, .mark_title_course", getCourseName = (() => {
    let cached = "";
    return function() {
      if (cached) return cached;
      const cleanup = (t) => String(t || "").replace(/\s+/g, " ").replace(/[-_|—·]\s*(超星学习通|超星|学习通)\s*$/i, "").replace(/(期末考试|期中考试|章节测验|章节练习|章节检测|课后作业|随堂练习|单元测试|作业|考试|测验|任务点|详情|预览)$/i, "").trim();
      const pick = (doc) => {
        if (!doc || !doc.querySelector) return "";
        try {
          const el = doc.querySelector(COURSE_SELECTORS);
          if (el) {
            const t = cleanup(el.textContent);
            if (t && t.length <= 60) return t;
          }
        } catch (e) {
        }
        return "";
      };
      const docs = [];
      try {
        docs.push(_unsafeWindow.document);
      } catch (e) {
      }
      try {
        _unsafeWindow.top && _unsafeWindow.top.document && docs.push(_unsafeWindow.top.document);
      } catch (e) {
      }
      try {
        docs.push(document);
      } catch (e) {
      }
      for (let i = 0; i < docs.length; i++) {
        const t = pick(docs[i]);
        if (t) {
          cached = t;
          return cached;
        }
      }
      for (let i = 0; i < docs.length; i++) {
        const raw = docs[i] && docs[i].title || "";
        if (!raw) continue;
        const first = cleanup(String(raw).split(/[-_|—]/)[0]);
        if (first && first.length <= 60 && !/^(超星学习通|超星|学习通|个人空间|首页|登录)$/.test(first)) {
          cached = first;
          return cached;
        }
      }
      return "";
    };
  })(), CATALOG_SELECTORS = ".posCatalog_active, .posCatalog_select.active, .posCatalog_cur, #mainid .active, .chapter_list .active, .catalog_list .active, .chapter_item.active, .catalogItem.active, .chapterList .active, .catalog .active, .posCatalog_level .active, .chapter_item.cur, .catalog_item.active, .chapter_item.current", getCatalogChapter = (() => {
    let cached = "", at = 0;
    return function() {
      if (Date.now() - at < 2000) return cached;
      at = Date.now();
      const cleanup = (t) => String(t || "").replace(/\s+/g, " ").replace(/(已完成|未完成|待完成|已学完|学习中|进行中)/g, "").replace(/\b\d{1,3}:\d{2}(:\d{2})?\b/g, "").replace(/\s{2,}/g, " ").trim().slice(0, 80);
      const docs = [];
      try {
        _unsafeWindow.top && _unsafeWindow.top.document && docs.push(_unsafeWindow.top.document);
      } catch (e) {
      }
      try {
        docs.push(_unsafeWindow.document);
      } catch (e) {
      }
      try {
        docs.push(document);
      } catch (e) {
      }
      // 目录高亮项（章节会随导航变化，故只缓存 2 秒）
      for (let i = 0; i < docs.length; i++) {
        const d = docs[i];
        if (!d || !d.querySelector) continue;
        try {
          const el = d.querySelector(CATALOG_SELECTORS);
          if (el) {
            const t = cleanup(el.textContent);
            if (t && t.length <= 80 && !/^(目录|章节|课程目录|全部章节)$/.test(t)) {
              cached = t;
              return cached;
            }
          }
        } catch (e) {
        }
      }
      // 兜底：面包屑/章节标题
      const fallbacks = ".chapterName, #chapterTitle, .chapter_title, .chapter-title, .prev_ul .current, .position .current";
      for (let i = 0; i < docs.length; i++) {
        const d = docs[i];
        if (!d || !d.querySelector) continue;
        try {
          const el = d.querySelector(fallbacks);
          if (el) {
            const t = cleanup(el.textContent);
            if (t && t.length <= 80) {
              cached = t;
              return cached;
            }
          }
        } catch (e) {
        }
      }
      cached = "";
      return cached;
    };
  })(), SECTION_SELECTORS = ".Cy_TItle, .type_tit, .mark_title, .mark_title .title, .mark_name .colorShallow", getSectionTitle = (el) => {
    const cleanTitle = (txt) => String(txt || "").replace(/\s+/g, " ").replace(/题型说明[:：][\s\S]*$/, "").replace(/（共\s*\d+\s*题[^）]*）/g, "").replace(/\(\s*共\s*\d+\s*题?[^)]*\)/g, "").replace(/^[\s一二三四五六七八九十\d.、，,]+/, "").trim();
    // 纯题型名（单选题/判断题…）不构成语境，判为无标题
    const useful = (t) => !!t && !/^(单选题?|多选题?|判断题?|填空题?|简答题?|名词解释|论述题?|计算题?|选择题)$/.test(t) && !/^[\d\s.、]+$/.test(t);
    const grap = (node) => {
      if (!node || !node.querySelector) return "";
      const hit = node.querySelector(SECTION_SELECTORS);
      if (!hit) return "";
      const t = cleanTitle(hit.textContent);
      return useful(t) ? t : "";
    };
    try {
      let node = el.parentElement;
      for (let i = 0; i < 5 && node; i++) {
        const t = grap(node);
        if (t) return t;
        node = node.parentElement;
      }
      const doc = (el.ownerDocument || document);
      const pageHit = doc.querySelector(".Cy_TItle, .type_tit, .mark_title");
      if (pageHit) {
        const t = cleanTitle(pageHit.textContent);
        if (useful(t)) return t;
      }
      // 兜底：页面标题（不少外语课直接以大题名作为页面标题，如 "Word in use"）
      const docTitle = cleanTitle(doc.title || "");
      if (useful(docTitle) && !/超星|学习通|章节测验|作业|考试|测验|首页|登录/.test(docTitle))
        return docTitle;
    } catch (e) {
    }
    return "";
  }, getQuestion = (type, html) => {
    let questionHtml, questionText, questionTypeId, optionHtml, tokenHtml, workType, optionText, index;
    switch (type) {
      case "1":
        return workType = "zj", questionHtml = Array.from(html.querySelectorAll(".clearfix .fontLabel")), questionText = cl(removeHtml(questionHtml[0].innerHTML)), questionTypeId = html.querySelectorAll("input[name^=answertype]")[0].value, optionHtml = Array.from(html.querySelectorAll("ul")[0].querySelectorAll("li .after")), tokenHtml = html.innerHTML, optionText = [], optionHtml.forEach(function(item) {
          optionText.push(removeHtml(item.innerHTML));
        }), { question: questionText, options: optionText, type: questionTypeId, questionData: tokenHtml, workType, section: getSectionTitle(html) };
      case "2":
        workType = "zy", questionHtml = Array.from(html.querySelectorAll(".mark_name")), index = questionHtml[0].innerHTML.indexOf("</span>"), questionText = cl(removeHtml(questionHtml[0].innerHTML.substring(index + 7))), questionHtml[0].getElementsByTagName("span")[0].innerHTML.replace("(", "").replace(")", "").split(",")[0], questionTypeId = html.querySelectorAll("input[name^=answertype]")[0].value, optionHtml = Array.from(html.querySelectorAll(".answer_p")), tokenHtml = html.innerHTML, optionText = [];
        for (let i = 0; i < optionHtml.length; i++)
          optionText.push(removeHtml(optionHtml[i].innerHTML));
        return { question: questionText, options: optionText, type: questionTypeId, questionData: tokenHtml, workType, section: getSectionTitle(html) };
      case "3":
        workType = "ks", questionHtml = Array.from(document.getElementsByClassName("mark_name colorDeep")), index = questionHtml[0].innerHTML.indexOf("</span>"), questionText = cl(removeHtml(questionHtml[0].innerHTML.substring(index + 7))), questionHtml[0].getElementsByTagName("span")[0].innerHTML.replace("(", "").replace(")", "").split(",")[0], questionTypeId = (t => { if (t) return t.value; const m = questionHtml[0].innerHTML.match(/(单选题|多选题|填空题|判断题|简答题|名词解释|论述题|计算题)/); return m ? questionType[m[1]] : "0"; })(document.querySelector(".mark_table .questionLi input[name^=answertype]") || document.querySelector("input[name^=answertype]") || document.querySelectorAll("input[name^=type]")[1]), optionHtml = Array.from(document.getElementsByClassName("answer_p")), tokenHtml = document.getElementsByClassName("mark_table")[0].innerHTML, optionText = [];
        for (let i = 0; i < optionHtml.length; i++)
          optionText.push(removeHtml(optionHtml[i].innerHTML));
        return { question: questionText, options: optionText, type: questionTypeId, questionData: tokenHtml, workType, section: getSectionTitle(html) };
    }
  }, decode = (iframeWindow) => {
    var _a;
    const styleElements = iframeWindow.document.querySelectorAll("style");
    let tipElement = null;
    if (styleElements.forEach((styleElement) => {
      var _a2;
      -1 !== ((_a2 = styleElement.textContent) == null ? void 0 : _a2.indexOf("font-cxsecret")) && (tipElement = styleElement);
    }), !tipElement)
      return;
    const fontMatch = (_a = tipElement.textContent) == null ? void 0 : _a.match(/base64,([\w\W]+?)'/);
    if (!fontMatch)
      return;
    const fontData = ((base64) => {
      const decodedData = atob(base64), array = new Uint8Array(decodedData.length);
      for (let i = 0; i < decodedData.length; i++)
        array[i] = decodedData.charCodeAt(i);
      return array;
    })(fontMatch[1]), font = Typr$1.parse(fontData), table = JSON.parse(_GM_getResourceText("ttf"));
    let text = {};
    for (let i = 19968; i < 40870; i++) {
      let t = Typr$1.U.codeToGlyph(font, i);
      t && (t = Typr$1.U.glyphToPath(font, t), t = md5(JSON.stringify(t)).slice(24), text[i] = table[t]);
    }
    iframeWindow.document.querySelectorAll(".font-cxsecret").forEach((fontElement) => {
      let html = fontElement.innerHTML;
      Object.keys(text).forEach((key) => {
        const regex = new RegExp(String.fromCharCode(key), "g");
        html = html.replace(regex, String.fromCharCode(text[key]));
      }), fontElement.innerHTML = html, fontElement.classList.remove("font-cxsecret");
    });
  }, extractAnswerLetters = (content) => {
    const up = (content || "").toUpperCase();
    const explicit = up.match(/答案[^A-Z]{0,6}([A-H]{1,8})/);
    if (explicit)
      return explicit[1];
    const runs = up.match(/(?:^|[^A-Z])([A-H]{1,8})(?![A-Z])/g) || [];
    const letters = [...new Set(runs.join("").match(/[A-H]/g) || [])];
    return letters.join("");
  }, JUNK_PATTERNS = ["付费题库", "购买后可查看", "点此购买", "点此查看", "卡密", "继续搜题", "扫码", "公众号", "题库未收录", "题库暂无", "暂无答案", "未找到答案", "没有找到答案", "未查到", "查无此题", "该题暂无", "请先登录", "请登录", "登录后查看", "余额不足", "次数不足", "点数不足", "充值", "开通会员", "会员专享", "联系客服", "授权码", "未授权", "密钥", "秘钥", "请填写", "无法获取", "无法回答", "能力有限", "抱歉"], isJunkAnswer = (answer) => {
    const arr = Array.isArray(answer) ? answer : [answer];
    const texts = arr.map(function(x) {
      return String(x == null ? "" : x).replace(/<[^>]*>/g, "").replace(/\s+/g, "").trim();
    }).filter(function(t) {
      return t.length > 0;
    });
    if (0 === texts.length)
      return true;
    return texts.every(function(t) {
      if (["略", "无", "-", "—", "null", "undefined", "NaN"].includes(t))
        return true;
      // 引流/付费提示常见特征
      if (/[👉➡️]|https?:\/\//.test(t))
        return true;
      return JUNK_PATTERNS.some(function(p) {
        return t.indexOf(p) !== -1;
      });
    });
  }, normalizeAnswer = (answer, questionData) => {
    if (answer == null)
      return [];
    let list = Array.isArray(answer) ? answer.slice() : [answer];
    list = list.map(function(x) {
      return "string" === typeof x ? x.trim() : String(x == null ? "" : x).trim();
    }).filter(function(x) {
      return x.length > 0;
    });
    if (0 === list.length)
      return [];
    const options = questionData && questionData.options ? questionData.options : [];
    const type = questionData ? String(questionData.type) : "0";
    const textTypes = ["2", "4", "5", "6", "7"];
    if (textTypes.includes(type)) {
      const flat = list.join("|");
      const parts = flat.split(/[|｜]|\n/).map(function(x) {
        return x.replace(/^\s*第[一二三四五六七八九十\d]+\s*空[:：]?/, "").trim();
      }).filter(function(x) {
        return x.length > 0;
      });
      return parts.length > 0 ? parts : list;
    }
    if (0 === options.length)
      return list;
    const optByLetter = function(letter) {
      const i = letter.charCodeAt(0) - 65;
      return i >= 0 && i < options.length ? removeHtml(String(options[i] || "")) : null;
    };
    const cleaned = list.map(function(x) {
      return removeHtml(x.replace(/^(答案|正确答案|参考答案)[:：]?/, "").trim());
    }).filter(Boolean);
    const direct = cleaned.filter(function(x) {
      return options.some(function(opt) {
        return removeHtml(String(opt || "")) === x;
      });
    });
    if (direct.length > 0)
      return direct;
    // 仅当整段文本就是字母组合时才按字母解析，避免 "deserve" 里的 D 被误当成选项
    const letterOnly = cleaned.filter(function(x) {
      return /^[A-Ha-h](\s*[,，、\/|]?\s*[A-Ha-h])*$/.test(String(x).trim());
    });
    if (letterOnly.length > 0) {
      const letterRuns = letterOnly.join("").toUpperCase().match(/[A-H]/g) || [];
      const fromLetters = [];
      letterRuns.forEach(function(ch) {
        const t = optByLetter(ch);
        t !== null && -1 === fromLetters.indexOf(t) && fromLetters.push(t);
      });
      if (fromLetters.length > 0)
        return fromLetters;
    }
    const byText = [];
    cleaned.forEach(function(x) {
      options.forEach(function(opt) {
        const o = removeHtml(String(opt || ""));
        if (o && (o === x || (x.length >= 2 && o.includes(x)) || (o.length >= 2 && x.includes(o))) && -1 === byText.indexOf(opt))
          byText.push(opt);
      });
    });
    if (byText.length > 0)
      return byText;
    // 第三轮：去标点/空白后再全等（AnswerUtil 思路，解决"多一个句号就匹配不上"）
    const squash = (s) => String(s == null ? "" : s).replace(/[\s，。、；：""''（）()\[\]【】<>《》!！?？.,;:'"“”‘’\-—_/\\|~`]/g, "").toLowerCase();
    const bySquash = [];
    cleaned.forEach(function(x) {
      const sx = squash(x);
      if (!sx) return;
      options.forEach(function(opt) {
        squash(opt) === sx && -1 === bySquash.indexOf(opt) && bySquash.push(opt);
      });
    });
    if (bySquash.length > 0)
      return bySquash;
    // 第四轮：字符相似度（>=60% 且为最优项才采纳）
    const sameRate = (a, b) => {
      const A = squash(a), B = squash(b);
      if (!A || !B) return 0;
      const seen = {};
      let n = 0;
      for (let i = 0; i < A.length; i++) {
        const ch = A[i];
        if (B.indexOf(ch) !== -1 && !seen[ch]) {
          seen[ch] = 1;
          n++;
        }
      }
      return n / Math.max(A.length, B.length);
    };
    const bySim = [];
    cleaned.forEach(function(x) {
      let bestI = -1, bestRate = 0;
      options.forEach(function(opt, i) {
        const r = sameRate(x, opt);
        if (r > bestRate) {
          bestRate = r, bestI = i;
        }
      });
      if (bestI >= 0 && bestRate >= 0.6 && -1 === bySim.indexOf(options[bestI]))
        bySim.push(options[bestI]);
    });
    if (bySim.length > 0)
      return bySim;
    // 单选/多选：映射不到任何选项的文本不算答案（避免"deserve"这类乱答占位、挡住题库）
    if ("0" === type || "1" === type)
      return [];
    return cleaned;
  }, bankVote = async (questionData, filled, windowz = _unsafeWindow, prefetched = null) => {
    const server = new ServerApi(windowz);
    const config = getConfig();
    const q = questionData;
    const isJudge = "3" === String(q.type);
    const canonJudge = (s) => {
      const t = String(s || "").trim();
      if (/^(正确|对|是|√|true|t|ri|yes|y)$/i.test(t)) return "正确";
      if (/^(错误|错|否|×|x|false|f|wr|no|n)$/i.test(t)) return "错误";
      return t;
    };
    const norm = (a) => {
      if (a == null) return [];
      if (isJunkAnswer(a)) return [];
      const n = normalizeAnswer(a, q);
      const arr = Array.isArray(n) ? n : [n];
      return arr.map(function(x) {
        const s = removeHtml(String(x == null ? "" : x)).replace(/\s+/g, "").toLowerCase();
        return isJudge ? canonJudge(s).toLowerCase() : s;
      }).filter(function(s) {
        return s.length > 0;
      }).sort();
    };
    const keyOf = (arr) => arr.join("|");
    const votes = /* @__PURE__ */ new Map();
    const add = (arr, src) => {
      if (!arr || 0 === arr.length) return;
      const k = keyOf(arr);
      if (!k) return;
      const item = votes.get(k) || { key: k, answer: arr, sources: [] };
      item.sources.indexOf(src) === -1 && item.sources.push(src);
      votes.set(k, item);
    };
    const original = norm(filled);
    add(original, "当前答案");
    // 优先复用答题阶段已拿到的各渠道结果，避免复核时重复请求（请求数直接减半）
    const reuse = Array.isArray(prefetched) ? prefetched.filter(function(x) {
      return x && x.form && x.form !== "提示";
    }) : [];
    let res;
    if (reuse.length > 0) {
      res = reuse;
      console.log("复核复用已有结果:", reuse.map(function(x) {
        return x.form;
      }).join("/"));
    } else {
      const enabled = Array.isArray(config.bankEnabled) ? config.bankEnabled : ["tkh", "yzt", "yx", "mkt", "datam"];
      const proms = [];
      enabled.includes("tkh") && proms.push(server.getAnswer(q));
      enabled.includes("yx") && proms.push(server.getAnswer3(q));
      enabled.includes("mkt") && proms.push(server.getAnswer4(q));
      enabled.includes("yzt") && proms.push(server.getAnswer2(q));
      config.customApiEnabled && config.customApiUrl && proms.push(server.getAnswerFromCustomApi(q));
      enabled.includes("datam") && config.datamBank !== false && config.customApiKey && proms.push(server.getAnswerFromLikeApi(q));
      enabled.includes("ze") && config.zetoken && proms.push(server.getAnswer5(q));
      res = await Promise.all(proms.map(function(p) {
        return Promise.resolve(p).catch(function() {
          return null;
        });
      }));
    }
    res.forEach(function(r) {
      r && add(norm(r.answer), r.form || "题库");
    });
    let best = null;
    votes.forEach(function(v) {
      !best || v.sources.length > best.sources.length ? best = v : 0;
    });
    const originalKey = keyOf(original);
    const agree = !!best && best.key === originalKey;
    // 只有单选/多选/判断题才做"对错"判定；简答/论述等文字题各库措辞不同，只作参考不判错
    const checkable = ["0", "1", "3"].includes(String(q.type));
    const mismatch = checkable && !!best && !agree && best.sources.length >= 2;
    return { votes: Array.from(votes.values()), best, agree, mismatch, checkable, original, originalKey };
  }, getAnswers = async (questionData, windowz = _unsafeWindow) => {
    let server = new ServerApi(windowz);
    const config = getConfig();
    const typeNames = { "0": "单选题", "1": "多选题", "2": "填空题", "3": "判断题", "4": "简答题", "5": "名词解释", "6": "论述题", "7": "计算题" };
    const typeName = typeNames[questionData.type] || "单选题";
    console.log("答题配置:", { aiEnabled: !!config.aiEnabled, aiApiKey: config.aiApiKey ? config.aiApiKey.slice(0, 8) + "..." : "(未填)", aiApiUrl: config.aiApiUrl || "(默认)", aiModel: config.aiModel, aiOnly: !!config.aiOnly, customApiEnabled: !!config.customApiEnabled, bankEnabled: config.bankEnabled, datamModel: config.datamModel, datamKey: config.customApiKey ? "已填" : "(未填)" });

    const settle = (p) => Promise.resolve(p).catch((e) => {
      console.log("渠道请求异常:", e);
      return null;
    });

    // ===== 缓存命中：同一题干 30 分钟内不重复请求（题库答案对同一题干是稳定的）=====
    const cacheKey = AnswerCache.key(questionData.question) + "|" + (questionData.type || "");
    const cached = config.aiOnly ? null : AnswerCache.get(cacheKey);
    if (cached) {
      console.log("命中答案缓存，跳过本次请求:", questionData.question.slice(0, 40));
      return cached.map(function(x) {
        return { ...x, cached: true };
      });
    }

    // ===== 仅AI模式：只问 AI =====
    if (config.aiOnly) {
      if (!config.aiEnabled || !config.aiApiKey) {
        return [{ form: "AI", answer: "", raw: "仅AI模式已开启，但未启用AI或未填密钥" }];
      }
      const aiOnlyRes = await settle(Inflight.run("ai|" + cacheKey, () => server.getAnswerFromAI(questionData)));
      if (aiOnlyRes) {
        const mapped = normalizeAnswer(aiOnlyRes.answer, questionData);
        if (Array.isArray(mapped) && mapped.length > 0) {
          aiOnlyRes.answer = mapped;
          return [aiOnlyRes];
        }
        aiOnlyRes.raw = aiOnlyRes.raw || String(aiOnlyRes.answer || "");
        aiOnlyRes.answer = "";
        return [aiOnlyRes];
      }
      return [{ form: "AI", answer: "" }];
    }

    // ===== 全渠道并行查询：自定义题库 + 在线题库 + AI =====
    const enabled = Array.isArray(config.bankEnabled) ? config.bankEnabled : ["tkh", "yzt", "yx", "mkt", "datam"];
    const tasks = [];
    const names = [];
    if (config.customApiEnabled && config.customApiUrl) {
      tasks.push(server.getAnswerFromCustomApi(questionData)), names.push("自定义题库");
    }
    enabled.includes("tkh") && (tasks.push(server.getAnswer(questionData)), names.push("题库海"));
    enabled.includes("yzt") && (tasks.push(server.getAnswer2(questionData)), names.push("一之题库"));
    enabled.includes("yx") && (tasks.push(server.getAnswer3(questionData)), names.push("言溪题库"));
    enabled.includes("mkt") && (tasks.push(server.getAnswer4(questionData)), names.push("muketool"));
    enabled.includes("datam") && config.datamBank !== false && config.customApiKey && (tasks.push(server.getAnswerFromLikeApi(questionData)), names.push("LIKE题库"));
    enabled.includes("ze") && config.zetoken && (tasks.push(server.getAnswer5(questionData)), names.push("ZE题库"));
    const askAI = config.aiEnabled && !!config.aiApiKey;
    askAI && (tasks.push(server.getAnswerFromAI(questionData)), names.push("AI"));

    if (0 === tasks.length) {
      return [{ form: "提示", answer: "", raw: "没有启用任何答题渠道：请开启AI，或勾选在线题库，或启用自定义题库" }];
    }
    console.log(`并行查询 ${tasks.length} 个渠道: ${names.join(" / ")}  题型: ${typeName}`);

    const settled = await Promise.all(tasks.map(settle)).then(function(arr) {
      return arr;
    });

    // ===== 结果整理：全部保留展示，按 自定义题库 > 在线题库 > AI 的顺序排列 =====
    const hits = [];
    const misses = [];
    settled.forEach(function(r) {
      if (!r) return;
      const mapped = normalizeAnswer(r.answer, questionData);
      if (Array.isArray(mapped) && mapped.length > 0 && !isJunkAnswer(mapped)) {
        r.answer = mapped;
        hits.push(r);
      } else {
        if (r.answer && String(r.answer).trim())
          r.raw = r.raw || ("题库返回无效内容(疑似付费/引流提示): " + String(r.answer).replace(/<[^>]*>/g, "").slice(0, 120));
        r.answer = "";
        (r.raw || r.form) && misses.push(r);
      }
    });

    const merged = (hits.length > 0 ? hits.concat(misses) : (misses.length > 0 ? misses : [{ form: "AI", answer: "" }]));
    hits.length > 0 ? console.log("命中渠道:", hits.map(function(h) {
      return h.form + "=" + (Array.isArray(h.answer) ? h.answer.join("|") : h.answer);
    }).join(" ; ")) : console.log("所有渠道均未取得可用答案");
    // 写入缓存（仅当有命中；未命中的题下次仍可重试）
    hits.length > 0 && AnswerCache.set(cacheKey, merged.map(function(x) {
      return { form: x.form, answer: x.answer, raw: x.raw, num: x.num, usenum: x.usenum };
    }));
    return merged;
  }, fillAnswer = (answer, questionData, html, iframeWindow) => {
    answer = answer.filter(function(item) {
      return item && !isJunkAnswer(item.answer) && (Array.isArray(item.answer) ? item.answer.length > 0 : String(item.answer || "").length > 0);
    }), console.log(answer);
    for (let i = 0; i < answer.length; i++) {
      if ("string" == typeof answer[i].answer)
        answer[i].answer = [answer[i].answer];
      let tmp = setAnswer(answer[i].answer, questionData, html, iframeWindow);
      if (tmp)
        return tmp;
    }
    return false;
  }, setAnswer = (answer, questionData, html, iframeWindow) => {
    switch (questionData.type) {
      case "0":
      case "1":
        const matchArr = matchAnswer(answer, questionData.options);
        matchArr.length > 0 && clearCurrent(html, iframeWindow);
        for (var i = 0; i < matchArr.length; i++)
          console.log($$1(html).find("li").eq(matchArr[i]), matchArr[i]), $$1(html).find("ul:eq(0) li :radio,:checkbox,textarea").eq(matchArr[i]).click(), $$1(html).find(".answerBg").eq(matchArr[i]).click(), $$1(html).find("li").eq(matchArr[i]).click();
        return matchArr.length > 0 && answer;
      case "3":
        return clearCurrent(html, iframeWindow), answer instanceof Array && (answer = answer[0]), $$1(html).find("ul:eq(0) li :radio,:checkbox,textarea").each(function() {
          "true" == $$1(this).val() ? answer.match(/(^|,)(True|true|正确|是|对|√|T|ri)(,|$)/) && $$1(this).click() : answer.match(/(^|,)(False|false|错误|否|错|×|F|wr)(,|$)/) && $$1(this).click();
        }), $$1(html).find(".answerBg").each(function() {
          "true" == $$1(this).find(".num_option").attr("data") ? answer.match(/(^|,)(True|true|正确|是|对|√|T|ri)(,|$)/) && $$1(this).click() : answer.match(/(^|,)(False|false|错误|否|错|×|F|wr)(,|$)/) && $$1(this).click();
        }), !!($$1(html).find("ul:eq(0) li :radio,:checkbox,textarea").is(":checked") || $$1(html).find(".check_answer").length > 0 || $$1(html).find(".check_answer_dx").length > 0) && answer;
      case "2":
      case "9":
      case "4":
      case "5":
      case "6":
      case "7":
        return clearCurrent(html, iframeWindow), $$1(html).find("textarea").each(function(index) {
          if (index < answer.length) {
            iframeWindow.UE.getEditor($$1(this).attr("name")).ready(function() {
              this.setContent(answer[index].replace(/第.空:/g, ""));
            });
          }
        }), answer;
      default:
        return false;
    }
  }, matchAnswer = (answer, options) => {
    answer = ((answer2) => {
      if (answer2 instanceof Array) {
        answer2 = answer2.filter(function(item) {
          return null !== item;
        });
        for (let i2 = 0; i2 < answer2.length; i2++)
          answer2[i2] = removeHtml(answer2[i2]);
      } else
        "string" == typeof answer2 && (answer2 = cl(answer2));
      return answer2;
    })(answer);
    for (var matchArr = [], i = 0; i < answer.length; i++)
      for (var j = 0; j < options.length; j++)
        answer[i] == options[j] && matchArr.push(j);
    return matchArr;
  }, clearCurrent = (item, iframeWindow) => {
    $$1(item).find(".answerBg, .textDIV, .eidtDiv").each(function() {
      ($$1(this).find(".check_answer").length || $$1(this).find(".check_answer_dx").length) && $$1(this).click();
    }), $$1(item).find("textarea").each(function() {
      iframeWindow.UE.getEditor($$1(this).attr("name")).ready(function() {
        this.setContent("");
      });
    }), $$1(item).find(":radio, :checkbox").prop("checked", false), $$1(item).find("textarea").each(function() {
      iframeWindow.UE.getEditor($$1(this).attr("name")).ready(function() {
        this.setContent("");
      });
    });
  }, useAskStore = pinia$1.defineStore({ id: "ask", state: () => ({ dialogVisible: true, count: 0, questionList: [], task: { name: "暂未加载", work: { questionList: [], inx: 0 }, video: [], log: [], status: "" } }), actions: { reset() {
    this.task.name = "暂未加载", this.task.work = { questionList: [], inx: 0 }, this.task.video = [], this.task.status = "", this.count = 0;
  }, select(index) {
    this.task.work.questionList[index].selected = true, this.task.work.inx = index;
    try {
      this.task.work.questionList[index].dom.scrollIntoView({ block: "center" });
    } catch (e) {
      log(e, "error");
    }
  }, get(index) {
    return this.task.work.questionList[index];
  }, insert(question) {
    this.task.work.questionList.push(question);
  }, update(index, question) {
    this.task.work.questionList[index] = question;
  }, log(msg, level = "info") {
    this.task.log.length > 20 && this.task.log.shift(), this.task.log.push({ time: (/* @__PURE__ */ new Date()).toLocaleTimeString(), msg, type: level });
  }, msg(msg) {
    this.task.status = msg;
  } } }), _sfc_main = vue.defineComponent({ setup() {
    const askstore = useAskStore(), { dialogVisible, count, questionList, task } = pinia$1.storeToRefs(askstore), askActiveName = vue.ref("first"), askActiveNames = vue.ref(["1"]), msg = vue.ref("<h3>本脚本仅用于学习交流，请24h内删除</h3><br><p style='color:red;'>禁止用于各种非法用途，否则后果自负</p><br><p>本脚本题库接口均来源于网络以及用户反馈添加，不对题库准确率以及可用性负责，请自行判断、评估是否使用。</p>"), formstoreObj = useformStore(), { forminput, dialogV, activeName } = pinia$1.storeToRefs(formstoreObj), ruleFormRef = vue.ref(), rules = vue.reactive({ interval: [{ required: true, message: "间隔时间不能为空" }, { type: "number", message: "间隔时间必须为数字" }, { validator: (rule, value) => value >= 1 ? Promise.resolve() : Promise.reject("间隔时间必须大于等于1") }], answerInterval: [{ required: true, message: "答题间隔不能为空" }, { type: "number", message: "答题间隔必须为数字" }, { validator: (rule, value) => value >= 1 ? Promise.resolve() : Promise.reject("答题间隔必须大于等于1") }], token: [{ validator: (rule, value) => {
      if (value) {
        return /^[a-zA-Z0-9]{6,}$/.test(value) ? Promise.resolve() : Promise.reject("token格式错误");
      }
      return Promise.resolve();
    } }] });
    vue.watch(() => forminput.value.aiApiUrl, (url) => formstoreObj.applyModelPresets(url), { immediate: true });
    return { count, dialogVisible, questionList, askActiveName, askActiveNames, task, msg, Aim: aim_default, handleClick: (e) => {
      askstore.select(e);
    }, dialogV, activeName, ruleFormRef, forminput, rules, submitForm: async (formEl) => {
      formEl && await formEl.validate((valid, fields) => {
        valid && (formstoreObj.saveConfig(forminput.value), ElementPlus.ElNotification({ title: "Success", message: "配置保存成功,请自行刷新页面", type: "success" }), dialogV.value = false);
      });
    }, fetchModels: () => formstoreObj.fetchModels(), userConfig, Setting: setting_default };
  } }), _hoisted_1 = { class: "dialog-footer" }, _hoisted_2 = { key: 0 }, _hoisted_3 = { class: "question_div" }, _hoisted_4 = { class: "question_ti" }, _hoisted_5 = { key: 0 }, _hoisted_6 = { key: 1 }, _hoisted_7 = { key: 2 }, _hoisted_8 = ["innerHTML"], _hoisted_9 = { key: 0, style: { "margin-top": "20px" } }, _hoisted_10 = { key: 1 }, _hoisted_11 = { key: 2 }, _hoisted_12 = { height: "100px" }, _hoisted_13 = ["innerHTML"];
  const Ask = _export_sfc(_sfc_main, [["render", function(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_el_button = vue.resolveComponent("el-button"), _component_el_switch = vue.resolveComponent("el-switch"), _component_el_input = vue.resolveComponent("el-input"), _component_el_input_number = vue.resolveComponent("el-input-number"), _component_el_option = vue.resolveComponent("el-option"), _component_el_select = vue.resolveComponent("el-select"), _component_el_checkbox = vue.resolveComponent("el-checkbox"), _component_el_checkbox_group = vue.resolveComponent("el-checkbox-group"), _component_el_tooltip = vue.resolveComponent("el-tooltip"), _component_el_form_item = vue.resolveComponent("el-form-item"), _component_el_tab_pane = vue.resolveComponent("el-tab-pane"), _component_el_tabs = vue.resolveComponent("el-tabs"), _component_el_form = vue.resolveComponent("el-form"), _component_el_dialog = vue.resolveComponent("el-dialog"), _component_el_text = vue.resolveComponent("el-text"), _component_el_skeleton = vue.resolveComponent("el-skeleton"), _component_el_card = vue.resolveComponent("el-card"), _component_el_divider = vue.resolveComponent("el-divider"), _component_el_col = vue.resolveComponent("el-col"), _component_el_row = vue.resolveComponent("el-row"), _component_el_scrollbar = vue.resolveComponent("el-scrollbar"), _component_el_tag = vue.resolveComponent("el-tag"), _component_el_alert = vue.resolveComponent("el-alert"), _component_el_empty = vue.resolveComponent("el-empty");
    return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [vue.createVNode(_component_el_button, { type: "danger", id: "csbutton", icon: _ctx.Setting, circle: "", onClick: _cache[0] || (_cache[0] = ($event) => _ctx.dialogV = !_ctx.dialogV) }, null, 8, ["icon"]), vue.createVNode(_component_el_dialog, { modelValue: _ctx.dialogV, "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.dialogV = $event), title: "💯超星学习通满分助手", width: "30%", modal: false, center: "", draggable: "" }, { footer: vue.withCtx(() => [vue.createElementVNode("span", _hoisted_1, [vue.createVNode(_component_el_button, { onClick: _cache[2] || (_cache[2] = ($event) => _ctx.dialogV = false) }, { default: vue.withCtx(() => [vue.createTextVNode("取消")]), _: 1 }), vue.createVNode(_component_el_button, { onClick: _cache[9] || (_cache[9] = ($event) => _ctx.fetchModels()) }, { default: vue.withCtx(() => [vue.createTextVNode("获取模型列表")]), _: 1 }), vue.createVNode(_component_el_button, { type: "primary", onClick: _cache[3] || (_cache[3] = ($event) => _ctx.submitForm(_ctx.ruleFormRef)) }, { default: vue.withCtx(() => [vue.createTextVNode("保存")]), _: 1 })])]), default: vue.withCtx(() => [vue.createVNode(_component_el_form, { ref: "ruleFormRef", rules: _ctx.rules, model: _ctx.forminput, class: "demo-ruleForm" }, { default: vue.withCtx(() => [vue.createVNode(_component_el_tabs, { class: "demo-tabs", modelValue: _ctx.activeName, "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.activeName = $event) }, { default: vue.withCtx(() => [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.userConfig, (item) => (vue.openBlock(), vue.createBlock(_component_el_tab_pane, { key: item.name, label: item.label, name: item.name }, { default: vue.withCtx(() => [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(item.config, (item1) => (vue.openBlock(), vue.createBlock(_component_el_form_item, { label: item1.label, prop: item1.name }, { default: vue.withCtx(() => [vue.createVNode(_component_el_tooltip, { class: "box-item", effect: "dark", content: item1.desc || "", placement: "top" }, { default: vue.withCtx(() => ["switch" === item1.type ? (vue.openBlock(), vue.createBlock(_component_el_switch, { key: 0, modelValue: _ctx.forminput[item1.name], "onUpdate:modelValue": ($event) => _ctx.forminput[item1.name] = $event }, null, 8, ["modelValue", "onUpdate:modelValue"])) : "input" === item1.type ? (vue.openBlock(), vue.createBlock(_component_el_input, { key: 1, modelValue: _ctx.forminput[item1.name], "onUpdate:modelValue": ($event) => _ctx.forminput[item1.name] = $event }, null, 8, ["modelValue", "onUpdate:modelValue"])) : "number" === item1.type ? (vue.openBlock(), vue.createBlock(_component_el_input_number, { key: 2, modelValue: _ctx.forminput[item1.name], "onUpdate:modelValue": ($event) => _ctx.forminput[item1.name] = $event }, null, 8, ["modelValue", "onUpdate:modelValue"])) : "select" === item1.type ? (vue.openBlock(), vue.createBlock(_component_el_select, { key: 3, modelValue: _ctx.forminput[item1.name], "onUpdate:modelValue": ($event) => _ctx.forminput[item1.name] = $event, placeholder: "请选择", filterable: true, allowCreate: true, defaultFirstOption: true, clearable: true }, { default: vue.withCtx(() => [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(item1.options, (item2) => (vue.openBlock(), vue.createBlock(_component_el_option, { key: item2.value, label: item2.label, value: item2.value }, null, 8, ["label", "value"]))), 128))]), _: 2 }, 1032, ["modelValue", "onUpdate:modelValue"])) : "checkbox" === item1.type ? (vue.openBlock(), vue.createBlock(_component_el_checkbox_group, { key: 4, modelValue: _ctx.forminput[item1.name], "onUpdate:modelValue": ($event) => _ctx.forminput[item1.name] = $event }, { default: vue.withCtx(() => [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(item1.options, (item2) => (vue.openBlock(), vue.createBlock(_component_el_checkbox, { key: item2.value, label: item2.value, name: item2.value }, { default: vue.withCtx(() => [vue.createTextVNode(vue.toDisplayString(item2.label), 1)]), _: 2 }, 1032, ["label", "name"]))), 128))]), _: 2 }, 1032, ["modelValue", "onUpdate:modelValue"])) : vue.createCommentVNode("", true)]), _: 2 }, 1032, ["content"])]), _: 2 }, 1032, ["label", "prop"]))), 256))]), _: 2 }, 1032, ["label", "name"]))), 128))]), _: 1 }, 8, ["modelValue"])]), _: 1 }, 8, ["rules", "model"])]), _: 1 }, 8, ["modelValue"]), (vue.openBlock(), vue.createBlock(vue.Teleport, { to: "body" }, [vue.createVNode(_component_el_button, { id: "zeokdjg", type: "success", plain: "", round: "", icon: _ctx.Aim, onClick: _cache[5] || (_cache[5] = ($event) => _ctx.dialogVisible = !_ctx.dialogVisible) }, { default: vue.withCtx(() => [vue.createTextVNode(vue.toDisplayString("暂未加载" == _ctx.task.name ? "等待任务加载" : "正在完成:" + _ctx.task.name), 1)]), _: 1 }, 8, ["icon"]), vue.createVNode(_component_el_dialog, { modelValue: _ctx.dialogVisible, "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => _ctx.dialogVisible = $event), width: "400px", title: "💯超星学习通满分助手", modal: false, "append-to-body": false, "lock-scroll": false, center: "", draggable: "" }, { default: vue.withCtx(() => [vue.createVNode(_component_el_button, { style: { "margin-bottom": "20px" }, type: "primary", onClick: _cache[6] || (_cache[6] = ($event) => _ctx.dialogV = !_ctx.dialogV), plain: "" }, { default: vue.withCtx(() => [vue.createTextVNode("打开配置")]), _: 1 }), vue.createVNode(_component_el_text, { class: "mx-1", size: "large", type: "danger" }, { default: vue.withCtx(() => [vue.createTextVNode("题库秘钥配置请点击这个按钮")]), _: 1 }), vue.createVNode(_component_el_tabs, { modelValue: _ctx.askActiveName, "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => _ctx.askActiveName = $event), class: "demo-tabs" }, { default: vue.withCtx(() => [vue.createVNode(_component_el_tab_pane, { label: "运行框", name: "first" }, { default: vue.withCtx(() => [_ctx.task.work.questionList.length > 0 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2, [vue.createElementVNode("div", _hoisted_3, [vue.createVNode(_component_el_card, { shadow: "hover" }, { default: vue.withCtx(() => [vue.createElementVNode("h1", _hoisted_4, [vue.createVNode(_component_el_text, { size: "large", truncated: "" }, { default: vue.withCtx(() => [vue.createTextVNode(vue.toDisplayString(_ctx.task.work.inx + 1 + "." + _ctx.task.work.questionList[_ctx.task.work.inx].question), 1)]), _: 1 })]), _ctx.task.work.questionList[_ctx.task.work.inx].answer ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_6, [vue.createElementVNode("p", null, [vue.createElementVNode("pre", null, vue.toDisplayString(_ctx.task.work.questionList[_ctx.task.work.inx].answer), 1)])])) : (vue.openBlock(), vue.createElementBlock("p", _hoisted_5, [vue.createVNode(_component_el_skeleton, { rows: 3, animated: "" })]))]), _: 1 })]), "考试" != _ctx.task.name ? (vue.openBlock(), vue.createBlock(_component_el_divider, { key: 0 }, { default: vue.withCtx(() => [vue.createTextVNode(" 题号 ")]), _: 1 })) : vue.createCommentVNode("", true), "考试" != _ctx.task.name ? (vue.openBlock(), vue.createBlock(_component_el_scrollbar, { key: 1, height: "100px" }, { default: vue.withCtx(() => [vue.createVNode(_component_el_row, null, { default: vue.withCtx(() => [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.task.work.questionList, (item, index) => (vue.openBlock(), vue.createBlock(_component_el_col, { span: 4, key: index }, { default: vue.withCtx(() => [vue.createVNode(_component_el_button, { type: item.status || "info", plain: "", class: "question_btn", onClick: ($event) => _ctx.handleClick(index) }, { default: vue.withCtx(() => [vue.createTextVNode(vue.toDisplayString(index + 1), 1)]), _: 2 }, 1032, ["type", "onClick"])]), _: 2 }, 1024))), 128))]), _: 1 })]), _: 1 })) : vue.createCommentVNode("", true), _ctx.task.work.questionList[_ctx.task.work.inx].allAnswer ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_7, [vue.createVNode(_component_el_divider, null, { default: vue.withCtx(() => [vue.createTextVNode(" 接口返回 ")]), _: 1 }), vue.createVNode(_component_el_tabs, { "tab-position": "left", style: { height: "200px" }, class: "demo-tabs" }, { default: vue.withCtx(() => [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.task.work.questionList[_ctx.task.work.inx].allAnswer, (item, index) => (vue.openBlock(), vue.createBlock(_component_el_tab_pane, { label: item.form }, { default: vue.withCtx(() => [vue.createElementVNode("div", null, [vue.createElementVNode("div", { innerHTML: (item.answer || item.raw || "暂无答案") + "<br><p style = 'color:red;'>如果要填写付费秘钥，在本悬浮窗最上方的打开配置中填入秘钥，切记填写完要刷新页面才会生效</p>" }, null, 8, _hoisted_8), null != item.num ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_9, [vue.createElementVNode("div", null, [vue.createVNode(_component_el_tag, { class: "ml-2", type: "info" }, { default: vue.withCtx(() => [vue.createTextVNode("已用次数:" + vue.toDisplayString(item.usenum), 1)]), _: 2 }, 1024)]), vue.createElementVNode("div", null, [vue.createVNode(_component_el_tag, { class: "ml-2", type: "success" }, { default: vue.withCtx(() => [vue.createTextVNode("剩余次数:" + vue.toDisplayString(item.num), 1)]), _: 2 }, 1024)])])) : vue.createCommentVNode("", true)])]), _: 2 }, 1032, ["label"]))), 256))]), _: 1 })])) : vue.createCommentVNode("", true)])) : _ctx.task.video.status ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_10, [vue.createVNode(_component_el_alert, { title: "倍速有风险，挂科两行泪", type: "error", center: "", "show-icon": "" }), vue.createVNode(_component_el_text, { class: "mx-1", size: "large", type: "danger" }, { default: vue.withCtx(() => [vue.createTextVNode(" 正在完成视频任务 ")]), _: 1 })])) : (vue.openBlock(), vue.createElementBlock("div", _hoisted_11, [vue.createElementVNode("div", _hoisted_12, [vue.createVNode(_component_el_empty, { description: _ctx.task.name }, null, 8, ["description"])])]))]), _: 1 }), vue.createVNode(_component_el_tab_pane, { label: "运行日志", name: "second" }, { default: vue.withCtx(() => [vue.createVNode(_component_el_scrollbar, { height: "200px" }, { default: vue.withCtx(() => [vue.createVNode(_component_el_row, null, { default: vue.withCtx(() => [vue.createVNode(_component_el_col, { span: 24 }, { default: vue.withCtx(() => [(vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.task.log, (item, index) => (vue.openBlock(), vue.createElementBlock("p", { key: index, class: "cx_log" }, [vue.createVNode(_component_el_text, { size: "small", type: "info", class: "mx-1" }, { default: vue.withCtx(() => [vue.createTextVNode(vue.toDisplayString(item.time), 1)]), _: 2 }, 1024), vue.createVNode(_component_el_text, { class: "mx-1", type: "info" == item.type ? "" : item.type }, { default: vue.withCtx(() => [vue.createTextVNode(vue.toDisplayString(" " + item.msg), 1)]), _: 2 }, 1032, ["type"])]))), 128))]), _: 1 })]), _: 1 })]), _: 1 })]), _: 1 }), vue.createVNode(_component_el_tab_pane, { label: "公告", name: "msg" }, { default: vue.withCtx(() => [vue.createVNode(_component_el_card, { shadow: "hover" }, { default: vue.withCtx(() => [vue.createElementVNode("div", { innerHTML: _ctx.msg }, null, 8, _hoisted_13)]), _: 1 })]), _: 1 })]), _: 1 }, 8, ["modelValue"]), vue.createElementVNode("p", null, [_ctx.task.status ? (vue.openBlock(), vue.createBlock(_component_el_tag, { key: 0 }, { default: vue.withCtx(() => [vue.createTextVNode(vue.toDisplayString(_ctx.task.status), 1)]), _: 1 })) : vue.createCommentVNode("", true)])]), _: 1 }, 8, ["modelValue"])]))], 64);
  }], ["__scopeId", "data-v-c3c6b09f"]]);
  class Cx {
    constructor() {
      __publicField(this, "app");
      __publicField(this, "askStore");
      __publicField(this, "ServerApi");
      __publicField(this, "defaultConfig");
      this.app = vue.createApp(Ask).use(ElementPlus).use(pinia$1.createPinia()), this.askStore = useAskStore(), this.ServerApi = new ServerApi(), this.defaultConfig = getConfig(), this.app.mount((() => {
        const div = _unsafeWindow.top.document.createElement("div");
        return div.id = "xxxxzx", _unsafeWindow.top.document.getElementById(div.id) || _unsafeWindow.top.document.body.append(div), div;
      })());
    }
    innerbook() {
    }
    async audio(iframeWindow) {
      this.askStore.reset(), this.askStore.task.name = "视频音频";
      const audio = iframeWindow.document.getElementById("audio_html5_api");
      return audio.muted = true, audio.autoplay = true, audio.volume = 0, audio.play().then(function() {
        console.log("播放成功");
      }).catch(function(error) {
        "NotAllowedError" === error.name ? ElementPlus.ElMessageBox.alert("由于自动播放需要用户点击过浏览器，请确认即可", "温馨提示", { confirmButtonText: "确认", callback: () => {
          audio.play();
        } }) : console.error("视频播放失败，原因：", error);
      }), new Promise((resolve) => {
        const intervalId = setInterval(() => {
          audio.ended ? (clearInterval(intervalId), log("监听到音频已完成", "success"), resolve()) : audio.paused && audio.play();
        }, 1e3);
        audio.addEventListener("ended", function() {
          log("监听到音频已完成1", "success"), audio.pause(), clearInterval(intervalId), resolve();
        });
      });
    }
    async video(iframeWindow) {
      this.askStore.reset(), this.askStore.task.name = "视频", this.askStore.task.video.status = 1, await waitElementLoaded(iframeWindow, "#video_html5_api"), console.log("视频加载完成");
      const player = iframeWindow.videojs("video_html5_api"), playerButton = iframeWindow.document.querySelector(".vjs-big-play-button");
      player.muted(true), player.playbackRate(16), player.play();

      // 生成随机暂停时间（30-93秒）
      const randomPauseTime = Math.floor(Math.random() * (93 - 30 + 1)) + 30;
      let pauseTimer = null;
      let mouseMoveTimer = null;

      // 随机暂停功能
      const scheduleRandomPause = () => {
        const delay = Math.floor(Math.random() * (93 - 30 + 1) + 30) * 1000;
        pauseTimer = setTimeout(() => {
          if (!player.paused()) {
            player.pause();
            console.log(`[视频] 已随机暂停，暂停时间: ${delay / 1000}秒`);
            // 暂停2-5秒后恢复播放
            setTimeout(() => {
              if (player.paused() && "isUnFinishJob" in iframeWindow && iframeWindow.isUnFinishJob()) {
                player.play();
                console.log("[视频] 已恢复播放");
                scheduleRandomPause();
              }
            }, Math.floor(Math.random() * (5 - 2 + 1) + 2) * 1000);
          }
        }, delay);
      };
      scheduleRandomPause();

      // 模拟鼠标滑动功能
      const simulateMouseMovement = () => {
        const doc = iframeWindow.document;
        const videoElement = doc.querySelector("#video_html5_api") || doc.body;

        // 生成随机位置
        const rect = videoElement.getBoundingClientRect();
        const x = Math.floor(Math.random() * rect.width) + rect.left;
        const y = Math.floor(Math.random() * rect.height) + rect.top;

        // 创建并分发鼠标事件
        const events = ["mousemove", "mouseover", "mouseenter"];
        events.forEach(eventType => {
          const event = new MouseEvent(eventType, {
            bubbles: true,
            cancelable: true,
            view: iframeWindow,
            clientX: x,
            clientY: y,
            screenX: x + (iframeWindow.screenX || 0),
            screenY: y + (iframeWindow.screenY || 0),
            movementX: Math.floor(Math.random() * 10) - 5,
            movementY: Math.floor(Math.random() * 10) - 5
          });
          videoElement.dispatchEvent(event);
        });

        // 随机滚动页面
        if (Math.random() > 0.7) {
          const scrollAmount = Math.floor(Math.random() * 100) - 50;
          iframeWindow.scrollBy(0, scrollAmount);
        }
      };

      // 每3-8秒模拟一次鼠标活动
      const scheduleMouseMovement = () => {
        const delay = Math.floor(Math.random() * (8 - 3 + 1) + 3) * 1000;
        mouseMoveTimer = setTimeout(() => {
          simulateMouseMovement();
          if ("isUnFinishJob" in iframeWindow && iframeWindow.isUnFinishJob()) {
            scheduleMouseMovement();
          }
        }, delay);
      };
      scheduleMouseMovement();

      await new Promise((resolve) => {
        const intervalId = setInterval(() => {
          "isUnFinishJob" in iframeWindow && iframeWindow.isUnFinishJob() ? player.paused() && (playerButton == null ? void 0 : playerButton.click()) : (clearInterval(intervalId), clearTimeout(pauseTimer), clearTimeout(mouseMoveTimer), resolve());
        }, 1e3), pauseBase = player.pause;
        player.pause = function() {
          player.currentTime() >= player.duration() && (console.log("视频播放完成"), player.pause = pauseBase, clearTimeout(pauseTimer), clearTimeout(mouseMoveTimer), resolve());
        }, player.on("ended", () => {
          console.log("视频播放完成1"), player.pause = pauseBase, player.pause(), clearInterval(intervalId), clearTimeout(pauseTimer), clearTimeout(mouseMoveTimer), resolve();
        });
      }), console.log("任务点完成");
    }
    work(iframeWindow) {
      return new Promise(async (resolve) => {
        try {
          decode(iframeWindow);
        } catch (e) {
          console.log("加密字体解码失败，跳过解码(不影响答题):", e);
        }
        const Timu = iframeWindow.document.querySelectorAll(".TiMu");
        if (!Timu)
          return void resolve();
        let ques = [], succ = 0;
        for (let i = 0; i < Timu.length; i++) {
          let data;
          try {
            data = getQuestion("1", Timu[i]);
          } catch (e) {
            console.log(`第${i + 1}题解析失败，已跳过:`, e);
            continue;
          }
          console.log(data), ques.push(data);
        }
        if (0 === ques.length) {
          this.askStore.log("未解析到题目，页面结构可能已变化", "error");
          return void resolve();
        }
        this.askStore.reset(), this.askStore.count = ques.length, this.askStore.task.name = "章节测验";
        for (let i = 0; i < ques.length; i++) {
          await PauseCtl.wait(), PauseCtl.paused && (this.askStore.task.status = "已暂停，点左下角「继续」恢复");
          await randomSleep(this.defaultConfig.answerIntervalMin, this.defaultConfig.answerIntervalMax), this.askStore.insert(ques[i]), this.askStore.task.work.inx = i;
          let data = await getAnswers(ques[i], iframeWindow);
          this.askStore.get(i).allAnswer = data;
          let tmp = fillAnswer(data, ques[i], Timu[i], iframeWindow);
          tmp ? (this.askStore.get(i).status = "primary", this.askStore.get(i).answer = tmp, succ++) : (this.askStore.get(i).status = "danger", this.askStore.get(i).answer = "暂无答案"), this.askStore.get(i).dom = Timu[i];
        }
        // ===== 题库复核环节：用题库交叉检查答案 =====
        if (this.defaultConfig.verifyAnswers && ques.length > 0) {
          this.askStore.log("开始题库复核：交叉检查每道题答案", "info");
          let fixed = 0, checked = 0;
          for (let i = 0; i < ques.length; i++) {
            const raw = this.askStore.get(i).answer;
            if (raw == null || "暂无答案" === raw) continue;
            const cur = Array.isArray(raw) ? raw : [raw];
            if (0 === cur.length) continue;
            checked++;
            let vr;
            try {
              vr = await bankVote(ques[i], cur, iframeWindow, this.askStore.get(i).allAnswer);
            } catch (e) {
              this.askStore.log(`第${i + 1}题复核异常: ${(e && e.message) || e}`, "error");
              continue;
            }
            const bestText = vr.best ? vr.best.answer.join("、") : "";
            const srcList = vr.best ? vr.best.sources.join("/") : "";
            if (!vr.checkable) {
              this.askStore.log(`第${i + 1}题为文字题，不做对错判定${bestText ? "，题库参考答案：「" + bestText + "」" : ""}`, "info");
            } else if (vr.mismatch) {
              this.askStore.log(`第${i + 1}题复核不一致：当前「${cur.join("、")}」，题库「${bestText}」(${srcList})`, "warning");
              if (this.defaultConfig.verifyAutoFix) {
                try {
                  const ok = setAnswer(vr.best.answer, ques[i], Timu[i], iframeWindow);
                  if (ok) {
                    this.askStore.get(i).answer = vr.best.answer;
                    this.askStore.get(i).status = "primary";
                    fixed++;
                    this.askStore.log(`第${i + 1}题已按题库修正为「${bestText}」`, "success");
                  } else {
                    this.askStore.log(`第${i + 1}题修正失败（页面未接受），保持原答案`, "error");
                  }
                } catch (e) {
                  this.askStore.log(`第${i + 1}题修正异常: ${(e && e.message) || e}`, "error");
                }
              }
            } else if (vr.agree) {
              this.askStore.log(`第${i + 1}题复核一致(${srcList})`, "success");
            } else {
              this.askStore.log(`第${i + 1}题题库无一致结论${bestText ? "，参考：「" + bestText + "」" : ""}，保持原答案`, "info");
            }
          }
          this.askStore.log(`题库复核完成：检查 ${checked} 题，修正 ${fixed} 题`, "success");
        }
        await PauseCtl.wait();
        this.defaultConfig.autoSubmit ? (succ / ques.length < this.defaultConfig.minAccuracy ? (this.askStore.log("章节测验正确率不足，暂存", "error"), iframeWindow.alert = function(e) {
          console.log("alert 方法被阻止", e);
        }, iframeWindow.noSubmit()) : (await randomSleep(this.defaultConfig.submitDelayMin, this.defaultConfig.submitDelayMax), iframeWindow.btnBlueSubmit(), await sleep(3), iframeWindow.submitCheckTimes(), this.askStore.log("章节测验已完成", "success"), await randomSleep(5, 10), this.askStore.log("正在刷新页面...", "info"), iframeWindow.location.reload()), this.askStore.task.status = `章节测验已完成，等待切换,正确率:${succ}/${ques.length}`, resolve()) : (this.askStore.log("已完成答题，未开启自动提交，等待手动提交中", "success"), this.askStore.task.status = `正在等待手动提交,正确率:${succ}/${ques.length}`);
      });
    }
    homework() {
      return new Promise(async (resolve) => {
        const Timu = _unsafeWindow.document.querySelectorAll(".questionLi");
        if (!Timu)
          return void resolve();
        let ques = [];
        for (let i = 0; i < Timu.length; i++) {
          let data;
          try {
            data = getQuestion("2", Timu[i]);
          } catch (e) {
            console.log(`第${i + 1}题解析失败，已跳过:`, e);
            continue;
          }
          ques.push(data);
        }
        this.askStore.reset(), this.askStore.count = ques.length, this.askStore.task.name = "作业";
        for (let i = 0; i < ques.length; i++) {
          await PauseCtl.wait(), PauseCtl.paused && (this.askStore.task.status = "已暂停，点左下角「继续」恢复");
          await randomSleep(this.defaultConfig.answerIntervalMin, this.defaultConfig.answerIntervalMax), this.askStore.insert(ques[i]), this.askStore.task.work.inx = i;
          let data = await getAnswers(ques[i]);
          this.askStore.get(i).allAnswer = data;
          let tmp = fillAnswer(data, ques[i], Timu[i], _unsafeWindow);
          tmp ? (this.askStore.get(i).status = "primary", this.askStore.get(i).answer = tmp) : (this.askStore.get(i).status = "danger", this.askStore.get(i).answer = "暂无答案"), this.askStore.get(i).dom = Timu[i];
        }
        // ===== 题库复核环节 =====
        if (this.defaultConfig.verifyAnswers && ques.length > 0) {
          this.askStore.log("开始题库复核：交叉检查每道题答案", "info");
          let fixed = 0;
          for (let i = 0; i < ques.length; i++) {
            const raw = this.askStore.get(i).answer;
            if (raw == null || "暂无答案" === raw) continue;
            const cur = Array.isArray(raw) ? raw : [raw];
            if (0 === cur.length) continue;
            let vr;
            try {
              vr = await bankVote(ques[i], cur, _unsafeWindow, this.askStore.get(i).allAnswer);
            } catch (e) {
              this.askStore.log(`第${i + 1}题复核异常: ${(e && e.message) || e}`, "error");
              continue;
            }
            const bestText = vr.best ? vr.best.answer.join("、") : "";
            const srcList = vr.best ? vr.best.sources.join("/") : "";
            if (!vr.checkable) {
              this.askStore.log(`第${i + 1}题为文字题，不做对错判定${bestText ? "，题库参考答案：「" + bestText + "」" : ""}`, "info");
            } else if (vr.mismatch) {
              this.askStore.log(`第${i + 1}题复核不一致：当前「${cur.join("、")}」，题库「${bestText}」(${srcList})`, "warning");
              if (this.defaultConfig.verifyAutoFix) {
                try {
                  const ok = setAnswer(vr.best.answer, ques[i], Timu[i], _unsafeWindow);
                  if (ok) {
                    this.askStore.get(i).answer = vr.best.answer;
                    this.askStore.get(i).status = "primary";
                    fixed++;
                    this.askStore.log(`第${i + 1}题已按题库修正为「${bestText}」`, "success");
                  }
                } catch (e) {
                  this.askStore.log(`第${i + 1}题修正异常: ${(e && e.message) || e}`, "error");
                }
              }
            } else if (vr.agree) {
              this.askStore.log(`第${i + 1}题复核一致(${srcList})`, "success");
            } else {
              this.askStore.log(`第${i + 1}题题库无一致结论${bestText ? "，参考：「" + bestText + "」" : ""}，保持原答案`, "info");
            }
          }
          this.askStore.log(`题库复核完成：修正 ${fixed} 题`, "success");
        }
      });
    }
    exam() {
      return new Promise(async (resolve) => {
        this.askStore.reset();
        this.askStore.task.name = "考试";
        const cfg = this.defaultConfig;
        const answeredMap = {};
        const getMarkHtml = () => {
          try {
            const el = _unsafeWindow.document.querySelector(".questionLi .mark_name") || _unsafeWindow.document.querySelector(".mark_name");
            return el ? el.innerHTML : "";
          } catch (e) {
            return "";
          }
        };
        let guard = 0, finished = false;
        this.askStore.log("考试模式启动：自动识别并整卷作答", "success");
        while (!finished && guard++ < (cfg.autoExam ? 400 : 3600)) {
          await PauseCtl.wait(), PauseCtl.paused && (this.askStore.task.status = "已暂停，点左下角「继续」恢复");
          await waitElementLoaded(_unsafeWindow, ".mark_name");
          let data;
          try {
            data = getQuestion("3", _unsafeWindow.document.body);
          } catch (e) {
            this.askStore.log("考试题目解析失败: " + ((e && e.message) || e), "error");
            break;
          }
          if (!answeredMap[data.question]) {
            answeredMap[data.question] = true;
            const idx = this.askStore.task.work.questionList.length;
            this.askStore.insert(data);
            this.askStore.task.work.inx = idx;
            this.askStore.task.status = `正在作答第 ${idx + 1} 题`;
            const answers = await getAnswers(data);
            this.askStore.get(idx).allAnswer = answers;
            const tmp = fillAnswer(answers, data, _unsafeWindow.document.getElementsByClassName("mark_table")[0], _unsafeWindow);
            if (tmp) {
              this.askStore.get(idx).status = "primary", this.askStore.get(idx).answer = tmp, this.askStore.log(`第 ${idx + 1} 题已填写`, "success");
            } else {
              this.askStore.get(idx).status = "danger", this.askStore.get(idx).answer = "暂无答案", this.askStore.log(`第 ${idx + 1} 题暂无答案`, "error");
            }
            // ===== 题库复核：考试翻页后无法回填，故每题填写后立即复核 =====
            if (cfg.verifyAnswers && tmp) {
              const cur = Array.isArray(tmp) ? tmp : [tmp];
              let vr = null;
              try {
                vr = await bankVote(data, cur, _unsafeWindow, this.askStore.get(idx).allAnswer);
              } catch (e) {
                this.askStore.log(`第 ${idx + 1} 题复核异常: ${(e && e.message) || e}`, "error");
              }
              if (vr) {
                const bestText = vr.best ? vr.best.answer.join("、") : "";
                const srcList = vr.best ? vr.best.sources.join("/") : "";
                if (!vr.checkable) {
                  this.askStore.log(`第 ${idx + 1} 题为文字题，不做对错判定${bestText ? "，题库参考答案：「" + bestText + "」" : ""}`, "info");
                } else if (vr.mismatch) {
                  this.askStore.log(`第 ${idx + 1} 题复核不一致：当前「${cur.join("、")}」，题库「${bestText}」(${srcList})`, "warning");
                  if (cfg.verifyAutoFix) {
                    try {
                      const ok = setAnswer(vr.best.answer, data, _unsafeWindow.document.getElementsByClassName("mark_table")[0], _unsafeWindow);
                      if (ok) {
                        this.askStore.get(idx).answer = vr.best.answer;
                        this.askStore.log(`第 ${idx + 1} 题已按题库修正为「${bestText}」`, "success");
                      } else {
                        this.askStore.log(`第 ${idx + 1} 题修正失败（页面未接受），保持原答案`, "error");
                      }
                    } catch (e) {
                      this.askStore.log(`第 ${idx + 1} 题修正异常: ${(e && e.message) || e}`, "error");
                    }
                  }
                } else if (vr.agree) {
                  this.askStore.log(`第 ${idx + 1} 题复核一致(${srcList})`, "success");
                } else {
                  this.askStore.log(`第 ${idx + 1} 题题库无一致结论${bestText ? "，参考：「" + bestText + "」" : ""}，保持原答案`, "info");
                }
              }
            }
          }
          if (!cfg.autoExam) {
            this.askStore.task.status = "已完成当前题，等待手动切换（切到新题自动继续）";
            await sleep(2);
            continue;
          }
          await randomSleep(cfg.answerIntervalMin, cfg.answerIntervalMax);
          const before = getMarkHtml();
          const nextButton = $('.nextDiv .jb_btn:contains("下一题")');
          if (nextButton && nextButton.length > 0) {
            nextButton.click();
          } else if ("function" == typeof _unsafeWindow.getTheNextQuestion) {
            _unsafeWindow.getTheNextQuestion(1);
          } else {
            this.askStore.log("已到最后一题，考试答题完成", "success");
            this.askStore.task.status = "考试答题完成";
            finished = true;
            break;
          }
          let changed = false;
          for (let t = 0; t < 40 && !changed; t++) {
            await sleep(0.5);
            const cur = getMarkHtml();
            changed = "" !== cur && cur !== before;
          }
          if (!changed) {
            this.askStore.log("页面未出现新题目，判定答题完成", "success");
            this.askStore.task.status = "考试答题完成";
            finished = true;
            break;
          }
        }
        await PauseCtl.wait();
        if (cfg.examAutoSubmit && finished) {
          await this.examSubmit();
        }
        resolve();
      });
    }
    async examSubmit() {
      this.askStore.log("配置已开启考试自动交卷，开始执行交卷流程", "warning");
      await sleep(3);
      try {
        const previewBtn = $(".completeBtn");
        if (previewBtn && previewBtn.length > 0)
          previewBtn.click();
        else if ("function" == typeof _unsafeWindow.topreview)
          _unsafeWindow.topreview();
        else {
          this.askStore.log("未找到整卷预览入口，请手动交卷", "error");
          return;
        }
        await sleep(3);
        const submitBtn = $('a:contains("交卷")').filter(function() {
          return "交卷" === $(this).text().trim();
        });
        if (submitBtn && submitBtn.length > 0) {
          this.askStore.log("点击交卷...", "warning");
          submitBtn.click();
        } else {
          this.askStore.log("预览页未找到交卷按钮，请手动交卷", "error");
          return;
        }
        for (let t = 0; t < 20; t++) {
          await sleep(0.5);
          const confirmBtn = $('.jb_btn:contains("确定"), .btnBlue:contains("确定"), #popok, .layui-layer-btn0, a:contains("确认")');
          if (confirmBtn && confirmBtn.length > 0) {
            this.askStore.log("检测到交卷确认弹窗，点击确定...", "warning");
            confirmBtn.click();
            break;
          }
        }
        await sleep(2);
        this.askStore.log("自动交卷流程执行完毕，请自行确认交卷结果", "success");
      } catch (e) {
        this.askStore.log("自动交卷异常: " + ((e && e.message) || e), "error");
      }
    }
// ===== 讨论任务（module=insertbbs）：AI 生成简短发言并提交 =====
    async discuss(iframeWindow, meta) {
      return new Promise(async (resolve) => {
        const topic = String((meta && (meta.title || meta.name)) || "").trim();
        this.askStore.reset();
        this.askStore.task.name = "讨论";
        if (!topic) {
          this.askStore.log("讨论题目为空，跳过", "error");
          return void resolve(false);
        }
        this.askStore.log("开始处理讨论: " + topic.replace(/\s+/g, " ").slice(0, 50), "info");
        await PauseCtl.wait();

        let replies = [];
        try {
          replies = this.discussCollectReplies(iframeWindow);
        } catch (e) {
        }
        if (replies.length > 0) this.askStore.log(`收集到 ${replies.length} 条他人发言，作为参考`, "success");

        let text = "";
        try {
          text = await new ServerApi(iframeWindow).getAnswerForDiscussion(topic, replies, {
            course: getCourseName(),
            chapter: getCatalogChapter()
          });
        } catch (e) {
          this.askStore.log("讨论AI生成异常: " + ((e && e.message) || e), "error");
        }
        if (!text) {
          this.askStore.log("AI未生成讨论内容，跳过（请确认已启用AI并填写密钥）", "error");
          return void resolve(false);
        }
        this.askStore.log("已生成发言: " + text.slice(0, 60) + (text.length > 60 ? "…" : ""), "success");
        try {
          this.askStore.insert({ question: topic, options: [], type: "4", answer: text, section: "" });
          this.askStore.get(0).status = "primary";
          this.askStore.get(0).answer = text;
        } catch (e) {
        }

        // 打开发言框并填入（最多 3 次）
        let filled = "";
        for (let attempt = 0; attempt < 3 && !filled; attempt++) {
          filled = this.discussFill(iframeWindow, text);
          if (!filled) {
            const opened = this.discussOpenEditor(iframeWindow);
            this.askStore.log(opened ? "已点击「回复」展开输入框，重试填写…" : "未找到输入框，重试中…", "warning");
            await sleep(1.5);
          }
        }
        if (!filled) {
          this.askStore.log("讨论 iframe 内没有可编辑框（该课程讨论需在独立页面作答）", "warning");
          return void resolve(false);
        }
        this.askStore.log("发言已填入输入框(" + filled + ")", "success");
        await PauseCtl.wait();
        await sleep(1);

        if (!this.discussSubmit(iframeWindow)) {
          this.askStore.log("未找到提交按钮，内容已填好请手动提交", "error");
          return void resolve(false);
        }
        // 匿名确认弹窗：选取消（匿名不计成绩）
        try {
          const anon = iframeWindow.document.querySelector(".popAnonymousShowHide");
          if (anon && anon.getClientRects && anon.getClientRects().length) {
            const cancel = anon.querySelector(".cancle, .btn_92_cancel");
            cancel && cancel.click();
            this.askStore.log("已取消匿名，按实名提交", "warning");
          }
        } catch (e) {
        }
        await sleep(2);
        this.askStore.task.status = "讨论已完成";
        resolve(true);
      });
    }
    discussOpenTab(iframe) {
      try {
        const win = iframe && iframe.contentWindow;
        let url = "";
        // ① iframe 自身就是讨论页
        try {
          const loc = win.location.href;
          if (/\/bbs\/|course\/topic|jumpToTopicDetail/i.test(loc)) url = loc;
        } catch (e) {
        }
        // ② iframe 里第一条指向讨论详情的链接
        if (!url && win && win.document) {
          const a = Array.from(win.document.querySelectorAll('a[href]')).find((n) => /\/bbs\/|course\/topic|jumpToTopicDetail/i.test(n.getAttribute("href") || ""));
          if (a) {
            try {
              url = new URL(a.getAttribute("href"), win.location.href).href;
            } catch (e) {
              url = a.href;
            }
          }
        }
        if (!url) return false;
        const key = "mfBbsOpened";
        let seen = [];
        try {
          seen = JSON.parse(sessionStorage.getItem(key) || "[]");
        } catch (e) {
          seen = [];
        }
        if (seen.indexOf(url) !== -1) return false;
        seen.push(url);
        try {
          sessionStorage.setItem(key, JSON.stringify(seen.slice(-20)));
        } catch (e) {
        }
        window.open(url, "_blank");
        this.askStore.log("已在后台标签打开讨论页，将由该页脚本自动作答", "success");
        return true;
      } catch (e) {
        return false;
      }
    }
    discussCollectReplies(iframeWindow) {
      const doc = iframeWindow.document;
      const out = [];
      // 精确：超星讨论页 .topicDetail_replyItem .replyContent（content 属性是纯文本）
      try {
        doc.querySelectorAll(".topicDetail_replyItem .replyContent, .replyContent[content]").forEach((el) => {
          const t = String(el.getAttribute("content") || el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
          if (t.length >= 6 && t.length <= 800 && -1 === out.indexOf(t)) out.push(t);
        });
      } catch (e) {
      }
      if (out.length > 0) return out.slice(0, 8);
      const sels = [".reply_content", ".replyContent", ".reply-content", ".answer-content", ".ans-content", ".bbs_reply .content", ".reply_list .content", ".reply-item .content", ".replyItem .content", ".content-box .content", ".fr .content", ".detail p"];
      sels.forEach((s) => {
        try {
          doc.querySelectorAll(s).forEach((el) => {
            const t = String(el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
            if (t.length >= 6 && t.length <= 800 && -1 === out.indexOf(t)) out.push(t);
          });
        } catch (e) {
        }
      });
      return out.slice(0, 6);
    }
    discussFill(iframeWindow, text) {
      const doc = iframeWindow.document;
      const visible = (el) => {
        try {
          return !!(el.getClientRects && el.getClientRects().length);
        } catch (e) {
          return false;
        }
      };
      // 精确：超星讨论页的回复框 .textareawrap textarea
      const precise = Array.from(doc.querySelectorAll(".editContainer textarea, .textareawrap textarea")).filter(visible)[0] || doc.querySelector(".editContainer textarea, .textareawrap textarea");
      if (precise) {
        try {
          precise.focus && precise.focus();
          precise.value = text;
          precise.dispatchEvent(new iframeWindow.Event("input", { bubbles: true }));
          precise.dispatchEvent(new iframeWindow.Event("change", { bubbles: true }));
          precise.dispatchEvent(new iframeWindow.Event("keyup", { bubbles: true }));
          precise.scrollIntoView && precise.scrollIntoView({ block: "center" });
          return "discuss-textarea";
        } catch (e) {
        }
      }
      // ① 富文本编辑器 UE
      const tas = Array.from(doc.querySelectorAll("textarea"));
      for (const ta of tas) {
        const name = ta.getAttribute("name") || ta.id;
        try {
          if (name && iframeWindow.UE && typeof iframeWindow.UE.getEditor === "function") {
            const ed = iframeWindow.UE.getEditor(name);
            if (ed && ed.setContent) {
              ed.setContent(text.replace(/\n/g, "<br>"));
              return "UE:" + name;
            }
          }
        } catch (e) {
        }
        if (visible(ta) || ta.id || ta.name) {
          try {
            ta.value = text;
            ta.dispatchEvent(new iframeWindow.Event("input", { bubbles: true }));
            ta.dispatchEvent(new iframeWindow.Event("change", { bubbles: true }));
            return "textarea:" + (name || "未命名");
          } catch (e) {
          }
        }
      }
      // ② contenteditable 区域
      const ces = Array.from(doc.querySelectorAll('[contenteditable="true"], .edui-body-container, .edui-iframe'));
      for (const ce of ces) {
        if (!visible(ce)) continue;
        try {
          ce.focus && ce.focus();
          if (ce.tagName === "IFRAME") {
            const bd = ce.contentDocument && ce.contentDocument.body;
            if (!bd) continue;
            bd.innerHTML = text.replace(/\n/g, "<br>");
            bd.dispatchEvent(new iframeWindow.Event("input", { bubbles: true }));
            return "edui-iframe";
          }
          ce.innerHTML = text.replace(/\n/g, "<br>");
          ce.dispatchEvent(new iframeWindow.Event("input", { bubbles: true }));
          return "contenteditable";
        } catch (e) {
        }
      }
      // ③ 页面内嵌套的 ueditor iframe
      const frames = Array.from(doc.querySelectorAll("iframe"));
      for (const f of frames) {
        try {
          const bd = f.contentDocument && f.contentDocument.body;
          if (bd && bd.getAttribute && "true" === bd.getAttribute("contenteditable")) {
            bd.innerHTML = text.replace(/\n/g, "<br>");
            bd.dispatchEvent(new iframeWindow.Event("input", { bubbles: true }));
            return "nested-iframe";
          }
        } catch (e) {
        }
      }
      return "";
    }
    discussOpenEditor(iframeWindow) {
      const doc = iframeWindow.document;
      // 精确：超星讨论页顶部 .replyBtn 才会展开 .editContainer
      try {
        const rb = Array.from(doc.querySelectorAll(".topicDetail_head .replyBtn, .topicDetail_title_right .replyBtn, .replyBtn")).filter((n) => {
          try {
            return !!(n.getClientRects && n.getClientRects().length);
          } catch (e) {
            return false;
          }
        })[0];
        if (rb) {
          rb.click();
          return true;
        }
      } catch (e) {
      }
      const nodes = Array.from(doc.querySelectorAll('a,button,span,div,p,li'));
      const hit = nodes.find((n) => {
        const t = String(n.textContent || "").replace(/\s+/g, "").trim();
        if (!t || t.length > 6) return false;
        if (!/^(回复|我要回复|发表|写回复|参与讨论|发表评论|评论)$/.test(t)) return false;
        try {
          return !!(n.getClientRects && n.getClientRects().length);
        } catch (e) {
          return false;
        }
      });
      if (hit) {
        hit.click();
        return true;
      }
      return false;
    }
    discussSubmit(iframeWindow) {
      const doc = iframeWindow.document;
      // 精确：超星讨论页提交按钮 .addReply（注意不能点到 .replyBtn，那是"打开发言框"）
      try {
        const add = Array.from(doc.querySelectorAll(".addReply")).filter((n) => {
          try {
            return !!(n.getClientRects && n.getClientRects().length);
          } catch (e) {
            return false;
          }
        })[0];
        if (add) {
          add.click();
          return true;
        }
      } catch (e) {
      }
      const nodes = Array.from(doc.querySelectorAll('a,button,span,div,input[type="button"],input[type="submit"]'));
      const cands = nodes.filter((n) => {
        const t = String(n.textContent || n.value || "").replace(/\s+/g, "").trim();
        if (!t || t.length > 8) return false;
        if (/replyBtn|cancleReply/.test(n.className || "")) return false;
        if (!/^(发表|发布|提交|发送|确定|回复|发表回复|提交回复)$/.test(t)) return false;
        try {
          return !!(n.getClientRects && n.getClientRects().length);
        } catch (e) {
          return false;
        }
      });
      if (0 === cands.length) return false;
      cands.sort((a, b) => String(a.textContent || "").length - String(b.textContent || "").length);
      cands[0].click();
      return true;
    }
    discussDebug(iframeWindow) {
      try {
        const doc = iframeWindow.document;
        return {
          textareas: doc.querySelectorAll("textarea").length,
          editables: doc.querySelectorAll('[contenteditable="true"]').length,
          iframes: doc.querySelectorAll("iframe").length,
          url: iframeWindow.location.href
        };
      } catch (e) {
        return String(e);
      }
    }
    discussDebugButtons(iframeWindow) {
      try {
        return Array.from(iframeWindow.document.querySelectorAll("a,button,span")).map((n) => String(n.textContent || "").replace(/\s+/g, "").trim()).filter((t) => t && t.length <= 8).slice(0, 30);
      } catch (e) {
        return [];
      }
    }
    pdf(iframeWindow) {
      return new Promise(async (resolve) => {
        const contentWindow = iframeWindow.document.querySelector("#panView").contentWindow;
        contentWindow.scrollTo(0, contentWindow.document.body.scrollHeight), resolve();
      });
    }
    async s(iframeWindow) {
      const questionList = $(iframeWindow.document).find(".TiMu").map(function(index, element) {
        try {
          let questionHtml, questionText, questionType$1, questionAnswer, questionOption = [], questionAnalysis = "";
          switch (questionHtml = $(element).find(".Zy_TItle .clearfix"), questionText = removeHtml(questionHtml[0].innerHTML), questionType$1 = questionText.match(/^\【(.+?)\】/)[1], questionText = questionText.replace(questionText.match(/^\【(.+?)\】/)[0], ""), questionType$1) {
            case "单选题":
            case "多选题":
              return questionOption = $(element).find("ul>li").map(function(inx, item) {
                return removeHtml($(item).find("a").html());
              }).get(), null;
            case "判断题":
              if (questionAnalysis = removeHtml($(element).find(".Py_addpy:eq(0)").html() || ""), element.innerHTML.includes("正确答案"))
                questionAnswer = removeHtml($(element).find(".Py_answer.clearfix>span").html());
              else {
                const match = $(element).find(".Py_answer.clearfix").html().match(/^(.*?)(?=<i class="fr (dui|cuo)"><\/i>)/s), result = match ? match[1] : "";
                questionAnswer = removeHtml(result);
              }
              if (questionAnswer.includes("正确答案"))
                questionAnswer = questionAnswer.replace("正确答案：", "").trim();
              else if ($(element).find(".fr.dui").length > 0)
                questionAnswer = questionAnswer.replace("我的答案：", "").trim();
              else {
                if (!questionAnswer.replace("我的答案：", "").trim().includes("√") && !questionAnswer.replace("我的答案：", "").trim().includes("×"))
                  return null;
                questionAnswer = "√" == questionAnswer.replace("我的答案：", "").trim() ? "×" : "√";
              }
              break;
            case "填空题":
              if (questionAnswer = $("span.font14", $(element)).map(function(inx, item) {
                return removeHtml($(item).html()).replace(/^第.空：/, "").trim();
              }).get(), 0 == questionAnswer.length) {
                if (questionAnswer = $(element).find(".Py_answer.clearfix>div>div[class='font14']"), !(questionAnswer.length = $(element).find(".Py_answer.clearfix>div>div[class='font14']>>.fr.dui").length))
                  return null;
                questionAnswer = questionAnswer.map(function(inx, item) {
                  return removeHtml($(item).html()).replace(/^第.空：/, "").trim();
                }).get();
              }
              break;
            default:
              return null;
          }
          return { question: questionText, options: questionOption, type: questionType[questionType$1], answer: questionAnswer };
        } catch {
          return null;
        }
      }).get();
      await this.ServerApi.s(questionList, iframeWindow.location.href);
    }
  }
  const pinia = pinia$1.createPinia(), app = vue.createApp(App).use(ElementPlus).use(pinia), _self = _unsafeWindow, top = _self.top, formStore = useformStore();
  var iframeCom = null;
  switch (app.mount((() => {
    try {
      const div = top.document.createElement("div");
      return div.id = "cccxapp", top.document.getElementById(div.id) ? div : (top.document.body.append(div), div);
    } catch (e) {
      log(e, "error");
    }
  })()), (() => {
    document.body.oncopy = null, document.body.oncut = null, document.body.onpaste = null, document.body.onselectstart = null, document.body.ondragstart = null;
    const style = document.createElement("style");
    style.innerHTML = "\n       * {\n           -webkit-user-select: auto !important;\n           -moz-user-select: auto !important;\n           -o-user-select: auto !important;\n           user-select: auto !important;\n       }\n   ", document.head.appendChild(style);
  })(), _self.location.pathname) {
    case "/work/doHomeWorkNew":
    case "/mooc-ans/work/doHomeWorkNew":
    case "/mooc2-ans/work/doHomeWorkNew":
      location.href.includes("mooc2=1") && (location.href = location.href.replace(/&mooc2=1/g, ""));
      break;
    case "/mycourse/studentstudy":
    case "/mooc-ans/mycourse/studentstudy":
    case "/mooc2-ans/mycourse/studentstudy":
      if (!_self.location.href.match(/mooc2=1/)) {
        ElementPlus.ElNotification({ title: "Auto Ask", message: "暂不支持旧版章节，尝试切换至新版", type: "error" }), _self.location.href = _self.location.href + "&mooc2=1";
        break;
      }
      const cxModel = new Cx();
      cxModel.askStore.log("脚本初始化成功！", "success");
      const startWork = async () => {
        var _a, _b, _c, _d, _e;
        await waitElementLoaded(_self, "#iframe");
        const cardsIframe = _self.document.querySelector("#iframe");
        await waitIframeLoaded(cardsIframe);
        const _self1 = cardsIframe.contentWindow;
        top.scroll2Job();
        let jobList = _self1.document.querySelectorAll(".ans-job-icon") || [];
        // 逐个任务点解析"任务容器 + 它自己的 iframe"：避免把含多个任务点的外层容器当成单个任务而误判完成
        const jobWrapOf = (icon) => {
          let node = icon, wrap = icon.parentElement, iframe = null;
          for (let k = 0; k < 4 && node; k++) {
            node = node.parentElement;
            if (!node || !node.querySelectorAll) break;
            const frames = node.querySelectorAll("iframe");
            // 最近的、含 iframe 的祖先就是这一任务点的容器：立刻停止上溯，
            // 否则会爬到章节级容器（那里也可能带 ans-job-finished），把整章任务误判为已完成
            if (frames.length > 0) {
              wrap = node, iframe = frames[0];
              break;
            }
          }
          if (!iframe && wrap && wrap.querySelector) iframe = wrap.querySelector("iframe");
          return { wrap, iframe };
        };
        const isFinishedJob = (icon, wrap) => {
          if (icon.classList && icon.classList.contains("ans-job-finished")) return "图标已标记完成";
          if (wrap && wrap.classList && wrap.classList.contains("ans-job-finished")) return "外层已标记完成";
          if (wrap && wrap.querySelector && wrap.querySelector(".ans-job-finished")) return "容器内含完成标记";
          return "";
        };
        const redoFinished = formStore.forminput.redoFinished !== false;
        for (let i = 0; i < jobList.length; i++) {
          const item = jobList[i];
          const resolved = jobWrapOf(item);
          const iframe = resolved.iframe;
          const finishedMark = isFinishedJob(item, resolved.wrap);
          await PauseCtl.wait();
          if (!iframe) {
            cxModel.askStore.log("第" + (i + 1) + "个任务点未找到 iframe，跳过", "error");
            continue;
          }
          if (finishedMark && !redoFinished) {
            if (iframe.src.match(/\/ananas\/modules\/work\/index\.html/)) {
              await waitIframeLoaded(iframe);
              const workIframe = (_c = iframe.contentWindow) == null ? void 0 : _c.document.querySelector("iframe");
              workIframe && (await waitIframeLoaded(workIframe), cxModel.s(workIframe.contentWindow));
            }
            console.log(iframe.src, "已完成"), cxModel.askStore.log("已完成的任务点(" + finishedMark + "),跳过");
            continue;
          }
          if (finishedMark && redoFinished) {
            cxModel.askStore.log("已完成的任务点(" + finishedMark + ")，按配置重新处理", "warning");
          }
          await waitIframeLoaded(iframe);
          let otherInfo = {};
          try { otherInfo = JSON.parse(iframe.getAttribute("data") || "{}"); } catch (e) { }
          cxModel.askStore.log("正在完成任务:" + (otherInfo.name || otherInfo.title || ("任务点" + (i + 1))));
          if (iframe.src.match(/\/ananas\/modules\/video\/index\.html/)) {
            if (!formStore.forminput.autoVideo) { cxModel.askStore.log("视频任务已跳过", "success"); continue; }
            await cxModel.video(iframe.contentWindow), cxModel.askStore.log("视频任务已完成", "success");
          } else if (iframe.src.match(/\/ananas\/modules\/work\/index\.html/)) {
            cxModel.askStore.log("即将开始做作业", "info");
            const workIframe = (_e = iframe.contentWindow) == null ? void 0 : _e.document.querySelector("iframe");
            workIframe && (await waitIframeLoaded(workIframe), await cxModel.work(workIframe.contentWindow), cxModel.askStore.log("作业任务已完成", "success"));
          } else if (iframe.src.match(/\/ananas\/modules\/audio\/index\.html/)) {
            if (!formStore.forminput.autoVideo) { cxModel.askStore.log("音频任务已跳过", "success"); continue; }
            await cxModel.audio(iframe.contentWindow), cxModel.askStore.log("音频任务已完成", "success");
          } else if (iframe.src.match(/\/ananas\/modules\/pdf\/index\.html/)) {
            await cxModel.pdf(iframe.contentWindow), cxModel.askStore.log("pdf任务已完成", "success");
          } else if (/insertbbs/i.test((iframe.getAttribute("module") || "") + " " + iframe.className)) {
            if (formStore.forminput.autoDiscuss === false) {
              cxModel.askStore.log("讨论任务已跳过(配置关闭)", "success");
              continue;
            }
            const discOk = await cxModel.discuss(iframe.contentWindow, otherInfo);
            discOk ? cxModel.askStore.log("讨论任务已完成", "success") : (cxModel.discussOpenTab(iframe) || cxModel.askStore.log("讨论需手动处理：请点开该讨论页，脚本会在讨论页自动作答", "warning"));
          } else {
            console.log(iframe.src, "未知"), cxModel.askStore.log("未知任务跳过", "success");
          }
        }
        // 兜底：部分讨论卡片没有 ans-job-icon，直接扫描页面里的 insertbbs iframe
        if (formStore.forminput.autoDiscuss !== false) {
          try {
            const bbsFrames = Array.from(_self1.document.querySelectorAll('iframe[module="insertbbs"], iframe.ans-insertbbs-module'));
            for (let bi = 0; bi < bbsFrames.length; bi++) {
              const bf = bbsFrames[bi];
              if (bf.__mfDiscussed) continue;
              bf.__mfDiscussed = true;
              const wrapInfo = jobWrapOf(bf);
              if (!redoFinished && isFinishedJob(bf, wrapInfo.wrap)) {
                cxModel.askStore.log("讨论任务已完成,跳过");
                continue;
              }
              if (formStore.forminput.autoDiscuss === false) break;
              await PauseCtl.wait();
              await waitIframeLoaded(bf);
              let bbsInfo = {};
              try {
                bbsInfo = JSON.parse(bf.getAttribute("data") || "{}");
              } catch (e) {
              }
              await cxModel.discuss(bf.contentWindow, bbsInfo);
            }
          } catch (e) {
            console.log("讨论兜底扫描失败:", e);
          }
        }
        await sleep(formStore.forminput.interval), !formStore.forminput.autoJump && cxModel.askStore.msg("由于未开启自动切换,请手动切换"), formStore.forminput.autoJump && (top == null ? void 0 : top.document.querySelector(".nextChapter").click());
      };
      setInterval(async () => {
        await waitElementLoaded(_self, "#iframe");
        const cardsIframe = _self.document.querySelector("#iframe");
        await waitIframeLoaded(cardsIframe);
        const _self1 = cardsIframe.contentWindow;
        iframeCom != _self1.location.href && (iframeCom = _self1.location.href, cxModel.askStore.reset(), startWork());
      }, 2e3);
      break;
    case "/mooc2-ans/mycourse/stu":
    case "/mooc-ans/mycourse/stu":
    case "/mycourse/stu":
      ElementPlus.ElNotification({ title: "Auto Ask", message: "此页面无任务，请自行进入章节页面", type: "error" });
      break;
    case "/work/selectWorkQuestionYiPiYue":
    case "/knowledge/cards":
      break;
    case "/mooc2/work/dowork":
    case "/mooc-ans/mooc2/work/dowork":
    case "/mooc2-ans/mooc2/work/dowork":
      const cxModel1 = new Cx();
      cxModel1.askStore.log("脚本初始化成功！", "success"), await( cxModel1.homework());
      break;
    case "/exam-ans/exam/test/reVersionTestStartNew":
    case "/mooc-ans/exam/test/reVersionTestStartNew":
    case "/mooc2-ans/exam/test/reVersionTestStartNew":
    case "/exam-ans/exam/test/testStartNew":
    case "/mooc-ans/exam/test/testStartNew":
      const cxModel2 = new Cx();
      cxModel2.askStore.log("脚本初始化成功！", "success");
      formStore.forminput.examEnabled === false ? cxModel2.askStore.log("考试自动答题已在配置中关闭，跳过", "warning") : await cxModel2.exam();
      break;
  }

// ===== 讨论页（groupweb 独立 BBS 页面）自动作答 =====
  // 真实结构（已按超星 2026 版页面核对）：
  //   题目：window.obj.topic.title 或 .topicDetail_title
  //   他人回复：.topicDetail_replyItem .replyContent（content 属性为纯文本）
  //   打开发言框：.replyBtn
  //   回复输入框：.textareawrap > textarea
  //   提交按钮：.addReply（注意 .replyBtn 是"打开发言框"，不能点错）
  (async () => {
    try {
      const isBbs = /groupweb\.chaoxing\.com/i.test(location.hostname) || /\/course\/topic\/v3\/bbs\//i.test(location.pathname);
      if (!isBbs) return;
      console.log("[讨论页] 检测到讨论页面:", location.href);

      const $ = (s) => document.querySelector(s);
      const $$ = (s) => Array.from(document.querySelectorAll(s));
      const vis = (el) => {
        try {
          return !!(el && el.getClientRects && el.getClientRects().length);
        } catch (e) {
          return false;
        }
      };
      const pickVisible = (s) => $$(s).filter(vis)[0] || null;

      // 等话题详情渲染完成
      for (let i = 0; i < 40 && !$(".topicDetail_title, #bbsTopicDetail .topicDetail_detail"); i++) await sleep(0.5);

      const getTopic = () => {
        try {
          if (window.obj && window.obj.topic && window.obj.topic.title) return String(window.obj.topic.title).trim();
        } catch (e) {
        }
        const el = $(".topicDetail_title");
        if (el) {
          const t = String(el.textContent || "").replace(/\s+/g, " ").replace(/^无标题/, "").trim();
          if (t) return t;
        }
        return String(document.title || "").replace(/[-_|—]\s*(超星学习通|超星|学习通)\s*$/i, "").trim();
      };

      const getReplies = () => {
        const out = [];
        $$(".topicDetail_replyItem .replyContent, .replyContent[content]").forEach((el) => {
          const t = String(el.getAttribute("content") || el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
          if (t.length >= 6 && t.length <= 800 && out.indexOf(t) === -1) out.push(t);
        });
        return out.slice(0, 8);
      };

      const openEditor = () => {
        const rb = pickVisible(".topicDetail_head .replyBtn") || pickVisible(".topicDetail_title_right .replyBtn") || pickVisible(".replyBtn");
        if (rb) {
          rb.click();
          return true;
        }
        return false;
      };

      const fillReply = (text) => {
        const ta = pickVisible(".textareawrap textarea") || pickVisible(".editContainer textarea") || $(".textareawrap textarea") || $(".editContainer textarea");
        if (!ta) return false;
        ta.focus && ta.focus();
        ta.value = text;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        ta.dispatchEvent(new Event("change", { bubbles: true }));
        ta.dispatchEvent(new Event("keyup", { bubbles: true }));
        ta.scrollIntoView && ta.scrollIntoView({ block: "center" });
        return ta.value.length > 0;
      };

      const submitReply = () => {
        const add = pickVisible(".addReply") || $(".addReply");
        if (add) {
          add.click();
          return true;
        }
        // 兜底：文本为"回复"且不是 .replyBtn 的元素
        const cand = $$("div,a,span,button").filter((n) => vis(n) && /^回复$/.test(String(n.textContent || "").trim()) && !/replyBtn|cancleReply/.test(n.className || ""));
        if (cand[0]) {
          cand[0].click();
          return true;
        }
        return false;
      };

      const countReplies = () => $$(".topicDetail_replyItem").length;

      window.__mfBbsDebug = function () {
        const info = {
          url: location.href,
          topic: getTopic().slice(0, 80),
          replyItems: countReplies(),
          collectedReplies: getReplies().length,
          replyBtn: !!pickVisible(".replyBtn"),
          textarea: !!($(".textareawrap textarea") || $(".editContainer textarea")),
          textareaVisible: !!pickVisible(".textareawrap textarea"),
          addReply: !!$(".addReply"),
          addReplyVisible: !!pickVisible(".addReply"),
          buttons: $$(".addReply,.replyBtn,.cancleReplyBtn").map((n) => ({ cls: n.className, text: String(n.textContent || "").trim() }))
        };
        console.groupCollapsed("%c[讨论页诊断] 点击展开", "color:#409eff;font-weight:bold");
        Object.keys(info).forEach((k) => console.log(k + ":", info[k]));
        console.groupEnd();
        return info;
      };

      const run = async (manual) => {
        const doneKey = "mfBbsDone:" + location.pathname;
        if (!manual && sessionStorage.getItem(doneKey)) {
          console.log("[讨论页] 本页已处理过，跳过自动作答（可点右下角按钮手动再来一次）");
          return false;
        }
        const cxm = new Cx();
        const topic = getTopic();
        if (!topic) {
          cxm.askStore.log("讨论页未取到题目，可点右下角按钮重试", "error");
          window.__mfBbsDebug();
          return false;
        }
        cxm.askStore.log("讨论题目: " + topic.replace(/\s+/g, " ").slice(0, 50), "info");

        const replies = getReplies();
        if (replies.length) cxm.askStore.log(`参考了 ${replies.length} 条他人回复`, "success");

        const text = await new ServerApi(window).getAnswerForDiscussion(topic, replies, {
          course: getCourseName(),
          chapter: getCatalogChapter()
        });
        if (!text) {
          cxm.askStore.log("AI未生成内容（请确认已启用AI并填写密钥）", "error");
          return false;
        }
        cxm.askStore.log("生成回复: " + text.slice(0, 60) + (text.length > 60 ? "…" : ""), "success");

        // 打开发言框 → 填入
        let filled = fillReply(text);
        if (!filled) {
          openEditor();
          await sleep(1.2);
          filled = fillReply(text);
        }
        if (!filled) {
          openEditor();
          await sleep(1.8);
          filled = fillReply(text);
        }
        if (!filled) {
          cxm.askStore.log("未找到回复输入框，已导出诊断信息", "error");
          window.__mfBbsDebug();
          return false;
        }
        cxm.askStore.log("回复内容已填入", "success");
        await PauseCtl.wait();
        await sleep(1);

        const before = countReplies();
        if (!submitReply()) {
          cxm.askStore.log("未找到提交按钮，内容已填好请手动提交", "error");
          window.__mfBbsDebug();
          return false;
        }
        await sleep(1.5);

        // 匿名确认弹窗：选「取消」，因为匿名不计成绩
        const anon = $(".popAnonymousShowHide");
        if (anon && vis(anon)) {
          const cancel = anon.querySelector(".cancle, .btn_92_cancel");
          cancel && cancel.click();
          cxm.askStore.log("已取消匿名，按实名提交", "warning");
          await sleep(0.8);
        }

        await sleep(2);
        const after = countReplies();
        const okToast = /添加成功|回复成功/.test(document.body.innerText || "");
        if (after > before || okToast) {
          sessionStorage.setItem(doneKey, "1");
          cxm.askStore.log(`讨论回复已提交（回复数 ${before} → ${after}）`, "success");
          return true;
        }
        cxm.askStore.log("提交后未检测到新回复，请在页面上确认是否成功", "warning");
        window.__mfBbsDebug();
        return false;
      };

      if (formStore.forminput.autoDiscuss !== false) {
        await run(false);
      } else {
        console.log("[讨论页] 自动讨论已关闭，仅提供手动按钮");
      }

      // 手动按钮
      const btn = document.createElement("button");
      btn.textContent = "🤖 AI回答此讨论";
      btn.style.cssText = "position:fixed;right:16px;bottom:96px;z-index:2147483646;border:1px solid #a0cfff;background:#ecf5ff;color:#409eff;border-radius:16px;padding:6px 14px;font:13px -apple-system,'Microsoft YaHei',sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(64,158,255,.2)";
      btn.addEventListener("click", async () => {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.textContent = "生成中…";
        try {
          await run(true);
        } finally {
          btn.disabled = false;
          btn.textContent = "🤖 AI回答此讨论";
        }
      });
      document.body.appendChild(btn);
    } catch (e) {
      console.log("[讨论页] 处理失败:", e);
    }
  })();

  // ===== 考试页 DOM 自动识别兜底（未枚举的考试路由也能跑）=====
  (async () => {
    try {
      const path = _self.location.pathname;
      const handled = ["/work/doHomeWorkNew", "/mooc-ans/work/doHomeWorkNew", "/mooc2-ans/work/doHomeWorkNew", "/mycourse/studentstudy", "/mooc-ans/mycourse/studentstudy", "/mooc2-ans/mycourse/studentstudy", "/mooc2-ans/mycourse/stu", "/mooc-ans/mycourse/stu", "/mycourse/stu", "/work/selectWorkQuestionYiPiYue", "/knowledge/cards", "/mooc2/work/dowork", "/mooc-ans/mooc2/work/dowork", "/mooc2-ans/mooc2/work/dowork", "/exam-ans/exam/test/reVersionTestStartNew", "/mooc-ans/exam/test/reVersionTestStartNew", "/mooc2-ans/exam/test/reVersionTestStartNew", "/exam-ans/exam/test/testStartNew", "/mooc-ans/exam/test/testStartNew"];
      if (handled.includes(path))
        return;
      let tries = 0;
      while (tries++ < 10) {
        if (document.querySelector(".mark_name") && (document.querySelector("input[name^=answertype]") || document.querySelectorAll("input[name^=type]").length > 1))
          break;
        await sleep(1);
      }
      const isExamPage = document.querySelector(".mark_name") && (document.querySelector("input[name^=answertype]") || document.querySelectorAll("input[name^=type]").length > 1);
      if (!isExamPage)
        return;
      console.log("[考试自动识别] 检测到考试作答页:", path);
      const cxModelExam = new Cx();
      cxModelExam.askStore.log("自动识别到考试页面，开始处理", "success");
      if (formStore.forminput.examEnabled === false) {
        cxModelExam.askStore.log("考试自动答题已在配置中关闭，跳过", "warning");
        return;
      }
      await cxModelExam.exam();
    } catch (e) {
      console.log("[考试自动识别] 处理失败:", e);
    }
  })();

})(Vue, Pinia, ElementPlus, md5, $);

// ==================== 微信扫码验证弹窗检测功能 ====================
(function() {
    'use strict';

    // 配置
    const CONFIG = {
        // 检测的关键词
        keywords: ['微信扫码验证', '请使用微信"扫一扫"扫码', '跳转小程序进行学习验证'],
        // 检测间隔（毫秒）
        checkInterval: 1000,
        // 延迟执行时间范围（秒）
        minDelay: 5,
        maxDelay: 10
    };

    let isProcessing = false;
    let checkTimer = null;

    // 生成随机延迟时间（5-10秒）
    function getRandomDelay() {
        return Math.floor(Math.random() * (CONFIG.maxDelay - CONFIG.minDelay + 1) + CONFIG.minDelay) * 1000;
    }

    // 检查元素是否包含关键词
    function containsKeywords(element) {
        if (!element) return false;
        const text = element.textContent || element.innerText || '';
        return CONFIG.keywords.some(keyword => text.includes(keyword));
    }

    // 检查页面中是否存在微信扫码验证弹窗
    function checkWechatVerifyPopup() {
        if (isProcessing) return false;

        // 常见的弹窗选择器
        const popupSelectors = [
            '.el-dialog',
            '.el-message-box',
            '.van-dialog',
            '.weui-dialog',
            '.layui-layer',
            '.modal',
            '.dialog',
            '.popup',
            '[class*="dialog"]',
            '[class*="popup"]',
            '[class*="modal"]',
            // 学习通特定的弹窗类名
            '.verify-dialog',
            '.qrcode-dialog',
            '.scan-dialog'
        ];

        // 检查所有可能的弹窗元素
        for (const selector of popupSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (containsKeywords(element)) {
                    return true;
                }
            }
        }

        // 检查整个页面文本（作为备用方案）
        const bodyText = document.body.innerText || '';
        if (CONFIG.keywords.every(keyword => bodyText.includes(keyword))) {
            return true;
        }

        return false;
    }

    // 执行刷新操作
    function executeRefresh() {
        if (isProcessing) return;
        isProcessing = true;

        console.log('[微信扫码检测] 检测到微信扫码验证弹窗，准备刷新页面...');

        // 获取当前网址
        const currentUrl = window.location.href;

        // 复制网址到剪贴板
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(currentUrl).then(() => {
                console.log('[微信扫码检测] 网址已复制到剪贴板:', currentUrl);
            }).catch(err => {
                console.error('[微信扫码检测] 复制网址失败:', err);
                // 备用方案：使用传统方法
                const textarea = document.createElement('textarea');
                textarea.value = currentUrl;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                console.log('[微信扫码检测] 网址已复制到剪贴板(备用方法)');
            });
        }

        // 在新标签页打开当前页面
        window.open(currentUrl, '_blank');

        // 关闭当前页面
        setTimeout(() => {
            window.close();
        }, 500);
    }

    // 主检测函数
    function startDetection() {
        console.log('[微信扫码检测] 检测功能已启动，将在检测到微信扫码验证弹窗后自动处理');

        checkTimer = setInterval(() => {
            if (checkWechatVerifyPopup()) {
                console.log('[微信扫码检测] 检测到微信扫码验证弹窗！');
                clearInterval(checkTimer);

                // 生成随机延迟（5-10秒）
                const delay = getRandomDelay();
                console.log(`[微信扫码检测] 将在 ${delay / 1000} 秒后执行刷新操作`);

                setTimeout(() => {
                    executeRefresh();
                }, delay);
            }
        }, CONFIG.checkInterval);
    }

    // 页面加载完成后启动检测
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startDetection);
    } else {
        startDetection();
    }

    // 监听页面变化（用于检测动态加载的弹窗）
    const observer = new MutationObserver((mutations) => {
        if (!isProcessing && checkWechatVerifyPopup()) {
            console.log('[微信扫码检测] 通过MutationObserver检测到微信扫码验证弹窗！');
            clearInterval(checkTimer);

            const delay = getRandomDelay();
            console.log(`[微信扫码检测] 将在 ${delay / 1000} 秒后执行刷新操作`);

            setTimeout(() => {
                executeRefresh();
            }, delay);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });

})();

// ==================== 接口日志可视化面板 ====================
(function () {
    'use strict';
    // 只在顶层窗口注入一次：脚本会在每个子 iframe 各执行一遍，若都注入会叠加多份面板导致无法收起
    if (window.top !== window.self) return;
    var doc = window.document;
    if (!doc || !doc.head) return;
    var api = window.__mfAPILog;
    if (!api) return;
    // 幂等：清掉历史残留（脚本热重载/多次注入时）
    ['mf-apilog', 'mf-apilog-btn'].forEach(function (id) {
        var old = doc.getElementById(id);
        old && old.parentNode && old.parentNode.removeChild(old);
    });

    var CSS = [
        '#mf-apilog{position:fixed;left:10px;bottom:120px;width:430px;max-height:52vh;z-index:2147483646;background:#fff;border:1px solid #dcdfe6;border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.12);font:12px/1.5 -apple-system,"Microsoft YaHei",sans-serif;color:#303133;display:none;flex-direction:column;overflow:hidden}',
        '#mf-apilog.mf-open{display:flex}',
        '#mf-apilog .mf-hd{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #ebeef5;background:#fafafa;cursor:default;flex-shrink:0}',
        '#mf-apilog .mf-hd b{font-size:13px}',
        '#mf-apilog .mf-hd .mf-sp{flex:1}',
        '#mf-apilog button{border:1px solid #dcdfe6;background:#fff;border-radius:4px;padding:2px 8px;font-size:12px;cursor:pointer;color:#606266}',
        '#mf-apilog button:hover{border-color:#409eff;color:#409eff}',
        '#mf-apilog .mf-stat{padding:6px 10px;background:#f5f7fa;color:#909399;flex-shrink:0;display:flex;gap:12px;flex-wrap:wrap}',
        '#mf-apilog .mf-stat em{font-style:normal;color:#409eff;font-weight:600}',
        '#mf-apilog .mf-body{overflow:auto;flex:1;min-height:80px}',
        '#mf-apilog table{width:100%;border-collapse:collapse}',
        '#mf-apilog th{position:sticky;top:0;background:#f5f7fa;font-weight:600;color:#909399;text-align:left;padding:5px 8px;border-bottom:1px solid #ebeef5;font-size:11px}',
        '#mf-apilog td{padding:4px 8px;border-bottom:1px solid #f2f6fc;vertical-align:top}',
        '#mf-apilog tr.mf-ok td{color:#303133}',
        '#mf-apilog tr.mf-err td{color:#c0392b}',
        '#mf-apilog tr.mf-hit{background:#f0f9eb}',
        '#mf-apilog .mf-tag{display:inline-block;padding:0 5px;border-radius:3px;font-size:11px}',
        '#mf-apilog .mf-tag.ok{background:#e1f3d8;color:#529b2e}',
        '#mf-apilog .mf-tag.err{background:#fde2e2;color:#c45656}',
        '#mf-apilog .mf-tag.wait{background:#fdf6ec;color:#b88230}',
        '#mf-apilog .mf-pv{color:#909399;display:block;max-width:230px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
        '#mf-apilog-btn{position:fixed;left:10px;bottom:88px;z-index:2147483646;border:1px solid #c6e2ff;background:#ecf5ff;color:#409eff;border-radius:16px;padding:5px 12px;font:12px -apple-system,"Microsoft YaHei",sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(64,158,255,.18)}',
        '#mf-apilog-btn:hover{background:#d9ecff}'
    ].join('\n');
    var style = doc.createElement('style');
    style.textContent = CSS;
    doc.head.appendChild(style);

    var btn = doc.createElement('button');
    btn.id = 'mf-apilog-btn';
    btn.textContent = '📡 接口日志';
    var panel = doc.createElement('div');
    panel.id = 'mf-apilog';
    panel.innerHTML = '<div class="mf-hd"><b>📡 接口 / AI 请求日志</b><span class="mf-sp"></span>' +
        '<button data-act="pause">暂停刷新</button><button data-act="clear">清空</button><button data-act="close">收起</button></div>' +
        '<div class="mf-stat"></div><div class="mf-body"><table><thead><tr>' +
        '<th style="width:58px">时间</th><th style="width:74px">渠道</th><th style="width:44px">耗时</th>' +
        '<th style="width:40px">状态</th><th>内容摘要</th></tr></thead><tbody></tbody></table></div>';
    doc.body.appendChild(btn);
    doc.body.appendChild(panel);

    var paused = false;
    var tbody = panel.querySelector('tbody');
    var statBox = panel.querySelector('.mf-stat');

    function fmtTime(t) {
        var d = new Date(t);
        return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
    }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
        });
    }
    function render() {
        if (paused) return;
        var items = api.items.slice(-80).reverse();
        var html = '';
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var st = it.state === 'ok' ? '<span class="mf-tag ok">200</span>' : it.state === 'pending' ? '<span class="mf-tag wait">···</span>' : '<span class="mf-tag err">' + esc(it.status || 'ERR') + '</span>';
            var cls = (it.state === 'ok' ? 'mf-ok' : it.state === 'pending' ? '' : 'mf-err') + (it.hit ? ' mf-hit' : '');
            html += '<tr class="' + cls + '"><td>' + fmtTime(it.t) + '</td><td>' + esc(it.provider) + '</td><td>' + (it.ms || 0) + 'ms</td><td>' + st + '</td>' +
                '<td>' + (it.hit ? '✅ ' : '') + '<span class="mf-pv" title="' + esc((it.note || '') + ' ' + (it.preview || '')) + '">' + esc(it.preview || it.note || '') + '</span></td></tr>';
        }
        tbody.innerHTML = html || '<tr><td colspan="5" style="padding:14px;color:#909399;text-align:center">暂无请求，答题后这里会实时显示各渠道的发送与返回</td></tr>';
        var s = api.summary();
        statBox.innerHTML = '总请求 <em>' + s.total + '</em> · 成功 <em>' + s.ok + '</em> · 命中 <em>' + s.hit + '</em> · 平均耗时 <em>' + s.avg + 'ms</em>';
    }

    function setOpen(open) {
        panel.classList.toggle('mf-open', !!open);
        btn.textContent = open ? '📡 收起日志' : '📡 接口日志';
        open && render();
    }
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        setOpen(!panel.classList.contains('mf-open'));
    });
    panel.addEventListener('click', function (e) {
        var act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        e.stopPropagation();
        if (act === 'clear') {
            api.clear();
            render();
        } else if (act === 'close') {
            setOpen(false);
        } else if (act === 'pause') {
            paused = !paused;
            e.target.textContent = paused ? '继续刷新' : '暂停刷新';
            paused || render();
        }
    });
    // ESC 也能收起，避免被页面其它浮层挡住按钮时关不掉
    doc.addEventListener('keydown', function (e) {
        "Escape" === e.key && panel.classList.contains('mf-open') && setOpen(false);
    }, true);
    api.onChange(function () {
        panel.classList.contains('mf-open') && render();
    });
    setInterval(function () {
        panel.classList.contains('mf-open') && render();
    }, 1500);
})();

// ==================== 暂停 / 继续按钮 ====================
(function () {
    'use strict';
    if (window.top !== window.self) return;
    var doc = window.document;
    if (!doc || !doc.head) return;
    var ctl = window.__mfPause;
    if (!ctl) return;
    var old = doc.getElementById('mf-pause-btn');
    old && old.parentNode && old.parentNode.removeChild(old);

    var style = doc.createElement('style');
    style.textContent = [
        '#mf-pause-btn{position:fixed;left:10px;bottom:52px;z-index:2147483646;border:1px solid #a0cfff;background:#ecf5ff;color:#409eff;border-radius:16px;padding:5px 12px;font:12px -apple-system,"Microsoft YaHei",sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(64,158,255,.18);transition:all .15s}',
        '#mf-pause-btn:hover{background:#d9ecff}',
        '#mf-pause-btn.mf-paused{background:#fef0f0;border-color:#fab6b6;color:#f56c6c;box-shadow:0 2px 10px rgba(245,108,108,.28)}',
        '#mf-pause-mask{position:fixed;left:0;right:0;top:0;height:3px;z-index:2147483647;background:repeating-linear-gradient(90deg,#f56c6c 0 10px,#fbc4c4 10px 20px);display:none}',
        '#mf-pause-mask.mf-on{display:block}'
    ].join('\n');
    doc.head.appendChild(style);

    var btn = doc.createElement('button');
    btn.id = 'mf-pause-btn';
    btn.type = 'button';
    var mask = doc.createElement('div');
    mask.id = 'mf-pause-mask';
    doc.body.appendChild(btn);
    doc.body.appendChild(mask);

    function sync() {
        btn.textContent = ctl.paused ? '▶ 继续答题' : '⏸ 暂停答题';
        btn.classList.toggle('mf-paused', ctl.paused);
        mask.classList.toggle('mf-on', ctl.paused);
        btn.title = ctl.paused ? '当前已暂停：不会继续点题/交卷' : '点击暂停自动答题（可随时继续）';
    }
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        ctl.toggle();
        sync();
    });
    // 快捷键：Alt+P
    doc.addEventListener('keydown', function (e) {
        if (e.altKey && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            ctl.toggle();
            sync();
        }
    }, true);
    ctl.onChange(sync);
    sync();
})();

// ==================== 弹窗右下角拖拽调整大小 ====================
(function () {
    'use strict';

    // 只在顶层窗口注入：子 iframe 重复注入会产生多个 observer 与样式，拖拽行为错乱
    if (window.top !== window.self) return;
    var doc = window.document;
    if (!doc || !doc.head) return;

    var KEY = 'dialogSize';
    var MIN_W = 320;
    var MIN_H = 200;
    var saved = null;
    try {
        if (typeof GM_getValue === 'function') saved = GM_getValue(KEY);
    } catch (e) {
    }
    if (saved && typeof saved === 'string') {
        try {
            saved = JSON.parse(saved);
        } catch (e) {
            saved = null;
        }
    }
    if (saved && !(saved.w > 0)) saved = null;

    var style = doc.createElement('style');
    style.textContent = [
        '.cs-resize-handle{position:absolute;right:0;bottom:0;width:18px;height:18px;cursor:nwse-resize;z-index:2147483647;background:transparent;}',
        '.cs-resize-handle::after{content:"";position:absolute;right:3px;bottom:3px;width:10px;height:10px;border-right:2px solid #c0c4cc;border-bottom:2px solid #c0c4cc;border-radius:0 0 2px 0;opacity:.7;}',
        '.cs-resize-handle:hover::after{border-color:#409eff;opacity:1;}',
        '.el-dialog.cs-resized{overflow:auto!important;}'
    ].join('\n');
    doc.head.appendChild(style);

    function applySize(dialog) {
        if (!saved || !saved.w) return;
        dialog.style.width = saved.w + 'px';
        if (saved.h) dialog.style.height = saved.h + 'px';
        dialog.classList.add('cs-resized');
    }

    function persist() {
        try {
            if (typeof GM_setValue === 'function') GM_setValue(KEY, saved ? JSON.stringify(saved) : '');
        } catch (e) {
        }
    }

    function startResize(ev, dialog) {
        ev.preventDefault();
        ev.stopPropagation();
        var rect = dialog.getBoundingClientRect();
        var startX = ev.clientX;
        var startY = ev.clientY;
        var startW = rect.width;
        var startH = rect.height;

        function move(e2) {
            var w = Math.max(MIN_W, Math.round(startW + e2.clientX - startX));
            var h = Math.max(MIN_H, Math.round(startH + e2.clientY - startY));
            dialog.style.width = w + 'px';
            dialog.style.height = h + 'px';
            dialog.style.maxHeight = 'none';
            dialog.classList.add('cs-resized');
        }

        function up() {
            doc.removeEventListener('mousemove', move, true);
            doc.removeEventListener('mouseup', up, true);
            var r = dialog.getBoundingClientRect();
            saved = { w: Math.round(r.width), h: Math.round(r.height) };
            persist();
        }

        doc.addEventListener('mousemove', move, true);
        doc.addEventListener('mouseup', up, true);
    }

    function inject(dialog) {
        if (!dialog || dialog.querySelector(':scope > .cs-resize-handle')) return;
        if (!dialog.style.position) dialog.style.position = 'relative';
        var handle = doc.createElement('div');
        handle.className = 'cs-resize-handle';
        handle.title = '拖拽调整窗口大小（双击恢复默认）';
        handle.addEventListener('mousedown', function (e) {
            startResize(e, dialog);
        });
        handle.addEventListener('dblclick', function (e) {
            e.stopPropagation();
            e.preventDefault();
            dialog.style.width = '';
            dialog.style.height = '';
            dialog.style.maxHeight = '';
            dialog.classList.remove('cs-resized');
            saved = null;
            persist();
        });
        dialog.appendChild(handle);
        applySize(dialog);
    }

    function scan() {
        var list = doc.querySelectorAll('.el-dialog');
        for (var i = 0; i < list.length; i++) inject(list[i]);
    }

    try {
        var mo = new MutationObserver(function () {
            scan();
        });
        mo.observe(doc.body, { childList: true, subtree: true });
    } catch (e) {
    }
    if ('loading' === doc.readyState) doc.addEventListener('DOMContentLoaded', scan);
    else scan();
    setInterval(scan, 2000);
})();
