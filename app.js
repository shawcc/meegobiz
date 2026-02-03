// ================== 0. API CONFIG (BYOK) ==================

function getApiKey() {
    return localStorage.getItem('saas_gemini_key') || "";
}

function saveSettings() {
    const key = document.getElementById('settings-api-key').value;
    localStorage.setItem('saas_gemini_key', key);
    closeModals();
    alert("API Key 已保存！");
}

async function callGemini(prompt) {
    const apiKey = getApiKey();
    
    if (!apiKey) {
        console.log("Using Mock AI because no API Key provided.");
        return new Promise(resolve => {
            setTimeout(() => {
                if (prompt.includes("Generate JSON features")) {
                    resolve(`[
                        {"name": "AI 智能排程", "owner": "Algo Team"},
                        {"name": "多语言支持", "owner": "I18n Team"},
                        {"name": "移动端适配", "owner": "Mobile Team"},
                        {"name": "实时协作同步", "owner": "RTS Team"},
                        {"name": "三方应用集成", "owner": "Open Platform"}
                    ]`);
                } else if (prompt.includes("marketing description")) {
                    resolve("赋能企业数字化转型，解锁无限增长潜能。");
                } else {
                    resolve("AI Response Simulated (No Key Configured)");
                }
            }, 1000);
        });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        if(data.error) throw new Error(data.error.message);
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("AI Error:", error);
        alert("AI 调用失败: " + error.message);
        return null;
    }
}

async function generateAiFeatures() {
    const topic = document.getElementById('ai-feat-topic').value;
    if (!topic) return alert("请输入主题");
    
    const btn = document.getElementById('btn-ai-gen');
    const loader = document.getElementById('ai-feat-loading');
    
    btn.disabled = true; btn.innerText = "生成中...";
    loader.style.display = 'block';

    const prompt = `Generate JSON features for SaaS topic "${topic}". Return ONLY a JSON array with objects having "name" (technical feature name) and "owner" (team name). Generate 5 items. Respond in Chinese where appropriate.`;
    
    const result = await callGemini(prompt);
    
    if(result) {
        try {
            const cleanJson = result.replace(/```json|```/g, '').trim();
            const newFeats = JSON.parse(cleanJson);
            newFeats.forEach(f => {
                features.push({ id: 'feat_ai_' + Math.floor(Math.random()*10000), name: f.name, owner: f.owner });
            });
            saveData();
            closeModals();
            render();
            alert(`成功生成 ${newFeats.length} 个新特性！`);
        } catch (e) {
            alert("生成结果解析失败");
        }
    }
    
    btn.disabled = false; btn.innerText = "开始生成";
    loader.style.display = 'none';
}

async function generateSkuDesc() {
    const name = document.getElementById('sku-name').value;
    const prodId = activeProdId; 
    const prod = products.find(p => p.id === prodId);
    
    if (!name || !prod) return alert("请先填写 SKU 名称");
    
    const btn = document.querySelector('.btn-ai');
    const originalText = btn.innerText;
    btn.innerText = "⏳";
    
    const prompt = `Write a short, attractive Chinese marketing description (max 25 chars) for a SaaS plan named '${name}' for product '${prod.name}'.`;
    const desc = await callGemini(prompt);
    
    if (desc) {
        document.getElementById('sku-desc').value = desc.trim();
    }
    btn.innerText = originalText;
}


// ================== 1. DATA STORE (V37: LATEST CONFIG) ==================
// Data from saas_config (3).json + V36 logic

const defaults = {
"products": [
{ "id": "p_meego_prj", "name": "Meego Project", "code": "PRJ", "icon": "🌟" },
{ "id": "p_meego_ipd", "name": "Meego IPD", "code": "IPD", "icon": "⚙" },
{ "id": "p_meego_ltc", "name": "Meego LTC", "code": "LTC", "icon": "💰" },
{ "id": "p_basic", "name": "Basic Platform", "code": "BSC", "icon": "B" },
{ "id": "p1764591867940", "name": "Meego AI", "code": "AI", "icon": "✨" }
],
"features": [
{ "id": "feat_list", "name": "List/Board Views", "owner": "Core Team" },
{ "id": "feat_gantt", "name": "Gantt Chart", "owner": "Core Team" },
{ "id": "feat_calc", "name": "Calculated Fields", "owner": "Platform" },
{ "id": "feat_global_view", "name": "Global View", "owner": "Platform" },
{ "id": "feat_cross_org", "name": "Enterprise Interconnect", "owner": "Collaboration" },
{ "id": "feat_adv_perm", "name": "Advanced Permissions", "owner": "Identity" },
{ "id": "feat_security", "name": "Security Mgmt", "owner": "Sec Team" },
{ "id": "feat_automation", "name": "Automation Rules", "owner": "Automation" },
{ "id": "feat_branding", "name": "Brand Customization", "owner": "Frontend" },
{ "id": "feat_data_mig", "name": "Data Migration Service", "owner": "Ops" },
{ "id": "feat_custom_plugin", "name": "Custom Plugins", "owner": "Open API" }
],
"capabilities": [
{ "id": "c_base_work", "name": "数据导入导出", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "核心功能", "p_meego_ipd": "核心功能", "p_meego_ltc": "核心功能" } },
{ "id": "c_gantt", "name": "附件能力", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "核心功能", "p_meego_ipd": "核心功能", "p_meego_ltc": "核心功能" } },
{ "id": "c_sec_basic", "name": "排期默认值", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "核心功能" } },
{ "id": "c_api", "name": "计算字段", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "高级资源", "p_meego_ipd": "高级资源", "p_meego_ltc": "高级资源" } },
{ "id": "c_calc_field", "name": "视图控件", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "高级资源", "p_meego_ipd": "高级资源", "p_meego_ltc": "高级资源" } },
{ "id": "c_global_v", "name": "关联工作项信息", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "高级资源", "p_meego_ipd": "高级资源", "p_meego_ltc": "高级资源" } },
{ "id": "c_cross_org", "name": "树形视图", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "视图与报告", "p_meego_ipd": "视图与报告", "p_meego_ltc": "视图与报告" } },
{ "id": "c_adv_perm", "name": "度量视图", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "视图与报告", "p_meego_ipd": "视图与报告", "p_meego_ltc": "视图与报告" } },
{ "id": "c_auto_rule", "name": "全景视图", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "视图与报告", "p_meego_ipd": "视图与报告", "p_meego_ltc": "视图与报告" } },
{ "id": "c_branding", "name": "人员甘特图（跨空间）", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "视图与报告", "p_meego_ipd": "视图与报告", "p_meego_ltc": "视图与报告" } },
{ "id": "c_migrate", "name": "度量计算字段", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "视图与报告", "p_meego_ipd": "视图与报告", "p_meego_ltc": "视图与报告" } },
{ "id": "c_plugins", "name": "自定义用户组", "scope": "WORKSPACE", "fid": "", "prods": ["p_meego_prj"], "type": "BOOL", "categoryMap": { "p_meego_prj": "管理与控制", "p_meego_ipd": "管理与控制", "p_meego_ltc": "管理与控制" } },
{ "id": "c1764582876851", "name": "自定义团队", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "管理与控制", "p_meego_ipd": "管理与控制", "p_meego_ltc": "管理与控制" }, "type": "BOOL" },
{ "id": "c1764582901677", "name": "席位分组管理", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "管理与控制", "p_meego_ipd": "管理与控制", "p_meego_ltc": "管理与控制" }, "type": "BOOL" },
{ "id": "c1764582937003", "name": "页面水印", "scope": "TENANT", "fid": "", "categoryMap": { "p_basic": "管理与控制" }, "type": "BOOL" },
{ "id": "c1764582972083", "name": "应用访问策略管控", "scope": "TENANT", "fid": "", "categoryMap": { "p_basic": "管理与控制" }, "type": "BOOL" },
{ "id": "c1764582992964", "name": "复合子段子字段查看权限", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "管理与控制", "p_meego_ipd": "管理与控制", "p_meego_ltc": "管理与控制" }, "type": "BOOL" },
{ "id": "c1764588578413", "name": "高级多语言支持", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "工作协同", "p_meego_ipd": "工作协同", "p_meego_ltc": "工作协同" }, "type": "BOOL" },
{ "id": "c1764588599288", "name": "空间基准时区", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "工作协同", "p_meego_ipd": "工作协同", "p_meego_ltc": "工作协同" }, "type": "BOOL" },
{ "id": "c1764588617982", "name": "企业互联", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "工作协同", "p_meego_ipd": "工作协同", "p_meego_ltc": "工作协同" }, "type": "BOOL" },
{ "id": "c1764588662369", "name": "企业日历", "scope": "GLOBAL", "fid": "", "categoryMap": { "p_basic": "工作协同" }, "type": "BOOL" },
{ "id": "c1764588683317", "name": "工作项高级配置（层级管理）", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "工作协同", "p_meego_ipd": "工作协同", "p_meego_ltc": "工作协同" }, "type": "BOOL" },
{ "id": "c1764589647152", "name": "父子关系", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "工作协同", "p_meego_ipd": "工作协同", "p_meego_ltc": "工作协同" }, "type": "BOOL" },
{ "id": "c1764589677318", "name": "节点/任务依赖关系", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "工作协同", "p_meego_ipd": "工作协同", "p_meego_ltc": "工作协同" }, "type": "BOOL" },
{ "id": "c1764589701829", "name": "节点自定义按钮", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "工作协同", "p_meego_ipd": "工作协同", "p_meego_ltc": "工作协同" }, "type": "BOOL" },
{ "id": "c1764589717409", "name": "工作项资源库", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "工作协同", "p_meego_ipd": "工作协同", "p_meego_ltc": "工作协同" }, "type": "BOOL" },
{ "id": "c1764589745892", "name": "空间关联/关系管理/跨空间授权", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "工作协同", "p_meego_ipd": "工作协同", "p_meego_ltc": "工作协同" }, "type": "BOOL" },
{ "id": "c1764589794115", "name": "WBS计划表/泳道图/插件（IPD评审&文档创建）等", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "进阶管理", "p_meego_ipd": "进阶管理" }, "type": "BOOL" },
{ "id": "c1764589829873", "name": "插件市场", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "集成与开放能力", "p_meego_ipd": "集成与开放能力", "p_meego_ltc": "集成与开放能力" }, "type": "BOOL" },
{ "id": "c1764589844181", "name": "企业自建插件", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "集成与开放能力", "p_meego_ipd": "集成与开放能力", "p_meego_ltc": "集成与开放能力" }, "type": "BOOL" },
{ "id": "c1764589860459", "name": "标准API", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "集成与开放能力", "p_meego_ipd": "集成与开放能力", "p_meego_ltc": "集成与开放能力" }, "type": "INT" },
{ "id": "c1764589876840", "name": "高级API", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "集成与开放能力", "p_meego_ipd": "集成与开放能力", "p_meego_ltc": "集成与开放能力" }, "type": "INT" },
{ "id": "c1764589898569", "name": "Webhook", "scope": "WORKSPACE", "fid": "", "categoryMap": { "p_meego_prj": "集成与开放能力", "p_meego_ipd": "集成与开放能力", "p_meego_ltc": "集成与开放能力" }, "type": "BOOL" },
{ "id": "c1764589927025", "name": "企业模板市场", "scope": "TENANT", "fid": "", "categoryMap": { "p_meego_prj": "集成与开放能力", "p_meego_ipd": "集成与开放能力", "p_meego_ltc": "集成与开放能力" }, "type": "BOOL" },
{ "id": "c1764589965561", "name": "数据报表", "scope": "TENANT", "fid": "", "categoryMap": { "p_basic": "进阶管理" }, "type": "BOOL" },
{ "id": "c1764589984325", "name": "跨境互通", "scope": "TENANT", "fid": "", "categoryMap": { "p_basic": "工作协同" }, "type": "BOOL" },
{ "id": "c1764590014700", "name": "IP白名单", "scope": "TENANT", "fid": "", "categoryMap": { "p_basic": "管理与控制" }, "type": "BOOL" }
],
"rules": [
{ "id": "r1", "level": "COMMERCIAL", "type": "DEPEND", "desc": "企业互联需基础安全", "src": "c_cross_org", "tgt": "c_sec_basic" },
{ "id": "r1764590169057", "level": "COMMERCIAL", "type": "DEPEND", "desc": "Project Premium才可用IPD高级功能", "src": "s1764590114085", "tgt": "sku_mp_prm" },
{ "id": "r1764590302491", "level": "COMMERCIAL", "type": "DEPEND", "desc": "品牌定制仅支持Premium及以上产品", "src": "s1764590254369", "tgt": "sku_mp_prm" },
{ "id": "r1764591898971", "level": "COMMERCIAL", "type": "DEPEND", "desc": "AI不能独立存在", "src": "p1764591867940", "tgt": ["p_meego_prj", "p_meego_ipd", "p_meego_ltc"] },
{ "id": "r1764592044755", "level": "COMMERCIAL", "type": "DEPEND", "desc": "Basic Platform高级功能-买赠", "src": "s1764591955877", "tgt": ["sku_mp_prm", "sku_mp_ent"] }
],
"skus": [
{
  "id": "sku_mp_std",
  "pid": "p_meego_prj",
  "type": "PLAN",
  "name": "Standard",
  "desc": "适合小型团队快速上手",
  "level": 1,
  "ents": { "c_base_work": true, "c_gantt": true, "c_sec_basic": true, "c_api": true, "c_auto_rule": 100 },
  "pricing": [{ "mode": "PER_USER_MO", "price": 8 }]
},
{
  "id": "sku_mp_prm",
  "pid": "p_meego_prj",
  "type": "PLAN",
  "name": "Premium",
  "desc": "助力中型企业高效协作",
  "level": 2,
  "ents": { "c_base_work": true, "c_gantt": true, "c_sec_basic": true, "c_api": true, "c_calc_field": true, "c_global_v": true, "c_cross_org": true, "c_adv_perm": true, "c_auto_rule": 1000 },
  "pricing": [{ "mode": "PER_USER_MO", "price": 12 }]
},
{
  "id": "sku_mp_ent",
  "pid": "p_meego_prj",
  "type": "PLAN",
  "name": "Enterprise",
  "desc": "大型组织的旗舰之选",
  "level": 3,
  "ents": { "c_base_work": true, "c_gantt": true, "c_sec_basic": true, "c_api": true, "c_calc_field": true, "c_global_v": true, "c_cross_org": true, "c_adv_perm": true, "c_auto_rule": 10000, "c_branding": true, "c_migrate": true, "c_plugins": true },
  "pricing": [{ "mode": "CUSTOM", "price": 0 }]
},
{
  "id": "sku_mp_auto_plus",
  "pid": "p_meego_prj",
  "type": "ADDON",
  "name": "Auto+ Pack",
  "desc": "增加 5000 次自动化执行",
  "ents": { "c_auto_rule": 5000 },
  "pricing": [{ "mode": "FLAT_MO", "price": 100 }]
},
{
  "id": "s1764590114085",
  "pid": "p_meego_prj",
  "type": "ADDON",
  "name": "IPD高级功能",
  "desc": "",
  "pricing": [{ "mode": "PER_USER_MO", "price": 5 }],
  "level": 1,
  "ents": {}
},
{
  "id": "s1764590254369",
  "pid": "p_meego_prj",
  "type": "ADDON",
  "name": "品牌定制",
  "desc": "",
  "pricing": [{ "mode": "FLAT_YR", "price": 70000 }],
  "level": 1,
  "ents": {}
},
{
  "id": "s1764591939836",
  "pid": "p_basic",
  "type": "PLAN",
  "name": "Basic",
  "desc": "",
  "pricing": [{ "mode": "PER_USER_MO", "price": 0 }],
  "level": 1,
  "ents": {}
},
{
  "id": "s1764591955877",
  "pid": "p_basic",
  "type": "PLAN",
  "name": "Basic Premium",
  "desc": "",
  "pricing": [{ "mode": "PER_USER_MO", "price": 0 }],
  "level": 2,
  "ents": { "c1764582937003": true, "c1764582972083": true, "c1764590014700": true, "c1764588662369": true, "c1764589984325": true, "c1764589965561": true }
}
],
"tenants": [
{
  "id": "t1",
  "name": "Li Auto",
  "subs": [
    { "skuId": "sku_mp_ent", "seats": 2000, "status": "Active", "end": "2026-01-01" }
  ]
},
{
  "id": "t2",
  "name": "NIO",
  "subs": [
    { "skuId": "sku_mp_prm", "seats": 500, "status": "Active", "end": "2025-06-30" }
  ]
}
]
};

let products, features, capabilities, rules, skus, tenants;

// --- SMART MIGRATION LAYER V33 ---
function migrateData(data) {
    if (data.capabilities) {
        data.capabilities.forEach(c => {
            // V32 -> V33: Convert single category to categoryMap
            if (c.category && !c.categoryMap) {
                c.categoryMap = {};
                const prods = c.prods || (c.prod ? [c.prod] : []);
                prods.forEach(pid => c.categoryMap[pid] = c.category);
                delete c.category;
            }
            if (!c.categoryMap) c.categoryMap = {};
            
            // V22 -> V24 legacy cleanup
            if (!c.prods && c.prod) c.prods = [c.prod];
        });
    }
    if (data.skus) {
        data.skus.forEach(s => {
            // V33: pricing array migration
            if (!s.pricing) {
                s.pricing = [];
                if (s.billing && s.price !== undefined) {
                    s.pricing.push({ mode: s.billing, price: s.price });
                }
                // cleanup old fields
                delete s.price; 
                delete s.billing;
            }
            // V30: ents object migration
            if (Array.isArray(s.ents)) {
                const newEnts = {};
                s.ents.forEach(c => newEnts[c] = true);
                s.ents = newEnts;
            }
        });
    }
    return data;
}

function initData() {
    if(localStorage.getItem('saas_demo_v37')) {
        let saved = JSON.parse(localStorage.getItem('saas_demo_v37'));
        saved = migrateData(saved);
        products = saved.products; features = saved.features; capabilities = saved.capabilities;
        rules = saved.rules; skus = saved.skus; tenants = saved.tenants;
    } else {
        resetData(false);
    }
}

function saveData() {
    const data = { products, features, capabilities, rules, skus, tenants };
    localStorage.setItem('saas_demo_v37', JSON.stringify(data));
}

function resetData(reload = true) {
    products = JSON.parse(JSON.stringify(defaults.products));
    features = JSON.parse(JSON.stringify(defaults.features));
    capabilities = JSON.parse(JSON.stringify(defaults.capabilities));
    rules = JSON.parse(JSON.stringify(defaults.rules));
    skus = JSON.parse(JSON.stringify(defaults.skus));
    tenants = JSON.parse(JSON.stringify(defaults.tenants));
    saveData();
    if(reload) location.reload();
}

// --- IMPORT / EXPORT LOGIC ---
function exportData() {
    const data = { products, features, capabilities, rules, skus, tenants };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "saas_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let imported = JSON.parse(e.target.result);
            if(imported.products && imported.skus) {
                imported = migrateData(imported); // Run migration on import
                localStorage.setItem('saas_demo_v37', JSON.stringify(imported));
                location.reload();
            } else {
                alert('Invalid configuration file format');
            }
        } catch(err) {
            alert('Error parsing JSON');
        }
    };
    reader.readAsText(file);
}

initData();

// ================== 2. STATE & ROUTING ==================
let currView = 'guide';
let activeProdId = null;
let editingId = null;
let editSubRef = null;
let drawerAddonId = null;
let ruleTab = 'COMMERCIAL';

// Tenant View State
let tenantSearch = '';
let tenantPage = 1;
const TENANT_PAGE_SIZE = 12;


function route(view) {
    // Clean up UI state
    closeModals();
    if(document.getElementById('drawer').classList.contains('open')) {
        closeDrawer();
    }

    currView = view;
    activeProdId = null;
    updateNav();
    render();
}
function enterProduct(pid) {
    currView = 'sku_studio';
    activeProdId = pid;
    updateNav();
    render();
}
function updateNav() {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (currView === 'products' || currView === 'sku_studio') document.getElementById('nav-products').classList.add('active');
    else document.getElementById('nav-'+currView).classList.add('active');
}

function render() {
    const c = document.getElementById('main-content');
    const h = document.getElementById('page-title');
    const ha = document.getElementById('page-actions');
    c.innerHTML = ''; ha.innerHTML = '';

    if(currView === 'features') renderFeatures(c, h, ha);
    if(currView === 'caps') renderCaps(c, h, ha);
    if(currView === 'rules') renderRules(c, h, ha);
    if(currView === 'products') renderProducts(c, h, ha);
    if(currView === 'sku_studio') renderSkuStudio(c, h, ha);
    if(currView === 'ents') renderEnts(c, h, ha);
    if(currView === 'usage') renderUsage(c, h, ha);
    if(currView === 'guide') renderGuide(c, h, ha);
    if(currView === 'dashboard') renderDashboard(c, h, ha);
}

function resolveName(id, level) {
    // Handle multiple IDs (array)
    if (Array.isArray(id)) {
        return id.map(i => resolveName(i, level)).join(' 或 ');
    }
    if(level === 'COMMERCIAL') {
        const p = products.find(x => x.id === id); if(p) return `产品: ${p.name}`;
        const s = skus.find(x => x.id === id); if(s) return `SKU: ${s.name}`;
    } else {
        const f = features.find(x => x.id === id); if(f) return `Feat: ${f.name}`;
        const c = capabilities.find(x => x.id === id); if(c) return `Cap: ${c.name}`;
    }
    return id;
}

function getPriceDisplay(sku) {
    if(!sku.pricing || sku.pricing.length === 0) return '未定价';
    
    const labels = {
        'PER_USER_MO': '/人/月',
        'PER_USER_YR': '/人/年',
        'FLAT_MO': '/月',
        'FLAT_YR': '/年',
        'ONE_TIME': '一次性',
        'CUSTOM': '询价'
    };

    return sku.pricing.map(p => {
        if(p.mode === 'CUSTOM') return '询价';
        return `¥${p.price}${labels[p.mode]||''}`;
    }).join(' | ');
}

// ================== 3. VIEWS ==================

function renderDashboard(c, h, ha) {
    h.innerText = '仪表盘 (Dashboard)';
    
    // --- 1. Business Metrics (Runtime) ---
    const totalTenants = tenants.length;
    let totalSeats = 0;
    let totalSubs = 0;
    let estMRR = 0;
    const prodCounts = {};
    products.forEach(p => prodCounts[p.id] = 0);

    // Track capability usage count based on active subs
    const capUsage = {}; 
    const capRevenueImpact = {}; // Total MRR of SKUs containing this cap
    
    capabilities.forEach(c => {
        capUsage[c.id] = 0;
        capRevenueImpact[c.id] = 0;
    });

    tenants.forEach(t => {
        t.subs.forEach(sub => {
            if(sub.status !== 'Active') return;
            totalSubs++;
            totalSeats += parseInt(sub.seats) || 0;
            
            const sku = skus.find(s => s.id === sub.skuId);
            if(sku) {
                if(prodCounts[sku.pid] !== undefined) prodCounts[sku.pid]++;
                
                let subMrr = 0;
                // MRR Calc
                if(sku.pricing) {
                    sku.pricing.forEach(p => {
                        let price = p.price || 0;
                        if(p.mode === 'PER_USER_MO') subMrr += price * sub.seats;
                        if(p.mode === 'FLAT_MO') subMrr += price;
                        if(p.mode === 'PER_USER_YR') subMrr += (price * sub.seats) / 12;
                        if(p.mode === 'FLAT_YR') subMrr += price / 12;
                    });
                }
                estMRR += subMrr;

                // Cap Usage & Revenue Impact
                if(sku.ents) {
                    Object.keys(sku.ents).forEach(cid => {
                        if(capUsage[cid] !== undefined) {
                            capUsage[cid]++;
                            capRevenueImpact[cid] += subMrr;
                        }
                    });
                }
            }
        });
    });

    // Sort Top Capabilities by Revenue Contribution (Weighted Value)
    const topCaps = Object.keys(capUsage)
        .map(cid => ({ 
            id: cid, 
            count: capUsage[cid], 
            revenue: capRevenueImpact[cid],
            obj: capabilities.find(x=>x.id===cid) 
        }))
        .filter(item => item.count > 0) // Only show active ones
        .sort((a,b) => b.revenue - a.revenue) // Sort by revenue contribution
        .slice(0, 8);


    // --- 2. Configuration Metrics (Design Time) ---
    const totalFeats = features.length;
    const totalCaps = capabilities.length;
    const totalPlans = skus.filter(s=>s.type==='PLAN').length;
    const totalAddons = skus.filter(s=>s.type==='ADDON').length;
    const totalRules = rules.length;

    c.innerHTML = `
        <!-- Section 1: Business Overview -->
        <div style="margin-bottom:32px;">
            <div style="font-size:14px; font-weight:700; color:#475569; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                <span>🚀 商业运营大盘 (Business Runtime)</span>
                <div style="flex:1; height:1px; background:#e2e8f0;"></div>
            </div>
            <div class="concept-grid">
                <div class="concept-card" style="border-top:4px solid #3b82f6;">
                    <div style="font-size:12px; color:#64748b; font-weight:600; text-transform:uppercase;">Total Tenants</div>
                    <div style="font-size:32px; font-weight:700; margin-top:8px; color:#1e293b;">${totalTenants}</div>
                </div>
                <div class="concept-card" style="border-top:4px solid #10b981;">
                    <div style="font-size:12px; color:#64748b; font-weight:600; text-transform:uppercase;">Active Seats</div>
                    <div style="font-size:32px; font-weight:700; margin-top:8px; color:#1e293b;">${totalSeats}</div>
                </div>
                <div class="concept-card" style="border-top:4px solid #8b5cf6;">
                    <div style="font-size:12px; color:#64748b; font-weight:600; text-transform:uppercase;">Est. MRR</div>
                    <div style="font-size:32px; font-weight:700; margin-top:8px; color:#1e293b;">¥${estMRR.toFixed(0)}</div>
                </div>
                <div class="concept-card" style="border-top:4px solid #f59e0b;">
                    <div style="font-size:12px; color:#64748b; font-weight:600; text-transform:uppercase;">Active Subs</div>
                    <div style="font-size:32px; font-weight:700; margin-top:8px; color:#1e293b;">${totalSubs}</div>
                </div>
            </div>
        </div>

        <!-- Section 2: Configuration Complexity -->
        <div style="margin-bottom:32px;">
            <div style="font-size:14px; font-weight:700; color:#475569; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                <span>🏗️ 配置资产规模 (Configuration Assets)</span>
                <div style="flex:1; height:1px; background:#e2e8f0;"></div>
            </div>
            
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px;">
                <!-- R&D Layer -->
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div>
                            <div style="font-size:24px; font-weight:700; color:#1e293b;">${totalFeats}</div>
                            <div style="font-size:12px; color:#64748b;">Features (Tech)</div>
                        </div>
                        <span style="font-size:20px;">🔧</span>
                    </div>
                </div>

                <!-- Commercial Layer -->
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div>
                            <div style="font-size:24px; font-weight:700; color:#1e293b;">${totalCaps}</div>
                            <div style="font-size:12px; color:#64748b;">Capabilities (Biz)</div>
                        </div>
                        <span style="font-size:20px;">📦</span>
                    </div>
                    <div style="margin-top:12px; padding-top:12px; border-top:1px dashed #e2e8f0; font-size:11px; color:#64748b;">
                        包含 ${capabilities.filter(c=>c.type==='INT').length} 个数值型能力
                    </div>
                </div>

                <!-- Sales Layer -->
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div>
                            <div style="font-size:24px; font-weight:700; color:#1e293b;">${totalPlans + totalAddons}</div>
                            <div style="font-size:12px; color:#64748b;">SKUs (Saleable)</div>
                        </div>
                        <span style="font-size:20px;">🏷️</span>
                    </div>
                    <div style="margin-top:12px; padding-top:12px; border-top:1px dashed #e2e8f0; font-size:11px; color:#64748b;">
                        ${totalPlans} Plans, ${totalAddons} Add-ons
                    </div>
                </div>
                
                <!-- Rules Layer -->
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div>
                            <div style="font-size:24px; font-weight:700; color:#1e293b;">${totalRules}</div>
                            <div style="font-size:12px; color:#64748b;">Active Rules</div>
                        </div>
                        <span style="font-size:20px;">🛡️</span>
                    </div>
                    <div style="margin-top:12px; padding-top:12px; border-top:1px dashed #e2e8f0; font-size:11px; color:#64748b;">
                        ${rules.filter(r=>r.type==='MUTEX').length} Mutex, ${rules.filter(r=>r.type==='DEPEND').length} Dependencies
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 3: Analysis Charts -->
        <div style="display:grid; grid-template-columns: 3fr 2fr; gap:24px;">
            
            <!-- Left: Product Distribution -->
            <div class="card" style="margin-bottom:0; display:flex; flex-direction:column;">
                <div class="card-header">产品订阅分布 (By Product)</div>
                <div class="card-body" style="flex:1;">
                    <div style="display:flex; flex-direction:column; gap:16px;">
                        ${products.map(p => {
                            const count = prodCounts[p.id];
                            const pct = totalSubs > 0 ? Math.round((count / totalSubs) * 100) : 0;
                            return `
                            <div>
                                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px;">
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <span>${p.icon}</span> <span>${p.name}</span>
                                    </div>
                                    <div style="font-weight:600;">${count} <span style="font-weight:400; color:#94a3b8; font-size:12px;">(${pct}%)</span></div>
                                </div>
                                <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                                    <div style="width:${pct}%; height:100%; background:var(--primary);"></div>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Right: Capability Value Analysis -->
            <div class="card" style="margin-bottom:0; display:flex; flex-direction:column;">
                <div class="card-header">
                    <div>� 能力价值贡献 (Value Contribution)</div>
                </div>
                <div class="card-body" style="flex:1; padding:0;">
                    <table style="width:100%; text-align:left;">
                        <thead style="background:#f8fafc; font-size:11px; color:#64748b;">
                            <tr>
                                <th style="padding:10px 16px; border-bottom:1px solid #f1f5f9;">能力名称</th>
                                <th style="padding:10px 16px; border-bottom:1px solid #f1f5f9; text-align:right;">渗透率 (Penetration)</th>
                                <th style="padding:10px 16px; border-bottom:1px solid #f1f5f9; text-align:right;">营收贡献 (Rev Impact)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topCaps.map((item, idx) => {
                                const penPct = totalTenants > 0 ? Math.round((item.count / totalTenants) * 100) : 0;
                                const revPct = estMRR > 0 ? Math.round((item.revenue / estMRR) * 100) : 0;
                                return `
                                <tr style="border-bottom:1px dashed #f1f5f9;">
                                    <td style="padding:12px 16px;">
                                        <div style="font-size:13px; font-weight:600; color:#334155;">${item.obj ? item.obj.name : item.id}</div>
                                        <div style="font-size:10px; color:#94a3b8;">${item.obj ? item.obj.scope : ''}</div>
                                    </td>
                                    <td style="padding:12px 16px; text-align:right;">
                                        <div style="font-weight:600; color:#3b82f6;">${penPct}%</div>
                                        <div style="font-size:10px; color:#94a3b8;">${item.count} tenants</div>
                                    </td>
                                    <td style="padding:12px 16px; text-align:right;">
                                        <div style="font-weight:600; color:#10b981;">¥${item.revenue.toFixed(0)}</div>
                                        <div style="font-size:10px; color:#94a3b8;">${revPct}% coverage</div>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                    <div style="padding:12px; font-size:11px; color:#94a3b8; text-align:center; background:#f8fafc; border-top:1px solid #f1f5f9;">
                        * 营收贡献计算方式：该能力所在 SKU 的 MRR 总和
                    </div>
                </div>
            </div>

        </div>
    `;
}

function renderUsage(c, h, ha) {
    h.innerText = '能力用量分析 (Capability Usage)';
    ha.innerHTML = `<button class="btn btn-outline" onclick="exportUsageData()">📤 导出报表</button>`;

    // 1. Calculate Data
    const capData = capabilities.map(cap => {
        let tenantCount = 0;
        let revenueImpact = 0;
        const linkedSkus = [];
        const activeTenants = [];

        // Find SKUs containing this cap
        skus.forEach(s => {
            if (s.ents && s.ents[cap.id]) {
                linkedSkus.push(s);
            }
        });

        // Calculate Tenant Usage & Revenue
        tenants.forEach(t => {
            let hasCap = false;
            t.subs.forEach(sub => {
                if (sub.status !== 'Active') return;
                const sku = skus.find(k => k.id === sub.skuId);
                if (sku && sku.ents && sku.ents[cap.id]) {
                    hasCap = true;
                    // Rough revenue attribution: Total SKU Price
                    if(sku.pricing) {
                        sku.pricing.forEach(p => {
                            let price = p.price || 0;
                            if(p.mode === 'PER_USER_MO') revenueImpact += price * sub.seats;
                            if(p.mode === 'FLAT_MO') revenueImpact += price;
                            if(p.mode === 'PER_USER_YR') revenueImpact += (price * sub.seats) / 12;
                            if(p.mode === 'FLAT_YR') revenueImpact += price / 12;
                        });
                    }
                }
            });
            if (hasCap) {
                tenantCount++;
                activeTenants.push(t.name);
            }
        });

        return {
            ...cap,
            tenantCount,
            revenueImpact,
            linkedSkus,
            activeTenants
        };
    });

    // Sort by Tenant Count desc
    capData.sort((a, b) => b.tenantCount - a.tenantCount);

    // 2. Render Table
    c.innerHTML = `
        <div class="guide-box" style="margin-bottom:24px; border-left:4px solid #3b82f6;">
            <div style="font-size:13px; color:#475569;">
                <strong>💡 定价参考：</strong> 此报表展示了每个商业能力的实际覆盖率与营收关联度。
                <br>• <strong>高覆盖、低营收</strong>：核心基础能力，考虑是否应该作为付费点。
                <br>• <strong>低覆盖、高营收</strong>：高价值增值能力，考虑推广或拆分独立售卖。
            </div>
        </div>

        <div class="card" style="padding:0; overflow:hidden;">
            <table style="width:100%;">
                <thead>
                    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; font-size:12px; color:#64748b;">
                        <th style="padding:12px 24px;">能力名称 (Capability)</th>
                        <th style="padding:12px 24px;">作用域</th>
                        <th style="padding:12px 24px;">所属 SKU (Distribution)</th>
                        <th style="padding:12px 24px; text-align:right;">活跃租户数 (Adoption)</th>
                        <th style="padding:12px 24px; text-align:right;">关联营收 (Rev Impact)</th>
                    </tr>
                </thead>
                <tbody>
                    ${capData.map(d => {
                        const skuBadges = d.linkedSkus.map(s => {
                            const isAddon = s.type === 'ADDON';
                            return `<span class="tag ${isAddon ? 'tag-orange' : 'tag-blue'}" title="${s.name}">${isAddon ? 'Addon' : 'Plan'}</span>`;
                        }).slice(0, 3).join('');
                        const moreSku = d.linkedSkus.length > 3 ? `<span style="font-size:10px; color:#94a3b8;">+${d.linkedSkus.length - 3}</span>` : '';

                        return `
                        <tr style="border-bottom:1px solid #f1f5f9;">
                            <td style="padding:16px 24px;">
                                <div style="font-weight:600; color:#1e293b;">${d.name}</div>
                                <div style="font-size:11px; color:#94a3b8; font-family:monospace;">${d.id}</div>
                            </td>
                            <td style="padding:16px 24px;">
                                <span class="tag tag-gray">${d.scope}</span>
                            </td>
                            <td style="padding:16px 24px;">
                                <div style="display:flex; align-items:center; gap:4px;">
                                    ${skuBadges || '<span style="color:#cbd5e1">-</span>'} ${moreSku}
                                </div>
                                <div style="font-size:11px; color:#64748b; margin-top:4px;">In ${d.linkedSkus.length} SKUs</div>
                            </td>
                            <td style="padding:16px 24px; text-align:right;">
                                <div style="font-weight:600; font-size:15px;">${d.tenantCount}</div>
                                <div style="font-size:11px; color:#94a3b8;">${tenants.length > 0 ? Math.round(d.tenantCount / tenants.length * 100) : 0}% Pen.</div>
                            </td>
                            <td style="padding:16px 24px; text-align:right;">
                                <div style="font-weight:600; color:#10b981;">¥${d.revenueImpact.toFixed(0)}</div>
                                <div style="font-size:11px; color:#94a3b8;">Monthly</div>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function exportUsageData() {
    alert("导出功能开发中...");
}

function renderGuide(c, h, ha) {
    h.innerText = '配置指南';
    c.innerHTML = `
        <div class="guide-section">
            <div class="guide-title">1. 核心概念与流转 (Concept Map)</div>
            <div class="guide-box">
                <p class="guide-text">MeegoBiz 实现了 <strong>“产研商业解耦”</strong> 的核心理念。研发专注于技术实现，运营专注于商业包装。</p>
                
                <div class="concept-map">
                    <div class="map-step">
                        <div class="map-icon">🔧</div>
                        <div class="map-role">研发 R&D</div>
                        <div class="map-title">Feature</div>
                        <div class="map-desc">原子化的技术特性<br>(代码实现、开关、埋点)</div>
                    </div>
                    <div class="map-step">
                        <div class="map-icon">📦</div>
                        <div class="map-role">运营 Ops</div>
                        <div class="map-title">Capability</div>
                        <div class="map-desc">商业能力定义<br>(对Feature进行包装、分类、定价属性)</div>
                    </div>
                    <div class="map-step">
                        <div class="map-icon">🏷️</div>
                        <div class="map-role">销售 Sales</div>
                        <div class="map-title">Product & SKU</div>
                        <div class="map-desc">售卖单元组合<br>(版本Plan、增值包Add-on、定价策略)</div>
                    </div>
                    <div class="map-step">
                        <div class="map-icon">👥</div>
                        <div class="map-role">客户 Customer</div>
                        <div class="map-title">Tenant Entitlement</div>
                        <div class="map-desc">权益履约与生效<br>(订阅记录、有效期、席位)</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="guide-section">
            <div class="guide-title">2. 实体关系图谱 (Entity Relationships)</div>
            <div class="guide-box">
                <p class="guide-text">各层级对象之间的映射关系定义了系统的灵活性：</p>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-top:20px;">
                    <!-- Relation 1 -->
                    <div style="background:white; border:1px solid #e2e8f0; border-radius:8px; padding:16px; text-align:center;">
                        <div style="font-size:12px; color:#64748b; margin-bottom:8px;">技术与商业的桥梁</div>
                        <div style="font-weight:700; color:#1e293b; display:flex; justify-content:center; align-items:center; gap:8px;">
                            Feature <span style="color:#8b5cf6; background:#f3f4f6; padding:2px 6px; border-radius:4px; font-size:10px;">1:N</span> Capability
                        </div>
                        <div style="font-size:12px; color:#64748b; margin-top:8px; line-height:1.4; text-align:left;">
                            <strong>复用与拆分：</strong> 一个底层技术特性（如“云存储”）可以被包装成多个不同规格的商业能力（如“10GB存储”、“1TB存储”）。
                        </div>
                    </div>

                    <!-- Relation 2 -->
                    <div style="background:white; border:1px solid #e2e8f0; border-radius:8px; padding:16px; text-align:center;">
                        <div style="font-size:12px; color:#64748b; margin-bottom:8px;">灵活组装 (Matrix)</div>
                        <div style="font-weight:700; color:#1e293b; display:flex; justify-content:center; align-items:center; gap:8px;">
                            Capability <span style="color:#2563eb; background:#eff6ff; padding:2px 6px; border-radius:4px; font-size:10px;">M:N</span> SKU
                        </div>
                        <div style="font-size:12px; color:#64748b; margin-top:8px; line-height:1.4; text-align:left;">
                            <strong>套餐组合：</strong> 能力原子是“配料”，SKU是“菜单”。同一个能力（如“SSO登录”）可以出现在“专业版”和“旗舰版”等多个SKU中。
                        </div>
                    </div>

                    <!-- Relation 3 -->
                    <div style="background:white; border:1px solid #e2e8f0; border-radius:8px; padding:16px; text-align:center;">
                        <div style="font-size:12px; color:#64748b; margin-bottom:8px;">订阅履约</div>
                        <div style="font-weight:700; color:#1e293b; display:flex; justify-content:center; align-items:center; gap:8px;">
                            SKU <span style="color:#10b981; background:#ecfdf5; padding:2px 6px; border-radius:4px; font-size:10px;">M:N</span> Tenant
                        </div>
                        <div style="font-size:12px; color:#64748b; margin-top:8px; line-height:1.4; text-align:left;">
                            <strong>多重订阅：</strong> 一个客户可以订阅多个产品（SKU）。例如，同时购买“项目管理-专业版”和“自动化-增值包”。
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="guide-section">
            <div class="guide-title">3. 作用域 (Scope) 体系</div>
            <div class="guide-box">
                <p class="guide-text">决定了权益购买后在哪里生效：</p>
                <ul style="padding-left:20px; color:#475569; font-size:14px;">
                    <li><span class="tag tag-orange">WORKSPACE</span> <strong>工作区级</strong>：仅在特定的项目/空间内生效（如：甘特图、需求管理）。</li>
                    <li><span class="tag tag-blue">TENANT</span> <strong>租户级</strong>：购买后全公司/全租户所有成员可用（如：SSO、企业品牌定制）。</li>
                    <li><span class="tag tag-purple">GLOBAL</span> <strong>全域级 (跨工作区)</strong>：购买了某个权益后，租户下的**所有工作区**都能使用该功能（无需逐个分配）。</li>
                </ul>
            </div>
        </div>

        <div class="guide-section">
            <div class="guide-title">4. 规则引擎 (Guardrails)</div>
            <div class="guide-box">
                <p class="guide-text">为了防止配置错误，我们引入了双层规则校验：</p>
                <ul style="padding-left:20px; color:#475569; font-size:14px;">
                    <li><strong>技术互斥 (Tech Mutex)</strong>：研发定义的底层冲突（如：旧版引擎不能与新版引擎共存），在配置商品时会强制拦截。</li>
                    <li><strong>商业依赖 (Comm. Dependency)</strong>：运营定义的售卖逻辑（如：购买增值包必须先购买专业版），用于引导客户升级。</li>
                </ul>
            </div>
        </div>
    `;
}

function renderFeatures(c, h, ha) {
    h.innerText = '产品功能 (Features)';
    ha.innerHTML = `<button class="btn btn-ai" onclick="openModal('ai-feature')" style="margin-right:10px;">✨ AI 批量生成</button><button class="btn btn-primary" onclick="openModal('feature')">+ 注册 Feature</button>`;
    c.innerHTML = `<div class="card"><table><thead><tr><th>ID</th><th>名称</th><th>需求单</th><th>Owner</th><th>操作</th></tr></thead><tbody>
        ${features.map(f => `<tr><td><code class="code-pill">${f.id}</code></td><td>${f.name}</td><td>${f.reqId ? `<span class="tag tag-blue">📄 ${f.reqId}</span>` : '<span style="color:#cbd5e1">-</span>'}</td><td>${f.owner}</td><td><button class="btn btn-icon" onclick="openModal('feature','${f.id}')">✏️</button><button class="btn btn-icon danger" onclick="deleteItem('feature','${f.id}')">🗑️</button></td></tr>`).join('')}
    </tbody></table></div>`;
}

function renderCaps(c, h, ha) {
    h.innerText = '商业能力 (Capabilities)';
    ha.innerHTML = `<button class="btn btn-primary" onclick="openModal('cap')">+ 定义 Capability</button>`;
    c.innerHTML = `<div class="card"><table><thead><tr><th>名称</th><th>分类</th><th>作用域</th><th>类型</th><th>绑定Feature</th><th>适用产品</th><th>操作</th></tr></thead><tbody>
        ${capabilities.map(cap => {
            const f = features.find(x => x.id === cap.fid);
            const prodBadges = (cap.prods || []).map(pid => {
                const p = products.find(x=>x.id===pid);
                if (!p) return '';
                // Resolve category for this product
                const cat = (cap.categoryMap && cap.categoryMap[pid]) || '';
                return `<div style="font-size:11px; margin-bottom:2px;"><span class="tag tag-green" style="margin:0;">${p.code}</span> <span style="color:#64748b;">${cat}</span></div>`;
            }).join('');

            const typeTag = cap.type === 'INT' ? '<span class="tag tag-purple">数值</span>' : '<span class="tag tag-gray">开关</span>';
            
            return `<tr>
                <td><b>${cap.name}</b></td>
                <td>${cap.categoryMap ? '按产品配置' : '-'}</td>
                <td><span class="tag ${cap.scope==='TENANT'?'tag-blue':'tag-orange'}">${cap.scope}</span></td>
                <td>${typeTag}</td>
                <td>${f ? f.name : '-'}</td>
                <td>${prodBadges}</td>
                <td><button class="btn btn-icon" onclick="openModal('cap','${cap.id}')">✏️</button><button class="btn btn-icon danger" onclick="deleteItem('cap','${cap.id}')">🗑️</button></td>
            </tr>`;
        }).join('')}
    </tbody></table></div>`;
}

function renderRules(c, h, ha) {
    h.innerText = '规则引擎 (Rules)';
    ha.innerHTML = `<button class="btn btn-primary" onclick="openModal('rule')">+ 新建规则</button>`;
    const filtered = rules.filter(r => r.level === ruleTab);
    
    c.innerHTML = `
    <div class="rule-tabs">
        <div class="rule-tab ${ruleTab==='COMMERCIAL'?'active':''}" onclick="ruleTab='COMMERCIAL'; render()">商业规则</div>
        <div class="rule-tab ${ruleTab==='TECHNICAL'?'active':''}" onclick="ruleTab='TECHNICAL'; render()">技术规则</div>
    </div>
    <div class="card" style="padding:24px; border-top:none; border-top-left-radius:0; border-top-right-radius:0; margin-top:-24px;">
        ${filtered.length===0 ? '<div style="color:#999; text-align:center">暂无规则</div>' : filtered.map(r => `
            <div style="border:1px solid #e2e8f0; padding:12px; border-radius:6px; margin-bottom:8px; display:flex; align-items:center;">
                <span class="tag ${r.type==='MUTEX'?'tag-red':'tag-blue'}" style="width:70px; margin-right:16px;">${r.type}</span>
                <div style="flex:1;">
                    <div style="font-weight:600">${r.desc}</div>
                    <div style="font-size:12px; color:#64748b;">${resolveName(r.src, r.level)} ➡ ${resolveName(r.tgt, r.level)}</div>
                </div>
                <button class="btn btn-icon" onclick="openModal('rule','${r.id}')">✏️</button>
                <button class="btn btn-icon danger" onclick="deleteItem('rule','${r.id}')">🗑️</button>
            </div>`).join('')}
    </div>`;
}

function renderProducts(c, h, ha) {
    h.innerText = '产品管理 (Products)';
    ha.innerHTML = `<button class="btn btn-primary" onclick="openModal('prod')">+ 新建产品</button>`;
    c.innerHTML = `<div class="prod-grid">${products.map(p => {
        const deps = rules.filter(r => r.level === 'COMMERCIAL' && r.type === 'DEPEND' && r.src === p.id);
        return `
        <div class="prod-card" onclick="enterProduct('${p.id}')">
            <div class="prod-actions" onclick="event.stopPropagation()"><button class="btn btn-icon" onclick="openModal('prod','${p.id}')">✏️</button><button class="btn btn-icon danger" onclick="deleteItem('prod','${p.id}')">🗑️</button></div>
            <div class="prod-icon">${p.icon}</div>
            <div style="font-weight:600; font-size:16px;">${p.name}</div>
            <div style="font-size:12px; color:#64748b; margin-top:4px;">Code: ${p.code}</div>
            ${deps.map(d => `<div class="rel-badge depend">🔗 依赖: ${resolveName(d.tgt, 'COMMERCIAL')}</div>`).join('')}
            <div style="margin-top:auto; padding-top:10px; font-size:12px; color:#64748b;">
                ${skus.filter(s=>s.pid===p.id && s.type==='PLAN').length} Versions, 
                ${skus.filter(s=>s.pid===p.id && s.type==='ADDON').length} Add-ons
            </div>
        </div>`;
    }).join('')}</div>`;
}

function renderSkuStudio(c, h, ha) {
    const prod = products.find(p => p.id === activeProdId);
    h.innerHTML = `<span style="color:#64748b; cursor:pointer" onclick="route('products')">产品管理</span> / ${prod.name}`;
    ha.innerHTML = `<button class="btn btn-primary" onclick="openModal('sku')">+ SKU</button>`;

    let plans = skus.filter(s => s.pid === activeProdId && s.type === 'PLAN');
    plans.sort((a,b) => (a.level || 0) - (b.level || 0));

    const addons = skus.filter(s => s.pid === activeProdId && s.type === 'ADDON');
    
    // V33: Filter caps using categoryMap
    const prodCaps = capabilities.filter(c => c.categoryMap && c.categoryMap[activeProdId]);
    
    // V33: Group by Category for THIS product
    const catGroups = {};
    prodCaps.forEach(c => {
        const cat = c.categoryMap[activeProdId] || '未分类';
        if(!catGroups[cat]) catGroups[cat] = [];
        catGroups[cat].push(c);
    });
    const categories = Object.keys(catGroups);

    c.innerHTML = `
    <h3>Plan Matrix</h3>
    <div class="matrix-container">
        <table>
            <thead>
                <tr><th style="background:white; min-width:200px;">能力原子</th>
                ${plans.map(p => {
                    const reqs = rules.filter(r => r.level==='COMMERCIAL' && r.type==='DEPEND' && r.tgt===p.id);
                    return `<th>
                        <div class="sku-header-content">
                            <div class="sku-header-row">${p.name} <div class="sku-actions"><button class="btn btn-icon" onclick="openModal('sku','${p.id}')">✏️</button><button class="btn btn-icon danger" onclick="deleteItem('sku','${p.id}')">🗑️</button></div></div>
                            <div class="sku-price-tag">${getPriceDisplay(p)}</div>
                            ${reqs.map(r => `<div class="rel-badge required">⬅️ 被依赖: ${resolveName(r.src, 'COMMERCIAL')}</div>`).join('')}
                        </div>
                    </th>`;
                }).join('')}
                </tr>
            </thead>
            <tbody>
                ${categories.length === 0 ? '<tr><td colspan="10" style="text-align:center;padding:20px;color:#999">暂无关联能力，请去“商业能力”页配置适用产品</td></tr>' : ''}
                ${categories.map(cat => `
                    <tr><td colspan="${plans.length+1}" class="matrix-cat-row">${cat}</td></tr>
                    ${catGroups[cat].map(cap => `<tr>
                        <td>
                            <b>${cap.name}</b>
                            <br><span style="font-size:11px; color:#999">${cap.scope}</span>
                            ${cap.type === 'INT' ? '<span style="font-size:11px; color:#7e22ce; margin-left:4px;">(数值)</span>' : ''}
                        </td>
                        ${plans.map(p => {
                            const val = p.ents[cap.id];
                            let cellContent = '';
                            if (cap.type === 'INT') {
                                cellContent = val ? `<div class="qty-badge">${val}</div>` : `<div class="qty-badge empty">-</div>`;
                            } else {
                                cellContent = `<div class="check-box ${val ? 'checked' : ''}"></div>`;
                            }
                            return `<td class="matrix-cell" onclick="toggleEnt('${p.id}','${cap.id}', '${cap.type}')">${cellContent}</td>`;
                        }).join('')}
                    </tr>`).join('')}
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <h3 style="margin-top:24px;">Add-ons</h3>
    <div class="addon-grid">${addons.map(a => {
        const deps = rules.filter(r => r.level==='COMMERCIAL' && r.type==='DEPEND' && r.src===a.id);
        return `<div class="addon-card">
            <div>
                <div style="font-weight:600; font-size:15px;">${a.name}</div>
                <div class="addon-card-actions"><button class="btn btn-icon" onclick="openModal('sku','${a.id}')">✏️</button><button class="btn btn-icon danger" onclick="deleteItem('sku','${a.id}')">🗑️</button></div>
                <div style="font-size:13px; color:#64748b; margin-top:4px;">${a.desc || '暂无描述'}</div>
                <div class="addon-price">${getPriceDisplay(a)}</div>
                <div style="font-size:12px; color:#94a3b8; margin-top:8px;">包含 ${Object.keys(a.ents).length} 项能力</div>
                ${deps.map(d => `<div class="rel-badge depend" style="margin-top:8px;">🔗 依赖: ${resolveName(d.tgt, 'COMMERCIAL')}</div>`).join('')}
            </div>
            <div style="margin-top:auto; display:flex; justify-content:space-between; border-top:1px solid #f1f5f9; padding-top:10px;">
                <button class="btn btn-icon" onclick="openDrawer('${a.id}')">⚙️ 配置</button>
                <span class="tag tag-green">ADDON</span>
            </div>
        </div>`;
    }).join('')}</div>`;
}

function renderEnts(c, h, ha) {
    h.innerText = '客户权益 (Entitlements)';
    
    // --- New Capability Usage Stats ---
    // Moved to independent 'Usage' tab as per user request
    
    // Header Actions: Search + Add
    ha.style.display = 'flex';
    ha.style.gap = '10px';
    ha.innerHTML = `
        <div style="position:relative;">
            <input placeholder="🔍 搜索客户..." value="${tenantSearch}" oninput="searchTenants(this.value)" class="form-input" style="width:240px; padding-left:12px;">
        </div>
        <button class="btn btn-primary" onclick="openModal('new-t')">+ 签约新客户</button>
    `;

    // 1. Filter
    const filtered = tenants.filter(t => 
        t.name.toLowerCase().includes(tenantSearch.toLowerCase()) || 
        t.id.toLowerCase().includes(tenantSearch.toLowerCase())
    );
    
    // 2. Pagination
    const total = filtered.length;
    const maxPage = Math.ceil(total / TENANT_PAGE_SIZE) || 1;
    if(tenantPage > maxPage) tenantPage = maxPage;
    if(tenantPage < 1) tenantPage = 1;
    
    const start = (tenantPage - 1) * TENANT_PAGE_SIZE;
    const pageData = filtered.slice(start, start + TENANT_PAGE_SIZE);

    // 3. Render Table
    let html = `
    <div class="card" style="padding:0; overflow:hidden; border:1px solid #e2e8f0; border-radius:8px;">
        <table style="width:100%; text-align:left;">
            <thead>
                <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:12px; text-transform:uppercase;">
                    <th style="padding:12px 24px; width:120px;">ID</th>
                    <th style="padding:12px 24px;">客户名称</th>
                    <th style="padding:12px 24px;">订阅概览 (Subscriptions)</th>
                    <th style="padding:12px 24px; width:100px;">总席位</th>
                    <th style="padding:12px 24px; width:140px; text-align:right;">操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if(pageData.length === 0) {
        html += `<tr><td colspan="5" style="text-align:center; padding:40px; color:#94a3b8;">
            <div>📭 未找到匹配客户</div>
        </td></tr>`;
    } else {
        html += pageData.map(t => {
            // Summary logic
            const activeSubs = t.subs.filter(s => s.status === 'Active');
            const totalSeats = activeSubs.reduce((acc, s) => acc + (parseInt(s.seats)||0), 0);
            
            // Group subs by Product for cleaner display
            const grouped = {};
            t.subs.forEach(s => {
                const sku = skus.find(k => k.id === s.skuId);
                const pid = sku ? sku.pid : 'unknown';
                if(!grouped[pid]) grouped[pid] = [];
                grouped[pid].push({ ...s, sku });
            });

            const subListHtml = Object.keys(grouped).map(pid => {
                const prod = products.find(p => p.id === pid);
                const items = grouped[pid];
                
                return `
                <div style="margin-bottom:8px; border:1px solid #f1f5f9; border-radius:6px; padding:8px 12px; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,0.02);">
                    <div style="font-size:12px; font-weight:600; color:#475569; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
                        <span style="background:#f1f5f9; width:20px; height:20px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-size:12px;">${prod ? prod.icon : '?'}</span>
                        ${prod ? prod.name : 'Unknown Product'}
                    </div>
                    ${items.map(item => {
                        const isOff = item.status !== 'Active';
                        const color = isOff ? '#94a3b8' : '#10b981';
                        const skuName = item.sku ? item.sku.name : item.skuId;
                        const isAddon = item.sku && item.sku.type === 'ADDON';
                        
                        return `
                        <div onclick="openSubModal('${t.id}', '${item.skuId}')" 
                             style="display:flex; align-items:center; justify-content:space-between; font-size:12px; padding:6px 0; border-top:1px dashed #f1f5f9; cursor:pointer; transition:0.1s;"
                             onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                            
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="width:6px; height:6px; border-radius:50%; background:${color}; box-shadow:0 0 0 2px ${isOff?'#f1f5f9':'#ecfdf5'};"></span>
                                <span style="font-weight:500; color:${isOff?'#94a3b8':'#334155'}">${skuName}</span>
                                ${isAddon ? '<span style="font-size:10px; background:#fffbeb; color:#b45309; border:1px solid #fcd34d; padding:0 4px; border-radius:4px; font-weight:600;">ADDON</span>' : ''}
                            </div>
                            
                            <div style="display:flex; align-items:center; gap:12px; color:#64748b; font-family:monospace; font-size:11px;">
                                <span>${item.seats} Seats</span>
                                <span style="background:${isOff?'#f1f5f9':'#ecfdf5'}; color:${isOff?'#64748b':'#059669'}; padding:1px 6px; border-radius:4px;">${item.status}</span>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
                `;
            }).join('');

            return `
            <tr style="border-bottom:1px solid #f1f5f9; vertical-align:top; transition:0.1s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                <td style="padding:16px 24px; font-family:monospace; color:#64748b;">${t.id}</td>
                <td style="padding:16px 24px; font-weight:600; color:#1e293b;">${t.name}</td>
                <td style="padding:12px 24px;">${subListHtml || '<span style="color:#cbd5e1; font-size:12px;">无订阅</span>'}</td>
                <td style="padding:16px 24px; font-weight:600;">${totalSeats}</td>
                <td style="padding:16px 24px; text-align:right;">
                    <button class="btn btn-icon" onclick="openModal('new-t', '${t.id}')" title="编辑名称">✏️</button>
                    <button class="btn btn-icon" onclick="openAddSubModal('${t.id}')" title="增购产品">➕</button>
                </td>
            </tr>
            `;
        }).join('');
    }

    html += `
            </tbody>
        </table>
        
        <!-- Pagination Footer -->
        <div style="padding:12px 24px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:12px; color:#64748b;">
                显示 ${total>0 ? start+1 : 0} - ${Math.min(start+TENANT_PAGE_SIZE, total)} / 共 ${total} 条
            </div>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-outline" style="padding:4px 12px; font-size:12px;" ${tenantPage===1?'disabled':''} onclick="changeTenantPage(-1)">Previous</button>
                <div style="font-size:12px; display:flex; align-items:center; color:#64748b;">Page ${tenantPage}</div>
                <button class="btn btn-outline" style="padding:4px 12px; font-size:12px;" ${tenantPage===maxPage?'disabled':''} onclick="changeTenantPage(1)">Next</button>
            </div>
        </div>
    </div>
    `;

    c.innerHTML = html;
}

function searchTenants(val) {
    tenantSearch = val;
    tenantPage = 1;
    render();
}

function changeTenantPage(delta) {
    tenantPage += delta;
    render();
}


// ================== 4. LOGIC & MUTEX ==================

function checkMutex(sku, capId) {
    const capToAdd = capabilities.find(c=>c.id===capId);
    for(const exist of Object.keys(sku.ents)) {
        // Direct capability conflict
        const conflict = rules.find(r => r.type==='MUTEX' && r.level==='TECHNICAL' && 
            ((r.src===capId && r.tgt===exist) || (r.src===exist && r.tgt===capId))
        );
        // Feature level conflict
        if (!conflict && capToAdd.fid) {
            const existCap = capabilities.find(c=>c.id===exist);
            if (existCap.fid) {
                const featConflict = rules.find(r => r.type==='MUTEX' && r.level==='TECHNICAL' && 
                    ((r.src===capToAdd.fid && r.tgt===existCap.fid) || (r.src===existCap.fid && r.tgt===capToAdd.fid))
                );
                if (featConflict) return { conflict: true, msg: `底层互斥: ${featConflict.desc}` };
            }
        }
        if(conflict) return { conflict: true, msg: conflict.desc };
    }
    return null;
}

function toggleEnt(sid, cid, type) {
    const s = skus.find(x=>x.id===sid);
    const currentVal = s.ents[cid];
    
    if (!currentVal) {
        // Trying to add
        const check = checkMutex(s, cid);
        if(check && check.conflict) return alert(`互斥拦截: ${check.msg}`);
        
        if (type === 'INT') {
            const val = prompt("请输入配额数量 (数字):", "100");
            if(val && !isNaN(val)) s.ents[cid] = parseInt(val);
        } else {
            s.ents[cid] = true;
        }
    } else {
        // Trying to remove or edit
            if (type === 'INT') {
                const val = prompt("修改配额数量 (输入0删除):", currentVal);
                if(val === '0' || val === null) delete s.ents[cid];
                else if (!isNaN(val)) s.ents[cid] = parseInt(val);
            } else {
                delete s.ents[cid];
            }
    }
    saveData(); render();
}

// ================== 5. MODAL LOGIC (FULL EDIT SUPPORT) ==================

// V33: Dynamic Pricing Logic
function addPricingRow(mode='', price='') {
    const container = document.getElementById('sku-pricing-container');
    const div = document.createElement('div');
    div.className = 'pricing-row';
    div.innerHTML = `
        <select class="form-select" style="flex:1">
            <option value="PER_USER_MO" ${mode==='PER_USER_MO'?'selected':''}>每人/月</option>
            <option value="PER_USER_YR" ${mode==='PER_USER_YR'?'selected':''}>每人/年</option>
            <option value="FLAT_MO" ${mode==='FLAT_MO'?'selected':''}>固定/月</option>
            <option value="FLAT_YR" ${mode==='FLAT_YR'?'selected':''}>固定/年</option>
            <option value="ONE_TIME" ${mode==='ONE_TIME'?'selected':''}>一次性</option>
            <option value="CUSTOM" ${mode==='CUSTOM'?'selected':''}>询价</option>
        </select>
        <input type="number" class="form-input" style="flex:1" placeholder="价格" value="${price}">
        <button class="btn btn-icon danger" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(div);
}

function openModal(type, id = null) {
    document.querySelectorAll('.mask').forEach(e=>e.style.display='none');
    document.getElementById('modal-'+type).style.display='flex';
    editingId = id;
    const isEdit = !!id;
    
    if(type === 'cap') {
        const item = id ? capabilities.find(x=>x.id===id) : {name:'', scope:'WORKSPACE', fid:'', categoryMap:{}, type: 'BOOL'};
        document.getElementById('cap-modal-title').innerText = isEdit ? '编辑 Capability' : '定义 Capability';
        document.getElementById('cap-name').value = item.name;
        document.getElementById('cap-scope').value = item.scope;
        document.getElementById('cap-feat').innerHTML = '<option value="">(None)</option>' + features.map(f=>`<option value="${f.id}" ${f.id===item.fid?'selected':''}>${f.name}</option>`).join('');
        
        // V30: Type Select
        const typeSel = document.getElementById('cap-type');
        if (typeSel) typeSel.value = item.type || 'BOOL';

        // V33: Generate checkboxes for products with Category Inputs
        const prodContainer = document.getElementById('cap-prods-container');
        prodContainer.innerHTML = products.map(p => {
            const catMap = item.categoryMap || {};
            const isChecked = catMap.hasOwnProperty(p.id);
            const catVal = catMap[p.id] || '基础功能';
            return `
            <div class="multi-check-item">
                <input type="checkbox" value="${p.id}" ${isChecked?'checked':''} style="margin-right:8px;">
                <span style="flex:1">${p.name}</span>
                <input type="text" class="form-input" style="width:120px; padding:4px; font-size:12px;" placeholder="分类" value="${catVal}">
            </div>`;
        }).join('');
    }
    if(type === 'feature') {
        document.getElementById('feat-modal-title').innerText = isEdit ? '编辑 Feature' : '注册 Feature';
        const item = isEdit ? features.find(x=>x.id===id) : {id:'', name:'', owner:'', reqId:''};
        document.getElementById('feat-id').value = item.id;
        document.getElementById('feat-id').disabled = isEdit;
        document.getElementById('feat-name').value = item.name;
        document.getElementById('feat-owner').value = item.owner;
        document.getElementById('feat-req-id').value = item.reqId || '';
    }
    if(type === 'rule') {
        document.getElementById('rule-modal-title').innerText = isEdit ? '编辑规则' : '新建规则';
        const item = isEdit ? rules.find(x=>x.id===id) : {level:ruleTab, type:'DEPEND', desc:'', src:'', tgt:''};
        document.getElementById('rule-level').value = item.level;
        updateRuleModalUI(); 
        document.getElementById('rule-type').value = item.type;
        document.getElementById('rule-desc').value = item.desc;
        
        // For Edit mode, pre-select values. If it's an array, we need to handle it.
        const srcSel = document.getElementById('rule-src');
        const tgtSel = document.getElementById('rule-tgt');
        
        // Simple set for now - complex multiselect handling requires more logic not fully implemented in bare Select
        srcSel.value = item.src;
        
        // Handle multi-select Target for DEPEND rules (array support)
        // Reset selection
        for(let i=0; i<tgtSel.options.length; i++) tgtSel.options[i].selected = false;
        
        if (Array.isArray(item.tgt)) {
            item.tgt.forEach(val => {
                    for(let i=0; i<tgtSel.options.length; i++) {
                        if (tgtSel.options[i].value === val) tgtSel.options[i].selected = true;
                    }
            });
        } else {
            tgtSel.value = item.tgt;
        }
    }
    if(type === 'prod') {
        document.getElementById('prod-modal-title').innerText = isEdit ? '编辑产品线' : '新建产品线';
        const item = isEdit ? products.find(x=>x.id===id) : {name:'', code:'', icon:'📦'};
        document.getElementById('prod-name').value = item.name;
        document.getElementById('prod-code').value = item.code;
        document.getElementById('prod-icon').value = item.icon;
    }
    if(type === 'sku') {
        document.getElementById('sku-modal-title').innerText = isEdit ? '编辑 SKU' : '新建 SKU';
        const item = isEdit ? skus.find(x=>x.id===id) : {name:'', type:'PLAN', desc:'', pricing:[], level:1};
        document.getElementById('sku-name').value = item.name;
        document.getElementById('sku-desc').value = item.desc || '';
        document.getElementById('sku-level').value = item.level || 1;
        document.getElementById('sku-type').value = item.type;
        document.getElementById('sku-type').disabled = isEdit;
        toggleSkuLevel();
        
        // V33: Populate Pricing Rows
        const pContainer = document.getElementById('sku-pricing-container');
        pContainer.innerHTML = '';
        if(item.pricing && item.pricing.length > 0) {
            item.pricing.forEach(p => addPricingRow(p.mode, p.price));
        } else {
            addPricingRow(); // Add one empty row
        }
    }
    if(type === 'new-t') {
        document.getElementById('tenant-modal-title').innerText = isEdit ? '编辑客户名称' : '签约新客户';
        const item = isEdit ? tenants.find(x=>x.id===id) : {name:''};
        document.getElementById('new-t-name').value = item.name;
        document.getElementById('new-t-initial-setup').style.display = isEdit ? 'none' : 'block';
        if(!isEdit) {
            document.getElementById('new-t-prod').innerHTML = products.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
            updateSkuOptions();
        }
    }
    if(type === 'settings') {
        document.getElementById('settings-api-key').value = getApiKey();
    }
    if(type === 'add-sub-to-tenant') {
        const t = tenants.find(x => x.id === id);
        document.getElementById('add-sub-tenant-name').value = t.name;
        const pSel = document.getElementById('add-sub-prod');
        pSel.innerHTML = products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        updateAddSubSkuOptions();
    }
}

function toggleSkuLevel() {
    const type = document.getElementById('sku-type').value;
    const levelGroup = document.getElementById('sku-level-group');
    if(type === 'PLAN') levelGroup.style.display = 'block';
    else levelGroup.style.display = 'none';
}

function closeModals() { document.querySelectorAll('.mask').forEach(e=>e.style.display='none'); }

function updateRuleModalUI() {
    const level = document.getElementById('rule-level').value;
    const srcSel = document.getElementById('rule-src');
    const tgtSel = document.getElementById('rule-tgt');
    let options = '';
    if(level === 'COMMERCIAL') {
        options += `<optgroup label="Products">` + products.map(p => `<option value="${p.id}">${p.name}</option>`).join('') + `</optgroup>`;
        options += `<optgroup label="SKUs">` + skus.map(s => `<option value="${s.id}">${s.name}</option>`).join('') + `</optgroup>`;
    } else {
        options += `<optgroup label="Capabilities">` + capabilities.map(c => `<option value="${c.id}">${c.name}</option>`).join('') + `</optgroup>`;
        options += `<optgroup label="Features">` + features.map(f => `<option value="${f.id}">${f.name}</option>`).join('') + `</optgroup>`;
    }
    srcSel.innerHTML = options; tgtSel.innerHTML = options;
}

// CRUD Ops
function saveFeature() {
    const id = document.getElementById('feat-id').value;
    const name = document.getElementById('feat-name').value;
    const owner = document.getElementById('feat-owner').value;
    const reqId = document.getElementById('feat-req-id').value;
    if(name) {
        if(editingId) {
            const item = features.find(x=>x.id===editingId); item.name = name; item.owner = owner; item.reqId = reqId;
        } else {
            if(!id) return alert('ID required');
            features.push({id,name,owner,reqId});
        }
        saveData(); closeModals(); render(); 
    }
}
function saveCap() {
    const name = document.getElementById('cap-name').value;
    const scope = document.getElementById('cap-scope').value;
    const fid = document.getElementById('cap-feat').value;
    const type = document.getElementById('cap-type').value;
    
    // V33: Collect Category Map
    const categoryMap = {};
    const checkboxes = document.querySelectorAll('#cap-prods-container input[type="checkbox"]');
    checkboxes.forEach(cb => {
        if (cb.checked) {
            // Find sibling input for category
            const catInput = cb.parentElement.querySelector('input[type="text"]');
            categoryMap[cb.value] = catInput.value || '基础功能';
        }
    });
    
    if(name) {
        if(editingId) {
            const c = capabilities.find(x=>x.id===editingId); c.name=name; c.scope=scope; c.fid=fid; c.categoryMap=categoryMap; c.type=type;
        } else {
            capabilities.push({id:'c'+Date.now(), name, scope, fid, categoryMap, type});
        }
        saveData(); closeModals(); render();
    }
}
function saveRule() {
    const level = document.getElementById('rule-level').value;
    const type = document.getElementById('rule-type').value;
    const desc = document.getElementById('rule-desc').value;
    const src = document.getElementById('rule-src').value;
    
    // Capture multiple targets
    const tgtOpts = document.getElementById('rule-tgt').options;
    const tgt = [];
    for (let i = 0; i < tgtOpts.length; i++) {
        if(tgtOpts[i].selected) tgt.push(tgtOpts[i].value);
    }
    
    const finalTgt = tgt.length === 1 ? tgt[0] : tgt;

    if(desc) {
        if(editingId) {
            const r = rules.find(x=>x.id===editingId); r.level=level; r.type=type; r.desc=desc; r.src=src; r.tgt=finalTgt;
        } else {
            rules.push({id:'r'+Date.now(),level,type,desc,src,tgt: finalTgt}); 
        }
        saveData(); closeModals(); ruleTab = level; render();
    }
}
function saveProduct() {
    const name = document.getElementById('prod-name').value;
    const code = document.getElementById('prod-code').value;
    const icon = document.getElementById('prod-icon').value;
    if(name) {
        if(editingId) {
            const p = products.find(x=>x.id===editingId); p.name=name; p.code=code; p.icon=icon;
        } else {
            products.push({id:'p'+Date.now(),name,code,icon});
        }
        saveData(); closeModals(); render();
    }
}
function saveSku() {
    const name = document.getElementById('sku-name').value;
    const type = document.getElementById('sku-type').value;
    const desc = document.getElementById('sku-desc').value;
    const level = parseInt(document.getElementById('sku-level').value) || 1;

    // V33: Collect pricing
    const pricing = [];
    const pRows = document.querySelectorAll('#sku-pricing-container .pricing-row');
    pRows.forEach(row => {
        const mode = row.querySelector('select').value;
        const price = parseInt(row.querySelector('input').value) || 0;
        pricing.push({ mode, price });
    });

    if(name) {
        if(editingId) {
            const s = skus.find(x=>x.id===editingId); 
            s.name=name; s.desc=desc; s.pricing=pricing; s.level=level;
        } else {
            skus.push({id:'s'+Date.now(), pid:activeProdId, type, name, desc, pricing, level, ents:{}});
        }
        saveData(); closeModals(); render();
    }
}
function saveNewTenant() {
    const name = document.getElementById('new-t-name').value;
    if(name) {
        if(editingId) {
            tenants.find(x=>x.id===editingId).name = name;
        } else {
            const skuId = document.getElementById('new-t-sku').value;
            if(!skuId) return;
            tenants.push({id:'t'+Date.now(), name, subs:[{skuId, seats:100, status:'Active', end:'2025-12-31'}]});
        }
        saveData(); closeModals(); render();
    }
}
function updateSkuOptions() {
    const pid = document.getElementById('new-t-prod').value;
    const sSel = document.getElementById('new-t-sku');
    const availSkus = skus.filter(s => s.pid === pid && s.type === 'PLAN');
    sSel.innerHTML = availSkus.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}
function deleteItem(type, id) {
    if(!confirm('确定删除?')) return;
    if(type==='feature') features=features.filter(x=>x.id!==id);
    if(type==='cap') capabilities=capabilities.filter(x=>x.id!==id);
    if(type==='rule') rules=rules.filter(x=>x.id!==id);
    if(type==='prod') { products=products.filter(x=>x.id!==id); skus=skus.filter(x=>x.pid!==id); }
    if(type==='sku') skus=skus.filter(x=>x.id!==id);
    saveData(); render();
}
function openSubModal(tid, skuId) {
    const t = tenants.find(x=>x.id===tid);
    const sub = t.subs.find(x=>x.skuId===skuId);
    editSubRef = { t, sub };
    document.getElementById('sub-seats').value = sub.seats;
    document.getElementById('sub-status').value = sub.status;
    openModal('sub');
}
function saveSub() {
    if(editSubRef) {
        editSubRef.sub.seats = document.getElementById('sub-seats').value;
        editSubRef.sub.status = document.getElementById('sub-status').value;
        saveData(); closeModals(); render();
    }
}

// Addon Drawer
function openDrawer(sid) {
    drawerAddonId = sid;
    const addon = skus.find(s=>s.id===sid);
    const prodCaps = capabilities.filter(c => (c.categoryMap && c.categoryMap[addon.pid]));
    const list = document.getElementById('drawer-list');
    document.getElementById('drawer-title').innerText = `配置 ${addon.name}`;
    
    list.innerHTML = prodCaps.map(c => {
        const has = addon.ents[c.id];
        let control = '';
        if (c.type === 'INT') {
            control = `<div style="display:flex;align-items:center;gap:4px;"><input type="number" style="width:60px;padding:4px;border:1px solid #ccc;border-radius:4px;" value="${has || ''}" onchange="toggleAddonEnt('${c.id}', this.value, 'INT')" placeholder="-"></div>`;
        } else {
            control = `<div onclick="toggleAddonEnt('${c.id}', null, 'BOOL')" style="cursor:pointer"><div class="check-box ${has?'checked':''}"></div></div>`;
        }

        return `<div style="padding:12px 20px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
            <div><div style="font-weight:500">${c.name}</div><div style="font-size:11px; color:#999">${c.scope} ${c.type==='INT'?'(数量)':''}</div></div>
            ${control}
        </div>`
    }).join('');
    
    document.getElementById('drawer-overlay').style.display='block';
    document.getElementById('drawer').classList.add('open');
}
function toggleAddonEnt(cid, val, type) {
    const s = skus.find(x=>x.id===drawerAddonId);
    if (type === 'INT') {
        if (val && val > 0) s.ents[cid] = parseInt(val);
        else delete s.ents[cid];
    } else {
            if(!s.ents[cid]) {
            const check = checkMutex(s, cid);
            if(check && check.conflict) return alert(check.msg);
            s.ents[cid] = true;
        } else delete s.ents[cid];
    }
    saveData(); 
    // Don't redraw drawer entirely to keep focus for inputs, maybe just update state
}
function closeDrawer() {
    document.getElementById('drawer').classList.remove('open');
    setTimeout(()=>document.getElementById('drawer-overlay').style.display='none',300);
    render();
}

// --- NEW: Add Subscription to Existing Tenant ---
function openAddSubModal(tid) {
    openModal('add-sub-to-tenant', tid);
}

function updateAddSubSkuOptions() {
    const pid = document.getElementById('add-sub-prod').value;
    const sSel = document.getElementById('add-sub-sku');
    const availSkus = skus.filter(s => s.pid === pid); // V36: Allow adding Plans AND Addons
    sSel.innerHTML = availSkus.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function saveAddSubToTenant() {
    const tid = editingId;
    const skuId = document.getElementById('add-sub-sku').value;
    const seats = document.getElementById('add-sub-seats').value;
    
    if (tid && skuId) {
        const t = tenants.find(x => x.id === tid);
        t.subs.push({
            skuId: skuId,
            seats: seats || 10,
            status: 'Active',
            end: '2025-12-31' // Default one year from now logic could go here
        });
        saveData();
        closeModals();
        render();
    }
}

// Init
route('guide');
